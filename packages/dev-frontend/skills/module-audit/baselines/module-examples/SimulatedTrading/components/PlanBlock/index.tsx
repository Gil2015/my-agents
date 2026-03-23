import {
  App,
  Checkbox,
  CheckboxProps,
  Dropdown,
  FormList,
  Icon,
  MenuProps,
  Modal,
  Tooltip,
} from '@m9/tools-ui-components';
import { useCreation, useMemoizedFn, useSetState } from 'ahooks';
import classNames from 'classnames';
import React, { FC } from 'react';
import styles from './style.module.less';

type SetType = 'create' | 'rename' | 'copy' | 'delete';

export interface Plan {
  userId: number;
  addedDateTime: string;
  planId: string;
  planName: string;
  simulateTransactions: any[];
  sortId: number;
  isValid: string;
}

interface Props {
  data: Plan[];
  selectedKey: string;
  togglePlan: Fn<string>;
  setPlan: Fn<[SetType, string, Plan?]>;
  toggleEffective: CheckboxProps['onChange'];
}

interface DataState {
  showModal: boolean;
  modalType: SetType;
  modalPlanId: string;
}

const TITLE_MAP = {
  create: '新建方案',
  rename: '重命名方案',
  copy: '复制方案',
};

const PlanBlock: FC<Props> = (p) => {
  const [form] = FormList.useForm();
  const { modal } = App.useApp();
  const [{ showModal, modalType, modalPlanId }, setDataState] =
    useSetState<DataState>({
      showModal: false,
      modalType: 'create',
      modalPlanId: '',
    });

  /**
   * 选择方案
   */
  const handleSelect = (item: any) => {
    p.togglePlan(item.planId);
  };

  /**
   * 当前正在编辑的方案
   */
  const editingModalData = useCreation(() => {
    if (!modalPlanId) return undefined;

    return p.data.find((item) => item.planId === modalPlanId);
  }, [modalPlanId]);

  /**
   * 方案弹框标题
   */
  const modalTitle = useCreation(() => {
    const suffix =
      modalType === 'create' ? '' : `-${editingModalData?.planName}`;
    return TITLE_MAP[modalType as keyof typeof TITLE_MAP] + suffix;
  }, [editingModalData, modalType]);

  /**
   * 方案操作
   */
  const handleSet = (key: SetType, planItem?: Plan) => {
    if (['create', 'copy'].includes(key) && p.data?.length >= 20) {
      modal.error({
        content: '有效方案不能超过20个',
      });
      return;
    }
    if (key === 'delete') {
      modal.confirm({
        title: `确定删除 ${planItem!.planName}吗？`,
        content: '若当前测算参数选择了该模拟方案，删除方案将同时清空测算结果。',
        onOk: () => {
          p.setPlan(key, planItem!.planName, planItem);
        },
      });
    } else {
      form.setFieldValue('planName', planItem?.planName ?? '');
      setDataState({
        showModal: true,
        modalType: key,
        modalPlanId: planItem?.planId ?? '',
      });
    }
  };

  /**
   * 方案操作菜单
   */
  const renderItemConfig = useMemoizedFn((planItem) => {
    return {
      items: [
        {
          label: '重命名',
          key: 'rename',
          disabled: planItem.IS_CREATOR === 'N',
        },
        { label: '复制', key: 'copy' },
        { label: '删除', key: 'delete', disabled: planItem.IS_CREATOR === 'N' },
      ],
      onClick: ({ key, domEvent }) => {
        // 阻止冒泡，避免触发方案切换
        domEvent.stopPropagation();
        handleSet(key as SetType, planItem);
      },
    } as MenuProps;
  });

  /**
   * 方案编辑确认按钮
   */
  const confirmPlan = () => {
    form.validateFields().then(({ planName }) => {
      p.setPlan(modalType, planName, editingModalData);
      setDataState({ showModal: false });
    });
  };

  return (
    <div className={styles.con}>
      {p.data.map((item) => (
        <div
          key={item.planId}
          className={classNames(styles.btn, 'm9-ellipsis', {
            [styles.active]: p.selectedKey === item.planId,
          })}
          onClick={() => handleSelect(item)}
          title={item.planName}
        >
          {item.planName}
          <Dropdown menu={renderItemConfig(item)}>
            <Icon className={styles.icon} type="icon-gengduo" rotate={90} />
          </Dropdown>
        </div>
      ))}
      <div
        className={classNames(styles.btn, styles.create)}
        onClick={() => handleSet('create')}
      >
        <Tooltip rootClassName="tooltip-icon" title="新建方案">
          +
        </Tooltip>
      </div>
      <Checkbox
        className={styles.checkbox}
        defaultChecked
        onChange={p.toggleEffective}
      >
        仅展示有效
      </Checkbox>
      <Modal
        className={styles.modal}
        title={modalTitle}
        open={showModal}
        onCancel={() => setDataState({ showModal: false })}
        onOk={() => confirmPlan()}
      >
        {/* <Info value="共享、意向状态将同步复制。意向仅复制标识，不会重新转意向单" /> */}
        <FormList
          form={form}
          config={[
            {
              label: '方案名称',
              name: 'planName',
              component: 'input',
              placeholder: '请输入方案名称',
              autoComplete: 'off',
              rules: [{ required: true, message: '请输入方案名称' }],
            },
          ]}
        />
      </Modal>
    </div>
  );
};

export default PlanBlock;
