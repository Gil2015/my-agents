# @gai/dev-frontend

面向多任务并行场景的前端开发技能包。

采用 mission 工作区模型：每次任务独立存放在 `.ai/missions/{missionId}`，避免文档和配置互相污染。

## 核心原则

- `missionId` 只表示任务工作区；`moduleName` 才表示真实业务模块目录名
- 初始化只创建 `.ai/missions/{missionId}/config.json`；`reqDocs/`、`apiDoc/`、`bugDocs/` 在对应 step 第一次执行时按需生成
- 目标模块路径统一按 `projectRoot/moduleRoot/{moduleName}` 解析
- 仅支持完整路径调用，不使用快捷命令
- 每个 mission 独立 `config.json`，不依赖包级全局配置

## 目录结构

```text
packages/dev-frontend/
├── README.md
├── package.json
├── agents/
│   └── fe-dev-orchestrator/
│       ├── AGENTS.md
│       └── prompts/
│           ├── handoff-gate.md
│           └── route-planner.md
├── references/
│   ├── doc-templates/
│   ├── module-template/
│   └── rules/
├── scripts/
│   └── create-mission.sh
└── skills/
    ├── step1-req-collect/
    ├── step2-ui-dev/
    ├── step3-api-integrate/
    ├── step4-moduletest/
    │   └── references/
    └── step5-bug-fix/
        └── references/
```

说明：
- 当前标准流程为：`step1-req-collect` → `step2-ui-dev` → `step3-api-integrate` → `step4-moduletest` → `step5-bug-fix`。
- 真实开发中不要求每次都跑完整链路；新增的 `agents/fe-dev-orchestrator/` 用于根据当前 mission 状态自动选择最小必要步骤，并支持断点续跑。
- 目录名带 `stepX-` 前缀用于流程排序；对应 skill 名分别是 `req-collect`、`ui-dev`、`api-integrate`、`module-test`、`bug-fix`。
- 文档模板统一维护在 `references/doc-templates/`；step 私有指南仍放在各自 skill 的 `references/` 下。
- 所有规则类文件统一维护在 `references/rules/`，包括通用规则、前端代码规则，以及 step4 / step5 的缺陷文档规则。
- 共享模板 `references/module-template/` 是当前前端模块结构和导出约定的第一参考源。

## Mission 目录规范

初始化完成后，mission 基础目录只包含：

```text
.ai/missions/{missionId}/
└── config.json
```

`missionId` 命名规则：`YYYYMMDD-HHmmss`，例如 `20260322-081530`。

各 step 执行后会按需扩展为：

```text
.ai/missions/{missionId}/
├── config.json
├── reqDocs/      # step1 首次生成
├── apiDoc/       # step3 首次生成
├── bugDocs/      # step4 / step5 首次生成
└── references/   # 需要沉淀临时资料时再创建
```

说明：
- skill 文档中的 mission 路径统一写作 `.ai/missions/{missionId}/...`；代码模块目录统一写作 `{ModuleName}` 或 `moduleName`。
- `bugDocs/bug.md` 是当前 step4 / step5 标准流程的核心交付物。
- `testDocs/` 不再是当前 step4 的固定产物；若项目单独维护测试文档，可按需扩展。

## Mission 配置说明

```json
{
  "workspaceRoot": "/abs/path/to/project/.ai",
  "projectRoot": "/abs/path/to/project",
  "moduleRoot": "src/modules",
  "componentRoot": "src/components",
  "uiLibPackage": "",
  "module": {
    "name": "",
    "displayName": ""
  },
  "source": {
    "type": "manual",
    "notes": ""
  },
  "reqDocSources": [],
  "apiDocSources": [],
  "bugDocSources": [],
  "mission": {
    "id": "20260322-081530",
    "createdAt": "2026-03-20T08:00:00Z"
  }
}
```

说明：

- `moduleRoot`、`componentRoot`、`uiLibPackage` 是 mission 初始化时写入的默认值，仅作为初始假设。
- `module.name` 是真实业务模块目录名，例如 `FundCalculation`；它与 `mission.id` 没有命名关系，不能互相替代。
- `module.displayName` 用于文档展示，可为空。
- `bugDocSources` 用于 step4 收口用户补充文档、日志或其他缺陷来源。
- step1 应尽量在结构化需求时补齐 `module.name`；step2 及后续代码相关步骤优先读取该字段。
- 在 step2、step3 读取这些字段前，应先确认它们是否匹配真实项目结构。

## 推荐调用方式

### 1) 初始化 mission

```sh
# 以下命令面向“已安装到目标项目 .ai/dev-frontend/”的场景
# 在项目根目录执行，默认使用 ./.ai
sh .ai/dev-frontend/scripts/create-mission.sh
```

### 2) 使用协调 Agent 决定本轮步骤

协调 Agent 路径：

```text
/abs/path/to/project/.ai/dev-frontend/agents/fe-dev-orchestrator/AGENTS.md
```

它的职责：

- 先检查当前 mission 是否已经有 `reqDocs/`、`apiDoc/`、`bugDocs/` 和目标模块骨架
- 根据用户目标决定这轮只跑哪些 steps，而不是默认完整跑 `step1 -> step5`
- 支持常见断点续跑场景，例如先做 `step1 -> step3`，过一段时间再做 `step4 -> step5`
- 允许在上下文充分时直接从 `step2`、`step3`、`step4` 或 `step5` 起步

推荐给协调 Agent 的最小输入：

- 当前项目根目录或仓库根目录
- 当前 mission 路径，或至少给出 `missionId`
- 这轮明确目标，例如“先做到接口联调”“只整理 bug 不修”“继续修历史 BUG”
- 当前额外上下文，例如需求文档目录、UI 稿目录、API 文档目录、bug 来源目录
- 如果你只想跑某一段，明确写出范围，例如“只做 step2”“先做 step1~3”

常见路由示例：

| 当前目标 | 常见路由 |
|---------|---------|
| 新需求从整理到基础联调 | `step1 -> step2 -> step3` |
| 已有明确需求，直接开始做页面 | `step2`，必要时回退 `step1` |
| 模块已开发好，只补接口联调 | `step3` |
| 联调后统一收集问题，再安排修复 | `step4 -> step5` |
| 已有 `bug.md`，继续修历史问题 | `step5` |

可直接复制的调用示例：

```text
请使用 /abs/path/to/project/.ai/dev-frontend/agents/fe-dev-orchestrator/AGENTS.md

项目根目录：/abs/path/to/project
mission 路径：/abs/path/to/project/.ai/missions/20260324-103000
本轮目标：先完成需求整理、页面开发和接口联调，先不要进入 bug 收集和修复
补充资料：
- 需求目录：/abs/path/to/project/.ai/missions/20260324-103000/raw-req
- UI 资料目录：/abs/path/to/project/.ai/missions/20260324-103000/ui
- API 文档目录：/abs/path/to/project/.ai/missions/20260324-103000/raw-api
```

```text
请使用 /abs/path/to/project/.ai/dev-frontend/agents/fe-dev-orchestrator/AGENTS.md

项目根目录：/abs/path/to/project
mission 路径：/abs/path/to/project/.ai/missions/20260324-103000
本轮目标：上次已经做到 step3，这次只做问题收集和缺陷修复
限制：如果 bugDocs/bug.md 不够完整，先停在 step4，不要直接进入 step5
```

### 3) SubAgent 的使用方式

通常不需要用户直接调用 sub-agent。

- `route-planner` 是协调 Agent 的内部前置路由器，用来判断“这轮该跑哪些 step”。
- `handoff-gate` 是协调 Agent 的内部交接检查器，用来判断“当前阶段能不能进入下一步”。

推荐做法：

- 正常开发时，直接调用 `fe-dev-orchestrator/AGENTS.md`
- 只有在调试路由逻辑、排查为什么没有继续下一步、或想单独预览阶段规划时，才直接调用 sub-agent

直接调用 sub-agent 的路径：

```text
/abs/path/to/project/.ai/dev-frontend/agents/fe-dev-orchestrator/prompts/route-planner.md
/abs/path/to/project/.ai/dev-frontend/agents/fe-dev-orchestrator/prompts/handoff-gate.md
```

`route-planner` 适用场景：

- 你只想先知道“这轮应该跑哪些 step”，但暂时不执行
- 你怀疑当前 mission 应该从 `step2` / `step4` 直接起步，想先看路由结果
- 你想确认用户指定的“只做 1~3”是否满足前置条件

`route-planner` 示例：

```text
请使用 /abs/path/to/project/.ai/dev-frontend/agents/fe-dev-orchestrator/prompts/route-planner.md

devFrontendRoot: /abs/path/to/project/.ai/dev-frontend
missionRoot: /abs/path/to/project/.ai/missions/20260324-103000
userGoal: 这轮只做接口联调，不进入问题收集和修复
requestedRange: only-step3
configPath: /abs/path/to/project/.ai/missions/20260324-103000/config.json
artifactSnapshot:
- reqDocs/req.md 已存在
- apiDoc/api.md 不存在
- bugDocs/bug.md 不存在
moduleSnapshot:
- src/modules/FundCalculation 存在
- index.tsx、defs/、hooks/、layouts/ 已存在
extraContext:
- API 文档目录：/abs/path/to/project/.ai/missions/20260324-103000/raw-api
```

`handoff-gate` 适用场景：

- 你想确认某个 step 结束后是否能安全进入下一步
- 你想排查 orchestrator 为什么停在当前阶段
- 你想单独验证 `bug.md` 是否已经足够进入 `step5`

`handoff-gate` 示例：

```text
请使用 /abs/path/to/project/.ai/dev-frontend/agents/fe-dev-orchestrator/prompts/handoff-gate.md

missionRoot: /abs/path/to/project/.ai/missions/20260324-103000
currentStep: step4-moduletest
candidateNextStep: step5-bug-fix
configPath: /abs/path/to/project/.ai/missions/20260324-103000/config.json
artifactSnapshot:
- bugDocs/bug.md 已存在
- bug.md 中已有 4 个 BUG-* 条目
- 其中 2 个为 OPEN，2 个为 FIXED
moduleSnapshot:
- src/modules/FundCalculation 存在
- 目标模块关键文件完整
userGoal: 这轮准备开始修复已登记的缺陷
```

## 阶段输入输出

- `step1-req-collect`
  - 输入：mission 路径 + 当前轮需求材料或 `reqDocs/` 原始材料；已有 `req.md` 时按增量规则更新
  - 输出：结构化 `reqDocs/req.md`、按需生成 `reqDocs/issues.md`，并在可确定时回写 `config.json.module`
  - 返回：仍存在 `[OPEN]` 澄清项，或 `module.name` 仍未确定时，使用 `DONE_WITH_CONCERNS`
- `step2-ui-dev`
  - 输入：`reqDocs/req.md` + `config.json` + 可用 UI 上下文
  - 输出：模块代码（`projectRoot/moduleRoot/{moduleName}`）
  - UI 上下文优先级：
    - orchestrator / 标准链路：`ui/component-mapping.md` -> `ui/` 原始素材 -> `reqDocs/req.md` 中已结构化的页面/交互描述
    - 直接调用 `step2-ui-dev` skill：`ui/component-mapping.md` -> `ui/` 原始素材 -> 当前轮文字描述 -> `reqDocs/req.md` 中已结构化的页面/交互描述
  - 规则：目标模块路径优先从 `config.json.module.name` 解析；若为空，则回退到 `reqDocs/req.md` 顶部 `模块名`；两者冲突或仍为空时返回 `NEEDS_CONTEXT`
  - 最小产物：模块入口、基础类型、必要 hooks、至少一个布局入口与作用域样式文件；`defs/service.ts` 仅允许保留 `step3-api-integrate` 可继续接手的占位实现
- `step3-api-integrate`
  - 输入：`apiDoc/api.md` + 目标模块代码 + `config.json`
  - 输出：`defs/service.ts` / `defs/type.ts` 等真实接口联调更新，以及接口差异记录
  - 规则：定位模块时优先使用 `config.json.module.name`，再校验 `api.md` 顶部 `- 模块名：`；必须记录接口风险；严禁对未定接口做静默 mock 伪装
- `step4-moduletest`
  - 输入：开发者或用户口头问题 + `config.json` 中的 `bugDocSources` + `reqDocs/req.md` + 模块代码 + 可选 `apiDoc/api.md`
  - 输出：`bugDocs/bug.md`，包含结构化 `BUG-*` 条目和顶部修复进度摘要
  - 规则：负责问题收集、来源收口和需求对码审查；不负责写测试用例，也不直接修代码
- `step5-bug-fix`
  - 输入：`bugDocs/bug.md` + 目标模块代码 + 可选 `reqDocs/req.md` / `apiDoc/api.md`
  - 输出：缺陷修复、定向回归结果，以及对 `bugDocs/bug.md` 的状态与进度回写
  - 规则：只处理已经登记的 `BUG-*`；新发现的问题应回到 `step4-moduletest` 先建档
