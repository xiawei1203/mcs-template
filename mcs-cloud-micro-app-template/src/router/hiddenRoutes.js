/**
 * 隐藏页路由（详情、表单等）
 *
 * 远程权限模式下，列表页由主应用 / 运营平台菜单下发，详情与表单不配菜单，
 * 因此必须由子应用本地始终注册，否则直接刷新或跳转会 404。
 * path 必须与对应模块 routePaths.js 中的常量一致。
 */

import { DEMO_DETAIL, DEMO_FORM } from '@/views/demo/routePaths'

export default [
  {
    path: DEMO_DETAIL,
    name: 'demoDetail',
    hidden: true,
    component: () => import('@/views/demo/detail/index.vue'),
    meta: { title: '示例详情', noCache: true }
  },
  {
    path: DEMO_FORM,
    name: 'demoForm',
    hidden: true,
    component: () => import('@/views/demo/form/index.vue'),
    meta: { title: '示例表单', noCache: true }
  }
]
