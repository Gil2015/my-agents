# 通用规则

适用于 `packages/dev-backend` 全流程技能包的共享约束。本文档只定义跨 step 都成立的工作区契约、文档维护规则和阶段边界；具体代码结构与示例以 `../module-template/` 为准。

## 1. 权威来源

- mission 工作区、文档产物和阶段职责边界，以本文件和 `../../README.md` 为准
- NestJS 模块结构、导出方式和占位文件，以 `../module-template/` 为准
- 如果规则文字与共享模板冲突，应以模板为准完成当前任务，并尽快回写修正文档

## 2. Mission 与模块命名契约

- mission 工作区路径统一写作 `.ai/missions/{missionId}/...`
- 真实业务模块路径统一写作 `projectRoot/backend.moduleRoot/{module-name}`
- `missionId` 只是任务目录名，不能当作模块目录名使用
- `config.json.backend.moduleName` 是当前 mission 的后端模块标识主字段
- NestJS 模块命名使用 kebab-case，例如 `fund-calculation`
- `config.json.module.name` 是前端模块标识；`config.json.backend.moduleName` 是后端模块标识；两者可以不同

## 3. 共享资产位置

- 文档模板统一维护在 `../doc-templates/`
- 后端模块代码骨架统一维护在 `../module-template/`
- step 私有指南、补充规则和分析方法继续放在各自的 `skills/*/references/` 下
- 项目级后端架构文档默认写入目标项目的 `.ai/docs/backend-context.md`

## 4. 按需生成原则

- 初始化 mission 时只保证 `.ai/missions/{missionId}/config.json` 存在
- 项目级 `.ai/docs/` 不是固定产物，只有需要沉淀共享架构上下文时才创建
- `apiDesign/` 由 `step1-api-design` 首次创建
- `dbDesign/` 由 `step2-db-design` 首次创建
- `bugDocs/` 由 `step4-moduletest` 或 `step5-bug-fix` 首次创建
- 前端已有的 `reqDocs/`、`apiDoc/` 可被后端 skills 直接读取

## 5. 配置读取约定

`config.json` 中后端相关字段：

- `backend.moduleRoot`：后端业务模块根目录，例如 `src/modules`
- `backend.orm`：项目使用的 ORM，例如 `typeorm` / `prisma` / `sequelize`
- `backend.database`：数据库类型，例如 `postgresql` / `mysql` / `sqlite`
- `backend.moduleName`：后端业务模块目录名
- `apiDesignSources`：API 设计来源（文件或目录）
- `dbDesignSources`：数据库设计来源（文件或目录）

规则：

- 读取来源路径时，不得静默忽略不存在的路径
- 在代码相关步骤中，优先从 `config.json.backend.moduleName` 定位真实模块
- 如果 `config.json` 与文档顶部 `模块名` 冲突，应返回 `NEEDS_CONTEXT`，不要擅自选边
- 前端已有的 `reqDocSources`、`apiDocSources` 字段可直接复用

## 6. 文档维护原则

- 所有结构化文档都按"先读取旧文档，再做增量更新"的方式维护
- 已存在的 `API-*`、`ENTITY-*`、`BUG-*` 编号默认保留，不随意重排
- 顶部摘要类字段必须与正文条目真实状态保持一致
- 所有文档条目都必须能追溯到用户输入、配置来源文件或代码/契约审查证据

## 7. 阶段职责边界

- `project-context-build`：负责沉淀项目级后端架构上下文文档，供各 step 复用
- `step1-api-design`：负责后端 API 设计，确认接口契约、DTO、VO 和业务逻辑规则
- `step2-db-design`：负责数据库 Schema 设计，包括实体、关系、索引和迁移策略
- `step3-module-dev`：负责 NestJS 模块实现，包括 Controller、Service、DTO、Entity、VO
- `step4-moduletest`：负责问题收集、来源收口和代码审查，不直接修代码
- `step5-bug-fix`：只修已经登记进 `bug.md` 的问题，不在这一阶段新增独立 Bug

## 8. 证据与校验原则

- 使用模板前先确认本轮真实输入和目标输出
- 文档来自文件系统时，至少执行存在性和文件列表检查
- 审查结论要写清"预期是什么、实际是什么、证据在哪里"
- 如果上下文不足以继续当前阶段，应明确回退到上游阶段，而不是继续猜

## 9. 与 dev-frontend 的协作约定

- 后端 skills 可以直接读取同一 mission 下的 `reqDocs/req.md` 和 `apiDoc/api.md`
- 前端 `api.md` 是后端 `api-design.md` 的主要输入来源之一
- 前端 `defs/type.ts` 和 `defs/service.ts` 中的字段名和路径是后端实现的参考约束
- 后端实现结果如与前端契约不一致，必须在 `api-design.md` 中标记 `NEEDS_ADJUST`

## 10. 参考映射

| 主题               | 文件                                          |
| ------------------ | --------------------------------------------- |
| 通用规则           | `./common-rules.md`                           |
| API 设计文档模板   | `../doc-templates/api-design-doc-template.md` |
| 数据库设计文档模板 | `../doc-templates/db-schema-doc-template.md`  |
| 缺陷文档模板       | `../doc-templates/bug-doc-template.md`        |
| NestJS 代码规则    | `./nestjs-code-rules.md`                      |
| 模块代码骨架       | `../module-template/`                         |
