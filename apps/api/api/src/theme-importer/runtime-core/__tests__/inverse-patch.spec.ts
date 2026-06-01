import { InMemoryRuntimeStore } from '../store-impl';
import { ThemeRuntime } from '../types';
import { DefaultValidationPipeline } from '../validation-pipeline';

async function testInversePatchInvariant() {
  console.log('--- Testing Inverse Patch Invariant ---');

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

  const store = new InMemoryRuntimeStore(initialState, new DefaultValidationPipeline([]));
  const beforeStateJson = JSON.stringify(initialState);

  // 1. 应用事务
  console.log('Applying transaction...');
  await store.applyTransaction({
    id: 'tx-1', actor: 'ai', description: 'Add Hero',
    patches: [
      { op: 'add', path: '/nodes/sections/hero-1', value: { id: 'hero-1', type: 'hero', settings: { text: 'Hello' }, ownership: 'ai-managed', hash: { content: 'c1', structure: 's1' } } },
      { op: 'add', path: '/relations/pageSections/home/-', value: 'hero-1' }
    ],
    baseRevision: 1
  });

  // 2. Undo
  console.log('Undoing transaction...');
  await store.undo();
  
  const afterUndoStateJson = JSON.stringify(store.getState());

  // 3. 验证是否回到了最初状态 (除了 revision 和 history 指针)
  // 注意：Undo 会减少 historyIndex，但 state 应该完全还原
  const stateObj = JSON.parse(afterUndoStateJson);
  stateObj.metadata.revision = 1; // 修正 revision 以进行比较
  
  const isReverted = JSON.stringify(stateObj) === beforeStateJson;

  console.log('- State Reverted correctly:', isReverted);

  if (isReverted) {
    console.log('\n✅ Inverse Patch Invariant PASSED!');
  } else {
    console.error('\n❌ Inverse Patch Invariant FAILED!');
    process.exit(1);
  }
}

testInversePatchInvariant().catch(console.error);
