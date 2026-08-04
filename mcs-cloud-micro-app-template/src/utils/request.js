import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import store from '@/store'

// create an axios instance
const service = axios.create({
    baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
    // withCredentia//ls: true, // send cookies when cross-domain requests
    timeout: 120000 // request timeout
})

// request interceptor
service.interceptors.request.use(
    config => {
        // do something before request is sent

            //添加用户池
        config.headers["X-MCS-USER-POOL"] = store.getters.userpoolid
            // do something before request is sent
        if (store.getters.token) {
            config.headers['Authorization'] = "Bearer " + store.getters.token
        }
        return config
    },
    error => {
        // do something with request error
        console.log(error) // for debug
        return Promise.reject(error)
    }
)

// response interceptor
service.interceptors.response.use(
    /**
     * If you want to get http information such as headers or status
     * Please return  response => response
     */

    /**
     * Determine the request status by custom code
     * Here is just an example
     * You can also judge the status by HTTP Status Code
     */
    response => {
        const res = response.data
        // if the custom code is not 20000, it is judged as an error.
        if (res.status === 10004 || res.status === 10003 || res.status == 401) {
            // to re-login
            ElMessageBox.confirm('页面过期，您可以取消停留在此页面或再次登录', '确认登出', {
                confirmButtonText: '重新登录',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                store.dispatch('user/resetToken').then(() => {
                    location.reload()
                })
            })
        } else if (res.status === 403) {
            ElMessage({
                message: res.msg || '操作失败',
                type: 'error',
                duration: 3 * 1000
            })
            return Promise.reject(new Error(res.msg || '操作失败'))
        } else if (res.status == 500 || res.status == 502 || res.status == 503 || res.status == 504 || res.status == 400 || res.status == 404 || res.status == 405 || res.status == 408 || res.status == 415) {
            ElMessage({
                message: res.msg || '操作失败',
                type: 'error',
                duration: 3 * 1000
            })
            // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;

            return Promise.reject(new Error(res.msg || '操作失败'))
        } else {
            return res
        }
    },
    error => {
        console.log('err' + error) // for debug
        let { message } = error;
        if (message == "Network Error") {
            message = "网络连接异常";
        } else if (message.includes("timeout")) {
            message = "系统接口请求超时";
        } else if (message.includes("Request failed with status code")) {
            message = "系统接口" + message.substr(message.length - 3) + "异常";
        }
        ElMessage({
            message: message,
            type: 'error',
            duration: 3 * 1000
        })
        return Promise.reject(error)
    }
)

export default service