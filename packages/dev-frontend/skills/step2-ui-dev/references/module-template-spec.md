# 模块模板架构规范

每个前端模块必须遵循的标准目录结构和编码规范。

## 目录结构

```
src/modules/{ModuleName}/
├── index.tsx                    # 模块入口 — 导出默认组件
├── defs/
│   ├── constant.ts              # MODULE_NAME、枚举、列定义、静态配置
│   ├── type.ts                  # 本模块所有 TypeScript 类型
│   └── service.ts               # API 服务函数
├── hooks/
│   ├── useData.ts               # 数据状态 + API 请求
│   ├── useController.ts         # 事件处理器 + 业务逻辑
│   ├── useWatcher.ts            # 副作用（useEffect、useMount）
│   └── index.ts                 # 聚合 Hook，导出 _（数据）和 $（控制器）
├── layouts/
│   └── Default/
│       ├── index.tsx            # 布局组件（纯展示）
│       └── index.module.less    # CSS Modules 样式
├── components/                  # 模块内部组件（按需使用）
│   └── {ComponentName}/
│       ├── index.tsx
│       └── index.module.less
└── __test__/
    ├── index.tsx                # 测试入口
    └── mock.ts                  # Mock.js 数据生成器
```

## 文件详细规范

### `index.tsx` — 模块入口

```typescript
import Default from './layouts/Default';
import useModuleHooks from './hooks';

const {ModuleName} = () => {
  const { _, $ } = useModuleHooks();
  return <Default _={_} $={$} />;
};

export default {ModuleName};
```

关键规则：
- 单一职责：将 Hook 连接到布局
- 此文件中不得包含业务逻辑
- 不得直接管理状态

### `defs/constant.ts` — 常量定义

```typescript
// 模块标识
export const MODULE_NAME = '{module-name}';

// 布局枚举
export enum LayoutEnum {
  LIST = 'list',
  DETAIL = 'detail',
  EDIT = 'edit',
}

// 表格列定义
export const columns = [
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  // ...
];
```

### `defs/type.ts` — 类型定义

```typescript
// API 响应类型
export interface I{ModuleName}Item {
  id: string;
  name: string;
  // ...
}

// 列表查询参数
export interface I{ModuleName}Query {
  page: number;
  pageSize: number;
  keyword?: string;
  // ...
}

// API 响应包装类型
export interface I{ModuleName}ListResponse {
  list: I{ModuleName}Item[];
  total: number;
}

// Hook 数据类型（useData 的返回值）
export interface I{ModuleName}Data {
  loading: boolean;
  list: I{ModuleName}Item[];
  total: number;
  query: I{ModuleName}Query;
  // ...
}

// Hook 控制器类型（useController 的返回值）
export interface I{ModuleName}Controller {
  handleSearch: (values: Partial<I{ModuleName}Query>) => void;
  handlePageChange: (page: number, pageSize: number) => void;
  handleDelete: (id: string) => void;
  // ...
}
```

类型链规则：API 响应 → 数据类型 → 控制器类型 → 布局 Props。所有类型必须串联。

### `defs/service.ts` — API 服务

```typescript
import request from '@/utils/request';
import type { I{ModuleName}Query, I{ModuleName}ListResponse } from './type';

// 获取列表
export const get{ModuleName}List = (params: I{ModuleName}Query) =>
  request.get<I{ModuleName}ListResponse>('/api/{module}/list', { params });

// 获取详情
export const get{ModuleName}Detail = (id: string) =>
  request.get<I{ModuleName}Item>(`/api/{module}/${id}`);

// 新建
export const create{ModuleName} = (data: Partial<I{ModuleName}Item>) =>
  request.post('/api/{module}', data);

// 更新
export const update{ModuleName} = (id: string, data: Partial<I{ModuleName}Item>) =>
  request.put(`/api/{module}/${id}`, data);

// 删除
export const delete{ModuleName} = (id: string) =>
  request.delete(`/api/{module}/${id}`);
```

### `hooks/useData.ts` — 数据 Hook

```typescript
import { useSetState } from 'ahooks';
import { useRequest } from 'ahooks';
import { useCreation } from 'ahooks';
import { get{ModuleName}List } from '../defs/service';
import type { I{ModuleName}Data, I{ModuleName}Query } from '../defs/type';

const useData = () => {
  // 查询状态
  const [query, setQuery] = useSetState<I{ModuleName}Query>({
    page: 1,
    pageSize: 10,
  });

  // API 请求
  const { data, loading, run: fetchList } = useRequest(
    () => get{ModuleName}List(query),
    { refreshDeps: [query] }
  );

  // 通过 useCreation 实现派生/计算值
  const processedList = useCreation(
    () => data?.list?.map(item => ({ ...item, /* transform */ })) ?? [],
    [data?.list]
  );

  return {
    loading,
    list: processedList,
    total: data?.total ?? 0,
    query,
    setQuery,
    fetchList,
  };
};

export default useData;
```

规则：
- 复杂状态使用 `useSetState`（不用 useState）
- API 调用使用 `useRequest`（不用原始 useEffect + fetch）
- 计算值使用 `useCreation`（不用 useMemo）
- 以上全部来自 `ahooks` 库

### `hooks/useController.ts` — 控制器 Hook

```typescript
import { useMemoizedFn } from 'ahooks';
import type { I{ModuleName}Query } from '../defs/type';

interface UseControllerParams {
  setQuery: (patch: Partial<I{ModuleName}Query>) => void;
  fetchList: () => void;
}

const useController = ({ setQuery, fetchList }: UseControllerParams) => {
  const handleSearch = useMemoizedFn((values: Partial<I{ModuleName}Query>) => {
    setQuery({ ...values, page: 1 });
  });

  const handlePageChange = useMemoizedFn((page: number, pageSize: number) => {
    setQuery({ page, pageSize });
  });

  const handleDelete = useMemoizedFn(async (id: string) => {
    // await delete{ModuleName}(id);
    // fetchList();
  });

  return {
    handleSearch,
    handlePageChange,
    handleDelete,
  };
};

export default useController;
```

规则：
- 所有处理函数使用 `useMemoizedFn`（不用 useCallback）
- 通过参数接收来自 useData 的数据/设置器
- 纯逻辑，不涉及 UI 关注点

### `hooks/useWatcher.ts` — 副作用 Hook

```typescript
import { useEffect } from 'react';
import { useMount } from 'ahooks';

interface UseWatcherParams {
  fetchList: () => void;
  query: any;
}

const useWatcher = ({ fetchList, query }: UseWatcherParams) => {
  // 初始加载
  useMount(() => {
    fetchList();
  });

  // 监听外部变化
  useEffect(() => {
    // 响应路由参数、全局状态等变化
  }, [/* deps */]);
};

export default useWatcher;
```

### `hooks/index.ts` — Hook 聚合器

```typescript
import useData from './useData';
import useController from './useController';
import useWatcher from './useWatcher';

const useModuleHooks = () => {
  const dataResult = useData();
  const { loading, list, total, query, setQuery, fetchList } = dataResult;

  const controllers = useController({ setQuery, fetchList });

  useWatcher({ fetchList, query });

  // _ = 数据（只读值，用于展示）
  const _ = { loading, list, total, query };

  // $ = 控制器（事件处理器，用于交互）
  const $ = { ...controllers };

  return { _, $ };
};

export default useModuleHooks;
```

约定：`_` 代表数据，`$` 代表控制器。布局组件解构这两个 Props。

### `layouts/Default/index.tsx` — 布局组件

```typescript
import classNames from 'classnames';
import styles from './index.module.less';
import type { I{ModuleName}Data, I{ModuleName}Controller } from '../../defs/type';

interface DefaultLayoutProps {
  _: I{ModuleName}Data;
  $: I{ModuleName}Controller;
}

const Default: React.FC<DefaultLayoutProps> = ({ _, $ }) => {
  return (
    <div className={classNames(styles.container)}>
      {/* 纯展示 — 使用 _ 获取数据，使用 $ 绑定事件处理器 */}
    </div>
  );
};

export default Default;
```

规则：
- 纯展示 — 不得使用 Hook、不得有状态、不得包含逻辑
- 通过 Props 接收 `_`（数据）和 `$`（控制器）
- 使用 `classNames` + CSS Modules 进行样式处理
- 所有样式写在同目录的 `.module.less` 文件中

## 命名规范

| 项目 | 规范 | 示例 |
|------|------|------|
| 模块目录 | PascalCase | `FundCalculation/` |
| Hook 文件 | camelCase，以 `use` 为前缀 | `useData.ts` |
| 类型接口 | `I` + PascalCase | `IFundItem` |
| 常量 | UPPER_SNAKE_CASE | `MODULE_NAME` |
| 枚举 | PascalCase | `LayoutEnum` |
| CSS 类名 | camelCase（在 .module.less 中） | `.container`、`.listWrapper` |
| Service 函数 | camelCase，以动词为前缀 | `getFundList`、`deleteFund` |

## 验证清单

- [ ] 所有目录和文件匹配模板结构
- [ ] `index.tsx` 仅连接 Hook 和布局（无逻辑）
- [ ] 所有 Hook 使用 ahooks（`useSetState`、`useRequest`、`useCreation`、`useMemoizedFn`、`useMount`）
- [ ] 类型链完整：API → 数据 → 控制器 → 布局 Props
- [ ] 布局为纯展示（无 Hook、无状态）
- [ ] CSS 使用 Modules（`.module.less`）配合 `classNames`
- [ ] 遵循 `_` 代表数据、`$` 代表控制器的约定
- [ ] 不使用 `useState`、`useCallback`、`useMemo` — 使用 ahooks 等价物
