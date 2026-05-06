import { LayoutEnum } from '../defs/constant';
import Default from './Default';

/**
 * 模块布局统一引入
 */
const Layouts = {
  [LayoutEnum.Default]: Default,
};

export default Layouts;
