---
name: api-integrate
description: Use when integrating backend APIs into an existing frontend module, before testing
---

# 接口联调

## 概述

将原始接口文档转换为项目标准的 service 层代码（service.ts、type.ts、mock.ts），并将其接入已有模块的 hooks 层。

**核心原则：** 接口联调是一种机械式转换 —— 文档输入，类型化代码输出。

## 适用场景

- 后端提供了接口文档，且前端模块骨架已经存在
- 需要将 service 桩代码替换为真实的接口实现
- 收到更新后的接口契约，需要同步修改代码
- 后端尚未就绪，需要先生成 mock 数据用于开发

**不适用的情况：** 模块还不存在 —— 请先使用 `ui-dev` 搭建模块骨架。

## 核心模式

```
BEFORE: Raw API documentation (飞书 doc, Swagger, text)
         ↓ transformation ↓
AFTER:  Typed service.ts + updated type.ts + mock.ts
```

## 执行流程

### 第 1 步：获取文档

获取接口文档：

**从配置中读取：**
- 检查 `.ai/missions/{module}/config.json` 中的 `apiDocSources` 字段，获取接口文档的源文件夹路径
- 读取源文件夹中的所有相关文档

**从用户指定文件夹获取：**
- 从用户输入的特定文档来源文件夹路径中读取内容

**从用户输入获取：**
- 接受用户直接粘贴的接口文档

### 第 2 步：结构化整理

将获取到的原始接口文档转换为结构化格式（参见 `../../references/api-doc-template.md`）。

针对每个接口端点，提取以下信息：
- 模块名与需求来源
- 接口编号（如 API-001）、方法、路径、描述
- 关联需求与调用场景
- 请求参数（必填状态、类型、说明）
- 响应字段（非空状态、类型、说明）
- 错误码（含义与前端处理策略）
- Mock 值示例

如果原始文档信息不完整，标记缺失项并向用户确认。

将结构化接口文档写入 `.ai/missions/{module}/apiDoc/api.md`。

### 第 3 步：生成类型定义

使用与接口文档一致的类型更新 `defs/type.ts`：

```typescript
// Request params — match API documentation exactly
export interface I{Endpoint}Params {
  // From API doc: request parameters
}

// Response — match API documentation exactly
export interface I{Endpoint}Response {
  // From API doc: response body structure
}
```

规则：
- 字段名必须与接口响应完全一致（使用接口文档中的大小写格式）
- 按文档标注的可空字段使用 `| null` 标记
- 对含义不直观的字段添加 JSDoc 注释
- 保留已有的类型链 —— 新类型是扩展，而非替换

### 第 4 步：生成 Service

使用真实接口调用更新 `defs/service.ts`：

```typescript
import request from '@/utils/request';
import type { I{Endpoint}Params, I{Endpoint}Response } from './type';

/** {API description from documentation} */
export const {functionName} = (params: I{Endpoint}Params) =>
  request.{method}<I{Endpoint}Response>('{actual-api-path}', {
    params,  // for GET
    data: params,  // for POST/PUT
  });
```

规则：
- 函数命名：`动词` + `模块名` + `名词`（例如 `getFundList`、`createFundItem`）
- 使用文档中的实际接口路径
- 严格匹配 HTTP 方法（GET、POST、PUT、DELETE、PATCH）
- 包含正确的请求配置（GET 用 params，POST 用 data）

### 第 5 步：生成 Mock 数据

使用 Mock.js 创建/更新 `__test__/mock.ts`：

```typescript
import Mock from 'mockjs';
import type { I{Endpoint}Response } from '../defs/type';

export const mock{Endpoint}Response = (): I{Endpoint}Response =>
  Mock.mock({
    // Match response structure from API doc
    // Use appropriate Mock.js generators:
    'id': '@guid',
    'name': '@ctitle(4, 8)',
    'amount|1000-99999': 1,
    'rate|0.01-0.10': 1,
    'status|1': [0, 1, 2],
    'createdAt': '@datetime("yyyy-MM-dd HH:mm:ss")',
    'list|10': [{ /* item template */ }],
    'total|50-200': 1,
  });
```

### 第 6 步：接入 Hook 层

更新 `hooks/useData.ts`，使其使用真实的 service 函数：
- 将桩代码的 service 调用替换为实际的 import
- 调整请求参数以匹配接口契约
- 如果接口结构与 UI 需求不一致，处理响应数据的映射转换
- 针对接口特定的错误码添加错误处理

## 常用模式

| 场景 | 模式 |
|------|------|
| 列表接口（GET + 分页） | `request.get(url, { params: { page, pageSize, ...filters } })` |
| 详情接口（按 ID 查询） | `request.get(\`${url}/${id}\`)` |
| 新建接口（POST） | `request.post(url, data)` |
| 更新接口（PUT） | `request.put(\`${url}/${id}\`, data)` |
| 删除接口（DELETE） | `request.delete(\`${url}/${id}\`)` |
| 上传接口（POST multipart） | `request.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } })` |
| 批量操作 | `request.post(\`${url}/batch\`, { ids, action })` |

## 常见错误

| 错误做法 | 正确做法 |
|---------|---------|
| 在接口参数中使用前端字段名 | 严格匹配接口文档中的字段名 |
| 忘记处理分页响应的包装结构 | 检查接口是否将数据包装在 `{ data: { list, total } }` 或类似结构中 |
| 硬编码接口路径 | 使用常量或配置管理基础 URL |
| 未处理响应中的 null/undefined | 在类型定义中标记可空字段 |
| 跳过错误码处理 | 为已知的业务错误码添加错误拦截器 |

## 参考文档

| 主题 | 文件 |
|------|------|
| 接口文档模板（可共享给后端） | `../../references/api-doc-template.md` |
| 业务代码模板 | `../../references/module-template` |
| 代码规则与规范提示 | `../../references/rules.md` |

## 集成关系

- **依赖：** `ui-dev`（Phase 3 —— 模块必须已存在）
- **输出被消费方：** `module-test`（Phase 5 —— 基于真实接口类型进行测试）
