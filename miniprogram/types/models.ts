/**
 * 业务模型（与后端契约共用）。
 *
 * 全项目统一约定：所有业务表都带 id(UUID) / org_id / site_id / created_at /
 * created_by / updated_at / deleted_at 七个字段；金额一律以「分」存整数，
 * 展示层再用 utils/money.ts 转到元，绝不在数据层出现浮点金额。
 */

export interface BaseRow {
  /** 主键，UUID v4 字符串 */
  id: string;
  /** 组织（租户）id */
  org_id: string;
  /** 站点 id */
  site_id: string;
  /** 创建时间，ISO 8601 字符串 */
  created_at: string;
  /** 创建人 id */
  created_by: string;
  /** 更新时间，ISO 8601 字符串 */
  updated_at: string;
  /** 软删除时间；未删除为 null */
  deleted_at: string | null;
}

/** 商机（pkg-resource 分包列表项） */
export interface ResourceItem extends BaseRow {
  title: string;
  /** 摘要，列表页只渲染这一行 */
  summary: string;
  /** 报价，单位：分 */
  budget_cents: number;
  /** 状态：draft 草稿 / published 已发布 / closed 已关闭 */
  status: 'draft' | 'published' | 'closed';
}

/** 活动（event tab 预留） */
export interface EventItem extends BaseRow {
  title: string;
  /** 开始时间，ISO 8601 */
  starts_at: string;
  /** 报名费，单位：分 */
  fee_cents: number;
}

/** 会员档案（pkg-member 分包） */
export interface MemberProfile extends BaseRow {
  nickname: string;
  /** 认证状态 */
  verify_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  /** 积分：本平台以「分」为单位存储的全部金额字段之一 */
  points: number;
}
