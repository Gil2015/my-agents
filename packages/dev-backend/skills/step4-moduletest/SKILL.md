---
name: module-test
description: 当需要在开始修 bug 之前，收集、审查并把后端模块问题登记到 bugDocs/bug.md 时使用
---

# 模块问题收集

## 概述

这个阶段只负责收集问题、补足证据并维护 `bugDocs/bug.md`，不负责修代码，也不新增测试任务。交付物是一份可追溯、可排序、可继续交给 `bug-fix` 的缺陷清单。

**核心原则：** 先收清楚，再交接修复。不收就修等于埋雷。

**违反规则的字面意思就是违反规则的精神。**

## 适用场景

**必须使用：**

- 模块开发完成后，需要先盘点当前模块问题再进入修复
- 开发者或测试零散提了一批问题，需要整理成结构化 Bug 文档
- 需要对照 `api-design.md` 和 `db-schema.md` 做一轮代码审查
- 上一轮修复后又出现新问题，需要继续往同一份 `bug.md` 中追加

**例外情况（需征询开发者）：**

- 问题本质上是需求未定、验收口径变化或产品策略调整
- 紧急 hotfix 且开发者明确要求先修后补记录
- 问题完全位于第三方系统、外部服务或基础设施层

## 铁律

```text
EVERY ACTIONABLE BUG MUST BE WRITTEN TO bugDocs/bug.md BEFORE STEP5 STARTS
```

**没有例外：**

- 来源可以是 `USER_INPUT`、`bugDocSources`、`AI_AUDIT`
- 同一症状如果是不同根因，必须拆成不同 `BUG-*`
- 第四步可以运行现有测试补强证据，但不能在这一阶段改业务代码
- `bug.md` 顶部必须能一眼看到当前修复进度和优先处理项

## 违反后果

如果 `.ai/missions/{missionId}/bugDocs/bug.md` 不存在、没有覆盖本轮问题来源、缺少证据，或顶部进度摘要失真，本轮问题收集视为未完成；`bug-fix` 不应在这种上下文不完整的情况下启动。

## 执行流程

1. `LOAD`：读取 `config.json`、`api-design.md`、`db-schema.md`、`req.md`、现有 `bug.md`、`bugDocSources` 和模块代码。
2. `COLLECT`：收口用户或开发者反馈、来源文件问题和历史 `BUG-*`。
3. `AUDIT`：对照设计文档做代码审查，必要时补强证据。
4. `DRAFT`：生成或更新 `bugDocs/bug.md`，为每个独立问题建条目。
5. `REVIEW`：去重、分级、排优先级，确认文档可直接交给 `bug-fix`。
6. `UPDATE`：同步顶部摘要和条目状态。

### 第 1 步：LOAD - 读取问题范围与来源

优先读取以下信息：

- `.ai/missions/{missionId}/config.json`：读取 `bugDocSources`、`backend.moduleName`
- `.ai/missions/{missionId}/apiDesign/api-design.md`：接口契约和 DTO 校验规则
- `.ai/missions/{missionId}/dbDesign/db-schema.md`：实体设计和关系
- `.ai/missions/{missionId}/reqDocs/req.md`：需求和验收标准
- `.ai/missions/{missionId}/bugDocs/bug.md`：若已存在，读取历史 Bug
- `src/modules/{module-name}/`：实际代码

**至少执行：**

- `test -d ".ai/missions/{missionId}"`
- `test -f ".ai/missions/{missionId}/config.json"`
- `find ".ai/missions/{missionId}" -maxdepth 3 -type f | sort`
- `find "src/modules/{module-name}" -maxdepth 4 -type f | sort`

### 第 2 步：COLLECT - 收口显式问题来源

先把明确提到的问题收进候选列表：

- 来自开发者或用户口述的问题
- 来自 `bugDocSources` 的文件内容
- 来自已有 `bug.md` 的历史条目：保留原 `BUG-*` 编号和状态

### 第 3 步：AUDIT - 对照设计文档审查代码

后端特化的审查维度：

| 维度           | 审查内容                                              |
| -------------- | ----------------------------------------------------- |
| API 契约对齐   | Controller 路由 + DTO 是否与 `api-design.md` 一致     |
| 业务逻辑完整性 | 每条 REQ/AC 是否都有对应的 Service 实现               |
| 数据校验       | DTO class-validator 装饰器覆盖率、边界值处理          |
| 异常处理       | 业务异常是否正确抛出、错误码是否与设计一致            |
| 安全性         | 权限守卫是否到位、参数注入风险、SQL 注入风险          |
| 性能           | N+1 查询、未加索引的大表查询、不必要的全表扫描        |
| 事务一致性     | 跨表操作是否包在事务中、异常时是否回滚                |
| Entity 一致性  | Entity 字段是否与 `db-schema.md` 一致                 |
| VO 转换        | Service 是否返回 VO 而非 Entity                       |
| 分层违规       | Controller 是否包含业务逻辑、Service 是否操作 Request |

审查路径建议：

1. 沿 Request → Controller → Service → Repository → Entity 追踪
2. 检查 DTO 校验 → Service 业务校验 → 数据库约束 三层防线
3. 检查异常场景：空值、不存在、重复、并发、权限不足

### 第 4 步：DRAFT - 维护缺陷文档

以 `../../references/doc-templates/bug-doc-template.md` 为模板基线，生成或更新 `.ai/missions/{missionId}/bugDocs/bug.md`。

### 第 5 步：REVIEW - 去重、分级、排优先级

按严重级别排序：`S0 -> S1 -> S2 -> S3`

严重级别参考：

| 级别 | 后端含义                       | 示例                           |
| ---- | ------------------------------ | ------------------------------ |
| S0   | 数据损坏 / 安全漏洞 / 服务崩溃 | SQL 注入、事务不一致导致脏数据 |
| S1   | 核心功能不可用                 | 接口 500、必填校验缺失         |
| S2   | 非核心功能异常                 | 排序不正确、分页边界错误       |
| S3   | 代码规范 / 优化建议            | 分层违规、命名不一致           |

### 第 6 步：UPDATE - 更新顶部修复进度摘要

完成收口后：

- 更新 `当前结论`
- 更新 `修复进度`
- 更新 `本轮来源`
- 更新 `优先处理`

**至少执行：**

- `test -f ".ai/missions/{missionId}/bugDocs/bug.md"`
- `rg -n "^## BUG-" ".ai/missions/{missionId}/bugDocs/bug.md"`

## 速查表

| 阶段    | 关键活动                    | 完成标准                    |
| ------- | --------------------------- | --------------------------- |
| LOAD    | 读取设计文档、代码和配置    | 问题范围明确，来源可追溯    |
| COLLECT | 收口口头问题和外部文件问题  | 显式输入都已进入候选列表    |
| AUDIT   | 对照设计文档审查代码        | 找到安全、性能、分层等问题  |
| DRAFT   | 生成或更新 `bugDocs/bug.md` | 每个问题都有结构化条目      |
| REVIEW  | 去重、分级、排优先级        | Bug 清单可直接交给修复阶段  |
| UPDATE  | 同步顶部进度摘要            | `bug.md` 顶部状态与条目一致 |

## 常见借口

| 借口                            | 现实                       |
| ------------------------------- | -------------------------- |
| "后端没有 UI，问题看日志就知道" | 日志不替代结构化的问题文档 |
| "这个 N+1 查询影响不大"         | 数据量上去就是定时炸弹     |
| "先修一个大的，其他回头再说"    | 你是在让修复范围失控       |
| "安全性问题我看不出来"          | 至少检查参数注入和权限守卫 |

## 危险信号 - 立即停下来

- 你已经开始改代码，却还没生成 `bugDocs/bug.md`
- 你没有对照 `api-design.md` 审查 Controller + DTO
- 你把"需求未定义"伪装成"代码 Bug"
- 你跳过了安全性和性能审查维度

## 参考文档

| 主题         | 文件                                                 |
| ------------ | ---------------------------------------------------- |
| 通用规则     | `../../references/rules/common-rules.md`             |
| 缺陷文档模板 | `../../references/doc-templates/bug-doc-template.md` |

## 集成关系

- **直接上游：** `api-design`、`db-design`、`module-dev`
- **主产物：** `.ai/missions/{missionId}/bugDocs/bug.md`
- **下游：** `bug-fix` 只消费已登记的 `BUG-*` 继续修复
