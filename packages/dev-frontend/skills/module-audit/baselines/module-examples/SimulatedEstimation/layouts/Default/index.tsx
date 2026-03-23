import { Button, FormList, Icon, Space } from "@m9/tools-ui-components";
import classNames from "classnames";
import React from "react";
import { FORM_INIT_VALUES } from "../../defs/constant";
import { LayoutProps } from "../../defs/type";
import styles from "./style.module.less";

export default ({ data: _, controllers: $, form, className }: LayoutProps) => {
  return (
    <div className={classNames(styles.con, className)}>
      <div className={styles["form-blk"]}>
        <FormList
          form={form}
          inline
          config={_.config}
          initialValues={FORM_INIT_VALUES}
          onValuesChange={$.handleFormChange}
        />
        <Button
          type="primary"
          onClick={$.handleSubmit}
          disabled={!_.formValues.accountId}
        >
          模拟推算
        </Button>
      </div>
      <Space className={styles.right}>
        <Icon type="icon-time" />
        <span>刷新</span>
        <span>{_.refreshTime}</span>
      </Space>
    </div>
  );
};
