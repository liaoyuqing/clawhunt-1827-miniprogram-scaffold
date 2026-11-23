import type { EventItem } from '../types/models';

/** 全部为虚构数据。 */
export const MOCK_EVENTS: EventItem[] = [
  {
    id: '44444444-4444-4444-8444-444444444444',
    org_id: '00000000-0000-4000-8000-000000000001',
    site_id: '00000000-0000-4000-8000-000000000002',
    created_at: '2026-11-10T01:00:00.000Z',
    created_by: 'user-demo-01',
    updated_at: '2026-11-10T01:00:00.000Z',
    deleted_at: null,
    title: '示例活动：会员开放日',
    starts_at: '2026-12-05T06:00:00.000Z',
    fee_cents: 0,
  },
  {
    id: '55555555-5555-4555-8555-555555555555',
    org_id: '00000000-0000-4000-8000-000000000001',
    site_id: '00000000-0000-4000-8000-000000000002',
    created_at: '2026-11-12T03:20:00.000Z',
    created_by: 'user-demo-02',
    updated_at: '2026-11-12T03:20:00.000Z',
    deleted_at: null,
    title: '示例活动：产品线实操工作坊',
    starts_at: '2026-12-19T02:00:00.000Z',
    fee_cents: 19900,
  },
];
