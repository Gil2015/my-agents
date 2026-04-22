#!/usr/bin/env bash
set -euo pipefail

# 作用：macOS 单入口包装层。
# 说明：这里尽量只保留入口分发逻辑，复杂流程放到 steps/ 或 helpers/。

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENTRYPOINT=""
CANDIDATES=(
  "$SCRIPT_DIR/run.sh"
  "$SCRIPT_DIR/steps/01-main.sh"
  "$SCRIPT_DIR/steps/01-start.sh"
)

# 依次寻找可用入口，便于不同脚本目录结构共用这个模板。
for candidate in "${CANDIDATES[@]}"; do
  if [[ -f "$candidate" ]]; then
    ENTRYPOINT="$candidate"
    break
  fi
done

if [[ -z "$ENTRYPOINT" ]]; then
  echo "[run.command] 未找到入口脚本，已检查：" >&2
  for candidate in "${CANDIDATES[@]}"; do
    echo "  - $candidate" >&2
  done
  exit 1
fi

if [[ ! -x "$ENTRYPOINT" ]]; then
  # 如果入口文件尚未可执行，尝试补执行权限。
  chmod +x "$ENTRYPOINT" 2>/dev/null || true
fi

exec "$ENTRYPOINT" "$@"
