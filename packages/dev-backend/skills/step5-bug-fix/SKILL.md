---
name: bug-fix
description: 当需要修复已经登记在 bugDocs/bug.md 中的后端模块问题，并同步更新修复进度时使用
---

# 缺陷修复

## 概述

这个阶段只负责基于 `bugDocs/bug.md` 中已登记的 `BUG-*` 做分析、修复、回归和进度回写，不负责收集新 Bug。交付物是可映射到既有 `BUG-*` 的代码变更，以及状态、根因和回归结果都已同步的同一份 `bug.md`。

**核心原则：** 只修已登记的，修完要验证，验证要记录。

**违反规则的字面意思就是违反规则的精神。**

## 适用场景

**必须使用：**

- `.ai/missions/{missionId}/bugDocs/bug.md` 中已有 `OPEN` 或 `FIXING` 的缺陷
- 上一轮问题收集已经完成，需要开始逐条修复
- 历史 Bug 修复后需要做定向回归并更新文档状态

**例外情况（需征询开发者）：**

- 当前问题尚未登记进 `bug.md`
- 问题本质上是需求变更
- 缺陷位于第三方系统或基础设施层

## 铁律

```text
ONLY FIX BUGS THAT ARE ALREADY REGISTERED IN bugDocs/bug.md
```

**没有例外：**

- 动代码前必须先锁定本轮要处理的 `BUG-*`
- 第五步不新增 `BUG-*`；如果回归时发现独立新问题，回到 `module-test` 建档
- 动代码前必须补齐或更新 `### 根因分析`
- 修复后必须回填 `### 修复方案` 和 `### 回归结果`
- 顶部进度必须随真实状态更新

## 违反后果

如果代码改动无法映射到已有 `BUG-*`，`bug.md` 没有同步根因和回归结果，或顶部进度摘要仍停留在旧状态，本轮缺陷修复视为未完成。

## 执行流程

### 第 1 步：LOAD - 读取缺陷范围与上下文

优先读取以下信息：

- `.ai/missions/{missionId}/config.json`
- `.ai/missions/{missionId}/bugDocs/bug.md`
- `.ai/missions/{missionId}/apiDesign/api-design.md`
- `.ai/missions/{missionId}/dbDesign/db-schema.md`
- `.ai/missions/{missionId}/reqDocs/req.md`
- `src/modules/{module-name}/`

必须先确认：

- 本轮到底修哪几个 `BUG-*`
- 哪些 Bug 共享同一根因
- 哪些问题已经 `BLOCKED`

**至少执行：**

- `test -f ".ai/missions/{missionId}/bugDocs/bug.md"`
- `find ".ai/missions/{missionId}" -maxdepth 3 -type f | sort`
- `find "src/modules/{module-name}" -maxdepth 4 -type f | sort`

### 第 2 步：PICK - 锁定本轮修复对象

按以下顺序挑选：

1. `S0 -> S1 -> S2 -> S3`
2. `OPEN` 优先进入 `FIXING`
3. 共享同一根因的条目可以一并处理
4. 无关问题不要混在同一轮代码变更里

### 第 3 步：ANALYZE - 先写根因，再动代码

针对每个目标 `BUG-*`，沿代码路径追踪到第一个出错环节。

后端特化的排查路径：

1. **请求链路：** Request → Guard → Pipe → Controller → Service → Repository → DB
2. **数据链路：** Entity 字段 → DTO 映射 → Service 转换 → VO 输出
3. **类型链路：** Entity type → DTO validators → Service params → Controller decorators
4. **事务链路：** 事务边界 → 异常回滚 → 并发锁
5. **配置链路：** 环境变量 → ConfigService → 模块注入

要求：

- `根因分析` 必须解释"为什么会错"，不是只重复"哪里错了"
- 能定位到文件、字段、条件分支或时序问题

### 第 4 步：FIX - 做最小且正确的修复

针对根因实施最小化变更：

- 修源头，不修表面症状
- 修类型链时，让 Entity、DTO、Service、Controller 保持一致
- 同一问题尽量在根因所在文件修复

禁止行为：

- 到处增加 `try-catch` 却不解释为什么会抛异常
- 用 `as any` 掩盖类型问题
- 借修 Bug 之机做无关重构
- 修改 Entity 结构却不更新 `db-schema.md`

### 第 5 步：REGRESS - 定向回归验证

修复后必须重跑受影响范围：

1. 当前 `BUG-*` 的直接复现路径
2. 同一代码路径下的关键相邻场景
3. 根因分析中提到的边界场景

**至少执行：**

- 相关测试文件存在时：`npx jest --testPathPattern='{module-name}' --no-coverage` 或项目等效命令
- 无自动化测试时：按 `bug.md` 的 `复现步骤` 手动验证

记录要求：

- `### 回归结果` 中写明 `PASS` / `FAIL` / `BLOCKED`
- 回归失败时，不得把状态改成 `FIXED`

### 第 6 步：UPDATE - 同步修复进度

修复或回归完成后，至少同步：

- 更新目标 `BUG-*` 的 `状态`、`根因分析`、`修复方案`、`回归结果`
- 更新顶部 `当前结论`、`修复进度` 和 `优先处理`

状态说明：

| 状态       | 含义                     |
| ---------- | ------------------------ |
| `OPEN`     | 已记录，尚未开始修复     |
| `FIXING`   | 正在处理，但还没完成回归 |
| `FIXED`    | 修复完成且回归通过       |
| `BLOCKED`  | 受外部依赖阻塞           |
| `WONT_FIX` | 明确决定不修，并记录理由 |

**至少执行：**

- `test -f ".ai/missions/{missionId}/bugDocs/bug.md"`
- `rg -n "^## BUG-" ".ai/missions/{missionId}/bugDocs/bug.md"`

## 速查表

| 阶段    | 关键活动                 | 完成标准               |
| ------- | ------------------------ | ---------------------- |
| LOAD    | 读取缺陷、设计文档和代码 | 修复范围明确           |
| PICK    | 选择本轮 `BUG-*`         | 状态已切到 `FIXING`    |
| ANALYZE | 写出根因分析             | 能解释缺陷为什么发生   |
| FIX     | 实施最小变更             | 修复定位准确           |
| REGRESS | 重跑受影响范围           | 有真实回归结果         |
| UPDATE  | 同步 `bug.md` 进度       | 顶部摘要和条目状态一致 |

## 常见借口

| 借口                          | 现实                          |
| ----------------------------- | ----------------------------- |
| "这个问题很小，不用挂 BUG-\*" | 没有编号，就没有边界和回归    |
| "顺手把旁边也一起改了"        | 你在扩大风险面                |
| "回归结果晚点再补"            | 没有回归记录的 FIXED 没有意义 |
| "改了 Entity 就不用改文档了"  | `db-schema.md` 必须同步       |

## 危险信号 - 立即停下来

- 你还没锁定 `BUG-*`，就开始改代码
- 你准备通过增加 `try-catch` 来"压住"异常
- 你把状态改成 `FIXED`，但没有回归记录
- 你更新了 Entity 但没同步 `db-schema.md`
- 你更新了代码，却没同步 `bug.md` 顶部进度摘要

## 参考文档

| 主题         | 文件                                                 |
| ------------ | ---------------------------------------------------- |
| 通用规则     | `../../references/rules/common-rules.md`             |
| 缺陷文档模板 | `../../references/doc-templates/bug-doc-template.md` |

## 集成关系

- **直接上游：** `module-test`
- **主产物：** 代码修复 + `.ai/missions/{missionId}/bugDocs/bug.md`
- **如发现新问题：** 回到 `module-test` 先登记
