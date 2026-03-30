# NestJS 代码规则

本文件只保留共享约束，不重复维护模板示例代码。目录形态、导出方式和占位写法以 `../module-template/` 为第一参考源。

## 1. 使用方式

- 新建模块时，先对齐 `../module-template/`，再填充真实业务实现
- 扩展已有模块时，优先沿用现有结构并补齐缺失文件，不另起一套目录约定
- 如果规则描述与模板不一致，以模板为准完成当前任务，并回写修正文档

## 2. 结构底线

共享模板当前约定的基础结构包括：

- `{module-name}.module.ts`
- `{module-name}.controller.ts`
- `{module-name}.service.ts`
- `dto/`
- `entities/`
- `vo/`
- `constants/`
- `__test__/`

补充规则：

- `dto/` 下每个操作独立文件：`create-*.dto.ts`、`update-*.dto.ts`、`query-*.dto.ts`
- `entities/` 下每个实体独立文件
- `vo/` 按功能组织，不按接口一对一建文件
- 交付前必须清理模板占位符和示例代码

## 3. 职责边界

| 层         | 职责                                                         | 禁止                                                |
| ---------- | ------------------------------------------------------------ | --------------------------------------------------- |
| Module     | 模块注册、Provider 声明、导入导出                            | 包含业务逻辑                                        |
| Controller | 路由声明、参数接收与校验（Pipe）、调用 Service、Swagger 注解 | 直接操作数据库、包含业务逻辑、返回 Entity           |
| Service    | 业务逻辑编排、事务管理、Entity → VO 转换                     | 直接操作 Request/Response、引用 Controller 层装饰器 |
| DTO        | 请求参数类型定义、class-validator 校验装饰器                 | 包含业务逻辑、引用 Entity                           |
| VO         | 响应数据结构定义                                             | 与 Entity 字段一一绑定、包含 ORM 装饰器             |
| Entity     | 数据库映射、ORM 装饰器、关系定义                             | 包含业务逻辑、引用 DTO/VO                           |
| Constants  | 枚举定义、静态配置、错误码                                   | 引用其他层的类型                                    |

## 4. DTO 编写约束

- 使用 `class-validator` 装饰器做参数校验
- 使用 `class-transformer` 做类型转换
- 分页查询参数继承项目统一的分页 DTO（如有）
- 可选字段使用 `@IsOptional()` + 具体类型装饰器
- 嵌套对象使用 `@ValidateNested()` + `@Type(() => NestedDto)`
- 禁止在 DTO 中使用 `any` 类型

```typescript
// ✅ 正确
export class QueryExampleDto {
  @IsInt()
  @Min(1)
  pageNo: number;

  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number;

  @IsOptional()
  @IsString()
  keyword?: string;
}

// ❌ 错误：缺少校验装饰器
export class QueryExampleDto {
  pageNo: number;
  pageSize: number;
  keyword?: string;
}
```

## 5. Service 编写约束

- Service 是业务逻辑的唯一入口，Controller 不应绕过 Service 直接操作数据
- Repository/QueryBuilder 调用集中在 Service 层
- 事务使用 `DataSource.transaction()` 或 `QueryRunner`
- 返回值使用 VO 而非 Entity，在 Service 层完成转换
- 错误抛出使用项目统一的业务异常类（如 `BusinessException`），不直接抛 `HttpException`

```typescript
// ✅ 正确
async findOne(id: number): Promise<ExampleVo> {
  const entity = await this.exampleRepository.findOne({ where: { id } });
  if (!entity) {
    throw new BusinessException(ErrorCode.NOT_FOUND, '记录不存在');
  }
  return ExampleVo.fromEntity(entity);
}

// ❌ 错误：直接返回 Entity
async findOne(id: number): Promise<ExampleEntity> {
  return this.exampleRepository.findOne({ where: { id } });
}
```

## 6. Controller 编写约束

- 使用装饰器声明路由、方法和参数来源
- 使用 `@ApiTags()`、`@ApiOperation()`、`@ApiResponse()` 声明 Swagger 文档
- 参数使用 `@Body()`、`@Param()`、`@Query()` 显式声明来源
- 不在 Controller 中手动包装响应格式（项目应有统一拦截器）
- 权限控制使用 Guard + 自定义装饰器

```typescript
// ✅ 正确
@Post('list')
@ApiOperation({ summary: '查询列表' })
async queryList(@Body() dto: QueryExampleDto): Promise<PaginatedVo<ExampleVo>> {
  return this.exampleService.queryList(dto);
}

// ❌ 错误：手动包装响应
@Post('list')
async queryList(@Body() dto: QueryExampleDto) {
  const result = await this.exampleService.queryList(dto);
  return { code: 200, data: result, message: 'success' };
}
```

## 7. Entity 编写约束

- 使用 ORM 装饰器定义表结构和关系
- 公共字段（`id`、`created_at`、`updated_at`、`deleted_at`）继承基础实体类（如有）
- 枚举字段使用 `Constants` 中定义的枚举，不在 Entity 中硬编码
- 关系装饰器必须声明 `cascade`、`onDelete` 等行为

## 8. 适配提醒

共享模板包含建议性的项目内依赖，跨项目复用时需要先确认或替换：

- 统一响应拦截器（`TransformInterceptor` 等）
- 统一异常过滤器（`AllExceptionsFilter` 等）
- 统一分页 DTO / VO 基类
- 业务异常类和错误码体系
- `DataSource` / `Repository` 注入方式

如果目标项目没有这些能力，应先调整模板或在项目侧提供兼容层，再继续使用本 skill 套件。

## 9. 最终自检

- [ ] 目录结构是否与 `../module-template/` 当前基线一致
- [ ] Controller 是否只做路由转发和参数校验
- [ ] Service 是否是业务逻辑的唯一入口
- [ ] DTO 是否都使用了 class-validator 装饰器
- [ ] Service 返回 VO 而非 Entity
- [ ] Entity 的关系和约束是否与 `db-schema.md` 保持一致
- [ ] 是否清理了模板占位符和示例代码
- [ ] 是否使用了项目统一的异常处理和响应封装
