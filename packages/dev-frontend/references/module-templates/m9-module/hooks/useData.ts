/**********************************************************************
 * 模块数据 hook
 * @description 用于管理业务模块的请求、数据定义(包含useMemo、useCreation定义
 *              的数据)、全局状态管理
 *********************************************************************/
import { useRequest, useSetState } from "ahooks";
import { useAtomState } from "../../../hooks"; // 如有跨组件共享状态，按需引入 useAtomState 和对应 atom（没有可删）
import { moduleAtom } from "../defs/constant";
import { services } from "../defs/service";
import { DataParams, DataState } from "../defs/type";

/**
 * 模块数据 hook
 */
const useData = (_p: DataParams) => {
  const [moduleState, setModuleState] = useAtomState(moduleAtom); // （可删）
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
    // moduleState,
    // setModuleState,
  };
};

export default useData;
