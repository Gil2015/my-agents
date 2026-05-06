/**********************************************************************
 * 监听事件 hook
 * @description 用于管理业务模块的事件监听
 *********************************************************************/
import { useEffect } from "react";
import { WatcherParams } from "../defs/type";

/**
 * 监听事件 hook
 */
export default ({ data: _, controllers: $ }: WatcherParams) => {
  /**
   * （可删）
   */
  useEffect(() => {
    $.exampleFn();
  }, []);
};
