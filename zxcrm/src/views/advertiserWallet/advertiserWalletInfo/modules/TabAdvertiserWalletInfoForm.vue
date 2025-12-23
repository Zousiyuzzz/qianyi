<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="代理商" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="advertiserId">
              <JSearchSelectTag placeholder="请选择代理商" v-model="model.advertiserId"
                dict="tab_advertiser_info,advertiser_name,id,del_flag = '0' and channel_sign = 'TX-GDT'" async
                allowClear />
            </a-form-model-item>
          </a-col>
          <!-- <a-col :span="24">
            <a-form-model-item label="媒体平台" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="isMediaPlatform">
              <a-select v-model="model.isMediaPlatform" placeholder="请选择媒体平台">
                <a-select-option value="0">是</a-select-option>
                <a-select-option value="1">否</a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col> -->
          <a-col :span="24">
            <a-form-model-item label="项目" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="proId">
              <JSearchSelectTag placeholder="请选择项目" v-model="model.proId"
                dict="tab_projectManage,pro_name,id,del_flag = '0'" async allowClear />
            </a-form-model-item>
          </a-col>
          <a-col :span="24" v-if="model.proId">
            <a-form-model-item label="返点政策模板" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="rebateTeptId">
              <JSearchSelectTag placeholder="请选择返点模板" v-model="model.rebateTeptId"
                :dict="`tab_customer_rebate_template,rebate_name,id,del_flag = '0' and customer_id='${model.proId}'`"
                async allowClear />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="钱包ID" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="walletId">
              <a-input v-model="model.walletId" placeholder="请输入钱包ID"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="钱包名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="walletName">
              <a-input v-model="model.walletName" placeholder="请输入钱包名称"></a-input>
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
  name: 'TabAdvertiserWalletInfoForm',
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
        advertiserId: [
          { required: true, message: '请选择代理商!' }
        ],
        // isMediaPlatform: [
        //   { required: true, message: '请选择媒体平台!' }
        // ],
        proId: [
          { required: true, message: '请选择项目!' }
        ],
        rebateTeptId: [
          { required: true, message: '请选择返点政策模板!' }
        ],
        walletId: [
          { required: true, message: '请输入钱包ID!' }
        ],
        walletName: [
          { required: true, message: '请输入钱包名称!' }
        ]
      },
      url: {
        add: "/advertiserWalletInfo/add",
        edit: "/advertiserWalletInfo/edit",
        queryById: "/advertiserWalletInfo/queryById"
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