/**
 * 示例模块的枚举与展示映射
 *
 * 枚举 value 与后端字典保持一致，tone 只用于前端配色（对应 mcs-status-tag 的 type）。
 * 新模块请照此把枚举集中到一处，禁止在多个页面重复写 if/else 文案映射。
 */

export const DEMO_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT', tone: 'info' },
  { label: '进行中', value: 'RUNNING', tone: 'primary' },
  { label: '已完成', value: 'DONE', tone: 'success' },
  { label: '已关闭', value: 'CLOSED', tone: 'danger' }
]

export const DEMO_CATEGORY_OPTIONS = [
  { label: '基础配置', value: 'BASIC' },
  { label: '业务流程', value: 'PROCESS' },
  { label: '数据看板', value: 'BOARD' }
]

/**
 * 状态枚举转展示对象，未知值统一回落到灰色占位，避免页面出现空白单元格
 * @param {string} value 后端状态枚举
 * @returns {{ label: string, tone: string }}
 */
export function resolveStatus(value) {
  const matched = DEMO_STATUS_OPTIONS.find((item) => item.value === value)
  return matched ? { label: matched.label, tone: matched.tone } : { label: '--', tone: 'info' }
}

/**
 * 分类枚举转文案
 * @param {string} value
 * @returns {string}
 */
export function resolveCategoryLabel(value) {
  const matched = DEMO_CATEGORY_OPTIONS.find((item) => item.value === value)
  return matched ? matched.label : '--'
}
