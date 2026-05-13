/**********************************************************************
 * 监听事件 hook
 * @description 管理业务模块的事件监听
 *              语法糖：_为dataState, $为controller返回方法
 *********************************************************************/
import type { ModuleWatcherApi } from '@/shared/utils/module';
import { useEffect } from 'react';
import type useController from './useController';

/**
 * 监听事件 hook
 */
const useWatcher = ({ $, _ }: ModuleWatcherApi<typeof useController>) => {
  /**
   * （可删）
   */
  useEffect(() => {
    console.log('current dataState', _);
    $.exampleFn();
  }, []);
};

export default useWatcher;
