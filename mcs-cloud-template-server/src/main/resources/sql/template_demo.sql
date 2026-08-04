-- sql/template_demo.sql
-- 示例表。DDL 统一放 sql/ 目录，每张表、每个字段必须有 COMMENT。

CREATE TABLE IF NOT EXISTS `template_demo`
(
    `id`           BIGINT       NOT NULL COMMENT '主键（雪花ID，由MyBatis-Plus生成）',
    `demo_code`    VARCHAR(64)  NOT NULL COMMENT '示例编码，规则 DEMO+6位流水号',
    `demo_name`    VARCHAR(128) NOT NULL COMMENT '示例名称',
    `status`       TINYINT      NOT NULL DEFAULT 1 COMMENT '状态：0-禁用 1-启用',
    `sort_no`      INT          NOT NULL DEFAULT 0 COMMENT '排序值，升序',
    `remarks`      VARCHAR(512)          DEFAULT NULL COMMENT '备注',
    `user_pool_id` BIGINT       NOT NULL COMMENT '用户池id（租户隔离字段）',
    `create_id`    BIGINT                DEFAULT NULL COMMENT '创建人',
    `create_time`  DATETIME(3)           DEFAULT NULL COMMENT '创建时间',
    `update_id`    BIGINT                DEFAULT NULL COMMENT '更新人',
    `update_time`  DATETIME(3)           DEFAULT NULL COMMENT '更新时间',
    PRIMARY KEY (`id`),
    -- 编码在同一用户池内唯一
    UNIQUE KEY `uk_user_pool_demo_code` (`user_pool_id`, `demo_code`),
    -- 租户分页列表：user_pool_id 放最左列，覆盖默认排序字段
    KEY `idx_user_pool_sort_create` (`user_pool_id`, `sort_no`, `create_time`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci COMMENT ='示例表';
