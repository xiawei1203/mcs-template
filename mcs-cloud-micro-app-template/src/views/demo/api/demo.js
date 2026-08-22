import request from '@/utils/request'

/**
 * 示例模块接口
 *
 * 函数名固定为 findPage / findById / insert / update / deleteById / deleteBatch，
 * 以便直接接入 src/hooks/pager.js 的通用列表逻辑。
 * 接口前缀以当前子应用的网关代理为准（见 vue.config.js devServer.proxy）。
 */

const BASE_URL = '/test/v1/demo'

/**
 * 分页查询
 * @param {object} query page、pageSize 及各筛选字段
 */
export function findPage(query) {
  return request({
    url: `${BASE_URL}/list`,
    method: 'get',
    params: buildQuery(query)
  })
}

/**
 * 列表页统计卡数据
 * @param {object} [query] 与列表共用筛选条件
 */
export function findStatistics(query) {
  return request({
    url: `${BASE_URL}/statistics`,
    method: 'get',
    params: buildQuery(query)
  })
}

/**
 * 详情
 * @param {string|number} id
 */
export function findById(id) {
  return request({
    url: `${BASE_URL}/${encodeURIComponent(id)}`,
    method: 'get'
  })
}

/**
 * 新增
 * @param {object} data
 */
export function insert(data) {
  return request({
    url: BASE_URL,
    method: 'post',
    data
  })
}

/**
 * 修改
 * @param {object} data 必须含 id
 */
export function update(data) {
  return request({
    url: BASE_URL,
    method: 'put',
    data
  })
}

/**
 * 删除单条
 * @param {string|number} id
 */
export function deleteById(id) {
  return request({
    url: `${BASE_URL}/${encodeURIComponent(id)}`,
    method: 'delete'
  })
}

/**
 * 批量删除
 * @param {Array<string|number>} ids
 */
export function deleteBatch(ids) {
  return request({
    url: `${BASE_URL}/ids`,
    method: 'delete',
    data: ids
  })
}

/**
 * 查询参数在 API 层归一化：日期区间拆成起止字段、空值不下发，页面不拼底层参数
 * @param {object} [query]
 */
function buildQuery(query = {}) {
  const { createTimeRange, ...rest } = query
  const params = {}
  Object.keys(rest).forEach((key) => {
    const value = rest[key]
    if (value !== '' && value !== null && value !== undefined) {
      params[key] = value
    }
  })
  if (Array.isArray(createTimeRange) && createTimeRange.length === 2) {
    params.createTimeStart = createTimeRange[0]
    params.createTimeEnd = createTimeRange[1]
  }
  return params
}
