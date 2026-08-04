package com.mcsgis.saas.config;

import com.baomidou.mybatisplus.core.handlers.MetaObjectHandler;
import com.mcsgis.saas.common.security.UserContextHolder;
import org.apache.ibatis.reflection.MetaObject;
import org.springframework.stereotype.Component;

import java.util.Date;

/**
 * @author: zhaowufei
 * @description
 * @create: 2024-01-17 13:41
 **/
@Component
public class MyMetaObjectHandler implements MetaObjectHandler {

     /**
     * 使用mp做添加操作时候，这个方法执行
     *
     * @param metaObject
     */
    @Override
    public void insertFill(MetaObject metaObject) {
        //设置属性值
        this.setFieldValByName("createTime", new Date(), metaObject);
        this.setFieldValByName("createId", UserContextHolder.getId(), metaObject);
        this.setFieldValByName("updateTime", new Date(), metaObject);
        this.setFieldValByName("updateId", UserContextHolder.getId(), metaObject);
    }

    /**
     * 使用mp做修改操作时候，这个方法执行
     *
     * @param metaObject
     */
    @Override
    public void updateFill(MetaObject metaObject) {
        this.setFieldValByName("updateTime", new Date(), metaObject);
        this.setFieldValByName("updateId", UserContextHolder.getId(), metaObject);
    }
}