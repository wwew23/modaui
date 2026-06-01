import { ThemeRuntime } from '../types';
import { InMemoryRuntimeStore } from '../store-impl';
import { DefaultValidationPipeline } from '../validation-pipeline';

describe('Runtime Rollback & Snapshot Safety', () => {
  const initialState: ThemeRuntime = {
    id: 'theme-001',
    name: 'Initial Theme',
    tokens: { colors: {} as any, typography: {} as any, spacing: {}, radius: {} },
    pages: { home: { id: 'p-home', name: 'Home', handle: 'home' } },
    nodes: { sections: {}, blocks: {} },
    relations: { pageSections: { home: [] }, sectionBlocks: {} },
    globalSettings: {},
    metadata: { revision: 1, importedAt: new Date().toISOString(), version: '1.0.0' }
  };

  it('should support multi-step undo/redo with state protection', async () => {
    const store = new InMemoryRuntimeStore(initialState, new DefaultValidationPipeline([]));

    // Tx 1: Add Section
    await store.applyTransaction({
      id: 'tx-1', actor: 'user', description: 'Add Section',
      baseRevision: 1,
      patches: [{ op: 'add', path: '/nodes/sections/s1', value: { id: 's1', type: 'hero', settings: {}, ownership: 'ai-managed', hash: { content: 'c1', structure: 's1' } } }]
    });

    // Tx 2: Update Section
    await store.applyTransaction({
      id: 'tx-2', actor: 'user', description: 'Update Section',
      baseRevision: 2,
      patches: [{ op: 'replace', path: '/nodes/sections/s1/settings/title', value: 'New Title' }]
    });

    expect(store.getState().metadata.revision).toBe(3);
    expect(store.getState().nodes.sections['s1'].settings.title).toBe('New Title');

    // Undo 1
    await store.undo();
    expect(store.getState().metadata.revision).toBe(2);
    expect(store.getState().nodes.sections['s1'].settings.title).toBeUndefined();

    // Redo 1
    await store.redo();
    expect(store.getState().metadata.revision).toBe(3);
    expect(store.getState().nodes.sections['s1'].settings.title).toBe('New Title');
  });

  it('should restore to a previous snapshot correctly', async () => {
    const store = new InMemoryRuntimeStore(initialState, new DefaultValidationPipeline([]));
    
    // Create manual snapshot
    const snap1 = await store.createSnapshot('Before major change');

    // Apply change
    await store.applyTransaction({
      id: 'tx-1', actor: 'ai', description: 'AI Redesign',
      baseRevision: 1,
      patches: [{ op: 'add', path: '/nodes/sections/s1', value: { id: 's1', type: 'hero', settings: {}, ownership: 'ai-managed', hash: { content: 'c1', structure: 's1' } } }]
    });

    expect(store.getState().metadata.revision).toBe(2);

    // Rollback to snap1
    const restoreResult = await store.restoreSnapshot(snap1.id);
    expect(restoreResult.success).toBe(true);
    expect(store.getState().metadata.revision).toBe(1);
    expect(store.getState().nodes.sections['s1']).toBeUndefined();
  });
});
