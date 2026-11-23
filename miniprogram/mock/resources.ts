import type { ResourceItem } from '../types/models';

/** 全部为虚构数据：不含任何真实企业、人名、手机号或客户名称。 */
export const MOCK_RESOURCES: ResourceItem[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    org_id: '00000000-0000-4000-8000-000000000001',
    site_id: '00000000-0000-4000-8000-000000000002',
    created_at: '2026-11-01T09:00:00.000Z',
    created_by: 'user-demo-01',
    updated_at: '2026-11-01T09:00:00.000Z',
    deleted_at: null,
    title: '示例商机：园区导览小程序改版',
    summary: '面向访客的园区导览与活动报名，含地图与展位信息展示。',
    budget_cents: 690000,
    status: 'published',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    org_id: '00000000-0000-4000-8000-000000000001',
    site_id: '00000000-0000-4000-8000-000000000002',
    created_at: '2026-11-03T02:30:00.000Z',
    created_by: 'user-demo-02',
    updated_at: '2026-11-05T02:30:00.000Z',
    deleted_at: null,
    title: '示例商机：会员积分兑换模块',
    summary: '积分商城列表、兑换记录与库存校验，接口以对接桩先行。',
    budget_cents: 1280000,
    status: 'published',
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    org_id: '00000000-0000-4000-8000-000000000001',
    site_id: '00000000-0000-4000-8000-000000000003',
    created_at: '2026-11-08T11:15:00.000Z',
    created_by: 'user-demo-03',
    updated_at: '2026-11-08T11:15:00.000Z',
    deleted_at: null,
    title: '示例商机：活动签到与席位管理',
    summary: '扫码签到、席位看板与导出，先做只读视图。',
    budget_cents: 450000,
    status: 'draft',
  },
];
