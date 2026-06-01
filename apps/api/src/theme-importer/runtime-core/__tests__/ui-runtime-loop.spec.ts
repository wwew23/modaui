import { ThemeRuntime } from '../types';
import { diffPreview } from '../../preview-diff-engine';
import { ThemeActionLibrary } from '../../theme-actions';
import { ThemePolicyEngine } from '../../theme-policy';
import { ActionRuntimeExecutor } from '../../action-runtime-executor';
import { InMemoryRuntimeStore } from '../store-impl';
import { DefaultValidationPipeline } from '../validation-pipeline';

describe('AI Native UI OS - End-to-End Loop', () => {
  const initialState: ThemeRuntime = {
    id: 'theme-001',
    name: 'Luxury Theme',
    tokens: { 
      colors: {
        background: { base: { paletteId: 'p1', key: '#ffffff' } },
        surface: { base: { paletteId: 'p1', key: '#f9f9f9' } },
        textPrimary: { base: { paletteId: 'p1', key: '#000000' } },
        textSecondary: { base: { paletteId: 'p1', key: '#666666' } },
        accent: { base: { paletteId: 'p1', key: '#ff0000' } },
      },
      typography: {
        headingLg: { fontFamily: 'Inter', fontSize: { base: '32px' }, lineHeight: { base: '1.2' }, fontWeight: { base: 700 } },
        headingMd: { fontFamily: 'Inter', fontSize: { base: '24px' }, lineHeight: { base: '1.2' }, fontWeight: { base: 600 } },
        body: { fontFamily: 'Inter', fontSize: { base: '16px' }, lineHeight: { base: '1.5' }, fontWeight: { base: 400 } },
        caption: { fontFamily: 'Inter', fontSize: { base: '12px' }, lineHeight: { base: '1.4' }, fontWeight: { base: 400 } },
      },
      spacing: {},
      radius: {}
    },
    pages: {
      home: { id: 'page-home', name: 'Home', handle: 'home' }
    },
    nodes: { 
      sections: {
        'hero-1': {
          id: 'hero-1',
          type: 'hero',
          settings: { title: 'Old Title' },
          ownership: 'ai-managed',
          hash: { content: 'c1', structure: 's1' }
        }
      }, 
      blocks: {} 
    },
    relations: { 
      pageSections: { home: ['hero-1'] }, 
      sectionBlocks: {} 
    },
    globalSettings: { container_width: '1200px' },
    metadata: { revision: 1, importedAt: new Date().toISOString(), version: '1.0.0' }
  };

  it('should complete the loop: Action -> Policy -> Patch -> Runtime -> Diff', async () => {
    const store = new InMemoryRuntimeStore(initialState, new DefaultValidationPipeline([]));
    const actionLibrary = new ThemeActionLibrary({ store, actor: 'ai' });
    const policyEngine = new ThemePolicyEngine();
    const executor = new ActionRuntimeExecutor(store, actionLibrary, policyEngine);

    // 1. AI Output Action Plan
    const plan = [
      { 
        action: 'updateSectionSettings' as any, 
        params: ['hero-1', { title: 'New AI Title' }] 
      }
    ];

    // 2. Execute through Gate
    const oldState = store.getState();
    const results = await executor.executePlan(plan);
    
    expect(results[0].success).toBe(true);
    const newState = store.getState();

    // 3. Diff Engine
    const diff = diffPreview(oldState, newState);

    expect(diff.changes).toHaveLength(1);
    expect(diff.changes[0]).toEqual({
      type: 'section',
      op: 'update',
      nodeId: 'hero-1'
    });
    expect(newState.metadata.revision).toBe(oldState.metadata.revision + 1);
  });

  it('should block unauthorized actions through Policy Gate', async () => {
    const store = new InMemoryRuntimeStore(initialState, new DefaultValidationPipeline([]));
    const actionLibrary = new ThemeActionLibrary({ store, actor: 'ai' });
    const policyEngine = new ThemePolicyEngine();
    const executor = new ActionRuntimeExecutor(store, actionLibrary, policyEngine);

    // AI tries to change brand colors (blocked by policy in theme-policy.ts)
    const plan = [
      { 
        action: 'applyBrandProfile' as any, 
        params: [{ colors: { brand: '#ff0000' } }] 
      }
    ];

    const results = await executor.executePlan(plan);
    
    expect(results[0].success).toBe(false);
    expect(results[0].decision).toBe('require_confirmation');
    expect(store.getState().metadata.revision).toBe(1); // State unchanged
  });
});
