/**********************************************************************
 * ts类型定义
 * @description 定义模块中的ts类型，理论Props不用再加额外传参
 **********************************************************************/
/**
 * 业务模块公共配置
 */
export type Props = ModuleProps<{
  /** 示例回调（可删） */
  onExampleEvent?: Fn<string>;
}>;

/**
 * 模块数据
 */
export interface DataState {
  /** 示例数据（可删） */
  rowData: string[];
}

// 如需跨组件共享状态，定义 SharedState 并在 constants.ts 中创建 zustand store（没有可删）
export interface SharedState {
  exampleField: string;
}
