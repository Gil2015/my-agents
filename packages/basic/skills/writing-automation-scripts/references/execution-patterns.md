# 执行模式

当需求包含多步骤、长驻进程或就绪判断时，读这个文件。

如果需求涉及桌面应用控制或 AI 工具调用，也用这份规则约束执行顺序、注释和失败处理。

## 核心规则

- 默认串行执行。
- 第一个错误就立即失败。
- 每个步骤都要先判定为 `一次性任务` 或 `长驻任务`。
- 当前步骤没有“真正完成”或“真正就绪”之前，不要进入下一步。

## Shell 基线

默认使用下面这段前导：

```bash
#!/usr/bin/env bash
set -euo pipefail
```

只有在脚本确实需要更严格的分词控制时，才额外加 `IFS=$'\n\t'`。

并且：
- 文件头必须有注释，说明脚本用途
- 关键分支、等待、重试、清理必须有注释

## 一次性任务模式

适用于 build、link、install、copy、cleanup 这类完成后应立即退出的步骤：

```bash
#!/usr/bin/env bash
set -euo pipefail

# 在明确目录内执行一次性任务，避免污染调用方上下文。
cd "/absolute/or/resolved/path"
npm link
npm run build
```

要求：
- 目录必须明确
- 路径必须加引号
- 是否成功由退出码决定

## 长驻任务模式

适用于启动 watcher、dev server 或其他常驻进程的步骤。

必备元素：
- PID 文件
- 日志文件
- 就绪检查
- 超时
- 停止或清理方式

Example shape:

```bash
#!/usr/bin/env bash
set -euo pipefail

# 把长驻任务的运行状态收敛到临时目录，方便排查和清理。
TASK_DIR="/tmp/example-task"
mkdir -p "$TASK_DIR"
LOG_FILE="$TASK_DIR/watch.log"
PID_FILE="$TASK_DIR/watch.pid"

cd "/path/to/project"
# 后台启动后立刻记录 PID，并把输出落到日志。
npm run build:watch >>"$LOG_FILE" 2>&1 &
WATCH_PID=$!
printf '%s\n' "$WATCH_PID" >"$PID_FILE"

# 在进入下一步前，必须等待稳定的“已就绪”信号。
node "../helpers/wait-ready.mjs" \
  --mode log \
  --log-file "$LOG_FILE" \
  --match "compiled successfully" \
  --timeout-ms 120000
```

## 就绪信号优先级

优先选择更强的信号：

| 信号 | 适用时机 | 说明 |
| --- | --- | --- |
| Port | 服务会监听明确端口 | 本地判断里最稳的一类 |
| HTTP | 有可访问的健康检查接口 | 如果有 health URL，优先它 |
| 日志关键字 | 工具会打印稳定的 ready 文案 | watcher 和 CLI 常用 |
| 等待后检查 PID | 没有更强信号可用 | 最弱，必须说明风险 |

不要因为“后台进程启动了”就当作已就绪。

## 桌面应用控制

如果脚本核心是 macOS 应用控制：
- 优先用 `osascript` / AppleScript 做应用层动作
- 用 shell 负责外层编排、日志与参数传递
- 关键窗口/标签页/菜单动作必须注释“为什么需要这一步”

示例：

```applescript
-- 打开浏览器并聚焦到目标地址。
tell application "Safari"
    activate
    open location "http://localhost:3000"
end tell
```

## 参数处理

默认优先级：
1. CLI 参数
2. 环境变量
3. 只有当某个值本来就是用户明确指定的一部分时，才允许硬编码

建议默认保留：
- `--dry-run`
- `--verbose`

## AI 工具调用

如果某一步要调用 AI CLI 或 HTTP API：
- 优先复用用户已经在用的工具
- 注释清楚输入、输出和失败处理
- 凭证不要写死在脚本里
- 返回结果如果会影响后续步骤，必须校验关键字段

## 配套说明文档要写什么

如果交付物包含长驻任务，说明文档里至少要写清楚：
- 启动命令
- 就绪判断依据
- 日志位置
- PID 或状态文件位置
- 如何停止
- 超时或失败时怎么排查

## 危险命令

生成这些命令前必须显式标记风险：
- `rm -rf`
- `kill`、`pkill`，或清理不相关进程
- `npm install -g`、`pnpm add -g` 等系统级变更
- 多仓库 `npm link` 这类会改软链接的操作

确实需要危险命令时：
- 目标必须写明确
- 作用范围必须尽量收窄
- 需要写出回滚或人工确认方式
