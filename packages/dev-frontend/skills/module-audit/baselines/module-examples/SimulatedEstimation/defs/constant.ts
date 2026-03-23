import dayjs from "dayjs";
import { atom } from "jotai";
import type { ScopeState } from "./type";

/**
 * 模块名称(唯一)
 */
export const MODULE_NAME = "simulatedEstimation";

// 模块布局方式
export enum LayoutEnum {
  /** 默认布局 */
  Default = "default",
}

/**
 * 表单初始值
 */
export const FORM_INIT_VALUES: ScopeState["formValues"] = {
  accountId: "",
  date: dayjs(),
  strategy: "",
  strategy2: "",
  simPlanId: "",
};

/**
 * 模块跨组件共享状态 atom
 */
export const moduleAtom = atom<ScopeState>({
  simulateId: "",
  accountOptions: [],
  planOptions: [],
  formValues: {
    ...FORM_INIT_VALUES,
  },
  currentTradeIds: "",
  refreshTime: "-",
  selectedRow: undefined,
  currentCalcAccountId: "",
});

/**
 * 实时交易单选框类名，用来通过获取dom的方式，控制radio取消选中交互
 */
export const FORM_RADIO_CLASS = "se-strategy-radio";
