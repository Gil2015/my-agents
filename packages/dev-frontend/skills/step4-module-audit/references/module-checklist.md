# 模块规范检查清单

用于审计“已完成业务模块”是否符合模板规范。每条规则都要给出 `PASS` / `FAIL`。

## 基线来源

默认使用 `skills/module-audit/baselines/` 作为审计基线：
- `baselines/module-template/`
- `baselines/module-examples/`

若内置基线缺失，才回退到外部路径（如 `other-projects/`）。

## 1. 阻断级规则（必须通过）

### 1.1 目录结构

目标模块至少包含：

```text
{Module}/
├── index.tsx
├── defs/
│   ├── constant.ts
│   ├── type.ts
│   └── service.ts
├── hooks/
│   ├── index.ts
│   ├── useData.ts
│   ├── useController.ts
│   └── useWatcher.ts
├── layouts/
│   ├── index.ts
│   └── Default/
│       ├── index.tsx
│       └── style.module.less
├── __test__/
│   ├── index.tsx
│   └── mock.ts
└── utils.ts
```

说明：
- `components/` 是按需目录，可不存在。
- 如果存在 `components/`，应有 `components/index.ts` 聚合导出。

### 1.2 入口文件 `index.tsx`

必须满足：
- 使用 `createModule<ModuleRef, Props>(...)`
- `displayName` 使用 `MODULE_NAME`
- 传入 `layouts` 与 `useHooks`
- 对外 `export type { ModuleRef, Props }`

### 1.3 类型链路 `defs/type.ts`

必须包含并可连通：
- `ModuleRef`
- `Props`
- `DataParams`
- `CtrlParams`
- `WatcherParams`
- `LayoutProps`
- `DataState`

且 `CtrlParams` 依赖 `ReturnType<typeof useData>`，`WatcherParams` 依赖 `ReturnType<typeof useController>`。

### 1.4 Hook 调用链 `hooks/index.ts`

必须保持顺序：

```text
useData -> useController -> useWatcher
```

并保持契约：
- `useController` 接收 `data`
- `useWatcher` 接收 `data` 与 `controllers`
- 返回值包含 `data`、`controllers`（以及必要 ref）

### 1.5 布局映射

- `layouts/index.ts` 必须存在 `LayoutEnum.Default -> Default` 映射
- `layouts/Default/index.tsx` 导入样式文件名必须为 `style.module.less`

### 1.6 模板占位残留

禁止残留以下模板占位或示例符号（除注释说明业务场景外）：

```text
__MODULE_NAME__
__MODULE_NAME_EN__
exampleFn
queryExample
ExampleChildComponent
```

## 2. 重要级规则（建议通过）

### 2.1 `defs/constant.ts`

建议满足：
- `MODULE_NAME` 为真实业务值，不是占位词
- `LayoutEnum` 至少包含 `Default = 'default'`

### 2.2 `defs/service.ts`

建议满足：
- 统一 `export const services = { ... }`
- 服务命名与业务动作语义一致
- HTTP 调用集中在 service 层，不在 layout 中直接发请求

### 2.3 `hooks/useData.ts`

建议满足：
- 使用 `useSetState` 管理模块数据
- 接口请求使用 `useRequest`
- 对布局暴露稳定的数据与 run 函数

### 2.4 `hooks/useController.ts`

建议满足：
- 事件函数使用 `useMemoizedFn`
- 业务动作从 `data` 中读取 run 方法，不跨层直接操作布局

### 2.5 `hooks/useWatcher.ts`

建议满足：
- 使用 `useMount` 或 `useEffect` 管理初始化/监听逻辑
- 文件可为空实现，但文件不能缺失

### 2.6 布局层职责

建议满足：
- 布局只消费 `data` 和 `controllers`
- 不在布局层直接写请求逻辑
- 样式使用 CSS Modules（`style.module.less`）

## 3. 快速扫描命令

```bash
# 扫描模板占位符
rg -n "__MODULE_NAME__|__MODULE_NAME_EN__|exampleFn|queryExample|ExampleChildComponent" src/modules/{module}

# 检查核心文件是否存在
for f in \
  index.tsx defs/constant.ts defs/type.ts defs/service.ts \
  hooks/index.ts hooks/useData.ts hooks/useController.ts hooks/useWatcher.ts \
  layouts/index.ts layouts/Default/index.tsx layouts/Default/style.module.less \
  __test__/index.tsx __test__/mock.ts utils.ts; do
  test -f "src/modules/{module}/$f" || echo "MISSING: $f"
done
```

## 4. 输出格式建议

每次审计建议输出以下结构：

```markdown
## Audit Result: {module}

### Blocking
- [PASS] ...
- [FAIL] ...

### Important
- [PASS] ...
- [FAIL] ...

### Fixed
- file: xxx, change: xxx

### Need Manual Confirm
- file: xxx, reason: xxx
```
