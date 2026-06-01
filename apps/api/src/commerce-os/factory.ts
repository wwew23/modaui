import { ActionRuntimeExecutor } from '../theme-importer/action-runtime-executor';
import { InMemoryRuntimeStore } from '../theme-importer/runtime-core/store-impl';
import { ThemeActionLibrary } from '../theme-importer/theme-actions';
import { ThemePolicyEngine } from '../theme-importer/theme-policy';
import { createEmptySourceMap } from '../theme-importer/runtime-mapping/source-map';
import { ProductActionLibrary } from '../product-runtime/product-actions';
import { CampaignActionLibrary } from '../campaign-runtime/campaign-actions';
import { CommerceOSGateway } from './gateway';
import { ActionPlanCompiler } from './compiler';
import { ValidationPipeline } from '../theme-importer/runtime-core/validation';
import { TransactionEngine } from './executor/transaction';
import { StepResolver } from './executor/step-resolver';
import { TransactionApplier } from './executor/transaction-applier';
import { ReplayEngine } from './replay-engine';

export interface CommerceOS {
  gateway: CommerceOSGateway;
  replay: ReplayEngine;
  compiler: ActionPlanCompiler;
  transaction: TransactionEngine;
}

export function createCommerceOS(): CommerceOS {
  // 1. Storage & Base Layers
  const mockValidationPipeline: ValidationPipeline = {
    validate: async () => ({ valid: true, errors: [] })
  };

  const initialRuntime: any = {
    id: 'default',
    name: 'Default Store',
    tokens: { colors: {}, typography: {}, spacing: {}, radius: {} },
    pages: {},
    nodes: { sections: {}, blocks: {} },
    relations: { pageSections: {}, sectionBlocks: {} },
    globalSettings: {},
    metadata: { revision: 0, importedAt: new Date().toISOString(), version: '1.0' }
  };

  const themeStore = new InMemoryRuntimeStore(initialRuntime, mockValidationPipeline);
  const productStore = new InMemoryRuntimeStore(initialRuntime, mockValidationPipeline);
  const campaignStore = new InMemoryRuntimeStore(initialRuntime, mockValidationPipeline);

  // 2. Transaction Engine (Kernel Core)
  const transaction = new TransactionEngine(themeStore, productStore, campaignStore);

  // 3. Runtime Executors & Libraries
  const themeActionLibrary = new ThemeActionLibrary({ store: themeStore, actor: 'ai' });
  const policyEngine = new ThemePolicyEngine();
  const sourceMap = createEmptySourceMap();

  const themeExecutor = new ActionRuntimeExecutor(
    themeStore,
    themeActionLibrary,
    policyEngine,
    sourceMap as any
  );

  const productLibrary = new ProductActionLibrary({ store: productStore, actor: 'ai' });
  const campaignLibrary = new CampaignActionLibrary();

  // 4. Executor Components (New Architecture)
  const stepResolver = new StepResolver(themeActionLibrary, productLibrary, campaignLibrary);
  const transactionApplier = new TransactionApplier(themeStore, productStore, campaignStore);

  // 5. OS Gateway (The unified entry)
  const gateway = new CommerceOSGateway(transaction, stepResolver, transactionApplier);

  // 6. Support Systems
  const replay = new ReplayEngine();
  const compiler = new ActionPlanCompiler(gateway);
  gateway.setCompiler(compiler);

  return { gateway, replay, compiler, transaction };
}

export const commerceOS = createCommerceOS();
