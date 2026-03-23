#!/usr/bin/env sh
set -eu

raw_workspace_root="${1:-.ai}"
mission_id="${2:-}"

print_status() {
  status="$1"
  message="$2"
  shift 2 || true

  printf 'STATUS=%s\n' "${status}"
  printf 'MESSAGE=%s\n' "${message}"

  while [ "$#" -gt 0 ]; do
    printf '%s=%s\n' "$1" "$2"
    shift 2
  done
}

fail_with_status() {
  status="$1"
  message="$2"
  print_status "${status}" "${message}"
  exit 1
}

case "${raw_workspace_root}" in
  /)
    workspace_root="/"
    ;;
  /*)
    workspace_root="${raw_workspace_root%/}"
    ;;
  .)
    workspace_root="${PWD}"
    ;;
  *)
    workspace_root="${PWD}/${raw_workspace_root%/}"
    ;;
esac

if [ "$(basename "${workspace_root}")" != ".ai" ]; then
  fail_with_status "NEEDS_CONTEXT" "workspaceRoot must point to the project's .ai directory."
fi

if [ ! -d "${workspace_root}" ]; then
  fail_with_status "NEEDS_CONTEXT" "workspaceRoot does not exist. If omitted, the script uses ./.ai under the current working directory."
fi

script_dir="$(CDPATH= cd -- "$(dirname "$0")" && pwd)"
template_dir="${script_dir}/../templates"
if [ ! -d "${template_dir}" ]; then
  fail_with_status "BLOCKED" "Cannot locate step0 templates."
fi

workspace_abs="$(CDPATH= cd -- "${workspace_root}" && pwd)"
project_root="$(CDPATH= cd -- "${workspace_root}/.." && pwd)"

if [ -z "${mission_id}" ]; then
  mission_id="$(date +%Y%m%d-%H%M%S)"
fi

case "${mission_id}" in
  ""|*[!A-Za-z0-9._-]*)
    fail_with_status "NEEDS_CONTEXT" "missionId may only contain letters, numbers, dot, underscore, and hyphen."
    ;;
esac

mission_dir="${workspace_abs}/missions/${mission_id}"

if [ -e "${mission_dir}" ]; then
  fail_with_status "BLOCKED" "Mission already exists. Choose a new missionId."
fi

if ! mkdir -p "${mission_dir}"; then
  fail_with_status "BLOCKED" "Failed to create mission directory."
fi

created_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

if ! cat > "${mission_dir}/config.json" <<JSON
{
  "workspaceRoot": "${workspace_abs}",
  "projectRoot": "${project_root}",
  "moduleRoot": "src/modules",
  "componentRoot": "src/components",
  "uiLibPackage": "",
  "source": {
    "type": "manual",
    "notes": ""
  },
  "mission": {
    "id": "${mission_id}",
    "createdAt": "${created_at}"
  }
}
JSON
then
  fail_with_status "BLOCKED" "Failed to write config.json."
fi

if ! mkdir -p "${mission_dir}/references"; then
  fail_with_status "BLOCKED" "Failed to create references directory."
fi

print_status \
  "DONE_WITH_CONCERNS" \
  "Mission created. Confirm moduleRoot, componentRoot, and uiLibPackage before downstream steps." \
  "MISSION_ID" "${mission_id}" \
  "MISSION_PATH" "${mission_dir}" \
  "WORKSPACE_ROOT" "${workspace_abs}" \
  "PROJECT_ROOT" "${project_root}"
