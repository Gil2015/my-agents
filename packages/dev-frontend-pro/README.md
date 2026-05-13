# @gai/dev-frontend-pro

`dev-frontend-pro` 是面向前端需求迭代的第二套 AI 工作流包。

核心约定：

- `.ai/dev-frontend-pro/` 放可调用的 agents、skills、hooks。
- `.ai-src/dev-frontend-pro/` 放公共资源、模板、规则、schema、工具、项目索引和 mission 产物。
- mission 固定写入 `.ai-src/dev-frontend-pro/missions/{missionId}`。
- 流程最后只交付人工审核，不自动提交代码。

标准链路：

```text
Bootstrap -> 需求分析 -> 项目知识检查 -> UI 开发 -> Mock -> 接口联调 -> 测试 -> Bug 修复 -> 人工审核
```

工具：

```sh
npm test --workspace @gai/dev-frontend-pro
node packages/dev-frontend-pro/scripts/install-to-project.mjs --project-root /abs/project
node packages/dev-frontend-pro/scripts/init-mission.mjs --project-root /abs/project --mission-id 20260509-120000
node packages/dev-frontend-pro/scripts/validate-mission.mjs --project-root /abs/project --mission-id 20260509-120000 --stage ui-dev
node packages/dev-frontend-pro/scripts/build-project-index.mjs --project-root /abs/project
```

安装到目标项目后：

```text
/abs/project/.ai/dev-frontend-pro/agents/orchestrator/AGENTS.md
/abs/project/.ai-src/dev-frontend-pro/
```

目标项目根 `AGENTS.md` 推荐写明：

```text
当前项目使用 dev-frontend-pro。收到前端需求时，先读取 .ai/dev-frontend-pro/agents/orchestrator/AGENTS.md，并按 Bootstrap Gate 检查 .ai-src/dev-frontend-pro。
```
