#指定基础镜像，在其上进行定制
FROM anapsix/alpine-java:latest

#作者信息
MAINTAINER mcsgis "www.mcsgis.com"

#这里的 /tmp 目录就会在运行时自动挂载为匿名卷，任何向 /tmp 中写入的信息都不会记录进容器存储层
VOLUME /tmp

LABEL mcsgis=java
#添加当前文件；jar 名需与 pom 的 ${artifactId}-${version} 一致，改 pom 版本号后此处同步修改
ADD ./mcs-cloud-template-server-1.0-SNAPSHOT.jar ./mcscloud-template.jar

ENV TZ=Asia/Shanghai

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

#声明运行时容器提供服务端口，这只是一个声明，在运行时并不会因为这个声明应用就会开启这个端口的服务

#Http协议端口，与 application.yml 的 server.port 保持一致
EXPOSE 30060

#指定容器启动程序及参数
ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom","-jar","/mcscloud-template.jar"]
