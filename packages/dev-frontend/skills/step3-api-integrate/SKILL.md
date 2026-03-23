---
name: api-integrate
description: Use when turning backend API docs into typed service, mock, and hook updates for an existing frontend module
---

# 接口联调

## 概述

把接口文档落成项目内可运行的 `api.md`、`defs/type.ts`、`defs/service.ts`、`__test__/mock.ts` 和 `hooks/useData.ts` 变更。目标不是“把请求发出去”，而是让接口契约、类型链和页面数据流保持一致。

**核心原则：** 文档定义契约，`type.ts` 固化契约，`service.ts` 执行契约，`useData.ts` 做 UI 侧数据适配。

**违反规则的字面意思就是违反规则的精神。**

## 适用场景

**必须使用：**
- 后端已提供接口文档，且前端模块骨架已经存在
- 需要将 `defs/service.ts` 中的桩代码替换为真实接口实现
- 接口契约发生变化，需要同步更新类型、mock 和 Hook 数据流
- 后端未完全就绪，但需要先生成与契约一致的 mock 数据

**例外情况（需征询开发者）：**
- 模块骨架还不存在，应先使用 `ui-dev`
- 接口文档缺少关键字段，无法确定方法、路径或响应结构
- 本次只改视觉或文案，不涉及接口契约变化

看到 Swagger 就想把字段直接抄进组件里？停下来。先把契约落到 `type.ts` 和 `service.ts`，再接 `useData.ts`。

## 转换示例

文档输入：

```text
POST /fund/queryList
请求参数：
- pageNo (number, 必填)
- pageSize (number, 必填)
- keyword (string, 选填)

响应：
{
  code: number,
  data: {
    total: number,
    list: Array<{
      id: string,
      fund_name: string,
      status: number | null
    }>
  } | null
}
```

代码输出：

```typescript
import { http } from "../../../utils/axiosInstance";

export interface QueryFundListParams {
  pageNo: number;
  pageSize: number;
  keyword?: string;
}

export interface FundListItem {
  id: string;
  fund_name: string;
  status: number | null;
}

export interface QueryFundListResponse {
  code: number;
  data: {
    total: number;
    list: FundListItem[];
  } | null;
}

export const services = {
  queryFundList: (data: QueryFundListParams) =>
    http<QueryFundListResponse>({
      url: "/fund/queryList",
      method: "post",
      data,
    }),
};
```

`useData.ts` 中只做 UI 适配，例如把 `res.data?.list ?? []` 转成表格数据；不要在布局里直接适配接口字段。

## 第 1 步：获取并固化文档

优先按以下顺序获取接口文档：

**从配置中读取（推荐）：**
- 检查 `.ai/missions/{module}/config.json` 中的 `apiDocSources`
- 扫描并读取配置路径下的所有相关文档

**从用户指定路径读取：**
- 读取用户提供的接口文档目录或文件

**从用户输入读取：**
- 接受直接粘贴的接口说明、Swagger 片段或飞书文档摘录

把整理后的结构化结果写入 `.ai/missions/{module}/apiDoc/api.md`，格式以 `../../references/api-doc-template.md` 为准。

若缺少以下任一关键信息，不要继续写 `service.ts`：
- HTTP 方法
- 实际路径
- 请求参数定义
- 响应字段结构

此时应把缺失项明确记入 `api.md`，并向用户确认后再继续。

**至少执行：**
- `test -f ".ai/missions/{module}/config.json"`

**当接口文档来自文件系统时，至少执行：**
- `find "{api-source-folder}" -type f | sort`

## 第 2 步：整理接口契约

针对每个接口端点，至少提取以下信息：
- 接口编号（如 `API-001`）
- 方法、路径、描述、鉴权要求
- 关联需求和调用场景
- 请求参数：字段名、类型、必填状态、说明
- 响应字段：字段名、类型、可空状态、说明
- 错误码：含义与前端处理策略
- Mock 值示例

要求：
- 字段名保持与接口文档一致，不先做 camelCase 改造
- 响应包装层要完整保留，例如 `{ code, data, message }`
- 不完整的信息要显式标记，不能凭经验脑补

## 第 3 步：更新 `defs/type.ts`

在现有模块类型链上追加接口相关类型，而不是另起一套独立命名。

规则：
- 参数类型、响应类型与文档逐字段对齐
- 可空字段使用 `| null`
- 含义不直观的字段补 JSDoc 注释
- 展示层衍生字段不要写回接口响应类型，例如 `statusLabel`、`displayName`

典型分层：
- `QueryFundListParams`、`QueryFundListResponse` 这类类型属于接口契约
- `DataState`、`LayoutProps` 这类类型属于模块内部数据流

## 第 4 步：更新 `defs/service.ts`

默认遵循 `../../references/module-template/defs/service.ts` 的模式：
- 使用 `export const services = { ... }` 统一导出
- 保持模块现有的请求封装；如果是新模块，按模板使用统一 `http(...)`
- GET 用 `params`，POST/PUT/PATCH 用 `data`

示例：

```typescript
import { http } from "../../../utils/axiosInstance";
import type { QueryFundListParams, QueryFundListResponse } from "./type";

export const services = {
  queryFundList: (data: QueryFundListParams) =>
    http<QueryFundListResponse>({
      url: "/fund/queryList",
      method: "post",
      data,
    }),
};
```

约束：
- 函数命名要表达业务动作，如 `queryFundList`、`createFund`、`deleteFund`
- 路径、方法、参数结构必须与文档一致
- 不在 `layout` 或 `useController` 中直接拼请求配置

## 第 5 步：更新 `__test__/mock.ts`

用真实接口路径和字段结构替换模板示例：
- `type` 与实际 HTTP 方法一致
- 响应结构与 `Query...Response` 保持一致
- mock 字段名、可空性和嵌套结构必须和接口契约同步

规则：
- 后端未就绪时，mock 是“契约镜像”，不是随意编数据
- 已知会触发边界逻辑的字段，要在 mock 中体现，如空列表、`null` 状态、错误码
- 删除 `example/queryExample`、`__MODULE_NAME__` 等模板残留

## 第 6 步：接入 `hooks/useData.ts`

把真实接口接到数据层，而不是接到布局层。

至少完成以下动作：
- 将桩代码的 `services.queryExample` 替换为真实 service
- 调整请求参数组装方式，确保与接口契约一致
- 在 `useData.ts` 中完成响应到 UI 数据的映射
- 对已知业务错误码补充错误处理或兜底状态

推荐模式：

```typescript
const { data: listRes, run: runFundList } = useRequest(services.queryFundList, {
  manual: true,
});

const tableData = useCreation(
  () => listRes?.data?.list ?? [],
  [listRes],
);
```

约束：
- 接口字段到 UI 字段的转换放在 `useData.ts`
- `useController.ts` 只组织动作，不负责解释接口响应结构
- `layouts/` 只消费 `data` 和 `controllers`

## 第 7 步：校验与收尾

逐项检查：
- [ ] `.ai/missions/{module}/apiDoc/api.md` 已写入并覆盖本次接口
- [ ] `defs/type.ts`、`defs/service.ts`、`__test__/mock.ts`、`hooks/useData.ts` 彼此一致
- [ ] `service.ts` 使用模块既有请求封装，或符合模板默认模式
- [ ] GET/POST/PUT/PATCH 的参数位置正确
- [ ] 接口字段名没有被前端私自改写
- [ ] 展示层没有直接 import service
- [ ] 模板占位符和示例接口已清理

**至少执行：**
- `rg -n "__MODULE_NAME__|queryExample|example/queryExample" "src/modules/{ModuleName}"`
- `rg -n "services =|useRequest\\(|useCreation\\(" "src/modules/{ModuleName}"`
- `test -f ".ai/missions/{module}/apiDoc/api.md"`

## 常用模式

| 场景 | 推荐写法 |
|------|---------|
| 列表查询（GET） | `http<Resp>({ url: "/fund/list", method: "get", params })` |
| 列表查询（POST） | `http<Resp>({ url: "/fund/queryList", method: "post", data })` |
| 详情查询 | `http<Resp>({ url: \`/fund/${id}\`, method: "get" })` |
| 新建/提交 | `http<Resp>({ url: "/fund/create", method: "post", data })` |
| 更新 | `http<Resp>({ url: \`/fund/${id}\`, method: "put", data })` |
| 删除 | `http<Resp>({ url: \`/fund/${id}\`, method: "delete" })` |
| 上传 | `http<Resp>({ url: "/fund/upload", method: "post", data: formData })` |

## 常见错误

| 错误做法 | 正确做法 |
|---------|---------|
| 在布局或组件里直接调用接口 | 接口调用统一落在 `defs/service.ts` + `hooks/useData.ts` |
| 为了“看着顺手”改接口字段名 | 先保留原字段名，UI 映射在 `useData.ts` 完成 |
| 把 `statusLabel` 之类展示字段写进接口响应类型 | 展示字段属于模块数据，不属于接口契约 |
| mock 字段和 `type.ts` 不一致 | mock 必须与契约同步，作为联调前的真实替身 |
| 文档缺字段时凭经验硬写 service | 标记缺失项并先确认，别猜 |

## 参考文档

| 主题 | 文件 |
|------|------|
| 接口文档模板 | `../../references/api-doc-template.md` |
| 共享模块模板 | `../../references/module-template/` |
| 业务侧与工程侧代码规则 | `../../references/rules.md` |

## 集成关系

- **直接上游：** `ui-dev`
- **可选上游：** `req-collect`
- **主测试阶段：** `module-test`
- **失败回流：** `bug-fix`
