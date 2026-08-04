# AI Coding 规范（微前端子应用模板）

本文档约束基于本模板派生的 Vue 微前端子应用的编码行为与工程规范。内容聚焦技术框架、目录职责、样式分层、公共组件、请求封装、路由约定与构建校验，不包含具体业务逻辑。

## 技术框架

- 前端框架：Vue 3，优先使用 Composition API 和 `<script setup>`。
- 工程构建：Vue CLI 5，构建配置集中在 `vue.config.js`。
- 路由管理：Vue Router 4。
- 状态管理：Vuex 4。
- UI 组件库：Element Plus（公司定制版），默认中文语言包。
- 网络请求：Axios，统一通过 `src/utils/request.js` 实例发起。
- 样式方案：SCSS，按优先级使用四层样式来源：
  1. Element Plus 组件能力与主题 CSS 变量；
  2. `src/styles/variables.scss` 设计 token；
  3. `src/styles` 下的公共 class、页面骨架与组件库覆盖；
  4. 页面 / 组件 `scoped` 样式（仅用于该视图独有的业务渲染细节）。
- 微前端：qiankun 子应用模式，构建产物 UMD 格式，保留标准生命周期。
- 路径别名：统一使用 `@/` 指向 `src/`。

## 目录职责

- `src/api`：跨模块通用接口（`src/api/common` 下为组织、用户等公共能力）。业务模块自己的接口放在 `src/views/<模块>/api/`。
- `src/components`：跨页面复用的通用组件，全部在 `src/components/index.js` 全局注册。
- `src/hooks`：可复用的组合式逻辑（`pager.js` 列表分页、`detailer.js` 详情、`useAutoTableHeight.js` 表格高度自适应）。
- `src/router`：路由实例、本地调试菜单 `constantRoutes.js`、隐藏页 `hiddenRoutes.js`。
- `src/store`：Vuex store 与主应用下发的全局状态。
- `src/styles`：设计 token、公共 class、页面骨架、Element Plus 覆盖。
- `src/utils`：请求实例、校验、格式化等基础能力。
- `src/views`：页面级组件，按业务模块划分目录。

### 业务模块目录约定

```
src/views/<module>/
  routePaths.js            path 常量，与运营平台菜单一致
  constants.js             枚举与展示映射
  api/<module>.js          接口
  index.vue                列表页
  components/*.vue         弹框、抽屉、局部面板
  detail/index.vue         详情页（路由化）
  form/index.vue           表单页（路由化，新增编辑合一）
```

`src/views/demo/` 是完整参考实现，新建模块时整目录复制改名即可，改完记得删除 demo。

## 样式规范

### 分层与优先级

1. **设计 token**：`src/styles/variables.scss`。颜色、渐变、圆角、间距、阴影、表格与 KPI 配色全部在这里，页面和组件只允许 `var(--mcs-*)` 引用。
2. **通用 class**：`src/styles/common.scss`。`section-card`、`section-card__title`、`section-dot`、`dialog-body`、`drawer-body`、`status-dot`、`progress-cell`、`cell-muted`、`mcs-tag` 等。
3. **页面骨架**：`src/styles/page-shell.scss`。`page-container mcs-page` 下的 `mcs-title`、`mcs-search`、`page-body`、`panel`、`filter-bar`、`tabs-bar`、`stats-grid`、`kpi`、`table-box`、`pagination-box`、`page-footer`。
4. **组件库覆盖**：`src/styles/element-overrides.scss`。`.mcs-dialog`、`.mcs-drawer` 皮肤与表格空态。

### 硬性要求

- **禁止**在 SFC 里硬编码颜色、圆角、阴影；一律用 `var(--mcs-*)` 或 Element Plus CSS 变量。
- **禁止**在页面里用 `scoped` + `:deep()` 重写页面底色、`mcs-title` 渐变、表头配色、`table-box` / `pagination-box` 内边距、弹框与抽屉的 header / body / footer —— 这些已经全局统一，重复覆盖会造成各页不一致。
- **禁止**在业务页面写 `<style lang="scss">` 非 scoped 全局块去改 Element Plus 结构；需要新的全局外观时扩展 `src/styles`。
- 两处及以上出现相同样式时提取到 `src/styles`，不在多个 SFC 复制。
- 页面 `scoped` 样式只承载业务渲染细节（缩略图尺寸、富文本排版、特殊单元格）。
- 主操作按钮 `type="mcs"`，次要操作 `plain`，表格行内操作 `link`。

### 标准列表页结构

```
page-container mcs-page      // 页面容器，自动获得底色、整卡填满、左右对齐
  mcs-title                  // 标题栏，主操作放 #right 插槽
  mcs-search                 // 快捷搜索 + 高级搜索 + 功能按钮
  page-body
    panel                    // page-body 下唯一 panel 时自动整卡填满
      mcs-stats-grid         // KPI 区（可选）
      table-box              // 表格区，配合 useAutoTableHeight
      pagination-box         // 分页区（total > 0 时显示）
```

- 筛选项放 `mcs-search` 的 `#advanceSearch` 插槽，导出与批量操作放 `#functionButton`。
- 筛选项列数非 3 列时用 `advancedSearchColumns`，需要默认展开用 `defaultExpandAdvanced`。
- 只有 1~2 个筛选项时可用 `filter-bar`，不要为此自建卡片。
- 分页 `layout="total, prev, pager, next, jumper, sizes"`、`:page-sizes="[10, 20, 30, 40, 50, 100]"` 保持一致。

## 公共组件速查

全部已全局注册，直接在模板中使用，无需 import。

| 组件 | 用途 | 关键 props / slots |
| --- | --- | --- |
| `mcs-title` | 页面标题栏 | `title`、`border`，`#left`、`#right` |
| `mcs-search` | 快捷 + 高级搜索 | `v-model`、`showAdvancedSearch`、`showTableHeight`、`defaultExpandAdvanced`、`advancedSearchColumns`，`#advanceSearch`、`#functionButton`，事件 `change`、`reset`、`tableHeightCommand` |
| `mcs-table-empty` | 表格空态 | `description`、`imageSize`；放在 `el-table` 的 `#empty` |
| `mcs-dialog` | 统一皮肤弹框 | `v-model`、`title`、`width`、`confirmLoading`、`showFooter`，事件 `confirm`、`cancel`、`open`、`closed` |
| `mcs-drawer` | 统一皮肤抽屉 | 同上，另有 `size`（默认 750px）、`loading` |
| `mcs-section-card` | 分区卡 | `title`，`#title`、`#extra` |
| `mcs-status-tag` | 状态圆点文本 | `text`、`type`（info / primary / success / warning / danger） |
| `mcs-stats-grid` | KPI 容器 | `columns`（2~5）、`loading` |
| `mcs-kpi-card` | KPI 卡 | `label`、`value`、`sub`、`icon`、`tone`、`valTone`、`trend` |
| `mcs-tag-select` | 标签式选择 | `v-model`、`options`、`multiple`、`clearable` |
| `mcs-uploader` | 文件 / 图片上传 | `v-model`、`groupId`、`listType`、`limit`、`multiple` |
| `mcs-editor` | 富文本 | `v-model`、`groupId`、`editorHeight`、`disabled` |

`mcs-stats-grid`、`mcs-kpi-card` 的样式定义在 `page-shell.scss`，必须放在 `page-container mcs-page` 内使用。

## Hooks 使用约定

- `Pager(HTTP)`：列表页分页、选中、增删的通用逻辑，要求 API 模块导出 `findPage / findById / insert / update / deleteById / deleteBatch`。文件头标注禁止混入业务逻辑，改动需谨慎。
  - `submit` / `formDetailRef` 只适用于表单内联在列表页的场景；表单抽到子组件时由子组件自管校验与提交，通过 `@success` 通知列表刷新。
  - `reset` 会清空 `form` 的全部 key，页面有默认筛选值时用本地 `defaultQuery()` 复位后调 `findSearch()`。
- `useAutoTableHeight({ watchSources })`：把 `tableWrapRef` 绑到 `.table-box`，`tableHeight` 绑到 `el-table` 的 `height`，表格随容器自适应且不出现双滚动条。
- 表单在弹框、抽屉、表单页多处复用时，把字段初值、校验规则、详情回填、提交收敛到模块内的组合式函数（参考 `src/views/demo/useDemoForm.js`）。

## 请求规范

- 所有业务请求通过 `src/utils/request.js` 发起，复用统一 baseURL、鉴权头、大整数解析与错误提示。
- 响应已接入 json-bigint（`storeAsString: true`），后端 Long 主键到前端是字符串，比较与传参时不要 `Number()` 转换。
- API 文件只暴露语义化函数；查询参数归一化（日期区间拆分、空值剔除）在 API 层完成，页面不拼底层请求配置。
- 分页字段兼容 `rows` 与 `records`（`pager.js` 已统一处理）。
- 错误提示复用拦截器，`catch` 中只做本地兜底（清空数据、结束 loading），不重复弹提示。

## 路由与微前端规范

- 保留 `bootstrap`、`mount`、`unmount` 生命周期；卸载时清理实例、容器内容与动态注册的全局状态模块。
- 全局组件必须在 `app.mount()` 之前注册（`src/main.js` 已处理）。
- 列表、详情、表单各自独立路由组件，**禁止**在同一 SFC 内用 `pageMode` + `v-if` 切换整页。
- 每个业务模块维护 `routePaths.js`，导出与运营平台菜单一致的 path 常量；页面内禁止硬编码 path。
- 跨页跳转统一 `router.push({ path: XXX, query })`；详情与表单从 `route.query.id` 读主键，缺少主键时提示并回列表。
- 返回列表用 `routePaths.js` 常量，不要 `router.go(-1)`（微前端嵌套下行为不一致）。
- 隐藏页（详情、表单）写入 `src/router/hiddenRoutes.js`，由子应用本地始终注册；列表页由主应用菜单下发。
- 本地调试菜单写在 `src/router/constantRoutes.js`，仅 `development` 且 `remotePermissions === false` 时生效。

## 排版规范

- **禁止**逐行空行（每条语句、每个属性、每个 CSS 声明之间加空行）。
- 允许的空行仅用于分隔逻辑块：`template` / `script` / `style` 之间各 1 行；import 分组与业务代码之间 1 行；相邻函数之间 1 行；SCSS 顶层选择器之间 1 行。
- 连续的 `const` / `ref` 声明写在相邻行；同一选择器内的声明连续书写。
- 多属性标签属性之间不加空行，属性过多时换行对齐。
- 文件末尾保留单个换行符。
- 修复排版时只做空行与缩进整理，不改业务逻辑，不做无关 reformat。

## 编码规范

- 新增 SFC 优先 `<script setup>`；导入项目内部模块用 `@/` 别名。
- 组件输入用 `props`，输出用 `emits`，扩展区用 `slots`；`v-model` 同步实现 `modelValue` 与 `update:modelValue`；不直接修改 props。
- 枚举文案映射集中到模块 `constants.js`，禁止在多个页面重复 if/else。
- 承载复杂业务规则的方法或组合式函数在方法上方写注释，说明规则、关键分支与边界；注释不重复代码本身含义。
- 不引入新的运行时依赖，除非需求明确且现有技术栈无法支持。
- 保持最小改动，不做与任务无关的重构、格式化或依赖升级。

## 构建与校验

- 本地开发子应用：`npm run dev`。
- 同时启动主应用与子应用：`npm run start`。
- 生产构建：`npm run build`。
- 代码检查：`npm run lint`（`plugin:vue/vue3-essential` + `eslint:recommended`，配置在 `package.json` 的 `eslintConfig`）。
- `src/components/mcs-uploader`、`src/components/mcs-editor` 为早期移植代码，存在已知的历史遗留 lint 问题；判断标准是**新增与修改的文件不得引入新问题**，不要顺手大改这两个目录。
- 修改代码后至少运行与变更相关的检查命令；无法运行时必须说明原因与未覆盖风险。

## 新模块自检清单

- [ ] `src/views/<module>/routePaths.js`，path 与运营平台菜单一致
- [ ] `src/views/<module>/api/<module>.js`，函数名符合 Pager 契约，查询参数在 API 层归一化
- [ ] 枚举与文案映射集中在 `constants.js`
- [ ] 列表页使用 `page-container mcs-page` + `mcs-title` + `mcs-search` + `table-box` + `pagination-box`
- [ ] 表格配 `mcs-table-empty` 空态与 `useAutoTableHeight` 高度自适应
- [ ] 弹框、抽屉使用 `mcs-dialog` / `mcs-drawer`，未重复写皮肤样式
- [ ] 详情、表单是独立路由组件，已登记到 `hiddenRoutes.js`
- [ ] 跳转使用 `path` + `query`，未硬编码 path 与 `name`
- [ ] SFC `scoped` 样式中没有硬编码色值，没有重复全局皮肤
- [ ] 空行排版符合「排版规范」
- [ ] `npm run lint` 与 `npm run build` 通过

## AI 工作规范

- 开始编码前先阅读相关文件、配置与相邻实现，不基于猜测修改。
- 优先沿用已有框架、目录、工具函数、公共组件与命名风格。
- 新增或修改 UI 前，先查 `src/styles` 与 `src/components` 是否已有能力，避免重复定义。
- 严格控制变更范围，不改既有业务规则、接口语义、权限逻辑、路由契约与微前端接入契约。
- 修改公共能力时同步考虑已有调用方，避免破坏兼容。
- 输出结果时说明修改内容、校验方式与未完成的风险点。
