/*********************************************************************
 * 模拟数据
 * @description 用于对应接口的mock数据定义
 * @doc mock随机数据生成文档 http://mockjs.com/examples.html
 *
 * ## 书写规范：
 * - 在'export default'中定义 [接口名]: { type: 'post' | 'get', response: ResponseData }
 *********************************************************************/
import { globalResData } from '../../../../mock/global';

/**
 * __MODULE_NAME__ 接口
 */
export default {
  // 示例接口（可删）
  'example/queryExample': {
    type: 'post',
    response: {
      ...globalResData,
      'data|20-100': [
        {
          'id|+1': '1',
          'name|1': ['稳赢一号', '稳赢二号', '稳赢三号'],
          date: '@date',
        },
      ],
    },
  },
};
