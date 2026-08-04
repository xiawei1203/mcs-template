/**
 * 本地调试菜单
 *
 * 仅在 development 且 settings.remotePermissions 为 false 时生效，
 * 生产或远程权限模式下由主应用 / 运营平台下发菜单，本文件失效。
 * 这里的 path 必须与各模块 routePaths.js 保持一致，方便切换到远程模式时无缝对齐。
 */

module.exports=[
    {
        component: () => import('@/views/layout'),
        "name": "demo",
        "path": "/demo",
        "hidden": false,
        "meta": {
            "icon": "dingbudaohangicon-xitongpeizhi",
            "noCache": false,
            "title": "示例模块"
        },
        "children":[
            {
              component: () => import('@/views/demo'),
              "name": "demoList",
              "path": "list",
              "hidden": false,
              "meta": {
                  "noCache": false,
                  "title": "示例列表"
              },
            }
        ]
    },
    {
        component: () => import('@/views/layout'),
        "name": "system",
        "path": "/system",
        "hidden": false,
        "meta": {
            "icon": "dingbudaohangicon-xitongpeizhi",
            "noCache": false,
            "title": "系统工具"
        },
        "children":[
            {
              component: () => import('@/views/sysIcons'),
              "name": "sysIcons",
              "path": "icons",
              "hidden": false,
              "meta": {
                  "noCache": false,
                  "title": "图标库"
              },
            }
        ]
    }
]
