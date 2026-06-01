import { taskStore } from './task-store';
import { AgentTask } from './types';
import { ActionRuntimeExecutor } from '../theme-importer/action-runtime-executor';

// Mock/Simple implementation of a worker trigger
// In a real system, this would push to a queue (BullMQ/Redis)
export class AgentGateway {
  constructor(private executor: ActionRuntimeExecutor) {}

  async runTask(agentId: string, action: string, params: any): Promise<AgentTask> {
    const task = taskStore.createTask(agentId, action, params);
    
    // Set agent to executing
    taskStore.updateAgentStatus(agentId, 'executing');
    taskStore.updateTask(task.id, { status: 'executing' });

    // Start execution asynchronously (Fire and Forget for the gateway, but tracked in store)
    this.executeInBackground(task);

    return task;
  }

  private async executeInBackground(task: AgentTask) {
    try {
      console.log(`[AgentGateway] Executing task ${task.id} for agent ${task.agentId}`);
      
      // Transform agent action to ActionPlan
      const plan = [{
        action: task.action,
        params: [task.params]
      }];

      // Execute using the kernel executor
      const results = await this.executor.executePlan(plan, 'ai');
      
      const mainResult = results[0] as any;
      if (mainResult.success) {
        taskStore.updateTask(task.id, {
          status: 'success',
          result: mainResult.transaction || mainResult.explanation,
          transactionId: mainResult.transaction?.id,
          logs: [...task.logs, `Execution successful: ${mainResult.explanation?.title || 'Done'}`]
        });
      } else {
        taskStore.updateTask(task.id, {
          status: 'failed',
          error: mainResult.error || (mainResult.errors ? JSON.stringify(mainResult.errors) : 'Unknown error'),
          logs: [...task.logs, `Execution failed: ${mainResult.error || 'Check logs'}`]
        });
      }
    } catch (error: any) {
      console.error(`[AgentGateway] Task ${task.id} crashed:`, error);
      taskStore.updateTask(task.id, {
        status: 'failed',
        error: error.message,
        logs: [...task.logs, `Critical error: ${error.message}`]
      });
    } finally {
      taskStore.updateAgentStatus(task.agentId, 'idle');
    }
  }

  getTasks(agentId?: string) {
    return taskStore.listTasks(agentId);
  }

  getAgents() {
    return taskStore.getAgents();
  }
}
