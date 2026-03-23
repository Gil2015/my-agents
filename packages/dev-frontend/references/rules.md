# 业务侧及工程侧代码规则提示 (Rules)

在进行前端 UI 开发时，必须严格遵守以下代码组织规则和模式。本规则文档是对 `./module-template` 模板的详细补充，涵盖了架构规范、Hook 模式、布局模式等核心约束。

## 1. 核心架构约束

**违背规则的字面意义，就是违背规则的精神。**
每个前端模块必须遵循标准的目录结构和编码规范。

### ahooks 映射表（强制执行）
禁止使用 React 内置的部分 Hook，必须使用 `ahooks` 的等价物：
| React 内置 Hook | ahooks 替代方案 | 原因 |
|---------------|-------------------|-----|
| `useState` | `useSetState` | 支持类似类组件的局部状态更新 |
| `useCallback` | `useMemoizedFn` | 引用稳定，无需依赖数组 |
| `useMemo` | `useCreation` | 避免不必要的重复计算 |
| `useEffect`（挂载时） | `useMount` | 更简洁，无需空依赖数组 |
| 在 useEffect 中手动请求 | `useRequest` | 内置 loading、错误处理、缓存、重试 |

---

## 2. 详细文件规范与模式

### `index.tsx` — 模块入口
- **单一职责**：仅负责将 Hook 连接到布局。
- **禁止逻辑**：此文件中不得包含业务逻辑，不得直接管理状态。

### `defs/` 目录 — 静态定义
1. **`constant.ts`**：定义 `MODULE_NAME`、枚举（如 `LayoutEnum`）、表格列定义 `columns` 等静态配置。
2. **`type.ts`**：必须构建**完整的类型链**：API 响应 → 数据类型（`IData`） → 控制器类型（`IController`） → 布局 Props。
3. **`service.ts`**：存放所有的 API 请求函数桩。

### `hooks/` 目录 — Hook 模式（三层分离）
必须严格遵循依赖流向：`useData` → `useController` → `useWatcher` → `index.ts`。

1. **`useData.ts` (数据状态 + 请求)**
   - 使用 `useSetState` 分组管理查询参数和 UI 状态。
   - 使用 `useRequest` 配合 `refreshDeps` 进行 API 自动请求。
   - 使用 `useCreation` 派生或处理计算数据。
   - 必须向外暴露数据及 setter 函数。
2. **`useController.ts` (事件处理 + 业务逻辑)**
   - 通过参数接收来自 `useData` 的数据或 setter，**不直接导入状态**。
   - 所有事件处理函数（如 `handleSearch`, `handleDelete`）必须用 `useMemoizedFn` 包裹。
3. **`useWatcher.ts` (副作用)**
   - 使用 `useMount` 替代 `useEffect(..., [])`。
   - `useEffect` 仅用于响应外部变化（如路由参数、全局状态）。
   - **不要在此处进行数据请求**，数据请求属于 `useData`。
   - 即使无副作用也必须保留此空文件，表示“目前无副作用”。
4. **`index.ts` (Hook 聚合器)**
   - 聚合上述三个 Hook，导出 `_` 和 `$`：
     - `_`（数据）：只读的展示数据，传给布局。
     - `$`（控制器）：事件处理函数，传给布局。

### `layouts/` 目录 — 布局模式
布局组件（如 `Default/index.tsx`）是**纯展示组件**。

1. **禁止使用 Hook**：布局组件中绝不调用 `useState`、`useEffect` 或任何 Hook。
2. **禁止业务逻辑**：所有逻辑都在 `useController` 中处理，简单的格式化除外。
3. **仅通过 Props 接收**：只接收 `_`（数据）和 `$`（控制器）作为 props。
4. **CSS Modules**：所有样式必须通过 `.module.less` 配合 `classnames` 库实现，禁止全局样式污染。

---

## 3. 命名规范

| 项目 | 规范 | 示例 |
|------|------|------|
| 模块目录 | PascalCase | `FundCalculation/` |
| Hook 文件 | camelCase，以 `use` 为前缀 | `useData.ts` |
| 类型接口 | `I` + PascalCase | `IFundItem` |
| 常量 | UPPER_SNAKE_CASE | `MODULE_NAME` |
| 枚举 | PascalCase | `LayoutEnum` |
| CSS 类名 | camelCase（在 .module.less 中） | `.container`、`.listWrapper` |
| Service 函数 | camelCase，以动词为前缀 | `getFundList`、`deleteFund` |

---

## 4. 最终验证清单

完成模块开发后，必须对照以下清单进行检查：

- [ ] 所有目录和文件是否匹配模板结构（参考 `./module-template`）？
- [ ] `index.tsx` 是否仅负责连接 Hook 和布局（无逻辑）？
- [ ] 是否所有 Hook 都使用了 ahooks（`useSetState`, `useRequest`, `useCreation`, `useMemoizedFn`, `useMount`）？
- [ ] 布局是否为纯展示组件（无 Hook、无状态）？
- [ ] CSS 是否使用了 Modules（`.module.less`）并配合 `classNames`？
- [ ] 是否严格遵循了 `_` 代表数据、`$` 代表控制器的传参约定？
- [ ] 是否已杜绝使用 `useState`、`useCallback`、`useMemo`？
