/**
 * FilePatch：按行号或偏移量替换文件局部内容
 */
export type FilePatch = {
  start?: number; // 1-based 行号
  end?: number;   // 1-based 行号
  offset?: number;
  length?: number;
  replacement: string;
};

/**
 * 应用一组补丁到文件内容
 */
export function applyFilePatch(source: string, patches: FilePatch[]): string {
  // 优先处理 offset 类型的 patch，因为它们更精确
  const offsetPatches = patches.filter(p => p.offset !== undefined);
  const linePatches = patches.filter(p => p.offset === undefined && p.start !== undefined);

  let result = source;

  // 处理 offset patches (从后往前)
  const sortedOffsetPatches = [...offsetPatches].sort((a, b) => (b.offset || 0) - (a.offset || 0));
  for (const patch of sortedOffsetPatches) {
    const offset = patch.offset!;
    const length = patch.length || 0;
    result = result.substring(0, offset) + patch.replacement + result.substring(offset + length);
  }

  // 处理 line patches (如果还有的话)
  if (linePatches.length > 0) {
    const lines = result.split('\n');
    const sortedLinePatches = [...linePatches].sort((a, b) => (b.start || 0) - (a.start || 0));
    
    for (const patch of sortedLinePatches) {
      const startIdx = patch.start! - 1;
      const endIdx = patch.end ? patch.end - 1 : startIdx;
      lines.splice(startIdx, endIdx - startIdx + 1, patch.replacement);
    }
    result = lines.join('\n');
  }

  return result;
}
