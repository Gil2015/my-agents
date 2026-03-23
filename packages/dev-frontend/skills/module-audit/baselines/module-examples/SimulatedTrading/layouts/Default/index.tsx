/**********************************************************************
 * Default 布局
 * @description LayoutEnum.Default 布局，该文件内容为该布局的具体实现
 *********************************************************************/
import { Button, Dropdown, Flex, Icon, Upload } from "@m9/tools-ui-components";
import classNames from "classnames";
import React from "react";
import { Table, TIcon } from "../../../../components";
import { PlanBlock } from "../../components";
import { TABLE_CONFIG_PARAMS } from "../../defs/constant";
import { LayoutProps } from "../../defs/type";
import styles from "./style.module.less";

export default ({
  data: _,
  controllers: $,
  gridRef,
  className,
}: LayoutProps) => {
  const wrapperClass = classNames(styles.wrapper, className);

  return (
    <div className={wrapperClass}>
      <div className={styles.header}>
        <PlanBlock
          data={_.plans}
          selectedKey={_.selectedPlanKey}
          togglePlan={$.togglePlan}
          setPlan={$.setPlan}
          toggleEffective={$.toggleEffective}
        />
        <div className={styles.btns}>
          <Flex gap={12}>
            <TIcon
              className="cursor-btn"
              title="表格配置"
              type="icon-zidingyilie"
              onClick={$.showTableConfigModal}
            />
            <TIcon
              className="cursor-btn"
              title="下载表格数据"
              type="icon-xiazai"
              onClick={$.downloadTableData}
            />
            <Dropdown menu={_.downloadList}>
              <Button>模板下载</Button>
            </Dropdown>
            <Upload
              accept=".XLSX, .XLS, .xlsx, .xls"
              customRequest={$.handleUpload}
              beforeUpload={$.handleBeforeUpload}
              maxCount={1}
              showUploadList={false}
            >
              <Button>交易导入</Button>
            </Upload>
            <Button
              type="primary"
              icon={<Icon type="icon-jia" />}
              onClick={$.showCreateModal}
            >
              新建
            </Button>
          </Flex>
        </div>
      </div>
      <Table
        ref={gridRef}
        columnDefs={_.columns}
        rowData={_.tableData}
        summaryType="all"
        indexType="number"
        loading={_.loading}
        tableName={`模拟交易${_.schemeName}`}
        rowSelection={"multiple"}
        configMode="remote"
        configParams={TABLE_CONFIG_PARAMS}
        coverColumnParams={_.coverColumnParams}
      />
    </div>
  );
};
