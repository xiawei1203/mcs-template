const { defineConfig } = require('@vue/cli-service')
const { name } = require('./src/settings'); 
const path= require('path')

function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = defineConfig({
  lintOnSave: false, 
  transpileDependencies: true,
  outputDir: name + "-build",
  publicPath: process.env.NODE_ENV === "development" ? '/' : ("/" + name + "-build/"),
  devServer:{
    port:18080,
    client:{
      overlay:false
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    proxy:{
      "/admin":{
        target:"http://192.168.0.198:31010", //系统设置代理
        changeOrigin:true,
        // pathRewrite: { '/admin': '/admin-czl' }
      },
      "/admin-czl":{
        target:"http://192.168.0.198:31010", //系统设置代理
        changeOrigin:true,
      },
      "/static-resources-img":{
        target:"http://192.168.0.198:9999", //静态图片代理
        changeOrigin:true,
      },
      "/api":{
        target:"http://192.168.0.198:31010", //其他应用代理
        changeOrigin:true,
        pathRewrite: { '^/api': '' }
      },
      "/test":{
        target:"http://192.168.0.198:31010", //其他应用代理
        changeOrigin:true,
      },
      "/mcs-space":{
        target:"http://192.168.0.198:31010", //其他应用代理
        changeOrigin:true,
      },
    }
  },
  // 自定义webpack配置
  configureWebpack: {
    resolve: {
      alias: {
        '@': resolve('src'),
      },
      fallback: {
        path: require.resolve('path-browserify'),
        stream: require.resolve('stream-browserify')
      }
    },
    output: {
      // 把子应用打包成 umd 库格式
      library: `${name}-[name]`,
      libraryTarget: 'umd',
      chunkLoadingGlobal: `webpackJsonp_${name}`,
    },
  },
  chainWebpack(config) {
    // set svg-sprite-loader
    config.module
        .rule('svg')
        .exclude.add(resolve('src/icons'))
        .end()
    config.module
        .rule('icons')
        .test(/\.svg$/)
        .include.add(resolve('src/icons'))
        .end()
        .use('svg-sprite-loader')
        .loader('svg-sprite-loader')
        .options({
            symbolId: 'icon-[name]'
        })
        .end()

    config
        .when(process.env.NODE_ENV !== 'development',
            config => {
                config
                    .optimization.splitChunks({
                        chunks: 'all',
                        cacheGroups: {
                            libs: {
                                name: 'chunk-libs',
                                test: /[\\/]node_modules[\\/]/,
                                priority: 10,
                                chunks: 'initial' // only package third parties that are initially dependent
                            },
                            elementUI: {
                                name: 'chunk-elementUI', // split elementUI into a single package
                                priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
                                test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
                            },
                            commons: {
                                name: 'chunk-commons',
                                test: resolve('src/components'), // can customize your rules
                                minChunks: 3, //  minimum common number
                                priority: 5,
                                reuseExistingChunk: true
                            }
                        }
                    })
                    // https:// webpack.js.org/configuration/optimization/#optimizationruntimechunk
                config.optimization.runtimeChunk('single')
            }
        )
}
})
