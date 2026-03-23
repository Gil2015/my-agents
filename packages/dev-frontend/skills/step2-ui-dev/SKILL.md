---
name: ui-dev
description: Use when creating or extending a frontend module from requirements, UI designs, or direct implementation instructions, following the shared module template
---

# UI 开发

## 概述

根据需求文档、UI 图或明确的口头描述，在现有业务模块内开发页面与交互，或按共享模板搭建新模块。输出必须能直接进入 `api-integrate` 和后续 `module-test`，而不是只交付一个“先能跑起来”的页面。

**核心原则：** 先对齐模板和职责边界，再写具体 UI。结构错了，后面的联调、审计和测试都会变慢。

**违反规则的字面意思就是违反规则的精神。**

## 适用场景

**必须使用：**
- 新建业务模块或页面
- 在现有模块上新增一组完整功能或交互
- 根据 `req-collect` 产出的需求文档实现页面
- 只有 UI 图或明确口头描述，但仍需落到标准模块结构

**例外情况（需征询开发者）：**
- 一次性 PoC 或演示稿，不会进入正式模块体系
- 明确要求保留旧模块结构，本次不做模板迁移

觉得“页面很简单，先糊一个文件再说”？停下来。简单页面最容易因为省结构，把后续每一步都拖慢。

## 铁律

```text
EVERY MODULE STARTS FROM THE SHARED TEMPLATE - STRUCTURE FIRST, UI SECOND
```

布局里混入请求、状态或业务逻辑，就不是“先把页面写出来”，而是在制造后续联调和测试成本。

**没有例外：**
- `hooks/useWatcher.ts` 没有副作用也要保留空文件
- `layouts/` 只做展示，不直接发请求，不直接写业务逻辑
- `useState`、`useCallback`、`useMemo` 不作为默认方案；优先按 `../../references/rules.md` 使用 ahooks 对应模式
- 类型先落地，再填实现；禁止一路 `any` 写到底

## 违反后果

如果模块骨架、Hook 链路或布局职责不符合模板，当前实现视为未完成；在继续接口联调、缺陷修复或最终测试前，必须先回退并补齐结构。

## 第 1 步：读取上下文

读取以下信息：
- `.ai/missions/{module}/config.json`，确认模块名、上下文和输入来源
- 需求文档或 `req-collect` 产物（如存在）
- UI 图、交互说明、组件清单或用户补充说明

必须先搞清楚：
- 本次是新建模块，还是在现有模块内扩展
- 页面要展示哪些数据，分别有哪些加载态、空态、错误态
- 哪些动作归 `useController`，哪些监听归 `useWatcher`
- 哪些组件可以直接复用，哪些需要新增本地 `components/`

**若上下文来自 mission 目录，至少执行：**
- `test -f ".ai/missions/{module}/config.json"`
- `find ".ai/missions/{module}" -maxdepth 2 -type f | sort`

## 第 2 步：搭建骨架（仅新建模块时）

以以下基线为准：
- `../../references/module-template/`
- `../../references/rules.md`

目标结构至少包含：

```text
src/modules/{ModuleName}/
├── index.tsx
├── defs/
│   ├── constant.ts
│   ├── type.ts
│   └── service.ts
├── hooks/
│   ├── index.ts
│   ├── useData.ts
│   ├── useController.ts
│   └── useWatcher.ts
├── layouts/
│   ├── index.ts
│   └── Default/
│       ├── index.tsx
│       └── style.module.less
├── __test__/
│   ├── index.tsx
│   └── mock.ts
└── utils.ts
```

说明：
- `components/` 为按需目录；如果存在，必须补 `components/index.ts`
- 模板里的示例占位代码可以作为起点，但交付前必须替换或删除
- 已有模块扩展时，不重建目录；在现有结构上补缺文件并对齐命名

错误示例：

```text
src/modules/{ModuleName}/
├── index.tsx
└── page.tsx
```

这不是共享模板，只是临时页面。

**至少执行：**
- `find "src/modules/{ModuleName}" -maxdepth 3 -type f | sort`
- `rg -n "index\\.module\\.less|__MODULE_NAME__|ExampleChildComponent" "src/modules/{ModuleName}"`

## 第 3 步：先定义契约（defs/）

先写 `defs/`，再写实现。最低要求：
- `constant.ts`：真实的 `MODULE_NAME`、`LayoutEnum` 及静态配置
- `type.ts`：补齐并连通 `ModuleRef`、`Props`、`DataParams`、`CtrlParams`、`WatcherParams`、`LayoutProps`、`DataState`
- `service.ts`：先保留 service 壳或占位实现，后续由 `api-integrate` 替换为真实接口

约束：
- 字段名、枚举值、回调签名先定下来，再让 Hook 和布局围绕它实现
- 新类型是扩展既有类型链，不是随手另起一套命名
- 可空字段用 `| null` 表达，不用 `?` 假装“可选”

## 第 4 步：实现 Hook 链

顺序固定：
1. `useData.ts`：状态、派生数据、请求触发入口
2. `useController.ts`：事件处理与业务动作
3. `useWatcher.ts`：初始化和监听副作用
4. `hooks/index.ts`：编排 `useData -> useController -> useWatcher`

约束：
- `useController` 通过参数接收 `data`，不跨层直接拿状态
- `useWatcher` 只处理监听和初始化，不把主要请求逻辑塞进去
- `hooks/index.ts` 最终返回 `data` 和 `controllers`
- 默认遵循 `../../references/rules.md` 的 ahooks 映射；如果模板示例仍保留旧写法，以 `rules.md` 为准

## 第 5 步：实现布局与组件

`layouts/Default/index.tsx` 必须是纯展示层：
- 只接收 `data` 和 `controllers`
- 不写请求，不持有业务状态，不绕过 Hook 直接操作 service
- 样式文件统一使用 `style.module.less`
- 通过 `classNames` + CSS Modules 组织样式

本地 `components/`：
- 只有在现成组件不满足需求时才新增
- 每个组件单独目录，使用 `index.tsx` + `style.module.less`
- 保持“展示组件优先”，不要把模块业务逻辑挪进局部组件

## 第 6 步：收尾校验

逐项检查：
- [ ] 新模块结构与 `../../references/module-template/` 对齐
- [ ] `index.tsx` 只负责 `createModule(...)` 组装，不写业务逻辑
- [ ] `defs/type.ts` 的类型链完整且能连通
- [ ] `hooks/index.ts` 保持 `useData -> useController -> useWatcher`
- [ ] `layouts/index.ts` 存在 `LayoutEnum.Default -> Default` 映射
- [ ] 布局和组件样式文件统一使用 `style.module.less`
- [ ] 布局层只消费 `data` / `controllers`
- [ ] 无 `useState`、`useCallback`、`useMemo`、模板占位符残留

**至少执行：**
- `rg -n "__MODULE_NAME__|exampleFn|queryExample|ExampleChildComponent" "src/modules/{ModuleName}"`
- `rg -n "useState|useCallback|useMemo|index\\.module\\.less" "src/modules/{ModuleName}"`
- `find "src/modules/{ModuleName}" -maxdepth 3 -type f | sort`

## 速查表

| 阶段 | 关键动作 | 完成标准 |
|------|---------|---------|
| 读取上下文 | 确认模块边界、数据和交互 | 明确本次是新建还是扩展，输入信息足够落地 |
| 搭建骨架 | 对齐共享模板结构 | 文件树和命名符合模板基线 |
| 定义契约 | 先写 `defs/` | 类型链和静态配置可支撑后续实现 |
| 实现 Hook | 按固定顺序落地 | 数据、控制器、副作用职责清晰 |
| 实现布局 | 保持展示层纯净 | 布局不直接碰 service 和业务状态 |
| 收尾校验 | 扫描结构和禁用模式 | 无模板残留和结构性违规 |

## 常见借口

| 借口 | 现实 |
|------|------|
| “这个页面太简单了，不需要 Hook” | 再简单的页面也会从一致的结构中受益 |
| “先堆在一个文件里，后面再拆” | 后面通常不会拆，而且联调时更难拆 |
| “一个字段没必要用 `useSetState`” | 一致性比这点微优化更重要 |
| “布局里放一个小处理函数没关系” | 放到 `useController`，展示层不要偷带逻辑 |
| “现在没副作用，`useWatcher.ts` 可以不建” | 空文件也是契约的一部分，后面会省事 |

## 危险信号 - 立即停下来重做

- 你在布局组件中使用 `useEffect`、`useState` 或直接导入 service
- 你创建了扁平模块，没有 `defs/`、`hooks/`、`layouts/` 分层
- 你在 `index.tsx` 里编写业务逻辑，而不是只组装模块
- 你跳过类型链，直接用 `any` 或匿名对象向下传
- 你保留了模板占位符，打算“联调时再说”

## 参考文档

| 主题 | 文件 |
|------|------|
| 共享模块模板 | `../../references/module-template/` |
| 业务侧与工程侧代码规则 | `../../references/rules.md` |

## 集成关系

- **可选上游：** `req-collect`
- **直接下游：** `api-integrate`
- **主测试阶段：** `module-test`
- **失败回流：** `bug-fix`
