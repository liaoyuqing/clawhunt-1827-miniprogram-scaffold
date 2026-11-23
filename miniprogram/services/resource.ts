import { ENV } from '../config/env';
import { MOCK_RESOURCES } from '../mock/resources';
import type { ResourceItem } from '../types/models';
import { request } from './http';

/**
 * 商机接口层。
 *
 * 对接点（README「接口对接清单」有同样的说明）：
 *   GET  {apiBaseUrl}/v1/resources            列表（分页参数 page/page_size）
 *   GET  {apiBaseUrl}/v1/resources/:id        详情
 *   POST {apiBaseUrl}/v1/resources            发布
 * 后端未就绪时 mockEnabled=true（默认），直接返回 miniprogram/mock/resources.ts
 * 的虚构数据，页面与单测都不依赖网络。
 */
export interface ResourceListQuery {
  page?: number;
  page_size?: number;
  status?: ResourceItem['status'];
}

export interface ResourceListResult {
  list: ResourceItem[];
  total: number;
}

export async function fetchResourceList(
  query: ResourceListQuery = {},
): Promise<ResourceListResult> {
  const { page = 1, page_size = 10, status } = query;
  if (ENV.mockEnabled) {
    const filtered = status
      ? MOCK_RESOURCES.filter((item) => item.status === status)
      : MOCK_RESOURCES;
    return { list: filtered.slice(0, page_size), total: filtered.length };
  }
  return request<ResourceListResult>('/v1/resources', {
    data: { page, page_size, status: status ?? '' },
  });
}

export async function fetchResourceDetail(id: string): Promise<ResourceItem | null> {
  if (ENV.mockEnabled) {
    return MOCK_RESOURCES.find((item) => item.id === id) ?? null;
  }
  return request<ResourceItem>(`/v1/resources/${id}`);
}
