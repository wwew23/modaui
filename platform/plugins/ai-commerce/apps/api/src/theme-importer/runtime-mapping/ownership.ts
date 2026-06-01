export type Ownership =
  | 'legacy'          // 原始主题代码，Runtime 不主动重写
  | 'ai-managed'      // AI 生成的代码，可自由 patch/export
  | 'runtime-managed' // 由 Runtime 结构化管理的组件
  | 'user-managed';    // 用户在可视化编辑器中修改的部分

/**
 * 决定一个节点是否允许被 Runtime 导出覆盖
 */
export function canRuntimeOverwrite(ownership: Ownership): boolean {
  return ownership === 'ai-managed' || ownership === 'runtime-managed';
}

/**
 * 决定一个节点是否只允许 minimal 修改（如改 setting 值，但不重写结构）
 */
export function isMinimalEditOnly(ownership: Ownership): boolean {
  return ownership === 'user-managed';
}

/**
 * 给新创建的 AI 节点分配默认 ownership
 */
export function defaultAiOwnership(): Ownership {
  return 'ai-managed';
}
