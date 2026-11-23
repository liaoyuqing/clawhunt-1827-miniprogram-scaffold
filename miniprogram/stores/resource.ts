import { MOCK_RESOURCES } from '../mock/resources';
import type { ResourceItem } from '../types/models';
import { createStore, type Store } from './core';

export interface ResourceState {
  list: ResourceItem[];
  loading: boolean;
  selectedId: string | null;
}

/** 商机列表状态；初值取 mock，保证首屏不空白。 */
export function createResourceStore(): Store<ResourceState> {
  return createStore<ResourceState>({
    list: MOCK_RESOURCES.slice(),
    loading: false,
    selectedId: null,
  });
}
