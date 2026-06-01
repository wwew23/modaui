import { createGuardedRuntime, MutationOutsideTransactionError } from '../runtime-factory';
import { ThemeRuntime } from '../types';

describe('Mutation Gate (Proxy Protection)', () => {
  const mockRuntime: ThemeRuntime = {
    id: 'test-theme',
    name: 'Test Theme',
    tokens: {
      colors: {
        background: { base: { paletteId: 'p1', key: 'bg' } },
        surface: { base: { paletteId: 'p1', key: 'surface' } },
        textPrimary: { base: { paletteId: 'p1', key: 'text' } },
        textSecondary: { base: { paletteId: 'p1', key: 'text-sub' } },
        accent: { base: { paletteId: 'p1', key: 'accent' } },
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
    pages: {},
    nodes: {
      sections: {
        's1': {
          id: 's1',
          type: 'hero',
          settings: { title: 'Hello' },
          hash: { content: 'h1', structure: 's1' },
          ownership: 'ai-managed'
        }
      },
      blocks: {}
    },
    relations: {
      pageSections: {},
      sectionBlocks: {}
    },
    globalSettings: {},
    metadata: {
      revision: 1,
      importedAt: new Date().toISOString(),
      version: '1.0.0'
    }
  };

  it('should throw MutationOutsideTransactionError when modifying state outside transaction', () => {
    const { proxy, setInTransaction } = createGuardedRuntime(mockRuntime);

    expect(() => {
      proxy.name = 'New Name';
    }).toThrow(MutationOutsideTransactionError);

    expect(() => {
      proxy.nodes.sections['s1'].settings.title = 'New Title';
    }).toThrow(MutationOutsideTransactionError);

    expect(() => {
      proxy.relations.pageSections['home'] = ['s1'];
    }).toThrow(MutationOutsideTransactionError);
  });

  it('should allow modifications when isInTransaction is true', () => {
    const { proxy, setInTransaction } = createGuardedRuntime(mockRuntime);

    setInTransaction(true);
    proxy.name = 'New Name';
    proxy.nodes.sections['s1'].settings.title = 'New Title';
    
    expect(proxy.name).toBe('New Name');
    expect(proxy.nodes.sections['s1'].settings.title).toBe('New Title');
    
    setInTransaction(false);
    expect(() => {
      proxy.name = 'Illegal Change';
    }).toThrow(MutationOutsideTransactionError);
  });

  it('should handle nested property modifications', () => {
    const { proxy, setInTransaction } = createGuardedRuntime(mockRuntime);

    setInTransaction(true);
    if (!proxy.relations.pageSections['home']) {
      proxy.relations.pageSections['home'] = [];
    }
    proxy.relations.pageSections['home'].push('s2');
    setInTransaction(false);

    expect(proxy.relations.pageSections['home']).toContain('s2');
    
    expect(() => {
      proxy.relations.pageSections['home'].push('s3');
    }).toThrow(MutationOutsideTransactionError);
  });
});
