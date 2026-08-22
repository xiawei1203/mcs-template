import { ElLoading, ElMessage } from 'element-plus'
import store from '@/store'

/**
 * 格式化文件大小（字节）
 * @param {number|string} size
 * @returns {string}
 */
export function formatFileSize(size) {
  if (size == null || size === '') return '--'
  const n = Number(size)
  if (!Number.isFinite(n) || n < 0) return '--'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

/** 静态资源统一前缀，与 nginx / 本地代理的 /static-resources-img 对齐 */
const FILE_BASE_API = process.env.VUE_APP_FILE_BASE_API || '/static-resources-img/'

/**
 * 解析附件可访问 URL：绝对地址原样返回，相对路径拼 /static-resources-img。
 * @param {string} path
 * @returns {string}
 */
export function resolveFileUrl(path) {
  if (!path) return ''
  const p = String(path).trim()
  if (!p) return ''
  if (p.startsWith('http://') || p.startsWith('https://')) return p
  if (p.startsWith('/static-resources-img/')) return p
  return `${FILE_BASE_API.replace(/\/$/, '')}/${p.replace(/^\//, '')}`
}

function triggerBlobDownload(blob, fileName) {
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = URL.createObjectURL(blob)
  a.download = fileName || 'download'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(a.href)
}

function pickAttachmentPath(pathOrFile) {
  if (pathOrFile == null) return ''
  if (typeof pathOrFile === 'string') return pathOrFile.trim()
  return String(
    pathOrFile.objectKey || pathOrFile.objectName || pathOrFile.fileUrl || pathOrFile.filePath || pathOrFile.path || pathOrFile.url || ''
  ).trim()
}

function pickAttachmentFileName(pathOrFile, relativePath, options = {}) {
  if (options.fileName) return String(options.fileName)
  if (pathOrFile && typeof pathOrFile === 'object') {
    const named = pathOrFile.name || pathOrFile.fileName
    if (named) return String(named)
  }
  return String(relativePath).split('/').filter(Boolean).pop() || 'download'
}

/**
 * 带鉴权下载附件：fetch + Authorization + blob 触发落盘。
 * @param {string|object} pathOrFile 相对路径或含 objectName/fileUrl 的附件对象
 * @param {{ fileName?: string }} [options]
 */
export async function downloadAttachment(pathOrFile, options = {}) {
  const relativePath = pickAttachmentPath(pathOrFile)
  const url = resolveFileUrl(relativePath)
  if (!url) {
    ElMessage.warning('附件地址无效')
    return
  }
  const fileName = pickAttachmentFileName(pathOrFile, relativePath, options)
  const token = store.getters?.token
  const auth = token ? `Bearer ${token}` : ''
  const loading = ElLoading.service({ fullscreen: true, text: '下载中…' })
  try {
    const res = await fetch(url, { headers: auth ? { Authorization: auth } : {} })
    if (!res.ok) throw new Error('network')
    const blob = await res.blob()
    triggerBlobDownload(blob, fileName)
  } catch {
    ElMessage.error('下载失败')
  } finally {
    loading.close()
  }
}
