import { ThemeRuntime } from './types';

export class MutationOutsideTransactionError extends Error {
  constructor(path: string) {
    super(`MutationOutsideTransactionError: Illegal attempt to modify state at path "${path}" outside of a transaction.`);
    this.name = 'MutationOutsideTransactionError';
  }
}

/**
 * 创建受保护的 Runtime 代理
 * 只有当 isInTransaction 为 true 时才允许写入
 */
export function createGuardedRuntime(initial: ThemeRuntime): { 
  proxy: ThemeRuntime, 
  setInTransaction: (val: boolean) => void 
} {
  let isInTransaction = false;

  const handler: ProxyHandler<any> = {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      // 如果是对象且不是 null，递归代理
      if (typeof value === 'object' && value !== null) {
        return new Proxy(value, handler);
      }
      return value;
    },
    set(target, prop, value, receiver) {
      if (!isInTransaction) {
        console.error(`[MutationGate] Illegal mutation attempt at ${String(prop)} outside of transaction!`);
        throw new MutationOutsideTransactionError(String(prop));
      }
      return Reflect.set(target, prop, value, receiver);
    },
    deleteProperty(target, prop) {
      if (!isInTransaction) {
        console.error(`[MutationGate] Illegal deletion attempt at ${String(prop)} outside of transaction!`);
        throw new MutationOutsideTransactionError(String(prop));
      }
      return Reflect.deleteProperty(target, prop);
    },
    // 拦截数组操作
    defineProperty(target, prop, descriptor) {
      if (!isInTransaction) {
        throw new MutationOutsideTransactionError(String(prop));
      }
      return Reflect.defineProperty(target, prop, descriptor);
    }
  };

  return {
    proxy: new Proxy(initial, handler),
    setInTransaction: (val: boolean) => { isInTransaction = val; }
  };
}
