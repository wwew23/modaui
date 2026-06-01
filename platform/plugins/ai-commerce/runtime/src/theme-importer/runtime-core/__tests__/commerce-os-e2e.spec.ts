import { ThemeRuntime } from '../types';
import { diffPreview } from '../../preview-diff-engine';
import { ThemeActionLibrary } from '../../theme-actions';
import { ThemePolicyEngine } from '../../theme-policy';
import { ActionRuntimeExecutor } from '../../action-runtime-executor';
import { InMemoryRuntimeStore } from '../store-impl';
import { DefaultValidationPipeline } from '../validation-pipeline';
import { CommerceOSKernelAdapter } from '../../commerce-os-kernel-adapter';
import { ThemePreviewShell } from '../../preview-shell';
import { RollbackEngine } from '../../rollback-engine';

declare const describe: any;
declare const it: any;
declare const expect: any;

describe('Commerce OS - End-to-End Loop with Legacy Instruction', () => {
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

  it('should run legacy instruction through the hardened OS pipeline: Action -> UI -> Snapshot -> Undo', async () => {
    // 1. Setup modern core
    const store = new InMemoryRuntimeStore(initialState, new DefaultValidationPipeline([]));
    const actionLibrary = new ThemeActionLibrary({ store, actor: 'ai' });
    const policyEngine = new ThemePolicyEngine();
    const previewShell = new ThemePreviewShell();
    const rollbackEngine = new RollbackEngine(store, previewShell);
    
    const mockSourceMap: any = { 
      byFile: new Map(),
      resolveAffectedNodes: () => [] 
    };
    const executor = new ActionRuntimeExecutor(store, actionLibrary, policyEngine, mockSourceMap, previewShell);

    // 2. Setup Adapter
    const adapter = new CommerceOSKernelAdapter(executor, rollbackEngine);

    // 3. Mock DOM Container
    const mockContainer: any = { 
      innerHTML: '', 
      querySelector: () => ({ remove: () => {}, replaceWith: () => {}, appendChild: () => {} }) 
    };

    // 4. RUN: "帮我把首页改成奢侈品风格"
    console.log('--- Step 1: Running Legacy Instruction ---');
    const result = await adapter.runLegacyInstruction('帮我把首页改成奢侈品风格', mockContainer, 'home');

    expect(result.success).toBe(true);
    expect(store.getState().metadata.revision).toBeGreaterThan(1);
    
    // 5. Verify Timeline (Snapshot)
    console.log('--- Step 2: Verifying Snapshot ---');
    const history = (previewShell as any).history.getStack();
    expect(history.length).toBeGreaterThan(1);
    expect(history[history.length - 1].action.label).toContain('页面布局'); // From Explainer

    // 6. UNDO: Verify Rollback
    console.log('--- Step 3: Verifying Undo ---');
    const preUndoRevision = store.getState().metadata.revision;
    await rollbackEngine.undoWithUI('home', mockContainer);
    
    expect(store.getState().metadata.revision).toBeLessThan(preUndoRevision);
    expect(store.getState().metadata.revision).toBe(1); // Should back to initial
    
    console.log('✅ Hardened Commerce OS Loop verified successfully!');
  });
});
