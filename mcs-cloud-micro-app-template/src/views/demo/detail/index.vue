<template>
  <div class="page-container mcs-page">
    <mcs-title title="示例详情" :border="true">
      <template #left>
        <span class="page-subtitle">{{ detail.code || '' }}</span>
      </template>
      <template #right>
        <el-button type="mcs" :disabled="!detail.id" @click="goEdit">编辑</el-button>
      </template>
    </mcs-title>
    <div v-loading="loading" class="page-body page-body--scroll">
      <mcs-section-card title="基本信息">
        <template #extra>
          <mcs-status-tag :text="statusView.label" :type="statusView.tone" />
        </template>
        <el-descriptions :column="2" border class="formDetail">
          <el-descriptions-item label="名称">{{ detail.name || '--' }}</el-descriptions-item>
          <el-descriptions-item label="编码">{{ detail.code || '--' }}</el-descriptions-item>
          <el-descriptions-item label="分类">{{ resolveCategoryLabel(detail.category) }}</el-descriptions-item>
          <el-descriptions-item label="完成进度">
            <div class="progress-cell">
              <el-progress :percentage="progressValue" :stroke-width="8" :show-text="false" />
              <span class="progress-cell__text">{{ progressValue }}%</span>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </mcs-section-card>
      <mcs-section-card title="归属与备注">
        <el-descriptions :column="2" border class="formDetail">
          <el-descriptions-item label="所属部门">{{ detail.deptName || '--' }}</el-descriptions-item>
          <el-descriptions-item label="负责人">{{ detail.ownerName || '--' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detail.createTime || '--' }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ detail.updateTime || '--' }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">
            <span :class="{ 'cell-muted': !detail.remarks }">{{ detail.remarks || '--' }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </mcs-section-card>
      <mcs-section-card v-if="detail.content" title="详细说明">
        <div class="rich-text" v-html="detail.content"></div>
      </mcs-section-card>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { resolveCategoryLabel, resolveStatus } from '../constants'
import { DEMO_FORM, DEMO_LIST } from '../routePaths'
import * as HTTP from '../api/demo'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const detail = ref({})

const statusView = computed(() => resolveStatus(detail.value.status))
const progressValue = computed(() => {
  const num = Number(detail.value.progress)
  if (!Number.isFinite(num) || num <= 0) return 0
  return Math.min(100, Math.round(num <= 1 ? num * 100 : num))
})

onMounted(() => {
  // 隐藏页可能被直接刷新或收藏，缺少主键时提示并回列表，避免空白页
  if (!route.query.id) {
    ElMessage.warning('缺少参数，已返回列表')
    goList()
    return
  }
  loadDetail(route.query.id)
})

function loadDetail(id) {
  loading.value = true
  HTTP.findById(id)
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

function goEdit() {
  router.push({ path: DEMO_FORM, query: { id: String(detail.value.id) } })
}

function goList() {
  router.push({ path: DEMO_LIST })
}
</script>

<style lang="scss" scoped>
.rich-text {
  line-height: 24px;
  word-break: break-all;
  :deep(img) {
    max-width: 100%;
  }
}
</style>
