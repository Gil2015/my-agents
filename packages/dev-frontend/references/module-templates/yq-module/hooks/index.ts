/**********************************************************************
 * 模块hooks集合
 * @description 链式调用模块hooks，方便统一管理。
 *********************************************************************/
import { createHooks, type ModuleLayoutProps } from '@/shared/utils/module';
import type { Props } from '../defs/types';
import useController from './useController';
import useData from './useData';
import useWatcher from './useWatcher';

/**
 * 模块hooks集合
 */
const useHooks = createHooks<Props>()({
  useData,
  useController,
  useWatcher,
  expose: (api) => ({
    exampleMethod: api.controllers.exampleFn, // （可删）
  }),
});

export default useHooks;
export type LayoutProps = ModuleLayoutProps<typeof useHooks>;
