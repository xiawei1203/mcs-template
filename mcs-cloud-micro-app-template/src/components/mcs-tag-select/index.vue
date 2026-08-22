<template>
  <div class="mcs-tag-group">
    <button
      v-for="item in options"
      :key="item.value"
      type="button"
      class="mcs-tag"
      :class="{ 'is-active': isActive(item.value), 'is-disabled': disabled || item.disabled }"
      :disabled="disabled || item.disabled"
      @click="toggle(item)"
    >
      {{ item.label }}
    </button>
  </div>
</template>

<script setup>
/**
 * 标签式选择器，替代小数量选项的 el-radio-group / el-checkbox-group，视觉与列表页筛选标签统一。
 * options: [{ label, value, disabled }]
 */
const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean, Array],
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  multiple: {
    type: Boolean,
    default: false
  },
  // 单选模式下再次点击已选项是否取消选中
  clearable: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['update:modelValue', 'change'])

function isActive(value) {
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.includes(value)
  }
  return props.modelValue === value
}

// 多选维护数组副本，单选按 clearable 决定是否允许反选，避免直接改 props
function toggle(item) {
  if (props.disabled || item.disabled) return
  let next
  if (props.multiple) {
    const current = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const index = current.indexOf(item.value)
    if (index > -1) {
      current.splice(index, 1)
    } else {
      current.push(item.value)
    }
    next = current
  } else {
    if (props.modelValue === item.value) {
      if (!props.clearable) return
      next = ''
    } else {
      next = item.value
    }
  }
  emit('update:modelValue', next)
  emit('change', next)
}
</script>
