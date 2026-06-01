import { InMemoryRuntimeStore } from './store-impl';
import { DefaultValidationPipeline } from './validation-pipeline';
import { SchemaValidator } from './validators/schema-validator';
import { ThemeRuntime } from './types';

async function runExample() {
  // 1. 初始状态
  const initialState: ThemeRuntime = {
    id: 'theme-001',
    name: 'Luxury Dawn',
    tokens: {
      colors: {
        background: { base: { paletteId: 'p1', key: 'white' } },
        surface: { base: { paletteId: 'p1', key: 'gray-50' } },
        textPrimary: { base: { paletteId: 'p1', key: 'black' } },
        textSecondary: { base: { paletteId: 'p1', key: 'gray-600' } },
        accent: { base: { paletteId: 'p1', key: 'gold' } },
      },
      typography: {
        headingLg: { fontFamily: 'Inter', fontSize: { base: '32px' }, lineHeight: { base: '1.2' }, fontWeight: { base: 700 } },
        headingMd: { fontFamily: 'Inter', fontSize: { base: '24px' }, lineHeight: { base: '1.2' }, fontWeight: { base: 600 } },
        body: { fontFamily: 'Inter', fontSize: { base: '16px' }, lineHeight: { base: '1.5' }, fontWeight: { base: 400 } },
        caption: { fontFamily: 'Inter', fontSize: { base: '12px' }, lineHeight: { base: '1.5' }, fontWeight: { base: 400 } },
      },
      spacing: { 'm': { base: '16px' } },
      radius: { 'md': { base: '8px' } }
    },
    pages: {
      home: {
        id: 'page-home',
        name: 'Home',
        handle: 'home',
        sections: [],
        order: []
      }
    },
    globalSettings: {},
    metadata: {
      importedAt: new Date().toISOString(),
      version: '1.0.0'
    }
  };

  // 2. 验证管线
  const validationPipeline = new DefaultValidationPipeline([
    new SchemaValidator({}) // 传入 mock schema
  ]);

  // 3. 创建 Store
  const store = new InMemoryRuntimeStore(initialState, validationPipeline);

  console.log('--- Initial State ---');
  console.log(JSON.stringify(store.getState().pages.home, null, 2));

  // 4. 应用一个 AI 事务：添加 Section
  console.log('\n--- Applying AI Transaction: Add Section ---');
  const tx1 = await store.applyTransaction({
    id: 'tx-001',
    actor: 'ai',
    description: 'AI: Add Hero Section',
    patches: [
      {
        op: 'add',
        path: '/pages/home/sections/-',
        scope: 'structure',
        value: {
          id: 'hero-1',
          type: 'hero',
          settings: {
            heading: 'Redefining Luxury',
            subheading: 'Experience the new collection'
          },
          blocks: []
        }
      }
    ]
  });

  if (tx1.success) {
    console.log('Success!');
    console.log(JSON.stringify(store.getState().pages.home.sections, null, 2));
  } else {
    console.error('Failed:', tx1.errors);
  }

  // 5. 应用另一个事务：修改设置
  console.log('\n--- Applying User Transaction: Update Heading ---');
  const tx2 = await store.applyTransaction({
    id: 'tx-002',
    actor: 'user',
    description: 'User: Change Hero Heading',
    patches: [
      {
        op: 'replace',
        path: '/pages/home/sections/0/settings/heading',
        scope: 'content',
        value: 'Exclusive Elegance'
      }
    ]
  });

  if (tx2.success) {
    console.log('Success!');
    console.log('New Heading:', store.getState().pages.home.sections[0].settings.heading);
  }

  // 6. Undo 测试
  console.log('\n--- Undoing Last Transaction ---');
  await store.undo();
  console.log('Heading after Undo:', store.getState().pages.home.sections[0].settings.heading);

  // 7. Redo 测试
  console.log('\n--- Redoing Last Transaction ---');
  await store.redo();
  console.log('Heading after Redo:', store.getState().pages.home.sections[0].settings.heading);

  // 8. 快照测试
  console.log('\n--- Creating Snapshot ---');
  const snap = await store.createSnapshot('Before big change');
  console.log('Snapshot ID:', snap.id);
}

// 运行示例
runExample().catch(console.error);
