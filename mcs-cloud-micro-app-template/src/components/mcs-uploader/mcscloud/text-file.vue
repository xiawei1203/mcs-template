<template>
  <div>
    <ul >
        <li v-for="file in fileList" :key="file.id">
          <UploaderFile :file="file" >
            <template #default="props">
              <div style="margin: 4px 0;">
                <div class="text-files" >
                  <div style="display: flex;align-items: center;">
                    <svg t="1739973664689"  class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1517" width="12" height="12"><path d="M765.123596 1024H247.370787C166.831461 1024 97.797753 954.966292 97.797753 862.921348V149.573034C97.797753 69.033708 166.831461 0 247.370787 0h517.752809c80.539326 0 149.573034 69.033708 149.573033 149.573034v713.348314c11.505618 92.044944-57.52809 161.078652-149.573033 161.078652zM247.370787 46.022472C189.842697 46.022472 143.820225 92.044944 143.820225 149.573034v713.348314c0 57.52809 46.022472 103.550562 103.550562 103.550562h517.752809c57.52809 0 103.550562-46.022472 103.550561-103.550562V149.573034c0-57.52809-46.022472-103.550562-103.550561-103.550562H247.370787z" p-id="1518" fill="#707070"></path><path d="M512 322.157303H270.382022c-11.505618 0-23.011236-11.505618-23.011235-23.011236s11.505618-23.011236 23.011235-23.011236h241.617978c11.505618 0 23.011236 11.505618 23.011236 23.011236s-11.505618 23.011236-23.011236 23.011236zM742.11236 529.258427H270.382022c-11.505618 0-23.011236-11.505618-23.011235-23.011236s11.505618-23.011236 23.011235-23.011236h471.730338c11.505618 0 23.011236 11.505618 23.011236 23.011236s-11.505618 23.011236-23.011236 23.011236zM742.11236 747.865169H270.382022c-11.505618 0-23.011236-11.505618-23.011235-23.011236s11.505618-23.011236 23.011235-23.011236h471.730338c11.505618 0 23.011236 11.505618 23.011236 23.011236s-11.505618 23.011236-23.011236 23.011236z" p-id="1519" fill="#707070"></path></svg>
                    <div>
                      <span class="file-name">{{props.file.name}}</span>
                    </div>
                  </div>
                  <div style="display: flex;align-items: center;">
                    <el-icon class="icon-success" color="#67c23a" v-if="props.status==='success'"><CircleCheck /></el-icon>
                    <el-icon class="icon-waiting" @click="handleDelete(file)"><Close /></el-icon>
                  </div>
                </div>
                <div v-if="props.status==='waiting'">
                  <span style="position: absolute;right: 25px;top: -5px;font-size: 10px;">{{`${props.progress*100}%`}}</span>
                  <el-progress  :stroke-width="2" :text-inside="true"  :percentage="props.progress*100"></el-progress>
                </div>
              </div>
            </template>
          </UploaderFile>
        </li>
      </ul>
  </div>
</template>

<script>
  import UploaderFile from "../ui/file.vue";
  import { Plus, ZoomIn, Download, Delete,UploadFilled,CircleCheck,Close} from '@element-plus/icons-vue'
  import {  ElLoading,ElMessageBox} from "element-plus";
  const COMPONENT_NAME = 'text-files'

  export default {
    name: COMPONENT_NAME,
    inject: ['uploader'],
    components: {UploaderFile,ZoomIn, Download, Delete,CircleCheck,Close},
    props:{
      fileList:{
        type:Array,
        default:[]
      }
    },
    data(){
      return {
        showImageViewer:false,
        imageList:[]
      }
    },
    computed: {
      fileBaseUrl(){
        return this.uploader.fileBaseUrl
      }
    },
    watch:{

    },
    mounted(){
    },
    methods:{
      getImageUrl(file){
          return `${this.uploader.fileBaseUrl}${file.objectName}`
      },
      // 停止页面滚动
      stopRoll() {
        const m = (e) => { e.preventDefault() };
        document.body.style.overflow = 'hidden';
        document.addEventListener("touchmove", m, false); // 禁止页面滑动
      },
      // 开启页面滚动
      roll() {
        const m = (e) => { e.preventDefault() };
        document.body.style.overflow = 'auto';
        document.removeEventListener("touchmove", m, true);
      },
      handlePictureCardPreview(file){
        this.imageList=[]
        this.imageList.push(this.getImageUrl(file))
        this.showImageViewer=true
      },
      closeImgViewer(){
        this.showImageViewer=false
      },
      imgLoadingErr(err){
        console.error("获取文件失败 "+this.getImageUrl(err))
      },
      handleDelete(file){
          ElMessageBox.confirm(  '确定要删除吗？','提示', { type: 'warning' }).then(res=>{
            this.uploader.moveFileHandler(file.objectName)
            this.uploader.uploader.removeFile(file)
          })
        },
      downloadImage(file) {
        const loading = ElLoading.service({ fullscreen: true })
        fetch(this.getImageUrl(file)).then(async res => await res.blob()).then((blob) => {
          // 创建隐藏的可下载链接
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = URL.createObjectURL(blob);
          // 保存下来的文件名
          a.download = file.name;
          document.body.appendChild(a);
          loading.close()
          a.click();
          // 移除元素
          document.body.removeChild(a);
        }).catch(() => {
          this.$message.error(`下载失败`);
          loading.close()
        })
      }
    }
  }
</script>

<style scoped lang="scss">
  .uploader-files {
    position: relative;
  }
  .uploader-files > ul {
    list-style: none;
    margin: 0;
    padding: 0
  }

  .text-files{
    display: flex;
    justify-content: space-between;
    height: 22px;
    padding: 0 5px;
    border-radius: 4px;
    .icon-waiting{
        display: none;
        cursor: pointer;
      }
    .file-name{
      margin-left: 5px;
      text-overflow: ellipsis;
      overflow: hidden;
      text-align: center;
      white-space: nowrap;
    }
    &:hover {
      background-color: var(--el-fill-color-light);
      .icon-success {
        display: none;
      }
      .icon-waiting {
        display: block;
      }
      .file-name {
        font-weight: 500;
        color: #397EC8;
      }
    }
  }
</style>
