/**********************************************************************
 * 监听事件 hook
 * @description 用于管理业务模块(其他模块行为)的事件监听
 *********************************************************************/
import { useMount } from 'ahooks';
import { useEffect } from 'react';
import { TABLE_CONFIG_PARAMS } from '../defs/constant';
import { WatcherParams } from '../defs/type';

/**
 * 监听事件 hook
 */
export default ({ data: _, controllers: _$, needTogglePlan }: WatcherParams) => {
  const { accountId, date } = _.scopeState.formValues;

  useMount(() => {
    _.runQueryColumnsConfig(TABLE_CONFIG_PARAMS);
  });

  useEffect(() => {
    needTogglePlan.current = true;
    _.queryTableData();
  }, [accountId, date]);
};
