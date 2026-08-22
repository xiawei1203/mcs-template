import request from '@/utils/request'

const BASE_URL = '/spatialmap/v1/spatialSpace'

/**
 * 空间树
 * GET /spatialmap/v1/spatialSpace/tree
 * @param {object} [params]
 * @param {string|number} [params.rootId] 子树根节点id，为空返回整树
 * @param {boolean} [params.lazy=false] 是否只加载一级子节点
 * @param {boolean} [params.includeDeviceCount] count 中是否包含本级设备挂靠数
 */
export function getSpaceTree(params = {}) {
  return request({
    url: `${BASE_URL}/tree`,
    method: 'get',
    params: {
      rootId: params.rootId || undefined,
      lazy: params.lazy === true ? true : undefined,
      includeDeviceCount: params.includeDeviceCount === true ? true : undefined
    }
  })
}

/**
 * 空间节点详情（含面积、挂靠设备、标签）
 * GET /spatialmap/v1/spatialSpace/{id}
 * @param {string|number} id
 */
export function getSpaceDetail(id) {
  return request({
    url: `${BASE_URL}/${encodeURIComponent(id)}`,
    method: 'get'
  })
}

/**
 * 空间类型选项
 * GET /spatialmap/v1/spatialSpace/types
 */
export function getSpaceTypes() {
  return request({
    url: `${BASE_URL}/types`,
    method: 'get'
  })
}
