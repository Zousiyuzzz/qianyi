<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="删除标识（0：未删除1：已删除）" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="delFlag">
              <a-input v-model="model.delFlag" placeholder="请输入删除标识（0：未删除1：已删除）"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="渠道名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="channelName">
              <a-input v-model="model.channelName" placeholder="请输入渠道名称"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="平台标识" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="channelPlatform">
              <a-input v-model="model.channelPlatform" placeholder="请输入平台标识"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="渠道标识" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="channelSign">
              <a-input v-model="model.channelSign" placeholder="请输入渠道标识"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="代理商Id" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="agentId">
              <a-input v-model="model.agentId" placeholder="请输入代理商Id"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="素材列表" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="videoIds">
              <a-textarea v-model="model.videoIds" rows="4" placeholder="请输入素材列表" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="广告主id" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="advertiserId">
              <a-input v-model="model.advertiserId" placeholder="请输入广告主id"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="推广id" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="refPromotionId">
              <a-input v-model="model.refPromotionId" placeholder="请输入推广id"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="目标投放平台（QIANCHUAN；AD）" :labelCol="labelCol" :wrapperCol="wrapperCol"
              prop="platform">
              <a-input v-model="model.platform" placeholder="请输入目标投放平台（QIANCHUAN；AD）"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="推广转化目标" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="externalAction">
              <a-input v-model="model.externalAction" placeholder="请输入推广转化目标"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="受众性别（ALL；MALE；DEMALE）" :labelCol="labelCol" :wrapperCol="wrapperCol"
              prop="audienceGender">
              <a-input v-model="model.audienceGender" placeholder="请输入受众性别（ALL；MALE；DEMALE）"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="受众年龄（ALL；18-23；24-30；31-40；41-49；50）" :labelCol="labelCol"
              :wrapperCol="wrapperCol" prop="audienceAge">
              <a-input v-model="model.audienceAge" placeholder="请输入受众年龄（ALL；18-23；24-30；31-40；41-49；50）"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="受众地区" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="audienceRegion">
              <a-input v-model="model.audienceRegion" placeholder="请输入受众地区"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="受众网络（ALL；5G；4G；3G；2G；WIFI）" :labelCol="labelCol" :wrapperCol="wrapperCol"
              prop="audienceNetwork">
              <a-input v-model="model.audienceNetwork" placeholder="请输入受众网络（ALL；5G；4G；3G；2G；WIFI）"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="客户主体名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="cusName">
              <a-input v-model="model.cusName" placeholder="请输入客户主体名称"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="计费方式（OCPC；CPA；OCPM）" :labelCol="labelCol" :wrapperCol="wrapperCol"
              prop="pricingType">
              <a-input v-model="model.pricingType" placeholder="请输入计费方式（OCPC；CPA；OCPM）"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="是否最优成本出价" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="costCap">
              <a-input v-model="model.costCap" placeholder="请输入是否最优成本出价"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="是否稳定成本出价" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="targetCost">
              <a-input v-model="model.targetCost" placeholder="请输入是否稳定成本出价"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="是否最大转化出价" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="nobid">
              <a-input v-model="model.nobid" placeholder="请输入是否最大转化出价"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="目标转化成本" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="cpaBid">
              <a-input-number v-model="model.cpaBid" placeholder="请输入目标转化成本" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="目标点击成本" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="cpcBid">
              <a-input-number v-model="model.cpcBid" placeholder="请输入目标点击成本" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="预算金额" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="budget">
              <a-input-number v-model="model.budget" placeholder="请输入预算金额" style="width: 100%" />
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>

import { httpAction, getAction, postAction } from '@/api/manage'
import { validateDuplicateValue } from '@/utils/util'

export default {
  name: 'TabDiagnosisTaskForm',
  components: {
  },
  props: {
    //表单禁用
    disabled: {
      type: Boolean,
      default: false,
      required: false
    }
  },
  data() {
    return {
      model: {
      },
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      confirmLoading: false,
      validatorRules: {
      },
      url: {
        add: "/diagnosisTask/tabDiagnosisTask/add",
        edit: "/diagnosisTask/tabDiagnosisTask/edit",
        queryById: "/diagnosisTask/tabDiagnosisTask/queryById"
      }
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    },
  },
  created() {
    //备份model原始值
    this.modelDefault = JSON.parse(JSON.stringify(this.model));
  },
  methods: {
    add() {
      this.edit(this.modelDefault);
    },
    edit(record) {
      this.model = Object.assign({}, record);
      this.visible = true;
    },
    submitForm() {
      const that = this;
      // 触发表单验证
      this.$refs.form.validate(valid => {
        if (valid) {
          that.confirmLoading = true;
          let httpurl = '';
          let method = '';
          if (!this.model.id) {
            httpurl += this.url.add;
            method = 'post';
          } else {
            httpurl += this.url.edit;
            method = 'put';
          }
          httpAction(httpurl, this.model, method).then((res) => {
            if (res.success) {
              that.$message.success(res.message);
              that.$emit('ok');
            } else {
              that.$message.warning(res.message);
            }
          }).finally(() => {
            that.confirmLoading = false;
          })
        }

      })
    },
  }
}
</script>