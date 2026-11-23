import type { MemberProfile } from '../types/models';
import { createStore, type Store } from './core';

export interface MemberState {
  profile: MemberProfile | null;
  /** 是否已登录；脚手架阶段恒为 false，登录流程由后续工单接入 */
  loggedIn: boolean;
}

export function createMemberStore(): Store<MemberState> {
  return createStore<MemberState>({
    profile: null,
    loggedIn: false,
  });
}
