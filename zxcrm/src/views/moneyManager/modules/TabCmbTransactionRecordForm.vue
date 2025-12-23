<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-model-item label="账户名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="accountName">
              <a-input v-model="model.accountName" placeholder="请输入账户名称"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="账户号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="accountNo">
              <a-input v-model="model.accountNo" placeholder="请输入账户号"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="交易日" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="transDate">
              <j-date v-model="model.transDate" placeholder="请选择交易日"></j-date>
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="交易时间" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="transTime">
              <a-input v-model="model.transTime" placeholder="请输入交易时间(HHmmss)"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="交易金额" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="transAmount">
              <a-input v-model="model.transAmount" placeholder="请输入交易金额"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="借贷码" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="loanCode">
              <a-input v-model="model.loanCode" placeholder="请输入借贷码"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="余额" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="acctOnlineBal">
              <a-input v-model="model.acctOnlineBal" placeholder="请输入余额"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="币种" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="currencyNbr">
              <a-input v-model="model.currencyNbr" placeholder="请输入币种"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="流水号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="transSequenceIdn">
              <a-input v-model="model.transSequenceIdn" placeholder="请输入流水号"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="交易类型" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="textCode">
              <a-input v-model="model.textCode" placeholder="请输入交易类型"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="收付方帐号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="ctpAcctNbr">
              <a-input v-model="model.ctpAcctNbr" placeholder="请输入收付方帐号"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="收付方名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="ctpAcctName">
              <a-input v-model="model.ctpAcctName" placeholder="请输入收付方名称"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="摘要" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="remarkTextClt">
              <a-textarea v-model="model.remarkTextClt" rows="3" placeholder="请输入摘要"></a-textarea>
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>
import { httpAction } from '@/api/manage'

export default {
  name: 'TabCmbTransactionRecordForm',
  props: {
    disabled: {
      type: Boolean,
      default: false,
      required: false
    }
  },
  data() {
    return {
      model: {},
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
      },
      confirmLoading: false,
      validatorRules: {
        accountName: [{ required: true, message: '请输入账户名称' }],
        accountNo: [{ required: true, message: '请输入账户号' }],
        transDate: [{ required: true, message: '请选择交易日' }]
      },
      url: {
        add: "/cmbTransactionRecord/add",
        edit: "/cmbTransactionRecord/edit"
      }
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    },
  },
  created() {
    this.modelDefault = Object.assign({}, this.model)
  },
  methods: {
    add(initialData) {
      this.edit(Object.assign({}, this.modelDefault, initialData || {}))
    },
    edit(record) {
      this.model = Object.assign({}, record)
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.confirmLoading = true
        let httpurl = ''
        let method = ''
        if (!this.model.id) {
          httpurl = this.url.add
          method = 'post'
        } else {
          httpurl = this.url.edit
          method = 'put'
        }
        httpAction(httpurl, this.model, method).then((res) => {
          if (res.success) {
            this.$message.success(res.message)
            const result = typeof res.result === 'object' && res.result !== null ? res.result : this.model
            this.$emit('ok', result)
          } else {
            this.$message.warning(res.message)
          }
        }).finally(() => {
          this.confirmLoading = false
        })
      })
    }
  }
}
</script>

<style scoped>
</style>
