<template>
  <div class="uploader">
      <uploader-unsupport></uploader-unsupport>
      <uploader-btn :id="id" v-if="!drop" :attrs="attrs">
        <slot><div style="padding: 4px 8px; border-radius: 2px;border: 1px solid  #ccc;">选择文件</div></slot>
      </uploader-btn>
      <uploader-drop v-if="drop">
        <img :src="require('./ui/upload.png')" alt="">
        <p>将文件拖到此处，或<uploader-btn :attrs="attrs" >点击上传</uploader-btn></p>
        <slot></slot>
        <!-- <uploader-btn :directory="true">select folder</uploader-btn> -->
      </uploader-drop>
      <uploader-list v-if="showFileList"></uploader-list>
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
    id: {
      type: String,
      // default: "http://192.168.0.74:31010"
      default: ""
    },
    action: {
      type: String,
      // default: "http://192.168.0.74:31010"
      default: ""
    },
    groupId: {
      type: String
    },
    auth: {
      type: String
    },
    drop:{
      type: Boolean,
      default: false
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
      default: 100*1024*1024
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
          let url = file.chunkUrlData[key];
          return this.action + "/" + url;
        },
        testChunks: false,
        chunkSize: 100 * 1024 * 1024,
        forceChunkSize: true,
        query: function (file, chunkFile, mode) {
          const data = { partNumber: chunkFile.offset + 1 };
          return data;
        },
        uploadMethod: "PUT",
        method: "octet",
        singleFile: true,
        processParams: function (params) {
          return {};
        },
        headers: {
          Authorization: this.auth,
        },
      },
      fileStatusText: {
        success: "成功了",
        error: "出错了",
        uploading: "上传中",
        paused: "暂停中",
        waiting: "等待中",
      },
      started: false,
      files: [],
      fileList: [],
      progress: 0,
      status: "初始状态"
    };
  },
  mounted() {
    
  },
  watch: {},
  computed: {
    pathsUrl() {
      return this.action + "/" + this.groupId + "/oss/multipart-paths";
    },
    completeUrl() {
      return this.action + "/" + this.groupId + "/oss/multipart-complete";
    },
  },
  methods: {
    fileAdded(file) {
      if ( file.size>this.maxFileSize) {
        this.$emit("fileError", "超出最大文件大小"+this.maxFileSize)
        return false;
      }
      this.getChunkUploadUrl(file);
    },
    filesAdded(files, fileList) {
      if (files.ignored || fileList.ignored) {
        // is ignored, filter it
        return false
      }
    },
    // 文件切块
    getChunkUploadUrl(file) {
      const fileName = file.name;
      const chunkSize = file.chunks.length;
      Ajax.get(this.pathsUrl, { fileName: fileName, chunkSize: chunkSize, partCount: chunkSize, }, { Authorization: this.auth, Accept: "application/json" })
        .then(s => {
          file.chunkUrlData = s.data;
          if (this.autoStart) {
            this.uploader.upload()
          }
        })
    },

    /**
     * 上传完成
     */
    complete() {
      // console.log("complete", arguments);
    },
    /**
     * 根下的单个文件（文件夹）上传完成
     */
    fileComplete(rootFile) {
      // console.log("根下的单个文件（文件夹）上传完成", arguments);
    },
    /**
     * 单个文件上传成功
     */
    fileSuccess(rootFile, file, message) {
      const fileName = file.chunkUrlData.objectName; // 文件名
      const uploadId = file.chunkUrlData.uploadId; // uploadId
      Ajax.post(this.completeUrl,{ objectName: fileName, uploadId: uploadId },
        {
          "Content-type": "application/json;charset=UTF-8",
          "Authorization": this.auth,
        }
      ).then(s=>{
          this.$emit("fileSuccess", { name: file.name, path: s.data })
      });
      
    },
    fileRemoved(file) {
      this.files = this.uploader.files
      this.fileList = this.uploader.fileList
    },
    filesSubmitted(files, fileList) {
      this.files = this.uploader.files
      this.fileList = this.uploader.fileList

    },
    fileError(rootFile, file, message) {
      this.$emit("fileError",message)
    }
  },
  created() {
    this.options.initialPaused = !this.autoStart
    this.options.chunkSize = this.maxFileSize;
    const uploader = new Uploader(this.options);
    this.uploader = uploader;
    this.uploader.fileStatusText = this.fileStatusText
    uploader.on(FILE_ADDED_EVENT, this.fileAdded)
    //uploader.on(FILES_ADDED_EVENT, this.filesAdded)
    uploader.on('fileSuccess', this.fileSuccess)
    uploader.on('fileComplete', this.fileComplete)
    uploader.on('fileError', this.fileError)
    uploader.on('fileRemoved', this.fileRemoved)
    uploader.on('filesSubmitted', this.filesSubmitted)
  },
  destroyed() {
    const uploader = this.uploader
    uploader.off(FILE_ADDED_EVENT, this.fileAdded)
    uploader.off(FILES_ADDED_EVENT, this.filesAdded)
    uploader.off('fileSuccess', this.fileSuccess)
    uploader.off('fileComplete', this.fileComplete)
    uploader.off('fileError', this.fileError)
    uploader.off('fileRemoved', this.fileRemoved)
    uploader.off('filesSubmitted', this.filesSubmitted)
    this.uploader = null
  },
};
</script>

<style lang="scss" scoped>
.uploader{
  font-size: 14px;
  .uploader-drop{
    padding: 16px 0;
    border: none;
    img{
      display: block;
      margin: 0 auto;
    }
    p{
      display: block;
      text-align: center;
      color: #666;
    }
  }
}
</style>
