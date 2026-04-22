#!/usr/bin/env bash
set -euo pipefail

# 作用：通用的一次性步骤脚本模板。
# 用法：在下方替换成具体任务逻辑，并保留关键注释，方便后续维护。

DRY_RUN=0
VERBOSE=0
WORK_DIR=""
LOG_PREFIX="[步骤]"
POSITIONAL=()

usage() {
  cat <<'EOF'
用法: step.sh [--workdir PATH] [--dry-run] [--verbose] [--] [额外参数...]

参数:
  --workdir PATH  执行命令前先进入该目录
  --dry-run       只打印命令，不实际执行
  --verbose       执行前打印即将运行的命令
  --help          显示帮助
EOF
}

log() {
  printf '%s %s\n' "$LOG_PREFIX" "$*"
}

die() {
  printf '%s 错误: %s\n' "$LOG_PREFIX" "$*" >&2
  exit 1
}

run_cmd() {
  if [[ "$DRY_RUN" -eq 1 ]]; then
    log "演练模式: $*"
    return 0
  fi

  if [[ "$VERBOSE" -eq 1 ]]; then
    log "执行: $*"
  fi

  "$@"
}

parse_args() {
  # 统一处理通用参数，具体业务参数可在此基础上继续扩展。
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --workdir)
        [[ $# -ge 2 ]] || die "--workdir 需要一个值"
        WORK_DIR="$2"
        shift 2
        ;;
      --dry-run)
        DRY_RUN=1
        shift
        ;;
      --verbose)
        VERBOSE=1
        shift
        ;;
      --help)
        usage
        exit 0
        ;;
      --)
        shift
        while [[ $# -gt 0 ]]; do
          POSITIONAL+=("$1")
          shift
        done
        ;;
      *)
        POSITIONAL+=("$1")
        shift
        ;;
    esac
  done
}

main() {
  parse_args "$@"

  if [[ -n "$WORK_DIR" ]]; then
    # 明确进入工作目录，避免命令依赖调用方当前路径。
    cd "$WORK_DIR"
  fi

  # 将下面的示例命令替换为具体任务逻辑。
  # 关键流程请保留注释，尤其是等待、重试、清理和危险操作。
  run_cmd pwd

  if [[ "${#POSITIONAL[@]}" -gt 0 ]]; then
    log "额外参数: ${POSITIONAL[*]}"
  fi
}

main "$@"
