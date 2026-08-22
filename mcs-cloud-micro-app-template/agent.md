# AI Coding 规范（微前端子应用模板）

本文档约束基于本模板派生的 Vue 微前端子应用的编码行为与工程规范。内容聚焦技术框架、目录职责、公共组件、请求封装与构建校验，不包含具体业务逻辑。

## 目录职责

- `src/api`：跨模块通用接口（`src/api/common` 下为组织、用户、字典、空间等公共能力）。业务模块自己的接口放在 `src/views/<模块>/api/`。
- `src/components`：跨页面复用的通用组件，全部在 `src/components/index.js` 全局注册，且必须在 `app.mount()` 之前注册。
- `src/hooks`：可复用的组合式逻辑（`pager.js` 列表分页、`detailer.js` 详情、`useDict.js` 系统字典、`useOrgUsers.js` 组织人员）。
- `src/router`：路由实例、本地调试菜单 `constantRoutes.js`。
- `src/store`：Vuex store 与主应用下发的全局状态。
- `src/styles`：设计 token（`variables.scss`）、公共 class（`common.scss`）。
- `src/utils`：请求实例、附件、查询小工具、校验、格式化等基础能力。
- `src/views`：页面级组件，按业务模块划分目录。

## 公共组件速查

全部已全局注册，直接在模板中使用，无需 import。

| 组件 | 用途 | 关键 props / slots |
| --- | --- | --- |
| `mcs-title` | 页面标题栏 | `title`、`border`，`#left`、`#right` |
| `mcs-search` | 快捷 + 高级搜索 | `v-model`、`showAdvancedSearch`、`showTableHeight`，`#advanceSearch`、`#functionButton` |
| `mcs-uploader` | 文件 / 图片上传 | `v-model`、`groupId`、`listType`、`limit`、`multiple` |
| `mcs-editor` | 富文本 | `v-model`、`groupId`、`editorHeight`、`disabled` |
| `mcs-user-picker` | 部门树 + 人员单选（Popover） | `v-model`、`displayName`、`teleported`、`clearable` |
| `mcs-org-user-panel` | 部门树 + 人员单选/多选面板 | `mode`（radio/checkbox）、`selectedUsers`、`excludeUserIds`、`lockedUserIds`、`lockedTagText`、`disabledTagText` |
| `mcs-space-tree-picker` | 空间单选树 | `v-model`、`projectSpaceIds`、`availableSpaceIds`、`showDetail`、`disabled`、`disabledReason` |

## Hooks 使用约定

- `Pager(HTTP)`：列表页分页、选中、增删的通用逻辑，要求 API 模块导出 `findPage / findById / insert / update / deleteById / deleteBatch`。
- `useDict(dictTypes)`：系统字典缓存与在途去重。返回 `load` / `options` / `resolveLabel` / `resolveLabels`。页面不要各自打 `getDictData`。
- `useOrgUsers()`：组织树与按部门缓存的人员列表，供选人器与选人面板共用。

## 请求规范

- 所有业务请求通过 `src/utils/request.js` 发起，复用统一 baseURL、鉴权头与错误提示。
- 相同业务错误 2 秒内只弹一次。
- API 文件只暴露语义化函数；查询参数归一化（空值剔除、日期区间拆分）在 API 层完成。
- 雪花 id 用 `toId` 转字符串，不要 `Number()`。空查询字段用 `cleanQuery` 去掉。
- 附件预览 / 下载用 `resolveFileUrl` / `downloadAttachment`，不要在页面里手写 fetch blob。
- 错误提示复用拦截器，`catch` 中只做本地兜底，不重复弹提示。

## 样式规范

- 颜色、间距、圆角优先用 `var(--mcs-*)` 或 Element Plus CSS 变量。
- 只读详情栅格复用 `.mcs-info-grid`，不要用 `el-descriptions` 硬调列宽。
- 两处及以上出现相同样式时提取到 `src/styles`。
