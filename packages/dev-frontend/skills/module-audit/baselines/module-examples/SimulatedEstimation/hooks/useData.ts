import { App, FormListItemProps, Space } from "@m9/tools-ui-components";
import { useCreation, useRequest } from "ahooks";
import React, { useState } from "react";
import { useAtomState } from "../../../hooks";
import { tabModalAtom } from "../../../layouts/TabModal/atom";
import { FORM_RADIO_CLASS, moduleAtom } from "../defs/constant";
import { services } from "../defs/service";
import { DataParams } from "../defs/type";

/**
 * 模块数据 hook
 */
const useData = (p: DataParams) => {
  const { modal } = App.useApp();
  const [scopeState, setScopeState] = useAtomState(moduleAtom);
  const [tabState] = useAtomState(tabModalAtom);
  const [needQuery, setNeedQuery] = useState(true);
  const { accountOptions, planOptions, formValues } = scopeState;

  /**
   * 查询产品下拉选项
   */
  useRequest(services.queryAccountList, {
    onSuccess: (res) => {
      if (!res.data) return;

      const options: OptionType[] = res.data.map((item: any) => ({
        ...item,
        label: item.accountName,
        value: item.accountId,
      }));
      const defaultAccount = options[0]?.value;

      setScopeState({
        accountOptions: options,
        formValues: {
          ...formValues,
          accountId: defaultAccount!,
          strategy: "",
          simPlanId: "",
        },
      });
      p.form.setFieldValue("accountId", defaultAccount);
    },
  });

  const { run: runGetSimulatePlans } = useRequest(services.getSimulatePlans, {
    manual: true,
    onSuccess: (res) => {
      const newPlanOptions: any[] = [];
      let defaultPlan = "";
      const sortData = res.data.sort((a: any, b: any) => b.planId - a.planId);

      sortData.forEach((item: any) => {
        if (formValues.simPlanId === item.planId) {
          defaultPlan = item.planId;
        }
        newPlanOptions.push({
          label: item.planName,
          value: item.planId,
        });
      });

      setScopeState((state) => ({
        planOptions: newPlanOptions,
        formValues: defaultPlan
          ? state.formValues
          : { ...state.formValues, simPlanId: "" },
      }));
    },
  });

  /**
   * 表单配置
   */
  const config = useCreation(() => {
    return [
      {
        label: "产品",
        name: "accountId",
        options: accountOptions,
        showSearch: true,
        filterOption: (input, option) => {
          const val = input.toLowerCase();
          return (
            `${option?.label}`.toLowerCase().includes(val) ||
            (option?.accountCode ?? "").toLowerCase().includes(val)
          );
        },
        optionRender: (option: OptionType) =>
          React.createElement(
            Space,
            { key: option.value },
            React.createElement(
              React.Fragment,
              null,
              React.createElement(
                "div",
                { className: "w-60" },
                option.data.accountCode,
              ),
              React.createElement("div", null, option.label),
            ),
          ),
        component: "select",
        style: { width: 215 },
        popupMatchSelectWidth: 300,
      },
      {
        label: "日期",
        component: "date-picker",
        name: "date",
        style: { width: 120 },
        allowClear: false,
        disabled: true,
      },
      {
        label: "实时交易",
        component: "radio",
        className: FORM_RADIO_CLASS,
        name: "strategy",
        options: [
          { label: "意向", value: "INTENT" },
          { label: "询价", value: "ENQUIRY" },
          { label: "指令", value: "ORDER" },
        ],
      },
      {
        label: "",
        component: "radio",
        name: "strategy2",
        options: [{ label: "成交", value: "", disabled: true }],
      },
      {
        label: "模拟交易",
        component: "select",
        name: "simPlanId",
        options: planOptions,
        style: { width: 150 },
        allowClear: true,
      },
    ] as FormListItemProps[];
  }, [accountOptions, planOptions, formValues.date]);

  return {
    ...scopeState,
    setScopeState,
    tabState,
    config,
    needQuery,
    setNeedQuery,
    runGetSimulatePlans,
    modal,
  };
};

export default useData;
