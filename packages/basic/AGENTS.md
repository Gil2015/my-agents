# @gai/basic — 通用技能包

存放与特定技术栈无关的通用技能。

## 目录结构

```
basic/
├── CLAUDE.md           # 本文件
├── package.json
└── skills/
    ├── review-skill/   # 审核 Skill 写法
    ├── review-agent/   # 审核 Agent/SubAgent 写法
    └── {skill-name}/   # 每个技能一个目录
        ├── SKILL.md    # 主文件（必需）
        └── references/ # 参考文档（可选）
```

## 新增技能流程

1. 在 `skills/` 下创建目录，命名用小写连字符（如 `review-skill`）
2. 编写 SKILL.md

## SKILL.md 规范

### Frontmatter（必须英文）

```yaml
---
name: skill-name          # 小写连字符，与目录名一致
description: "做什么的简要概述. Use when [具体触发场景]"
---
```

- `name` 只允许字母、数字、连字符
- `description` 第三人称，清晰描述"做什么 + 何时使用"（功能概要 + 触发条件）
- frontmatter 总字符数不超过 1024，文案尽可能用中文（代码、关键术语等除外）
- 可选字段：`argument-hint`（需双引号包裹）、`allowed-tools`、`context`、`disable-model-invocation` 等，按需添加

### 正文

- 通用技能用英文编写（面向多团队复用）
- 如果技能只面向中文团队，可以用中文，但 frontmatter 仍保持英文
- 参考文档（`references/`）超过 100 行时从 SKILL.md 中拆出

## 写作风格

- **优先解释 why，而非堆砌 MUST**：Claude 理解原因后遵从度更高
- 偶尔用 ALWAYS/NEVER 可以，满篇大写说明在用命令代替解释
- 重复的操作序列打包为脚本，而非在 SKILL.md 中反复指导

## 修改技能的注意事项

- 改动 SKILL.md 正文前，先通读全文理解上下文
- 不要改 frontmatter 的 `name`（会影响技能发现和路由）
- 修改 `description` 时确保仍包含"做什么 + 何时使用"
- 添加 `references/` 文件后，在 SKILL.md 末尾的 References 表中注册
