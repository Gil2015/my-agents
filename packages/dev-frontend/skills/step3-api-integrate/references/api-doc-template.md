# 接口文档模板

将此模板分享给后端开发人员，以获得一致、完整的接口文档。

## 模板

```markdown
# API: {Module Name}

## Base URL: {base-path}

---

### {API Name}

**{METHOD}** `{path}`

**描述:** {该接口的用途}

**鉴权:** {必需 / 可选 / 无}

#### 请求

**请求头:**
| 请求头 | 值 | 是否必填 |
|--------|-------|----------|
| Content-Type | application/json | 是 |
| Authorization | Bearer {token} | 是 |

**路径参数:**
| 参数名 | 类型 | 是否必填 | 描述 | 示例 |
|-----------|------|----------|-------------|---------|
| id | string | 是 | 资源 ID | "abc-123" |

**查询参数:**
| 参数名 | 类型 | 是否必填 | 默认值 | 描述 | 示例 |
|-----------|------|----------|---------|-------------|---------|
| page | number | 否 | 1 | 页码 | 1 |
| pageSize | number | 否 | 10 | 每页条数 | 20 |
| keyword | string | 否 | - | 搜索关键词 | "test" |

**请求体:**
```json
{
  "name": "Example",
  "status": 1,
  "config": {
    "key": "value"
  }
}
```

**请求体字段:**
| 字段名 | 类型 | 是否必填 | 描述 | 约束 |
|-------|------|----------|-------------|-------------|
| name | string | 是 | 资源名称 | 1-100 个字符 |
| status | number | 否 | 状态码 | 0=停用, 1=启用 |
| config | object | 否 | 配置信息 | - |

#### 响应

**成功 (200):**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "abc-123",
        "name": "Example",
        "status": 1,
        "createdAt": "2024-01-01 10:00:00",
        "updatedAt": "2024-01-02 15:30:00"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10
  }
}
```

**响应字段:**
| 字段路径 | 类型 | 可否为空 | 描述 |
|-----------|------|----------|-------------|
| code | number | 否 | 0=成功, 非0=失败 |
| message | string | 否 | 状态信息 |
| data.list | array | 否 | 数据列表 |
| data.list[].id | string | 否 | 唯一标识 |
| data.list[].name | string | 否 | 资源名称 |
| data.list[].status | number | 否 | 0=停用, 1=启用, 2=已删除 |
| data.list[].createdAt | string | 否 | ISO 日期时间格式 |
| data.list[].updatedAt | string | 是 | ISO 日期时间格式，未更新过则为 null |
| data.total | number | 否 | 分页总条数 |

#### 错误码

| 错误码 | 信息 | 触发条件 | 处理方式 |
|------|---------|---------|------------|
| 1001 | "Name already exists" | 创建/更新时名称重复 | 显示错误提示 |
| 1002 | "Resource not found" | ID 无效 | 跳转至列表页 |
| 1003 | "Permission denied" | 无权访问该资源 | 显示权限错误提示 |

---
```

## 与后端沟通的要点

1. **完整的 JSON 示例** — 不要只给字段描述，需要提供完整的 JSON 请求/响应体
2. **可为空的字段** — 明确标注哪些字段可能为 null
3. **枚举值** — 列出所有可能的值及其含义（例如 status: 0/1/2）
4. **错误码** — 所有业务错误码及其触发条件
5. **分页格式** — 统一的 page/pageSize/total 结构
6. **日期格式** — 指定精确的格式字符串
