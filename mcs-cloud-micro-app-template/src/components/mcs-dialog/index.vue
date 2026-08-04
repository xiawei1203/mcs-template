<template>
  <el-dialog
    :model-value="modelValue"
    :title="title"
    :width="width"
    :top="top"
    :align-center="alignCenter"
    :destroy-on-close="destroyOnClose"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :append-to-body="appendToBody"
    :class="['mcs-dialog', dialogClass]"
    @update:model-value="onVisibleChange"
    @open="emit('open')"
    @opened="emit('opened')"
    @close="emit('close')"
    @closed="emit('closed')"
  >
    <template v-if="$slots.header" #header="scope">
      <slot name="header" v-bind="scope"></slot>
    </template>
    <div class="dialog-body">
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
  </el-dialog>
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
  width: {
    type: [String, Number],
    default: '560px'
  },
  top: {
    type: String,
    default: undefined
  },
  alignCenter: {
    type: Boolean,
    default: true
  },
  destroyOnClose: {
    type: Boolean,
    default: true
  },
  closeOnClickModal: {
    type: Boolean,
    default: false
  },
  closeOnPressEscape: {
    type: Boolean,
    default: true
  },
  appendToBody: {
    type: Boolean,
    default: false
  },
  dialogClass: {
    type: String,
    default: ''
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
    default: '确认'
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
