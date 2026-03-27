# 组件清单模板（component-catalog.md）

适用于 `design-context-build` 产出的项目级 `component-catalog.md`。该文档的目标是让 `step2-ui-dev` 在写页面前先知道“项目里已经有什么全局可用组件”，减少重复造轮子，并提高 UI 一致性。

## 路径约定

固定路径：

1. 项目级基线：`{projectRoot}/.ai/docs/component-catalog.md`

规则：
- 所有需求任务共用同一份组件基线文档
- 不在 mission 目录下重复维护组件清单
- 本文档只记录项目全局组件和 npm 安装组件，不记录业务模块级组件

## `component-catalog.md` 模板

```markdown
# 组件清单（component-catalog.md）
- 项目根目录：/abs/path/to/project
- 文档状态：VERIFIED | PARTIAL
- 最近更新：2026-03-27

## Summary
{1-2 句话概述本项目推荐优先复用的全局组件与 npm 组件边界}

## Reuse Priority
1. 项目全局组件
2. npm 安装组件
3. 当前模块本地组件
4. 禁止重复封装的已有模式

## Component Inventory
| Name | Import Path | Category | Preferred Scenarios | Minimal Usage Notes | Replace / Avoid | Evidence Level | Source |
|------|-------------|----------|---------------------|---------------------|-----------------|----------------|--------|
| PageHeader | `src/components/PageHeader` | global | 页面标题、面包屑、操作区头部 | 传入 `title` 和 `extra` 即可满足常见场景 | 不要再手写同类头部容器 | code_verified | `src/components/PageHeader/index.tsx` |
| ProTable | `@ant-design/pro-components` | npm | 列表页、筛选+表格 | 优先走项目既有表格封装；直接使用时只记录关键入口和限制 | 避免重复拼装表格壳 | code_verified | `package.json` |

## Do Not Rebuild
- {项目中已有、但经常被重复造轮子的组件模式}

## Local Component Rules
- 什么时候允许新建模块内本地组件
- 什么时候必须优先复用全局组件或 npm 组件
- 哪些组件只允许包一层适配，不允许重新实现视觉结构

## Open Questions
- Q1: {仍需确认的组件边界或替代关系}
```

## 写作规则

1. 只记录真实存在且可定位的组件、封装入口和导入路径。
2. 只记录两类组件：项目全局组件、npm 安装组件；不要把业务模块级组件写进这份基线文档。
3. 优先记录“高复用、高一致性价值”的组件，不要把所有叶子节点都堆进清单。
4. 每个组件条目只保留最小必要说明：适用场景、导入路径、1-3 条关键使用提示或限制；不要把完整 props 文档搬进来。
