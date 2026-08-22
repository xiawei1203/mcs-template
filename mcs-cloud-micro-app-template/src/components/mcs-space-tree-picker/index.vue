<template>
  <div class="space-picker">
    <div class="space-picker__tree">
      <div class="space-picker__head">
        <span>选择空间</span>
        <span class="space-picker__count">{{ disabled ? '空间已锁定' : `可选 ${selectableCount} 个` }}</span>
      </div>
      <div v-if="disabled" class="space-picker__lock">{{ lockHint }}</div>
      <el-input v-model="keyword" clearable size="small" placeholder="搜索空间名称或编码" />
      <div class="space-picker__tree-body">
        <el-scrollbar height="100%">
          <div v-if="loading || treeLoading" class="space-picker__empty">空间加载中...</div>
          <el-tree
            v-else-if="treeData.length"
            ref="treeRef"
            class="space-picker__tree-inner"
            :data="treeData"
            node-key="id"
            :props="treeProps"
            :current-node-key="selectedId || undefined"
            :filter-node-method="filterNode"
            default-expand-all
            :highlight-current="showDetail || !!selectedId"
            @node-click="onTreeNodeClick"
          >
            <template #default="{ data }">
              <div
                class="space-picker__node"
                :class="{
                  'is-selectable': data.selectable && !data.disabled,
                  'is-selected': data.selectable && selectedId === data.id,
                  'is-occupied': data.selectable && data.disabled
                }"
              >
                <span class="space-picker__node-name" :title="data.name">{{ data.name }}</span>
                <span v-if="disabled && data.selectable && selectedId === data.id" class="space-picker__occupied">不可更换</span>
                <span v-else-if="data.selectable && data.disabled" class="space-picker__occupied">已占用</span>
                <el-icon
                  v-else-if="data.selectable && selectedId === data.id"
                  class="space-picker__check"
                >
                  <CircleCheckFilled />
                </el-icon>
              </div>
            </template>
          </el-tree>
          <div v-else class="space-picker__empty">暂无可用空间</div>
        </el-scrollbar>
      </div>
    </div>
    <div v-if="showDetail" class="space-picker__detail">
      <el-scrollbar v-if="activeNode" height="100%">
        <div class="space-picker__detail-head">
          <span class="space-picker__avatar">{{ typeLabel.slice(0, 1) || '空' }}</span>
          <div>
            <div class="space-picker__detail-name">{{ activeNode.name }}</div>
            <div class="space-picker__detail-path">{{ activeNode.spacePath || '--' }}</div>
          </div>
        </div>
        <div class="space-picker__detail-title">空间详情</div>
        <div v-loading="detailLoading" class="mcs-info-grid space-picker__info">
          <div v-for="item in detailItems" :key="item.label" class="mcs-info-grid__item">
            <span class="mcs-info-grid__label">{{ item.label }}</span>
            <span class="mcs-info-grid__value">{{ item.value }}</span>
          </div>
        </div>
      </el-scrollbar>
      <div v-else class="space-picker__empty space-picker__empty--detail">请在左侧选择空间</div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { CircleCheckFilled } from '@element-plus/icons-vue'
import { getSpaceDetail, getSpaceTree } from '@/api/common/space'

/**
 * 空间单选树。左侧展示空间树，右侧可选展示所选空间详情。
 * 可见叶子由 projectSpaceIds 决定（空数组表示不限制），可勾选叶子由 availableSpaceIds 决定（空数组表示全部可选）。
 * change 事件回传所选空间及全路径，供业务表单回填只读「空间路径」。
 */
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  projectSpaceIds: {
    type: Array,
    default: () => []
  },
  availableSpaceIds: {
    type: Array,
    default: () => []
  },
  showDetail: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  disabledReason: {
    type: String,
    default: ''
  }
})
const emit = defineEmits(['update:modelValue', 'change'])
const treeProps = { label: 'name', children: 'children' }
const treeRef = ref(null)
const treeLoading = ref(false)
const sourceTree = ref([])
const keyword = ref('')
const activeNode = ref(null)
const emittedSpaceId = ref('')
const detailLoading = ref(false)
const detail = reactive({ area: null, devices: [], tags: [] })
const detailCache = new Map()

const selectedId = computed(() => normalizeId(props.modelValue))
const allowedSet = computed(() => new Set(normalizeIds(props.projectSpaceIds)))
const availableSet = computed(() => new Set(normalizeIds(props.availableSpaceIds)))
const restrictVisible = computed(() => allowedSet.value.size > 0)
const restrictAvailable = computed(() => availableSet.value.size > 0)
const treeData = computed(() => filterProjectTree(sourceTree.value))
const selectableCount = computed(() => countNodes(treeData.value, (node) => node.selectable && !node.disabled))
const lockHint = computed(() => props.disabledReason || '当前不可更换空间')
const typeLabel = computed(() => {
  const labels = {
    PROJECT: '项目',
    PARK: '园区',
    BUILDING: '建筑',
    FLOOR: '楼层',
    AREA: '区域',
    ROOM: '房间'
  }
  return labels[activeNode.value?.spaceType] || activeNode.value?.spaceTypeLabel || '空间'
})
const detailItems = computed(() => [
  { label: '空间编码', value: activeNode.value?.code || '--' },
  { label: '空间类型', value: typeLabel.value },
  { label: '建筑面积', value: formatArea(detail.area ?? activeNode.value?.area) },
  { label: '设备数量', value: `${Array.isArray(detail.devices) ? detail.devices.length : 0} 台` }
])

watch(keyword, (value) => treeRef.value?.filter(value))
watch(
  () => props.projectSpaceIds,
  () => {
    nextTick(selectInitialNode)
  },
  { deep: true }
)
watch(
  () => props.modelValue,
  (value) => {
    if (!value) {
      emittedSpaceId.value = ''
    }
    nextTick(selectInitialNode)
  }
)

loadTree()

function loadTree() {
  treeLoading.value = true
  getSpaceTree()
    .then((res) => {
      sourceTree.value = decorateTree(Array.isArray(res?.data) ? res.data : [], [])
    })
    .catch(() => {
      sourceTree.value = []
    })
    .finally(() => {
      treeLoading.value = false
      nextTick(selectInitialNode)
    })
}

/**
 * 空间树接口只给层级结构，这里在递归时补两样东西：拼好的 spacePath 供详情展示，
 * 以及祖先链 ancestors，用于拼 spacePath。
 * @param {Array} nodes
 * @param {Array<object>} parentChain 从根到父节点的祖先链
 */
function decorateTree(nodes, parentChain) {
  if (!Array.isArray(nodes)) return []
  return nodes.filter(Boolean).map((node) => {
    const id = normalizeId(node.id)
    const ancestors = [...parentChain, { id, name: node.name || '', spaceType: node.spaceType }]
    return {
      ...node,
      id,
      ancestors: parentChain,
      spacePath: ancestors
        .map((item) => item.name)
        .filter(Boolean)
        .join(' / '),
      children: decorateTree(node.children, ancestors)
    }
  })
}

/**
 * 传入 projectSpaceIds 时只保留命中叶子及其祖先；未传则展示整树。
 * 当前编辑记录即使不在可用集合中仍可选中回显，其余不可用叶子显示为已占用。
 */
function filterProjectTree(nodes) {
  const walk = (list) =>
    list.reduce((result, node) => {
      const children = walk(Array.isArray(node.children) ? node.children : [])
      const isLeaf = !node.children?.length
      const isAllowedLeaf = isLeaf && (!restrictVisible.value || allowedSet.value.has(node.id))
      if (!isAllowedLeaf && !children.length) return result
      const selectable = isAllowedLeaf
      const disabled = selectable && restrictAvailable.value && !availableSet.value.has(node.id)
      result.push({ ...node, children, selectable, disabled })
      return result
    }, [])
  return walk(nodes)
}

function selectInitialNode() {
  const selected = findNode(treeData.value, selectedId.value)
  if (selected) {
    onNodeClick(selected)
    emitSelected(selected)
    return
  }
  if (!props.showDetail) {
    activeNode.value = null
    nextTick(() => {
      treeRef.value?.setCurrentKey(null)
    })
    return
  }
  const firstSelectable = findNode(treeData.value, '', (node) => node.selectable && !node.disabled)
  const target = firstSelectable || treeData.value[0]
  if (target) {
    onNodeClick(target)
  }
}

function onTreeNodeClick(node) {
  if (props.disabled) {
    if (node?.selectable && node.id !== selectedId.value) {
      ElMessage.warning(lockHint.value)
    }
    restoreCurrentKey()
    return
  }
  if (node?.selectable && !node.disabled) {
    selectSpace(node)
    return
  }
  if (node?.selectable && node.disabled) {
    restoreCurrentKey()
    return
  }
  if (props.showDetail) {
    onNodeClick(node)
    return
  }
  restoreCurrentKey()
}

function restoreCurrentKey() {
  nextTick(() => {
    treeRef.value?.setCurrentKey(selectedId.value || null)
  })
}

function selectSpace(node) {
  if (!node?.selectable || node.disabled) return
  emit('update:modelValue', node.id)
  onNodeClick(node)
  emitSelected(node)
}

function emitSelected(node) {
  if (!node || emittedSpaceId.value === node.id) return
  emittedSpaceId.value = node.id
  emit('change', {
    id: node.id,
    name: node.name || '',
    code: node.code || '',
    spaceType: node.spaceType || '',
    spacePath: node.spacePath || ''
  })
}

function onNodeClick(node) {
  activeNode.value = node
  treeRef.value?.setCurrentKey(node.id)
  loadDetail(node.id)
}

function loadDetail(id) {
  Object.assign(detail, emptyDetail())
  if (detailCache.has(id)) {
    Object.assign(detail, detailCache.get(id))
    detailLoading.value = false
    return
  }
  detailLoading.value = true
  getSpaceDetail(id)
    .then((res) => {
      const data = res?.data || {}
      detailCache.set(id, data)
      if (activeNode.value?.id === id) {
        Object.assign(detail, data)
      }
    })
    .catch(() => {
      if (activeNode.value?.id === id) {
        Object.assign(detail, emptyDetail())
      }
    })
    .finally(() => {
      if (activeNode.value?.id === id) {
        detailLoading.value = false
      }
    })
}

function filterNode(value, data) {
  const kw = String(value || '').trim().toLowerCase()
  if (!kw) return true
  return String(data.name || '').toLowerCase().includes(kw) || String(data.code || '').toLowerCase().includes(kw)
}

function normalizeId(value) {
  return value == null || value === '' ? '' : String(value)
}

function normalizeIds(list) {
  return (Array.isArray(list) ? list : []).map(normalizeId).filter(Boolean)
}

function countNodes(nodes, pred) {
  let n = 0
  const walk = (list) => {
    ;(list || []).forEach((node) => {
      if (pred(node)) n += 1
      walk(node.children)
    })
  }
  walk(nodes)
  return n
}

function findNode(nodes, id, pred) {
  const walk = (list) => {
    for (const node of list || []) {
      if (id && node.id === id) return node
      if (!id && pred && pred(node)) return node
      const found = walk(node.children)
      if (found) return found
    }
    return null
  }
  return walk(nodes)
}

function formatArea(area) {
  if (area == null || area === '') return '--'
  return `${area} ㎡`
}

function emptyDetail() {
  return { area: null, devices: [], tags: [] }
}
</script>

<style lang="scss" scoped>
.space-picker {
  display: flex;
  min-height: 360px;
  border: 1px solid var(--mcs-border-lighter);
  border-radius: var(--mcs-radius-sm);
  overflow: hidden;
}
.space-picker__tree {
  width: 320px;
  flex: none;
  display: flex;
  flex-direction: column;
  padding: 12px;
  border-right: 1px solid var(--mcs-border-lighter);
}
.space-picker__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--mcs-text-title);
}
.space-picker__count {
  color: var(--mcs-text-placeholder);
}
.space-picker__lock {
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--mcs-text-secondary);
}
.space-picker__tree-body {
  flex: 1;
  min-height: 240px;
  margin-top: 8px;
}
.space-picker__node {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding-right: 8px;
}
.space-picker__node-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.space-picker__occupied {
  flex: none;
  font-size: 12px;
  color: var(--mcs-text-placeholder);
}
.space-picker__check {
  color: var(--mcs-brand);
}
.space-picker__node.is-selected .space-picker__node-name {
  color: var(--mcs-brand);
}
.space-picker__detail {
  flex: 1;
  min-width: 0;
  padding: 16px;
}
.space-picker__detail-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.space-picker__avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--mcs-brand-light);
  color: var(--mcs-brand);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}
.space-picker__detail-name {
  font-size: 16px;
  color: var(--mcs-text-title);
}
.space-picker__detail-path {
  margin-top: 4px;
  font-size: 12px;
  color: var(--mcs-text-placeholder);
}
.space-picker__detail-title {
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--mcs-text-title);
}
.space-picker__empty {
  padding: 32px 0;
  text-align: center;
  font-size: 13px;
  color: var(--mcs-text-placeholder);
}
.space-picker__empty--detail {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
