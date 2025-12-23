<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="开户行" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="bankType">
              <a-select v-model="model.bankType" placeholder="请输入开户行">
                <a-select-option value="cmb">招商银行</a-select-option>
                <a-select-option value="icbc">工商银行</a-select-option>
                <a-select-option value="abc">农业银行</a-select-option>
                <a-select-option value="boc">中国银行</a-select-option>
                <a-select-option value="ccb">建设银行</a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="银行账号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="accountNo">
              <a-input v-model="model.accountNo" placeholder="请输入银行账号"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="公司名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="accountName">
              <a-input v-model="model.accountName" placeholder="请输入公司名称"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="remark">
              <a-textarea v-model="model.remark" rows="3" placeholder="请输入备注"></a-textarea>
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
  name: 'TabBankAccountConfigForm',
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
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      confirmLoading: false,
      validatorRules: {
        accountNo: [{ required: true, message: '请输入账户号' }],
        accountName: [{ required: true, message: '请输入账户名称' }]
      },
      url: {
        add: "/bankAccountConfig/add",
        edit: "/bankAccountConfig/edit"
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

<style scoped></style>
