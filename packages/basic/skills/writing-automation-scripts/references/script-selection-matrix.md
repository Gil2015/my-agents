# 脚本选型矩阵

当脚本应该拆成几层、用哪种文件格式不够明确时，读这个文件。

## 默认偏好

优先使用 `bash` 步骤脚本，`run.command` 只做 macOS 入口包装；只有 shell 开始变脆弱时才补 Node 辅助脚本。遇到明显的 macOS 应用控制场景，优先考虑 `osascript` / AppleScript。

## 选型表

| 场景 | 推荐格式 | 原因 |
| --- | --- | --- |
| 单条命令或很短的串行命令链 | `steps/*.sh` | 最简单，最容易读和调试 |
| 多个可以拆开的原子步骤 | 多个 `steps/NN-*.sh` | 每一步职责清晰，便于单独重跑 |
| 需要一个 macOS 一键入口 | `run.command` + shell 步骤 | 入口友好，同时不隐藏内部步骤 |
| 需要控制 Finder、浏览器、IDE、系统窗口或弹窗 | `osascript` / `.applescript` | 更贴近 macOS 桌面自动化能力 |
| 需要端口、HTTP、日志轮询来判断就绪 | `helpers/wait-ready.mjs` + shell 步骤 | Node 更适合轮询和解析 |
| 参数较多，或需要结构化配置 | Node 辅助脚本或轻量入口 | 比复杂 shell 更稳定 |
| 只是打开应用并跑几条 shell 命令 | shell，必要时加 `.command` | Node 在这里没有明显收益 |
| 需要调用本地 AI CLI 或 HTTP API | shell + Node 辅助脚本 | shell 负责编排，Node 更适合处理请求/响应 |

## 判断原则

选择 shell 的时机：
- 主要操作是 `cd`、`open`、`npm`、`pnpm`、`git`、`cp` 这类命令
- 步骤应该在非零退出码时立即失败
- 参数和引用规则还比较简单

选择 `.command` 的时机：
- 需要一个单入口文件供 macOS 手动执行
- 实际工作仍然可以交给 `steps/*.sh`
- 需要把入口体验和内部实现分离

选择 `osascript` / AppleScript 的时机：
- 需要控制 macOS 应用、菜单、窗口、标签页或 Finder
- 需要打开特定 URL、聚焦某个应用、切换标签页等桌面操作
- shell 能做但表达很绕，AppleScript 可读性更高

选择 Node 的时机：
- 需要带超时的轮询循环
- 就绪判断依赖端口、HTTP 或日志内容
- 需要更稳地合并 CLI 参数与环境变量
- shell 实现会变得难读、难改、难排错
- 需要调用 AI API 并解析结构化响应

## 反模式

尽量避免：
- 只包两条 shell 命令却强行写成 Node
- 一个大 shell 文件同时做参数解析、流程编排、长驻进程管理
- 把所有逻辑都直接写进 `.command`
- 用 shell 硬写复杂的桌面应用控制
- 把流程编排、就绪判断、清理逻辑揉成一个难以维护的文件

## 默认目录形态

```text
scripts/<task-slug>/
  readme.md
  run.command
  steps/
    01-prepare.sh
    02-start-watch.sh
    03-start-app.sh
    04-open-browser.sh
  helpers/
    wait-ready.mjs
  extras/
    app-control.applescript
```

含义：
- `readme.md` 说明整个任务目录怎么用
- `run.command` 是便捷入口
- `steps/` 才是真正的执行单元
- `helpers/` 只在 shell 过于脆弱时才存在
- `extras/` 放桌面自动化或其他补充脚本
