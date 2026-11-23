/**
 * UUID v4 生成。
 *
 * 小程序真机环境没有 crypto.randomUUID，这里用 Math.random 拼装 RFC 4122 v4
 * 格式（第 13 位固定 4，第 17 位取 8/9/a/b）。它只用于前端列表 key 与乐观
 * 乐观插入的临时 id，真正的持久化主键仍由服务端生成。
 */
export function uuidV4(): string {
  const hex = '0123456789abcdef';
  let out = '';
  for (let i = 0; i < 36; i += 1) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      out += '-';
    } else if (i === 14) {
      out += '4';
    } else if (i === 19) {
      out += hex.charAt((Math.floor(Math.random() * 4) + 8) % 16);
    } else {
      out += hex.charAt(Math.floor(Math.random() * 16));
    }
  }
  return out;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** 校验是否合法 UUID v4 */
export function isUuidV4(value: string): boolean {
  return UUID_RE.test(value);
}
