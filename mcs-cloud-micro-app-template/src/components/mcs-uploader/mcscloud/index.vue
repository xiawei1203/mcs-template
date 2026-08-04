<template>
	<div>
		<mcs-upload  ref="uploadRef"
			:class="{'picture-upload':listType=='picture','text-upload':listType=='text'}"
			:file-base-url="fileBaseUrl"
			:limit="limit"
			:list-type="listType"
			:multiple="multiple"
			:attrs="attrs"
			@fileError="fileError"
			:action="action" :groupId="groupId" @fileRemoved="handleDelete" @fileSuccess="handleUploadSuccess" 
			:show-file-list="showFileList"
			:headers="headers" :max-file-size="maxFileSize">
			<template #default="dprops">
				<div v-if="listType==='text'" >
					<el-button  @click="$refs.uploadRef.uploader.click()"> <el-icon class="el-icon--right" style="margin-right: 5px;"><UploadFilled /></el-icon>上传文件 </el-button>
					<div v-if="tip" class="tip">{{tip}}</div>
				</div>
				<div v-if="listType==='picture'">
					<div v-if="!multiple && dprops.files.length"></div>
					<div v-else class="picture-but" @click="$refs.uploadRef.uploader.click()"><el-icon><Plus /></el-icon></div>
				</div>
			</template>
			<template #uploaderList="props">
				<picture-files v-if="listType==='picture'" :fileList="props.fileList"></picture-files>
				<text-file v-else-if="listType==='text'" :fileList="props.fileList"></text-file>
			</template>
		</mcs-upload>
		<div v-if="tip && listType==='picture'" class="tip">{{tip}}</div>
	</div>
</template>
<script>

import McsUpload from '@/components/mcs-uploader/index.vue'
import PictureFiles from './picture-files.vue'
import TextFile from "./text-file.vue";

import { ElLoading } from 'element-plus'
import { Plus, ZoomIn, Download, Delete,UploadFilled} from '@element-plus/icons-vue'
import { uid } from "../js/utils";

export default {
	name: "fileUpload",
	components: { Plus, ZoomIn, Download, Delete, McsUpload,UploadFilled,PictureFiles,TextFile},
	props: {
		modelValue: { // 
			type: [ String, Array, Object ],
			default: []
		},
		valueType: {  //string //array //object  // 结果值类型
			type: String,
			default: 'string'
		},
		groupId:{
			type: String,
			default: "admin"
		},
		listType: {
			type: String,//picture //text
			default: "text"
		},
		attrs:{
			type: Object,
			default(){
				return {
					accept: "image/*"
				}
      }
		},
		multiple:{
			type: Boolean,
			default: false
		},
		showFileList:{
			type: Boolean,
			default: true
		},
		limit: {
			type: Number,
			default: 1,
		},
		maxFileSize: {
			type: Number,
			default: 30*1024*1024,
		},
		accept: {
			type: String,
			default: () => { return 'image/*' },
		},
		fileList:{
			type:[ String, Object, Array ]
		},
		tip: {
			type: String
		},
	},
	watch:{
		fileList:function(val){
			console.log(val)
		}
	},
	data() {
		return {
			fileBaseUrl: process.env.VUE_APP_FILE_BASE_API,
			headers:{
				"Authorization": "Bearer "+this.$store.getters.token,
				'X-Mcs-User-Pool': this.$store.getters.userpoolid
			},
			action: '',
		};
	},
	mounted(){
		this.$nextTick(()=>{
			const files= this.fileListConvertToUploaderFiles(this.fileList)
			this.$refs.uploadRef.uploader.addFiles(files)
		})
	},
	methods: {
		uploaderFilesTofileList(files){
			if (this.valueType == 'string' || this.valueType == undefined) {
				if (files.length) {
					return files[0].objectName
				}
			} else if(this.valueType == 'object'){
				if (files.length) {
					return {
						name: files[0].name,
						objectName: files[0].objectName,
					}
				}
			} else if (this.valueType) {
				return files.map( item=>{ return {name:item.name,objectName:item.objectName} })
			}
			return ""
		},
		fileListConvertToUploaderFiles(fileList){
			let files=[]
			if (typeof fileList == 'string') {
				const filename= this.getFileName(fileList)
				files.push({name:filename,objectName:fileList})
			}else if(typeof fileList == 'object' && !(fileList instanceof Array)){
				if (!fileList.name) {
					const filename= this.getFileName(fileList.objectName)
					fileList.name=filename
				}
				files.push(fileList)
			}else if (fileList instanceof Array) {
				files = fileList
			}
			return files
		},
		// 上传成功回调
		handleUploadSuccess(data) {
			const files=this.uploaderFilesTofileList(this.$refs.uploadRef.uploader.files)
			this.$emit("update:fileList", files);
			this.$emit("change", files);
		},
		fileError(msg){
			this.$message.error(msg || "上传失败");
		},
		// 删除文件
		handleDelete(file) {
			this.handleUploadSuccess()
		},
		// 对象转成指定字符串分隔
		listToString(list, separator) {
			let strs = "";
			separator = separator || ",";
			for (let i in list) {
				strs += list[i].url + separator;
			}
			return strs != '' ? strs.substr(0, strs.length - 1) : '';
		},
		getFileName(filePath){
			filePath =filePath.replaceAll("\\","/")
			const index= filePath.lastIndexOf("/")
			if (index>-1) {
				return filePath.substring(index+1)
			} 
			return filePath
		}
	}
};
</script>
  
<style scoped lang="scss">

.tip{
	line-height: 22px;
    font-size: 12px;
    color: var(--el-text-color-grayset);
}

.picture-upload{
	width: 100%;
	line-height: 0;
}

.text-upload{
	width: 100%;
	// display: block;
	// display: flex;
    // flex-wrap: wrap;
    // flex-direction: column;
}

.picture-but{
	line-height:100px;
	text-align: center;
	border-radius: 4px;
	margin-bottom: 8px;
	margin-right: 8px;
	width:100px;
	background-color: var(--el-fill-color-lighter);
	border: 1px dashed var(--el-border-color);
	&:hover{
		border-color: var(--el-color-primary);
	}
}
.text-but{

}


.img {
	width: 100%;
	height: 100%;
	.el-image {
		width: 100%;
		height: 100%;
	}
}
.upload-file-uploader {
	margin-bottom: 5px;
}
.upload-file-list .el-upload-list__item {
	border: 1px solid #e4e7ed;
	line-height: 2;
	margin-bottom: 10px;
	position: relative;
}
.upload-file-list .ele-upload-list__item-content {
	display: flex;
	justify-content: space-between;
	align-items: center;
	color: inherit;
}
.ele-upload-list__item-content-action .el-link {
	margin-right: 10px;
}
.view-file {
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	::v-deep .el-upload--picture-card {
		width: 100px;
		margin: 0 auto;
		display: none !important;
	}
}
::v-deep .el-upload--picture-card {
	margin: 0px 0 !important;
}
::v-deep .el-upload {
	display: flex;
	text-align: center;
	cursor: pointer;
	width: 100px !important;
	outline: none;
}
::v-deep .el-upload-dragger {
	width: 100%;
	height: 120px;
	display: flex;
	align-items: center;
	justify-content: center;
}
.el-upload-dragger .el-icon-upload {
	font-size: 35px;
	color: #C0C4CC;
	margin: 0 !important;
	line-height: 50px;
}
.el-upload-dragger .el-upload__text {
	color: #606266;
	font-size: 14px;
	text-align: center;
	margin-left: 10px;
}
::v-deep .el-upload-list--picture-card .el-upload-list__item-actions {
	z-index: 9;
}
.el-upload-list__item-thumbnail {
	display: flex;
	align-items: center;
	justify-content: center;
	/* // background-color: rgba(0,0,0, 0.1); */
	::v-deep .image-slot {
		position: relative;
		top: -10px;
		font-size: 100px;
	}
}
:deep(.el-upload--picture-card) {
	--el-upload-picture-card-size: 98px;
	display: inline-flex;
	flex-wrap: wrap;
	margin: 0;
}
.upload-file {
	width: 100%;
	display: flex;
	flex-wrap: wrap;
}
</style>