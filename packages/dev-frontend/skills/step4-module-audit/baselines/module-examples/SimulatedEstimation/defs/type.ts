import type { FormInstance } from "@m9/tools-ui-components";
import type { Dayjs } from "dayjs";
import type useHook from "../hooks/index";
import type useController from "../hooks/useController";
import type useData from "../hooks/useData";
import type { LayoutEnum } from "./constant";

/**
 * 模块对外暴露的回调事件
 */
export interface ModuleActions {
  onHandleSubmit?: Fn;
  onCloseTab?: Fn;
}

/**
 * 模块对外暴露的可执行方法
 */
export interface ModuleRef {
  updateSimulatePlans: () => void;
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
  /** 表单对象 */
  form: FormInstance;
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
 * 业务组件全局ImmerState
 */
export interface ScopeState {
  /** 推算id，页面所有测算都基于该id，获取id逻辑在ProductRevenueCalc模块中 */
  simulateId: string;
  /** 账户选项 */
  accountOptions: OptionType[];
  /** 模拟交易选项 */
  planOptions: OptionType[];
  /** 表单值 */
  formValues: {
    /** 产品id */
    accountId: string;
    /** 日期 */
    date: Dayjs;
    /** 实时交易 */
    strategy: string;
    /** 模拟交易 */
    simPlanId: string;
    /** 实时交易 - 是否含成交，该参数不会变更，默认就是选中 */
    strategy2: string;
  };
  /** 当前模拟推算使用的交易id */
  currentTradeIds: string;
  /** 收益推算数据更新时间 */
  refreshTime: string;
  /** 指标推算选中的行数据(从代码层面讲应该放在ProductRevenueCalc模块中，为了让代码精简放于此) */
  selectedRow?: any;
  /** 当前模拟推算使用的产品id */
  currentCalcAccountId: string;
}
