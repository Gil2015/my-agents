import { createModule } from '../../utils';
import { MODULE_NAME } from './defs/constant';
import type { ModuleRef, Props } from './defs/type';
import useHooks from './hooks';
import layouts from './layouts';

export default createModule<ModuleRef, Props>({
  displayName: MODULE_NAME,
  layouts,
  useHooks,
});

export type { ModuleRef, Props };
