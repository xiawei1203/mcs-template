package com.mcsgis.saas.module.demo.vo;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 * 示例列表行。响应模型放 vo 包，只暴露前端需要的字段。
 */
@Data
@ApiModel("示例列表行")
public class DemoListVo implements Serializable {

    private static final long serialVersionUID = 1L;

    @JsonSerialize(using = ToStringSerializer.class)
    @ApiModelProperty("主键id")
    private Long id;

    @ApiModelProperty("示例编码")
    private String demoCode;

    @ApiModelProperty("示例名称")
    private String demoName;

    @ApiModelProperty("状态：0-禁用 1-启用")
    private Integer status;

    @ApiModelProperty("排序值")
    private Integer sortNo;

    @ApiModelProperty("创建时间")
    private Date createTime;
}
