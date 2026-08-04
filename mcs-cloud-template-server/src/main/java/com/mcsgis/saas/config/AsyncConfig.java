package com.mcsgis.saas.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * 异步任务配置。
 * 新增业务线程池时按 commonTaskExecutor 的写法复制一个 Bean，并在 @Async 中指定 Bean 名，
 * 避免不同业务共用线程池相互阻塞。
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    public static final String COMMON_TASK_EXECUTOR = "commonTaskExecutor";

    @Bean(name = COMMON_TASK_EXECUTOR)
    public Executor commonTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(200);
        executor.setThreadNamePrefix("common-task-");
        // 队列满后由调用线程执行，保证任务不丢失
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}
