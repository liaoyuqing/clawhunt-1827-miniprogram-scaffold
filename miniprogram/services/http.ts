import { ENV } from '../config/env';

/** 统一的接口返回包（与后端契约一致：code=0 表示成功） */
export interface ApiEnvelope<T> {
  code: number;
  message: string;
  data: T;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: Record<string, unknown>;
  /** 超时毫秒，默认 8000 */
  timeout?: number;
}

export class ApiError extends Error {
  readonly statusCode: number;

  readonly code: number;

  constructor(message: string, statusCode: number, code: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * 极薄的 wx.request 封装：只负责拼 URL、透传鉴权头与统一错误。
 * 不接入任何第三方上报；网络失败只 reject，由调用方决定提示方式。
 */
export function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', data, timeout = 8000 } = options;
  return new Promise<T>((resolve, reject) => {
    wx.request({
      url: `${ENV.apiBaseUrl}${path}`,
      method,
      data,
      timeout,
      header: { 'content-type': 'application/json' },
      success(res) {
        const body = res.data as ApiEnvelope<T> | undefined;
        if (res.statusCode >= 200 && res.statusCode < 300 && body && body.code === 0) {
          resolve(body.data);
          return;
        }
        reject(
          new ApiError(
            body?.message ?? `request failed with status ${String(res.statusCode)}`,
            res.statusCode,
            body?.code ?? -1,
          ),
        );
      },
      fail(err) {
        reject(new ApiError(err.errMsg, 0, -1));
      },
    });
  });
}
