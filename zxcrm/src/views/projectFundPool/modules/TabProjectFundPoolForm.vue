<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
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
            <a-form-model-item label="授信总额度" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="totalCreditLimit">
              <a-input-number v-model="model.totalCreditLimit" placeholder="请输入授信总额度" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="授信可用余额" :labelCol="labelCol" :wrapperCol="wrapperCol"
              prop="availableCreditBalance">
              <a-input-number v-model="model.availableCreditBalance" placeholder="请输入授信可用余额" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="对公现金备款" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="publicCashReserves">
              <a-input-number v-model="model.publicCashReserves" placeholder="请输入对公现金备款" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="对公授信欠款" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="publicCreditArrears">
              <a-input-number v-model="model.publicCreditArrears" placeholder="请输入对公授信欠款" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="对私现金备款" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="privateCashReserve">
              <a-input-number v-model="model.privateCashReserve" placeholder="请输入对私现金备款" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="对私授信欠款" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="privateCreditArrears">
              <a-input-number v-model="model.privateCreditArrears" placeholder="请输入对私授信欠款" style="width: 100%" />
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
  name: 'TabProjectFundPoolForm',
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
        add: "/projectFundPool/add",
        edit: "/projectFundPool/edit",
        queryById: "/projectFundPool/queryById"
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