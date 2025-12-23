package org.jeecg.modules.demo.diagnosisTaskResult.entity;

import java.io.Serializable;
import java.io.UnsupportedEncodingException;
import java.util.Date;
import java.math.BigDecimal;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableLogic;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonFormat;
import org.springframework.format.annotation.DateTimeFormat;
import org.jeecgframework.poi.excel.annotation.Excel;
import org.jeecg.common.aspect.annotation.Dict;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

/**
 * @Description: 前侧任务结果表
 * @Author: jeecg-boot
 * @Date:   2025-06-05
 * @Version: V1.0
 */
@Data
@TableName("tab_diagnosis_task_result")
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = false)
@ApiModel(value="tab_diagnosis_task_result对象", description="前侧任务结果表")
public class TabDiagnosisTaskResult implements Serializable {
    private static final long serialVersionUID = 1L;

	/**主键*/
	@TableId(type = IdType.ASSIGN_ID)
    @ApiModelProperty(value = "主键")
    private java.lang.String id;
	/**创建人*/
    @ApiModelProperty(value = "创建人")
    private java.lang.String createBy;
	/**创建日期*/
	@JsonFormat(timezone = "GMT+8",pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern="yyyy-MM-dd HH:mm:ss")
    @ApiModelProperty(value = "创建日期")
    private java.util.Date createTime;
	/**更新人*/
    @ApiModelProperty(value = "更新人")
    private java.lang.String updateBy;
	/**更新日期*/
	@JsonFormat(timezone = "GMT+8",pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern="yyyy-MM-dd HH:mm:ss")
    @ApiModelProperty(value = "更新日期")
    private java.util.Date updateTime;
	/**删除标识（0：未删除1：已删除）*/
	@Excel(name = "删除标识（0：未删除1：已删除）", width = 15)
    @ApiModelProperty(value = "删除标识（0：未删除1：已删除）")
    @TableLogic
    private java.lang.String delFlag;
	/**前侧任务表id*/
	@Excel(name = "前侧任务表id", width = 15)
    @ApiModelProperty(value = "前侧任务表id")
    private java.lang.String diagnosisTaskId;
	/**抖音前侧任务id*/
	@Excel(name = "抖音前侧任务id", width = 15)
    @ApiModelProperty(value = "抖音前侧任务id")
    private java.lang.String taskId;
	/**视频id*/
	@Excel(name = "视频id", width = 15)
    @ApiModelProperty(value = "视频id")
    private java.lang.String videoId;
	/**素材id*/
	@Excel(name = "素材id", width = 15)
    @ApiModelProperty(value = "素材id")
    private java.lang.String materialId;
	/**任务状态允许值: PENDING SUCCESS FAILED*/
	@Excel(name = "任务状态允许值: PENDING SUCCESS FAILED", width = 15)
    @ApiModelProperty(value = "任务状态允许值: PENDING SUCCESS FAILED")
    private java.lang.String status;
	/**是否AD优质素材，允许值 YES AD优质;NO AD非优质;UNKNOWN 无检测结果*/
	@Excel(name = "是否AD优质素材，允许值 YES AD优质;NO AD非优质;UNKNOWN 无检测结果", width = 15)
    @ApiModelProperty(value = "是否AD优质素材，允许值 YES AD优质;NO AD非优质;UNKNOWN 无检测结果")
    private java.lang.String isAdHighQualityMaterial;
	/**是否千川优质素材，允许值 YES 千川优质;NO 千川非优质; UNKNOWN 无检测结果*/
	@Excel(name = "是否千川优质素材，允许值 YES 千川优质;NO 千川非优质; UNKNOWN 无检测结果", width = 15)
    @ApiModelProperty(value = "是否千川优质素材，允许值 YES 千川优质;NO 千川非优质; UNKNOWN 无检测结果")
    private java.lang.String isEcpHighQualityMaterial;
	/**是否低效，允许值 YES 低效;NO 非低效;UNKNOWN 无检测结果*/
	@Excel(name = "是否低效，允许值 YES 低效;NO 非低效;UNKNOWN 无检测结果", width = 15)
    @ApiModelProperty(value = "是否低效，允许值 YES 低效;NO 非低效;UNKNOWN 无检测结果")
    private java.lang.String isInefficientMaterial;
	/**是否首发，允许值 YES 首发:NO 非首发;UNKNOWN 无检测结果*/
	@Excel(name = "是否首发，允许值 YES 首发:NO 非首发;UNKNOWN 无检测结果", width = 15)
    @ApiModelProperty(value = "是否首发，允许值 YES 首发:NO 非首发;UNKNOWN 无检测结果")
    private java.lang.String isFirstPublishMaterial;
	/**非AD优质素材的原因*/
	@Excel(name = "非AD优质素材的原因", width = 15)
    @ApiModelProperty(value = "非AD优质素材的原因")
    private java.lang.String notAdHighQualityReason;
	/**非千川优质素材的原因*/
	@Excel(name = "非千川优质素材的原因", width = 15)
    @ApiModelProperty(value = "非千川优质素材的原因")
    private java.lang.String notEcpHighQualityReason;
	/**创建任务状态（0：成功1：失败）*/
	@Excel(name = "创建任务状态（0：成功1：失败）", width = 15)
    @ApiModelProperty(value = "创建任务状态（0：成功1：失败）")
    private java.lang.String taskState;
	/**失败code*/
	@Excel(name = "失败code", width = 15)
    @ApiModelProperty(value = "失败code")
    private java.lang.String errCode;
	/**失败原因*/
	@Excel(name = "失败原因", width = 15)
    @ApiModelProperty(value = "失败原因")
    private java.lang.String errMessage;
}
