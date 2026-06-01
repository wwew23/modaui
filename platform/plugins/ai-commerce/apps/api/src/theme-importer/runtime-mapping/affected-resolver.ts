import { RuntimePatch } from '../runtime-core/patch';
import { ThemeRuntime } from '../runtime-core/types';
import {
  ThemeSourceMap,
  SourceMapEntry,
  RuntimeNodeId,
  NodeKind
} from './source-map';

export type AffectedScope =
  | 'tokens'
  | 'layout'
  | 'content'
  | 'bindings'
  | 'settings'
  | 'structure'
  | 'unknown';

export type AffectedNode = {
  runtimeNodeId: RuntimeNodeId;
  kind: NodeKind;
  scope: AffectedScope;
  sourceEntry?: SourceMapEntry;
};

type ParsedPath =
  | {
      kind: 'page';
      pageId: string;
    }
  | {
      kind: 'section';
      pageId: string;
      sectionIndex?: number;
      sectionId?: string;
      settingKey?: string;
    }
  | {
      kind: 'block';
      pageId: string;
      sectionIndex?: number;
      sectionId?: string;
      blockIndex?: number;
      blockId?: string;
      settingKey?: string;
    }
  | {
      kind: 'tokens';
      tokenPath: string[]; // ['colors','accent','base'] 之类
    }
  | {
      kind: 'globalSettings';
      settingPath: string[];
    }
  | {
      kind: 'unknown';
    };

/**
 * 解析 JSON Pointer 风格的 path 成结构化信息
 */
function parsePatchPath(path: string): ParsedPath {
  if (!path.startsWith('/')) return { kind: 'unknown' };
  const segments = path
    .split('/')
    .slice(1) // 去掉第一个空串
    .filter(Boolean);

  if (segments.length === 0) return { kind: 'unknown' };

  // /tokens/colors/accent/base
  if (segments[0] === 'tokens') {
    return {
      kind: 'tokens',
      tokenPath: segments.slice(1)
    };
  }

  // /globalSettings/xxx/yyy
  if (segments[0] === 'globalSettings') {
    return {
      kind: 'globalSettings',
      settingPath: segments.slice(1)
    };
  }

  // /pages/home/sections/byId/hero-1/settings/text
  if (segments[0] === 'pages' && segments[1]) {
    const pageId = segments[1];
    if (segments[2] === 'sections' && segments[3] === 'byId' && segments[4]) {
      const sectionId = segments[4];
      
      // 检查是否在 relations 中存在
      if (segments[5] === 'blocks' && segments[6] === 'byId' && segments[7]) {
        const blockId = segments[7];
        return {
          kind: 'block',
          pageId,
          sectionId,
          blockId,
          settingKey: segments[8] === 'settings' ? segments[9] : undefined
        };
      }

      return {
        kind: 'section',
        pageId,
        sectionId,
        settingKey: segments[5] === 'settings' ? segments[6] : undefined
      };
    }
    return { kind: 'page', pageId };
  }

  return { kind: 'unknown' };
}

/**
 * 将 Patch 列表解析成受影响的 Runtime 节点列表
 */
export function resolveAffectedNodes(
  patches: RuntimePatch[],
  runtime: ThemeRuntime,
  sourceMap: ThemeSourceMap
): AffectedNode[] {
  const affectedMap = new Map<RuntimeNodeId, AffectedNode>();

  for (const patch of patches) {
    const parsed = parsePatchPath(patch.path);
    const scope = patch.scope ?? inferScopeFromPath(parsed);

    switch (parsed.kind) {
      case 'page': {
        const page = runtime.pages[parsed.pageId];
        if (!page) break;
        const runtimeNodeId = makePageNodeId(parsed.pageId);
        addAffected(affectedMap, runtimeNodeId, 'templateRegion', scope, sourceMap);
        break;
      }
      case 'section': {
        const section = runtime.nodes.sections[parsed.sectionId!];
        if (!section) break;
        const runtimeNodeId = makeSectionNodeId(parsed.pageId, section.id);
        addAffected(affectedMap, runtimeNodeId, 'section', scope, sourceMap);
        break;
      }
      case 'block': {
        const block = runtime.nodes.blocks[parsed.blockId!];
        if (!block) break;
        const runtimeNodeId = makeBlockNodeId(
          parsed.pageId,
          parsed.sectionId!,
          block.id
        );
        addAffected(affectedMap, runtimeNodeId, 'block', scope, sourceMap);
        break;
      }
      case 'tokens': {
        const tokenRuntimeNodeId = makeTokenNodeId(parsed.tokenPath);
        addAffected(affectedMap, tokenRuntimeNodeId, 'schemaField', 'tokens', sourceMap);
        break;
      }
      case 'globalSettings': {
        const settingRuntimeNodeId = makeGlobalSettingNodeId(parsed.settingPath);
        addAffected(affectedMap, settingRuntimeNodeId, 'setting', 'settings', sourceMap);
        break;
      }
    }
  }

  return Array.from(affectedMap.values());
}

// --- ID 辅助函数 ---

export function makePageNodeId(pageId: string) {
  return `page:${pageId}`;
}

export function makeSectionNodeId(pageId: string, sectionId: string) {
  return `page:${pageId}:section:${sectionId}`;
}

export function makeBlockNodeId(pageId: string, sectionId: string, blockId: string) {
  return `page:${pageId}:section:${sectionId}:block:${blockId}`;
}

export function makeTokenNodeId(path: string[]) {
  return `token:${path.join(':')}`;
}

export function makeGlobalSettingNodeId(path: string[]) {
  return `setting:${path.join(':')}`;
}

function addAffected(
  map: Map<RuntimeNodeId, AffectedNode>,
  id: RuntimeNodeId,
  kind: NodeKind,
  scope: AffectedScope,
  sourceMap: ThemeSourceMap
) {
  if (!map.has(id)) {
    map.set(id, {
      runtimeNodeId: id,
      kind,
      scope,
      sourceEntry: sourceMap.byRuntimeId.get(id)
    });
  }
}

function inferScopeFromPath(parsed: ParsedPath): AffectedScope {
  if (parsed.kind === 'tokens') return 'tokens';
  if (parsed.kind === 'globalSettings') return 'settings';
  if (parsed.kind === 'section' || parsed.kind === 'block') {
    return parsed.settingKey ? 'content' : 'structure';
  }
  return 'unknown';
}
