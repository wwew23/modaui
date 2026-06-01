import { ActionRuntimeExecutor } from '../theme-importer/action-runtime-executor';
import { InMemoryRuntimeStore } from '../theme-importer/runtime-core/store-impl';
import { ThemeActionLibrary } from '../theme-importer/theme-actions';
import { ThemePolicyEngine } from '../theme-importer/theme-policy';
import { createEmptySourceMap } from '../theme-importer/runtime-mapping/source-map';
import { AgentGateway } from './gateway';
import { ValidationPipeline } from '../theme-importer/runtime-core/validation';

export function createAgentGateway(): AgentGateway {
  // 1. Initialize Kernel Components
  const mockValidationPipeline: ValidationPipeline = {
    validate: async () => ({ valid: true, errors: [] })
  };

  const initialRuntime: any = {
    id: 'default',
    name: 'Default Store',
    tokens: {
      colors: {},
      typography: {},
      spacing: {},
      radius: {}
    },
    pages: {},
    nodes: {
      sections: {},
      blocks: {}
    },
    relations: {
      pageSections: {},
      sectionBlocks: {}
    },
    globalSettings: {},
    metadata: {
      revision: 0,
      importedAt: new Date().toISOString(),
      version: '1.0'
    }
  };

  const store = new InMemoryRuntimeStore(
    initialRuntime,
    mockValidationPipeline
  );

  const actionLibrary = new ThemeActionLibrary({ store, actor: 'ai' });
  const policyEngine = new ThemePolicyEngine();
  const sourceMap = createEmptySourceMap();

  const executor = new ActionRuntimeExecutor(
    store,
    actionLibrary,
    policyEngine,
    sourceMap as any // SourceMap type mismatch in different modules
  );

  // 2. Initialize Gateway
  return new AgentGateway(executor);
}

export const globalAgentGateway = createAgentGateway();
