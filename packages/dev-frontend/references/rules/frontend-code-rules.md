# 前端代码规则

本文件只保留共享约束，不重复维护模板示例代码。目录形态、导出方式和占位写法以 `../module-template/` 为第一参考源。

## 1. 使用方式

- 新建模块时，先对齐 `../module-template/`，再填充真实业务实现
- 扩展已有模块时，优先沿用现有结构并补齐缺失文件，不另起一套目录约定
- 如果规则描述与模板不一致，以模板为准完成当前任务，并回写修正文档

## 2. 结构底线

共享模板当前约定的基础结构包括：

- `index.tsx`
- `defs/`
- `hooks/`
- `layouts/`
- `__test__/`
- `utils.ts`

补充规则：

- `components/` 为按需目录；一旦新增，必须补 `components/index.ts`
- 交付前必须清理模板占位符、示例组件和示例接口
- 不要为了“先跑起来”把模块扁平化成单文件页面

## 3. 职责边界

- `index.tsx`：只负责模块组装，不写业务逻辑
- `defs/`：维护静态常量、类型链和 service 定义
- `hooks/useData.ts`：管理状态、请求入口和数据适配
- `hooks/useController.ts`：承载交互动作和业务事件处理
- `hooks/useWatcher.ts`：承载监听和副作用
- `hooks/index.ts`：聚合 hooks，并按当前模板约定返回 `data` 与 `controllers`
- `layouts/`：纯展示层，只消费 `data` / `controllers`
- 本地 `components/`：优先保持展示组件属性，不偷带模块业务逻辑

## 4. 类型与契约约束

- 类型链要围绕当前模板已有的 `Props`、`DataParams`、`CtrlParams`、`WatcherParams`、`LayoutProps` 扩展
- 接口字段名优先保持与后端契约一致，不在 `type.ts` 中提前改写命名
- 可空字段使用 `| null` 表达，不要把“可空”伪装成“可选”
- 展示层衍生字段属于模块数据流，不属于接口契约类型
- 禁止一路 `any` 写到底；临时占位可以存在，但交付前要替换为真实类型

## 5. 当前模板遵循的工程习惯

- 默认使用当前项目模板里的请求封装与导入方式，不额外在规则中再维护一套示例
- `hooks/index.ts` 与布局层之间的传参契约以当前模板为准
- 样式文件统一使用 `style.module.less`
- 样式组织默认使用 CSS Modules + `classNames`
- 如需保留占位实现，应保证 `step3-api-integrate` 可以无歧义接手替换

## 6. 适配提醒

共享模板包含明显的项目内依赖，跨项目复用时需要先替换：

- `createModule`、`http`、`useAtomState` 等工程工具导入
- `@m9/tools-ui-components` 等业务 UI 组件库导入
- `mock/global` 等测试桩依赖

如果目标项目没有这些能力，应先调整模板或在项目侧提供兼容层，再继续使用本 skill 套件。

## 7. 最终自检

- [ ] 目录结构是否与 `../module-template/` 当前基线一致
- [ ] `index.tsx` 是否只做模块组装
- [ ] `hooks/index.ts` 是否仍按模板契约返回 `data` / `controllers`
- [ ] 布局层是否没有直接请求和业务状态
- [ ] `defs/type.ts`、`defs/service.ts`、hooks、布局是否保持同一套契约
- [ ] 是否清理了 `__MODULE_NAME__`、`ExampleChildComponent`、`queryExample` 等模板残留
