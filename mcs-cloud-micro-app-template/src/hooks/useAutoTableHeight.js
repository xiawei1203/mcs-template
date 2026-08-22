import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

/**
 * 列表页表格高度随容器自适应，配合 page-shell 的整卡填满布局使用。
 * 容器含 padding 时自动扣除后再赋给 el-table.height，并在尺寸变化后触发表格 doLayout。
 * 用法：把 tableWrapRef 绑到 .table-box 上，tableHeight 绑到 el-table 的 height。
 *
 * @param {object} [options]
 * @param {number} [options.minHeight=240] 最小可视高度
 * @param {import('vue').Ref} [options.tableRef] el-table 组件 ref，用于尺寸变化后重新布局
 * @param {import('vue').WatchSource[]} [options.watchSources] 变化后重新计算（如 total、tab 切换）
 */
export function useAutoTableHeight(options = {}) {
  const minHeight = options.minHeight ?? 240
  const tableRef = options.tableRef
  const watchSources = options.watchSources || []
  const tableWrapRef = ref(null)
  const tableHeight = ref(minHeight)
  let observer = null

  function measureAvailableHeight(el) {
    const style = window.getComputedStyle(el)
    const paddingY = (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0)
    return el.clientHeight - paddingY
  }

  function syncTableLayout() {
    nextTick(() => {
      tableRef?.value?.doLayout?.()
    })
  }

  function updateTableHeight() {
    const el = tableWrapRef.value
    if (!el) return
    tableHeight.value = Math.max(minHeight, Math.floor(measureAvailableHeight(el)))
    syncTableLayout()
  }

  function bindObserver() {
    if (!tableWrapRef.value || typeof ResizeObserver === 'undefined') return
    if (observer) {
      observer.disconnect()
    }
    observer = new ResizeObserver(() => updateTableHeight())
    observer.observe(tableWrapRef.value)
  }

  onMounted(() => {
    nextTick(() => {
      bindObserver()
      updateTableHeight()
    })
    window.addEventListener('resize', updateTableHeight)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateTableHeight)
    if (observer) {
      observer.disconnect()
      observer = null
    }
  })

  // 容器因 v-if / tab 切换重建时重新绑定
  watch(tableWrapRef, (el) => {
    if (!el) return
    nextTick(() => {
      bindObserver()
      updateTableHeight()
    })
  })

  if (watchSources.length) {
    watch(watchSources, () => nextTick(() => updateTableHeight()))
  }

  return {
    tableWrapRef,
    tableHeight,
    updateTableHeight
  }
}

export default useAutoTableHeight
