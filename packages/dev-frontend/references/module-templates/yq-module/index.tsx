import { createModule } from '@/shared/utils/module';
import { MODULE_NAME, moduleStore } from './defs/constants';
import useHooks from './hooks';
import layouts from './layouts';

/**
 * __MODULE_NAME__
 * 模块入口文件
 */
const ModuleTemplate = createModule({
  displayName: MODULE_NAME,
  layouts,
  useHooks,
  store: moduleStore, // 没有可删
});

export default ModuleTemplate;
export type ModuleRef = React.ComponentRef<typeof ModuleTemplate>;
