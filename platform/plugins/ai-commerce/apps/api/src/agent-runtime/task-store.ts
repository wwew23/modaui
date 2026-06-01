import { AgentTask, AgentInfo } from './types';

class TaskStore {
  private tasks: Map<string, AgentTask> = new Map();
  private agents: Map<string, AgentInfo> = new Map([
    [
      'order-assistant',
      {
        id: 'order-assistant',
        name: 'order-assistant',
        displayName: '订单处理助手',
        description: '自动处理订单、发货通知、退款审批',
        status: 'idle',
        model: 'GPT-4o',
        taskCount: 0,
        tools: ['orders.update', 'orders.refund'],
      },
    ],
    [
      'theme-expert',
      {
        id: 'theme-expert',
        name: 'theme-expert',
        displayName: '装修专家',
        description: '自动优化店铺模版、布局与视觉',
        status: 'idle',
        model: 'GPT-4o',
        taskCount: 0,
        tools: ['theme.change'],
      },
    ],
  ]);

  createTask(agentId: string, action: string, params: any): AgentTask {
    const task: AgentTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agentId,
      action,
      params,
      status: 'pending',
      logs: [`Task created for agent ${agentId}: ${action}`],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tasks.set(task.id, task);
    
    // Update agent status if needed
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.taskCount++;
    }
    
    return task;
  }

  updateTask(taskId: string, updates: Partial<AgentTask>): AgentTask | undefined {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;

    const updatedTask = {
      ...task,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.tasks.set(taskId, updatedTask);
    return updatedTask;
  }

  getTask(taskId: string): AgentTask | undefined {
    return this.tasks.get(taskId);
  }

  listTasks(agentId?: string): AgentTask[] {
    const allTasks = Array.from(this.tasks.values());
    if (agentId) {
      return allTasks.filter((t) => t.agentId === agentId);
    }
    return allTasks.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  getAgents(): AgentInfo[] {
    return Array.from(this.agents.values());
  }

  updateAgentStatus(agentId: string, status: AgentInfo['status']) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = status;
    }
  }
}

export const taskStore = new TaskStore();
