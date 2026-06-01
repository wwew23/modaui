/**
 * 结构化哈希工具类
 */
export class StructuralHasher {
  /**
   * 计算内容的哈希（例如 settings）
   */
  static hashContent(obj: any): string {
    return this.hashString(JSON.stringify(obj || {}));
  }

  /**
   * 计算结构的哈希（例如 blocks 的类型和顺序）
   */
  static hashStructure(type: string, order: string[]): string {
    return this.hashString(`${type}:${order.join(',')}`);
  }

  /**
   * 计算导出代码片段的哈希
   */
  static hashExport(snippet: string): string {
    return this.hashString(snippet);
  }

  private static hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  }

  static needsExport(newNode: any, oldHash?: string): boolean {
    if (!oldHash) return true;
    const newExportHash = this.hashExport(newNode.lastExportedSnippet || '');
    return newExportHash !== oldHash;
  }
}
