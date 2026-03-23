/**********************************************************************
 * ts类型定义
 * @description 定义模块中的ts类型
 *
 * ## 书写规范：
 * - 类型命名首字母大写命名，后面驼峰写法
 * - 重复的类型定义尽量使用extends、Omit、Pick等工具类型
 * - 注释格式参考模板已有代码
 * - 最顶层Props不应再有额外的参数定义，如需添加请沟通思路
 **********************************************************************/
import { TabActionParams } from "@m9/pms/layouts/TabModal/type";
import type { Column, TableRef } from "../../../components";
import type useHook from "../hooks/index";
import type useController from "../hooks/useController";
import type useData from "../hooks/useData";
import type { LayoutEnum } from "./constant";

/**
 * 模块对外暴露的事件回调
 */
export interface ModuleActions {
  /** 编辑交易 */
  onEditTradeItem?: Fn<TabActionParams>;
  /** 新建交易 */
  onAddTradeItem?: Fn<TabActionParams>;
  /** 批量新建交易 */
  onAddTradeItems?: Fn<TabActionParams[]>;
  /** 方案更新 */
  onHandleUpdatedPlan?: Fn;
}

/**
 * 模块对外暴露的命令式方法
 */
export interface ModuleRef {
  /** 刷新数据 */
  queryTableData: () => void;
}

/**
 * 业务模块公共配置
 */
export interface Props extends ModuleProps<ModuleActions> {
  /** 业务布局方式 */
  layout?: LayoutEnum | React.ComponentType<any>;
}

/**
 * 模块hook额外初始化添加的属性
 */
export interface AddInitProps {
  gridRef: React.RefObject<TableRef>;
  needTogglePlan: React.MutableRefObject<boolean>;
}

/**
 * 模块hook属性
 */
export interface DataParams extends Props, AddInitProps {}
export interface CtrlParams extends DataParams {
  data: ReturnType<typeof useData>;
}
export interface WatcherParams extends CtrlParams {
  controllers: ReturnType<typeof useController>;
}
export interface LayoutProps extends ReturnType<typeof useHook>, Props {}

/**
 * 模块数据
 */
export interface DataState {
  columns: Column[];
  /** 方案详情 */
  planDetail: any;
  /** 选中的方案 */
  selectedPlanKey: string;
  /** 是否只展示有效方案 */
  showEffective: boolean;
  /** 导入模版文件列表 */
  templateFileList: any[];
}

/********************************************************
 * 接口相关
 *******************************************************/
/**
 * 示例接口（可删）
 */
export interface queryExampleProps {
  /** 示例参数1 */
  queryId: string;
  /** 示例参数2 */
  date: string;
}
