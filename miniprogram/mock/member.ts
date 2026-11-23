import type { MemberProfile } from '../types/models';

/** 虚构会员档案，用于「我的」tab 与 pkg-member 分包的空态/字段展示。 */
export const MOCK_MEMBER: MemberProfile = {
  id: '66666666-6666-4666-8666-666666666666',
  org_id: '00000000-0000-4000-8000-000000000001',
  site_id: '00000000-0000-4000-8000-000000000002',
  created_at: '2026-10-01T00:00:00.000Z',
  created_by: 'user-demo-01',
  updated_at: '2026-11-20T08:00:00.000Z',
  deleted_at: null,
  nickname: '示例会员',
  verify_status: 'pending',
  points: 1280,
};
