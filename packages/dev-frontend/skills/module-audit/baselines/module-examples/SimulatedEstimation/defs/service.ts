/**********************************************************************
 * 接口api定义
 * @description 后端接口请求配置
 *********************************************************************/
import qs from 'qs';
import { http } from '../../../utils/axiosInstance';

export const services = {
  /**
   * 查询产品列表
   */
  queryAccountList: () =>
    http<any>({
      url: '/pms/account/getAllAuthorizedFunds',
      method: 'post',
    }),

  /**
   * 查询模拟交易方案，mock数据在 模拟交易SimulatedTrading模块中
   * @param fundId 账户ID
   * @param planId 方案ID
   * @param isOnlyPlan 是否仅查询方案，默认false
   */
  getSimulatePlans: (data: { fundId: string }) =>
    http<any>({
      url: '/simulate/getSimulatePlans',
      method: 'post',
      data: qs.stringify({
        fundId: data.fundId,
        planId: undefined,
        isOnlyPlan: true,
      }),
      headers: { 'Content-type': 'application/x-www-form-urlencoded' },
    }),
};
