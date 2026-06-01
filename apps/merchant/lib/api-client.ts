import type { Product, Order, Customer, Discount } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005/api";
const MERCHANT_ID = process.env.NEXT_PUBLIC_MERCHANT_ID || 'merchant-001';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "x-merchant-id": MERCHANT_ID,
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getProducts(): Promise<Product[]> {
    return this.request<Product[]>("/products");
  }

  async createProduct(product: Omit<Product, "id">): Promise<Product> {
    return this.request<Product>("/products", {
      method: "POST",
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    return this.request<Product>(`/products?id=${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/products?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  }

  async getOrders(): Promise<Order[]> {
    return this.request<Order[]>('/orders');
  }

  async getCustomers(): Promise<Customer[]> {
    return this.request<Customer[]>('/customers');
  }

  async createCustomer(customer: Omit<Customer, 'id'>): Promise<Customer> {
    return this.request<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  }

  async getDiscounts(): Promise<Discount[]> {
    return this.request<Discount[]>('/discounts');
  }

  async createDiscount(discount: Omit<Discount, 'id' | 'usageCount'>): Promise<Discount> {
    return this.request<Discount>('/discounts', {
      method: 'POST',
      body: JSON.stringify(discount),
    });
  }

  async updateDiscount(id: string, discount: Partial<Discount>): Promise<Discount> {
    return this.request<Discount>(`/discounts?id=${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(discount),
    });
  }

  async deleteDiscount(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/discounts?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  }

  async getAgents(): Promise<any[]> {
    const res = await this.request<{ ok: boolean; agents: any[] }>('/agents');
    return res.agents;
  }

  async getAgentTasks(agentId?: string): Promise<any[]> {
    const endpoint = agentId ? `/agents/tasks?agentId=${agentId}` : '/agents/tasks';
    const res = await this.request<{ ok: boolean; tasks: any[] }>(endpoint);
    return res.tasks;
  }

  async runAgentTask(agentId: string, action: string, params: any = {}): Promise<any> {
    const res = await this.request<{ ok: boolean; task: any }>('/agents/run', {
      method: 'POST',
      body: JSON.stringify({ agentId, action, params }),
    });
    return res.task;
  }

  // --- Commerce OS API ---

  /**
   * processOSIntent
   * 发送自然语言意图到 OS Gateway
   */
  async processOSIntent(intent: string): Promise<any> {
    return this.request('/os/execute', {
      method: 'POST',
      body: JSON.stringify({ intent }),
    });
  }

  /**
   * runOSAction
   * 发送原子指令到 OS Gateway，强制走统一执行链路
   */
  async runOSAction(domain: string, action: string, payload: any = {}): Promise<any> {
    return this.request('/os/execute', {
      method: 'POST',
      body: JSON.stringify({ domain, action, payload }),
    });
  }
}

export const apiClient = new ApiClient();
