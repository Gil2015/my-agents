# 测试策略指南

如何在手动测试和自动化测试之间做出选择，以及如何编写有效的测试。

## 测试类型决策矩阵

```
该行为是否在代码中可观测？（数据、逻辑、状态）
  └─ 是 → 自动化测试
  └─ 否 → 是否涉及视觉渲染？
            └─ 是 → 手动检查清单
            └─ 否 → 是否涉及用户交互流程？
                      └─ 是 → 手动检查清单（尽可能加入自动化）
                      └─ 否 → 评估该项是否具有可测试性
```

## 自动化测试

### 适合自动化的内容

| 类别 | 示例 | 测试方法 |
|----------|----------|---------------|
| 工具函数 | formatDate, calculateTotal, parseResponse | 单元测试：输入 → 输出 |
| 数据转换 | useCreation 计算值 | 使用 mock 数据的单元测试 |
| Hook 状态逻辑 | useData 初始状态、状态变更 | renderHook + act |
| Hook 控制器 | useController 处理函数行为 | renderHook + act |
| 组件渲染 | 给定 props 后是否正确渲染元素 | render + screen 查询 |
| 条件展示 | 根据数据状态显示/隐藏 | 传入不同 props 进行 render |

### 测试 Hooks

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import useData from '../hooks/useData';

describe('useData', () => {
  it('initializes with default query state', () => {
    const { result } = renderHook(() => useData());
    expect(result.current.query.page).toBe(1);
    expect(result.current.query.pageSize).toBe(10);
    expect(result.current.loading).toBe(true);
  });

  it('updates query via setQuery', () => {
    const { result } = renderHook(() => useData());
    act(() => {
      result.current.setQuery({ keyword: 'test' });
    });
    expect(result.current.query.keyword).toBe('test');
  });
});
```

### 测试控制器

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import useController from '../hooks/useController';

describe('useController', () => {
  const mockSetQuery = jest.fn();
  const mockFetchList = jest.fn();

  it('handleSearch resets page to 1', () => {
    const { result } = renderHook(() =>
      useController({ setQuery: mockSetQuery, fetchList: mockFetchList })
    );
    act(() => {
      result.current.handleSearch({ keyword: 'test' });
    });
    expect(mockSetQuery).toHaveBeenCalledWith({ keyword: 'test', page: 1 });
  });
});
```

### 测试组件

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import Default from '../layouts/Default';

const mockData = {
  loading: false,
  list: [{ id: '1', name: 'Test Item', status: 1 }],
  total: 1,
  query: { page: 1, pageSize: 10 },
};

const mockControllers = {
  handleSearch: jest.fn(),
  handleDelete: jest.fn(),
  handleCreate: jest.fn(),
};

describe('Default Layout', () => {
  it('renders data in table', () => {
    render(<Default _={mockData} $={mockControllers} />);
    expect(screen.getByText('Test Item')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<Default _={{ ...mockData, loading: true }} $={mockControllers} />);
    // Check for spinner/loading indicator
  });

  it('calls handleCreate on button click', () => {
    render(<Default _={mockData} $={mockControllers} />);
    fireEvent.click(screen.getByText('新建'));
    expect(mockControllers.handleCreate).toHaveBeenCalled();
  });
});
```

## 手动测试

### 检查项格式

```markdown
### [M-{number}] {测试名称}
- **关联验收标准:** REQ-{X}/AC-{Y}
- **前置条件:** {测试前需满足的条件}
- **步骤:**
  1. {操作 1}
  2. {操作 2}
  3. {操作 3}
- **预期结果:** {应该发生什么}
- **边界情况:**
  - {变体 1}: {预期行为}
  - {变体 2}: {预期行为}
- **结果:** PASS / FAIL / BLOCKED
- **备注:** {任何观察}
```

### 手动测试类别

| 类别 | 检查内容 |
|----------|--------------|
| 布局/间距 | 元素是否正确对齐，间距是否一致 |
| 响应式 | 不同视口宽度下是否正常工作 |
| 加载状态 | 数据请求期间是否显示 Spinner/骨架屏 |
| 空状态 | 无数据时是否显示合适的占位内容 |
| 错误状态 | 接口失败时是否显示错误信息 |
| 表单校验 | 必填字段、格式校验、错误提示信息 |
| 用户反馈 | 操作后是否显示成功/失败提示 |
| 导航跳转 | 链接/按钮是否跳转到正确的页面 |
| 键盘操作 | Tab 顺序、Enter 提交、Escape 关闭 |
| 滚动行为 | 长列表是否正常滚动、吸顶是否生效 |

## 边界用例检查清单

每个模块都应测试的标准边界用例：

### 数据边界

- [ ] 空列表（0 条数据）
- [ ] 仅一条数据
- [ ] 最大数据量（使用 500+ 条 mock 数据测试）
- [ ] 所有字段为 null/undefined
- [ ] 所有字段达到最大长度
- [ ] 特殊字符：`<script>alert('xss')</script>`
- [ ] Unicode：中文、日文、emoji
- [ ] 超长文本（单字段 1000+ 个字符）

### 交互边界

- [ ] 双击提交按钮
- [ ] 快速翻页（连续快速点击下一页 10 次）
- [ ] 接口仍在加载时提交表单
- [ ] 保存操作进行中时离开页面
- [ ] 编辑过程中刷新页面
- [ ] 浏览器后退按钮行为

### 状态边界

- [ ] 页面刷新后状态是否保留（如有此预期）
- [ ] 多个标签页打开同一模块
- [ ] 操作过程中会话过期
- [ ] 网络断开后重新连接

## 覆盖率目标

| 测试类型 | 覆盖目标 | 优先级 |
|-----------|----------------|----------|
| 正常流程（每条验收标准） | 100% | P0 |
| 错误状态 | 80%+ | P1 |
| 边界用例 | 60%+ | P2 |
| 自动化单元测试 | 所有逻辑函数 | P0 |
| 自动化 Hook 测试 | 所有 Hooks | P1 |
| 手动 UI 检查 | 所有可见元素 | P1 |
