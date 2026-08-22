/**
 * 雪花 id / 数字主键转字符串，空值归一成空串，避免大整数精度丢失
 * @param {*} value
 * @returns {string}
 */
export function toId(value) {
  return value === null || value === undefined || value === '' ? '' : String(value)
}

/**
 * requestId 在一次弹窗打开期间复用；优先使用浏览器原生 UUID，旧浏览器回退到随机串。
 * @returns {string}
 */
export function createRequestId() {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID()
  }
  const random = typeof window !== 'undefined' && window.crypto?.getRandomValues
    ? window.crypto.getRandomValues(new Uint32Array(4)).join('')
    : `${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`
  return `${Date.now()}-${random}`
}

/**
 * 查询参数去空：空串 / null / undefined 不下发，避免后端把空串当有效过滤条件
 * @param {object} [query]
 * @returns {object}
 */
export function cleanQuery(query = {}) {
  return Object.keys(query).reduce((result, key) => {
    const value = query[key]
    if (value !== '' && value !== null && value !== undefined) result[key] = value
    return result
  }, {})
}
