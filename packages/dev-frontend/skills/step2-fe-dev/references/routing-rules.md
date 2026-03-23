# 路由规则

如何决定由哪个子技能处理给定请求。

## 子技能概览

| 子技能 | 用途 | 关键输出 |
|--------|------|----------|
| `req-collect` | 从禅道/飞书/URL 收集并结构化需求 | `.ai/requirements/{module}.req.md`、`.ai/requirements/{module}.issues.md` |
| 内置 UI 审计 | 分析设计稿并映射到项目组件 | `.ai/designs/{module}/component-mapping.md` |
| `ui-dev` | 搭建并实现前端模块 | `src/modules/{module}/` 完整目录 |
| `api-integrate` | 根据接口文档生成 Service 层 | `defs/service.ts`、`defs/type.ts`、`__test__/mock.ts` |
| `module-test` | 针对验收标准进行系统性测试 | `.ai/test-reports/{module}.report.md` |
| `bug-fix` | 根因分析与定向修复 | 修复后的代码 + 更新后的测试报告 |

## 按任务类型路由

| 用户请求 | 路由到 | 原因 |
|----------|--------|------|
| "收集需求" / "整理需求" / "抓取需求" | `req-collect` | 需求收集阶段 |
| "分析UI稿" / "组件映射" / "审计设计稿" | 内置 UI 审计 | 轻量级，技能内处理 |
| "开发页面" / "创建模块" / "实现功能" | `ui-dev` | 核心开发阶段 |
| "联调接口" / "对接API" / "接入后端" | `api-integrate` | 接口联调阶段 |
| "测试模块" / "写测试" / "验证功能" | `module-test` | 测试阶段 |
| "修复bug" / "修复缺陷" / "解决问题" | `bug-fix` | 缺陷修复阶段 |

## 按问题模式路由

| 问题模式 | 子技能 |
|----------|--------|
| "帮我整理这个需求" | `req-collect` |
| "这个设计稿用什么组件" | 内置 UI 审计 |
| "帮我创建一个新模块" | `ui-dev` |
| "后端接口文档在这里，帮我对接" | `api-integrate` |
| "帮我测试这个模块" | `module-test` |
| "这里有个bug需要修复" | `bug-fix` |
| "帮我从头开发这个功能" | 完整流程 (Phase 1→6) |

## 依赖检查

路由之前，需验证前置条件是否满足：

| 目标阶段 | 前置要求 | 检查方式 |
|----------|----------|----------|
| Phase 2（UI 审计） | Phase 1 已完成 | `.ai/requirements/{module}.req.md` 存在 |
| Phase 3（UI 开发） | Phase 1 已完成 | `.ai/requirements/{module}.req.md` 存在 |
| Phase 4（接口联调） | Phase 3 已完成 | `src/modules/{module}/` 存在 |
| Phase 5（测试） | Phase 3 已完成 | 模块代码已实现 |
| Phase 6（缺陷修复） | Phase 5 已完成 | `.ai/test-reports/{module}.report.md` 存在 |

如果前置条件未满足，应通知用户并建议先执行所需阶段。

## 多技能工作流

### 完整开发流水线

```
req-collect → UI Audit → ui-dev → api-integrate → module-test → bug-fix
```

每个阶段产出的文档供下一阶段消费，必须按顺序执行。

### 部分工作流

| 场景 | 所需技能 | 顺序 |
|------|----------|------|
| 从零开始的新模块 | 全部 6 个阶段 | 按顺序执行 |
| 需求已经明确 | Phase 2→6 | 跳过 req-collect |
| 模块已存在，需要联调接口 | 仅 Phase 4 | api-integrate |
| 模块已完成，需要测试 | Phase 5→6 | module-test → bug-fix |
| 已报告的特定缺陷 | 仅 Phase 6 | bug-fix |

## 模糊请求处理

1. **询问** — 使用 AskUserQuestion 向用户澄清需求
2. **检查状态** — 查看 `.ai/` 目录以确定当前进度
3. **建议下一步** — 根据已有的文档/代码，建议合理的下一阶段
