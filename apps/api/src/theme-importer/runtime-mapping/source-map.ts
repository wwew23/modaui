import { Ownership } from './ownership';

export type RuntimeNodeId = string;

export type SourceLocation = {
  file: string;
  startLine: number;
  endLine: number;
  startColumn?: number;
  endColumn?: number;
  offset?: number;
  length?: number;
};

export type NodeKind = 
  | 'section' 
  | 'block' 
  | 'setting' 
  | 'schemaField' 
  | 'snippet' 
  | 'templateRegion';

export type SourceMapEntry = {
  runtimeNodeId: RuntimeNodeId;
  kind: NodeKind;
  source: SourceLocation;
  ownership: Ownership;
  astNodeId?: string; // 可选：AST 节点 ID
};

/**
 * 一个 Theme 的 SourceMap：以 runtimeNodeId 为 key 的查找表
 */
export type ThemeSourceMap = {
  byRuntimeId: Map<RuntimeNodeId, SourceMapEntry>;
  // 反向索引：按文件 -> 列表 查 runtimeNode
  byFile: Map<
    string,
    {
      entries: SourceMapEntry[];
    }
  >;
};

export function createEmptySourceMap(): ThemeSourceMap {
  return {
    byRuntimeId: new Map(),
    byFile: new Map()
  };
}

export function addSourceMapEntry(
  map: ThemeSourceMap,
  entry: SourceMapEntry
): void {
  map.byRuntimeId.set(entry.runtimeNodeId, entry);
  let fileBucket = map.byFile.get(entry.source.file);
  if (!fileBucket) {
    fileBucket = { entries: [] };
    map.byFile.set(entry.source.file, fileBucket);
  }
  fileBucket.entries.push(entry);
}

/**
 * 根据文件和行号找到相关的 SourceMapEntry
 */
export function findEntriesByPosition(
  map: ThemeSourceMap,
  file: string,
  line: number
): SourceMapEntry[] {
  const bucket = map.byFile.get(file);
  if (!bucket) return [];
  return bucket.entries.filter(
    e => e.source.startLine <= line && e.source.endLine >= line
  );
}
