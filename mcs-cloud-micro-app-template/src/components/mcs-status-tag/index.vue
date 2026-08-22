<template>
  <span class="status-dot" :class="`is-${type}`">
    <slot>{{ text || placeholder }}</slot>
  </span>
</template>

<script setup>
defineProps({
  text: {
    type: [String, Number],
    default: ''
  },
  // info 灰 / primary 蓝 / success 绿 / warning 橙 / danger 红
  type: {
    type: String,
    default: 'info'
  },
  placeholder: {
    type: String,
    default: '--'
  }
})
</script>
