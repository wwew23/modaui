import { ThemeRuntime, SectionInstance, BlockInstance } from '../runtime-core/types';

export type DependencyNodeType =
  | 'token'
  | 'page'
  | 'section'
  | 'block'
  | 'snippet'
  | 'binding';

export type DependencyNodeId = string;

export type DependencyNode = {
  id: DependencyNodeId;
  type: DependencyNodeType;
};

/**
 * 邻接表：from -> to 列表
 */
export type DependencyGraph = {
  edges: Map<DependencyNodeId, Set<DependencyNodeId>>;
  reverseEdges: Map<DependencyNodeId, Set<DependencyNodeId>>;
};

// ID 工厂
export function tokenDepId(tokenPath: string[]): DependencyNodeId {
  return ['token', ...tokenPath].join(':');
}

export function pageDepId(pageId: string): DependencyNodeId {
  return ['page', pageId].join(':');
}

export function sectionDepId(pageId: string, sectionId: string): DependencyNodeId {
  return ['page', pageId, 'section', sectionId].join(':');
}

export function blockDepId(
  pageId: string,
  sectionId: string,
  blockId: string
): DependencyNodeId {
  return ['page', pageId, 'section', sectionId, 'block', blockId].join(':');
}

export function snippetDepId(snippetName: string): DependencyNodeId {
  return ['snippet', snippetName].join(':');
}

export function bindingDepId(bindingKey: string): DependencyNodeId {
  return ['binding', bindingKey].join(':');
}

export function createEmptyGraph(): DependencyGraph {
  return {
    edges: new Map(),
    reverseEdges: new Map()
  };
}

export function addEdge(graph: DependencyGraph, from: DependencyNodeId, to: DependencyNodeId) {
  if (!graph.edges.has(from)) {
    graph.edges.set(from, new Set());
  }
  graph.edges.get(from)!.add(to);

  if (!graph.reverseEdges.has(to)) {
    graph.reverseEdges.set(to, new Set());
  }
  graph.reverseEdges.get(to)!.add(from);
}

/**
 * 从 ThemeRuntime 构建基础依赖图
 */
export function buildDependencyGraph(runtime: ThemeRuntime): DependencyGraph {
  const graph = createEmptyGraph();

  // 1. Page -> Sections
  for (const [pageId, sectionIds] of Object.entries(runtime.relations.pageSections)) {
    const pageNodeId = pageDepId(pageId);
    for (const sectionId of sectionIds) {
      addEdge(graph, pageNodeId, sectionDepId(pageId, sectionId));
    }
  }

  // 2. Section -> Blocks & Tokens
  for (const [sectionId, section] of Object.entries(runtime.nodes.sections)) {
    // 这里的 pageId 可能需要从关系反查，暂时简化处理
    const sectionNodeId = `section:${sectionId}`; 

    collectTokenRefs(section.settings).forEach(tokenPath => {
      addEdge(graph, tokenDepId(tokenPath), sectionNodeId);
    });

    const blockIds = runtime.relations.sectionBlocks[sectionId] || [];
    for (const blockId of blockIds) {
      const block = runtime.nodes.blocks[blockId];
      if (!block) continue;
      
      const blockNodeId = `block:${blockId}`;
      addEdge(graph, sectionNodeId, blockNodeId);

      collectTokenRefs(block.settings).forEach(tokenPath => {
        addEdge(graph, tokenDepId(tokenPath), blockNodeId);
      });
    }
  }

  return graph;
}

/**
 * 获取受影响的节点（深度优先搜索所有下游节点）
 */
export function getAffectedDownstream(
  graph: DependencyGraph,
  changedNodeId: DependencyNodeId
): Set<DependencyNodeId> {
  const affected = new Set<DependencyNodeId>();
  const queue = [changedNodeId];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const neighbors = graph.edges.get(curr);
    if (neighbors) {
      for (const neighbor of neighbors) {
        if (!affected.has(neighbor)) {
          affected.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
  }

  return affected;
}

// 辅助：从 settings 对象中递归提取 Token 引用
function collectTokenRefs(obj: any): string[][] {
  const refs: string[][] = [];
  
  const walk = (current: any) => {
    if (!current || typeof current !== 'object') return;
    
    if (current.paletteId && current.key) {
      refs.push([current.paletteId, current.key]);
      return;
    }

    for (const val of Object.values(current)) {
      walk(val);
    }
  };

  walk(obj);
  return refs;
}
