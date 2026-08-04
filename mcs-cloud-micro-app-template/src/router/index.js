import * as VueRouter from 'vue-router'
import hiddenRoutes from './hiddenRoutes'
const constantRoutesConfig=require('./constantRoutes')
import {name,remotePermissions} from '@/settings'

export const constantRoutes = []

/**
 * 调试模式加载本地菜单配置
 */
if (process.env.NODE_ENV === "development" && !remotePermissions) {
  constantRoutesConfig.forEach(item=>constantRoutes.push(item))
}

/**
 * 隐藏页（详情、表单）不由菜单下发，任何模式下都由子应用本地注册
 */
hiddenRoutes.forEach(item=>constantRoutes.push(item))


const createRouter = () => VueRouter.createRouter({
  history: VueRouter.createWebHistory(window.__POWERED_BY_QIANKUN__ ? `/${name}` : '/'),
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}
export default router
