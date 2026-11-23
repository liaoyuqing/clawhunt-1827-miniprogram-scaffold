/**
 * 全局状态的最小实现：不引第三方状态库（MobX/Redux 对本单是额外体积），
 * 用「闭包 + 订阅」的微型 store。页面在 onLoad 订阅、onUnload 退订。
 *
 * 单独成文件是为了让 resource.ts / member.ts 不必反向 import index.ts（避免循环依赖）。
 */
export interface Store<T> {
  getState(): T;
  setState(patch: Partial<T>): void;
  subscribe(listener: (state: T) => void): () => void;
}

export function createStore<T extends object>(initial: T): Store<T> {
  let state: T = { ...initial };
  const listeners = new Set<(state: T) => void>();
  return {
    getState: () => state,
    setState(patch: Partial<T>) {
      state = { ...state, ...patch };
      listeners.forEach((listener) => listener(state));
    },
    subscribe(listener: (state: T) => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
