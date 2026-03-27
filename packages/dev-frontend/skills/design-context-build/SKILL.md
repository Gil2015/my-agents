---
name: design-context-build
description: 当需要从项目代码、开发者补充、设计资源目录或用户口述中提炼 AI 可消费的项目设计规范/主题上下文文档，并供后续 UI 开发沿用时使用
---

# 设计上下文构建

## 概述

从项目代码、开发者手填信息、设计资源目录和当前轮文字描述中，提炼出一份 AI 可消费的 `design-context.md`。这个 skill 的目标不是“总结设计稿”，而是把后续 `ui-dev` 真正需要遵守的主题接入方式、token 约束、组件复用策略和禁用模式沉淀成稳定文档。

**核心原则：** 优先沉淀已验证的设计事实，不发明一套不存在的设计系统。

**违反规则的字面意思就是违反规则的精神。**

## 适用场景

**必须使用：**
- UI 开发经常重写一套新样式，没有沿用项目现有主题和组件
- 新项目刚开始，需要先把设计规范录入给 AI
- 已有设计规范文件、截图或资源目录，但缺少 AI 可消费的结构化文档
- 某个 mission 需要在项目基线之上追加局部主题或交互覆盖

**例外情况（需征询开发者）：**
- 一次性演示页或 PoC，不会沉淀为正式项目资产
- 项目已经存在可用且最新的 `design-context.md`，本轮也没有新增设计约束

觉得“设计风格看一眼代码就知道了”？停下来。AI 不会长期记住这些隐性约束，必须写成文档。

## 铁律

```text
PREFER VERIFIED DESIGN SOURCES - NEVER INVENT A DESIGN SYSTEM
```

没有证据支持的设计结论，只能标记为 `inferred` 或 `open_question`；绝不能伪装成项目既有规范。

## 作用域与产物

默认支持两层产物：

- 项目级基线：`{projectRoot}/.ai/design/design-context.md`
- mission 级覆盖：`.ai/missions/{missionId}/design/design-context.md`

规则：
- 项目长期共享的主题、组件和样式约束写入项目级基线
- 只对当前任务生效的补充说明、局部覆盖和临时例外写入 mission 级覆盖
- 如果当前任务没有新增覆盖，不要为了“格式统一”复制一份 mission 文档
- `ui-dev` 读取顺序始终是 mission 覆盖优先于项目级基线

## 正式支持的主题实现

当前优先识别以下主题实现方式：

- `css_vars`：通过 CSS Variables 定义颜色、字号、间距等设计 token
- `js_tokens`：通过 JS / TS theme 对象定义 token，并交给 `ConfigProvider` 或自定义 Provider 消费
- `mixed`：同时存在 CSS Variables 与 JS / TS token，且都在真实运行链路中生效
- `unknown`：无法确定主题接入方式，或当前项目未形成稳定主题体系

如果项目使用了其他方式，不要强行归类；记录真实接入路径，并标为 `unknown` 或 `mixed`。

## 执行流程

1. `LOAD`：读取配置、历史设计文档、代码证据、资源目录和当前轮补充输入。
2. `DETECT`：识别主题接入方式、Provider 入口、token 文件和样式入口。
3. `EXTRACT`：提炼 token 映射、组件复用约束、布局模式、样式限制和禁用模式。
4. `MERGE`：按证据等级合并冲突信息，区分项目基线与 mission 覆盖。
5. `OUTPUT`：按模板增量更新 `design-context.md`，并显式保留缺口与推断项。

## 第 1 步：LOAD - 读取设计上下文来源

优先读取以下信息：
- `.ai/missions/{missionId}/config.json`：确认 `projectRoot`、`componentRoot`、`uiLibPackage`
- 现有项目级 `design-context.md` 与 mission 级 `design-context.md`
- 开发者补充的设计说明、品牌规范、组件使用说明
- 指定资源目录中的设计规范文件、图片、截图、标注文档
- 目标项目中的主题定义代码、Provider 入口、公共组件封装
- 当前轮用户口述的设计意图或限制

必须先确认：
- 本轮要生成项目基线、mission 覆盖，还是同时更新两者
- 设计来源是否真实存在；缺失路径不能被静默忽略
- 项目是否已经有稳定主题入口，还是仍处于“开发者手填优先”的早期阶段
- 是否存在历史文档；如果存在，必须增量更新而不是整份重写

**若上下文来自 mission 目录，至少执行：**
- `test -f ".ai/missions/{missionId}/config.json"`
- `find ".ai/missions/{missionId}" -maxdepth 3 -type f | sort`

**若需要从项目代码提取设计规范，至少执行：**
- `rg -n "ConfigProvider|token\\s*:|theme\\s*:|createTheme|ThemeProvider|--[A-Za-z0-9-]+" "{projectRoot}"`
- `rg -n ":root|html|body|data-theme|var\\(--" "{projectRoot}"`

## 第 2 步：DETECT - 识别主题接入方式

重点识别以下事实：
- 当前项目主主题模式是 `css_vars`、`js_tokens`、`mixed` 还是 `unknown`
- `ConfigProvider` 或自定义 Provider 的真实入口文件与组件路径
- token 定义文件、全局样式入口、运行时主题切换入口
- 是否存在“旧主题文件仍在仓库里，但已不再生效”的历史残留

规则：
- 只记录真实运行链路上的主题接入方式，不把弃用代码当现行规范
- 如果项目同时存在多个主题来源，优先记录当前业务页面实际走到的那条链路
- 无法确认生效顺序时，保留为 `open_question`，不要擅自合并

## 第 3 步：EXTRACT - 提炼 AI 可执行的设计约束

`design-context.md` 至少需要覆盖：
- 主题接入方式：Provider、token 文件、样式入口、当前生效链路
- token 映射：颜色、字号、间距、圆角、阴影、层级、动效
- 组件复用约定：优先复用哪些项目组件、哪些场景可以回退到 UI 库、哪些情况才允许新增本地组件
- 页面/布局约定：容器、区块、表单、表格、卡片、空态、错误态、操作区等常见模式
- 样式实现约束：什么时候必须使用 token / CSS Variables，什么时候允许局部样式
- 禁止事项：硬编码视觉 token、绕过 Provider、重复封装项目已有组件等

提炼规则：
- 找到真实 token 时，记录具体变量名、字段名或组件名
- 找不到数值但能确认语义时，先记录语义约束和来源
- 截图、图片或口述只能用于补充视觉意图，不能覆盖代码中已验证的主题事实

## 第 4 步：MERGE - 合并多来源信息并标注证据

每条设计结论都要标注证据等级：

- `code_verified`：来自当前项目已生效代码
- `doc_verified`：来自明确的设计规范文档或开发者填写文档
- `user_provided`：来自当前轮用户/开发者口述
- `inferred`：基于有限证据推断得出

冲突处理规则：
- 项目级基线默认以 `code_verified` 优先，其次是 `doc_verified`、`user_provided`、`inferred`
- mission 级覆盖允许基于当前任务输入覆盖项目级基线，但必须显式写明“仅当前任务生效”
- 如果多个来源冲突且无法判断谁是现行规范，不要强行给出单一结论；保留冲突说明与 `open_question`

## 第 5 步：OUTPUT - 写入设计上下文文档

使用 `../../references/doc-templates/design-context-template.md` 作为模板，生成或更新：

1. 项目级基线：`{projectRoot}/.ai/design/design-context.md`
2. mission 级覆盖：`.ai/missions/{missionId}/design/design-context.md`

写入要求：
- 顶部必须写清 `作用域`、`Theme Mode`、来源摘要和文档状态
- 每条关键规则都要能追溯到代码、文档、资源目录或用户输入
- 已有条目优先增量更新，不随意打乱现有结构
- 若设计信息仍不充分，输出“已确认事实 + 未确认问题”，不要补齐一套虚构规范

## 速查表

| 阶段 | 关键动作 | 完成标准 |
|------|---------|---------|
| LOAD | 读取配置、历史文档和多来源设计资料 | 明确本轮产物作用域与可用来源 |
| DETECT | 识别主题模式与真实生效链路 | 能说明 token 从哪里定义、在哪里生效 |
| EXTRACT | 提炼 token、组件、布局和样式约束 | `ui-dev` 可直接复用，不必二次猜测 |
| MERGE | 按证据等级合并冲突信息 | 所有推断项都被显式标注 |
| OUTPUT | 增量更新 `design-context.md` | 产物可被项目级或 mission 级 UI 开发直接消费 |

## 常见借口

| 借口 | 现实 |
|------|------|
| “主题文件太多了，先随便挑一个” | 先确认真实运行链路，不然会把废弃规范继续传播 |
| “这颜色肉眼看差不多” | 视觉接近不代表 token 相同，AI 需要明确 token 名或变量名 |
| “先写成一套完整规范，后面再修” | 一旦写成文档，后续 skill 会把它当真 |
| “用户说想要蓝一点，那就改项目主题” | 当前轮口述通常是 mission 覆盖，不一定代表项目长期基线 |

## 危险信号 - 立即停下来

- 你在没有代码或文档证据时，写出了完整颜色/字号/spacing 体系
- 你把截图里的视觉印象当成已生效的主题实现
- 你发现仓库里有多个主题入口，却没有核实哪一个真的在运行
- 你为了“让 step2 好开发”，擅自补出项目里根本没有的组件或样式规范

## 参考文档

| 主题 | 文件 |
|------|------|
| 通用规则 | `../../references/rules/common-rules.md` |
| 设计上下文模板 | `../../references/doc-templates/design-context-template.md` |

## 集成关系

- **主消费方：** `step2-ui-dev`
- **可选触发者：** 开发者手动调用、orchestrator 在明确需要设计上下文时建议调用
- **非阻塞说明：** 缺少 `design-context.md` 不阻塞 `step2-ui-dev`，但 `step2-ui-dev` 必须显式说明设计上下文缺口
