import { computed, reactive, ref } from 'vue'
import { getOrganizationTree } from '@/api/common/organization'
import { findUserList, resolveUserLabel } from '@/api/common/user'

/**
 * 组织树与部门人员缓存在模块级共享：选人器、选人面板打开多次或同时存在时，
 * 同一部门只请求一次，避免每个组件实例各自打接口。
 */
const sharedOrgTree = ref([])
const sharedOrgLoaded = ref(false)
const sharedOrgLoading = ref(false)
const userCache = reactive({})
const userLoadingMap = reactive({})

function flattenOrgNodes(list) {
  const out = []
  const walk = (nodes) => {
    if (!Array.isArray(nodes)) return
    nodes.forEach((node) => {
      if (!node) return
      const id = node.id != null ? String(node.id) : ''
      if (id) out.push({ id, name: node.name == null ? '' : String(node.name) })
      walk(node.children)
    })
  }
  walk(list)
  return out
}

/**
 * 组织 + 人员选择的共享数据与加载逻辑
 * @returns 组织树、当前部门人员列表、加载方法
 */
export function useOrgUsers() {
  const orgTreeProps = { label: 'name', children: 'children' }
  const activeOrgId = ref('')
  const keyword = ref('')

  const orgFlatList = computed(() => flattenOrgNodes(sharedOrgTree.value))
  const activeOrgName = computed(() => {
    return orgFlatList.value.find((item) => item.id === activeOrgId.value)?.name || ''
  })
  const userLoading = computed(() => !!userLoadingMap[activeOrgId.value])
  const currentUsers = computed(() => userCache[activeOrgId.value] || [])
  const filteredUsers = computed(() => {
    const kw = keyword.value.trim().toLowerCase()
    if (!kw) return currentUsers.value
    return currentUsers.value.filter(
      (user) =>
        String(user.userName || '').toLowerCase().includes(kw) ||
        String(user.username || '').toLowerCase().includes(kw)
    )
  })

  // 组织树只在首次拉取，失败时兜底为空树，交互仍可关闭
  async function ensureOrganizations() {
    if (sharedOrgLoading.value) return
    if (sharedOrgLoaded.value) {
      if (!activeOrgId.value && orgFlatList.value.length) {
        activeOrgId.value = orgFlatList.value[0].id
      }
      return
    }
    sharedOrgLoading.value = true
    try {
      const res = await getOrganizationTree()
      sharedOrgTree.value = Array.isArray(res?.data) ? res.data : []
      sharedOrgLoaded.value = true
    } catch {
      sharedOrgTree.value = []
    } finally {
      if (!activeOrgId.value && orgFlatList.value.length) {
        activeOrgId.value = orgFlatList.value[0].id
      }
      sharedOrgLoading.value = false
    }
  }

  // 部门下人员按部门 id 缓存，切回已看过的部门不再请求
  async function ensureUsers(orgId) {
    const id = String(orgId || '').trim()
    if (!id || userLoadingMap[id] || Array.isArray(userCache[id])) return
    userLoadingMap[id] = true
    try {
      const res = await findUserList({ organizationId: id })
      const rows = Array.isArray(res?.data?.rows) ? res.data.rows : []
      const deptName = orgFlatList.value.find((item) => item.id === id)?.name || ''
      userCache[id] = rows
        .filter((row) => row && row.id != null)
        .map((row) => ({
          userId: String(row.id),
          userName: resolveUserLabel(row),
          username: String(row.username || ''),
          phone: row.phone || row.mobile || row.telephone || '',
          email: row.email || row.mail || '',
          deptId: id,
          deptName,
          orgId: id,
          orgName: deptName
        }))
    } catch {
      userCache[id] = []
    } finally {
      userLoadingMap[id] = false
    }
  }

  async function load() {
    keyword.value = ''
    await ensureOrganizations()
    if (activeOrgId.value) {
      await ensureUsers(activeOrgId.value)
    }
  }

  function onOrgNodeClick(node) {
    const id = node?.id != null ? String(node.id) : ''
    if (!id || id === activeOrgId.value) return
    activeOrgId.value = id
    ensureUsers(id)
  }

  return {
    orgTreeProps,
    orgLoading: sharedOrgLoading,
    orgLoaded: sharedOrgLoaded,
    orgTreeData: sharedOrgTree,
    orgFlatList,
    activeOrgId,
    activeOrgName,
    keyword,
    userLoading,
    currentUsers,
    filteredUsers,
    ensureOrganizations,
    ensureUsers,
    load,
    onOrgNodeClick
  }
}

export default useOrgUsers
