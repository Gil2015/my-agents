/**********************************************************************
 * 模块hooks集合
 * @description 统一管理模块hooks，方便统一调用。
 *
 * ## 书写规范：
 * - useRef、useForm等的定义在此文件(commonProps上面一行)，通过参数传入commonProps统一供其他
 *   hook或layout使用
 *********************************************************************/
import React, { useImperativeHandle, useRef } from 'react';
import { TableRef } from '../../../components';
import { ModuleRef, Props } from '../defs/type';
import useController from './useController';
import useData from './useData';
import useWatcher from './useWatcher';

/**
 * 模块hooks集合
 */
const useHooks = (props: Props, ref: React.Ref<ModuleRef>) => {
  const gridRef = useRef<TableRef>(null);
  const needTogglePlan = useRef(false);
  const commonProps = {
    ...props,
    gridRef,
    needTogglePlan,
  };

  const data = useData({ ...commonProps });
  const controllers = useController({ ...commonProps, data });
  useWatcher({ ...commonProps, data, controllers });

  useImperativeHandle(ref, () => ({
    queryTableData: controllers.queryTableData,
  }), []);

  return {
    data,
    controllers,
    gridRef,
  };
};

export default useHooks;
