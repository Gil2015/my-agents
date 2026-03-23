# 布局模式

布局组件的标准模式 — 仅负责纯展示。

## 核心规则

1. **禁止使用 Hook** — 布局组件中绝不调用 useState、useEffect 或任何 Hook
2. **禁止业务逻辑** — 所有逻辑都在 hooks/useController 中处理
3. **仅通过 Props** — 只接收 `_`（数据）和 `$`（控制器）作为 props
4. **CSS Modules** — 所有样式通过 `.module.less` + `classNames` 实现

## 基础布局模式

```typescript
import React from 'react';
import classNames from 'classnames';
import { Table, Button, Input, Space } from 'antd';
import styles from './index.module.less';
import { columns } from '../../defs/constant';
import type { I{ModuleName}Data, I{ModuleName}Controller } from '../../defs/type';

interface DefaultLayoutProps {
  _: I{ModuleName}Data;
  $: I{ModuleName}Controller;
}

const Default: React.FC<DefaultLayoutProps> = ({ _, $ }) => {
  return (
    <div className={classNames(styles.container)}>
      {/* 搜索栏 */}
      <div className={styles.header}>
        <Space>
          <Input.Search
            placeholder="搜索..."
            onSearch={(value) => $.handleSearch({ keyword: value })}
            allowClear
          />
        </Space>
        <Button type="primary" onClick={$.handleCreate}>
          新建
        </Button>
      </div>

      {/* 数据表格 */}
      <Table
        className={styles.table}
        columns={columns}
        dataSource={_.list}
        loading={_.loading}
        rowKey="id"
        pagination={{
          current: _.query.page,
          pageSize: _.query.pageSize,
          total: _.total,
          onChange: $.handlePageChange,
        }}
      />
    </div>
  );
};

export default Default;
```

## CSS Modules 模式

### 文件：`index.module.less`

```less
.container {
  padding: 16px;
  background: #fff;
  border-radius: 4px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table {
  // 表格特定样式覆盖
}

.actions {
  display: flex;
  gap: 8px;
}
```

### 使用 classNames

```typescript
import classNames from 'classnames';
import styles from './index.module.less';

// 单个类名
<div className={styles.container}>

// 多个类名
<div className={classNames(styles.container, styles.active)}>

// 条件类名
<div className={classNames(styles.item, {
  [styles.selected]: isSelected,
  [styles.disabled]: isDisabled,
})}>
```

## 列表 + 详情布局模式

适用于包含列表视图和详情面板的模块：

```typescript
const Default: React.FC<DefaultLayoutProps> = ({ _, $ }) => {
  return (
    <div className={styles.container}>
      {_.layout === 'list' && (
        <div className={styles.listView}>
          <div className={styles.header}>
            <SearchForm onSearch={$.handleSearch} onReset={$.handleReset} />
            <Button type="primary" onClick={$.handleCreate}>新建</Button>
          </div>
          <Table
            columns={[
              ...columns,
              {
                title: '操作',
                key: 'action',
                render: (_, record) => (
                  <Space>
                    <a onClick={() => $.handleView(record)}>查看</a>
                    <a onClick={() => $.handleEdit(record)}>编辑</a>
                    <a onClick={() => $.handleDelete(record.id)}>删除</a>
                  </Space>
                ),
              },
            ]}
            dataSource={_.list}
            loading={_.loading}
            rowKey="id"
            pagination={{
              current: _.query.page,
              pageSize: _.query.pageSize,
              total: _.total,
              onChange: $.handlePageChange,
            }}
          />
        </div>
      )}

      {_.layout === 'detail' && _.currentItem && (
        <div className={styles.detailView}>
          <Button onClick={() => $.handleSearch({ page: _.query.page })}>
            返回列表
          </Button>
          {/* 详情内容 */}
        </div>
      )}

      {_.layout === 'edit' && (
        <div className={styles.editView}>
          {/* 编辑表单 */}
        </div>
      )}
    </div>
  );
};
```

## 表单布局模式

适用于包含表单编辑的模块：

```typescript
import { Form, Input, Select, DatePicker } from 'antd';

// 在布局组件中（仍然不使用 Hook！）
const Default: React.FC<DefaultLayoutProps> = ({ _, $ }) => {
  return (
    <Form
      initialValues={_.currentItem}
      onFinish={$.handleSave}
      layout="vertical"
    >
      <Form.Item name="name" label="名称" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="status" label="状态">
        <Select options={STATUS_OPTIONS} />
      </Form.Item>
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">保存</Button>
          <Button onClick={() => $.handleSearch({})}>取消</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};
```

注意：Ant Design 的 `Form` 组件管理自身的内部状态 — 这是可以接受的，因为 Form 是 UI 库组件，而非我们的业务逻辑。

## 弹窗模式

在布局中使用内联弹窗：

```typescript
import { Modal } from 'antd';

const Default: React.FC<DefaultLayoutProps> = ({ _, $ }) => {
  return (
    <div className={styles.container}>
      {/* 主内容 */}
      <Table ... />

      {/* 弹窗 — 可见性由 _ 数据控制 */}
      <Modal
        title="详情"
        open={_.layout === 'detail'}
        onCancel={() => $.handleSearch({})}
        footer={null}
      >
        {_.currentItem && (
          <div>
            <p>名称：{_.currentItem.name}</p>
            <p>状态：{_.currentItem.status}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};
```

## 布局中的禁忌

```typescript
// 错误 — 在布局中使用 Hook
const Default = ({ _, $ }) => {
  const [visible, setVisible] = useState(false);  // 禁止！
  useEffect(() => { ... }, []);                     // 禁止！
  const handleClick = useCallback(() => {}, []);    // 禁止！

  return <div>...</div>;
};

// 错误 — 在布局中导入 service
import { getList } from '../../defs/service';  // 禁止！

// 错误 — 在布局中编写业务逻辑
const Default = ({ _, $ }) => {
  const filteredList = _.list.filter(item => item.status === 1);  // 禁止！应在 useData 中处理
  return <Table dataSource={filteredList} />;
};
```

仅用于展示的简单数据转换（如格式化日期字符串）在布局中是可以接受的。复杂的筛选、排序或计算必须放在 useData 中使用 `useCreation` 处理。
