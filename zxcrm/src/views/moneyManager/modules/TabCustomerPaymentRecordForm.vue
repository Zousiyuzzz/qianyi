<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="客户" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="customerName">
              <JSearchSelectTag placeholder="请选择客户" v-model:value="model.customerId"
                dict="tab_customerManage,customer_name,id,del_flag = '0'" async>
              </JSearchSelectTag>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="项目主体" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="customerBankAccountId">
              <JSearchSelectTag placeholder="请选择项目主体" v-model:value="model.customerBankAccountId"
                dict="tab_bank_account,corporate_name,id,del_flag = '0' and source = '1'" async>
              </JSearchSelectTag>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="到账时间" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="paymentDate">
              <j-date placeholder="请选择到账时间" v-model="model.paymentDate" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="到账金额" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="amountReceived">
              <a-input-number v-model="model.amountReceived" placeholder="请输入到账金额" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="我方主体" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="weBankAccountId">
              <JSearchSelectTag placeholder="请选择我方主体" v-model:value="model.weBankAccountId"
                dict="tab_bank_account,corporate_name,id,del_flag = '0' and source = '2'" async>
              </JSearchSelectTag>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="支付流水号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="serialNumber">
              <a-input v-model="model.serialNumber" placeholder="请输入支付流水号"></a-input>
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
  name: 'TabCustomerPaymentRecordForm',
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
        add: "/customerPaymentRecord/add",
        edit: "/customerPaymentRecord/edit",
        queryById: "/customerPaymentRecord/queryById"
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