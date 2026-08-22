import { computed, nextTick, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as HTTP from './api/demo'

/**
 * 示例表单的共享逻辑（弹框表单与抽屉表单复用）
 *
 * 表单在多个容器（弹框 / 抽屉 / 独立表单页）中复用时，把「字段初值、校验规则、详情回填、提交」
 * 收敛到模块内的组合式函数，容器组件只负责布局与显隐，避免同一套逻辑复制多份。
 */
export function useDemoForm() {
  const formRef = ref(null)
  const form = reactive(emptyForm())
  const loading = ref(false)
  const submitting = ref(false)
  const isEdit = computed(() => !!form.id)

  const rules = {
    name: [
      { required: true, message: '请输入名称', trigger: 'blur' },
      { max: 100, message: '名称长度不能超过 100', trigger: 'blur' }
    ],
    code: [{ required: true, message: '请输入编码', trigger: 'blur' }],
    category: [{ required: true, message: '请选择分类', trigger: 'change' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }]
  }

  function emptyForm() {
    return {
      id: '',
      name: '',
      code: '',
      category: 'BASIC',
      status: 'DRAFT',
      progress: 0,
      deptId: '',
      deptName: '',
      ownerId: '',
      ownerName: '',
      coverFile: '',
      content: '',
      remarks: ''
    }
  }

  function resetForm() {
    Object.assign(form, emptyForm())
  }

  /**
   * 容器打开时调用：先复位再按需回填，最后清掉上一次残留的校验态
   * @param {string|number} [id] 有值为编辑
   */
  async function prepare(id) {
    resetForm()
    if (id) {
      await loadDetail(id)
    }
    await nextTick()
    formRef.value?.clearValidate?.()
  }

  async function loadDetail(id) {
    loading.value = true
    try {
      const res = await HTTP.findById(id)
      const data = res?.data || {}
      Object.assign(form, {
        id: data.id != null ? String(data.id) : '',
        name: data.name || '',
        code: data.code || '',
        category: data.category || 'BASIC',
        status: data.status || 'DRAFT',
        progress: Number(data.progress) || 0,
        deptId: data.deptId != null ? String(data.deptId) : '',
        deptName: data.deptName || '',
        ownerId: data.ownerId != null ? String(data.ownerId) : '',
        ownerName: data.ownerName || '',
        coverFile: data.coverFile || '',
        content: data.content || '',
        remarks: data.remarks || ''
      })
    } catch {
      // 错误提示由 request 拦截器统一处理
    } finally {
      loading.value = false
    }
  }

  /**
   * 校验并提交，成功后回调由容器决定关闭与刷新
   * @param {Function} [onSuccess]
   */
  function submit(onSuccess) {
    formRef.value?.validate(async (valid) => {
      if (!valid) return
      submitting.value = true
      try {
        const body = { ...form }
        if (body.id) {
          await HTTP.update(body)
          ElMessage.success('修改成功')
        } else {
          delete body.id
          await HTTP.insert(body)
          ElMessage.success('新增成功')
        }
        if (typeof onSuccess === 'function') {
          onSuccess()
        }
      } catch {
        // 错误提示由 request 拦截器统一处理
      } finally {
        submitting.value = false
      }
    })
  }

  return {
    formRef,
    form,
    rules,
    loading,
    submitting,
    isEdit,
    prepare,
    resetForm,
    submit
  }
}

export default useDemoForm
