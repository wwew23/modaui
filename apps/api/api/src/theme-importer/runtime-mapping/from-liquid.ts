import { ThemeRuntime, SectionInstance, BlockInstance } from '../runtime-core/types';
import { StructuralHasher } from '../runtime-core/hashing';
import { 
  ThemeSourceMap, 
  createEmptySourceMap, 
  addSourceMapEntry, 
  RuntimeNodeId,
  SourceLocation
} from './source-map';
import { Ownership } from './ownership';
import { detectAiRegions, AiRegion } from './runtime-region';
import { LiquidAstFile, LiquidAstNode } from './ast-preserver';

export type FromLiquidResult = {
  runtime: ThemeRuntime;
  sourceMap: ThemeSourceMap;
};

/**
 * 入口：整个 Theme 的 Liquid 文件集 -> ThemeRuntime + SourceMap
 */
export async function importThemeFromLiquid(
  files: LiquidAstFile[]
): Promise<FromLiquidResult> {
  const sourceMap = createEmptySourceMap();

  const runtime: ThemeRuntime = {
    id: 'imported-theme',
    name: 'Imported Theme',
    tokens: {
      colors: {} as any,
      typography: {} as any,
      spacing: {},
      radius: {}
    },
    pages: {},
    nodes: {
      sections: {},
      blocks: {}
    },
    relations: {
      pageSections: {},
      sectionBlocks: {}
    },
    globalSettings: {},
    metadata: {
      revision: 1,
      importedAt: new Date().toISOString(),
      version: '1.0.0'
    }
  };

  const aiRegionsByFile: Record<string, AiRegion[]> = {};
  for (const file of files) {
    aiRegionsByFile[file.file] = detectAiRegions(file.file, file.source);
  }

  for (const file of files) {
    const { file: filePath, root, source } = file;
    const fileRegions = aiRegionsByFile[filePath] || [];

    // 2. 根据文件类型解析
    if (filePath.includes('templates/') || filePath.includes('sections/')) {
      const handle = filePath.split('/').pop()?.split('.')[0] || 'unknown';
      
      if (filePath.includes('templates/')) {
        runtime.pages[handle] = {
          id: `page-${handle}`,
          name: handle,
          handle: handle
        };
        runtime.relations.pageSections[handle] = [];
      }

      // 深度遍历 AST
      traverseAst(root, (node) => {
        const loc: SourceLocation = {
          file: filePath,
          startLine: node.loc.startLine,
          endLine: node.loc.endLine,
          offset: node.loc.offset,
          length: node.loc.length
        };

        const inAiRegion = isNodeInAiRegion(loc, fileRegions);
        const ownership: Ownership = inAiRegion ? 'ai-managed' : 'legacy';

        // 识别 Section
        if (node.type === 'section' || node.type === 'Section') {
          const sectionId = node.id || `section-${Math.random().toString(36).substr(2, 9)}`;
          const section: SectionInstance = {
            id: sectionId,
            type: node.sectionType || 'unknown',
            settings: node.settings || {},
            ownership,
            source: loc,
            hash: {
              content: StructuralHasher.hashContent(node.settings),
              structure: StructuralHasher.hashStructure(node.sectionType || 'unknown', [])
            }
          };

          runtime.nodes.sections[sectionId] = section;
          if (runtime.relations.pageSections[handle]) {
            runtime.relations.pageSections[handle].push(sectionId);
          }

          const runtimeNodeId = `page:${handle}:section:${sectionId}`;
          addSourceMapEntry(sourceMap, {
            runtimeNodeId,
            kind: 'section',
            ownership,
            source: loc
          });
        }
      });
    }
  }

  return { runtime, sourceMap };
}

function traverseAst(node: LiquidAstNode, visitor: (node: LiquidAstNode) => void) {
  visitor(node);
  if (node.children) {
    for (const child of node.children) {
      traverseAst(child, visitor);
    }
  }
}

function isNodeInAiRegion(loc: SourceLocation, regions: AiRegion[]): boolean {
  if (loc.offset === undefined) return false;
  return regions.some(r => {
    return loc.offset! >= r.start && (loc.offset! + (loc.length || 0)) <= r.end;
  });
}
