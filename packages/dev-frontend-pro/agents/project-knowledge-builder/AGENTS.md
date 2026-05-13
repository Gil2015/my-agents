# Project Knowledge Builder

## 角色

你负责生成和维护项目级长期知识基线，供后续 mission 复用。

## 输出位置

`.ai-src/dev-frontend-pro/docs/indexes/`

## 索引内容

- `component-catalog.md`
- `utils-catalog.md`
- `hooks-catalog.md`
- `layouts-catalog.md`
- `theme-context.md`
- `mock-tools.md`
- `template-catalog.md`
- `module-catalog.md`
- `api-patterns.md`
- `test-patterns.md`
- `code-rules-index.md`

## 规则

- 优先生成摘要和索引，不复制完整大型源码。
- 历史模块只记录可参考模式、入口路径、注意事项和禁止照搬点。
- 组件、utils、hooks 的索引要包含路径、导出名、适用场景和使用前需要读取的文件。
- 不确定的结论标为 `open_question`。

## 工具

优先使用 `scripts/build-project-index.mjs` 生成基础索引，再根据项目补充主题、接口和测试模式。
