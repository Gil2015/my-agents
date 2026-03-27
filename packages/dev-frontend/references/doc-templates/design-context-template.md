# 设计上下文文档模板（design-context.md）

适用于 `design-context-build` 产出的项目级或 mission 级 `design-context.md`。该文档的目标是让 `step2-ui-dev` 能稳定复用项目既有主题、token、组件和样式约束，而不是临场新写一套设计语言。

## 作用域约定

支持两种作用域：

1. 项目级基线：`{projectRoot}/.ai/design/design-context.md`
2. mission 级覆盖：`.ai/missions/{missionId}/design/design-context.md`

规则：
- 项目级基线记录长期共享规则
- mission 级覆盖只记录当前任务新增或覆盖的规则
- 两者冲突时，`ui-dev` 以 mission 级覆盖优先

## `design-context.md` 模板

```markdown
# 设计上下文文档（design-context.md）

- 作用域：PROJECT_BASELINE | MISSION_OVERRIDE
- 项目根目录：/abs/path/to/project
- Mission ID（可选）：20260327-103000
- Theme Mode：css_vars | js_tokens | mixed | unknown
- 文档状态：VERIFIED | PARTIAL
- 最近更新：2026-03-27
- 来源摘要：project code / developer notes / design assets / user input

## Summary
{1-3 句话概述本项目或本任务应遵循的视觉与组件规范}

## Theme Integration
- **Provider Entry:** {真实 Provider 入口文件或组件；没有则写 N/A}
- **Token Files:** {相对 projectRoot 的路径，多个用逗号分隔}
- **Style Entrypoints:** {全局 less/css/theme 入口}
- **Runtime Notes:** {主题在运行时如何注入、切换或覆盖}
- **Confidence:** high | medium | low

## Token Mapping

### Colors
| Semantic | Actual Token / Var | Usage Rule | Evidence Level | Source |
|----------|--------------------|------------|----------------|--------|
| primary  | `--color-primary`  | 主按钮、主操作高亮 | code_verified | `src/styles/theme.css` |

### Typography
| Semantic | Actual Token / Var | Usage Rule | Evidence Level | Source |
|----------|--------------------|------------|----------------|--------|
| body-md  | `fontSizeMD`       | 默认正文 | code_verified | `src/theme/index.ts` |

### Spacing / Radius / Shadow / Motion
| Semantic | Actual Token / Var | Usage Rule | Evidence Level | Source |
|----------|--------------------|------------|----------------|--------|
| card-radius | `borderRadiusLG` | 卡片、弹层圆角 | doc_verified | `docs/design/rule.md` |

## Component Reuse Contract
- **Project Components First:** {优先复用的公共组件、业务组件、封装入口}
- **UI Library Fallback:** {当项目组件不满足时，允许直接使用的 UI 库组件}
- **Local Components Allowed For:** {只有哪些场景才允许新增本地组件}
- **Do Not Rebuild:** {项目已有但不应重复封装的组件清单}

## Layout And Interaction Patterns
- 列表页：{容器、筛选区、表格、操作区约定}
- 表单页：{标签对齐、分组、校验反馈、提交区约定}
- 卡片/详情页：{信息块、标题、二级说明、空态约定}
- 状态反馈：{loading / empty / error / success 的视觉处理}

## Style Constraints
- 必须优先使用的 token / CSS Variables：{规则}
- 允许新增局部样式的场景：{规则}
- 硬编码限制：{颜色、字号、间距、圆角、阴影等限制}
- Provider / Token Override 规则：{何时允许覆盖，何时禁止绕过}

## Forbidden Or Risky Patterns
- {禁止事项 1}
- {禁止事项 2}
- {高风险事项 3}

## Evidence Log
| ID | Type | Path / Source | Key Finding | Level |
|----|------|---------------|-------------|-------|
| E1 | code | `src/theme/index.ts` | 定义全局 token 并传入 `ConfigProvider` | code_verified |
| E2 | doc  | `docs/design/brand.pdf` | 品牌主色和按钮语义说明 | doc_verified |

## Open Questions
- Q1: {当前仍无法确认的问题}
- Q2: {另一个待确认项}

## Mission Overrides
- {仅在 `MISSION_OVERRIDE` 文档中填写；没有则写 `None`}
```

## 写作规则

1. 每条关键结论都要能追溯到证据来源。
2. 找不到真实 token 时，可以先写语义规则，但要明确标注 `inferred` 或 `open_question`。
3. 如果项目暂无稳定设计体系，允许产出 `PARTIAL` 文档；不能伪造完整 token 表。
4. mission 级覆盖只写差异，不复制整份项目级基线。
