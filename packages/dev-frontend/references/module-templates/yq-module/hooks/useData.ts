/**********************************************************************
 * 模块数据 hook
 * @description 管理业务模块的请求、数据定义、全局状态管理
 *********************************************************************/
import { useSharedState } from '@/shared/hooks'; // 如有跨组件共享状态，按需引入 useSharedState 和对应 store（没有可删）
import type { ModuleDataHookApi } from '@/shared/utils/module';
import { useRequest, useSetState } from 'ahooks';
import { moduleStore } from '../defs/constants';
import services from '../defs/services';
import type { DataState, Props } from '../defs/types';

/**
 * 模块数据 hook
 */
const useData = ({ props, $ }: ModuleDataHookApi<Props>) => {
  const [sharedState, setSharedState] = useSharedState(moduleStore); // （可删）
  const [dataState, setDataState] = useSetState<DataState>({
    rowData: [], // （可删）
  });

  /**
   * 数据查询定义示例（可删）
   */
  const { run: runTableData } = useRequest(services.queryExample, {
    manual: true,
    onSuccess: (res) => {
      console.log('props', props);
      setDataState({ rowData: res.data });
      $.exampleFn?.(); // 调用 useController 挂载后的方法（可删）
    },
  });

  return {
    dataState,
    setDataState,
    sharedState,
    setSharedState,
    runTableData,
  };
};

export default useData;
