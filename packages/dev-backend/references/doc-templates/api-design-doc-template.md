# API 设计文档（api-design.md）

- 模块名：
- 模块显示名：
- 需求来源：
- 前端接口文档：apiDoc/api.md

## API-001

- 方法：POST
- 路径：/api/example
- 描述：
- 关联需求：REQ-001
- 前端对齐状态：ALIGNED | NEEDS_ADJUST | BACKEND_ONLY
- 鉴权：Bearer JWT
- 权限守卫：
- 负责人：

### Controller

- Controller Class：ExampleController
- Method Name：example
- 装饰器：@Post('example')

### 请求参数（DTO）

- DTO Class：CreateExampleDto

1. `id` (string, 必填) - 说明；校验规则：@IsString() @IsNotEmpty()

### 响应结构（VO）

- VO Class：ExampleVo

1. `code` (number, 不可空) - 说明
2. `data` (object | null) - 说明

### 业务逻辑

1. 查询条件：
2. 排序规则：
3. 分页策略：
4. 权限控制：
5. 数据转换：Entity → VO 的映射规则

### 关联实体

1. `ExampleEntity` - 表名 `example`，关系：

### 错误码

1. `4001` - 含义：；前端处理策略：

## 合并规则

- 同一模块的多次设计产出应增量追加到同一份 `api-design.md`，不另建文件。
- 已有 `API-*` 条目只更新变更字段，不删除或重排编号。
- 新增接口使用下一个可用的 `API-*` 编号。
- `前端对齐状态` 变更时直接在原条目上修改。
