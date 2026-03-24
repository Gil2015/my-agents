#!/usr/bin/env bash

set -euo pipefail

COMMAND=""
CONFIG_PATH=""
RESUME=false

repo_path=""
source_branch=""
start_commit=""
include_start_commit=false
author=""
output_markdown=""
default_branch_name=""
story_pattern=""
bug_pattern=""
story_commit_type=""
story_title_template=""
fallback_story_content=""
commit_body_bullet_prefix=""
skip_existing_on_target=false
target_branch=""

branch_overrides=()
allowed_dirty_paths=()
exclude_paths_from_commit=()

commit_hashes=()
commit_branches=()
commit_authors=()
commit_times=()
commit_titles=()

group_kinds=()
group_story_ids=()
group_titles=()
group_commit_indices=()


die() {
  printf '%s\n' "$*" >&2
  exit 1
}


script_dir() {
  cd "$(dirname "${BASH_SOURCE[0]}")" && pwd
}


skill_dir() {
  cd "$(script_dir)/.." && pwd
}


default_config_path() {
  printf '%s/references/config.json' "$(skill_dir)"
}


run_git() {
  git -C "$repo_path" "$@"
}


today_tag() {
  date +"%Y%m%d"
}


replace_date_tokens() {
  local value="$1"
  local tag
  tag="$(today_tag)"
  value="${value//\[YYYYMMDD\]/$tag}"
  value="${value//\{YYYYMMDD\}/$tag}"
  printf '%s' "$value"
}


resolve_path_for_git() {
  local raw="$1"
  local resolved
  resolved="$(replace_date_tokens "$raw")"
  if [[ "$resolved" == "$repo_path/"* ]]; then
    printf '%s' "${resolved#"$repo_path"/}"
    return
  fi
  printf '%s' "$resolved"
}


array_contains() {
  local needle="$1"
  shift
  local item
  for item in "$@"; do
    [[ "$item" == "$needle" ]] && return 0
  done
  return 1
}


current_branch() {
  run_git branch --show-current
}


state_file() {
  run_git rev-parse --git-path codex-cherry-pick-squash-state.sh
}


load_config() {
  if [[ -z "$CONFIG_PATH" ]]; then
    CONFIG_PATH="$(default_config_path)"
  fi
  [[ -f "$CONFIG_PATH" ]] || die "配置文件不存在: $CONFIG_PATH"
  command -v python3 >/dev/null 2>&1 || die "缺少 python3，无法读取 JSON 配置"

  local evaluated
  evaluated="$(
    python3 - "$CONFIG_PATH" <<'PY'
import json
import shlex
import sys
from pathlib import Path

path = Path(sys.argv[1]).expanduser().resolve()
config = json.loads(path.read_text(encoding="utf-8"))

def quote(value):
    return shlex.quote("" if value is None else str(value))

def emit(name, value):
    print(f"{name}={quote(value)}")

def emit_bool(name, value):
    print(f"{name}={'true' if bool(value) else 'false'}")

def emit_array(name, values):
    items = values or []
    rendered = " ".join(quote(item) for item in items)
    print(f"{name}=({rendered})")

emit("repo_path", config.get("repo_path", ""))
emit("source_branch", config.get("source_branch", ""))
emit("start_commit", config.get("start_commit", ""))
emit_bool("include_start_commit", config.get("include_start_commit", False))
emit("author", config.get("author", ""))
emit("output_markdown", config.get("output_markdown", ""))
emit("default_branch_name", config.get("default_branch_name", ""))
emit("story_pattern", config.get("story_pattern", ""))
emit("bug_pattern", config.get("bug_pattern", ""))
emit("story_commit_type", config.get("story_commit_type", ""))
emit("story_title_template", config.get("story_title_template", ""))
emit("fallback_story_content", config.get("fallback_story_content", ""))
emit("commit_body_bullet_prefix", config.get("commit_body_bullet_prefix", ""))
emit_bool("skip_existing_on_target", config.get("skip_existing_on_target", False))
emit("target_branch", config.get("target_branch", ""))

branch_overrides = config.get("branch_overrides") or {}
emit_array("branch_overrides", [f"{key}={value}" for key, value in branch_overrides.items()])
emit_array("allowed_dirty_paths", config.get("allowed_dirty_paths") or [])
emit_array("exclude_paths_from_commit", config.get("exclude_paths_from_commit") or [])
PY
  )"

  eval "$evaluated"

  if [[ -z "${repo_path:-}" ]]; then
    repo_path="$(pwd)"
  fi
  repo_path="$(cd "$repo_path" && pwd)"

  [[ -n "${source_branch:-}" ]] || die "缺少配置项: source_branch"
  [[ -n "${start_commit:-}" ]] || die "缺少配置项: start_commit"
  [[ -n "${author:-}" ]] || die "缺少配置项: author"

  output_markdown="${output_markdown:-commits-[YYYYMMDD].md}"
  default_branch_name="${default_branch_name:-$source_branch}"
  story_pattern="${story_pattern:-story[[:space:]]*#?[[:space:]]*[0-9]+}"
  bug_pattern="${bug_pattern:-bug|缺陷}"
  story_commit_type="${story_commit_type:-feat}"
  fallback_story_content="${fallback_story_content:-往期需求缺陷修复}"
  commit_body_bullet_prefix="${commit_body_bullet_prefix:-- }"
  if [[ -z "${story_title_template:-}" ]]; then
    story_title_template='{type}: [STORY#{story_id}]{story_content}'
  fi

  if [[ -z "${allowed_dirty_paths[*]-}" ]]; then
    allowed_dirty_paths=("$output_markdown")
  fi
  if [[ -z "${exclude_paths_from_commit[*]-}" ]]; then
    exclude_paths_from_commit=("$output_markdown")
  fi
}


extract_primary_story_id() {
  local title="$1"
  local matched
  matched="$(printf '%s\n' "$title" | grep -Eio "$story_pattern" | head -n1 || true)"
  [[ -n "$matched" ]] || return 1
  printf '%s\n' "$matched" | grep -Eo '[0-9]+' | head -n1
}


lookup_branch_override() {
  local commit_hash="$1"
  local item key value
  for item in "${branch_overrides[@]-}"; do
    key="${item%%=*}"
    value="${item#*=}"
    if [[ "$key" == "$commit_hash" ]]; then
      printf '%s' "$value"
      return
    fi
  done
  printf '%s' "$default_branch_name"
}


collect_commits() {
  commit_hashes=()
  commit_branches=()
  commit_authors=()
  commit_times=()
  commit_titles=()

  local range_spec
  if [[ "${include_start_commit}" == "true" ]]; then
    range_spec="${start_commit}^..${source_branch}"
  else
    range_spec="${start_commit}..${source_branch}"
  fi

  local branch_to_check
  branch_to_check="${target_branch:-$(current_branch)}"

  while IFS=$'\t' read -r commit_hash commit_author commit_time commit_title || [[ -n "${commit_hash:-}" ]]; do
    [[ -n "$commit_hash" ]] || continue
    if [[ "${skip_existing_on_target}" == "true" ]]; then
      if run_git merge-base --is-ancestor "$commit_hash" "$branch_to_check" >/dev/null 2>&1; then
        continue
      fi
    fi
    commit_hashes+=("$commit_hash")
    commit_branches+=("$(lookup_branch_override "$commit_hash")")
    commit_authors+=("$commit_author")
    commit_times+=("$commit_time")
    commit_titles+=("$commit_title")
  done < <(
    run_git log \
      --reverse \
      "$range_spec" \
      --author="$author" \
      --pretty=format:'%H%x09%an%x09%ad%x09%s' \
      --date=format:'%Y-%m-%d %H:%M:%S'
  )
}


build_groups() {
  group_kinds=()
  group_story_ids=()
  group_titles=()
  group_commit_indices=()

  local idx story_id existing_group group_count group_idx
  for ((idx = 0; idx < ${#commit_hashes[@]}; idx++)); do
    story_id="$(extract_primary_story_id "${commit_titles[$idx]}" || true)"
    if [[ -z "$story_id" ]]; then
      group_kinds+=("independent")
      group_story_ids+=("")
      group_titles+=("${commit_titles[$idx]}")
      group_commit_indices+=("$idx")
      continue
    fi

    existing_group=""
    group_count="${#group_kinds[@]}"
    for ((group_idx = 0; group_idx < group_count; group_idx++)); do
      if [[ "${group_kinds[$group_idx]}" == "story" && "${group_story_ids[$group_idx]}" == "$story_id" ]]; then
        existing_group="$group_idx"
        break
      fi
    done

    if [[ -n "$existing_group" ]]; then
      group_commit_indices[$existing_group]="${group_commit_indices[$existing_group]} $idx"
      continue
    fi

    group_kinds+=("story")
    group_story_ids+=("$story_id")
    group_titles+=("")
    group_commit_indices+=("$idx")
  done
}


strip_title_for_story_content() {
  local content="$1"
  local updated=""

  content="$(printf '%s\n' "$content" | sed -E 's/^[A-Za-z]+:[[:space:]]*//')"
  while true; do
    updated="$(printf '%s\n' "$content" | sed -E 's/^(\[[^]]*\]|【[^】]*】|\([^)]+\))[[:space:]]*//')"
    if [[ "$updated" == "$content" ]]; then
      break
    fi
    content="$updated"
  done
  printf '%s\n' "$content" | sed -E 's/^[[:space:]:：._\/-]+//; s/[[:space:]]+$//'
}


is_bug_title() {
  local title="$1"
  printf '%s\n' "$title" | grep -Eiq "$bug_pattern"
}


resolve_story_content() {
  local group_idx="$1"
  local commit_index title content
  for commit_index in ${group_commit_indices[$group_idx]}; do
    title="${commit_titles[$commit_index]}"
    if ! extract_primary_story_id "$title" >/dev/null 2>&1; then
      continue
    fi
    if is_bug_title "$title"; then
      continue
    fi
    content="$(strip_title_for_story_content "$title")"
    if [[ -n "$content" ]]; then
      printf '%s' "$content"
      return
    fi
  done
  printf '%s' "$fallback_story_content"
}


build_story_commit_title() {
  local group_idx="$1"
  local story_id story_content title
  story_id="${group_story_ids[$group_idx]}"
  story_content="$(resolve_story_content "$group_idx")"
  title="$story_title_template"
  title="${title//\{type\}/$story_commit_type}"
  title="${title//\{story_id\}/$story_id}"
  title="${title//\{story_content\}/$story_content}"
  printf '%s' "$title"
}


build_group_preview() {
  local group_idx="$1"
  if [[ "${group_kinds[$group_idx]}" == "story" ]]; then
    printf 'STORY#%s -> %s (%s 条)' \
      "${group_story_ids[$group_idx]}" \
      "$(build_story_commit_title "$group_idx")" \
      "$(wc -w <<<"${group_commit_indices[$group_idx]}" | tr -d ' ')"
    return
  fi
  printf '独立提交 -> %s' "${group_titles[$group_idx]}"
}


output_markdown_path() {
  local output
  output="$(replace_date_tokens "$output_markdown")"
  if [[ "$output" == /* ]]; then
    printf '%s' "$output"
  else
    printf '%s/%s' "$repo_path" "$output"
  fi
}


write_markdown() {
  local output
  output="$(output_markdown_path)"
  {
    printf '# Commits to Cherry-pick\n\n'
    printf '| Commit | Branch | Author | Time | Title |\n'
    printf '| --- | --- | --- | --- | --- |\n'
    local idx
    for ((idx = 0; idx < ${#commit_hashes[@]}; idx++)); do
      printf '| `%s` | `%s` | %s | %s | %s |\n' \
        "${commit_hashes[$idx]}" \
        "${commit_branches[$idx]}" \
        "${commit_authors[$idx]}" \
        "${commit_times[$idx]}" \
        "${commit_titles[$idx]}"
    done
  } >"$output"
  printf '%s' "$output"
}


ensure_clean_worktree() {
  local allowed_resolved=()
  local raw path line
  for raw in "${allowed_dirty_paths[@]-}"; do
    allowed_resolved+=("$(resolve_path_for_git "$raw")")
  done

  while IFS= read -r line; do
    [[ -n "$line" ]] || continue
    path="${line:3}"
    if [[ "$path" == *" -> "* ]]; then
      path="${path##* -> }"
    fi
    if array_contains "$path" "${allowed_resolved[@]}"; then
      continue
    fi
    die "工作区存在未允许的改动: $line"
  done < <(run_git status --porcelain=v1)
}


write_state() {
  local next_group_index="$1"
  local next_commit_index="$2"
  local file
  file="$(state_file)"
  {
    printf 'next_group_index=%s\n' "$next_group_index"
    printf 'next_commit_index=%s\n' "$next_commit_index"
  } >"$file"
}


read_state() {
  local file
  file="$(state_file)"
  [[ -f "$file" ]] || die "没有找到可恢复的执行状态。"
  # shellcheck disable=SC1090
  source "$file"
}


clear_state() {
  rm -f "$(state_file)"
}


unstage_excluded_paths() {
  local raw resolved
  for raw in "${exclude_paths_from_commit[@]-}"; do
    resolved="$(resolve_path_for_git "$raw")"
    run_git reset -q HEAD -- "$resolved" >/dev/null 2>&1 || true
  done
}


build_commit_body() {
  local group_idx="$1"
  local commit_index
  for commit_index in ${group_commit_indices[$group_idx]}; do
    printf '%s%s\n' "$commit_body_bullet_prefix" "${commit_titles[$commit_index]}"
  done
}


source_commit_message() {
  local commit_hash="$1"
  run_git log -1 --format=%B "$commit_hash"
}


commit_group() {
  local group_idx="$1"
  local message_file
  message_file="$(mktemp)"

  run_git diff --cached --check >/dev/null

  if [[ "${group_kinds[$group_idx]}" == "story" ]]; then
    {
      printf '%s\n\n' "$(build_story_commit_title "$group_idx")"
      build_commit_body "$group_idx"
    } >"$message_file"
  else
    source_commit_message "${commit_hashes[${group_commit_indices[$group_idx]}]}" >"$message_file"
  fi

  run_git commit -F "$message_file" >/dev/null
  rm -f "$message_file"
}


cmd_collect() {
  collect_commits
  build_groups
  local output story_groups independent_groups group_idx
  output="$(write_markdown)"
  story_groups=0
  independent_groups=0
  for ((group_idx = 0; group_idx < ${#group_kinds[@]}; group_idx++)); do
    if [[ "${group_kinds[$group_idx]}" == "story" ]]; then
      ((story_groups += 1))
    else
      ((independent_groups += 1))
    fi
  done
  printf '共收集 %s 条提交\n' "${#commit_hashes[@]}"
  printf '清单文件: %s\n' "$output"
  printf '识别到 %s 个 STORY 分组，%s 条独立提交\n' "$story_groups" "$independent_groups"
  for ((group_idx = 0; group_idx < ${#group_kinds[@]}; group_idx++)); do
    printf -- '- %s\n' "$(build_group_preview "$group_idx")"
  done
}


cmd_apply() {
  local start_group_index start_commit_index group_idx group_commit_index commit_index commit_hash commit_title

  if [[ "$RESUME" == "true" ]]; then
    read_state
    start_group_index="${next_group_index:-0}"
    start_commit_index="${next_commit_index:-0}"
  else
    ensure_clean_worktree
    collect_commits
    build_groups
    write_markdown >/dev/null
    write_state 0 0
    start_group_index=0
    start_commit_index=0
  fi

  collect_commits
  build_groups

  if [[ ${#group_kinds[@]} -eq 0 ]]; then
    clear_state
    printf '没有匹配到需要处理的提交。\n'
    return
  fi

  for ((group_idx = start_group_index; group_idx < ${#group_kinds[@]}; group_idx++)); do
    if [[ "$group_idx" -eq "$start_group_index" ]]; then
      group_commit_index="$start_commit_index"
    else
      group_commit_index=0
    fi

    local indices=(${group_commit_indices[$group_idx]})
    for ((commit_index = group_commit_index; commit_index < ${#indices[@]}; commit_index++)); do
      local commit_pos
      commit_pos="${indices[$commit_index]}"
      commit_hash="${commit_hashes[$commit_pos]}"
      commit_title="${commit_titles[$commit_pos]}"
      printf '应用提交 %s %s\n' "$commit_hash" "$commit_title"
      write_state "$group_idx" "$((commit_index + 1))"
      if ! run_git cherry-pick -n "$commit_hash"; then
        die $'cherry-pick 过程中出现冲突。\n这里需要开发人员人工判断并解决冲突，不建议 AI 自行决定保留哪一侧代码。\n请先手工解决冲突并执行 `git cherry-pick --continue`，然后再执行 `bash scripts/cherry_pick_flow.sh apply --resume`。'
      fi
    done

    unstage_excluded_paths
    commit_group "$group_idx"
    write_state "$((group_idx + 1))" 0
    printf '已完成分组提交: %s\n' "$(build_group_preview "$group_idx")"
  done

  clear_state
  printf '全部分组提交已完成。\n'
}


parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      collect|apply)
        COMMAND="$1"
        shift
        ;;
      --config)
        [[ $# -ge 2 ]] || die "--config 缺少参数"
        CONFIG_PATH="$2"
        shift 2
        ;;
      --resume)
        RESUME=true
        shift
        ;;
      *)
        die "不支持的参数: $1"
        ;;
    esac
  done

  [[ -n "$COMMAND" ]] || die "缺少命令: collect 或 apply"
}


main() {
  parse_args "$@"

  case "$COMMAND" in
    collect)
      load_config
      cmd_collect
      ;;
    apply)
      load_config
      cmd_apply
      ;;
    *)
      die "未知命令: $COMMAND"
      ;;
  esac
}


main "$@"
