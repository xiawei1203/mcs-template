<template>
  <div class="uploader">
    <uploader-unsupport></uploader-unsupport>
    <template v-if="fileList.length < limit">
      <uploader-btn v-if="!drop" :attrs="attrs">
        <slot :files="fileList"><div style="padding: 4px 8px; border-radius: 2px;border: 1px solid #ccc;">选择文件</div></slot>
      </uploader-btn>
      <uploader-drop v-if="drop">
        <p>{{contentText}}</p>
        <uploader-btn :attrs="attrs">
          <slot ><span>选择文件</span></slot>
        </uploader-btn>
        <!-- <uploader-btn :directory="true">select folder</uploader-btn> -->
      </uploader-drop>
    </template>
    <slot name="uploaderList" v-if="showFileList && listType==='picture'" :fileList="fileList"></slot>
    <!-- <uploader-list v-if="showFileList && listType==='picture'">
      <slot name="uploaderList" :fileList="fileList"></slot>
    </uploader-list> -->
    <uploader-list v-if="showFileList && listType==='text'">
      <slot name="uploaderList" :fileList="fileList"></slot>
    </uploader-list>
  </div>
</template>

<script>
import Uploader from './js/uploader'
import { kebabCase } from './common/utils'
import UploaderBtn from './ui/btn.vue'
import UploaderDrop from './ui/drop.vue'
import UploaderUnsupport from './ui/unsupport.vue'
import UploaderList from './ui/list.vue'
import UploaderFiles from './ui/files.vue'
import UploaderFile from './ui/file.vue'
import Ajax from "./ajax";

const COMPONENT_NAME = 'uploader'
const FILE_ADDED_EVENT = 'fileAdded'
const FILES_ADDED_EVENT = 'filesAdded'
const UPLOAD_START_EVENT = 'uploadStart'

export default {
  name: "McsUpload",
  provide() {
    return {
      uploader: this
    }
  },
  components: {
    UploaderBtn,
    UploaderDrop,
    UploaderUnsupport,
    UploaderList,
    UploaderFiles,
    UploaderFile,
    Uploader,
  },
  props: {
    contentText: {
      type: String,
      default: '将文件拖到此处，或'
    },
    action: {
      type: String
    },
    groupId: {
      type: String
    },
    headers:{
      type: Object
    },
    drop:{
      type: Boolean,
      default: false
    },
    listType: {
			type: String,//picture //text
			default: "text"
		},
    showFileList:{
      type: Boolean,
      default: false
    },
    autoStart: {
      type: Boolean,
      default: true
    },
    maxFileSize:{
      type: Number,
      default: 30*1024*1024
    },
    multiple:{
      type: Boolean,
      default: false
    },
    fileBaseUrl:{
      type: String
    },
    limit: {
			type: Number,
			default: 1,
		},
    attrs:{
      type: Object,
      default(){
        return {
          accept: "image/*"
        }
      }
    }
  },
  data() {
    return {
      options: {
        target: (file, chunkFile, mode) => {
          const key = "chunk_" + chunkFile.offset;
          var url = file.chunkUrlData[key];
          return this.checkAction() + "/" + url
        },
        testChunks: false,
        chunkSize: 5 * 1024 * 1024,
        forceChunkSize: true,
        query: function (file, chunkFile, mode) {
          const data = { partNumber: chunkFile.offset + 1 };
          return data;
        },
        checkChunkUploadedByResponse:null,
        uploadMethod: "PUT",
        method: "octet",
        processParams: function (params) {
          return params;
        },
        headers: this.headers,
      },
      fileList: []
    };
  },
  watch: {
  },
  computed: {
    pathsUrl() {
      return this.checkAction() + "/" + this.groupId + "/oss/multipart-paths";
    },                   
    completeUrl() {
      return this.checkAction() + "/" + this.groupId + "/oss/multipart-complete";
    }
  },
  methods: {
    checkAction(){
      if (!this.action || this.action==='/') {
        let url= window.location.host + process.env.VUE_APP_BASE_API
        if (url.endsWith("/")) {
          url=url.substring(0,url.length-1)
        }
        return `${window.location.protocol}//${url.replaceAll("//","/")}`
      }
      return this.action
    },
    fileAdded(file) {
      const duplicateFiles=this.uploader.files.filter(item=>item.name===file.name)
      if ( file.size>this.maxFileSize) {
         this.$emit("fileError","超出最大文件大小 "+this.maxFileSize)
         return false;
      }else if ( Number(this.limit)>0 && this.uploader.files.length>= Number(this.limit)) {
        this.$emit("fileError","超出文件最大数量")
        return false;
      }else if(duplicateFiles.length){
        this.$emit("fileError","文件重复")
        return false;
      }

      if (!file.objectName && file.file.objectName) {
         file.objectName=file.file.objectName
      }
      return this.getChunkUploadUrl(file);
    },
    filesAdded(files, fileList) {
      if (files.ignored || fileList.ignored) {
        // is ignored, filter it
        return false
      }
      return true
    },
    async getChunkUploadUrl(file) {
      const fileName = file.name;
      if (!file.chunks.length) {
          return
      }
      const chunkSize = file.chunks.length;
      try {
        const result= await  Ajax.get(this.pathsUrl,  { fileName: fileName, chunkSize: chunkSize, partCount: chunkSize },{...this.headers,Accept: "application/json"})
        file.chunkUrlData = result.data;
        file.objectName=result.data.objectName
        
        if (this.autoStart) {
          this.uploader.upload()
        }
        return true
      } catch (error) {
        console.error(error)
        return false
      }

    },
    moveFileHandler(objectName){
      const url= this.checkAction() + "/" + this.groupId + `/oss/del`
      Ajax.del(url,{objectName2:objectName},{...this.headers,"Content-type": "application/json;charset=UTF-8"})
    },
    /**
     * 上传完成
     */
    complete() {
      
    },
    /**
     * 根下的单个文件（文件夹）上传完成
     */
     async fileComplete(rootFile,file) {

    },

    async beforeFileSuccess(rootFile, file, message){
      const fileName = file.chunkUrlData.objectName; // 文件名
      const uploadId = file.chunkUrlData.uploadId; // uploadId
      const result= await Ajax.post(this.completeUrl,{ objectName: fileName, uploadId: uploadId },{...this.headers,"Content-type": "application/json;charset=UTF-8"})
      const data = JSON.parse(JSON.stringify({
          fileName: arguments[0].name,
          filePath: result.data,
          fileSize: arguments[0].size,
          fileType: arguments[0].fileType,
      }))
      file.completeInfo=data
    },
    /**
     * 单个文件上传成功
     */
    fileSuccess(rootFile, file, message) {
      if (file) {
        this.$emit("fileSuccess",file.completeInfo)
      }

    },
    fileRemoved(file) {
      const index= this.fileList.findIndex(item=>item.id==file.id)
      if (index>-1) {
        this.fileList.splice(index,1)
      }
      this.$emit("fileRemoved",file)
    },
    filesSubmitted(files, fileList) {
      if (files && files.length) {
        files.forEach(item => {
          this.fileList.push(item)
        });
      }
    },
    fileError(rootFile, file, message) {
      this.$emit("fileError",message)
    }
  },
  created() {
    this.options.initialPaused = !this.autoStart
    const uploader = new Uploader(this.options)
    this.uploader = uploader
    this.uploader.fileStatusText = this.fileStatusText
    this.uploader.registerBeforeFileSuccessEvent( this.beforeFileSuccess)
    uploader.on(FILE_ADDED_EVENT, this.fileAdded)
    uploader.on(FILES_ADDED_EVENT, this.filesAdded)
    uploader.on('fileSuccess', this.fileSuccess)
    uploader.on('fileComplete', this.fileComplete)
    // uploader.on('beforeFileSuccess', this.beforeFileSuccess)
    uploader.on('fileError', this.fileError)
    uploader.on('fileRemoved', this.fileRemoved)
    uploader.on('filesSubmitted', this.filesSubmitted)
  },
  destroyed() {
    const uploader = this.uploader
    uploader.off(FILE_ADDED_EVENT, this.fileAdded)
    uploader.off(FILES_ADDED_EVENT, this.filesAdded)
    // uploader.on('beforeFileSuccess', this.beforeFileSuccess)
    uploader.off('fileSuccess', this.fileSuccess)
    uploader.off('fileComplete', this.fileComplete)
    uploader.off('fileError', this.fileError)
    uploader.off('fileRemoved', this.fileRemoved)
    uploader.off('filesSubmitted', this.filesSubmitted)
    this.uploader = null
  },
};
</script>

<style scoped>
.uploader{
  font-size: 14px;
}
</style>
