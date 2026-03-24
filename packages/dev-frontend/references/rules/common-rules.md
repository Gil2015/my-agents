# 通用规则

适用于 `packages/dev-frontend` 全流程技能包的通用约束。本文档定义共享资产位置、mission 工作区约定、增量更新原则和阶段职责边界。

前端模块代码组织、ahooks 约束和布局分层规则请查看 `./frontend-code-rules.md`。

## 1. 共享资产位置

- 文档模板统一维护在 `../doc-templates/`
- 前端模块代码骨架统一维护在 `../module-template/`
- Step 私有的指南、补充规则和分析方法，继续放在各自的 `skills/*/references/` 下

## 2. Mission 工作区约定

以下路径示例统一写作 `.ai/missions/{module}/...`，其中 `{module}` 表示当前任务目录标识。

标准产物路径：
- 需求文档：`.ai/missions/{module}/reqDocs/req.md`
- 澄清问题：`.ai/missions/{module}/reqDocs/issues.md`
- 接口文档：`.ai/missions/{module}/apiDoc/api.md`
- 缺陷文档：`.ai/missions/{module}/bugDocs/bug.md`
- 任务配置：`.ai/missions/{module}/config.json`

配置来源约定：
- `reqDocSources`：step1 的需求来源文件或目录
- `apiDocSources`：step3 的接口来源文件或目录
- `bugDocSources`：step4 的缺陷来源文件或目录

禁止行为：
- 遇到不存在的来源路径时静默忽略
- 不读取已有文档就整份覆盖
- 跳过 `config.json` 就直接假设目录结构

## 3. 文档维护原则

- 所有结构化文档都按“先读取旧文档，再做增量更新”的方式维护
- 已存在的 `REQ-*`、`API-*`、`BUG-*` 编号默认保留，不随意重排
- 顶部摘要类字段必须与正文条目真实状态保持一致
- 所有文档条目都必须能追溯到用户输入、配置来源文件或代码/契约审查证据

## 4. 阶段职责边界

- `step1-req-collect`：负责收集、结构化需求和澄清项，不负责写业务代码
- `step2-ui-dev`：负责 UI 与模块骨架实现，不负责伪造接口契约
- `step3-api-integrate`：负责接口契约落地和联调，不负责发明产品需求
- `step4-moduletest`：负责问题收集、来源收口和需求对码审查，不直接修代码
- `step5-bug-fix`：只修已经登记进 `bug.md` 的问题，不在这一阶段新增独立 Bug

## 5. 证据与校验原则

- 使用模板前先确认本轮真实输入和目标输出
- 文档来自文件系统时，至少执行存在性和文件列表检查
- 审查结论要写清“预期是什么、实际是什么、证据在哪里”
- 如果上下文不足以继续当前阶段，应明确回退到上游阶段，而不是继续猜

## 6. 参考映射

| 主题 | 文件 |
|------|------|
| 通用规则 | `./common-rules.md` |
| 需求文档模板 | `../doc-templates/req-doc-template.md` |
| 接口文档模板 | `../doc-templates/api-doc-template.md` |
| 缺陷文档模板 | `../doc-templates/bug-doc-template.md` |
| 前端代码规则 | `./frontend-code-rules.md` |
| Step4 缺陷文档规则 | `./step4-bug-doc-rules.md` |
| Step5 缺陷文档规则 | `./step5-bug-doc-rules.md` |
| 模块代码骨架 | `../module-template/` |
