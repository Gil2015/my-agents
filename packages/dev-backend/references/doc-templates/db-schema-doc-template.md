# 数据库设计文档（db-schema.md）

- 模块名：
- 模块显示名：
- ORM：TypeORM | Prisma | Sequelize
- 数据库：PostgreSQL | MySQL | SQLite
- 关联 API 设计：apiDesign/api-design.md

## ENTITY-001: {EntityName}

- 表名：
- 描述：
- 关联需求：REQ-001
- 关联接口：API-001, API-002
- 状态：DRAFT | CONFIRMED | MIGRATED

### 字段定义

| 字段名     | 类型         | 约束               | 默认值                      | 说明                |
| ---------- | ------------ | ------------------ | --------------------------- | ------------------- |
| id         | int / uuid   | PK, AUTO_INCREMENT | -                           | 主键                |
| name       | varchar(255) | NOT NULL           | -                           | 名称                |
| status     | tinyint      | NOT NULL           | 0                           | 状态：0=禁用 1=启用 |
| created_at | datetime     | NOT NULL           | CURRENT_TIMESTAMP           | 创建时间            |
| updated_at | datetime     | NOT NULL           | CURRENT_TIMESTAMP ON UPDATE | 更新时间            |
| deleted_at | datetime     | NULL               | NULL                        | 软删除时间          |

### 关系

1. `OneToMany` → `ChildEntity` (字段: `parent_id`)
2. `ManyToOne` → `ParentEntity` (字段: `parent_id`)
3. `ManyToMany` → `TagEntity` (中间表: `example_tag`)

### 索引

| 索引名   | 类型   | 字段 | 查询场景   |
| -------- | ------ | ---- | ---------- |
| idx_name | BTREE  | name | 按名称搜索 |
| uk_code  | UNIQUE | code | 唯一约束   |

### 迁移说明

- 迁移类型：新建表 | 加字段 | 改字段 | 数据迁移
- 迁移风险：
- 回滚方案：

---

## ENTITY-002: {NextEntityName}

...

## 种子数据

```json
[]
```

## 命名约定

- 表名：小写下划线（snake_case），例如 `fund_calculation`
- 字段名：小写下划线（snake_case），例如 `created_at`
- 索引名：`idx_{table}_{column}` 或 `uk_{table}_{column}`
- 外键名：`fk_{table}_{ref_table}_{column}`

## 合并规则

- 同一模块的多次设计产出应增量追加到同一份 `db-schema.md`。
- 已有 `ENTITY-*` 编号不删除或重排。
- 字段变更在原条目上修改，并更新 `迁移说明`。
