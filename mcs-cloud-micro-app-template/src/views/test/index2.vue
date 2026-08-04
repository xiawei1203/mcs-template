<template>
  <div class="about">
    <h1>测试页面</h1>
    <h3> userinfo:</h3>
      {{$store.getters.userinfo}}

    <h3>token:</h3> 
    {{$store.getters.token}}
    <h3>userpoolid:</h3> 
    {{$store.getters.userpoolid}}
    <h3>data:</h3> 
    {{$store.getters.data}}
    <div>
      <h3>当前子应用路由:</h3>
      <h1>{{$route.path}}</h1>
    </div>
    <el-button @click="open">默认按钮</el-button>
    <div>
      <h2>文件分片上传:</h2>
      <mcs-uploader-v2 @fileSuccess="fileSuccess" @fileError="fileError" :action="action" groupId="admin" :auth="`Bearer ${$store.getters.token}`"></mcs-uploader-v2>
      <h2>登出:</h2>
      <el-button @click="logout">登出</el-button>
    </div>
    

  </div>
</template>

<script>


import store from '@/store';

export default {
  data(){
    return {
      visible: false
    }
  },
  computed:{
    action(){
      return process.env.VUE_APP_BASE_API
    }
  },
  methods:{
    fileSuccess(filename){
        this.$message.info("上传成功 "+JSON.stringify(filename))
    },
    fileError(msg){
        console.error(msg)
    },
    logout(){
      //confirm
      
      this.$confirm('确定登出吗', '标题名称', {
          confirmButtonText: '确定',
          callback: action => {
            this.$setGlobalState({logout:true})
          }
          
        });
    },
    open() {
        this.$alert('这是一段内容', '标题名称', {
          confirmButtonText: '确定',
          callback: action => {
            this.$message({
              type: 'info',
              message: `action: ${ action }`
            });
          }
          
        });
      }
  }
}
</script>

<style>
.about{
  padding: 50px;
}
</style>
