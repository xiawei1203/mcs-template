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
        <el-form-item label="负责人">
          <mcs-user-picker
            v-model="form.ownerId"
            v-model:display-name="form.ownerName"
            placeholder="请选择负责人"
            :teleported="false"
            @select="onOwnerSelect"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remarks" type="textarea" :rows="4" maxlength="500" show-word-limit placeholder="请输入备注" />
        </el-form-item>
      </el-form>
    </mcs-section-card>
  </mcs-drawer>
</template>

<script setup>
import { computed } from 'vue'
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

const isEdit = computed(() => !!props.demoId)

async function onOpen() {
  await prepare(props.demoId)
}

function onOwnerSelect(user) {
  if (!user) {
    form.deptId = ''
    form.deptName = ''
    return
  }
  form.deptId = user.deptId || ''
  form.deptName = user.deptName || ''
}

function onVisibleChange(value) {
  emit('update:modelValue', value)
}

function onConfirm() {
  submit(() => {
    emit('success')
    emit('update:modelValue', false)
  })
}
</script>
