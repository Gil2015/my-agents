/**********************************************************************
 * ts类型定义
 * @description 定义模块中的ts类型
 *
 * ## 书写规范：
 * - 类型命名首字母大写命名，后面驼峰写法
 * - 最顶层Props不应再有额外的参数定义，如需添加请沟通思路
 **********************************************************************/
import type useHooks from '../hooks/index';
import type useController from '../hooks/useController';
import type useData from '../hooks/useData';
import type { LayoutEnum } from './constant';

/**
 * 对外暴露的回调事件（如果没有可删 interface 内容）
 */
export interface ModuleActions {
  /** 示例回调（可删） */
  onExampleEvent?: Fn<string>;
}

/**
 * 对外暴露的可执行方法（如果没有可删 interface 内容）
 */
export interface ModuleRef {
  /** 示例方法（可删） */
  exampleMethod: Fn;
}

/**
 * 业务模块公共配置
 */
export interface Props extends ModuleProps<ModuleActions> {
  /** 业务布局方式 */
  layout?: LayoutEnum | React.ComponentType<any>;
}

/**
 * 模块hook属性
 */
export type DataParams = Props;
export interface CtrlParams extends DataParams {
  data: ReturnType<typeof useData>;
}
export interface WatcherParams extends CtrlParams {
  controllers: ReturnType<typeof useController>;
}
export interface LayoutProps extends ReturnType<typeof useHooks>, Props {}

/**
 * 模块数据
 */
export interface DataState {
  /** 示例数据（可删） */
  rowData: any[];
}

// 如需跨组件共享状态，定义 AtomState 并在 constant.ts 中创建 atom（没有可删）
export interface AtomState {
  exampleField: string;
}

/********************************************************
 * 接口相关
 *******************************************************/
/**
 * 查询示例参数（可删）
 */
export interface QueryExampleParams {
  /** 示例参数1 */
  queryId: string;
  /** 示例参数2 */
  date: string;
}
