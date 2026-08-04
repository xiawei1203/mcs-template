import request from '@/utils/request'

// 查询图标管理列表
export function findPage(query) {
  return request({
    url: '/admin/v1/sysIcons/list',
    method: 'get',
    params: query
  })
}

// 查询图标管理详细
export function findById(id) {
  return request({
    url: '/admin/v1/sysIcons/' + id,
    method: 'get'
  })
}

// 新增图标管理
export function insert(data) {
  return request({
    url: '/admin/v1/sysIcons',
    method: 'post',
    data: data
  })
}

// 修改图标管理
export function update(data) {
  return request({
    url: '/admin/v1/sysIcons',
    method: 'put',
    data: data
  })
}

// 删除图标管理
export function deleteById(id) {
  return request({
    url: '/admin/v1/sysIcons/' + id,
    method: 'delete'
  })
}

// 删除图标管理IDS
export function deleteBatch(ids) {
  return request({
    url: '/admin/v1/sysIcons/ids',
    method: 'delete',
    data:ids
  })
}
