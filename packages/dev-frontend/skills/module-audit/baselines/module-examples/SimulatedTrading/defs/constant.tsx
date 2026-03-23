/**********************************************************************
 * 常量定义
 * @description 定义模块中的常量。
 *
 * ## 书写规范：
 * - 常量使用大写命名，并用 `_` 作为单词分隔符。
 *********************************************************************/

import { Space, Tooltip } from "@m9/tools-ui-components";
import { ValueFormatterParams } from "ag-grid-community";
import classNames from "classnames";
import React from "react";
import { Column, TIcon } from "../../../components";

/**
 * 模块名称(唯一)
 */
export const MODULE_NAME = "simulatedTrading";

// 模块布局方式
export enum LayoutEnum {
  /** 默认布局 */
  Default = 'default',
}

/**
 * 表格配置参数
 */
export const TABLE_CONFIG_PARAMS = {
  tableLayoutId: "301",
  layoutId: "401",
  isPublic: "1",
  menuCode: "",
};

export const RENDER_ADD_COLUMNS: Fn<[Fn<any>, Fn<any>, Fn, Fn], Column[]> = (
  edit,
  remove,
  multiRemove,
  selectAll,
) => [
  {
    headerName: "操作",
    type: ["edit", "delete"],
    width: 60,
    field: "action",
    downloadIgnore: true,
    pinned: "left",
    floatingFilterComponent: () => (
      <Space className="action-header">
        <TIcon
          className="cursor-btn"
          type="icon-quanxuan_fanxiang"
          title="批量选中"
          onClick={() => selectAll()}
        />
        <TIcon
          className="cursor-btn"
          type="icon-shanchu"
          title="批量删除"
          onClick={() => multiRemove()}
        />
      </Space>
    ),
    cellRenderer: (params: ValueFormatterParams) => {
      const { isSummaryRow, isValid } = params.data;
      if (isSummaryRow) return null;

      const unEditable = !isValid;
      const classes = classNames("color-primary", "cursor-btn", {
        "cursor-btn-disabled": unEditable,
      });

      return (
        <Tooltip title={unEditable ? "没有编辑权限" : null}>
          <Space className="action-space">
            <TIcon
              type="icon-bianji"
              className={classes}
              title="编辑"
              onClick={() => {
                if (unEditable) {
                  return false;
                }
                edit(params.data);
              }}
            />
            <TIcon
              type="icon-shanchu"
              className={classes}
              title="删除"
              onClick={() => {
                if (unEditable) {
                  return false;
                }
                remove(params.data);
              }}
            />
          </Space>
        </Tooltip>
      );
    },
  },
];
