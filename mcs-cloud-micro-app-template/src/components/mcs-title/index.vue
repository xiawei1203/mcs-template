<template>
    <div class="mcs-title" :style="{padding:`${padding}px 24px`}" :class="{ border_bottom: border}">
    <div style="display: flex; align-items: center">
      <div class="title">
        <div class="icon" ></div>
        {{ title }}
      </div>
      <slot name="left"></slot>
    </div>
    <!-- 定义右边内容 -->
    <div>
      <slot name="right"></slot>
    </div>
  </div>
</template>
  
<script setup>
import { ref, defineProps, computed,useSlots } from 'vue';
import { Search, ArrowDown } from '@element-plus/icons-vue';

const solts= useSlots()

const padding=computed(()=>{
    return solts.right?16:13
})

defineProps({
  border: {
    type: Boolean,
    default:false
  },
  title: {
    type: String,
    default: "表格标题"
  }
})


</script>

<style lang="scss" scoped>

.border_bottom {
    border-bottom: 1px solid var(--el-border-color);
 }
.mcs-title {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--el-bg-color);

  .title {
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: 31px;
    .icon {
      position: relative;
      top: 4px;
      margin-right: 10px;
      display: inline-block;
      width: 4px;
      height: 20px;
      background: linear-gradient(180deg, var(--el-color-mcs) 0, var(--el-color-mcs-light-9));
    }
  }
}
</style>