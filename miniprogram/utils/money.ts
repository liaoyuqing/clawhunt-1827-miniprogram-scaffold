/**
 * 金额工具。
 *
 * 全项目金额以「分」为单位存整数：接口、store、mock 数据都只出现
 * budget_cents / fee_cents 这类整数字段；展示时才转成元。
 */

/** 断言金额是整数分；不是整数直接抛错，避免浮点金额混入数据层 */
export function assertCents(value: number, field = 'amount'): number {
  if (!Number.isInteger(value)) {
    throw new Error(`${field} must be an integer number of cents, got ${String(value)}`);
  }
  if (value < 0) {
    throw new Error(`${field} must not be negative, got ${String(value)}`);
  }
  return value;
}

/** 分 → 元，固定两位小数字符串，例如 6900 → '69.00' */
export function centsToYuan(cents: number): string {
  assertCents(cents);
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const yuan = Math.floor(abs / 100);
  const fen = abs % 100;
  return `${sign}${yuan}.${fen.toString().padStart(2, '0')}`;
}

/** 分 → 带 ¥ 前缀的展示文本 */
export function formatCents(cents: number): string {
  return `¥${centsToYuan(cents)}`;
}

/** 元字符串 → 分整数；非法输入抛错，不做静默四舍五入 */
export function yuanToCents(yuan: string): number {
  const trimmed = yuan.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    throw new Error(`invalid yuan amount: ${yuan}`);
  }
  const [intPart, fracPart = ''] = trimmed.split('.');
  return Number(intPart) * 100 + Number(fracPart.padEnd(2, '0'));
}
