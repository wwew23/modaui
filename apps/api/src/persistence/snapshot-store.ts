import { Snapshot } from '../theme-importer/runtime-core/snapshot';
import * as fs from 'fs';
import * as path from 'path';

export class SnapshotStore {
  private baseDir: string;

  constructor(baseDir: string = '/www/wwwroot/modaui.com/storage/snapshots') {
    this.baseDir = baseDir;
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async saveSnapshot(runtimeType: string, snapshot: Snapshot): Promise<void> {
    const filePath = path.join(this.baseDir, `${runtimeType}_${snapshot.id}.json`);
    await fs.promises.writeFile(filePath, JSON.stringify(snapshot, null, 2));
    console.log(`[SnapshotStore] Saved ${runtimeType} snapshot: ${snapshot.id}`);
  }

  async loadSnapshot(runtimeType: string, snapshotId: string): Promise<Snapshot> {
    const filePath = path.join(this.baseDir, `${runtimeType}_${snapshotId}.json`);
    const data = await fs.promises.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  }

  async listSnapshots(runtimeType: string): Promise<string[]> {
    const files = await fs.promises.readdir(this.baseDir);
    return files
      .filter(f => f.startsWith(`${runtimeType}_`))
      .map(f => f.replace(`${runtimeType}_`, '').replace('.json', ''));
  }
}

export const globalSnapshotStore = new SnapshotStore();
