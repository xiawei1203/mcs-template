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
