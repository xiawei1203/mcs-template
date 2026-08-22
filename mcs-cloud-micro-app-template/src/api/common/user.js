import request from '@/utils/request'

/**
 * 用户分页列表（用于负责人、经办人等人员选择器）
 * GET /admin/v1/user/list
 * @param {object} [params]
 * @param {number} [params.page=1]
 * @param {number} [params.pageSize=500] 选择器场景一次拉满，避免下拉分页
 * @param {string|number} [params.organizationId] 按部门过滤
 * @param {string} [params.statusList] 状态白名单，默认排除已停用账号
 * @param {string} [params.name] 姓名关键字
 * @param {string} [params.username] 账号关键字
 */
export function findUserList(params = {}) {
  return request({
    url: '/admin/v1/user/list',
    method: 'get',
    params: {
      page: params.page || 1,
      pageSize: params.pageSize || 500,
      organizationId: params.organizationId || undefined,
      statusList: params.statusList || '1,2,4,5',
      name: params.name || undefined,
      username: params.username || undefined
    }
  }).then((res) => {
    const data = res?.data || {}
    const rows = data.rows || data.records || data.list || []
    return { ...res, data: { ...data, rows, total: Number(data.total || 0) } }
  })
}

/**
 * 用户详情
 * GET /admin/v1/user/detail/{id}
 * @param {string|number} id
 */
export function getUserById(id) {
  return request({
    url: `/admin/v1/user/detail/${encodeURIComponent(id)}`,
    method: 'get'
  })
}

/**
 * 人员下拉展示名，兼容后端只返回 username 或只返回 name 的情况
 * @param {object} user
 * @returns {string}
 */
export function resolveUserLabel(user) {
  if (!user) return ''
  return String(user.name || user.username || user.id || '')
}
