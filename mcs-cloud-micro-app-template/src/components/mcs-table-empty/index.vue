<template>
  <div class="mcs-table-empty">
    <el-empty :description="description" :image-size="imageSize" />
  </div>
</template>

<script setup>
defineProps({
  description: {
    type: String,
    default: '暂无数据'
  },
  imageSize: {
    type: Number,
    default: 80
  }
})
</script>

<style lang="scss" scoped>
.mcs-table-empty {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 12px;
  box-sizing: border-box;
}
</style>
