/**
 * 路由配置
 */



module.exports=[
    {
        component: () => import('@/views/layout'),
        "name": "home",
        "path": "/home",
        "hidden": false,
        "meta": {
            "icon": "dingbudaohangicon-xitongpeizhi",
            "noCache": false,
            "title": "测试菜单A"
        },
        "children":[
            {
              "name": "about1-1",
              "path": "about1-1",
              "hidden": false,
              "meta": {
                  "noCache": false,
                  "title": "测试菜单A1-1"
              },
              "children":[
                {
                  component: () => import('@/views/sysIcons'),
                  "name": "about1-2",
                  "path": "about1-2",
                  "hidden": false,
                  "meta": {
                      "noCache": false,
                      "title": "测试菜单A1-2"
                  },
                },
                {
                  component: () => import('@/views/testt'),
                  "name": "about1-3",
                  "path": "about1-3",
                  "hidden": false,
                  "meta": {
                      "noCache": false,
                      "title": "测试菜单A1-3"
                  },
                }
            ]
            },
            {
              component: () => import('@/views/test'),
              "name": "about2-2",
              "path": "about2-2",
              "hidden": false,
              "meta": {
                  "noCache": false,
                  "title": "测试菜单A1-2"
              },
            }
        ]
    },
    {
        component: () => import('@/views/layout'),
        "name": "about-a",
        "path": "/about-a",
        "hidden": false,
        "meta": {
            "icon": "dingbudaohangicon-xitongpeizhi",
            "noCache": false,
            "title": "测试菜单B"
        },
        "children":[
            {
              component: () => import('@/views/test'),
              "name": "about-01",
              "path": "about-01",
              "hidden": false,
              "meta": {
                  "noCache": false,
                  "title": "测试菜单01"
              },
            },
            {
                component: () => import('@/views/test'),
                "name": "about-02",
                "path": "about-02",
                "hidden": false,
                "meta": {
                    "noCache": false,
                    "title": "测试菜单02"
                },
              }
        ]
    }
]