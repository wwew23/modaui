import { importThemeFromLiquid } from './from-liquid';
import { exportRuntimeAfterPatches } from './runtime-export-flow';
import { LiquidAstFile } from './ast-preserver';
import { wrapWithAiRegion } from './runtime-region';
import { RuntimePatch } from '../runtime-core/patch';
import { ThemeRuntime } from '../runtime-core/types';

async function runRoundTripTest() {
  console.log('--- Starting Stable Round-Trip Test (Phase 2) ---');

  // 1. Setup: 原始 Liquid 源码，包含一个 AI 托管区域
  const sectionId = 'hero-1';
  const originalSource = `
{% comment %} MDAI_REGION_START:${sectionId} {% endcomment %}
<section class="hero">
  <h1>Original Heading</h1>
</section>
{% comment %} MDAI_REGION_END:${sectionId} {% endcomment %}
<div class="legacy-content">
  This is legacy code that must not be touched.
</div>
  `.trim();

  const filePath = 'sections/hero.liquid';
  const originalFiles: LiquidAstFile[] = [
    {
      file: filePath,
      source: originalSource,
      root: {
        type: 'root',
        loc: { file: filePath, startLine: 1, endLine: 10, offset: 0, length: originalSource.length },
        children: [
          {
            type: 'section',
            id: sectionId,
            sectionType: 'hero',
            settings: { heading: 'Original Heading' },
            loc: { 
              file: filePath, 
              startLine: 2, 
              endLine: 4, 
              offset: originalSource.indexOf('<section'), 
              length: originalSource.indexOf('</section>') + 10 - originalSource.indexOf('<section') 
            }
          }
        ]
      }
    }
  ];

  // 2. Import: Liquid -> Runtime
  console.log('Step 1: Importing Liquid...');
  const { runtime, sourceMap } = await importThemeFromLiquid(originalFiles);
  
  const pageHandle = 'hero'; // 因为文件在 sections/hero.liquid，from-liquid 逻辑会解析为 handle=hero
  const section = runtime.pages[pageHandle]?.sections.find(s => s.id === sectionId);
  
  if (!section) {
    throw new Error('Failed to import section!');
  }
  console.log('Import successful. Section ownership:', section.ownership);

  // 3. Patch: 模拟 AI 修改标题
  const patches: RuntimePatch[] = [
    {
      op: 'replace',
      path: `/pages/${pageHandle}/sections/0/settings/heading`,
      value: 'Updated by AI Kernel',
      scope: 'content',
      actor: 'ai',
      description: 'Update hero heading'
    }
  ];

  // 应用 Patch 到 Runtime (模拟)
  const patchedRuntime: ThemeRuntime = JSON.parse(JSON.stringify(runtime));
  patchedRuntime.pages[pageHandle].sections[0].settings.heading = 'Updated by AI Kernel';

  // 4. Export: Runtime -> Liquid (Incremental)
  console.log('\nStep 2: Exporting Incremental Changes...');
  const exportResult = exportRuntimeAfterPatches(
    patches,
    patchedRuntime,
    sourceMap,
    originalFiles
  );

  const updatedSource = exportResult.files[0]?.source || '';
  console.log('Updated Source Output:');
  console.log('----------------------');
  console.log(updatedSource);
  console.log('----------------------');

  // 5. Invariants Verification
  console.log('\nStep 3: Verifying Invariants');
  
  const hasUpdatedContent = updatedSource.includes('Updated by AI Kernel');
  const hasLegacyUntouched = updatedSource.includes('This is legacy code that must not be touched.');
  const hasMarkersIntact = updatedSource.includes(`MDAI_REGION_START:${sectionId}`) && 
                           updatedSource.includes(`MDAI_REGION_END:${sectionId}`);

  console.log('- AI Content Updated:', hasUpdatedContent);
  console.log('- Legacy Code Untouched:', hasLegacyUntouched);
  console.log('- AI Markers Intact:', hasMarkersIntact);

  if (hasUpdatedContent && hasLegacyUntouched && hasMarkersIntact) {
    console.log('\n✅ Round-Trip Invariants PASSED!');
  } else {
    console.error('\n❌ Round-Trip Invariants FAILED!');
    process.exit(1);
  }

  // 6. Re-import: 验证再次导入后的状态一致性
  console.log('\nStep 4: Re-importing to verify stability...');
  const reImported = await importThemeFromLiquid([
    {
      file: filePath,
      source: updatedSource,
      root: originalFiles[0].root // 简化
    }
  ]);

  const reSection = reImported.runtime.pages[pageHandle].sections[0];
  const isStateStable = reSection.settings.heading === 'Updated by AI Kernel';
  
  console.log('- Re-imported State Stable:', isStateStable);

  if (isStateStable) {
    console.log('\n✅ Round-Trip Complete Stability PASSED!');
  } else {
    console.error('\n❌ Round-Trip Stability FAILED!');
    process.exit(1);
  }
}

runRoundTripTest().catch(err => {
  console.error(err);
  process.exit(1);
});
