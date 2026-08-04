# AI Coding Agent 规范

本文档用于约束本项目中的 AI Coding 行为，便于在 Cursor、Codex、Claude Code 等工具中复用。规范只描述技术框架、代码结构、协作方式和质量要求，不包含具体业务逻辑。

## 项目定位

- 本仓库是 MCS 云平台微服务的**开发模板**，用于快速派生新的业务微服务。
- 面向 Maven + Spring Boot + MyBatis-Plus 的 Java 后端服务，默认 Java 8 语法和兼容性要求。
- `com.mcsgis.saas.module.demo` 是示例模块，供新模块参照复制；派生正式服务后应整体删除。
- 代码生成和修改应优先遵循既有目录结构、命名风格、公共工具类和框架约定。
- 修改代码前必须先阅读相关模块的现有实现，避免凭空新增不一致的抽象或依赖。

## 技术框架

- 语言与构建：Java 8、Maven。
- 基础依赖由 `mcs-quickstart-spring-boot-stater` 聚合提供：Web、安全、接口文档、统一返回、用户池上下文、全局异常处理、Nacos、OpenFeign、MyBatis-Plus、Druid。
- 数据访问：MyBatis-Plus、MySQL、动态数据源（`dynamic-datasource`）、Druid 连接池；时序数据用 TDengine（`@DS("slave")`）。
- 缓存：Redis。
- 接口文档：springfox Swagger，使用 `io.swagger.annotations`。
- 常用工具：Lombok、Hutool、Apache Commons Lang3、Apache Commons Collections4、EasyExcel。
- 测试框架：JUnit 5、Mockito、Spring Boot Test。

## 分层规范

后端代码按模块组织在 `com.mcsgis.saas.module.{模块名}` 下，模块内保持清晰分层：

- `controller`：只负责 HTTP 参数接收、参数校验、调用 Service、返回 `R` 包装结果；禁止写业务逻辑、复杂查询拼装和事务逻辑。
- `service`：定义业务接口，暴露模块对外能力。
- `service.impl`：实现业务流程、事务边界、校验编排、跨表操作和数据组装。
- `dao`：Mapper 接口，继承 `BaseMapper<实体>`；仅负责数据访问。
- `domain`：数据库表对应实体，使用 MyBatis-Plus 注解描述表和字段映射。
- `dto`：请求入参、导入行、内部命令对象等输入模型。
- `vo`：接口响应模型、页面展示模型、选项模型等输出模型。
- `constant`：枚举值、状态值、类型值等常量定义。
- `support`：可复用的领域规则、计算逻辑、转换逻辑或辅助能力。
- `job`：定时任务入口；任务内复杂逻辑应委托 Service 或 Support。
- `feign`：调用其他微服务的 Feign 客户端，服务名用 `${mcs.xxx.service-name:默认名}` 配置化。

根包下的 `config` 存放框架级配置，`util` 存放无状态通用工具。

## 接口规范

- Controller 类使用 `@RestController`、`@RequestMapping`、`@Api(tags = "...")`。
- 方法使用 `@ApiOperation("...")` 描述接口用途，说明应简短清晰。
- 请求参数按场景使用 `@RequestParam`、`@PathVariable`、`@RequestBody`、`@Valid`、`@Validated`、`@NotNull` 等注解。
- 统一返回 `com.mcsgis.saas.common.data.R`，方法签名必须写明泛型：
  - 分页：`R<PageResult<YourVo>>`
  - 单条：`R<YourVo>` 或 `R<YourEntity>`
  - 列表：`R<List<YourVo>>`
  - 无载荷成功：`R<Void>`
- 分页结果统一使用 `PageResult<T>`，不要直接暴露 MyBatis-Plus 的 `Page<T>` 给接口调用方。
- Controller 不直接拼复杂 SQL、不直接处理跨表事务、不直接写大量字段复制逻辑。

## 实体规范

数据库表实体放在模块的 `domain` 包中，参考 `module/demo/domain/Demo.java`：

- 类上使用 `@TableName("table_name")`，用 Lombok `@Data` 简化 getter/setter。
- 主键使用雪花 ID：`@TableId(type = IdType.ASSIGN_ID)` + `@JsonSerialize(using = ToStringSerializer.class)`。
- Long 类型主键、用户 ID、用户池 ID 返回前端时使用 `ToStringSerializer`，避免 JavaScript 精度丢失。
- 新建表实体默认包含 `userPoolId` 与审计四字段（`createId`、`updateId`、`createTime`、`updateTime`），审计字段由 `MyMetaObjectHandler` 自动填充。
- 多租户字段统一使用 `userPoolId` / `user_pool_id`，由 `MybatisPlusConfig` 的租户拦截器处理；不含该列的表须加入 `MybatisPlusConfig.IGNORE_TABLE`。
- 不要使用逻辑删除，除非需求明确要求。
- 实体字段使用 Java 驼峰命名，数据库列使用下划线命名。

## 数据访问规范

- MyBatis-Plus 内置接口和 Wrapper 能清晰表达的简单查询、分页、保存、更新，优先使用 MyBatis-Plus：`Wrappers.lambdaQuery()`、`getById`、`page`、`save`、`updateById`。
- 查询条件使用 Lambda 字段引用，例如 `Demo::getDemoName`，避免硬编码列名。
- 字符串查询条件先判空和 `trim()`，常用 `StringUtils.isNotBlank(...)`。
- 多表联查、复杂统计、批量更新、跨库查询、性能敏感查询，应扩展 Mapper 方法并在 XML 中实现。
- 复杂 SQL 不要通过 `@Select`、`@Update`、`@Delete` 注解实现；统一放在 `resources/mapper/{模块}/XxxMapper.xml`，`namespace` 与 Mapper 接口全限定名一致。
- 建表 DDL 放 `resources/sql/`，每张表、每个字段必须有 COMMENT；多租户表的联合索引把 `user_pool_id` 放最左列。
- 不要在 Controller 中直接调用 Mapper。

## 事务与异常

- 写操作、删除操作、跨表操作、状态流转、批量处理应加 `@Transactional(rollbackFor = Exception.class)`。
- 业务异常统一使用 `throw new McsException(...)`，由 starter 的全局异常处理器转换为 `R` 返回；禁止在 Service、Support 层用 `return R.error()` 表达业务失败，也不要抛 `RuntimeException`、`IllegalArgumentException` 替代业务异常。
- 业务校验失败、数据不存在、状态不允许等场景，提示信息使用中文，例如 `throw new McsException("示例数据不存在或已删除")`。
- 查询详情时，数据不存在应抛出明确的 `McsException`。
- 禁止吞异常；除非能明确恢复，否则不要空 `catch`。

## 编码风格

- 优先沿用项目已有代码风格，不为单个需求引入新框架、新架构或新公共库。
- 常量、状态、类型集中放到 `constant` 或 `support`，避免魔法值散落在 Controller 和 Service 中。
- 复杂规则优先沉淀到 `support`，Service 负责流程编排。
- 承载复杂业务逻辑的方法必须在方法上方增加注释，说明业务规则、关键分支、边界条件或处理原因。
- Java 代码空行必须克制：不要在 `import`、注解、字段、普通语句、链式调用、`if`/`try`/`return` 前后机械插入空行；只在结构分隔确有必要时保留一个空行。
- 注释用于解释规则、边界和原因，不写“给变量赋值”这类无信息注释。
- Swagger 描述使用中文，枚举值、状态值应说明取值含义。
- 保持 Java 8 兼容，不使用更高版本语法。

## 配置规范

- `application.yml` 中的连接信息是**开发环境**默认值，线上环境统一由 `docker-compose.yml` 的 `environment` 覆盖，不拆分多环境 profile 文件。
- 覆盖数据源时必须使用 `spring.datasource.dynamic.datasource.{名称}.*` 路径；本项目使用 `dynamic-datasource`，写 `spring.datasource.druid.url` 不生效。
- 不要把真实生产账号、密码、token、密钥、客户数据写入代码、配置、README、测试数据或示例。

## 测试规范

- 核心规则、金额计算、日期计算、状态流转、权限/租户边界、批量处理逻辑应优先补充单元测试。
- 测试使用 JUnit 5 + Mockito（`@ExtendWith(MockitoExtension.class)`），测试方法命名推荐 `should...` 风格。
- Service 层测试参考 `DemoServiceImplTest`：`ReflectionTestUtils.setField(service, "baseMapper", mapper)` 注入 Mock，必要时用 `TableInfoHelper.initTableInfo` 初始化表元数据。
- 断言应覆盖正常路径、边界条件和典型异常路径。
- 金额使用 `BigDecimal` 精确断言，避免浮点数；日期逻辑使用固定日期，避免依赖当前系统时间。

## AI 协作规范

1. 先阅读相关文件、配置和已有实现，再提出或执行修改。
2. 优先复用现有公共类、异常类型、返回模型、工具类和分层模式。
3. 修改范围应聚焦当前需求，不改无关业务、不做无关格式化。
4. 涉及接口、实体、数据库、事务、定时任务、导入导出时，应同步考虑测试和兼容性。
5. 生成代码后检查：
   - Controller 是否只负责入参和返回。
   - 返回值是否使用 `R<具体类型>`，分页是否使用 `PageResult<T>`。
   - 实体是否包含雪花主键、审计字段和 `userPoolId`。
   - 写操作是否有事务。
   - 业务失败是否统一 `throw new McsException(...)`。
   - 复杂 SQL 是否放在 Mapper XML 中。
   - 是否引入了不必要依赖或业务无关改动。
6. 完成后输出变更摘要、验证方式和未验证原因；未跑编译或测试时不声称“已通过”。
