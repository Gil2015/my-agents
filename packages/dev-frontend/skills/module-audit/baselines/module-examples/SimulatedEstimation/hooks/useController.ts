import { useMemoizedFn } from "ahooks";
import { CtrlParams } from "../defs/type";

/**
 * 模块交互 hook
 */
const useController = ({ data: _, ...p }: CtrlParams) => {
  /**
   * 模拟推算按钮点击事件
   */
  const handleSubmit = useMemoizedFn(async () => {
    if (_.formValues.accountId && _.formValues.date) {
      p.actions?.onHandleSubmit?.();
    }
  });

  /**
   * 更新模拟交易下拉选项数据
   */
  const updateSimulatePlans = useMemoizedFn(() => {
    if (_.formValues.accountId) {
      _.runGetSimulatePlans({ fundId: _.formValues.accountId });
    }
  });

  /**
   * 表单值变更事件
   */
  const handleFormChange = useMemoizedFn((obj, values) => {
    const changedKey = Object.keys(obj)[0];
    const items = _.tabState?.items || [];

    // 如果切换的是产品且有已打开的调仓面板，需要确认是否关闭当前Tab布局栏
    if (changedKey === "accountId" && items.length) {
      const { accountId } = _.formValues; // 获取产品原值，取消时用
      _.modal.confirm({
        title: "切换产品",
        content: `切换测算产品会导致当前已打开的调仓面板关闭，请确认`,
        okText: "确认",
        cancelText: "取消",
        onOk: () => {
          p.actions?.onCloseTab?.();
          _.setScopeState((state: any) => {
            state.formValues = {
              ...values,
            };

            // 清空其他选项
            state.planOptions = [];
            state.formValues.simPlanId = "";
            state.formValues.strategy = "";
            p.form.setFieldsValue({
              simPlanId: "",
              strategy: "",
            });

            return state;
          });
        },
        onCancel: () => {
          _.setScopeState({
            formValues: {
              ...values,
              accountId,
            },
          });
          p.form.setFieldsValue({
            accountId,
          });
        },
      });
    } else {
      _.setScopeState((state: any) => {
        state.formValues = {
          ...values,
        };
        if (changedKey === "accountId") {
          state.planOptions = [];
          state.formValues.simPlanId = "";
          state.formValues.strategy = "";
          p.form.setFieldsValue({
            simPlanId: "",
            strategy: "",
          });
        }
        return state;
      });
    }
  });

  return {
    handleSubmit,
    handleFormChange,
    updateSimulatePlans,
  };
};

export default useController;
