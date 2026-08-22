<template>
  <div class="page-container mcs-page">
    <mcs-title title="示例列表" :border="true">
      <template #right>
        <el-button plain @click="goCreatePage">新增（表单页）</el-button>
        <el-button type="mcs" @click="openCreateDialog">新增（弹框）</el-button>
      </template>
    </mcs-title>
    <mcs-search
      v-model="form.keyword"
      placeholder="请输入名称或编码"
      @change="findSearch"
      @reset="handleReset"
      @tableHeightCommand="(command) => (tableSize = command)"
    >
      <template #functionButton>
        <el-button :disabled="!selectIds.length" plain @click="deleteBatch()">批量删除</el-button>
      </template>
      <template #advanceSearch>
        <el-form-item label="状态">
          <el-select v-model="form.status" placeholder="全部" clearable>
            <el-option v-for="item in DEMO_STATUS_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.category" placeholder="全部" clearable>
            <el-option
              v-for="item in DEMO_CATEGORY_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="form.createTimeRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            unlink-panels
          />
        </el-form-item>
      </template>
    </mcs-search>
    <div class="page-body">
      <section class="panel">
        <mcs-stats-grid :columns="4" :loading="statsLoading">
          <mcs-kpi-card
            v-for="card in kpiCards"
            :key="card.key"
            :icon="card.icon"
            :label="card.label"
            :value="card.value"
            :sub="card.sub"
            :tone="card.tone"
            :val-tone="card.valTone"
          />
        </mcs-stats-grid>
        <div ref="tableWrapRef" class="table-box">
          <el-table
            v-loading="loading"
            :data="tableData"
            :size="tableSize"
            :height="tableHeight"
            border
            @selection-change="tableSelectionChange"
          >
            <template #empty>
              <mcs-table-empty />
            </template>
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column
              type="index"
              label="序号"
              width="72"
              align="center"
              :index="(index) => (form.page - 1) * form.pageSize + index + 1"
            />
            <el-table-column label="名称" min-width="180" align="center" show-overflow-tooltip>
              <template #default="scope">
                <el-button link type="primary" @click="goDetailPage(scope.row)">
                  {{ scope.row.name || '--' }}
                </el-button>
              </template>
            </el-table-column>
            <el-table-column prop="code" label="编码" width="140" align="center" show-overflow-tooltip />
            <el-table-column label="分类" width="120" align="center">
              <template #default="scope">{{ resolveCategoryLabel(scope.row.category) }}</template>
            </el-table-column>
            <el-table-column label="状态" width="110" align="center">
              <template #default="scope">
                <mcs-status-tag
                  :text="resolveStatus(scope.row.status).label"
                  :type="resolveStatus(scope.row.status).tone"
                />
              </template>
            </el-table-column>
            <el-table-column label="完成进度" min-width="180" align="center">
              <template #default="scope">
                <div class="progress-cell">
                  <el-progress :percentage="toPercentage(scope.row.progress)" :stroke-width="8" :show-text="false" />
                  <span class="progress-cell__text">{{ toPercentage(scope.row.progress) }}%</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="备注" min-width="160" align="center" show-overflow-tooltip>
              <template #default="scope">
                <span :class="{ 'cell-muted': !scope.row.remarks }">{{ scope.row.remarks || '--' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="170" align="center" show-overflow-tooltip />
            <el-table-column label="操作" width="240" align="center" fixed="right">
              <template #default="scope">
                <el-button link type="primary" size="small" @click="openDetailDrawer(scope.row)">详情</el-button>
                <el-button link type="primary" size="small" @click="openEditDialog(scope.row)">编辑</el-button>
                <el-button link type="primary" size="small" @click="openEditDrawer(scope.row)">抽屉编辑</el-button>
                <el-button link type="danger" size="small" @click="deleteById(scope.row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div v-if="total > 0" class="pagination-box">
          <el-pagination
            v-model:current-page="form.page"
            v-model:page-size="form.pageSize"
            popper-class="pages-popper"
            :total="total"
            layout="total, prev, pager, next, jumper, sizes"
            :page-sizes="[10, 20, 30, 40, 50, 100]"
            @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
          />
        </div>
      </section>
    </div>
    <demo-form-dialog v-model="dialogVisible" :demo-id="editId" @success="refreshAll" />
    <demo-form-drawer v-model="drawerVisible" :demo-id="editId" @success="refreshAll" />
    <demo-detail-drawer v-model="detailDrawerVisible" :demo-id="detailId" @edit="onDetailDrawerEdit" />
  </div>
</template>

<script setup>
import { computed, nextTick, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import Pager from '@/hooks/pager.js'
import { useAutoTableHeight } from '@/hooks/useAutoTableHeight'
import DemoFormDialog from './components/DemoFormDialog.vue'
import DemoFormDrawer from './components/DemoFormDrawer.vue'
import DemoDetailDrawer from './components/DemoDetailDrawer.vue'
import { DEMO_CATEGORY_OPTIONS, DEMO_STATUS_OPTIONS, resolveCategoryLabel, resolveStatus } from './constants'
import { DEMO_DETAIL, DEMO_FORM } from './routePaths'
import * as HTTP from './api/demo.js'

const router = useRouter()
const {
  tableSize,
  form,
  loading,
  tableData,
  total,
  findPage,
  findSearch,
  selectIds,
  tableSelectionChange,
  handleCurrentChange,
  handleSizeChange,
  deleteById,
  deleteBatch
} = Pager(HTTP)
const { tableWrapRef, tableHeight, updateTableHeight } = useAutoTableHeight({ watchSources: [total] })
const statsLoading = ref(false)
const statistics = reactive({ totalCount: 0, runningCount: 0, doneCount: 0, avgProgress: 0 })
const dialogVisible = ref(false)
const drawerVisible = ref(false)
const detailDrawerVisible = ref(false)
const editId = ref('')
const detailId = ref('')

const kpiCards = computed(() => [
  {
    key: 'total',
    tone: 'blue',
    valTone: 'primary',
    icon: '总',
    label: '示例总数',
    value: String(statistics.totalCount ?? 0),
    sub: '全部记录'
  },
  {
    key: 'running',
    tone: 'orange',
    valTone: 'warning',
    icon: '行',
    label: '进行中',
    value: String(statistics.runningCount ?? 0),
    sub: '需持续跟进'
  },
  {
    key: 'done',
    tone: 'green',
    valTone: 'success',
    icon: '完',
    label: '已完成',
    value: String(statistics.doneCount ?? 0),
    sub: '本周期累计'
  },
  {
    key: 'progress',
    tone: 'teal',
    valTone: 'teal',
    icon: '率',
    label: '平均完成率',
    value: `${toPercentage(statistics.avgProgress)}%`,
    sub: '按进度均值'
  }
])

// 筛选默认值集中一处：Pager 的 reset 会清空 form 全部 key，页面自带默认筛选时改用本地重置
function defaultQuery() {
  return {
    keyword: '',
    status: '',
    category: '',
    createTimeRange: []
  }
}

function handleReset() {
  Object.assign(form, defaultQuery())
  findSearch()
}

function refreshAll() {
  loadStatistics()
  findPage()
}

function loadStatistics() {
  statsLoading.value = true
  HTTP.findStatistics(form)
    .then((res) => {
      const data = res?.data || {}
      Object.assign(statistics, {
        totalCount: data.totalCount ?? 0,
        runningCount: data.runningCount ?? 0,
        doneCount: data.doneCount ?? 0,
        avgProgress: data.avgProgress ?? 0
      })
    })
    .catch(() => {
      Object.assign(statistics, { totalCount: 0, runningCount: 0, doneCount: 0, avgProgress: 0 })
    })
    .finally(() => {
      statsLoading.value = false
      nextTick(() => updateTableHeight())
    })
}

function openCreateDialog() {
  editId.value = ''
  dialogVisible.value = true
}

function openEditDialog(row) {
  editId.value = row?.id != null ? String(row.id) : ''
  dialogVisible.value = true
}

function openEditDrawer(row) {
  editId.value = row?.id != null ? String(row.id) : ''
  drawerVisible.value = true
}

function openDetailDrawer(row) {
  if (row?.id == null) return
  detailId.value = String(row.id)
  detailDrawerVisible.value = true
}

function onDetailDrawerEdit(id) {
  detailDrawerVisible.value = false
  editId.value = String(id)
  drawerVisible.value = true
}

function goCreatePage() {
  router.push({ path: DEMO_FORM })
}

function goDetailPage(row) {
  if (row?.id == null) return
  router.push({ path: DEMO_DETAIL, query: { id: String(row.id) } })
}

// 进度字段可能是 0~1 的小数或 0~100 的百分数，统一收敛到 0~100 整数
function toPercentage(value) {
  const num = Number(value)
  if (!Number.isFinite(num) || num <= 0) return 0
  const percent = num <= 1 ? num * 100 : num
  return Math.min(100, Math.round(percent))
}

Object.assign(form, defaultQuery())
refreshAll()
</script>
