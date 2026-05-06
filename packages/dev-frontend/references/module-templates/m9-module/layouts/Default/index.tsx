/**********************************************************************
 * Default 布局
 * @description LayoutEnum.Default 布局，该文件内容为该布局的具体实现
 *********************************************************************/
import { Button } from '@m9/tools-ui-components';
import classNames from 'classnames';
import { ExampleChildComponent } from '../../components';
import { LayoutProps } from '../../defs/type';
import styles from './style.module.less';

export default ({ data: _, controllers: $ }: LayoutProps) => {
  const wrapperClass = classNames(styles.wrapper);

  return (
    <div className={wrapperClass}>
      {/* 示例dom（可删） */}
      <ExampleChildComponent rowData={_.rowData} />
      <Button onClick={$.exampleFn}>Button</Button>
    </div>
  );
};
