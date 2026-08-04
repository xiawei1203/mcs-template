<template>
	<div>
		<div class="upload-file">
			<div v-for="(file, idx) in fileList" :key="idx" class="img_item">
				<div class="filename">{{ file.fileName }}</div>
				<!-- <div class="type"> -->
				<div class="img">
					<el-image :src="file.url" :lazy="lazyLoad" @error="imgLoadingErr(file)">
						<div slot="placeholder" style="position: absolute;top:38%;left: 30%;">
							<span class="dot">加载中...</span>
						</div>
					</el-image>
				</div>
				<div class="marks">
					<!-- <span class="el-upload-list__item-actions"> -->
						<span v-if="(!file.loadingErr || !file.playingErr || file.isPDF) && !file.isWord"
							class="el-upload-list__item-preview">
							<el-icon @click="handlePictureCardPreview(file)">
								<ZoomIn />
							</el-icon>
						</span>
						<span @click="handleDownload(file)">
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
			<mcs-upload v-show="uploadShow" class="demo" style="height: 100px;width:100px; border-radius: 4px;"
				:action="action" groupId="admin" :auth="auth" @fileSuccess="handleUploadSuccess" :maxFileSize="maxFileSize">
				<div style="line-height:100px;text-align: center;width:100px;background-color: var(--el-fill-color-lighter);">
					<el-icon>
						<Plus />
					</el-icon>
				</div>
				
			</mcs-upload>
			
			<!-- 图片浏览查看 -->
			<el-image-viewer v-if="showViewer" :initial-index="viewIndex" @close="closeViewer" :url-list="imgUrlList" />
			<!-- 视频查看 -->
			<el-dialog :visible.sync="videoVisible" width="800" title="预览">
				<video width="100%" v-if="videoUrl" controls="controls">
					<source :src="videoUrl" />
				</video>
			</el-dialog>
		</div>
		<div v-if="tip" class="tip">{{tip}}</div>
	</div>
</template>
<script>
// import { getAccessToken } from "@/utils/auth";
import McsUpload from '@/components/mcs-uploader/index.vue'
import { ElLoading } from 'element-plus'
import { Plus, ZoomIn, Download, Delete } from '@element-plus/icons-vue'
export default {
	name: "fileUpload",
	props: {
		// 值
		modelValue: {
			type: [Array],
			default: () => {
				return [
					// {
					// 	fileName: 'food.jpeg',
					// 	filePath: '1/3/13950c9b-0255-4523-a86e-a4ba10710fa2.png'
					// }
				]
			}
		},
		// 上传的额外传参
		uploadQuery: {
			type: [Object, Array],
			default: () => {
				return {
					// evaluationItemsId: 54739,
					// orderType: 1,
					// orderNo: 'RD202300000154'
				}
			}
		},
		// 文件传给后端的key
		fileUploadKey: {
			type: String,
			default: 'file' // 'view'
		},
		show_delete: {
			type: Boolean,
			default: false
		},
		// 数量限制
		limit: {
			type: Number,
			default: -1,
		},
		// 大小限制(MB)
		maxFileSize: {
			type: Number,
			default: 30*1024*1024,
		},
		// 文件类型（后缀名）, 例如'png,jpg,jpeg' 
		// 表格 application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel
		accept: {
			type: String,
			default: () => { return 'image/*' },
		},
		// 是否显示提示
		tip: {
			type: String
		},
		// 图片上传地址
		uploadFileUrl: {
			type: String,
			default: () => {
				// /infra/org-evaluation-items-file/uploadItemsFile
				// /infra/org-rating-declaration-file/upload
				return ""
			}
		},
		// 请求头额外传参
		fileUploadHeaders: {
			type: Object,
			default: () => {
				return {}
			}
		},
		lazyLoad: {
			type: Boolean,
			default: false
		}
	},
	components: { Plus, ZoomIn, Download, Delete, McsUpload },
	data() {
		return {
			// pdfImg: require("@/assets/img/pdf.png"),
			// wordImg: require("@/assets/img/word.png"),
			// 图片浏览相关
			showViewer: false,
			imgUrlList: [],
			// 视频查看相关
			videoVisible: false,
			videoUrl: '',
			fileUrl: process.env.VUE_APP_FILE_BASE_API,
			baseUrl: process.env.VUE_APP_BASE_API,
			fileList: [],
			viewList: [],
			viewIndex: 0,
			action: '/api', // http://192.168.0.150:30010
      		auth: "Bearer " + this.$store.getters.token,
		};
	},
	watch: {
		modelValue: {
			handler(val) {
				
			},
			deep: true,
			immediate: true
		}
	},
	computed: {
		uploadUrl() {
			return '#' // this.baseUrl + '/admin-api' + this.uploadFileUrl
		},
		// 上传请求头
		uploadHeaders() {
			return {
				Authorization: 'Bearer ', //  + getAccessToken(),
				... this.fileUploadHeaders
			}
		},
		uploadShow() {
			if(this.fileList.length<=0){
				return true
			}
			else if(this.fileList.length>0 && this.limit==1) {
				return false
			}
			return true
		},
		fileBaseUrl(){
			return process.env.VUE_APP_FILE_BASE_API
		}
	},
	methods: {
		// 上传失败
		handleUploadError() {
			this.$modal.msgError("上传图片失败，请重试");
			this.$modal.closeLoading()
		},
		// 上传成功回调
		handleUploadSuccess(data) {
			data.url=this.fileBaseUrl+data.filePath
			this.fileList.push(data);
			this.$emit("update:modelValue", this.fileList);
		},
		// 删除文件
		handleDelete(file) {
			let idx = ''
			this.fileList.forEach((item, i) => {
				if (item.filePath == file.filePath) {
					idx = i
				}
			})
			this.fileList.splice(idx, 1)
			this.$emit("update:modelValue", this.fileList);
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
		// 上传改变
		uploadChange(file, file_list) {
			this.$emit("file-change", file, file_list);
			// console.log(file, file_list)
		},
		// 打开图片查看器
		handlePictureCardPreview(file) {
			if (!file.loadingErr) {
				let idx = 0
				this.fileList.forEach((item, i) => {
					if (item.url === file.url) {
						idx = i
					}
				})
				this.viewIndex = idx
				this.imgUrlList = this.fileList.map(item=>item.url)
				this.showViewer = true
				this.stopRoll()
				return
			}
			if (!file.playingErr) {
				this.videoUrl = file.url // 'https://www.runoob.com/try/demo_source/movie.mp4'
				this.videoVisible = true
				return
			}
		},
		// 关闭图片查看器
		closeViewer() {
			this.showViewer = false
			this.roll()
		},
		// 下载文件
		handleDownload(file) {
			// let meddleType = (file.url || '').split(".");
			// let fileType = meddleType.length > 1 ? meddleType[meddleType.length - 1] : ''
			// if (fileType == "pdf") {
			// 	window.open(file.url);
			// } else {
			this.downloadImage(file) // "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
			// }
		},
		downloadImage(file) {
			// 将链接地址字符内容转变成blob地址, 解决图片下载直接打开问题
			// url 为图片地址
			const loading = ElLoading.service({ fullscreen: true })
			fetch(file.url).then(async res => await res.blob()).then((blob) => {
				// 创建隐藏的可下载链接
				const a = document.createElement('a');
				a.style.display = 'none';
				a.href = URL.createObjectURL(blob);
				// 保存下来的文件名
				a.download = file.fileName;
				document.body.appendChild(a);
				loading.close()
				a.click();
				// 移除元素
				document.body.removeChild(a);
			}).catch(() => {
				this.$modal.msgError(`下载失败`);
				loading.close()
			})
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
		imgLoadingErr(file) {
			file.loadingErr = true
			if (file.loadingErr) {
				this.videoError(file)
			}
			this.$forceUpdate()
		},
		// 判断是否是可播放的视频
		videoError(file) {
			const videoElement = document.createElement("video");
			document.body.appendChild(videoElement);
			videoElement.onerror = () => {
				file.playingErr = true
				this.$forceUpdate()
				document.body.removeChild(videoElement)
			};
			videoElement.oncanplay = () => {
				file.playingErr = false
				this.$forceUpdate()
				document.body.removeChild(videoElement)
			};
			videoElement.src = file.url; // 'https://www.runoob.com/try/demo_source/movie.mp4'
		},
		show_img(file) {
			if (file.isPDF) {
				return this.pdfImg
			} else if (file.isWord) {
				return this.wordImg
			} else {
				return file.url
			}
		}
	}
};
</script>
  
<style scoped lang="scss">
:deep(.uploader-btn) {
	border: 1px dashed #e2e2e2;
}
.tip{
	line-height: 22px;
    font-size: 12px;
    color: var(--el-text-color-grayset);
}
.word {
	width: 100%;
	height: 100%;
	cursor: pointer;
	.el-image {
		width: 100%;
		height: 100%;
	}
}
.pdf {
	width: 100%;
	height: 100%;
	cursor: pointer;
	.el-image {
		width: 100%;
		height: 100%;
	}
}
.img {
	width: 100%;
	height: 100%;
	.el-image {
		width: 100%;
		height: 100%;
	}
}
.img_item {
	position: relative;
	width: 100px;
	height: 100px;
	margin-right: 10px;
	margin-bottom: 10px;
	border-radius: 4px;
	border: 1px solid var(--el-border-color);
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