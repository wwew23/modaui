import { SIDEKICK_ACTIONS } from './sidekick-manifest';

export class SidekickManifestGenerator {
  /**
   * generate
   * 导出 AI 可理解的 JSON Schema 格式的能力清单
   */
  generate() {
    return {
      version: '1.0.0',
      system: 'CommerceOS',
      capabilities: SIDEKICK_ACTIONS.map(action => ({
        name: action.name,
        description: action.description,
        parameters: action.params,
        safety_level: action.safety,
        impact_areas: action.impact
      }))
    };
  }
}

export const manifestGenerator = new SidekickManifestGenerator();
