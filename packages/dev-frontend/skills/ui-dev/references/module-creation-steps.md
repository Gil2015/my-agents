# 模块创建步骤

创建新模块中每个文件的分步指南。请严格按照此顺序执行。

## 步骤 1：创建目录结构

```bash
MODULE_DIR="src/modules/{ModuleName}"
mkdir -p "$MODULE_DIR"/{defs,hooks,layouts/Default,components,__test__}
touch "$MODULE_DIR"/index.tsx
touch "$MODULE_DIR"/defs/{constant,type,service}.ts
touch "$MODULE_DIR"/hooks/{useData,useController,useWatcher,index}.ts
touch "$MODULE_DIR"/layouts/Default/{index.tsx,index.module.less}
touch "$MODULE_DIR"/__test__/{index.tsx,mock.ts}
```

## 步骤 2：`defs/constant.ts`

```typescript
/** 模块标识 — 用于路由、存储键等 */
export const MODULE_NAME = '{module-name}';

/** 模块的布局模式 */
export enum LayoutEnum {
  LIST = 'list',
  DETAIL = 'detail',
  EDIT = 'edit',
}

/**
 * 表格列定义
 * 根据模块的数据结构进行自定义
 */
export const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80,
  },
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
  },
];
```

根据实际需求调整列定义、枚举和常量。

## 步骤 3：`defs/type.ts`

```typescript
/** API 响应中的单条数据项 */
export interface I{ModuleName}Item {
  id: string;
  name: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  // 根据需求添加字段
}

/** 列表接口的查询参数 */
export interface I{ModuleName}Query {
  page: number;
  pageSize: number;
  keyword?: string;
  status?: number;
  // 根据需求添加筛选字段
}

/** 列表接口的 API 响应 */
export interface I{ModuleName}ListResponse {
  list: I{ModuleName}Item[];
  total: number;
}

/** useData Hook 暴露的数据 */
export interface I{ModuleName}Data {
  loading: boolean;
  list: I{ModuleName}Item[];
  total: number;
  query: I{ModuleName}Query;
  currentItem?: I{ModuleName}Item;
  layout: string;
}

/** useController Hook 暴露的控制器 */
export interface I{ModuleName}Controller {
  handleSearch: (values: Partial<I{ModuleName}Query>) => void;
  handleReset: () => void;
  handlePageChange: (page: number, pageSize: number) => void;
  handleView: (item: I{ModuleName}Item) => void;
  handleCreate: () => void;
  handleEdit: (item: I{ModuleName}Item) => void;
  handleDelete: (id: string) => void;
  handleSave: (values: Partial<I{ModuleName}Item>) => Promise<void>;
}
```

核心规则：在编写任何实现代码之前，必须先定义好所有类型。

## 步骤 4：`defs/service.ts`

```typescript
import request from '@/utils/request';
import type {
  I{ModuleName}Query,
  I{ModuleName}ListResponse,
  I{ModuleName}Item,
} from './type';

const BASE_URL = '/api/{module-path}';

/** 获取分页列表 */
export const get{ModuleName}List = (params: I{ModuleName}Query) =>
  request.get<I{ModuleName}ListResponse>(BASE_URL, { params });

/** 获取单条详情 */
export const get{ModuleName}Detail = (id: string) =>
  request.get<I{ModuleName}Item>(`${BASE_URL}/${id}`);

/** 新建数据项 */
export const create{ModuleName} = (data: Partial<I{ModuleName}Item>) =>
  request.post<I{ModuleName}Item>(BASE_URL, data);

/** 更新已有数据项 */
export const update{ModuleName} = (id: string, data: Partial<I{ModuleName}Item>) =>
  request.put<I{ModuleName}Item>(`${BASE_URL}/${id}`, data);

/** 删除数据项 */
export const delete{ModuleName} = (id: string) =>
  request.delete(`${BASE_URL}/${id}`);
```

注意：这些是占位代码。实际的 API 路径和参数会在 Phase 4（api-integrate）阶段填充。

## 步骤 5：`hooks/useData.ts`

完整模式详见 `hook-patterns.md`。要点：
- 使用 `useSetState` 管理查询状态
- 使用 `useRequest` 配合 `refreshDeps` 进行 API 调用
- 使用 `useCreation` 处理派生/计算值
- 返回布局所需的全部数据

## 步骤 6：`hooks/useController.ts`

完整模式详见 `hook-patterns.md`。要点：
- 接收数据的 setter 和 fetch 函数作为参数
- 每个处理函数都用 `useMemoizedFn` 包裹
- 异步操作（删除、保存）需正确处理 loading 状态

## 步骤 7：`hooks/useWatcher.ts`

完整模式详见 `hook-patterns.md`。要点：
- 使用 `useMount` 处理初始数据加载
- 使用 `useEffect` 响应外部变化（路由参数、全局状态）
- 即使内容为空，也要创建此文件以备将来使用

## 步骤 8：`hooks/index.ts`

```typescript
import useData from './useData';
import useController from './useController';
import useWatcher from './useWatcher';

const useModuleHooks = () => {
  const {
    loading, list, total, query, currentItem, layout,
    setQuery, setCurrentItem, setLayout, fetchList,
  } = useData();

  const controllers = useController({
    setQuery, setCurrentItem, setLayout, fetchList,
  });

  useWatcher({ fetchList, query });

  const _ = { loading, list, total, query, currentItem, layout };
  const $ = { ...controllers };

  return { _, $ };
};

export default useModuleHooks;
```

## 步骤 9：`layouts/Default/index.tsx`

完整模式详见 `layout-patterns.md`。要点：
- 纯展示组件 — 不使用任何 Hook
- 从 props 中解构 `_` 和 `$`
- 使用 `classNames` + CSS Modules
- 导入组件（项目组件或 npm 组件）

## 步骤 10：`layouts/Default/index.module.less`

```less
.container {
  padding: 16px;
  background: #fff;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.content {
  // 表格或主内容区域
}
```

## 步骤 11：`index.tsx`（模块入口）

```typescript
import Default from './layouts/Default';
import useModuleHooks from './hooks';

const {ModuleName} = () => {
  const { _, $ } = useModuleHooks();
  return <Default _={_} $={$} />;
};

export default {ModuleName};
```

## 步骤 12：`__test__/mock.ts`

```typescript
import Mock from 'mockjs';
import type { I{ModuleName}Item } from '../defs/type';

export const mockItem = (): I{ModuleName}Item =>
  Mock.mock({
    id: '@guid',
    name: '@ctitle(4, 8)',
    'status|1': [0, 1, 2],
    createdAt: '@datetime',
    updatedAt: '@datetime',
  });

export const mockList = (count = 10): I{ModuleName}Item[] =>
  Array.from({ length: count }, mockItem);
```

## 步骤 13：`__test__/index.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import {ModuleName} from '../index';

describe('{ModuleName}', () => {
  it('renders without crashing', () => {
    // 基础冒烟测试 — 详细测试在 Phase 5 中编写
    expect(true).toBe(true);
  });
});
```

详细测试在 Phase 5（module-test）阶段编写。
