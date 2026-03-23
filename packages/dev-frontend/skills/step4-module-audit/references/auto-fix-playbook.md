# 自动修复手册

用于把审计中发现的问题直接改成可用代码。目标是“能自动修就自动修”。

## 1. 修复优先级

1. 结构修复（缺文件、缺目录、错误命名）
2. 契约修复（类型链、hooks 链路、layout 映射）
3. 占位符清理（模板残留示例）
4. 风险回归（最小命令验证）

## 2. 常见问题与修复策略

| 问题 | 自动修复动作 |
|------|-------------|
| 缺失 `hooks/useWatcher.ts` | 创建文件，导出最小 watcher 壳 |
| 缺失 `layouts/index.ts` | 创建 `LayoutEnum.Default -> Default` 映射 |
| 样式文件命名为 `index.module.less` | 重命名为 `style.module.less` 并更新 import |
| `index.tsx` 不是 `createModule` 模式 | 重写为标准入口结构 |
| `defs/type.ts` 缺少 `CtrlParams/WatcherParams` | 按模板补齐类型链 |
| `hooks/index.ts` 没有统一编排 | 重构为 `useData -> useController -> useWatcher` |
| 注释风格不符合规范 | 关键函数改为 `/** */` 换行注释；关键表达式或代码改为 `//` 单行注释 |
| 残留 `__MODULE_NAME__` 等占位符 | 按模块真实信息替换或删除示例代码 |

## 3. 标准修复片段

### 3.1 `index.tsx`

```typescript
import { createModule } from '../../utils';
import { MODULE_NAME } from './defs/constant';
import type { ModuleRef, Props } from './defs/type';
import useHooks from './hooks';
import layouts from './layouts';

export default createModule<ModuleRef, Props>({
  displayName: MODULE_NAME,
  layouts,
  useHooks,
});

export type { ModuleRef, Props };
```

### 3.2 `layouts/index.ts`

```typescript
import { LayoutEnum } from '../defs/constant';
import Default from './Default';

const Layouts = {
  [LayoutEnum.Default]: Default,
};

export default Layouts;
```

### 3.3 `hooks/index.ts`

```typescript
import useController from './useController';
import useData from './useData';
import useWatcher from './useWatcher';

const useHooks = (props: any) => {
  const commonProps = { ...props };

  const data = useData(commonProps);
  const controllers = useController({ ...commonProps, data });
  useWatcher({ ...commonProps, data, controllers });

  return { data, controllers };
};

export default useHooks;
```

### 3.4 `hooks/useWatcher.ts` 最小壳

```typescript
import { WatcherParams } from '../defs/type';

export default (_p: WatcherParams) => {
  // keep file for future side effects
};
```

### 3.5 注释修复规范

```typescript
/**
 * 关键函数：使用换行的块注释描述职责、输入或副作用
 */
const handleSubmit = () => {
  // 关键表达式或关键步骤：使用单行注释说明意图
  const payload = buildPayload();
  return requestSubmit(payload);
};
```

修复规则：
- 函数级注释：统一使用 `/** */`，并保持换行
- 表达式/关键代码注释：统一使用 `//` 单行注释

## 4. 命名与文件修复

### 4.1 样式文件统一

```bash
mv layouts/Default/index.module.less layouts/Default/style.module.less
```

同步修复：
- `import styles from './index.module.less'`
- 改为 `import styles from './style.module.less'`

### 4.2 组件目录规范（存在 components 时）

```text
components/
├── index.ts
└── {ComponentName}/
    ├── index.tsx
    └── style.module.less
```

## 5. 占位符清理

先扫描：

```bash
rg -n "__MODULE_NAME__|__MODULE_NAME_EN__|exampleFn|queryExample|ExampleChildComponent" src/modules/{module}
```

清理策略：
- 业务真实值可确定：直接替换
- 仅示例演示用途：删除代码与无效引用
- 可能影响业务语义：标记“需人工确认”，不盲改

## 6. 最小验证

建议至少执行：

```bash
# 结构完整性
find src/modules/{module} -maxdepth 3 -type f | sort

# 导入与占位符扫描
rg -n "style.module.less|__MODULE_NAME__|exampleFn|queryExample" src/modules/{module}
```

如果项目有脚本，再补：
- `npm run lint -- src/modules/{module}`
- `npm run test -- {module}`
- `npm run typecheck`

## 7. 不自动修复的边界

以下情况只报告，不直接改：
- 业务字段命名是否正确（缺少需求上下文）
- 接口参数语义是否正确（需后端协议确认）
- 跨模块共享状态来源是否正确（需全局设计确认）

原则：保守处理语义，激进修复结构。
