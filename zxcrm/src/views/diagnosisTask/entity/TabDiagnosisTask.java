package org.jeecg.modules.demo.diagnosisTask.entity;

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
 * @Description: 前侧任务表
 * @Author: jeecg-boot
 * @Date:   2025-06-05
 * @Version: V1.0
 */
@Data
@TableName("tab_diagnosis_task")
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = false)
@ApiModel(value="tab_diagnosis_task对象", description="前侧任务表")
public class TabDiagnosisTask implements Serializable {
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
	/**渠道名称*/
	@Excel(name = "渠道名称", width = 15)
    @ApiModelProperty(value = "渠道名称")
    private java.lang.String channelName;
	/**平台标识*/
	@Excel(name = "平台标识", width = 15)
    @ApiModelProperty(value = "平台标识")
    private java.lang.String channelPlatform;
	/**渠道标识*/
	@Excel(name = "渠道标识", width = 15)
    @ApiModelProperty(value = "渠道标识")
    private java.lang.String channelSign;
	/**代理商Id*/
	@Excel(name = "代理商Id", width = 15)
    @ApiModelProperty(value = "代理商Id")
    private java.lang.String agentId;
	/**素材列表*/
	@Excel(name = "素材列表", width = 15)
    @ApiModelProperty(value = "素材列表")
    private java.lang.String videoIds;
	/**广告主id*/
	@Excel(name = "广告主id", width = 15)
    @ApiModelProperty(value = "广告主id")
    private java.lang.String advertiserId;
	/**推广id*/
	@Excel(name = "推广id", width = 15)
    @ApiModelProperty(value = "推广id")
    private java.lang.String refPromotionId;
	/**目标投放平台（QIANCHUAN；AD）*/
	@Excel(name = "目标投放平台（QIANCHUAN；AD）", width = 15)
    @ApiModelProperty(value = "目标投放平台（QIANCHUAN；AD）")
    private java.lang.String platform;
	/**推广转化目标*/
	@Excel(name = "推广转化目标", width = 15)
    @ApiModelProperty(value = "推广转化目标")
    private java.lang.String externalAction;
	/**受众性别（ALL；MALE；DEMALE）*/
	@Excel(name = "受众性别（ALL；MALE；DEMALE）", width = 15)
    @ApiModelProperty(value = "受众性别（ALL；MALE；DEMALE）")
    private java.lang.String audienceGender;
	/**受众年龄（ALL；18-23；24-30；31-40；41-49；50）*/
	@Excel(name = "受众年龄（ALL；18-23；24-30；31-40；41-49；50）", width = 15)
    @ApiModelProperty(value = "受众年龄（ALL；18-23；24-30；31-40；41-49；50）")
    private java.lang.String audienceAge;
	/**受众地区*/
	@Excel(name = "受众地区", width = 15)
    @ApiModelProperty(value = "受众地区")
    private java.lang.String audienceRegion;
	/**受众网络（ALL；5G；4G；3G；2G；WIFI）*/
	@Excel(name = "受众网络（ALL；5G；4G；3G；2G；WIFI）", width = 15)
    @ApiModelProperty(value = "受众网络（ALL；5G；4G；3G；2G；WIFI）")
    private java.lang.String audienceNetwork;
	/**客户主体名称*/
	@Excel(name = "客户主体名称", width = 15)
    @ApiModelProperty(value = "客户主体名称")
    private java.lang.String cusName;
	/**计费方式（OCPC；CPA；OCPM）*/
	@Excel(name = "计费方式（OCPC；CPA；OCPM）", width = 15)
    @ApiModelProperty(value = "计费方式（OCPC；CPA；OCPM）")
    private java.lang.String pricingType;
	/**是否最优成本出价*/
	@Excel(name = "是否最优成本出价", width = 15)
    @ApiModelProperty(value = "是否最优成本出价")
    private java.lang.String costCap;
	/**是否稳定成本出价*/
	@Excel(name = "是否稳定成本出价", width = 15)
    @ApiModelProperty(value = "是否稳定成本出价")
    private java.lang.String targetCost;
	/**是否最大转化出价*/
	@Excel(name = "是否最大转化出价", width = 15)
    @ApiModelProperty(value = "是否最大转化出价")
    private java.lang.String nobid;
	/**目标转化成本*/
	@Excel(name = "目标转化成本", width = 15)
    @ApiModelProperty(value = "目标转化成本")
    private java.math.BigDecimal cpaBid;
	/**目标点击成本*/
	@Excel(name = "目标点击成本", width = 15)
    @ApiModelProperty(value = "目标点击成本")
    private java.math.BigDecimal cpcBid;
	/**预算金额*/
	@Excel(name = "预算金额", width = 15)
    @ApiModelProperty(value = "预算金额")
    private java.math.BigDecimal budget;
}
