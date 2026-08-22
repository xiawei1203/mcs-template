# 微前端子应用模板

MCS 智慧建筑 qiankun 子应用脚手架。内置统一的设计 token、页面骨架样式、公共组件、列表分页 Hook 与一套完整的示例模块，用于快速派生新的业务子应用。

编码规范见 [agent.md](./agent.md)，AI 辅助编码规则见 `.cursor/rules/`。

## 一、安装依赖

### 1.1 安装主应用依赖

~~~shell
cd main ##定位到主目录
pnpm install ##安装主应用依赖
~~~

### 1.2 安装子应用依赖

```shell
cd .. ##定位到子应用目录
pnpm install  ## 安装
```

## 二、运行应用

```shell
npm run start  ##同时启动主应用、子应用；默认使用   127.0.0.1:9999进行访问
```

## 三、访问应用

~~~ shell
默认访问地址：127.0.0.1:9999
~~~

模板默认 `src/settings.js` 的 `remotePermissions: true`，即菜单路由由运营平台下发，`src/router/constantRoutes.js` 的本地菜单不生效。想脱离主应用单独打开示例模块（`/demo/list`），先把 `remotePermissions` 改为 `false` 再 `npm run dev`。详情与表单等隐藏页在 `src/router/hiddenRoutes.js` 中，两种模式下都始终注册。

## 四、编译

```
npm run build
```

## 五、部署

### 5.1 docker部署

#### 5.1.1 修改Dockerfile文件

| 修改前

~~~ shell
FROM nginx:latest
WORKDIR /etc/nginx/conf.d
MAINTAINER www.mcsgis.com
LABEL mcsgis=web

##  修改前
COPY ./dist/  /usr/share/nginx/html/

...

~~~

| 修改后

~~~ shell
FROM nginx:latest
WORKDIR /etc/nginx/conf.d
MAINTAINER www.mcsgis.com
LABEL mcsgis=web
## 修改后  template-build为发布后的文件夹名称
COPY ./template-build/  /usr/share/nginx/html/template-build  

...
~~~

#### 5.1.2 修改docker-compose文件

替换名称 ***-template，注意不要与其他服务名称重复

端口设置32001，注意不要与其他服务名称重复

~~~ yaml
version: "3"
services:
  mcscould-web-template:
    build:
      dockerfile: Dockerfile
      context: ./
    image: mcscould-web/template
    container_name: mcscould-web-template
    environment:
      - API_URL=http://192.168.0.198:31010/
      - STATIC_RES_URL=http://192.168.0.150:9000/model/
    ports:
      - 32001:80
~~~



### 5.2 直接部署

将发布后的文件，直接复制到服务器中

## 六、基于模板创建子应用

复制本工程后按顺序改这几处，`settings.js` 的 `name` 决定构建目录、qiankun 注册名与路由 base，必须先改。

| 步骤 | 文件 | 修改内容 |
| --- | --- | --- |
| 1 | `src/settings.js` | `name` 改成子应用名（如 `leasing`）；`micro.entry` 改成本机开发地址；`remotePermissions` 决定用运营平台菜单还是本地调试菜单 |
| 2 | `package.json` | `name` 与子应用名一致 |
| 3 | `vue.config.js` | `devServer.port` 换一个未被占用的端口；`devServer.proxy` 增加本业务的网关前缀 |
| 4 | `Dockerfile` | `COPY ./template-build/` 中的目录名改成 `<name>-build` |
| 5 | `docker-compose.yml` | 服务名、镜像名、容器名、宿主端口都要唯一 |
| 6 | `src/router/constantRoutes.js` | 本地调试菜单换成本业务模块 |
| 7 | `src/router/hiddenRoutes.js` | 登记本业务的详情、表单等隐藏页 |
| 8 | `src/views/demo/` | 整目录复制改名成业务模块，改完删除 demo，并从上面两个路由文件里移除 demo 引用 |

## 七、工程结构

```
src/
  api/common/        跨模块通用接口（组织树、用户列表、系统字典、空间树）
  components/        全局注册的公共组件
  hooks/             pager、detailer、useAutoTableHeight、useDict、useOrgUsers
  router/            路由实例、本地调试菜单、隐藏页
  store/             Vuex 与主应用下发的全局状态
  styles/            variables（设计 token）、common（通用 class）、page-shell（页面骨架）、element-overrides（组件库覆盖）
  utils/             request（含 json-bigint）、attachmentFiles、query、校验、格式化
  views/demo/        示例模块：列表 + 弹框表单 + 抽屉表单 + 抽屉详情 + 路由化详情/表单
```

### 样式分层

改样式前先确认应该改哪一层，避免各页面视觉不一致：

1. Element Plus 组件能力与主题 CSS 变量；
2. `src/styles/variables.scss` 的 `--mcs-*` 设计 token（换主色、圆角、间距只改这里）；
3. `src/styles` 的通用 class、页面骨架与组件库覆盖；
4. SFC `scoped`，仅业务渲染细节。

禁止在页面里硬编码色值，或用 `:deep()` 重写页面底色、标题栏、表头、弹框与抽屉皮肤。

### 公共组件

`mcs-title`、`mcs-search`、`mcs-table-empty`、`mcs-dialog`、`mcs-drawer`、`mcs-section-card`、`mcs-status-tag`、`mcs-stats-grid`、`mcs-kpi-card`、`mcs-tag-select`、`mcs-uploader`、`mcs-editor`、`mcs-user-picker`、`mcs-org-user-panel`、`mcs-space-tree-picker` 已全局注册，模板中直接使用。参数说明见 [agent.md](./agent.md) 的「公共组件速查」。

系统字典用 `useDict`，不要各页直接打 `getDictData`。查询空值用 `cleanQuery`，主键用 `toId`，附件下载用 `downloadAttachment`。示例抽屉表单已用 `mcs-user-picker` 示范选负责人；状态/分类仍用模块 `constants.js`，不在 demo 强绑某个线上字典编号。

### 标准列表页

```
page-container mcs-page
  mcs-title            标题栏，主操作放 #right
  mcs-search           快捷搜索 + 高级搜索（#advanceSearch）+ 功能按钮（#functionButton）
  page-body
    panel
      mcs-stats-grid   KPI 区（可选）
      table-box        表格区，配合 useAutoTableHeight 自适应高度
      pagination-box   分页区
```

## 八、代码检查

```shell
npm run lint
npm run build
```

ESLint 使用 `plugin:vue/vue3-essential` + `eslint:recommended`（配置在 `package.json` 的 `eslintConfig`）。

当前 `npm run lint` 会报出 53 个历史遗留问题，集中在早期移植的 `src/components/mcs-uploader`（约 40 个）、`src/components/mcs-editor`、以及 `qiankun.js`、`utils/common.js`、`views/sysIcons`，主要是未使用变量与 Vue 2 时代的生命周期、插槽写法。这些是已知存量，判断标准是**新增与修改的文件不得引入新问题**，不要顺手大改这些目录。
