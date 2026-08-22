<template>
  <mcs-drawer
    :model-value="modelValue"
    :title="isEdit ? '编辑示例' : '新增示例'"
    :loading="loading"
    :confirm-loading="submitting"
    @update:model-value="onVisibleChange"
    @open="onOpen"
    @confirm="onConfirm"
  >
    <mcs-section-card title="基本信息">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="状态" prop="status">
          <mcs-tag-select v-model="form.status" :options="DEMO_STATUS_OPTIONS" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入名称" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="编码" prop="code">
              <el-input v-model="form.code" :disabled="isEdit" placeholder="请输入编码" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-select v-model="form.category" placeholder="请选择分类">
                <el-option
                  v-for="item in DEMO_CATEGORY_OPTIONS"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="完成进度（%）" prop="progress">
              <el-input-number v-model="form.progress" :min="0" :max="100" :precision="0" :controls="false" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </mcs-section-card>
    <mcs-section-card title="归属信息">
      <el-form :model="form" label-position="top">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="所属部门">
              <el-select v-model="form.deptId" filterable clearable placeholder="请选择部门" @change="onDeptChange">
                <el-option v-for="item in orgOptions" :key="item.id" :label="item.label" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人">
              <el-select
                v-model="form.ownerId"
                filterable
                clearable
                :disabled="!form.deptId"
                :loading="userLoading"
                placeholder="请先选择部门"
                @visible-change="(visible) => visible && ensureUsers(form.deptId)"
              >
                <el-option
                  v-for="user in userOptions"
                  :key="user.id"
                  :label="resolveUserLabel(user)"
                  :value="String(user.id)"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="form.remarks" type="textarea" :rows="4" maxlength="500" show-word-limit placeholder="请输入备注" />
        </el-form-item>
      </el-form>
    </mcs-section-card>
  </mcs-drawer>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { flattenOrganizationTree, getOrganizationTree } from '@/api/common/organization'
import { findUserList, resolveUserLabel } from '@/api/common/user'
import { useDemoForm } from '../useDemoForm'
import { DEMO_CATEGORY_OPTIONS, DEMO_STATUS_OPTIONS } from '../constants'

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
const emit = defineEmits(['update:modelValue', 'success'])
const { formRef, form, rules, loading, submitting, prepare, submit } = useDemoForm()
const orgOptions = ref([])
const userCache = reactive({})
const userLoadingMap = reactive({})

const isEdit = computed(() => !!props.demoId)
const userOptions = computed(() => userCache[deptKey()] || [])
const userLoading = computed(() => !!userLoadingMap[deptKey()])

function deptKey() {
  return String(form.deptId || '').trim()
}

async function onOpen() {
  loadOrgOptions()
  await prepare(props.demoId)
  if (deptKey()) {
    ensureUsers(form.deptId)
  }
}

function loadOrgOptions() {
  if (orgOptions.value.length) return
  getOrganizationTree()
    .then((res) => {
      orgOptions.value = flattenOrganizationTree(Array.isArray(res?.data) ? res.data : [])
    })
    .catch(() => {
      orgOptions.value = []
    })
}

// 部门下人员按 deptId 缓存，避免同一抽屉内反复请求
function ensureUsers(deptId) {
  const key = String(deptId || '').trim()
  if (!key || userLoadingMap[key] || Array.isArray(userCache[key])) return
  userLoadingMap[key] = true
  findUserList({ organizationId: key })
    .then((res) => {
      userCache[key] = Array.isArray(res?.data?.rows) ? res.data.rows : []
    })
    .catch(() => {
      userCache[key] = []
    })
    .finally(() => {
      userLoadingMap[key] = false
    })
}

function onDeptChange() {
  form.ownerId = ''
  form.ownerName = ''
  if (deptKey()) {
    ensureUsers(form.deptId)
  }
}

function onVisibleChange(value) {
  emit('update:modelValue', value)
}

// 提交前把选中项的名称一并带上，列表与详情无需再查字典
function onConfirm() {
  const dept = orgOptions.value.find((item) => item.id === deptKey())
  const owner = userOptions.value.find((item) => String(item.id) === String(form.ownerId || ''))
  form.deptName = dept ? dept.name : ''
  form.ownerName = owner ? resolveUserLabel(owner) : ''
  submit(() => {
    emit('success')
    emit('update:modelValue', false)
  })
}
</script>
