# 基础镜像
FROM nginx:latest
#创建app目录
WORKDIR /etc/nginx/conf.d
# 作者
MAINTAINER www.mcsgis.com

LABEL mcsgis=web

COPY ./template-build/  /usr/share/nginx/html/template-build

COPY ./nginx.template /etc/nginx/conf.d

EXPOSE 80

#添加环境变量的写入
ENTRYPOINT envsubst '$API_URL $STATIC_RES_URL'  < nginx.template > default.conf && cat default.conf && nginx -g 'daemon off;'