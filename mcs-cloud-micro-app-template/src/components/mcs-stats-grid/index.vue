<template>
  <div v-loading="loading" class="stats-grid" :class="`stats-grid--${columns}`">
    <slot></slot>
  </div>
</template>

<script setup>
/**
 * KPI 卡容器，样式定义在 src/styles/page-shell.scss，需放在 `page-container mcs-page` 内使用。
 * 列数支持 2~5，窄屏自动降为 2 列。
 */
defineProps({
  columns: {
    type: Number,
    default: 4
  },
  loading: {
    type: Boolean,
    default: false
  }
})
</script>
