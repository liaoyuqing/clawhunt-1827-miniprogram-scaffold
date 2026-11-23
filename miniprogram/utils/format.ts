/** 通用格式化工具（纯函数，无副作用，便于单测） */

/** ISO 时间 → 'YYYY-MM-DD HH:mm'，本地时区；非法输入返回空串 */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number): string => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** 截断文本，超出部分用省略号 */
export function truncate(text: string, max = 40): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}
