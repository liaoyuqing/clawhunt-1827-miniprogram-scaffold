import { ENV } from '../config/env';
import { MOCK_MEMBER } from '../mock/member';
import type { MemberProfile } from '../types/models';
import { request } from './http';

/**
 * 会员接口层。对接点：
 *   GET  {apiBaseUrl}/v1/member/profile           当前会员档案
 *   POST {apiBaseUrl}/v1/member/verify            提交实名认证
 *   PUT  {apiBaseUrl}/v1/member/profile           资料维护
 */
export async function fetchMemberProfile(): Promise<MemberProfile> {
  if (ENV.mockEnabled) {
    return { ...MOCK_MEMBER };
  }
  return request<MemberProfile>('/v1/member/profile');
}

export async function submitVerification(payload: {
  real_name: string;
  id_no: string;
}): Promise<{ ok: true }> {
  if (ENV.mockEnabled) {
    return { ok: true };
  }
  return request<{ ok: true }>('/v1/member/verify', { method: 'POST', data: payload });
}
