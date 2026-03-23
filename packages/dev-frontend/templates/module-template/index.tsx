import { createModule } from "../../utils";
import { MODULE_NAME, moduleAtom } from "./defs/constant";
import type { ModuleRef, Props } from "./defs/type";
import useHooks from "./hooks";
import layouts from "./layouts";

/**
 * __MODULE_NAME__
 * 模块入口文件
 */
export default createModule<ModuleRef, Props>({
  displayName: MODULE_NAME,
  layouts,
  useHooks,
  atom: moduleAtom, // 没有可删
});

export type { ModuleRef, Props };
