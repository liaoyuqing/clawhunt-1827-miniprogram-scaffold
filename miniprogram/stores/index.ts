import { createMemberStore } from './member';
import { createResourceStore } from './resource';

export * from './core';
export { createResourceStore, type ResourceState } from './resource';
export { createMemberStore, type MemberState } from './member';

export const resourceStore = createResourceStore();
export const memberStore = createMemberStore();

let bootstrapped = false;

/** app.onLaunch 调用，只执行一次；给后续真接口留可替换的钩子。 */
export function bootstrapStores(): void {
  if (bootstrapped) return;
  bootstrapped = true;
  console.info('[stores] bootstrapped', {
    resources: resourceStore.getState().list.length,
    member: memberStore.getState().profile?.nickname ?? null,
  });
}
