/**
 * 模块常量定义
 */

export const MODULE_NAME = '__MODULE_NAME_UPPER__';

/**
 * 状态枚举
 */
export enum StatusEnum {
  DISABLED = 0,
  ENABLED = 1,
}

/**
 * 错误码
 * 建议格式：模块前缀（4位） + 错误序号（3位）
 */
export const ErrorCodes = {
  NOT_FOUND: { code: '__MODULE_CODE__001', message: '记录不存在' },
  DUPLICATE: { code: '__MODULE_CODE__002', message: '记录已存在' },
} as const;
