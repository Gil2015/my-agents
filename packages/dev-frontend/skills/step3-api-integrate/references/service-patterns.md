# Service 层模式

`defs/service.ts`、`defs/type.ts` 和 `__test__/mock.ts` 的标准模式。

## 类型定义模式

### API 响应包装器

大多数接口返回统一包装的响应。定义包装器类型：

```typescript
/** Common API response wrapper */
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/** Paginated list response */
interface PaginatedData<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

### 请求参数类型

```typescript
/** Base query with pagination */
interface BaseQuery {
  page: number;
  pageSize: number;
}

/** Module-specific query */
export interface I{ModuleName}Query extends BaseQuery {
  keyword?: string;
  status?: number;
  startDate?: string;
  endDate?: string;
}
```

### 响应数据项类型

```typescript
/** Match API response field names exactly */
export interface I{ModuleName}Item {
  id: string;
  name: string;
  /** 0=inactive, 1=active, 2=deleted */
  status: number;
  amount: number;
  /** Can be null if never updated */
  updatedAt: string | null;
  createdAt: string;
}
```

规则：
- 字段名必须与接口响应完全一致（如果接口使用 snake_case，不要擅自改为 camelCase）
- 可为 null 的字段使用 `| null`（不要用 `?` — 那是表示可选，不是表示可为空）
- 对枚举值和含义不明显的字段添加 JSDoc 注释

## Service 函数模式

### CRUD 增删改查

```typescript
import request from '@/utils/request';
import type {
  I{ModuleName}Query,
  I{ModuleName}Item,
} from './type';

const BASE = '/api/{module-path}';

/** GET list with pagination and filters */
export const get{ModuleName}List = (params: I{ModuleName}Query) =>
  request.get(`${BASE}/list`, { params });

/** GET single item by ID */
export const get{ModuleName}Detail = (id: string) =>
  request.get(`${BASE}/detail`, { params: { id } });

/** POST create new item */
export const create{ModuleName} = (data: Partial<I{ModuleName}Item>) =>
  request.post(`${BASE}/create`, data);

/** PUT update existing item */
export const update{ModuleName} = (id: string, data: Partial<I{ModuleName}Item>) =>
  request.put(`${BASE}/update`, { ...data, id });

/** DELETE remove item */
export const delete{ModuleName} = (id: string) =>
  request.post(`${BASE}/delete`, { id });
```

### 文件上传模式

```typescript
/** POST upload file */
export const upload{ModuleName}File = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return request.post(`${BASE}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
```

### 导出/下载模式

```typescript
/** GET download as file */
export const export{ModuleName} = (params: I{ModuleName}Query) =>
  request.get(`${BASE}/export`, {
    params,
    responseType: 'blob',
  });
```

### 批量操作模式

```typescript
/** POST batch operation */
export const batch{Operation}{ModuleName} = (ids: string[]) =>
  request.post(`${BASE}/batch-{operation}`, { ids });
```

## Mock 数据模式

### 基础 Mock（使用 Mock.js）

```typescript
import Mock from 'mockjs';
import type { I{ModuleName}Item } from '../defs/type';

/** Generate single mock item */
export const mockItem = (): I{ModuleName}Item =>
  Mock.mock({
    'id': '@guid',
    'name': '@ctitle(2, 6)',
    'status|1': [0, 1, 2],
    'amount|1000-999999': 1,
    'rate|0.001-0.100': 1,
    'description': '@cparagraph(1, 3)',
    'createdAt': '@datetime("yyyy-MM-dd HH:mm:ss")',
    'updatedAt': '@datetime("yyyy-MM-dd HH:mm:ss")',
  });

/** Generate mock list response */
export const mockListResponse = (
  page = 1,
  pageSize = 10,
  total = 50,
) => ({
  list: Array.from({ length: Math.min(pageSize, total - (page - 1) * pageSize) }, mockItem),
  total,
  page,
  pageSize,
});
```

### 常用 Mock.js 模板

| 数据类型 | Mock.js 语法 | 示例输出 |
|-----------|---------------|----------------|
| UUID | `@guid` | `"2f8b9a1c-..."` |
| 中文姓名 | `@cname` | `"张三"` |
| 中文标题 | `@ctitle(4, 8)` | `"系统管理配置"` |
| 整数范围 | `'count\|100-999': 1` | `523` |
| 浮点数范围 | `'rate\|0.01-0.10': 1` | `0.05` |
| 枚举随机选取 | `'status\|1': [0, 1, 2]` | `1` |
| 日期 | `@datetime("yyyy-MM-dd")` | `"2024-03-15"` |
| 日期时间 | `@datetime("yyyy-MM-dd HH:mm:ss")` | `"2024-03-15 14:30:00"` |
| 布尔值 | `@boolean` | `true` |
| 中文段落 | `@cparagraph(1, 3)` | `"中文段落..."` |
| 图片链接 | `@image("200x200")` | `"http://..."` |
| 数组 | `'list\|10': [{ ... }]` | 包含 10 项的数组 |

## 将 Service 接入 Hooks

### 在 hooks/useData.ts 中

```typescript
// Before (stub)
const { data, loading, run: fetchList } = useRequest(
  () => get{ModuleName}List(query),
  { refreshDeps: [query] }
);

// After (with real API + response unwrapping)
const { data, loading, run: fetchList } = useRequest(
  () => get{ModuleName}List(query),
  {
    refreshDeps: [query],
    formatResult: (res) => res.data,  // Unwrap API response wrapper
  }
);
```

### 在 hooks/useController.ts 中

```typescript
// Before (stub)
const handleSave = useMemoizedFn(async (values) => {
  // TODO: implement
});

// After (with real API)
const handleSave = useMemoizedFn(async (values: Partial<I{ModuleName}Item>) => {
  if (currentItem?.id) {
    await update{ModuleName}(currentItem.id, values);
  } else {
    await create{ModuleName}(values);
  }
  message.success('保存成功');
  setLayout('list');
  fetchList();
});
```
