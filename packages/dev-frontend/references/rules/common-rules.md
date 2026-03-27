# 通用规则

适用于 `packages/dev-frontend` 全流程技能包的共享约束。本文档只定义跨 step 都成立的工作区契约、文档维护规则和阶段边界；具体代码结构与示例以 `../module-template/` 为准。

## 1. 权威来源

- mission 工作区、文档产物和阶段职责边界，以本文件和 `../../README.md` 为准
- 前端模块结构、导出方式和占位文件，以 `../module-template/` 为准
- 如果规则文字与共享模板冲突，应以模板为准完成当前任务，并尽快回写修正文档

## 2. Mission 与模块命名契约

- mission 工作区路径统一写作 `.ai/missions/{missionId}/...`
- 真实业务模块路径统一写作 `projectRoot/moduleRoot/{ModuleName}`
- `missionId` 只是任务目录名，不能当作模块目录名使用
- `config.json.module.name` 是当前 mission 的模块标识主字段；`req.md`、`api.md`、`bug.md` 顶部的 `模块名` 必须与它保持一致
- `config.json.module.displayName` 用于文档展示，可为空；它不参与真实代码路径解析

## 3. 共享资产位置

- 文档模板统一维护在 `../doc-templates/`
- 前端模块代码骨架统一维护在 `../module-template/`
- step 私有指南、补充规则和分析方法继续放在各自的 `skills/*/references/` 下
- 项目级设计上下文文档默认写入目标项目的 `.ai/design/design-context.md`
- mission 级设计覆盖文档默认写入 `.ai/missions/{missionId}/design/design-context.md`

## 4. 按需生成原则

- 初始化 mission 时只保证 `.ai/missions/{missionId}/config.json` 存在
- 项目级 `.ai/design/` 不是固定产物，只有需要沉淀共享设计上下文时才创建
- `reqDocs/` 由 `step1-req-collect` 首次创建
- `apiDoc/` 由 `step3-api-integrate` 首次创建
- `bugDocs/` 由 `step4-moduletest` 或 `step5-bug-fix` 首次创建
- `design/` 由 `design-context-build` 首次创建
- `references/` 不是固定产物，只有确实需要沉淀临时资料时才创建

## 5. 配置读取约定

`config.json` 中至少包含以下共享字段：

- `workspaceRoot`：目标项目的 `.ai` 根目录
- `projectRoot`：目标项目根目录
- `moduleRoot`：业务模块根目录，例如 `src/modules`
- `componentRoot`：公共组件根目录，例如 `src/components`
- `uiLibPackage`：项目当前 UI 组件库包名，可为空
- `module.name`：业务模块目录名
- `module.displayName`：业务模块显示名
- `reqDocSources` / `apiDocSources` / `bugDocSources`：各阶段来源文件或目录

规则：

- 读取来源路径时，不得静默忽略不存在的路径
- 在代码相关步骤中，优先从 `config.json.module.name` 定位真实模块
- 如果 `config.json` 与文档顶部 `模块名` 冲突，应返回 `NEEDS_CONTEXT`，不要擅自选边

## 6. 文档维护原则

- 所有结构化文档都按“先读取旧文档，再做增量更新”的方式维护
- 已存在的 `REQ-*`、`API-*`、`BUG-*` 编号默认保留，不随意重排
- 顶部摘要类字段必须与正文条目真实状态保持一致
- 所有文档条目都必须能追溯到用户输入、配置来源文件或代码/契约审查证据

## 7. 阶段职责边界

- `step1-req-collect`：负责收集、结构化需求和澄清项，并在可确定时补齐 `config.json.module`
- `design-context-build`：负责沉淀项目级或 mission 级设计上下文文档，供 `step2-ui-dev` 复用
- `step2-ui-dev`：负责 UI 与模块骨架实现，不负责伪造接口契约
- `step3-api-integrate`：负责接口契约落地和联调，不负责发明产品需求
- `step4-moduletest`：负责问题收集、来源收口和需求对码审查，不直接修代码
- `step5-bug-fix`：只修已经登记进 `bug.md` 的问题，不在这一阶段新增独立 Bug

## 8. 证据与校验原则

- 使用模板前先确认本轮真实输入和目标输出
- 文档来自文件系统时，至少执行存在性和文件列表检查
- 审查结论要写清“预期是什么、实际是什么、证据在哪里”
- 如果上下文不足以继续当前阶段，应明确回退到上游阶段，而不是继续猜

## 9. 参考映射

| 主题 | 文件 |
|------|------|
| 通用规则 | `./common-rules.md` |
| 需求文档模板 | `../doc-templates/req-doc-template.md` |
| 设计上下文模板 | `../doc-templates/design-context-template.md` |
| 接口文档模板 | `../doc-templates/api-doc-template.md` |
| 缺陷文档模板 | `../doc-templates/bug-doc-template.md` |
| 前端代码规则 | `./frontend-code-rules.md` |
| Step4 缺陷文档规则 | `./step4-bug-doc-rules.md` |
| Step5 缺陷文档规则 | `./step5-bug-doc-rules.md` |
| 模块代码骨架 | `../module-template/` |
