<template>
  <div class="file-img" v-for="file in fileList" :key="file.id" style="display:inline-block">
    <UploaderFile :file="file" >
      <template #default="props">
        <div class="img_item">
        <!-- <div class="filename">{{ props.file.name}}</div> -->
        <div class="img" style="width: 100%;height: 100%;">
          <el-image v-if="props.status==='success'" fit="cover"
            style="width: 100%;height: 100%;"
          :src="getImageUrl(file)"
          :lazy="true" @error="imgLoadingErr(file)">
            <template #error>
              <div class="image-slot"> 加载失败 </div>
            </template>
          </el-image>
          <el-progress v-if="props.status==='waiting'" :width="100" color="#d7d8db"  type="circle" :percentage="props.progress*100" />
        </div>
        <div class="marks" >
            <span  v-if="props.status==='success'" class="el-upload-list__item-preview">
              <el-icon @click="handlePictureCardPreview(file)">
                <ZoomIn />
              </el-icon>
            </span>
            <span v-if="props.status==='success'" @click="downloadImage(file)">
              <el-icon>
                <Download />
              </el-icon>
            </span>
            <span @click="handleDelete(file)">
              <el-icon>
                <Delete />
              </el-icon>
            </span>
          <!-- </span> -->
        </div>
      </div>
      </template>
    </UploaderFile>
  </div>
  <el-image-viewer v-if="showImageViewer" :url-list="imageList" @close="closeImgViewer"></el-image-viewer>
</template>

<script>
  import UploaderFile from "../ui/file.vue";
  import { Plus, ZoomIn, Download, Delete,UploadFilled,Picture as IconPicture} from '@element-plus/icons-vue'
  import {  ElLoading} from "element-plus";
  const COMPONENT_NAME = 'picture-files'

  export default {
    name: COMPONENT_NAME,
    inject: ['uploader'],
    components: {UploaderFile,ZoomIn, Download, Delete,IconPicture},
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
        // file.cancel()
        this.uploader.moveFileHandler(file.objectName)
        this.uploader.uploader.removeFile(file)
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
.image-slot {
  width: 100px;
  height: 100px;
  text-align: center;
  align-content: center;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.file-img{
  display: inline-block;
}
    
.img_item {
	position: relative;
	width: 100px;
	height: 100px;
	margin-right: 8px;
	margin-bottom: 8px;
	border-radius: 4px;
	border: 1px solid var(--el-border-color);
  overflow: hidden;
  /* display: flex;
  justify-content: center;
    align-items: center; */
	img {
		border-radius: 4px;
	}
	.filename {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		bottom: -2px;
		z-index: 2;
		width: 83%;
		text-overflow: ellipsis;
		overflow: hidden;
		text-align: center;
		white-space: nowrap;
		z-index: 9;
	}
	.marks {
		position: absolute;
		z-index: 1;
		top: 0;
		right: 0;
		width: 100px;
		height: 100px;
		background: rgba(0, 0, 0, 0.5);
		display: none;
		color: #ffffff;
		.el-icon {
			font-size: 16px;
			cursor: pointer;
			margin: 0 4px;
		}
	}
}
.img_item:hover {
	.marks {
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
	}
}
  </style>
  