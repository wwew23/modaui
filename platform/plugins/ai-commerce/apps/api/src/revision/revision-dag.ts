import { Snapshot } from '../theme-importer/runtime-core/snapshot';

export interface RevisionNode {
  id: string;
  parentId?: string;
  snapshotId: string;
  label: string;
  actor: 'ai' | 'user';
  timestamp: string;
}

export class RevisionDAG {
  private nodes: Map<string, RevisionNode> = new Map();
  private heads: Map<string, string> = new Map(); // branchName -> revisionId

  constructor() {
    // Initial main branch
    this.heads.set('main', 'root');
  }

  /**
   * fork
   * 从指定 revision 创建分支
   */
  fork(parentRevisionId: string, branchName: string): string {
    const newId = `rev-${Date.now()}`;
    this.heads.set(branchName, parentRevisionId);
    return branchName;
  }

  /**
   * commit
   * 在当前分支提交新版本
   */
  commit(branchName: string, snapshotId: string, label: string, actor: 'ai' | 'user'): string {
    const parentId = this.heads.get(branchName);
    const id = `rev-${Date.now()}`;
    
    const node: RevisionNode = {
      id,
      parentId,
      snapshotId,
      label,
      actor,
      timestamp: new Date().toISOString()
    };

    this.nodes.set(id, node);
    this.heads.set(branchName, id);
    return id;
  }

  /**
   * detectConflict
   * 简单冲突检测：检查两个 revision 是否有共同祖先且路径是否有重叠变更
   */
  detectConflict(revA: string, revB: string): boolean {
    // Mock: 实际需要对比 Patch 路径
    return false;
  }

  getHead(branchName: string): RevisionNode | undefined {
    const id = this.heads.get(branchName);
    return id ? this.nodes.get(id) : undefined;
  }

  getRevision(id: string): RevisionNode | undefined {
    return this.nodes.get(id);
  }
}
