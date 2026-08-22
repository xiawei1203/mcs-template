import request from '@/utils/request'

/**
 * 按字典编号取数据项列表
 * GET /admin/v1/sysDictData/getDictData/{dictType}
 *
 * 字典维护在系统设置的「数据字典」中，本子应用只读取，不提供增删改。
 * 返回值归一化为 { label, value, sort, raw }，页面统一按 label / value 使用，
 * 不直接依赖后端的 dataName / dataValue 字段名。
 * @param {string} dictType 字典编号，例如 leasing_project_type
 * @returns {Promise<{ label: string, value: string, sort: number, raw: object }[]>}
 */
export function getDictData(dictType) {
  const type = String(dictType || '').trim()
  if (!type) {
    return Promise.resolve([])
  }
  return request({
    url: `/admin/v1/sysDictData/getDictData/${encodeURIComponent(type)}`,
    method: 'get'
  }).then((res) => normalizeDictData(res?.data))
}

/**
 * 字典数据项归一化：过滤无效项，按 sort 升序，value 统一转字符串避免与表单值类型不一致
 * @param {Array} list
 */
function normalizeDictData(list) {
  if (!Array.isArray(list)) {
    return []
  }
  return list
    .filter((item) => item && item.valid !== 0 && item.dataValue != null)
    .map((item) => ({
      label: String(item.dataName == null ? item.dataValue : item.dataName),
      value: String(item.dataValue),
      sort: Number(item.sort || 0),
      raw: item
    }))
    .sort((a, b) => a.sort - b.sort)
}
