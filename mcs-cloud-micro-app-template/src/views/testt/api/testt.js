import request from '@/utils/request'

// 查询测试列表
export function findPage(query) {
  return request({
    url: '/test/v1/testt/list',
    method: 'get',
    params: query
  })
}

// 查询测试详细
export function findById(id) {
  return request({
    url: '/test/v1/testt/' + id,
    method: 'get'
  })
}

// 新增测试
export function insert(data) {
  return request({
    url: '/test/v1/testt',
    method: 'post',
    data: data
  })
}

// 修改测试
export function update(data) {
  return request({
    url: '/test/v1/testt',
    method: 'put',
    data: data
  })
}

// 删除测试
export function deleteById(id) {
  return request({
    url: '/test/v1/testt/' + id,
    method: 'delete'
  })
}

// 删除测试IDS
export function deleteBatch(ids) {
  return request({
    url: '/test/v1/testt/ids',
    method: 'delete',
    data:ids
  })
}
