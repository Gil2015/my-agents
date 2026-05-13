/**********************************************************************
 * 模块事件 hook
 * @description 管理业务模块的交互事件、函数
 *********************************************************************/
import type { ModuleControllerApi } from '@/shared/utils/module';
import { useMemoizedFn } from 'ahooks';
import type useData from './useData';

/**
 * 模块交互 hook
 */
const useController = ({ props, _ }: ModuleControllerApi<typeof useData>) => {
  /**
   * 示例交互函数（可删）
   */
  const exampleFn = useMemoizedFn(() => {
    // 触发对外回调（可删）
    props.actions?.onExampleEvent?.('example');
    console.log('current dataState', _);
  });

  return {
    exampleFn,
  };
};

export default useController;
