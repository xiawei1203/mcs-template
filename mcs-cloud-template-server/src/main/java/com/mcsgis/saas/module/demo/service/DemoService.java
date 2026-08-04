package com.mcsgis.saas.module.demo.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.mcsgis.saas.common.data.PageResult;
import com.mcsgis.saas.module.demo.domain.Demo;
import com.mcsgis.saas.module.demo.dto.DemoSaveRequest;
import com.mcsgis.saas.module.demo.vo.DemoListVo;

/**
 * 示例业务接口。
 */
public interface DemoService extends IService<Demo> {

    PageResult<DemoListVo> pageList(int page, int pageSize, String keyword, Integer status);

    Demo detail(Long id);

    void add(DemoSaveRequest request);

    void updateById(Long id, DemoSaveRequest request);

    void removeByIdChecked(Long id);
}
