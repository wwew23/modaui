import { InMemoryRuntimeStore } from '../store-impl';
import { ThemeRuntime } from '../types';
import { DefaultValidationPipeline } from '../validation-pipeline';

describe('Deterministic Replay Invariant', () => {
  const initialState: ThemeRuntime = {
    id: 'theme-001',
    name: 'Luxury Theme',
    tokens: { colors: {} as any, typography: {} as any, spacing: {}, radius: {} },
    pages: {
      home: { id: 'page-home', name: 'Home', handle: 'home' }
    },
    nodes: { sections: {}, blocks: {} },
    relations: { pageSections: { home: [] }, sectionBlocks: {} },
    globalSettings: {},
    metadata: { revision: 1, importedAt: new Date().toISOString(), version: '1.0.0' }
  };

  it('should reproduce the exact same state after replaying transactions', async () => {
    const store = new InMemoryRuntimeStore(initialState, new DefaultValidationPipeline([]));

    // 1. 应用一系列事务
    await store.applyTransaction({
      id: 'tx-1', actor: 'ai', description: 'Add Hero',
      patches: [
        { op: 'add', path: '/nodes/sections/hero-1', value: { id: 'hero-1', type: 'hero', settings: { text: 'Hello' }, ownership: 'ai-managed', hash: { content: 'c1', structure: 's1' } } },
        { op: 'add', path: '/relations/pageSections/home/-', value: 'hero-1' }
      ],
      baseRevision: 1
    });

    await store.applyTransaction({
      id: 'tx-2', actor: 'user', description: 'Update Hero Text',
      patches: [{ op: 'replace', path: '/nodes/sections/hero-1/settings/text', value: 'Hello World' }],
      baseRevision: 2
    });

    const finalState = store.getState();
    const history = store.getHistory();

    // 2. 重放
    const replayedStore = new InMemoryRuntimeStore(initialState, new DefaultValidationPipeline([]));
    for (const entry of history) {
      const tx = entry.transaction;
      await replayedStore.applyTransaction({
        id: tx.id,
        actor: tx.actor,
        description: tx.description,
        patches: tx.patches,
        baseRevision: replayedStore.getState().metadata.revision
      });
    }

    const replayedState = replayedStore.getState();
    expect(replayedState.metadata.revision).toBe(finalState.metadata.revision);
    expect(JSON.stringify(replayedState)).toBe(JSON.stringify(finalState));
  });
});
