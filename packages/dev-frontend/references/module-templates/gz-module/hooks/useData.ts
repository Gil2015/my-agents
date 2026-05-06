/**********************************************************************
 * 模块数据 hook
 * @description 用于管理业务模块的请求、数据定义(包含useMemo、useCreation定义
 *              的数据)、全局状态管理
 *********************************************************************/
import { useRequest, useSetState } from "ahooks";
import { useZustandState } from "../../../hooks"; // 如有跨组件共享状态，按需引入 useZustandState 和对应 store（没有可删）
import { MODULE_NAME, moduleStore } from "../defs/constant";
import { services } from "../defs/service";
import { DataParams, DataState } from "../defs/type";

/**
 * 模块数据 hook
 */
const useData = (p: DataParams) => {
  const scopeStore = p.stores?.scopeStore ?? moduleStore; // （可删）
  const [scopeState, setScopeState] = useZustandState(scopeStore, MODULE_NAME); // （可删）
  const [dataState, setDataState] = useSetState<DataState>({
    rowData: [], // （可删）
  });

  /**
   * 数据查询定义示例（可删）
   */
  const { run: runTableData } = useRequest(services.queryExample, {
    manual: true,
    onSuccess: (res) => {
      setDataState({ rowData: res.data });
    },
  });

  return {
    ...dataState,
    setDataState,
    runTableData,
    // scopeState,
    // setScopeState,
  };
};

export default useData;
