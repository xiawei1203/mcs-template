if (window.__POWERED_BY_QIANKUN__) {
    __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}

import router ,{ constantRoutes } from "@/router"
import vuex from "@/store"
const { remotePermissions } = require('./settings'); 

const globalStateStore={
    state: {
        data: {}
    },
    mutations: {
        SET_DATA: (state, data) => {
            state.data = data
        }
    },
    getters:{
        data(state){
            return state.data
        },
        userinfo(state){
            return state.data.userinfo
        },
        token(state){
            return state.data.token
        },
        theme(state){
            return state.data.theme
        },
        userpoolid(state){
            return state.data.userpoolid
        }
    },
    actions: {
        setTest: ({commit}, val) => {
          
        }
    }
}



/**
 * 微应用挂载
 * @param {any} props 属性
 */
export function microMount(props){
    const {routes,onGlobalStateChange,setGlobalState} = props
    
    vuex.registerModule("global",globalStateStore)
    /**
     * 添加路由
     */
    if (routes) {
        if (remotePermissions || process.env.NODE_ENV !== "development") 
        {
            addToRouter(routes)
        }
    }
    /**
     * 订阅全局状态
     */
    if (onGlobalStateChange) {
        onGlobalStateChange((value, prev) => { vuex.commit("SET_DATA",value)},true)
    }
    
}

/**
 * 微应用销毁
 */
export function microUnmount(){
    vuex.unregisterModule("global")
}

/**
 * 添加到路由
 * @param {any} routes 
 */
function addToRouter(routestmp){
    const routes=JSON.parse(JSON.stringify(routestmp))
    const accessedRoutes= filterAsyncRouter(routes)
    //const joinRoutes= constantRoutes.concat([])
    accessedRoutes.forEach(r=>router.addRoute(r))
    
}


/**
 * 路由转换
 * @param {RouteConfig[] } asyncRouterMap 路由
 * @returns 
 */
function filterAsyncRouter(asyncRouterMap) {
    return asyncRouterMap.filter(route => {
        if (route.component) {
            if (route.component === 'Layout') {
                delete route.component
            }else{
                route.component= loadView(route.component)
            }
        }
        if (route.children == null) {
            delete route.children;
        }
        if (route.children != null && route.children && route.children.length) {
            route.children = filterAsyncRouter(route.children)
        }
        return true
    })
}

/**
 * 导入视图
 * @param {String} view 组件路径
 * @returns 
 */
const loadView = (view) => {
    return () => import(`@/views/${view}`)
   // return defineAsyncComponent(() => import(`@/views/${view}`))
}