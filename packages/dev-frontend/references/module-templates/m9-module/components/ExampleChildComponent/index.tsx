import styles from "./style.module.less";

export interface Props {
  rowData: any[];
}

/**
 * 子组件示例（可删）
 */
export default (props: Props) => {
  return (
    <div className={styles.container}>当前有{props.rowData.length}条数据</div>
  );
};
