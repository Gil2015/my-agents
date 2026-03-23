/**********************************************************************
 * 模块事件 hook
 * @description 用于管理业务模块的交互事件、函数
 *********************************************************************/
import { useMemoizedFn } from "ahooks";
import { CtrlParams } from "../defs/type";

/**
 * 模块交互 hook
 */
const useController = ({ data: _, ...p }: CtrlParams) => {
  /**
   * 示例交互函数（可删）
   */
  const exampleFn = useMemoizedFn(() => {
    // 触发对外回调（可删）
    p.actions?.onExampleEvent?.("example");
    console.log("current data", _);
  });

  return {
    exampleFn,
  };
};

export default useController;
