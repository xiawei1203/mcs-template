package com.mcsgis.saas;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

/**
 * @author: czl
 * @description
 * @create: 2024/1/15 18:40
 **/
@SpringBootApplication
@EnableFeignClients(basePackages = {"com.mcsgis.saas"})
@MapperScan(basePackages = {"com.mcsgis.saas.**.dao"})
public class TemplateApplication {

    public static void main(String[] args) {
        SpringApplication.run(TemplateApplication.class,args);
    }
}
