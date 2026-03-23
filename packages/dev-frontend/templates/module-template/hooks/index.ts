/**********************************************************************
 * 模块hooks集合
 * @description 统一管理模块hooks，方便统一调用。
 *
 * ## 书写规范：
 * - useRef、useForm等的定义在此文件(commonProps上面一行)，通过参数传入commonProps统一供其他
 *   hook或layout使用
 *********************************************************************/
import type React from "react";
import { useImperativeHandle } from "react";
import type { ModuleRef, Props } from "../defs/type";
import useController from "./useController";
import useData from "./useData";
import useWatcher from "./useWatcher";

/**
 * 模块hooks集合
 */
const useHooks = (props: Props, ref: React.Ref<ModuleRef>) => {
  const commonProps = {
    ...props,
  };

  const data = useData(commonProps);
  const controllers = useController({ ...commonProps, data });
  useWatcher({ ...commonProps, data, controllers });

  /**
   * 模块方法暴露（可删）
   * deps 用 []：controllers 方法均由 useMemoizedFn 包裹，引用永远稳定
   */
  useImperativeHandle(
    ref,
    () => ({
      exampleMethod: controllers.exampleFn, // （可删）
    }),
    [],
  );

  return {
    data,
    controllers,
  };
};

export default useHooks;
