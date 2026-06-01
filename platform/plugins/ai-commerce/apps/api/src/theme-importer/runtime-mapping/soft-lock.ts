import { RuntimeNodeId } from './source-map';

export type LockType = 'exclusive' | 'shared';

export interface SoftLock {
  id: string;
  nodeId: RuntimeNodeId;
  ownerId: string;
  type: LockType;
  expiresAt: number;
}

/**
 * Soft Lock Manager 骨架 - 给 CRDT-lite 做铺垫
 * 用于在多用户/多 AI 协作时防止冲突
 */
export class SoftLockManager {
  private locks: Map<RuntimeNodeId, SoftLock> = new Map();

  acquireLock(nodeId: RuntimeNodeId, ownerId: string, type: LockType = 'exclusive'): boolean {
    const existing = this.locks.get(nodeId);
    
    // 如果锁已过期，清除它
    if (existing && existing.expiresAt < Date.now()) {
      this.locks.delete(nodeId);
    }

    if (!this.locks.has(nodeId)) {
      this.locks.set(nodeId, {
        id: `lock-${Date.now()}`,
        nodeId,
        ownerId,
        type,
        expiresAt: Date.now() + 30000 // 默认 30 秒
      });
      return true;
    }

    return this.locks.get(nodeId)?.ownerId === ownerId;
  }

  releaseLock(nodeId: RuntimeNodeId, ownerId: string): void {
    const lock = this.locks.get(nodeId);
    if (lock && lock.ownerId === ownerId) {
      this.locks.delete(nodeId);
    }
  }

  isLocked(nodeId: RuntimeNodeId): boolean {
    const lock = this.locks.get(nodeId);
    return !!lock && lock.expiresAt > Date.now();
  }
}
