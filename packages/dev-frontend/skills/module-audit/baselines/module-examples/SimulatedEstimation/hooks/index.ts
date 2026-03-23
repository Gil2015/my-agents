import { FormList } from '@m9/tools-ui-components';
import type React from 'react';
import { useImperativeHandle } from 'react';
import type { ModuleRef, Props } from '../defs/type';
import useController from './useController';
import useData from './useData';
import useWatcher from './useWatcher';

const useHooks = (props: Props, ref: React.Ref<ModuleRef>) => {
  const [form] = FormList.useForm();
  const commonProps = {
    ...props,
    form,
  };

  const data = useData({ ...commonProps });
  const controllers = useController({ ...commonProps, data });
  useWatcher({ ...commonProps, data, controllers });

  useImperativeHandle(ref, () => ({
    updateSimulatePlans: controllers.updateSimulatePlans,
  }), []);

  return {
    data,
    controllers,
    form,
  };
};

export default useHooks;
