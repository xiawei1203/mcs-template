<template>
  <div class="page-container mcs-page">
    <mcs-title :title="isEdit ? '编辑示例' : '新增示例'" :border="true">
      <template #right>
        <el-button plain @click="goList">返回列表</el-button>
      </template>
    </mcs-title>
    <div v-loading="loading" class="page-body page-body--scroll">
      <mcs-section-card title="基本信息">
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="名称" prop="name">
                <el-input v-model="form.name" placeholder="请输入名称" maxlength="100" show-word-limit />
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
          <el-form-item label="状态" prop="status">
            <mcs-tag-select v-model="form.status" :options="DEMO_STATUS_OPTIONS" />
          </el-form-item>
          <el-form-item label="备注" prop="remarks">
            <el-input v-model="form.remarks" type="textarea" :rows="4" maxlength="500" show-word-limit placeholder="请输入备注" />
          </el-form-item>
        </el-form>
      </mcs-section-card>
      <mcs-section-card title="富文本与附件">
        <el-form :model="form" label-position="top">
          <el-form-item label="封面图">
            <mcs-uploader v-model="form.coverFile" group-id="demo" list-type="picture" :limit="1" />
          </el-form-item>
          <el-form-item label="详细说明">
            <mcs-editor v-model="form.content" group-id="demo" editor-height="320px" />
          </el-form-item>
        </el-form>
      </mcs-section-card>
    </div>
    <div class="page-footer">
      <el-button @click="goList">取消</el-button>
      <el-button type="mcs" :loading="submitting" @click="onSubmit">保存</el-button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDemoForm } from '../useDemoForm'
import { DEMO_CATEGORY_OPTIONS, DEMO_STATUS_OPTIONS } from '../constants'
import { DEMO_LIST } from '../routePaths'

const route = useRoute()
const router = useRouter()
const { formRef, form, rules, loading, submitting, prepare, submit } = useDemoForm()

const isEdit = computed(() => !!route.query.id)

onMounted(() => {
  prepare(route.query.id)
})

function onSubmit() {
  submit(() => goList())
}

// 微前端嵌套场景下 router.go(-1) 行为不稳定，统一按 routePaths 常量回列表
function goList() {
  router.push({ path: DEMO_LIST })
}
</script>
