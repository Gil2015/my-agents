/**********************************************************************
 * 接口服务定义
 * @description 定义模块所有后端接口请求，使用 http() 直接调用。
 *********************************************************************/
import { http } from "../../../utils/axiosInstance";
import type { QueryExampleParams } from "./type";

export const services = {
  /**
   * 查询示例（可删）
   */
  queryExample: (data: QueryExampleParams) =>
    http<any>({ url: "/example/queryExample", method: "post", data }),
};
