/**********************************************************************
 * 模块数据 hook
 * @description 用于管理业务模块的请求、数据定义(包含useMemo、useCreation定义
 *              的数据)、全局状态管理
 *********************************************************************/
import { App, Icon, MenuProps } from "@m9/tools-ui-components";
import { useCreation, useMemoizedFn, useRequest, useSetState } from "ahooks";
import React, { useEffect } from "react";
import { Column } from "../../../components";
import { useAtomState, useCRUD } from "../../../hooks";
import { TabModalComponentTypeEnum } from "../../../layouts/TabModal/type";
import { checkBlobError, renderDownloadFile } from "../../../utils";
import { transformColumns } from "../../../utils/transform";
import { moduleAtom } from "../../SimulatedEstimation/defs/constant";
import { Plan } from "../components/PlanBlock";
import { RENDER_ADD_COLUMNS } from "../defs/constant";
import { services } from "../defs/service";
import { DataParams, DataState } from "../defs/type";
import styles from "../layouts/Default/style.module.less";

/**
 * 模块数据 hook
 */
const useData = (p: DataParams) => {
  const [scopeState, setScopeState] = useAtomState(moduleAtom);
  const { modal, message } = App.useApp();
  const [dataState, setDataState] = useSetState<DataState>({
    columns: [],
    planDetail: {},
    selectedPlanKey: "",
    showEffective: true,
    templateFileList: [],
  });
  const _ = dataState;
  const { accountId, simPlanId } = scopeState.formValues;

  /**
   * 获取模拟交易原始数据
   */
  const { runAsync: runGetSimulateOrderAsync } = useRequest(
    services.getSimulateOrder,
    {
      manual: true,
    },
  );

  /**
   * 行数据编辑
   */
  const handleEditRow = useMemoizedFn(async (rowData: any) => {
    // 调接口获取模版信息
    const { data } = await runGetSimulateOrderAsync({
      id: rowData?.id,
    });
    if (data.accountParams?.length) {
      data.accountParams[0].id = rowData?.id;
    }
    p.actions?.onEditTradeItem?.({
      templateInfo: data,
      tabDataId: _.selectedPlanKey,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      tabDataName: `编辑-${schemeName}`,
      component: TabModalComponentTypeEnum.CreateSimulatedTrading,
      rowData,
    });
  });

  useEffect(() => {
    if (simPlanId) {
      setDataState({ selectedPlanKey: simPlanId });
    }
  }, [simPlanId]);

  /**
   * 行数据删除（后续移到controller里）
   */
  const handleDeleteRow = (rowData: any) => {
    modal.confirm({
      title: "删除交易",
      content: `确定删除该交易吗？`,
      onOk: () => {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        deleteSimulatedTrade({
          ids: rowData.id,
        });
      },
    });
  };

  const handleSetPlan = useMemoizedFn((msg: string) => {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    queryTableData();
    message.success(msg);
    p.actions?.onHandleUpdatedPlan?.();
  });

  /**
   * 批量删除交易
   */
  const handleMultiDeleteRow = useMemoizedFn(() => {
    let hasSelected = false;
    p.gridRef.current?.gridApi?.forEachNodeAfterFilter((node: any) => {
      if (node.selected) {
        hasSelected = true;
      }
    });

    if (!hasSelected) {
      message.warning("请选择要删除的交易");
      return;
    }

    modal.confirm({
      title: "删除交易",
      content: `确定删除选中的交易吗？`,
      onOk: () => {
        const selectedIds =
          p.gridRef.current?.gridApi
            ?.getSelectedRows()
            .map((item) => item.id) || [];
        const ids: string[] = [];
        p.gridRef.current?.gridApi?.forEachNodeAfterFilter((node: any) => {
          if (selectedIds.includes(node.data.id)) {
            ids.push(node.data.id);
          }
        });
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        deleteSimulatedTrade({ ids: ids.join(",") });
      },
    });
  });

  /**
   * 选中所有行
   */
  const handleSelectAll = useMemoizedFn(() => {
    p.gridRef.current?.gridApi?.selectAll();
  });

  /**
   * 获取表头配置
   */
  const { run: runQueryColumnsConfig, loading: columnLoading } = useRequest(
    services.queryColumnsConfig,
    {
      manual: true,
      onSuccess: (res) => {
        const columns = transformColumns(res.data || []);
        setDataState({
          columns: [
            ...RENDER_ADD_COLUMNS(
              handleEditRow,
              handleDeleteRow,
              handleMultiDeleteRow,
              handleSelectAll,
            ),
            ...columns,
          ],
        });
      },
    },
  );

  /**
   * 方案增删改查
   */
  const {
    loading,
    setData,
    data: plans,
    query,
    createAsync,
    updateAsync,
    updateLoading,
    removeAsync,
  } = useCRUD<Plan>({
    query: {
      service: services.querySimulatedTrade,
      manual: true,
      onSuccess: (res) => {
        const { data = [] } = res;
        const sortData = data.sort?.((a: any, b: any) => b.planId - a.planId);
        const selectedKey = sortData.length ? sortData?.[0].planId : undefined;

        if (p.needTogglePlan.current === true) {
          setDataState({ selectedPlanKey: selectedKey });
          p.needTogglePlan.current = false;
        }
        setData(sortData);
      },
    },
    create: {
      service: services.saveSimulateScheme,
      onSuccess: (_res) => {
        handleSetPlan("新建成功");
      },
    },
    update: {
      service: services.saveSimulateScheme,
      onSuccess: () => {
        handleSetPlan("编辑成功");
      },
    },
    remove: {
      service: services.deleteSimulateScheme,
      onSuccess: () => {
        handleSetPlan("删除成功");
      },
    },
  });

  const { run: copyPlan } = useRequest(services.copySimulateScheme, {
    manual: true,
    onSuccess: (res) => {
      if (res.data) {
        handleSetPlan("复制成功");
      } else {
        message.error("复制失败");
      }
    },
  });

  const { run: deleteSimulatedTrade } = useRequest(
    services.deleteSimulatedTrade,
    {
      manual: true,
      onSuccess: () => {
        handleSetPlan("删除成功");
      },
    },
  );

  /**
   * 下载指令导入模板
   * @param fileId 模版文件的fileId
   */
  const { run: runDownloadTemplate } = useRequest(
    services.downloadBatchOrderTemplate,
    {
      manual: true,
      onSuccess: async (res, params) => {
        // 尝试解析 Blob 中的错误信息
        const errorResult = await checkBlobError(res);
        if (errorResult) {
          message.error(errorResult.message);
          return;
        }

        const fileName =
          _.templateFileList.find((item) => item.fileId === params[0].fileId)
            ?.fileName || "";

        renderDownloadFile({
          data: res,
          tableName: fileName,
        });
      },
      onError: (error: any) => {
        message.error(error?.message || "下载失败");
      },
    },
  );

  /**
   * 文件指令数据导入
   */
  const { runAsync: importFileAsync } = useRequest(services.importFile, {
    manual: true,
    onSuccess: (res: any) => {
      const { data } = res;
      const planName = _.selectedPlanKey
        ? plans.find((item) => item.planId === _.selectedPlanKey)?.planName
        : "模拟方案一";

      if (data && data.template) {
        p.actions?.onAddTradeItems?.({
          tabDataId: _.selectedPlanKey,
          tabDataName: `导入模拟交易-${planName}`,
          type: "create",
          component: TabModalComponentTypeEnum.CreateUploadTrading,
          data,
        });
      }
    },
  });

  /**
   * 获取导入模版文件列表
   */
  useRequest(services.getAllBatchOrderTemplateFileInfo, {
    onSuccess: (res) => {
      setDataState({
        templateFileList: res.data || [],
      });
    },
  });

  /**
   * 根据选中方案过滤对应需要展示的表格数据
   */
  const { tableData } = useCreation(() => {
    if (_.selectedPlanKey) {
      const plan = plans.find((item) => item.planId === _.selectedPlanKey);
      const data = plan?.simulateTransactions || [];
      return {
        tableData: _.showEffective ? data.filter((item) => item.isValid) : data,
      };
    }

    return {
      tableData: [],
    };
  }, [plans, _.selectedPlanKey, _.showEffective]);

  const queryTableData = useMemoizedFn(() => {
    if (accountId) {
      query({ fundId: accountId });
    }
  });

  // 当前选中的方案名称
  const schemeName = useCreation(() => {
    const selectScheme = plans?.find(
      (item) => item.planId === _.selectedPlanKey,
    );
    return selectScheme?.planName ? `_${selectScheme?.planName}` : "";
  }, [_.selectedPlanKey, plans]);

  const coverColumnParams = useCreation(
    () =>
      ({
        index: {
          pinned: "left",
          width: 80,
        },
      }) as Record<string, Column>,
    [],
  );

  /**
   * 下载指令导入模板列表
   */
  const downloadList = useCreation(
    () =>
      ({
        items: _.templateFileList.map((item) => ({
          label: item.fileName,
          key: item.fileId,
          icon: React.createElement(Icon, {
            type: "icon-xlsx-template",
            className: styles.icon,
          }),
        })),
        onClick: ({ key }) =>
          runDownloadTemplate({
            fileId: key,
          }),
      }) as MenuProps,
    [_.templateFileList],
  );

  return {
    scopeState,
    setScopeState,
    ...dataState,
    loading: loading || columnLoading,
    updateLoading,
    plans,
    tableData,
    schemeName,
    setDataState,
    createAsync,
    updateAsync,
    removeAsync,
    query,
    accountId,
    copyPlan,
    queryTableData,
    runQueryColumnsConfig,
    coverColumnParams,
    downloadList,
    message,
    importFileAsync,
  };
};

export default useData;
