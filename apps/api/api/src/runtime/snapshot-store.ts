import { Transaction, RuntimeEvent } from './types';

export interface Snapshot {
  id: string;
  domain: string;
  data: any;
  timestamp: string;
  description?: string;
}

export class SnapshotStore {
  private snapshots: Map<string, Snapshot[]> = new Map();

  async save(domain: string, data: any, description?: string): Promise<Snapshot> {
    const snapshot: Snapshot = {
      id: `${domain}_snap_${Date.now()}`,
      domain,
      data: JSON.parse(JSON.stringify(data)), // Deep copy
      timestamp: new Date().toISOString(),
      description
    };

    if (!this.snapshots.has(domain)) {
      this.snapshots.set(domain, []);
    }
    this.snapshots.get(domain)!.push(snapshot);

    console.log(`[SnapshotStore] Saved snapshot: ${snapshot.id} for domain=${domain}`);
    return snapshot;
  }

  async getLatest(domain: string): Promise<Snapshot | undefined> {
    const domainSnapshots = this.snapshots.get(domain);
    return domainSnapshots?.[domainSnapshots.length - 1];
  }

  async getById(id: string): Promise<Snapshot | undefined> {
    for (const domainSnapshots of this.snapshots.values()) {
      const snap = domainSnapshots.find(s => s.id === id);
      if (snap) return snap;
    }
    return undefined;
  }
}

export const snapshotStore = new SnapshotStore();
