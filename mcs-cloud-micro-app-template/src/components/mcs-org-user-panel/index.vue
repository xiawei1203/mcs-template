<template>
  <div class="org-user-select">
    <aside class="org-user-select__side">
      <div class="org-user-select__side-title">组织架构</div>
      <el-scrollbar class="org-user-select__scroll">
        <div class="org-user-select__tree-wrap">
          <div v-if="orgLoading" class="org-user-select__empty">加载中...</div>
          <el-tree
            v-else-if="orgTreeData.length"
            class="org-user-select__tree"
            :data="orgTreeData"
            node-key="id"
            :props="orgTreeProps"
            :current-node-key="activeOrgId"
            highlight-current
            default-expand-all
            @node-click="onOrgNodeClick"
          >
            <template #default="{ data }">
              <span class="org-tree-node" :title="data.name">{{ data.name }}</span>
            </template>
          </el-tree>
          <div v-else class="org-user-select__empty">暂无部门</div>
        </div>
      </el-scrollbar>
    </aside>
    <section class="org-user-select__main">
      <div class="org-user-select__toolbar">
        <el-input
          v-model="keyword"
          clearable
          size="default"
          placeholder="搜索姓名或账号"
          class="org-user-select__search"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <div class="org-user-select__toolbar-meta">
          <span>{{ activeOrgName || '请选择部门' }}</span>
          <span v-if="activeOrgName">（{{ filteredUsers.length }}）</span>
          <span v-if="mode === 'checkbox' && selectedMap.size" class="org-user-select__selected">
            已选 {{ selectedMap.size }} 人
          </span>
        </div>
      </div>
      <el-scrollbar class="org-user-select__scroll">
        <div class="org-user-select__list">
          <div v-if="userLoading" class="org-user-select__empty">加载中...</div>
          <template v-else-if="filteredUsers.length">
            <div
              v-for="user in filteredUsers"
              :key="user.userId"
              class="org-user-row"
              :class="{
                'is-active': isSelected(user.userId),
                'is-disabled': isDisabled(user.userId)
              }"
              @click="onCardClick(user)"
            >
              <span class="org-user-row__control" @click.stop>
                <el-radio
                  v-if="mode === 'radio'"
                  :model-value="selectedId"
                  :label="user.userId"
                  :disabled="isDisabled(user.userId)"
                  @change="onRadioSelect(user)"
                />
                <el-checkbox
                  v-else
                  :model-value="isSelected(user.userId)"
                  :disabled="isDisabled(user.userId) || isLocked(user.userId)"
                  @change="(checked) => onCheckSelect(user, checked)"
                />
              </span>
              <span class="org-user-row__avatar" :class="`tone-${avatarTone(user.userName)}`">
                {{ avatarText(user.userName) }}
              </span>
              <span class="org-user-row__info">
                <span class="org-user-row__name">
                  {{ user.userName }}
                  <span v-if="isLocked(user.userId)" class="org-user-row__tag">{{ lockedTagText }}</span>
                  <span v-else-if="isDisabled(user.userId)" class="org-user-row__tag is-muted">{{ disabledTagText }}</span>
                </span>
                <span class="org-user-row__desc">{{ formatUserDesc(user) }}</span>
              </span>
            </div>
          </template>
          <div v-else class="org-user-select__empty">暂无人员</div>
        </div>
      </el-scrollbar>
    </section>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useOrgUsers } from '@/hooks/useOrgUsers'

const props = defineProps({
  /** radio | checkbox */
  mode: { type: String, default: 'radio' },
  /** 单选选中的 userId */
  modelValue: { type: [String, Number], default: '' },
  /** 多选选中的用户对象列表 */
  selectedUsers: { type: Array, default: () => [] },
  /** 已占用等不可选 userId */
  excludeUserIds: { type: Array, default: () => [] },
  /** 锁定不可取消的 userId */
  lockedUserIds: { type: Array, default: () => [] },
  lockedTagText: { type: String, default: '已锁定' },
  disabledTagText: { type: String, default: '不可选' }
})

const emit = defineEmits(['update:modelValue', 'update:selectedUsers', 'select'])

const {
  orgTreeProps,
  orgLoading,
  orgTreeData,
  activeOrgId,
  activeOrgName,
  keyword,
  userLoading,
  filteredUsers,
  load,
  onOrgNodeClick
} = useOrgUsers()

const selectedId = computed(() => String(props.modelValue == null ? '' : props.modelValue))
const excludeSet = computed(() => new Set((props.excludeUserIds || []).map((id) => String(id))))
const lockedSet = computed(() => new Set((props.lockedUserIds || []).map((id) => String(id))))
const selectedMap = computed(() => {
  const map = new Map()
  const selected = props.selectedUsers || []
  selected.forEach((user) => {
    if (user && user.userId != null) map.set(String(user.userId), user)
  })
  return map
})

watch(
  () => props.mode,
  () => {
    keyword.value = ''
  }
)

function avatarText(name) {
  const text = String(name || '').trim()
  return text ? text.slice(-1) : '?'
}

function avatarTone(name) {
  const text = String(name || '')
  let hash = 0
  for (let i = 0; i < text.length; i += 1) {
    hash += text.charCodeAt(i)
  }
  return hash % 4
}

function formatUserDesc(user) {
  const parts = []
  if (user.deptName) parts.push(user.deptName)
  if (user.phone) parts.push(user.phone)
  else if (user.username) parts.push(user.username)
  return parts.join(' / ') || '暂无联系方式'
}

function isSelected(userId) {
  const id = String(userId)
  if (props.mode === 'radio') return id === selectedId.value
  return selectedMap.value.has(id)
}

function isDisabled(userId) {
  return excludeSet.value.has(String(userId))
}

function isLocked(userId) {
  return lockedSet.value.has(String(userId))
}

function onRadioSelect(user) {
  if (!user || isDisabled(user.userId)) return
  emit('update:modelValue', user.userId)
  emit('select', { ...user })
}

function onCheckSelect(user, checked) {
  if (!user || isDisabled(user.userId) || isLocked(user.userId)) return
  const next = new Map(selectedMap.value)
  if (checked) next.set(String(user.userId), { ...user })
  else next.delete(String(user.userId))
  emit('update:selectedUsers', Array.from(next.values()))
}

function onCardClick(user) {
  if (isDisabled(user.userId)) return
  if (props.mode === 'radio') {
    onRadioSelect(user)
    return
  }
  if (isLocked(user.userId)) return
  onCheckSelect(user, !isSelected(user.userId))
}

load()

defineExpose({ load })
</script>

<style lang="scss" scoped>
.org-user-select {
  display: flex;
  min-height: 360px;
  border: 1px solid var(--mcs-border-lighter);
  border-radius: var(--mcs-radius-sm);
  overflow: hidden;
}
.org-user-select__side {
  width: 220px;
  flex: none;
  border-right: 1px solid var(--mcs-border-lighter);
  background: var(--mcs-fill-lighter);
}
.org-user-select__side-title {
  padding: 12px 14px 8px;
  font-size: 13px;
  color: var(--mcs-text-secondary);
}
.org-user-select__scroll {
  height: 320px;
}
.org-user-select__tree-wrap {
  padding: 0 8px 12px;
}
.org-tree-node {
  display: inline-block;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.org-user-select__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.org-user-select__toolbar {
  padding: 12px 14px 8px;
}
.org-user-select__search {
  width: 100%;
}
.org-user-select__toolbar-meta {
  margin-top: 8px;
  font-size: 12px;
  color: var(--mcs-text-secondary);
}
.org-user-select__selected {
  margin-left: 8px;
  color: var(--mcs-brand);
}
.org-user-select__list {
  padding: 0 14px 12px;
}
.org-user-select__empty {
  padding: 32px 0;
  text-align: center;
  font-size: 13px;
  color: var(--mcs-text-placeholder);
}
.org-user-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: var(--mcs-radius-sm);
  cursor: pointer;
}
.org-user-row:hover {
  background: var(--mcs-fill-light);
}
.org-user-row.is-active {
  background: var(--mcs-brand-light);
}
.org-user-row.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.org-user-row__control {
  flex: none;
}
.org-user-row__avatar {
  flex: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--mcs-card-bg);
  font-size: 13px;
}
.org-user-row__avatar.tone-0 { background: var(--mcs-brand); }
.org-user-row__avatar.tone-1 { background: var(--mcs-teal); }
.org-user-row__avatar.tone-2 { background: var(--mcs-warning); }
.org-user-row__avatar.tone-3 { background: var(--mcs-purple); }
.org-user-row__info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.org-user-row__name {
  font-size: 14px;
  color: var(--mcs-text-title);
}
.org-user-row__tag {
  margin-left: 6px;
  font-size: 12px;
  color: var(--mcs-brand);
}
.org-user-row__tag.is-muted {
  color: var(--mcs-text-placeholder);
}
.org-user-row__desc {
  font-size: 12px;
  color: var(--mcs-text-placeholder);
}
</style>
