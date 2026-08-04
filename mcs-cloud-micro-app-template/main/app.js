const express = require('express')
const history = require('connect-history-api-fallback')
const path=require('path')
const axios =require('axios')
const chalk = require('chalk');
const jwtDecode = require("jwt-decode")
const settings=require('../src/settings')
const vueConfig=require('../vue.config.js')
const {createProxyMiddleware} = require("http-proxy-middleware");

const app = express()
const PORT =  settings.debug.port
const name = settings.name

console.log(chalk.white(JSON.stringify(settings)))

console.log(chalk.green("1. 查找路由配置..."))

const routerPath= path.resolve(__dirname,"../src/router/constantRoutes.js")

const router=require(routerPath)

app.use(history())
app.use(express.static('main/www'))

/**
 * 是否有代理路径
 * @param {String} path 
 * @returns 
 */
function isProxy(path){
    //"/admin/v1/platformPermission/getPlatformByUser"
    let prefix= path.split("/").filter(item=>item)[0]
    prefix=`/${prefix}`
    if (vueConfig.devServer && vueConfig.devServer.proxy) {
        for (const item in vueConfig.devServer.proxy){
            if (item.indexOf(prefix)>-1) {
                return item
            }
        }
    }
    return null
}

function getRequstUrl(proxyKey,path){
    const admin= vueConfig.devServer.proxy[proxyKey]
    if (admin) {
       let pathRewrite=path
       if (admin.pathRewrite) {
            for (const item in admin.pathRewrite){
                pathRewrite= pathRewrite.replace(new RegExp(item),admin.pathRewrite[item])
            }
            return admin.target+ pathRewrite
       }
    }
    return admin.target+ path
}

 function request(req,res,path){
    let authorization = req.headers["authorization"]
    let userpoolid = req.headers["x-mcs-user-pool"]
    const proxy= isProxy(path)
    if (proxy) {
       const url= getRequstUrl(proxy,path)
       return axios.get(url,{headers:{'Authorization': authorization,"X-Mcs-User-Pool":userpoolid}})
    }else{
        console.log(chalk.red("error:  远程权限开启： 需在vue.config.js配置文件中，添加系统管理服务 ‘/admin’ 的代理路径"))
    }
    return Promise.reject()
}

app.get("/api/admin/v1/platformPermission/getPlatformByUser",async (req,res)=>{
    if (settings.remotePermissions) {
        const {data}= await request(req,res,`/admin/v1/platformPermission/getPlatformByUser`)
        if (data && data.status==200) {
            if (data.data instanceof Array) {
                const remote= data.data.filter(item=>item.code==settings.name)[0]
                if (remote) {
                    remote.name=`${remote.name}(调试)`
                    remote.entry=settings.debug.entry
                }
            }
            res.send(data)
        }else{
            console.log(chalk.red("请求: "+url+"错误"))
        }
        return
    }
    res.send({status:200, msg:'模拟接口',data: 
    [{
        name: "本地调试模式",
        code: settings.name,
        icon: "debug",
        entry: settings.debug.entry,
        menuVisible: settings.debug.menuVisible,
        external: settings.debug.external
    }]})
})



app.get("/api/admin/v1/menuPermission/code/getRouters",async (req,res)=>{
    // const jwt= jwtDecode(authorization.replace("Bearer ",""))
     if (settings.remotePermissions) {
        const {data}= await  request(req,res,`/admin/v1/menuPermission/code/getRouters?platformCode=${req.query.platformCode}`)
        if (data && data.status==200) {
            res.send(data)
        }else {
             console.log(chalk.red("请求: "+url+"错误"))
        }
        return
     }
     res.send({ status:200, msg:"模拟接口",data: router})
})

app.get("/api/admin/v1/user/findOne/:id",async (req,res)=>{
    // const jwt= jwtDecode(authorization.replace("Bearer ",""))
     if (settings.remotePermissions) {
        const {data}= await request(req,res,`/admin/v1/user/findOne/${req.params.id}`)
        if (data && data.status==200) {
            res.send(data)
        }else {
             console.log(chalk.red("请求: "+url+"错误"))
        }
        return
     }
     res.send({ status:200, msg:"模拟接口",data: router})
})

///api/admin/v1/sysHommization/appId/583e2916306146c38fbe3acd74273da2
app.get("/api/admin/v1/sysHommization/appId/*",(req,res)=>{
    res.send({ status:200, msg:"模拟接口",data: {
        "floor": "微晶石调试",
        "platformName": "调试应用",
        "platformNameSwitch": 1,
        "layoutStyle": "styleC",
        "themeColor": "#FF8540",
        "watermarkSwitch": true,
        "menuIdList": null,
    }})
})



console.info(chalk.green("2.************主应用代理**************"))

if (vueConfig.devServer && vueConfig.devServer.proxy) {
    for (const item in vueConfig.devServer.proxy) {
        const arg= vueConfig.devServer.proxy[item]
        console.log(chalk.white(`启用代理 ${item}, target: ${arg.target} `))
        app.use(`${item}`,createProxyMiddleware(arg))
        
    }
}


app.listen(PORT, () => {
    console.log(chalk.green(`3.******主应用启动完成，端口 [${PORT}]******`))
})