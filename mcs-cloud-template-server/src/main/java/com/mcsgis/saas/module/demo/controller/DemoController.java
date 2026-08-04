package com.mcsgis.saas.module.demo.controller;

import com.mcsgis.saas.common.data.PageResult;
import com.mcsgis.saas.common.data.R;
import com.mcsgis.saas.module.demo.domain.Demo;
import com.mcsgis.saas.module.demo.dto.DemoSaveRequest;
import com.mcsgis.saas.module.demo.service.DemoService;
import com.mcsgis.saas.module.demo.vo.DemoListVo;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

/**
 * 示例接口。Controller 只做参数接收、校验、调用 Service 与返回 R 包装，不写业务逻辑。
 */
@Validated
@RestController
@RequestMapping("/v1/demos")
@Api(tags = "示例模块")
public class DemoController {

    @Autowired
    private DemoService demoService;

    @GetMapping
    @ApiOperation("分页查询示例（关键词匹配名称/编码）")
    public R<PageResult<DemoListVo>> pageList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) @ApiParam("示例名称或编码") String keyword,
            @RequestParam(required = false) @ApiParam("状态：0-禁用 1-启用") Integer status) {
        return R.success(demoService.pageList(page, pageSize, keyword, status));
    }

    @GetMapping("/{id}")
    @ApiOperation("示例详情")
    public R<Demo> detail(
            @ApiParam(value = "主键", required = true) @PathVariable("id") @NotNull Long id) {
        return R.success(demoService.detail(id));
    }

    @PostMapping
    @ApiOperation("新增示例（编码由后端自动生成）")
    public R<Void> add(@RequestBody @Valid DemoSaveRequest request) {
        demoService.add(request);
        return R.success();
    }

    @PutMapping("/{id}")
    @ApiOperation("编辑示例（不修改示例编码）")
    public R<Void> update(
            @ApiParam(value = "主键", required = true) @PathVariable("id") @NotNull Long id,
            @RequestBody @Valid DemoSaveRequest request) {
        demoService.updateById(id, request);
        return R.success();
    }

    @DeleteMapping("/{id}")
    @ApiOperation("删除示例（仅禁用状态可删除）")
    public R<Void> delete(
            @ApiParam(value = "主键", required = true) @PathVariable("id") @NotNull Long id) {
        demoService.removeByIdChecked(id);
        return R.success();
    }
}
