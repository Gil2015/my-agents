/**********************************************************************
 * 接口定义
 * @description 后端接口请求配置
 *********************************************************************/
import qs from 'qs';
import { http } from '../../../utils/axiosInstance';

export const services = {
  /**
   * 获取当前展示的表头配置
   * @param tableLayoutId 表格id
   * @param layoutId 布局id
   * @param menuCode 菜单编码
   * @param isPublic 是否公开
   */
  queryColumnsConfig: (data: {
    layoutId: string;
    tableLayoutId: string;
    isPublic?: string;
    menuCode?: string;
  }) =>
    http<any>({
      url: '/layout/getUserProfileColumns',
      method: 'post',
      data: qs.stringify(data),
      headers: { 'Content-type': 'application/x-www-form-urlencoded' },
    }),

  /**
   * 查询模拟交易方案，包含方案所含的列表数据
   * @param fundId 账户ID
   * @param planId 方案ID
   * @param isOnlyPlan 是否仅查询方案，默认false
   */
  querySimulatedTrade: (data: { fundId: string; planId?: string; isOnlyPlan?: boolean }) =>
    http<any>({
      url: '/simulate/getSimulatePlans',
      method: 'post',
      data: qs.stringify(data),
      headers: { 'Content-type': 'application/x-www-form-urlencoded' },
    }),

  /**
   * 增加/修改 模拟交易方案
   * @param fundId 产品Id
   * @param planName 方案名称
   * @param planId 方案ID，新增时不传
   * @param sortId 排序ID
   */
  saveSimulateScheme: (data: {
    fundId: string;
    planId?: string;
    planName: string;
    sortId?: number;
  }) =>
    http<any>({ url: '/simulate/upsertSimulatePlan', method: 'post', data }),

  /**
   * 复制 模拟交易方案
   * @param planId 方案ID
   * @param planName 方案名称
   * @param sortId 排序ID
   */
  copySimulateScheme: (data: { planId: string; planName: string; sortId?: number }) =>
    http<any>({
      url: '/simulate/copySimulatePlan',
      method: 'post',
      data: qs.stringify(data),
      headers: { 'Content-type': 'application/x-www-form-urlencoded' },
    }),

  /**
   * 删除 模拟交易方案
   * @param fundId 账户ID
   * @param planId 方案ID
   */
  deleteSimulateScheme: (data: { fundId: string; planId: string }) =>
    http<any>({
      url: '/simulate/deleteSimulatePlan',
      method: 'post',
      data: qs.stringify(data),
      headers: { 'Content-type': 'application/x-www-form-urlencoded' },
    }),

  /**
   * 删除模拟交易
   * @param ids 模拟交易ID
   */
  deleteSimulatedTrade: (data: { ids: string }) =>
    http<any>({
      url: '/simulate/deleteSimulateTransaction',
      method: 'post',
      data: qs.stringify(data),
      headers: { 'Content-type': 'application/x-www-form-urlencoded' },
    }),

  /**
   * 获取导入模版文件列表
   */
  getAllBatchOrderTemplateFileInfo: () =>
    http<any>({ url: '/batchOrder/getAllBatchOrderTemplateFileInfo', method: 'post' }),

  /**
   * 下载指令导入模板
   * @param fileId 模版文件的fileId
   */
  downloadBatchOrderTemplate: (data: { fileId: string }) =>
    http<any>({
      url: '/batchOrder/downloadBatchOrderTemplate',
      method: 'get',
      params: { fileId: data.fileId },
      responseType: 'blob',
    }),

  /**
   * 批量指令导入文件
   * @param file 用户上传文件
   */
  importFile: (data: FormData) =>
    http<any>({
      url: '/batchOrder/importFile',
      method: 'post',
      data,
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /**
   * 批量调整指令要素
   * @param data 参考产品侧代码
   */
  getOrderColumnValues: (data: any) =>
    http<any>({ url: '/batchOrder/getOrderColumnValues', method: 'post', data }),

  /**
   * 获取模拟交易原始数据
   * @param id 模拟交易ID
   */
  getSimulateOrder: (data: { id: string }) =>
    http<any>({ url: '/simulate/getSimulateOrder', method: 'post', params: data }),

  /**
   * 批量保存模拟交易
   * @param planId 非必需，存在模拟交易计划时传入
   * @param data request body 参考产品侧 /batchOrder/complianceTest 或 /batchOrder/createOrder 接口入参
   */
  upsertSimulateTransactions: (data: any) =>
    http<any>({ url: '/batch/upsertSimulateTransactions', method: 'post', data }),
};
