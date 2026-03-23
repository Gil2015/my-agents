# Bug 分析指南

如何分析、分类和排列 Bug 优先级，以高效修复缺陷。

## Bug 分类

### 分类 1：数据类 Bug

数据错误、缺失或格式不正确。

**表现症状：**
- 显示的值有误
- 页面出现 "Invalid Date"、"NaN"、"undefined"
- 应有数据的字段为空
- 展示数据与接口响应不一致

**排查路径：**
```
Display ← Layout props ← hooks/index.ts ← useData ← service ← API response
```

逐环节检查数据链，数据出错的第一个环节就是根因所在。

**常见原因：**
- 接口响应与 TypeScript 类型定义不匹配
- useData 中缺少数据转换（useCreation）
- 列定义或 Layout 中字段名写错
- 接口响应多嵌套了一层，未被正确处理

### 分类 2：交互类 Bug

用户操作未产生预期结果。

**表现症状：**
- 点击无反应
- 触发了错误的操作
- 操作成功但 UI 未更新
- 单次点击触发了两次操作

**排查路径：**
```
UI Event → Layout handler ($.) → useController → service call → useData state update → re-render
```

**常见原因：**
- 事件处理函数未绑定到元素（缺少 onClick、onSubmit）
- useMemoizedFn 闭包捕获了过期数据
- 数据变更后缺少 fetchList() 刷新
- setQuery/setState 未触发重新渲染

### 分类 3：状态类 Bug

组件状态进入无效或过期状态。

**表现症状：**
- 导航后仍显示旧数据
- 表单显示上一条记录的数据
- 加载指示器卡住不消失
- 分页意外重置

**排查路径：**
```
Current state → useSetState calls → triggers → useRequest refreshDeps → re-render
```

**常见原因：**
- 切换视图时状态未重置（setQuery 未重置所有字段）
- useRequest 的 refreshDeps 遗漏了依赖项
- 多次状态更新未正确批处理
- useWatcher 缺少清理副作用（cleanup effect）

### 分类 4：布局/样式类 Bug

视觉渲染不正确。

**表现症状：**
- 元素对齐错误
- 内容溢出/被裁剪
- 颜色/字体错误
- 响应式布局崩溃

**排查路径：**
```
CSS Module class → classNames application → parent container → CSS specificity
```

**常见原因：**
- classNames 中 CSS 类名缺失或错误
- CSS Module 未导入（使用了普通字符串类名）
- 父容器缺少 flex/grid 属性
- CSS 优先级与 UI 库样式冲突

### 分类 5：类型类 Bug

TypeScript 类型错误或不完整。

**表现症状：**
- TypeScript 编译错误
- 运行时类型错误（读取 undefined 的属性）
- 自动补全建议不正确
- 类型断言（`as any`）掩盖了真实问题

**排查路径：**
```
type.ts definitions → service.ts usage → hook usage → layout props
```

**常见原因：**
- 接口响应类型与实际响应不匹配
- 可选字段（`?`）用在了应该用可为空（`| null`）的地方
- 泛型类型参数缺失或错误
- 各层之间的类型链断裂

## 分类优先级矩阵

| 严重程度 | 影响范围 | 示例 | 修复紧迫性 |
|----------|--------|---------|-------------|
| 致命 | 功能完全不可用 | 页面崩溃、数据丢失、安全漏洞 | 立即修复 |
| 高 | 核心功能受损 | 无法创建/编辑/删除、计算结果错误 | 演示/发布前修复 |
| 中 | 功能可用但有问题 | 格式错误、轻微逻辑错误、UI 异常 | 当前迭代内修复 |
| 低 | 外观/轻微体验问题 | 对齐偏差、文字错误、动画卡顿 | 有空时修复 |

## 根因分析模板

修复每个 Bug 前，先写出以下分析：

```markdown
### BUG-{ID} Analysis

**症状:** {用户/测试人员看到的现象}

**复现步骤:**
1. {步骤 1}
2. {步骤 2}
3. {步骤 3}
→ 预期结果: {正确行为}
→ 实际结果: {错误行为}

**数据流追踪:**
{Component} receives `{prop}` = {value}
  ← from hooks/index.ts `_.{field}` = {value}
    ← from useData `{source}` = {value}
      ← from API response `{field}` = {value} ← ROOT CAUSE HERE

**根因:** {一句话解释为什么出错}

**修复方案:** {一句话描述要改什么}

**需修改文件:** {文件列表}

**风险评估:** {这个修改还可能影响什么？}
```

## 多 Bug 处理策略

当存在多个 Bug 时：

1. **按严重程度排序**：致命 → 高 → 中 → 低
2. **识别依赖关系**：修复 BUG-001 是否会自动解决 BUG-003？
3. **逐个修复**：对每个 Bug 完成完整周期（排查 → 修复 → 验证）
4. **重跑全部测试**：修复一批后，重新运行完整测试套件

## 需要避免的反模式

| 反模式 | 为什么有害 | 正确做法 |
|-------------|-------------|-----------------|
| 散弹式调试 | 随机改代码浪费时间 | 系统性追踪数据流 |
| 复制粘贴式修复 | 造成代码重复并掩盖根因 | 理解问题本质并从源头修复 |
| 防御性过度工程 | 到处加 null 检查会掩盖真正的 Bug | 从源头修复 null 的产生 |
| 静默吞掉异常 | 不打日志的 try-catch 会隐藏 Bug | 显式处理错误 |
| "我本地没问题" | 环境差异很重要 | 记录精确的复现步骤 |
