import { createModule } from "../../utils";
import { MODULE_NAME, moduleAtom } from "./defs/constant";
import type { ModuleRef, Props } from "./defs/type";
import useHooks from "./hooks";
import layouts from "./layouts";

/**
 * 模拟推算表单
 */
export default createModule<ModuleRef, Props>({
  displayName: MODULE_NAME,
  layouts,
  useHooks,
  atom: moduleAtom,
});

export type { ModuleRef, Props };
