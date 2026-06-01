/**
 * Runtime Snapshot (v1)
 * 只描述“那一刻的 Runtime”，不做任何逻辑
 */
export interface RuntimeSnapshot {
  id: string;
  timestamp: number;
  runtime: any; // ThemeRuntime 实例的克隆
  action?: {
    type: string;
    label: string;
  };
  meta?: {
    userId?: string;
    source: 'ai' | 'user' | 'system' | 'legacy-history';
  };
}
