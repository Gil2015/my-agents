/**********************************************************************
 * Default 布局
 * @description LayoutEnum.Default 布局，该文件内容为该布局的具体实现
 *********************************************************************/
import classNames from 'classnames';
import { ExamplePanel } from '../../components';
import type { LayoutProps } from '../../hooks';
import styles from './style.module.less';

export default ({ _, $, data, className }: LayoutProps) => {
  const wrapperClass = classNames(styles.wrapper, className);

  return (
    <div className={wrapperClass}>
      {/* 示例dom（可删） */}
      <ExamplePanel rowData={_.rowData} />
      <button onClick={$.exampleFn}>Button</button>
      <p>createOrder的当前订单量：{data.createOrderState?.orderNumber}</p>
    </div>
  );
};
