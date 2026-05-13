# 阶段交接关卡

## BOOTSTRAP_READY

- `.ai` 入口存在。
- `.ai-src` 资料库存在。
- mission 和 `config.json` 可定位。

## REQ_READY

- `req.md` 存在。
- `scope.md` 存在。
- `impact-map.md` 存在。
- 待澄清项不阻塞下游，或已明确暂停。

## KNOWLEDGE_READY

- 项目索引存在，或已记录缺失风险。
- UI 开发前至少确认组件、utils、hooks、主题、模板的可用情况。

## UI_READY

- 每条需求有实现映射。
- UI 自检记录了组件复用和新增原因。
- 必要 mock 已准备。

## API_READY

- 接口文档已结构化。
- 类型、service、数据层和 mock 一致。

## TEST_READY

- `test-plan.md` 和 `test-report.md` 已写入。
- 可修复问题已进入 `bug.md`。

## HANDOFF_READY

- 已列出变更摘要、验证结果和人工审核重点。
- 不执行自动提交。
