package com.mcsgis.saas.module.demo.domain;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.Date;

/**
 * 示例实体，演示表实体的标准写法：雪花主键、用户池字段、审计四字段。
 * 新建业务实体时复制本类结构，替换 @TableName 与业务字段。
 */
@Data
@TableName("template_demo")
@ApiModel(value = "Demo", description = "示例对象")
public class Demo {

    @TableId(type = IdType.ASSIGN_ID)
    @JsonSerialize(using = ToStringSerializer.class)
    @ApiModelProperty(value = "主键id（雪花）", required = true)
    private Long id;

    @ApiModelProperty(value = "示例编码", required = true)
    @TableField("demo_code")
    private String demoCode;

    @ApiModelProperty(value = "示例名称", required = true)
    @TableField("demo_name")
    private String demoName;

    @ApiModelProperty("状态：0-禁用 1-启用")
    @TableField("status")
    private Integer status;

    @ApiModelProperty("排序值，升序")
    @TableField("sort_no")
    private Integer sortNo;

    @ApiModelProperty("备注")
    @TableField("remarks")
    private String remarks;

    @JsonSerialize(using = ToStringSerializer.class)
    @ApiModelProperty("用户池id")
    @TableField("user_pool_id")
    private Long userPoolId;

    @JsonSerialize(using = ToStringSerializer.class)
    @ApiModelProperty("创建人")
    @TableField(value = "create_id", fill = FieldFill.INSERT)
    private Long createId;

    @JsonSerialize(using = ToStringSerializer.class)
    @ApiModelProperty("更新人")
    @TableField(value = "update_id", fill = FieldFill.INSERT_UPDATE)
    private Long updateId;

    @ApiModelProperty("创建时间")
    @TableField(value = "create_time", fill = FieldFill.INSERT)
    private Date createTime;

    @ApiModelProperty("更新时间")
    @TableField(value = "update_time", fill = FieldFill.INSERT_UPDATE)
    private Date updateTime;
}
