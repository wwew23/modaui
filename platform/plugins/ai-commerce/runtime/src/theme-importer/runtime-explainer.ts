import { ThemeRuntime } from './runtime-core/types';
import { RuntimePatch } from './runtime-core/patch';
import { RuntimeNodeId, ThemeSourceMap } from './runtime-mapping/source-map';
import { AffectedNode, resolveAffectedNodes } from './runtime-mapping/affected-resolver';

export type RiskLevel = 'low' | 'medium' | 'high';

export type HumanChangeSummary = {
  title: string;          // 一句话标题，例如 "更新首页 Hero 标题"
  description: string;    // 更详细解释，人类可读
  affectedNodes: Array<{
    runtimeNodeId: RuntimeNodeId;
    kind: string;
    label?: string;        // "首页 Hero 区块" / "按钮主色"
  }>;
  diffs: Array<{
    scope: 'content' | 'layout' | 'tokens' | 'bindings' | 'structure';
    path: string;          // patch path
    before?: any;
    after?: any;
    label?: string;        // "标题文案" / "背景色"
  }>;
  risk: RiskLevel;
  autoApprove: boolean;   // 是否可自动通过（配合 Policy 使用）
};

export type ExplainContext = {
  actionName: string;               // 来自 theme-actions.ts，例如 "updateHeroHeading"
  actor: 'ai' | 'user';
  runtimeBefore: ThemeRuntime;
  runtimeAfter: ThemeRuntime;       // 预模拟后的状态
  patches: RuntimePatch[];
  sourceMap: ThemeSourceMap;
};

/**
 * Runtime Explainer (v1)
 * 行为解释器，把内核变更翻译成人类可读的摘要、风险等级和 Diff 摘要
 */
export async function explainAction(
  ctx: ExplainContext
): Promise<HumanChangeSummary> {
  const { actionName, actor, runtimeBefore, runtimeAfter, patches, sourceMap } = ctx;

  // 1. 找出直接受影响节点
  const affected = resolveAffectedNodes(patches, runtimeBefore, sourceMap);

  // 2. 做一些高层分类
  const scopeStats = summarizeScopes(affected);

  // 3. 基于 actionName + scope + actor 决定风险等级
  const risk = estimateRiskLevel(actionName, actor, scopeStats);

  // 4. 基于 patch path + runtimeBefore + runtimeAfter 做人类可读 diff
  const diffs = buildDiffs(runtimeBefore, runtimeAfter, patches);

  // 5. 决定是否 autoApprove
  const autoApprove = risk === 'low' && actor === 'ai' && isSmallChange(diffs);

  const affectedNodesSummaries = affected.map(a => {
    return {
      runtimeNodeId: a.runtimeNodeId,
      kind: a.kind,
      label: buildNodeLabel(a, runtimeAfter)
    };
  });

  const title = buildTitle(actionName, scopeStats, affectedNodesSummaries);
  const description = buildDescription(actionName, scopeStats, diffs);

  return {
    title,
    description,
    affectedNodes: affectedNodesSummaries,
    diffs,
    risk,
    autoApprove
  };
}

type ScopeStats = {
  contentChanges: number;
  layoutChanges: number;
  tokenChanges: number;
  bindingChanges: number;
  structuralChanges: number;
};

function summarizeScopes(affected: AffectedNode[]): ScopeStats {
  const stats: ScopeStats = {
    contentChanges: 0,
    layoutChanges: 0,
    tokenChanges: 0,
    bindingChanges: 0,
    structuralChanges: 0
  };

  for (const a of affected) {
    switch (a.scope) {
      case 'content':
      case 'settings':
        stats.contentChanges++;
        break;
      case 'layout':
        stats.layoutChanges++;
        break;
      case 'tokens':
        stats.tokenChanges++;
        break;
      case 'bindings':
        stats.bindingChanges++;
        break;
      case 'structure':
        stats.structuralChanges++;
        break;
      default:
        break;
    }
  }
  return stats;
}

function estimateRiskLevel(
  actionName: string,
  actor: 'ai' | 'user',
  stats: ScopeStats
): RiskLevel {
  if (stats.tokenChanges > 0 || stats.structuralChanges > 0) {
    return 'high';
  }
  if (stats.layoutChanges > 0) {
    return 'medium';
  }
  return 'low';
}

function isSmallChange(diffs: HumanChangeSummary['diffs']): boolean {
  if (diffs.length > 3) return false;
  return diffs.every(d => {
    if (typeof d.after === 'string' && d.after.length > 100) return false;
    return true;
  });
}

function buildDiffs(
  before: ThemeRuntime,
  after: ThemeRuntime,
  patches: RuntimePatch[]
): HumanChangeSummary['diffs'] {
  const result: HumanChangeSummary['diffs'] = [];

  for (const p of patches) {
    if (p.op !== 'replace' && p.op !== 'add' && p.op !== 'remove') continue;

    const scope = inferDiffScopeFromPath(p.path);
    const { beforeValue, afterValue } = readBeforeAfter(before, after, p.path);

    result.push({
      scope,
      path: p.path,
      before: beforeValue,
      after: afterValue,
      label: inferLabelFromPath(p.path)
    });
  }

  return result;
}

function inferDiffScopeFromPath(path: string): 'content' | 'layout' | 'tokens' | 'bindings' | 'structure' {
  if (path.startsWith('/tokens')) return 'tokens';
  if (path.includes('/layout')) return 'layout';
  if (path.includes('/bindings')) return 'bindings';
  if (path.includes('/sections') && path.endsWith('/settings')) return 'content';
  return 'content';
}

function readBeforeAfter(
  before: ThemeRuntime,
  after: ThemeRuntime,
  path: string
): { beforeValue: any; afterValue: any } {
  const segs = path.split('/').slice(1).filter(Boolean);
  
  // /pages/{pageId}/sections/byId/{sectionId}/settings/{key}
  if (segs[0] === 'pages' && segs[2] === 'sections' && segs[3] === 'byId') {
    const sectionId = segs[4];
    const rest = segs.slice(5);
    if (rest[0] === 'settings' && rest[1]) {
      const key = rest[1];
      return {
        beforeValue: before.nodes.sections?.[sectionId]?.settings?.[key],
        afterValue: after.nodes.sections?.[sectionId]?.settings?.[key]
      };
    }
  }

  // /nodes/sections/{sectionId}/settings/{key}
  if (segs[0] === 'nodes' && segs[1] === 'sections') {
    const sectionId = segs[2];
    if (segs[3] === 'settings' && segs[4]) {
      const key = segs[4];
      return {
        beforeValue: before.nodes.sections?.[sectionId]?.settings?.[key],
        afterValue: after.nodes.sections?.[sectionId]?.settings?.[key]
      };
    }
  }

  return { beforeValue: undefined, afterValue: undefined };
}

function inferLabelFromPath(path: string): string | undefined {
  if (path.endsWith('/settings/heading') || path.endsWith('/settings/title')) return '标题文案';
  if (path.includes('/tokens/colors')) return '颜色配置';
  return undefined;
}

function buildNodeLabel(a: AffectedNode, runtime: ThemeRuntime): string {
  const parts = a.runtimeNodeId.split(':');
  if (a.kind === 'section') {
    const sectionId = parts[parts.length - 1];
    const section = runtime.nodes.sections[sectionId];
    return section ? `${section.type} 区块` : '未知区块';
  }
  return a.runtimeNodeId;
}

function buildTitle(actionName: string, stats: ScopeStats, affected: HumanChangeSummary['affectedNodes']): string {
  if (stats.structuralChanges > 0) return '修改页面布局结构';
  if (stats.tokenChanges > 0) return '更新主题全局风格';
  if (affected.length === 1) return `更新 ${affected[0].label || '节点'}`;
  return `执行 ${actionName} 动作`;
}

function buildDescription(actionName: string, stats: ScopeStats, diffs: HumanChangeSummary['diffs']): string {
  const parts = [];
  if (stats.contentChanges > 0) parts.push(`更新了 ${stats.contentChanges} 处内容`);
  if (stats.layoutChanges > 0) parts.push(`调整了 ${stats.layoutChanges} 处布局`);
  if (parts.length === 0) return `对系统进行了 ${actionName} 操作`;
  return parts.join('，');
}
