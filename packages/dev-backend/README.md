# @gai/dev-backend

面向 NestJS 后端完整开发流程的 skill 包，采用 mission 工作区模型：每次任务独立存放在 `.ai/missions/{missionId}`，可与 `@gai/dev-frontend` 共用同一 mission。

## 核心原则

- 可与 `dev-frontend` 共用 mission 工作区；后端 skills 直接读取前端产物（`apiDoc/api.md`、`reqDocs/req.md`）
- NestJS 模块模板驱动，先对齐分层再写实现
- 前端契约是起点，后端设计是补全
- `config.json.backend.moduleName` 标识后端模块；`config.json.module.name` 标识前端模块

## 目录结构

```text
packages/dev-backend/
├── README.md
├── package.json
├── references/
│   ├── doc-templates/
│   │   ├── api-design-doc-template.md
│   │   ├── db-schema-doc-template.md
│   │   └── bug-doc-template.md
│   ├── module-template/
│   │   ├── __module-name__.module.ts
│   │   ├── __module-name__.controller.ts
│   │   ├── __module-name__.service.ts
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── vo/
│   │   ├── constants/
│   │   └── __test__/
│   └── rules/
│       ├── common-rules.md
│       └── nestjs-code-rules.md
├── scripts/
│   └── create-mission.sh
└── skills/
    ├── project-context-build/     # 独立可选 skill
    ├── step1-api-design/
    ├── step2-db-design/
    ├── step3-module-dev/
    ├── step4-moduletest/
    └── step5-bug-fix/
```

说明：

- 标准流程为：`step1-api-design` → `step2-db-design` → `step3-module-dev` → `step4-moduletest` → `step5-bug-fix`，但允许按需跳步和断点续跑。
- `project-context-build` 是独立可选 skill，不进入 step 排序。
- 目录名带 `stepX-` 前缀用于流程排序。

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
  "backend": {
    "moduleRoot": "src/modules",
    "orm": "",
    "database": "",
    "moduleName": ""
  },
  "source": {
    "type": "manual",
    "notes": ""
  },
  "reqDocSources": [],
  "apiDocSources": [],
  "apiDesignSources": [],
  "dbDesignSources": [],
  "bugDocSources": [],
  "mission": {
    "id": "20260330-134500",
    "createdAt": "2026-03-30T05:45:00Z"
  }
}
```

后端新增字段说明：

- `backend.moduleRoot`：后端模块根目录，默认 `src/modules`
- `backend.orm`：ORM 类型（`typeorm` / `prisma` / `sequelize`）
- `backend.database`：数据库类型（`postgresql` / `mysql` / `sqlite`）
- `backend.moduleName`：后端业务模块目录名（kebab-case）
- `apiDesignSources`：后端 API 设计来源
- `dbDesignSources`：数据库设计来源

## Mission 目录规范

各 step 执行后会按需扩展为：

```text
.ai/missions/{missionId}/
├── config.json
├── reqDocs/        # step1(前端) 产物，后端可读取
├── apiDoc/         # step3(前端) 产物，后端可读取
├── apiDesign/      # step1(后端) 首次生成
├── dbDesign/       # step2(后端) 首次生成
└── bugDocs/        # step4 / step5 首次生成
```

## 推荐调用方式

### 1) 初始化 mission

```sh
sh .ai/dev-backend/scripts/create-mission.sh
```

### 2) 可选：先提取项目架构上下文

```text
/abs/path/to/project/.ai/dev-backend/skills/project-context-build/SKILL.md
```

### 3) 标准开发流程

```text
step1-api-design → step2-db-design → step3-module-dev → step4-moduletest → step5-bug-fix
```

常见路由示例：

| 当前目标                      | 常见路由                        |
| ----------------------------- | ------------------------------- |
| 基于前端接口文档开发后端      | `step1 → step2 → step3`         |
| 先沉淀项目架构规范            | `project-context-build → step1` |
| 已有 API 设计，直接建表和开发 | `step2 → step3`                 |
| 模块已开发好，审查和修复      | `step4 → step5`                 |
| 已有 bug.md，继续修历史问题   | `step5`                         |

## 阶段输入输出

- `project-context-build`（独立可选）
  - 输入：项目代码 + 开发者补充
  - 输出：`{projectRoot}/.ai/docs/backend-context.md`

- `step1-api-design`
  - 输入：前端 `apiDoc/api.md` + `reqDocs/req.md` + `backend-context.md`
  - 输出：`.ai/missions/{missionId}/apiDesign/api-design.md`

- `step2-db-design`
  - 输入：`apiDesign/api-design.md` + `reqDocs/req.md` + `backend-context.md`
  - 输出：`.ai/missions/{missionId}/dbDesign/db-schema.md`

- `step3-module-dev`
  - 输入：`api-design.md` + `db-schema.md` + `backend-context.md`
  - 输出：NestJS 模块代码（`projectRoot/backend.moduleRoot/{moduleName}`）

- `step4-moduletest`
  - 输入：`api-design.md` + `db-schema.md` + 模块代码 + 用户反馈
  - 输出：`bugDocs/bug.md`

- `step5-bug-fix`
  - 输入：`bugDocs/bug.md` + 模块代码
  - 输出：代码修复 + `bugDocs/bug.md` 状态更新
