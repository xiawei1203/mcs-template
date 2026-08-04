# mcs-cloud-template-server

MCS 云平台微服务**开发模板**，用于快速派生新的业务微服务。基础能力（统一返回、安全认证、接口文档、用户池上下文、全局异常处理、Nacos 注册、OpenFeign）由内部 starter `mcs-quickstart-spring-boot-stater` 自动装配，业务项目只需关注模块代码。

## 技术栈

| 类别 | 选型 |
|------|------|
| 语言 / 构建 | Java 8、Maven |
| 框架 | Spring Boot、Spring Cloud（Nacos 注册发现、OpenFeign） |
| 数据访问 | MyBatis-Plus、MySQL、dynamic-datasource、Druid；TDengine（可选） |
| 缓存 | Redis |
| 接口文档 | springfox Swagger / Knife4j |
| 工具 | Lombok、Hutool、Commons Lang3、Commons Collections4、EasyExcel |
| 测试 | JUnit 5、Mockito |

## 目录结构

```
src/main/java/com/mcsgis/saas/
├── TemplateApplication.java        # 启动类
├── config/
│   ├── JacksonConfig.java          # Long/BigInteger 序列化为 String，防前端精度丢失
│   ├── MybatisPlusConfig.java      # 用户池租户拦截器 + 分页拦截器
│   ├── MyMetaObjectHandler.java    # 审计字段自动填充
│   ├── RedisCacheConfig.java       # RedisTemplate 序列化
│   └── AsyncConfig.java            # @EnableAsync + 业务线程池模板
└── module/
    └── demo/                       # 示例模块，派生正式服务后整体删除
        ├── controller/ service/ service/impl/ dao/
        └── domain/ dto/ vo/ constant/

src/main/resources/
├── application.yml                 # 开发环境配置，线上由 docker-compose 覆盖
├── mapper/demo/DemoMapper.xml      # 复杂 SQL 放 XML，支持按模块分子目录
└── sql/template_demo.sql           # 建表 DDL

src/test/java/...                   # JUnit 5 + Mockito 单元测试
```

## 本地启动

1. 确认已配置内部 Maven 私服 `http://git.mcsgis.abc:8081/repository/maven-public/`（`pom.xml` 中已声明）。
2. 执行 `resources/sql/` 下的 DDL 建表。
3. 按需修改 `application.yml` 中的数据库、Redis、Nacos 地址（默认指向开发环境）。
4. 启动 `TemplateApplication`，接口文档地址 `http://localhost:30060/doc.html`。

```bash
mvn clean package -DskipTests
java -jar target/mcs-cloud-template-server-1.0-SNAPSHOT.jar
```

## 基于本模板新建服务：改名清单

复制本仓库后，**逐项**完成以下修改，避免残留模板痕迹（本模板此前就因复制自其他服务而留下 `application.name: energy` 等错误）：

| # | 位置 | 修改内容 |
|---|------|----------|
| 1 | `pom.xml` | `artifactId`（如 `mcs-cloud-xxx-server`）、`version` |
| 2 | `TemplateApplication.java` | 类名改为 `XxxApplication`，同步文件名 |
| 3 | `application.yml` | `spring.application.name`、`server.port` |
| 4 | `application.yml` | `spring.datasource.dynamic.datasource.master.url` 的库名 |
| 5 | `application.yml` | **`spring.cloud.nacos.discovery.namespace` 与 `group`**：当前值为 `MCS_CLOUD`，而 leasing / energy / ibms 现用 `ibms`，必须按目标环境确认，否则服务间互相发现不到 |
| 6 | `application.yml` | `mcs.security.jwk-set-uri` 指向目标环境认证中心 |
| 7 | `Dockerfile` | `ADD` 的 jar 名（须等于 `${artifactId}-${version}.jar`）、`EXPOSE` 端口 |
| 8 | `docker-compose.yml` | 服务名、`image`、`container_name`、`ports`、全部 `environment` 值、日志挂载路径 |
| 9 | 代码 | 删除 `module/demo` 整个目录、`resources/mapper/demo/`、`resources/sql/template_demo.sql`、`src/test/.../demo/` |
| 10 | `README.md` | 替换为新服务说明 |

## 配置管理约定

`application.yml` 中的连接信息是**开发环境默认值**，不拆分 `application-{profile}.yml`；测试与生产环境统一在 `docker-compose.yml` 的 `environment` 中覆盖。

线上可覆盖的配置项：

| 配置项 | 说明 |
|--------|------|
| `spring.application.name` | Nacos 注册名，同时决定日志目录 |
| `server.port` | 服务端口，需与 compose 的 `ports` 一致 |
| `spring.cloud.nacos.discovery.server-addr` / `ip` / `namespace` / `group` | 注册中心 |
| `spring.datasource.dynamic.datasource.master.url` / `username` / `password` / `driver-class-name` | 主库（MySQL） |
| `spring.redis.host` / `port` / `database` | 缓存 |
| `mcs.security.jwk-set-uri` | 认证中心 JWK 地址 |
| `mybatis-plus.configuration.log-impl` | 生产建议设为 `org.apache.ibatis.logging.nologging.NoLoggingImpl` 关闭 SQL 打印 |

**注意**：本项目使用 `dynamic-datasource`，覆盖数据源必须走 `spring.datasource.dynamic.datasource.{名称}.*` 路径。写成 `spring.datasource.druid.url` **不会生效**，应用会连回 `application.yml` 中的开发库。

## 可选能力

- **TDengine 时序库**：`pom.xml` 已含 `taos-jdbcdriver`。在 `application.yml` 的 `dynamic.datasource` 下取消 `slave` 注释即可启用，对应 Service 加 `@DS("slave")`。
- **XXL-Job 定时任务**：按需在 `pom.xml` 加入 `com.mcsgis.saas:mcs-job-spring-boot-starter`，并配置 `mcs.job.xxl.*`（参考 `mcs-cloud-energy-server`、`mcs-cloud-ibms-server`）。
- **Spring 定时任务**：启动类加 `@EnableScheduling` 后，用 `@Scheduled(cron = "${xxx.cron}")` 承载，任务逻辑委托 Service。

## 开发规范

代码分层、实体字段、返回类型、事务与异常、SQL 归属、测试写法等约定见 [agent.md](agent.md)；Cursor 规则见 [.cursor/rules/java-backend-mybatisplus.mdc](.cursor/rules/java-backend-mybatisplus.mdc)。

要点速览：

- Controller 只做入参与返回，统一 `R<具体类型>`，分页用 `PageResult<T>`
- 实体必须有雪花主键 `@TableId(type = IdType.ASSIGN_ID)`、`userPoolId` 和审计四字段
- 写操作加 `@Transactional(rollbackFor = Exception.class)`
- 业务失败 `throw new McsException("中文提示")`，不要 `return R.error()`
- 复杂 SQL 放 `resources/mapper/**/*.xml`，不用注解承载
- 建表 DDL 放 `resources/sql/`，多租户表联合索引 `user_pool_id` 放最左列
