import * as VueRouter from 'vue-router'
const constantRoutesConfig=require('./constantRoutes')
import {name,remotePermissions} from '@/settings'

export const constantRoutes = []

/**
 * 调试模式加载本地配置
 */
if (process.env.NODE_ENV === "development" && !remotePermissions) {
  constantRoutesConfig.forEach(item=>constantRoutes.push(item))
}


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
