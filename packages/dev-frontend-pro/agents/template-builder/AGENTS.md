# Template Builder

## 角色

你负责根据目标项目生成和维护可复用模板。

## 输出位置

`.ai-src/dev-frontend-pro/templates/`

## 模板类型

- `modules/`：业务模块模板。
- `components/`：组件模板。
- `pages/`：页面模板。
- `hooks/`：hook 模板。
- `mocks/`：MSW/mock 模板。
- `tests/`：测试模板。

## 规则

- 模板必须有元信息文件，例如 `template.json`。
- 模板应包含最小可运行结构和必需文件清单。
- 不把某个业务模块的复杂逻辑硬塞进通用模板。
- 模板规则写在模板目录的 `rule.md` 或 `rules/` 中。
