package com.mcsgis.saas.module.demo.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mcsgis.saas.module.demo.domain.Demo;

/**
 * 示例 Mapper。简单查询用 MyBatis-Plus 内置方法与 Wrapper，
 * 多表联查、复杂统计、批量更新等在 resources/mapper/demo/DemoMapper.xml 中实现，不写在注解里。
 */
public interface DemoMapper extends BaseMapper<Demo> {

    /**
     * 取当前用户池下 demo_code 的最大流水号，用于生成下一个编码。
     * 需要跨租户统计时才用 XML，普通查询无需自定义方法。
     */
    int selectMaxDemoCodeSeq();
}
