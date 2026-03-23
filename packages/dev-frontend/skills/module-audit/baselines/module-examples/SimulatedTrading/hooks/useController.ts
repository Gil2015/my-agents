/**********************************************************************
 * 模块事件 hook
 * @description 用于管理业务模块的交互事件、函数
 *********************************************************************/
import { message } from "@m9/tools-ui-components";
import { useMemoizedFn } from "ahooks";
import { TabModalComponentTypeEnum } from "../../../layouts/TabModal/type";
import { Plan } from "../components/PlanBlock";
import { CtrlParams } from "../defs/type";

/**
 * 模块交互 hook
 */
const useController = ({ data: _, gridRef, ...p }: CtrlParams) => {
  /**
   * 切换方案
   */
  const togglePlan = useMemoizedFn((key) => {
    _.setDataState({ selectedPlanKey: key });
  });

  /**
   * 显示创建模拟交易弹框
   */
  const showCreateModal = useMemoizedFn(() => {
    const tabDataName = _.schemeName
      ? `新建-${_.schemeName.slice(1)}` // 把第一个字符"_"去掉
      : "新建-模拟方案一";
    p.actions?.onAddTradeItem?.({
      tabDataId: _.selectedPlanKey,
      tabDataName,
      type: "create",
      component: TabModalComponentTypeEnum.CreateSimulatedTrading,
    });
  });

  /**
   * 仅展示有效
   */
  const toggleEffective = () => {
    _.setDataState({ showEffective: !_.showEffective });
  };

  /**
   * 方案操作
   */
  const setPlan = useMemoizedFn((key, name, planData?: Plan) => {
    const newestSortId = _.plans[0]?.sortId || 0;

    switch (key) {
      case "create":
        p.needTogglePlan.current = true;
        _.createAsync({
          fundId: _.accountId,
          planName: name,
          sortId: newestSortId + 1,
        });
        break;
      case "rename":
        _.updateAsync({
          fundId: _.accountId,
          planId: planData?.planId,
          planName: name,
        });
        break;
      case "delete":
        if (planData?.planId === _.selectedPlanKey) {
          p.needTogglePlan.current = true;
        }
        _.removeAsync({
          fundId: _.accountId,
          planId: planData?.planId,
        });
        break;
      case "copy":
        p.needTogglePlan.current = true;
        _.copyPlan({
          planName: name,
          planId: planData?.planId || "",
          sortId: newestSortId + 1,
        });
        break;
      default:
        break;
    }
  });

  /**
   * 表格数据下载
   */
  const downloadTableData = useMemoizedFn(() => {
    gridRef.current?.toExcel();
  });

  /**
   * 显示表格配置弹窗
   */
  const showTableConfigModal = useMemoizedFn(() => {
    gridRef.current?.showConfigModal();
  });

  /**
   * 表格数据查询
   */
  const queryTableData = useMemoizedFn(() => {
    if (!_.plans.length) {
      p.needTogglePlan.current = true;
    }

    _.query({ fundId: _.scopeState.formValues.accountId });
  });

  /**
   * 交易导入
   */
  const handleUpload = useMemoizedFn(async (option: any) => {
    const { file } = option;
    let formData = new FormData();
    formData.append("file", file);
    const hideLoading = message.loading("文件解析中，请稍后...", 0);
    try {
      const res = await _.importFileAsync(formData);
      if (!res.data.template) {
        hideLoading();
        return;
      }

      const data = res.data.accountParams || [];
      hideLoading();
      const dataLen = data?.length || 0;
      const successLen = data.filter(
        (i: any) =>
          !i.checkResults.some(
            (j: any) =>
              j.unifiedCheckStatus === "HARD" && j.ruleName === "批量导入校验",
          ),
      ).length;
      if (dataLen === successLen && successLen > 0) {
        message.success(`指令导入成功，共${dataLen}条!`);
      } else {
        message.warning(
          `指令导入成功，成功${successLen}条，失败${dataLen - successLen}条，请查看【异常】信息`,
        );
      }
    } catch {
      hideLoading();
    }
  });

  const handleBeforeUpload = useMemoizedFn((file): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const _action = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/wps-office.xls",
      ];
      if (_action.includes(file?.type)) {
        const maxSize = 5 * 1024 * 1024;
        if (file?.size > maxSize) {
          _.message.error("导入文件大小不能超过5兆！");
          reject(false);
          return;
        }

        resolve(true);
      } else {
        _.message.error("模板格式错误！");
        reject(false);
      }
    });
  });

  return {
    togglePlan,
    showCreateModal,
    setPlan,
    toggleEffective,
    downloadTableData,
    showTableConfigModal,
    queryTableData,
    handleUpload,
    handleBeforeUpload,
  };
};

export default useController;
