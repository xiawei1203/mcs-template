<template>
  <el-popover
    :visible="popoverVisible"
    trigger="click"
    placement="bottom-start"
    :width="width"
    :disabled="disabled"
    :teleported="teleported"
    popper-class="mcs-user-picker__popper"
    @update:visible="onVisibleChange"
    @show="onShow"
  >
    <template #reference>
      <el-input
        :model-value="displayName"
        :placeholder="placeholder"
        :disabled="disabled"
        readonly
        class="mcs-user-picker__input"
      >
        <template #suffix>
          <el-icon v-if="displayName && !disabled && clearable" class="mcs-user-picker__clear" @click.stop.prevent="onClear">
            <CircleClose />
          </el-icon>
          <el-icon v-else class="mcs-user-picker__arrow">
            <ArrowDown />
          </el-icon>
        </template>
      </el-input>
    </template>
    <div class="mcs-user-picker" @click.stop>
      <div class="mcs-user-picker__side">
        <div class="mcs-user-picker__header">部门</div>
        <el-scrollbar height="260px">
          <div class="mcs-user-picker__tree-wrap">
            <div v-if="orgLoading" class="mcs-user-picker__empty">部门加载中...</div>
            <el-tree
              v-else-if="orgTreeData.length"
              class="mcs-user-picker__tree"
              :data="orgTreeData"
              node-key="id"
              :props="orgTreeProps"
              :current-node-key="activeOrgId"
              highlight-current
              default-expand-all
              @node-click="onOrgNodeClick"
            />
            <div v-else class="mcs-user-picker__empty">暂无部门</div>
          </div>
        </el-scrollbar>
      </div>
      <div class="mcs-user-picker__main">
        <el-input v-model="keyword" clearable size="small" placeholder="搜索姓名/账号" class="mcs-user-picker__search" />
        <el-scrollbar height="222px">
          <div class="mcs-user-picker__list">
            <div v-if="userLoading" class="mcs-user-picker__empty">人员加载中...</div>
            <template v-else>
              <button
                v-for="user in filteredUsers"
                :key="user.userId"
                type="button"
                class="mcs-user-item"
                :class="{ 'is-active': user.userId === selectedUserId }"
                @click="onUserSelect(user)"
              >
                <span class="mcs-user-item__name">{{ user.userName }}</span>
                <span v-if="user.username && user.username !== user.userName" class="mcs-user-item__account">
                  {{ user.username }}
                </span>
              </button>
              <div v-if="!filteredUsers.length" class="mcs-user-picker__empty">暂无匹配人员</div>
            </template>
          </div>
        </el-scrollbar>
      </div>
    </div>
  </el-popover>
</template>

<script>
export default { name: 'McsUserPicker' }
</script>

<script setup>
/* global defineProps, defineEmits */
import { computed, ref, watch } from 'vue'
import { ArrowDown, CircleClose } from '@element-plus/icons-vue'
import { useOrgUsers } from '@/hooks/useOrgUsers'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  displayName: { type: String, default: '' },
  placeholder: { type: String, default: '请选择负责人' },
  width: { type: [String, Number], default: 520 },
  disabled: { type: Boolean, default: false },
  clearable: { type: Boolean, default: true },
  /** 滚动容器内（如固定高度弹框）应关闭 teleport，避免面板与触发器错位 */
  teleported: { type: Boolean, default: true }
})
const emit = defineEmits(['update:modelValue', 'update:displayName', 'select'])

const {
  orgTreeProps,
  orgLoading,
  orgTreeData,
  activeOrgId,
  keyword,
  userLoading,
  filteredUsers,
  load,
  onOrgNodeClick
} = useOrgUsers()

const popoverVisible = ref(false)
const selectedUserId = computed(() => String(props.modelValue == null ? '' : props.modelValue))

watch(
  () => props.disabled,
  (value) => {
    if (value) popoverVisible.value = false
  }
)

function onVisibleChange(value) {
  popoverVisible.value = props.disabled ? false : !!value
}

async function onShow() {
  await load()
}

function onUserSelect(user) {
  if (!user) return
  emit('update:modelValue', user.userId)
  emit('update:displayName', user.userName)
  emit('select', { ...user })
  popoverVisible.value = false
}

function onClear() {
  emit('update:modelValue', '')
  emit('update:displayName', '')
  emit('select', null)
  popoverVisible.value = false
}
</script>

<style lang="scss" scoped>
.mcs-user-picker__input {
  width: 100%;
  cursor: pointer;
}
.mcs-user-picker__clear,
.mcs-user-picker__arrow {
  color: var(--mcs-text-placeholder);
  cursor: pointer;
}
.mcs-user-picker {
  display: flex;
  gap: var(--mcs-gap-sm);
}
.mcs-user-picker__side {
  width: 200px;
  flex: none;
  border-right: 1px solid var(--mcs-border-lighter);
  padding-right: var(--mcs-gap-sm);
}
.mcs-user-picker__header {
  font-size: 13px;
  color: var(--mcs-text-secondary);
  padding-bottom: var(--mcs-gap-xs);
}
.mcs-user-picker__main {
  flex: 1;
  min-width: 0;
}
.mcs-user-picker__search {
  margin-bottom: var(--mcs-gap-xs);
}
.mcs-user-picker__empty {
  padding: var(--mcs-gap-md) 0;
  text-align: center;
  font-size: 13px;
  color: var(--mcs-text-placeholder);
}
.mcs-user-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--mcs-gap-xs);
  width: 100%;
  padding: 7px 10px;
  border: none;
  border-radius: var(--mcs-radius-sm);
  background: transparent;
  color: var(--mcs-text-regular);
  font-size: 13px;
  text-align: left;
  cursor: pointer;
}
.mcs-user-item:hover {
  background: var(--mcs-fill-light);
}
.mcs-user-item.is-active {
  background: var(--mcs-brand-light);
  color: var(--mcs-brand);
}
.mcs-user-item__account {
  color: var(--mcs-text-placeholder);
}
</style>
