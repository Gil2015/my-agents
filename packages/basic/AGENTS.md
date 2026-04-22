# @gai/basic — 通用技能包

存放与特定技术栈无关的通用技能，其中也包含少量贴近公司研发协作流程的通用操作 skill。

## 目录结构

```
basic/
├── AGENTS.md           # 本文件
├── CLAUDE.md           # 供 Claude 使用的项目说明
├── package.json
└── skills/
    ├── git-cherry-pick-squash/    # 公司工作时使用的跨分支 cherry-pick / squash skill
    ├── review-skill/              # 审核 Skill 写法
    ├── review-agent/              # 审核 Agent/SubAgent 写法
    ├── writing-automation-scripts/ # 编写或整理本地自动化脚本
    └── {skill-name}/              # 每个技能一个目录
        ├── SKILL.md               # 主文件（必需）
        └── references/            # 参考文档（可选）
```

## 当前技能

- `review-skill`：审查和优化已有 Skill 写法。
- `review-agent`：审查和优化 Agent / SubAgent 写法。
- `git-cherry-pick-squash`：公司工作时使用的提交流转 skill，用于按作者筛选跨分支提交、生成清单，并按 STORY 分组 cherry-pick 到当前分支。
- `writing-automation-scripts`：编写或整理本地自动化脚本，包括启动项目、一键运行流程、批处理、文件整理、应用控制，以及调用本地 CLI / HTTP API / AI 工具的脚本。

## 新增技能流程

1. 在 `skills/` 下创建目录，命名用小写连字符（如 `review-skill`）
2. 编写 SKILL.md

## SKILL.md 规范

### Frontmatter（`name` 必须英文）

```yaml
---
name: skill-name          # 小写连字符，与目录名一致
description: "当需要[具体触发场景]时使用，用一句话说明这个 skill 做什么"
---
```

- `name` 只允许字母、数字、连字符
- `description` 清晰描述"做什么 + 何时使用"（功能概要 + 触发条件），可以用中文
- frontmatter 总字符数不超过 1024；除 `name`、代码、命令、路径、字段名、协议字面量和理论上必须英文的内容外，其余文案尽量中文
- 可选字段：`argument-hint`（需双引号包裹）、`allowed-tools`、`context`、`disable-model-invocation` 等，按需添加

### 正文

- 除 `name`、关键代码和理论上必须英文的地方外，其余说明默认尽量中文
- 如果技能明确面向跨团队英文环境或外部公开复用，可以按需使用英文或双语，但全文要保持一致
- 参考文档（`references/`）超过 100 行时从 SKILL.md 中拆出

## 写作风格

- **优先解释 why，而非堆砌 MUST**：Claude 理解原因后遵从度更高
- 偶尔用 ALWAYS/NEVER 可以，满篇大写说明在用命令代替解释
- 重复的操作序列打包为脚本，而非在 SKILL.md 中反复指导

## 修改技能的注意事项

- 改动 SKILL.md 正文前，先通读全文理解上下文
- 不要改 frontmatter 的 `name`（会影响技能发现和路由）
- 修改 `description` 时确保仍包含"做什么 + 何时使用"，不要仅仅为了统一格式就把中文硬改成英文
- 添加 `references/` 文件后，在 SKILL.md 末尾的 References 表中注册
