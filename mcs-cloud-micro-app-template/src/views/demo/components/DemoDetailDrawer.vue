<template>
  <mcs-drawer
    :model-value="modelValue"
    title="示例详情"
    size="640px"
    :loading="loading"
    :show-footer="true"
    @update:model-value="onVisibleChange"
    @open="loadDetail"
  >
    <mcs-section-card title="基本信息">
      <template #extra>
        <mcs-status-tag :text="statusView.label" :type="statusView.tone" />
      </template>
      <el-descriptions :column="2" border class="formDetail">
        <el-descriptions-item label="名称">{{ detail.name || '--' }}</el-descriptions-item>
        <el-descriptions-item label="编码">{{ detail.code || '--' }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ resolveCategoryLabel(detail.category) }}</el-descriptions-item>
        <el-descriptions-item label="完成进度">{{ progressText }}</el-descriptions-item>
        <el-descriptions-item label="所属部门">{{ detail.deptName || '--' }}</el-descriptions-item>
        <el-descriptions-item label="负责人">{{ detail.ownerName || '--' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detail.createTime || '--' }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ detail.updateTime || '--' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          <span :class="{ 'cell-muted': !detail.remarks }">{{ detail.remarks || '--' }}</span>
        </el-descriptions-item>
      </el-descriptions>
    </mcs-section-card>
    <template #footer>
      <el-button @click="onVisibleChange(false)">关闭</el-button>
      <el-button type="mcs" :disabled="!detail.id" @click="emit('edit', String(detail.id))">编辑</el-button>
    </template>
  </mcs-drawer>
</template>

<script setup>
import { computed, ref } from 'vue'
import { resolveCategoryLabel, resolveStatus } from '../constants'
import * as HTTP from '../api/demo'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  demoId: {
    type: [String, Number],
    default: ''
  }
})
const emit = defineEmits(['update:modelValue', 'edit'])
const loading = ref(false)
const detail = ref({})

const statusView = computed(() => resolveStatus(detail.value.status))
const progressText = computed(() => {
  const num = Number(detail.value.progress)
  if (!Number.isFinite(num) || num <= 0) return '0%'
  return `${Math.min(100, Math.round(num <= 1 ? num * 100 : num))}%`
})

function loadDetail() {
  detail.value = {}
  if (!props.demoId) return
  loading.value = true
  HTTP.findById(props.demoId)
    .then((res) => {
      detail.value = res?.data || {}
    })
    .catch(() => {
      detail.value = {}
    })
    .finally(() => {
      loading.value = false
    })
}

function onVisibleChange(value) {
  emit('update:modelValue', value)
}
</script>
