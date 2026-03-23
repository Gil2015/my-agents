import { atom } from 'jotai';
import type { AtomState } from './type';

/**********************************************************************
 * 常量定义
 * @description 定义模块中的常量。
 *
 * ## 书写规范：
 * - 常量使用大写命名，并用 `_` 作为单词分隔符。
 * - enum 首字母大写 + 驼峰式命名
 *********************************************************************/

/**
 * 模块名称(唯一)
 */
export const MODULE_NAME = '__MODULE_NAME_EN__';

/**
 * 模块布局方式
 */
export enum LayoutEnum {
  /** 默认布局 */
  Default = 'default',
}

/**
 * 模块共享全局 atom，如没有可删
 */
export const moduleAtom = atom<AtomState>({
  exampleField: '',
});
