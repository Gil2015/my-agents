/**********************************************************************
 * 常量定义
 * @description 定义模块中的常量。
 *********************************************************************/
import { create } from 'zustand';
import type { SharedState } from './types';

/**
 * 模块名称(唯一)
 */
export const MODULE_NAME = '__MODULE_NAME_EN__';

/**
 * 模块共享全局 store，如没有可删
 */
export const moduleStore = create<SharedState>(() => ({
  exampleField: '',
}));
