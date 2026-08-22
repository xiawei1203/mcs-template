/**
 * 示例模块路由 path 常量
 *
 * 必须与运营平台 / 主应用菜单配置的 path 字符串一致（不含 qiankun history base）。
 * 页面内禁止硬编码 path 字符串，跨页跳转统一 router.push({ path: XXX, query })。
 */

/** 列表页：由运营平台菜单下发 */
export const DEMO_LIST = '/demo/list'

/** 详情页：query { id } 必填 */
export const DEMO_DETAIL = '/demo/detail'

/** 表单页：query { id } 有值为编辑，无值为新增 */
export const DEMO_FORM = '/demo/form'
