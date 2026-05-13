/**********************************************************************
 * 接口服务定义
 * @description 定义模块所有后端接口请求，使用 http() 直接调用。
 *********************************************************************/
import { http } from '@/shared/utils/axiosInstance';

export default {
  /**
   * 查询示例（可删）
   */
  queryExample: (data: {
    /** 示例参数1 */
    param1: string;
    /** 示例参数2 */
    param2: number;
  }) => {
    return http<{
      /** 示例结果 */
      data: string[];
    }>({ url: '/example/queryExample', method: 'post', data });
  },
};
