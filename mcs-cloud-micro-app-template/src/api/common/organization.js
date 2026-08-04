import request from '@/utils/request'

/**
 * 组织 / 部门树
 * GET /admin/v1/organization
 * @returns {Promise} data 为根节点数组，节点含 id、name、children
 */
export function getOrganizationTree() {
  return request({
    url: '/admin/v1/organization',
    method: 'get'
  })
}

/**
 * 组织 / 部门详情
 * GET /admin/v1/organization/{id}
 * @param {string|number} id
 */
export function getOrganizationById(id) {
  return request({
    url: `/admin/v1/organization/${encodeURIComponent(id)}`,
    method: 'get'
  })
}

/**
 * 组织树展平为下拉选项：id 统一转字符串避免大整数精度问题，label 带「父 / 子」层级前缀便于识别同名部门
 * @param {Array} list 根节点列表
 * @param {string} [parentPath] 递归内部使用
 * @returns {{ id: string, name: string, label: string }[]}
 */
export function flattenOrganizationTree(list, parentPath = '') {
  const out = []
  if (!Array.isArray(list)) {
    return out
  }
  for (const node of list) {
    if (!node) continue
    const name = node.name == null ? '' : String(node.name)
    const label = parentPath ? `${parentPath} / ${name}` : name
    const id = node.id != null ? String(node.id) : ''
    if (id) {
      out.push({ id, name, label })
    }
    if (node.children && node.children.length) {
      out.push(...flattenOrganizationTree(node.children, label))
    }
  }
  return out
}
