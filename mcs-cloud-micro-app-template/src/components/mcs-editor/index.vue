<template>
    <div style="width: 100%;">
      <Toolbar v-if="!disabled"
        class="toolArea"
        :editor="editor"
        :defaultConfig="toolbarConfig"
        mode="default"
        ref="toolbar"
      />
      <Editor class="editorArea"
        ref="editors"
        :style="{height: editorHeight}"
        :class="{readOnly: disabled }"
        v-model="html"
        :defaultConfig="editorConfig"
        mode="default"
        @onCreated="onCreated"
        @onChange="onChange"
      />
      <Upload ref="uploadImgRef"   :headers="headers" :groupId="groupId" :showFileList="false" @fileSuccess="fileSuccess" @fileError="fileError"  style="display:none;"></Upload>
      <Upload ref="uploadVideoRef"  :headers="headers"  :attrs="{accept: 'video/*'}" :groupId="groupId"  :showFileList="false" @fileSuccess="fileSuccess2" @fileError="fileError" style="display:none;" ></Upload>
    </div>
  </template>

  <script>
  import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
  import Upload from '@/components/mcs-uploader/index.vue';
  export default {
    name: "editor",
    components: { Editor, Toolbar, Upload },
    props: {
      modelValue: {
        type: String,
        default: "",
      },
      groupId:{
        type: String,
        default: "admin",
      },
      disabled: {// 是否启用
        type: Boolean,
        default: false,
      },
      placeholder: {
        type: String,
        default: "请输入...",
      },
      editorHeight: { //编辑区域高度
        type: String,
        default: "480px",
      },
    },
    data() {
      return {
        action: process.env.VUE_APP_BASE_API,
        editor: null,
        html: "",
        headers:{
          "Authorization": "Bearer "+this.$store.getters.token,
				  'X-Mcs-User-Pool': this.$store.getters.userpoolid
        },
        toolbarConfig: {
          excludeKeys: [
            "todo"//待办
          ]
        },
        editorConfig: {
          placeholder: "请输入...",
          maxLength: 6*10000,
          MENU_CONF: {
            uploadImage: {
              customBrowseAndUpload:()=> {
                this.$refs.uploadImgRef.uploader.click()
              },
            },
            uploadVideo: {
              customBrowseAndUpload:()=> {
                this.$refs.uploadVideoRef.uploader.click()
              },
            }
          },
        },
      };
    },
  
    watch: {
      modelValue: {
        handler(newData) {
          this.html = newData;
        },
        immediate: true,
        deep: true
      },
      disabled: {
        handler(newV) {
          if (newV) {
            this.$nextTick(() =>{
              this.editor && this.editor.disable(); // 只读模式
            })
          }
        },
        immediate:true
      },
    },
    created() {
      this.editorConfig.placeholder = this.placeholder;
    },
    methods: {
      setContent(html) {
        this.editor.setHtml(html);
      },
      onCreated(editor) {
        this.editor = Object.seal(editor); // 一定要用 Object.seal() ，否则会报错
        // this.editor.setHtml(this.html);
        // this.editor.getConfig().toolbarKeys = ["uploadVideo", "insertVideo", "viewImageLink", "viewLink"]
      },
      onChange(editor) {
        if(this.html ==='<p><br></p>'){this.html = ''}
        this.$emit("update:modelValue", this.html);
        this.$emit("change", this.html);
      },
      // 上传成功回调
      fileSuccess(msg) {
        let html = this.editor.getHtml();
        let img = process.env.VUE_APP_FILE_BASE_API + msg.filePath;
        html += `<p><img src='${img}' data-href="d" style=""></p>`;
        this.editor.setHtml(html);
      },
      fileSuccess2(filename) {
        let html = this.editor.getHtml();
        let video = process.env.VUE_APP_FILE_BASE_API + filename.filePath;
        html += `<p><video src='${video}' data-href="d" style=""></video></p>`;
        this.editor.setHtml(html);
      },
      fileError(msg) {
        console.error(msg)
      },
    },
    beforeDestroy() {
      const editor = this.editor;
      if (!editor) return;
      editor.destroy(); // 组件销毁时，及时销毁 editor
      editor = undefined
    },
  };
  </script>

  <style lang="scss" scoped>
  @import "@wangeditor/editor/dist/css/style.css";
  .toolArea {
    border: 1px solid #e9eaec;
    margin-bottom: 15px;
  }
  .editorArea {
    border: 1px solid #e9eaec;
    width: 100%;
    min-height: 480px;
  }
  .editorArea.readOnly{
    background-color: var(--el-disabled-bg-color);
    box-shadow: 0 0 0 1px var(--el-disabled-border-color) inset;
    & ::v-deep .w-e-scroll{
      overflow-y: inherit !important;
    }
    :deep(.w-e-text-container){
      background-color: transparent;
    }
  }
  .w-e-full-screen-container{
    z-index: 10;
    background-color: #fff;
  }
  
  </style>