# Hook 模式

三个 Hook 的标准模式：useData、useController、useWatcher。

## 核心规则

1. **只使用 ahooks** — 不使用 React 内置的状态/记忆化 Hook
2. **依赖流向**：useData → useController → useWatcher → index.ts
3. **单一职责**：数据获取在 useData，事件处理在 useController，副作用在 useWatcher

## ahooks 映射表

| React 内置 Hook | ahooks 替代方案 | 原因 |
|---------------|-------------------|-----|
| `useState` | `useSetState` | 支持类似类组件的局部状态更新 |
| `useCallback` | `useMemoizedFn` | 引用稳定，无需依赖数组 |
| `useMemo` | `useCreation` | 避免不必要的重复计算 |
| `useEffect`（挂载时） | `useMount` | 更简洁，无需空依赖数组 |
| 在 useEffect 中手动请求 | `useRequest` | 内置 loading、错误处理、缓存、重试 |

## 模式 1：useData — 数据状态 + 请求

```typescript
import { useSetState, useRequest, useCreation } from 'ahooks';
import { get{ModuleName}List } from '../defs/service';
import type { I{ModuleName}Query, I{ModuleName}Item } from '../defs/type';

const DEFAULT_QUERY: I{ModuleName}Query = {
  page: 1,
  pageSize: 10,
};

const useData = () => {
  // === 状态 ===
  const [query, setQuery] = useSetState<I{ModuleName}Query>(DEFAULT_QUERY);
  const [extra, setExtra] = useSetState({
    currentItem: undefined as I{ModuleName}Item | undefined,
    layout: 'list',
  });

  // === API 请求 ===
  const {
    data: listData,
    loading,
    run: fetchList,
  } = useRequest(() => get{ModuleName}List(query), {
    refreshDeps: [query],
  });

  // === 派生值 ===
  const processedList = useCreation(
    () =>
      listData?.list?.map((item) => ({
        ...item,
        // 按需添加计算字段
      })) ?? [],
    [listData?.list],
  );

  return {
    // 数据
    loading,
    list: processedList,
    total: listData?.total ?? 0,
    query,
    currentItem: extra.currentItem,
    layout: extra.layout,
    // Setter（传递给 useController）
    setQuery,
    setCurrentItem: (item?: I{ModuleName}Item) => setExtra({ currentItem: item }),
    setLayout: (layout: string) => setExtra({ layout }),
    fetchList,
  };
};

export default useData;
```

### 要点

- `useSetState` 用于分组状态（查询参数、UI 状态）
- `useRequest` 配合 `refreshDeps` 实现自动重新请求
- `useCreation` 用于派生数据（列表转换、计算值）
- 同时返回数据和 setter（setter 传递给 useController）

### 变体

**多个 API 调用：**
```typescript
const { data: listData, loading: listLoading, run: fetchList } = useRequest(...);
const { data: statsData, loading: statsLoading, run: fetchStats } = useRequest(...);
```

**手动触发（不自动请求）：**
```typescript
const { run: deleteItem, loading: deleteLoading } = useRequest(
  (id: string) => delete{ModuleName}(id),
  { manual: true }
);
```

## 模式 2：useController — 事件处理

```typescript
import { useMemoizedFn } from 'ahooks';
import { message, Modal } from 'antd';
import { delete{ModuleName} } from '../defs/service';
import type { I{ModuleName}Query, I{ModuleName}Item } from '../defs/type';

interface UseControllerParams {
  setQuery: (patch: Partial<I{ModuleName}Query>) => void;
  setCurrentItem: (item?: I{ModuleName}Item) => void;
  setLayout: (layout: string) => void;
  fetchList: () => void;
}

const useController = ({
  setQuery,
  setCurrentItem,
  setLayout,
  fetchList,
}: UseControllerParams) => {
  /** 筛选搜索 — 重置到第 1 页 */
  const handleSearch = useMemoizedFn(
    (values: Partial<I{ModuleName}Query>) => {
      setQuery({ ...values, page: 1 });
    },
  );

  /** 重置筛选条件为默认值 */
  const handleReset = useMemoizedFn(() => {
    setQuery({ page: 1, pageSize: 10, keyword: undefined, status: undefined });
  });

  /** 分页变更 */
  const handlePageChange = useMemoizedFn((page: number, pageSize: number) => {
    setQuery({ page, pageSize });
  });

  /** 查看详情 */
  const handleView = useMemoizedFn((item: I{ModuleName}Item) => {
    setCurrentItem(item);
    setLayout('detail');
  });

  /** 打开新建表单 */
  const handleCreate = useMemoizedFn(() => {
    setCurrentItem(undefined);
    setLayout('edit');
  });

  /** 打开编辑表单 */
  const handleEdit = useMemoizedFn((item: I{ModuleName}Item) => {
    setCurrentItem(item);
    setLayout('edit');
  });

  /** 确认后删除 */
  const handleDelete = useMemoizedFn((id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后不可恢复，确认要删除吗？',
      onOk: async () => {
        await delete{ModuleName}(id);
        message.success('删除成功');
        fetchList();
      },
    });
  });

  /** 保存（新建或更新） */
  const handleSave = useMemoizedFn(async (values: Partial<I{ModuleName}Item>) => {
    // 具体实现取决于是新建还是更新
    // 在 api-integrate 阶段填充
    message.success('保存成功');
    setLayout('list');
    fetchList();
  });

  return {
    handleSearch,
    handleReset,
    handlePageChange,
    handleView,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSave,
  };
};

export default useController;
```

### 要点

- 每个处理函数都用 `useMemoizedFn` 包裹（引用稳定，无需依赖数组）
- 通过参数接收 useData 的 setter/fetcher（不直接导入）
- 处理用户反馈（message 提示、Modal.confirm 确认框）
- 异步操作使用 async/await

## 模式 3：useWatcher — 副作用

```typescript
import { useEffect } from 'react';
import { useMount } from 'ahooks';

interface UseWatcherParams {
  fetchList: () => void;
  query: any;
}

const useWatcher = ({ fetchList, query }: UseWatcherParams) => {
  // 初始加载（仅在挂载时执行一次）
  useMount(() => {
    // 初始化逻辑
    // 注意：如果 useRequest 设置了 refreshDeps，初始请求可能已自动触发
  });

  // 响应外部变化
  // 示例：路由参数变更、全局状态更新
  // useEffect(() => {
  //   const routeId = getRouteParam('id');
  //   if (routeId) { fetchDetail(routeId); }
  // }, [routeId]);
};

export default useWatcher;
```

### 要点

- 使用 `useMount` 代替 `useEffect(() => {}, [])`
- `useEffect` 仅用于响应外部变化（路由、全局状态）
- 即使文件内容为空也要保留此文件 — 它表明"此模块（暂时）没有副作用"
- 不要在此处进行数据请求 — 数据请求应放在 useData 中使用 useRequest

## 模式 4：hooks/index.ts — 聚合器

```typescript
import useData from './useData';
import useController from './useController';
import useWatcher from './useWatcher';

const useModuleHooks = () => {
  // 第 1 步：数据层
  const dataResult = useData();
  const {
    loading, list, total, query, currentItem, layout,
    setQuery, setCurrentItem, setLayout, fetchList,
  } = dataResult;

  // 第 2 步：控制层（接收数据层的 setter）
  const controllers = useController({
    setQuery, setCurrentItem, setLayout, fetchList,
  });

  // 第 3 步：观察层（监听数据以处理副作用）
  useWatcher({ fetchList, query });

  // 导出约定：_ = 数据，$ = 控制器
  const _ = { loading, list, total, query, currentItem, layout };
  const $ = { ...controllers };

  return { _, $ };
};

export default useModuleHooks;
```

### 分离约定

| 符号 | 包含内容 | 用途 |
|--------|----------|---------|
| `_` | 数据值（loading、list、total、query 等） | 布局组件使用的只读展示数据 |
| `$` | 事件处理函数（handleSearch、handleDelete 等） | 布局组件使用的交互处理器 |

这种约定使布局代码中数据与行为的区分一目了然。
