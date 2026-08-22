<template>
  <div class="mcs-search">
    <el-form :inline="true" label-width="90" class="demo-form-inline" @submit.native.prevent>
      <el-form-item label="" label-width="0" class="normal-search">
        <!-- 功能按钮 -->
        <div class="export-btns">
          <slot name="functionButton"></slot>
        </div>
        <!-- 默认搜索框 -->
        <slot>
          <el-input v-model="defaultInputValue" :placeholder="placeholder" :suffix-icon="Search" clearable @change="findPage"  />
        </slot>
        <el-button v-if="showAdvancedSearch" plain @click="showAdvance = !showAdvance">
          高级搜索
          <ArrowUp v-if="showAdvance" />
          <ArrowDown v-else />
        </el-button>
        <el-tooltip v-if="showTableHeight"  effect="dark"  content="表格高度"  placement="top-start">
          <el-dropdown placement="bottom-start" trigger="click" @command="handleCommand">
            <div class="table-height">
                <img src="./table-height.jpg" alt="">
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="large">高</el-dropdown-item>
                <el-dropdown-item command="default">中</el-dropdown-item>
                <el-dropdown-item command="small">低</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-tooltip>
      </el-form-item>
      <!-- 条件搜索 -->
      <div v-if="showAdvance" class="advanced-search">
        <div
          class="advanced-search-fields"
          :style="{ '--advanced-columns': Props.advancedSearchColumns }"
        >
          <slot name="advanceSearch"></slot>
        </div>
        <div class="search-btns">
          <el-button @click="reset()">重置</el-button>
          <el-button type="mcs" @click="findPage()">搜索</el-button>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import { Search, ArrowDown, ArrowUp } from '@element-plus/icons-vue';
//const name = defineModel();

const Props = defineProps({
  modelValue:{
    type:String
  },
  placeholder: {
    type: String,
    default: '请输入'
  },
  showAdvancedSearch: { // 是否显示高级搜索
    type: Boolean,
    default: true
  },
  showTableHeight: { // 是否显示表格高度
    type: Boolean,
    default: true
  },
  defaultExpandAdvanced: { // 是否默认展开高级搜索
    type: Boolean,
    default: false
  },
  advancedSearchColumns: { // 高级搜索列数
    type: Number,
    default: 3
  }
})
const Emits = defineEmits(['change', 'reset',"update:modelValue"]);

const showAdvance = ref(Props.defaultExpandAdvanced); // 显示隐藏高级搜索项
const defaultInputValue=ref(Props.modelValue)

function findPage() {
  Emits('update:modelValue',defaultInputValue.value);
  Emits('change');
}

function reset() {
  Emits('reset');
}

function handleCommand(command){
  Emits('tableHeightCommand',command)
}

</script>
<style lang="scss" scoped>
.table-height-popper{
  background-color: aqua !important;
}

.mcs-search{
  width: 100%;
  /* 左右内边距必须算进宽度，否则 width:100% 会撑破父容器 */
  box-sizing: border-box;
  padding: 20px 20px 0;
  .table-height{
    display: flex;
    margin-left: 10px;
    width: 32px;
    height: 32px;
    border: var(--el-border-color) solid 1px;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
  :deep(.demo-form-inline){
    .normal-search{
      width: 100%;
      margin-right: 0;
      margin-bottom: 10px;
      .el-form-item__content{
        display: flex;
        justify-content: right;
        .export-btns{
          position: absolute;
          left: -10px;
          top: 0;
        }
        .el-input{
          width: 350px;
        }
        .el-button{
          margin-left: 10px;
          svg{
            width: 16px;
            height: 16px;
            margin-left: 3px;
          }
        }
      }
    }
    .advanced-search{
      width: 100%;
      padding-top: 20px;
      padding-left: 20px;
      padding-right: 20px;
      display: flex;
      align-items: flex-start;
      background-color: var(--el-fill-color-lighter);
      margin-bottom: 15px;
      .advanced-search-fields {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(var(--advanced-columns), minmax(0, 1fr));
        column-gap: 32px;
        row-gap: 16px;
        :deep(.el-form-item) {
          display: flex;
          width: 100%;
          margin-right: 0;
          margin-bottom: 0;
          vertical-align: top;
          .el-form-item__label {
            text-align: right;
            flex-shrink: 0;
          }
          .el-form-item__content {
            flex: 1;
            min-width: 0;
            .el-input,
            .el-select,
            .el-cascader,
            .el-date-editor {
              width: 100%;
            }
          }
        }
      }
      .search-btns{
        flex-shrink: 0;
        min-width: 145px;
        padding-top: 0;
        text-align: right;
      }
    }
    .advanced-show{
      height: auto;
    }
  }

}
</style>