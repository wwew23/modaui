import { ThemeRuntime } from '../runtime-core/types';
import { RuntimePatch } from '../runtime-core/patch';
import { 
  ThemeSourceMap, 
  SourceMapEntry 
} from './source-map';
import { canRuntimeOverwrite } from './ownership';
import { resolveAffectedNodes } from './affected-resolver';
import { exportSectionToLiquidSnippet } from './exporter/section-exporter';
import { LiquidAstFile } from './ast-preserver';
import { applyFilePatch, FilePatch } from './to-liquid';

import { StructuralHasher } from '../runtime-core/hashing';

export type ExportFlowResult = {
  files: {
    file: string;
    source: string;
  }[];
  affectedNodes: string[]; // 实际被更新导出的节点
};

/**
 * 完整的 Runtime Export Flow
 * 1. Resolve affected nodes from patches
 * 2. Resolve ownership
 * 3. Generate partial snippets
 * 4. Apply file patches
 */
export function exportRuntimeAfterPatches(
  patches: RuntimePatch[],
  runtime: ThemeRuntime,
  sourceMap: ThemeSourceMap,
  astFiles: LiquidAstFile[]
): ExportFlowResult {
  // 1. 解析直接受影响的节点
  const affectedNodes = resolveAffectedNodes(patches, runtime, sourceMap);
  
  const updatedFiles: { file: string; source: string }[] = [];
  const exportedNodeIds: string[] = [];

  // 按文件分组处理
  for (const ast of astFiles) {
    const filePatches: FilePatch[] = [];

    // 2. 筛选出当前文件中受影响且允许重写的节点
    const fileAffectedEntries = affectedNodes
      .filter(node => node.sourceEntry && node.sourceEntry.source.file === ast.file)
      .map(node => node.sourceEntry!);

    for (const entry of fileAffectedEntries) {
      // 3. 检查 Ownership
      if (!canRuntimeOverwrite(entry.ownership)) {
        continue;
      }

      // 4. 生成 Snippet 并检查 Hash
      const { patch, snippet } = buildFilePatchAndSnippet(entry, runtime);
      if (!patch || !snippet) continue;

      const currentHash = entry.ownership === 'ai-managed' ? 
        runtime.nodes.sections[parseSectionRuntimeNodeId(entry.runtimeNodeId).sectionId]?.hash?.export : 
        undefined;

      if (currentHash && !StructuralHasher.needsExport({ lastExportedSnippet: snippet }, currentHash)) {
        continue; // Hash 一致，跳过
      }

      filePatches.push(patch);
      exportedNodeIds.push(entry.runtimeNodeId);
      
      // 更新 Runtime 中的 Export Hash (副作用，但在导出层是必要的)
      const sectionId = parseSectionRuntimeNodeId(entry.runtimeNodeId).sectionId;
      if (runtime.nodes.sections[sectionId]) {
        if (!runtime.nodes.sections[sectionId].hash) {
          runtime.nodes.sections[sectionId].hash = { content: '', structure: '' };
        }
        runtime.nodes.sections[sectionId].hash!.export = StructuralHasher.hashExport(snippet);
      }
    }

    if (filePatches.length === 0) continue;

    // 5. 应用局部 Patch
    const newSource = applyFilePatch(ast.source, filePatches);
    updatedFiles.push({
      file: ast.file,
      source: newSource
    });
  }

  return { files: updatedFiles, affectedNodes: exportedNodeIds };
}

function buildFilePatchAndSnippet(
  entry: SourceMapEntry,
  runtime: ThemeRuntime
): { patch: FilePatch | null, snippet: string | null } {
  switch (entry.kind) {
    case 'section': {
      const { sectionId } = parseSectionRuntimeNodeId(entry.runtimeNodeId);
      const section = runtime.nodes.sections[sectionId];
      if (!section) return { patch: null, snippet: null };

      const snippet = exportSectionToLiquidSnippet(section, {
        ownership: entry.ownership,
        aiRegionId: entry.ownership === 'ai-managed' ? sectionId : undefined
      });

      return {
        patch: {
          offset: entry.source.offset,
          length: entry.source.length,
          replacement: snippet
        },
        snippet
      };
    }
    default:
      return { patch: null, snippet: null };
  }
}

function parseSectionRuntimeNodeId(
  runtimeNodeId: string
): { pageId: string; sectionId: string } {
  const parts = runtimeNodeId.split(':');
  // page:home:section:hero-1
  if (parts.length >= 4 && parts[0] === 'page' && parts[2] === 'section') {
    return { pageId: parts[1], sectionId: parts[3] };
  }
  return { pageId: '', sectionId: '' };
}
