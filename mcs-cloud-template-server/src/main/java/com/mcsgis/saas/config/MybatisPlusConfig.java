package com.mcsgis.saas.config;

import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.handler.TenantLineHandler;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.TenantLineInnerInterceptor;
import com.mcsgis.saas.web.context.UserPoolContextHolder;
import net.sf.jsqlparser.expression.Expression;
import net.sf.jsqlparser.expression.LongValue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

/**
 * MyBatis-Plus 插件配置：多租户（用户池）行级隔离 + 分页。
 */
@Configuration
public class MybatisPlusConfig {

    /**
     * 无需租户隔离的表名，例如字典表、全局配置表，或不含 user_pool_id 列的表。
     * 表未加入此列表却缺少 user_pool_id 列时，租户拦截器会拼出不存在的列导致 SQL 报错。
     */
    private static final List<String> IGNORE_TABLE = new ArrayList<>();

    /**
     * 上下文无用户池时使用的兜底值。0 不会命中任何业务数据，属于 fail-closed 处理，
     * 目的是宁可查不到也不能跨租户查到别人的数据。
     */
    private static final long NO_TENANT_ID = 0L;

    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        interceptor.addInnerInterceptor(new TenantLineInnerInterceptor(new TenantLineHandler() {
            @Override
            public Expression getTenantId() {
                Long userPoolId = UserPoolContextHolder.getId();
                return new LongValue(userPoolId != null ? userPoolId : NO_TENANT_ID);
            }

            @Override
            public String getTenantIdColumn() {
                return "user_pool_id";
            }

            @Override
            public boolean ignoreTable(String tableName) {
                return IGNORE_TABLE.contains(tableName);
            }
        }));
        PaginationInnerInterceptor paginationInnerInterceptor = new PaginationInnerInterceptor();
        paginationInnerInterceptor.setDbType(DbType.MYSQL);
        interceptor.addInnerInterceptor(paginationInnerInterceptor);
        return interceptor;
    }
}
