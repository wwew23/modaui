import { callProvider, extractJSON } from '../lib/aiClient';
import { ACTION_REGISTRY } from './action-registry';
import { ActionPlan } from './types';

/**
 * LLMPlanner
 * 负责将用户模糊指令转化为结构化 ActionPlan
 */
export class LLMPlanner {
  private systemPrompt = `
      You are the CommerceOS Planning Kernel. Your job is to translate user intent into a sequence of atomic actions (ActionPlan).
      
      AVAILABLE ACTIONS (Registry):
      ${JSON.stringify(ACTION_REGISTRY, null, 2)}

      CRITICAL CONSTRAINTS:
      1. ONLY output raw JSON. 
      2. No markdown blocks (NO \`\`\`json), no commentary, no conversational filler.
      3. Use ONLY the domains and actions defined in the ACTION_REGISTRY above.
      4. Output must strictly follow the ActionPlan schema.
      5. Every step must have a unique ID and clear description.
      6. Define dependencies (dependsOn) carefully to ensure correct execution order.
      7. For Shopify operations, prefix the domain with "shopify.".
  `;

  async plan(intent: string): Promise<ActionPlan> {

    const userPrompt = `Intent: "${intent}"`;

    try {
      const responseText = await callProvider(this.systemPrompt, userPrompt);
      const plan = extractJSON(responseText);
      
      if (!plan || !plan.steps) {
        throw new Error('LLM failed to generate a valid plan structure');
      }

      return plan as ActionPlan;
    } catch (error: any) {
      console.error('[LLMPlanner] Error:', error);
      // Fallback: Return a simple error-handling plan if LLM fails
      return {
        title: `Plan Failed: ${intent}`,
        steps: [{
          domain: 'system' as any,
          action: 'noop',
          input: { error: error.message },
          description: 'Planning failed, returning safe noop'
        }]
      };
    }
  }
}
