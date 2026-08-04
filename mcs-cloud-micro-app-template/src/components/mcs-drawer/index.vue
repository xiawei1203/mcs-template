<template>
  <el-drawer
    :model-value="modelValue"
    :title="title"
    :size="size"
    :direction="direction"
    :destroy-on-close="destroyOnClose"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :append-to-body="appendToBody"
    :class="['mcs-drawer', drawerClass]"
    @update:model-value="onVisibleChange"
    @open="emit('open')"
    @opened="emit('opened')"
    @close="emit('close')"
    @closed="emit('closed')"
  >
    <template v-if="$slots.header" #header="scope">
      <slot name="header" v-bind="scope"></slot>
    </template>
    <div class="drawer-body" v-loading="loading">
      <slot></slot>
    </div>
    <template v-if="showFooter" #footer>
      <slot name="footer">
        <el-button @click="onCancel">{{ cancelText }}</el-button>
        <el-button type="mcs" :loading="confirmLoading" :disabled="confirmDisabled" @click="emit('confirm')">
          {{ confirmText }}
        </el-button>
      </slot>
    </template>
  </el-drawer>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  size: {
    type: [String, Number],
    default: '750px'
  },
  direction: {
    type: String,
    default: 'rtl'
  },
  destroyOnClose: {
    type: Boolean,
    default: true
  },
  closeOnClickModal: {
    type: Boolean,
    default: true
  },
  closeOnPressEscape: {
    type: Boolean,
    default: true
  },
  appendToBody: {
    type: Boolean,
    default: false
  },
  drawerClass: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  showFooter: {
    type: Boolean,
    default: true
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  confirmText: {
    type: String,
    default: '确认保存'
  },
  confirmLoading: {
    type: Boolean,
    default: false
  },
  confirmDisabled: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['update:modelValue', 'confirm', 'cancel', 'open', 'opened', 'close', 'closed'])

function onVisibleChange(value) {
  emit('update:modelValue', value)
}

function onCancel() {
  emit('cancel')
  emit('update:modelValue', false)
}
</script>
