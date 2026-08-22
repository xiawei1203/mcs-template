import { reactive, ref } from 'vue'
import { getDictData } from '@/api/common/dict'

/**
 * 字典缓存与在途请求表放在模块级：同一字典在多个页面、多个弹框中只请求一次，
 * 并发调用共享同一个 Promise，避免弹框反复打开时重复打接口。
 */
const dictCache = reactive({})
const pendingMap = new Map()

/**
 * 字典组合式函数
 * @param {string[]} dictTypes 需要加载的字典编号
 * @returns {{ dict: object, loading: import('vue').Ref<boolean>, load: Function, options: Function, resolveLabel: Function, resolveLabels: Function }}
 */
export function useDict(dictTypes = []) {
  const types = (Array.isArray(dictTypes) ? dictTypes : [dictTypes])
    .map((item) => String(item || '').trim())
    .filter(Boolean)
  const loading = ref(false)

  function load(force = false) {
    if (!types.length) return Promise.resolve(dictCache)
    loading.value = true
    return Promise.all(types.map((type) => loadOne(type, force)))
      .then(() => dictCache)
      .finally(() => {
        loading.value = false
      })
  }

  /**
   * 取某个字典的下拉选项，未加载完成时返回空数组而不是 undefined，模板可直接 v-for
   * @param {string} dictType
   */
  function options(dictType) {
    return dictCache[String(dictType || '')] || []
  }

  /**
   * 字典值转中文，未命中时回落到原值，避免页面出现空白单元格
   * @param {string} dictType
   * @param {string} value
   * @param {string} [placeholder]
   */
  function resolveLabel(dictType, value, placeholder = '--') {
    if (value === '' || value === null || value === undefined) return placeholder
    const matched = options(dictType).find((item) => item.value === String(value))
    return matched ? matched.label : String(value)
  }

  /**
   * 多值字典转中文数组，用于项目标签这类多选字段
   * @param {string} dictType
   * @param {Array|string} values 数组或逗号分隔字符串
   */
  function resolveLabels(dictType, values) {
    const list = Array.isArray(values)
      ? values
      : String(values || '')
          .split(',')
          .filter(Boolean)
    return list.map((value) => resolveLabel(dictType, value, String(value)))
  }

  load()

  return { dict: dictCache, loading, load, options, resolveLabel, resolveLabels }
}

function loadOne(dictType, force) {
  if (!force && Array.isArray(dictCache[dictType])) {
    return Promise.resolve(dictCache[dictType])
  }
  if (pendingMap.has(dictType)) {
    return pendingMap.get(dictType)
  }
  const pending = getDictData(dictType)
    .then((list) => {
      dictCache[dictType] = list
      return list
    })
    .catch(() => {
      dictCache[dictType] = []
      return []
    })
    .finally(() => {
      pendingMap.delete(dictType)
    })
  pendingMap.set(dictType, pending)
  return pending
}

export default useDict
