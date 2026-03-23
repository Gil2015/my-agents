# .ai/ 文档约定

`.ai/` 目录作为每个项目中的 AI 工作区，存储在各开发阶段之间流转的结构化文档。

## 目录结构

```
{project-root}/.ai/
├── requirements/
│   ├── {module}.req.md          # 结构化需求文档
│   └── {module}.issues.md       # 需求疑问/歧义记录
├── designs/
│   └── {module}/
│       ├── mockups/             # UI 设计稿图片（手动放入）
│       └── component-mapping.md # 设计稿 → 组件映射
├── api-docs/
│   └── {module}.api.md          # 结构化接口文档
└── test-reports/
    ├── {module}.report.md       # 测试报告
    └── {module}.bugs.md         # 缺陷列表（由开发者标记，供 AI 修复）
```

## 各阶段读写规则

| 阶段 | 读取 | 写入 |
|------|------|------|
| Phase 1：req-collect | 外部 URL（禅道/飞书） | `requirements/{module}.req.md`、`requirements/{module}.issues.md` |
| Phase 2：UI 审计 | `requirements/{module}.req.md`、`designs/{module}/mockups/*` | `designs/{module}/component-mapping.md` |
| Phase 3：ui-dev | `requirements/{module}.req.md`、`designs/{module}/component-mapping.md` | `src/modules/{module}/`（代码，非 .ai/） |
| Phase 4：api-integrate | `api-docs/{module}.api.md` 或外部 URL | `src/modules/{module}/defs/`（service.ts、type.ts）、`__test__/mock.ts` |
| Phase 5：module-test | `requirements/{module}.req.md`、源代码 | `test-reports/{module}.report.md` |
| Phase 6：bug-fix | `test-reports/{module}.bugs.md`、源代码 | 源代码修复，更新 `test-reports/{module}.report.md` |

## 模块命名约定

`{module}` 占位符在 `.ai/` 文档中统一使用 kebab-case：

- `src/` 中的模块目录：PascalCase（例如 `FundCalculation`）
- `.ai/` 中的模块名：kebab-case（例如 `fund-calculation`）
- 转换规则：`FundCalculation` → `fund-calculation`

## 文档生命周期

### 创建

- 文档由对应阶段的技能负责创建
- 如果文档已存在，技能应先读取再更新/追加，而非覆盖
- 始终包含日期头信息以便追溯

### 更新

- Phase 5（测试）在执行测试时更新 `{module}.report.md`
- Phase 6（缺陷修复）同时更新 `{module}.report.md`（状态变更）和源代码
- 重新执行 Phase 1 应合并新需求，而非覆盖已有内容

### 清理

- `.ai/` 文档是项目产物 — 不要自动删除
- 它们作为审计记录和未来开发的上下文

## Git 约定

建议添加到 `.gitignore` 的内容：
```
# AI 工作区 - 是否纳入版本管理可选
# .ai/
```

是否将 `.ai/` 纳入 Git 管理由团队决定：
- **纳入管理**：保留开发上下文，便于工作交接
- **忽略**：保持仓库整洁，文档可重新生成
