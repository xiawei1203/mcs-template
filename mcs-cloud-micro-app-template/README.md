# 系统管理页面

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

## 六、工程结构与公共能力

编码规范见 [agent.md](./agent.md)，AI 辅助编码规则见 `.cursor/rules/`。

```
src/
  api/common/        跨模块通用接口（组织树、用户列表、系统字典、空间树）
  components/        全局注册的公共组件
  hooks/             pager、detailer、useDict、useOrgUsers
  utils/             request、attachmentFiles、query、校验、格式化
  styles/            variables（设计 token）、common（通用 class）
```

### 公共接口

| 模块 | 路径 | 用途 |
| --- | --- | --- |
| 组织 | `src/api/common/organization.js` | 组织/部门树、详情、展平为下拉项 |
| 用户 | `src/api/common/user.js` | 人员列表（`/admin/v1/user/list`）、详情、展示名 |
| 字典 | `src/api/common/dict.js` | 只读系统字典，页面通过 `useDict` 取选项 |
| 空间 | `src/api/common/space.js` | 空间树 / 详情 / 类型，走 `/spatialmap` |

系统字典用 `useDict`，不要各页直接打 `getDictData`。查询参数空值剔除、雪花 id 转字符串、请求号生成见 `src/utils/query.js`。附件地址解析与鉴权下载见 `src/utils/attachmentFiles.js`。

### 公共组件

`mcs-title`、`mcs-search`、`mcs-uploader`、`mcs-editor`、`mcs-user-picker`、`mcs-org-user-panel`、`mcs-space-tree-picker` 已全局注册，模板中直接使用。参数说明见 [agent.md](./agent.md) 的「公共组件速查」。

示例页 `src/views/testt/index.vue` 的新增/编辑弹框已用 `mcs-user-picker` 示范选负责人。状态、分类等枚举仍写在模块 `constants.js`，不要在示例里强绑某个线上字典编号。
