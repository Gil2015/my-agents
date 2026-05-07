# GZ 业务模块模板规则

## 适用范围

本规则用于审查和修正基于 `gz-module` 复制出来的业务模块。该模板使用 Zustand 作为模块级共享状态方案，并通过 `createModule(..., store: moduleStore)` 将状态源暴露给页面或其它业务模块。

## 目录结构

目标模块必须保持模板的分层结构：

```text
{module}/
├── index.tsx
├── defs/
│   ├── constant.ts
│   ├── service.ts
│   └── type.ts
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

`components/` 是按需目录；如果存在本地组件，必须有 `components/index.ts` 统一导出。不要在模板根目录新增独立 `store.ts`，模块级 store 定义在 `defs/constant.ts`。

## 模块入口

`index.tsx` 只负责模块组装：

- 从 `../../utils` 引入 `createModule`。
- 从 `defs/constant` 引入 `MODULE_NAME` 和 `moduleStore`。
- 引入 `useHooks`、`layouts`、`ModuleRef`、`Props`。
- `createModule<ModuleRef, Props>` 必须传入 `displayName`、`layouts`、`useHooks`。
- 如果模块保留跨组件共享状态，必须传入 `store: moduleStore`。
- 不在入口文件写请求、状态、事件处理或布局逻辑。

## defs 规则

### constant.ts

- `MODULE_NAME` 必须替换为真实英文模块名，不允许保留 `__MODULE_NAME_EN__`。
- `LayoutEnum` 至少保留 `Default = 'default'`，新增布局时同步更新 `layouts/index.ts`。
- Zustand 模板的共享状态必须定义为：

```ts
export const moduleStore = create<ScopeState>(() => ({
  // initial state
}));
```

- `moduleStore` 的类型来源必须是 `ScopeState`。
- 不要使用 Jotai 的 `atom`、`moduleAtom`、`useAtomState`。
- 如果模块不需要跨组件共享状态，可以删除 `moduleStore`，但必须同步删除入口的 `store` 参数和 `useData` 中的 `useZustandState` 用法。

### type.ts

- 类型命名使用首字母大写驼峰。
- 保持类型链完整：`Props -> DataParams -> CtrlParams -> WatcherParams -> LayoutProps`。
- `Props` 默认继承 `ModuleProps<ModuleActions, ModuleDepStores>`。
- 对外回调用 `ModuleActions`，命令式方法用 `ModuleRef`。
- 模块本地数据写在 `DataState`。
- 跨组件共享状态写在 `ScopeState`，并由 `constant.ts` 中的 `moduleStore` 初始化。
- 外部注入 store 写在 `ModuleDepStores`，默认字段为 `scopeStore?: ModuleStore<ScopeState & { [key: string]: any }>`。
- 不要在最顶层 `Props` 之外随意新增平行入参类型；确实需要初始化额外对象时，通过 `AddInitProps` 并接入 `DataParams`。

### service.ts

- 只定义当前模块的接口服务。
- 使用当前项目模板里的 `http` 封装，不在布局或 controller 中直接拼请求。
- 示例 `queryExample` 必须在真实业务落地时替换或删除。

## Hook 分层

### hooks/index.ts

- 统一编排 `useData -> useController -> useWatcher`。
- `commonProps` 聚合 props 和本 hook 初始化出的对象，再传给其它 hook。
- `useImperativeHandle` 只暴露 `ModuleRef` 中声明的方法。
- 如果依赖 `controllers` 中的方法，方法应由 `useMemoizedFn` 包裹，`useImperativeHandle` 依赖数组可以保持 `[]`。

### useData.ts

- 负责模块数据、请求、派生数据和模块级共享状态读取。
- Zustand 共享状态使用：

```ts
const scopeStore = p.stores?.scopeStore ?? moduleStore;
const [scopeState, setScopeState] = useZustandState(scopeStore, MODULE_NAME);
```

- 如果当前模块消费其它模块的业务流状态，优先由页面或编排层通过 `p.stores.scopeStore` 注入。
- 本地模块数据优先使用 `useSetState<DataState>`。
- `useRequest` 定义请求入口；请求成功后只更新 `dataState` 或 `scopeState`，不要直接操作布局。
- 返回值应展开 `dataState`，并返回 `setDataState`、请求触发函数、必要的 `scopeState/setScopeState`。

### useController.ts

- 负责事件处理和业务动作。
- 使用 `useMemoizedFn` 包裹对外暴露或传给布局的函数。
- 通过 `CtrlParams` 接收 `data`，不要绕过参数链直接 import `useData`。
- 可以触发 `p.actions` 中的对外回调。
- 不直接定义接口请求；请求入口应来自 `data`。

### useWatcher.ts

- 只负责初始化、监听和副作用。
- 通过 `WatcherParams` 接收 `data` 和 `controllers`。
- 不承载主要业务动作，不直接写大段请求逻辑。

## 布局与组件

- `layouts/index.ts` 必须维护 `LayoutEnum -> Layout Component` 映射。
- `layouts/Default/index.tsx` 是展示层，只消费 `data`、`controllers` 和展示相关 props。
- 布局层不直接 import service，不直接读写 Zustand store，不持有业务状态。
- 样式文件统一命名为 `style.module.less`。
- 本地组件保持展示职责；需要业务动作时通过 props 接收，不向上 import hook 或 service。

## 状态解耦约定

- `moduleStore` 是该模块默认共享状态源。
- `createModule` 返回的组件通过 `.store` 暴露该状态源。
- 其它模块如需复用该业务流状态，应优先由页面或编排层通过 `stores` 注入，避免业务模块之间硬编码耦合。
- 项目侧 `createModule` 和全局类型需要支持 `.store`、`stores`、`ModuleStore`。参考仓库根 `references/createModule.ts`、`references/module.d.ts`、`references/useZustandState.ts`。

## 禁用和清理项

创建或 review 完成后不得保留：

- `__MODULE_NAME_EN__`
- `__MODULE_NAME__`
- 未替换的 `queryExample`
- 未替换的 `exampleFn`
- 未替换的 `ExampleChildComponent`
- 与真实业务无关的示例回调、示例接口、示例数据
- `atom`、`moduleAtom`、`useAtomState` 等 Jotai 写法
- 模板根目录的独立 `store.ts`
- 布局层直接请求或直接读写 Zustand store

## 自检命令

```bash
find "{targetModulePath}" -maxdepth 4 -type f | sort
rg -n "__MODULE_NAME_EN__|__MODULE_NAME__|queryExample|exampleFn|ExampleChildComponent" "{targetModulePath}"
rg -n "moduleStore|useZustandState|\\.store|p\\.stores" "{targetModulePath}"
rg -n "moduleAtom|useAtomState|from ['\\\"]jotai['\\\"]" "{targetModulePath}"
```
