/**
 * 应用设置
 */

module.exports = {
    /**
     * 应用名称
     */
    name: "template",
    /**
     * 调用远程权限
     * 1. src/router/constantRoutes.js将失效,需在运营平台配置菜单权限
     * 2. 需在vue.config.js配置文件中，添加系统管理服务 "/admin" 的代理路径
     */
    remotePermissions: true,

    debug:{
        /**
         * 主应用端口
         */
        port:9999,
        /**
         * 入口
         */
        entry: "http://192.168.0.237:18080",
        /**
         * 显示菜单
         */
        menuVisible: true,
        /**
         * 外部连接
         */
        external: false
    }
}