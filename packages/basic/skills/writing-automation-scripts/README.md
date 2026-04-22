# writing-automation-scripts

## 作用

`writing-automation-scripts` 是一个专门用来生成“本地自动化脚本”的 skill。

它覆盖的不只是开发启动流程，还包括：
- 本地项目启动、联调预热、构建/watch/dev 流程
- 文件整理、批处理、重命名、清理
- 浏览器、IDE、Finder 等 macOS 应用控制
- 调用本地 CLI、HTTP API 或已有 AI 工具去完成某一步

这个 skill 的核心目标不是“随便给一段能跑的代码”，而是生成：
- 可重复执行的脚本
- 带关键注释的脚本
- 带使用说明文档的脚本
- 对风险、依赖、参数和验证方式说清楚的脚本

## 使用方式

### 直接触发

可以直接用自然语言描述需求，例如：

```text
帮我写一套本地自动化脚本：打开 IDE、启动 2 个项目、等待服务就绪后打开浏览器。
脚本要带注释，生成后附带 README.md。
```

```text
帮我写一个 macOS 脚本，把下载目录里的截图按日期归档，并支持 dry-run。
```

```text
帮我写一个本地脚本，读取剪贴板内容，调用我已经安装好的 AI CLI 做总结，然后把结果保存成 markdown。
```

### 建议描述内容

为了让输出更稳，建议尽量描述这些信息：
- 想完成什么事
- 涉及哪些目录、应用、命令或工具
- 是否有长驻任务
- 下一步依赖什么“就绪信号”
- 是否需要参数
- 是否涉及危险操作

### 输出约定

这个 skill 默认会：
- 优先生成 `scripts/<task-slug>/`
- 多文件交付时补 `README.md`
- 单文件交付时补同名 `.md`
- 默认加入关键注释
- 显式说明假设、风险、验证方式

## 安装总览

这个仓库里的源文件当前放在：

```text
.ai/skills/writing-automation-scripts/
```

为了兼容不同工具，建议把这里当作“源码目录”，再按对应工具的原生路径做软链接或复制安装。

这样做的好处是：
- 只维护一份源文件
- 更新 skill 时不用重复改多份
- 卸载时也更清晰

下面涉及软链接的命令，默认都在这个仓库根目录执行。

---

## Claude Code

> 说明：根据 Anthropic 当前公开文档，Claude Code 稳定公开的本地扩展机制是自定义 slash commands 和 subagents。README 里给的是“兼容使用法”，不是把它说成 Claude Code 的原生 `SKILL.md` 自动发现机制。

### 安装

项目级安装：

```bash
mkdir -p .claude/commands
cat > .claude/commands/write-automation-script.md <<'EOF'
读取并遵循这个项目里的脚本规范：

- `./.ai/skills/writing-automation-scripts/SKILL.md`
- 需要时再读取：
  - `./.ai/skills/writing-automation-scripts/references/script-selection-matrix.md`
  - `./.ai/skills/writing-automation-scripts/references/execution-patterns.md`
  - `./.ai/skills/writing-automation-scripts/references/example-prompts.md`

按其中的规则帮我生成脚本。默认要求：
- 脚本必须带关键注释
- 多文件交付时补 `README.md`
- 单文件交付时补同名 `.md`

需求：$ARGUMENTS
EOF
```

全局安装：

```bash
mkdir -p ~/.claude/commands
cat > ~/.claude/commands/write-automation-script.md <<'EOF'
读取并遵循当前仓库里的脚本规范：

- `./.ai/skills/writing-automation-scripts/SKILL.md`
- 需要时再读取：
  - `./.ai/skills/writing-automation-scripts/references/script-selection-matrix.md`
  - `./.ai/skills/writing-automation-scripts/references/execution-patterns.md`
  - `./.ai/skills/writing-automation-scripts/references/example-prompts.md`

按其中的规则帮我生成脚本。默认要求：
- 脚本必须带关键注释
- 多文件交付时补 `README.md`
- 单文件交付时补同名 `.md`

需求：$ARGUMENTS
EOF
```

### 卸载

项目级卸载：

```bash
rm -f .claude/commands/write-automation-script.md
```

全局卸载：

```bash
rm -f ~/.claude/commands/write-automation-script.md
```

### 使用

```text
/write-automation-script 帮我写一套本地自动化脚本：打开 IDE、启动项目、等待端口 ready 后打开浏览器
```

也可以不装命令文件，直接把 `SKILL.md` 的规则粘贴给 Claude，但长期使用不如命令文件稳定。

---

## Codex

> 说明：Codex 官方文档当前使用 `~/.agents/skills/` 作为用户级原生 skills 目录；OpenCode 也兼容 `.agents/skills/`。为了避免维护两份，这里推荐从 `.ai/skills/` 做软链接。

### 安装

项目级安装：

```bash
mkdir -p .agents/skills
ln -snf ../../.ai/skills/writing-automation-scripts .agents/skills/writing-automation-scripts
```

全局安装：

```bash
mkdir -p ~/.agents/skills
ln -snf "$(pwd)/.ai/skills/writing-automation-scripts" ~/.agents/skills/writing-automation-scripts
```

安装后重启 Codex 会更稳。

### 卸载

项目级卸载：

```bash
rm -rf .agents/skills/writing-automation-scripts
```

全局卸载：

```bash
rm -rf ~/.agents/skills/writing-automation-scripts
```

### 使用

自然语言触发：

```text
请使用 writing-automation-scripts skill，帮我生成一套本地自动化脚本。
```

或直接描述任务：

```text
帮我写一个本地脚本，启动服务、等待就绪、打开浏览器，并附带说明文档。
```

---

## OpenCode

> 说明：OpenCode 原生支持 `SKILL.md` 目录发现，支持项目级和全局级 skills。

### 安装

项目级安装：

```bash
mkdir -p .opencode/skills
ln -snf ../../.ai/skills/writing-automation-scripts .opencode/skills/writing-automation-scripts
```

全局安装：

```bash
mkdir -p ~/.config/opencode/skills
ln -snf "$(pwd)/.ai/skills/writing-automation-scripts" ~/.config/opencode/skills/writing-automation-scripts
```

如果 OpenCode 已经在运行，建议重启当前会话。

### 卸载

项目级卸载：

```bash
rm -rf .opencode/skills/writing-automation-scripts
```

全局卸载：

```bash
rm -rf ~/.config/opencode/skills/writing-automation-scripts
```

### 使用

自然语言触发：

```text
帮我写一套本地自动化脚本，要求带注释和说明文档。
```

显式加载：

```text
use skill tool to load writing-automation-scripts
```

---

## Qwen Code

> 说明：Qwen Code 原生支持 project skills 和 personal skills。

### 安装

项目级安装：

```bash
mkdir -p .qwen/skills
ln -snf ../../.ai/skills/writing-automation-scripts .qwen/skills/writing-automation-scripts
```

全局安装：

```bash
mkdir -p ~/.qwen/skills
ln -snf "$(pwd)/.ai/skills/writing-automation-scripts" ~/.qwen/skills/writing-automation-scripts
```

如果 Qwen Code 已经在运行，重启后再使用更稳。

### 卸载

项目级卸载：

```bash
rm -rf .qwen/skills/writing-automation-scripts
```

全局卸载：

```bash
rm -rf ~/.qwen/skills/writing-automation-scripts
```

### 使用

自然语言触发：

```text
帮我写一个本地脚本，整理文件、打开应用，并给出使用说明。
```

显式调用：

```text
/skills writing-automation-scripts
```

---

## 维护建议

- 源文件继续维护在 `.ai/skills/writing-automation-scripts/`
- 其他工具目录尽量用软链接
- 每次修改 `SKILL.md` 后，顺手检查模板和 README 是否仍一致
- 如果你后面把范围继续扩到 AI API、AppleScript、浏览器自动化，可以继续往 `references/` 和 `assets/templates/` 里补

## 参考资料

- Anthropic Claude Code slash commands:
  https://docs.anthropic.com/en/docs/claude-code/slash-commands
- Anthropic Claude Code subagents:
  https://docs.anthropic.com/en/docs/claude-code/sub-agents
- OpenAI Codex skills:
  https://developers.openai.com/codex/skills
- OpenAI create custom skills:
  https://developers.openai.com/codex/skills/create-skill
- OpenCode Agent Skills:
  https://opencode.ai/docs/skills
- Qwen Code Agent Skills:
  https://qwenlm.github.io/qwen-code-docs/en/users/features/skills/
