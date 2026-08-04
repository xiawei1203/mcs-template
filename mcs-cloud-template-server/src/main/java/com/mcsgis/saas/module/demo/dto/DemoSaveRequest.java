package com.mcsgis.saas.module.demo.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.io.Serializable;

/**
 * 示例保存请求。入参模型放 dto 包，校验用 JSR-303 注解，提示信息使用中文。
 */
@Data
@ApiModel("示例保存请求")
public class DemoSaveRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotBlank(message = "示例名称不能为空")
    @Size(max = 128, message = "示例名称长度不能超过128")
    @ApiModelProperty(value = "示例名称", required = true)
    private String demoName;

    @Min(value = 0, message = "状态取值只能为0或1")
    @Max(value = 1, message = "状态取值只能为0或1")
    @ApiModelProperty("状态：0-禁用 1-启用。新增不传默认启用，编辑不传保留原值")
    private Integer status;

    @Min(value = 0, message = "排序值不能小于0")
    @ApiModelProperty("排序值，升序。新增不传默认0，编辑不传保留原值")
    private Integer sortNo;

    @Size(max = 512, message = "备注长度不能超过512")
    @ApiModelProperty("备注")
    private String remarks;
}
