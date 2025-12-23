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
            <a-form-model-item label="项目ID" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="proId">
              <a-input v-model="model.proId" placeholder="请输入项目ID"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="项目名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="proName">
              <a-input v-model="model.proName" placeholder="请输入项目名称"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="代理商id" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="agentId">
              <a-input v-model="model.agentId" placeholder="请输入代理商id"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="代理商名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="agentName">
              <a-input v-model="model.agentName" placeholder="请输入代理商名称"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="转入方账户Id" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="targetAdvertiserId">
              <a-input v-model="model.targetAdvertiserId" placeholder="请输入转入方账户Id"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="转入方账户名称" :labelCol="labelCol" :wrapperCol="wrapperCol"
              prop="targetAdvertiserName">
              <a-input v-model="model.targetAdvertiserName" placeholder="请输入转入方账户名称"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="转出方账户Id" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="sourceAdvertiserId">
              <a-input v-model="model.sourceAdvertiserId" placeholder="请输入转出方账户Id"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="转出方账户名称" :labelCol="labelCol" :wrapperCol="wrapperCol"
              prop="sourceAdvertiserName">
              <a-input v-model="model.sourceAdvertiserName" placeholder="请输入转出方账户名称"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="资金性质（1：对公2：对私）" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="fundsNature">
              <a-input v-model="model.fundsNature" placeholder="请输入资金性质（1：对公2：对私）"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="交易类型（1：充值2：转账3：退款）" :labelCol="labelCol" :wrapperCol="wrapperCol"
              prop="tradeType">
              <a-input v-model="model.tradeType" placeholder="请输入交易类型（1：充值2：转账3：退款）"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="返点形式:1：返货2：返现)" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="rebateForm">
              <a-input v-model="model.rebateForm" placeholder="请输入返点形式:1：返货2：返现)"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="返点数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="rebateNum">
              <a-input-number v-model="model.rebateNum" placeholder="请输入返点数" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="媒体流水号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="mediaSerialNumber">
              <a-input v-model="model.mediaSerialNumber" placeholder="请输入媒体流水号"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="状态(1:成功2:处理中3:失败4:已取消)" :labelCol="labelCol" :wrapperCol="wrapperCol"
              prop="state">
              <a-input v-model="model.state" placeholder="请输入状态(1:成功2:处理中3:失败4:已取消)"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="批次号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="batchNumber">
              <a-input v-model="model.batchNumber" placeholder="请输入批次号"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="记录来源(1:微信API 2:web客户端3：H5工作台4：微信小程序)" :labelCol="labelCol"
              :wrapperCol="wrapperCol" prop="recordSource">
              <a-input v-model="model.recordSource" placeholder="请输入记录来源(1:微信API 2:web客户端3：H5工作台4：微信小程序)"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="交易金额" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="amount">
              <a-input-number v-model="model.amount" placeholder="请输入交易金额" style="width: 100%" />
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>

import { httpAction, getAction } from '@/api/manage'
import { validateDuplicateValue } from '@/utils/util'

export default {
  name: 'TabFundTransferRecordForm',
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
        add: "/fundTransferRecord/add",
        edit: "/fundTransferRecord/edit",
        queryById: "/fundTransferRecord/queryById"
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