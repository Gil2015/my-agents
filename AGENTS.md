# My Agents 项目

本项目用于创建供AI使用的  Skills / Agents，采用 npm monorepo 结构管理多个技能包。

## 目录结构

```text
skills学习/
├── package.json                    # 根 monorepo（workspaces: packages/*）
├── AGENTS.md                       # 本文件 — 项目总览 + 规则（供大部分AI使用）
├── CLAUDE.md                       # 供 Claude 使用的项目总览 + 规则
└── packages/
    ├── basic/                      # @gai/basic — 通用技能
    │   └── skills/
    │       ├── git-cherry-pick-squash/ # 公司工作流中的提交整理与跨分支迁移
    │       ├── review-skill/       # 审核 Skill 写法
    │       ├── review-agent/       # 审核 Agent/SubAgent 写法
    │       └── writing-automation-scripts/ # 编写或整理本地自动化脚本
    └── dev-frontend/               # @gai/dev-frontend — mission 化前端主线
        ├── README.md               # 使用说明（mission 目录、绝对路径调用）
        ├── skills/                 # step1~step5 分阶段 Skill
        └── agents/                 # 协调智能体
```

## 规则

- 新建技能按用途放在对应 `packages/` 子包下
- 项目语言偏好：中文交流，文件内容根据用途决定

## 技能包说明

### @gai/basic

通用技能包，存放与特定技术栈无关的技能。详见 `packages/basic/`。
当前包含 `review-skill`、`review-agent`、`git-cherry-pick-squash`、`writing-automation-scripts` 等技能。

### @gai/dev-frontend

前端开发全流程技能包（mission 隔离、纯任务配置、绝对路径调用）。
包含 step1~step5 Skills 和 协调 Agent。详见 [`packages/dev-frontend/README.md`](packages/dev-frontend/README.md)。
