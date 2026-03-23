---
name: module-test
description: Use when testing a frontend module against its acceptance criteria, before deployment
---

# 模块测试

## 概述

使用手动清单与自动化测试相结合的方式，系统性地测试前端模块中的每一条验收标准。

**核心原则：** 每条验收标准都必须有对应的测试 — 未经测试的需求就是未经验证的假设。

**违反规则的字面意思就是违反规则的精神。**

## 适用场景

**必须使用：**
- 模块开发（Phase 3）已完成
- 接口联调（Phase 4）发生变更后
- 模块代码经历重大改动后
- 在宣布模块"完成"之前

**例外情况（需征询开发者）：**
- 不会上线的一次性原型
- 未改动代码的重新部署（使用现有测试报告即可）

觉得"这个功能太简单了不用测"？打住。简单功能出了 Bug 照样是 Bug。

## 铁律

```
EVERY ACCEPTANCE CRITERION MUST HAVE A CORRESPONDING TEST — NO "TOO OBVIOUS TO TEST" EXEMPTIONS
```

因为"明显能正常工作"就跳过了某条验收标准？回去。把测试或清单项补上。

**没有例外：**
- 纯视觉类功能也必须有手动清单项
- "主流程能跑通"远远不够 — 必须测试错误状态和边界情况
- 没有实际验证就不准标 PASS — 禁止自动放行

## 执行流程

```dot
digraph process {
  rankdir=TB
  node [shape=box, style=filled, fillcolor="#cce5ff"]

  load [label="1. LOAD\nRead requirements"]
  map [label="2. MAP\nPlan tests for each AC"]
  auto [label="3. AUTO-TEST\nWrite + run automated tests"]
  manual [label="4. MANUAL-CHECKLIST\nGenerate manual test items"]
  edge [label="5. EDGE CASES\nAdd boundary tests"]
  report [label="6. REPORT\nGenerate test report"]

  load -> map -> auto -> manual -> edge -> report
}
```

### 第 1 步：LOAD — 加载需求

读取结构化需求文档：
- `.ai/requirements/{module}.req.md` — 所有 REQ/AC 条目
- `src/modules/{module}/` 中的源码 — 理解实际实现
- `.ai/designs/{module}/component-mapping.md` — 理解预期 UI

### 第 2 步：MAP — 制定测试计划

针对每条 REQ 及其 AC，确定测试方式：

| AC 类型 | 测试方式 | 示例 |
|---------|---------|------|
| 数据展示/格式化 | 自动化 | "金额显示保留 2 位小数" |
| 状态逻辑/流转 | 自动化 | "状态从草稿变为已发布" |
| 工具/辅助函数 | 自动化 | "formatDate 返回正确格式" |
| Hook 行为 | 自动化 | "useData 在请求期间返回 loading=true" |
| UI 布局/视觉效果 | 手动清单 | "滚动时 Header 固定在顶部" |
| 用户交互流程 | 手动清单 | "点击删除 → 弹出确认对话框 → 项目被移除" |
| 响应式表现 | 手动清单 | "移动端隐藏表格列" |
| 跨浏览器渲染 | 手动清单 | "在 Chrome 和 Firefox 中正常渲染" |

### 第 3 步：AUTO-TEST — 编写自动化测试

在 `__test__/index.tsx` 中编写自动化测试：

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { render, screen, fireEvent } from '@testing-library/react';

describe('{ModuleName}', () => {
  describe('REQ-001: {requirement title}', () => {
    it('AC-001: {acceptance criterion}', () => {
      // Arrange → Act → Assert
    });

    it('AC-002: {acceptance criterion}', () => {
      // Arrange → Act → Assert
    });
  });
});
```

测试分类：
- **Hook 测试**：使用 `renderHook` 测试 useData、useController 逻辑
- **组件测试**：使用 `render` + `screen` 测试 Layout 渲染
- **工具函数测试**：直接调用格式化器、校验器、转换器
- **Mock 数据测试**：验证 Mock 生成器产出的数据结构是否正确

运行测试并记录结果。

### 第 4 步：MANUAL-CHECKLIST — 生成手动测试清单

为 UI/交互类测试生成手动测试项：

```markdown
### Manual Test: REQ-001 AC-003
- **Precondition:** User is logged in, on the {module} list page
- **Steps:**
  1. Click the "新建" button
  2. Fill in required fields: name = "Test", status = "Active"
  3. Click "保存"
- **Expected:** Form submits, success message shows, list refreshes with new item
- **Edge case:** Submit with empty required fields → validation errors shown
```

### 第 5 步：EDGE CASES — 边界测试

在显式 AC 之外，补充边界和压力测试：

| 类别 | 测试用例 |
|------|---------|
| 空数据 | 空列表显示占位符，空字段显示默认值 |
| 大数据量 | 1000+ 条数据不崩溃，分页正常运作 |
| 特殊字符 | 文本字段中的中文、emoji、HTML 实体 |
| 并发操作 | 双击提交、快速翻页 |
| 权限边界 | 未授权操作显示正确的错误提示 |
| 网络异常 | API 超时显示错误状态，可重试 |
| Null/undefined | API 返回的可空字段不导致渲染崩溃 |

### 第 6 步：REPORT — 生成测试报告

按照 `references/test-report-format.md` 中的格式生成测试报告。

每条 AC 标记为：
- **PASS**：测试/检查通过
- **FAIL**：测试/检查失败 — 附上复现步骤并创建 Bug 条目
- **BLOCKED**：因依赖无法测试（API 未就绪、环境问题等）

## 速查表

| 阶段 | 关键活动 | 完成标准 |
|------|---------|---------|
| LOAD | 阅读需求文档 + 源码 | 完全理解上下文 |
| MAP | 为每条 AC 规划测试方式 | 每条 AC 都分配了测试类型 |
| AUTO-TEST | 编写并运行自动化测试 | 测试执行完毕，结果已记录 |
| MANUAL-CHECKLIST | 生成手动测试项 | 每条 UI/交互 AC 都已覆盖 |
| EDGE CASES | 补充边界测试 | 关键边界场景已识别并测试 |
| REPORT | 生成测试报告 | 每条 AC 都有 PASS/FAIL/BLOCKED 状态 |

## 常见借口

| 借口 | 现实 |
|------|------|
| "主流程能跑通" | 主流程只占实际使用的 20% |
| "边界情况不会发生" | 第一次演示给用户看的时候就会发生 |
| "回头我手动测一下" | 没有清单，你一定会遗漏 |
| "自动化测试是杀鸡用牛刀" | 它能捕获你注意不到的回归问题 |
| "空状态不重要" | 新用户首先看到的就是空状态 |

## 危险信号 — 立即停下来

- 你在没有实际运行测试的情况下就把 AC 标记为 PASS
- 你因为"需求里没提到"就跳过了边界测试
- 一个包含业务逻辑的模块，你的自动化测试数量为零
- 你的手动清单步骤含糊其辞，比如"验证功能正常"
- 你测的是实现细节而不是行为

## 参考文档

| 主题 | 文件 |
|------|------|
| 测试报告格式 | `references/test-report-format.md` |
| 测试策略指南 | `references/test-strategy.md` |

## 集成关系

- **依赖：** `ui-dev`（Phase 3），可选依赖 `api-integrate`（Phase 4）
- **输出消费者：** `bug-fix`（Phase 6）
