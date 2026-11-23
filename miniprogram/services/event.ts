import { ENV } from '../config/env';
import { MOCK_EVENTS } from '../mock/events';
import type { EventItem } from '../types/models';
import { request } from './http';

/** 活动接口层。对接点：GET {apiBaseUrl}/v1/events（mock 时返回本地虚构数据）。 */
export async function fetchEventList(): Promise<EventItem[]> {
  if (ENV.mockEnabled) {
    return MOCK_EVENTS.slice();
  }
  return request<EventItem[]>('/v1/events');
}
