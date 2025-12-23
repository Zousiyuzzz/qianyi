<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="代理商名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="advertiserName">
              <a-input v-model="model.advertiserName" placeholder="请输入代理商名称"></a-input>
            </a-form-model-item>
          </a-col>

          <a-col :span="24">
            <a-form-model-item label="代理商Id" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="advertiserId">
              <a-input v-model="model.advertiserId" placeholder="请输入代理商Id"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="渠道标识" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="channelSign">
              <j-dict-select-tag v-model="model.channelSign" placeholder="渠道标识" dictCode="channelSign_system" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="资金类型" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="capitalType">
              <!-- 调试: platform={{ platform }}, disabled={{ !platform }} -->
              <a-select v-model="model.capitalType" placeholder="请选择默认资金类型" :disabled="!platform" :key="platform">
                <a-select-option v-if="platform === 'DY'" value="CREDIT_BIDDING">授信竞价</a-select-option>
                <a-select-option v-if="platform === 'DY'" value="CREDIT_BRAND">授信品牌</a-select-option>
                <a-select-option v-if="platform === 'DY'" value="CREDIT_GENERAL">授信通用</a-select-option>
                <a-select-option v-if="platform === 'DY'" value="PREPAY_BIDDING">预付竞价</a-select-option>
                <a-select-option v-if="platform === 'DY'" value="PREPAY_BRAND">预付品牌</a-select-option>
                <a-select-option v-if="platform === 'DY'" value="PREPAY_GENERAL">预付通用</a-select-option>
                <a-select-option v-if="platform === 'TX'" value="FUND_TYPE_CREDIT_ROLL">竞价信用账户</a-select-option>
                <a-select-option v-if="platform === 'TX'" value="FUND_TYPE_CASH">现金账户</a-select-option>
                <a-select-option v-if="platform === 'TX'" value="FUND_TYPE_TEST_VIRTUAL">测试虚拟金账户</a-select-option>
                <a-select-option v-if="platform === 'TX'" value="FUND_TYPE_GIFT">赠送账户</a-select-option>
                <a-select-option v-if="platform === 'KS'" value="1">现金</a-select-option>
                <a-select-option v-if="platform === 'KS'" value="2">信用</a-select-option>
                <a-select-option v-if="platform === 'KS'" value="6">现金+信用</a-select-option>
                <a-select-option v-if="platform === 'XHS'" value="1">现金</a-select-option>
                <a-select-option v-if="platform === 'XHS'" value="2">信用</a-select-option>
                <a-select-option v-if="platform === 'CJHC'" value="1">现金</a-select-option>
                <a-select-option v-if="platform === 'CJHC'" value="2">信用</a-select-option>
                <a-select-option v-if="platform === 'BLBL'" value="1">现金</a-select-option>
                <a-select-option v-if="platform === 'BLBL'" value="2">信用</a-select-option>
                <a-select-option v-if="platform === 'WYMS'" value="2">信用</a-select-option>
                <a-select-option v-if="platform === 'WYMS'" value="1">现金</a-select-option>

              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="是否授权API" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="isMediaPlatform">
              <a-select v-model="model.isMediaPlatform" placeholder="请选择默认资金类型">
                <a-select-option value="0">是</a-select-option>
                <a-select-option value="1">否</a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="remarks">
              <a-textarea v-model="model.remarks" rows="4" placeholder="请输入备注" />
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
  name: 'TabAdvertiserInfoForm',
  components: {
  },
  props: {
    //表单禁用  
    disabled: {
      type: Boolean,
      default: false,
      required: false
    },
  },
  data() {
    return {
      model: {
        isMediaPlatform: '1',
        channelSign: ''
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
        channelSign: [
          { required: true, message: '请选择渠道标识!' }
        ],
        advertiserId: [
          { required: true, message: '请输入代理商Id!' }
        ],
        advertiserName: [
          { required: true, message: '请输入代理商名称!' }
        ]
      },
      url: {
        add: "/advertiserInfo/add",
        edit: "/advertiserInfo/edit",
        queryById: "/advertiserInfo/queryById"
      }
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    },
    platform() {
      // console.log('计算platform，channelSign:', this.model.channelSign)
      if (!this.model.channelSign) return ''
      const parts = this.model.channelSign.split('-')
      const result = parts.length > 0 ? parts[0] : this.model.channelSign
      // console.log('platform结果:', result)
      return result
    }
  },
  watch: {
    'model.channelSign'(newVal) {
      // console.log('渠道标识变化:', newVal)
      this.$set(this.model, 'capitalType', '')
      // 强制更新
      this.$nextTick(() => {
        this.$forceUpdate()
      })
    }
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