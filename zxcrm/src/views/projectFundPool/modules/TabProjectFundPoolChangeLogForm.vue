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
          <a-col :span="24">
            <a-form-model-item label="资金性质（1：对公2：对私）" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="fundsNature">
              <a-input v-model="model.fundsNature" placeholder="请输入资金性质（1：对公2：对私）"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="变更类型（1：增加2：减少）" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="changeType">
              <a-input v-model="model.changeType" placeholder="请输入变更类型（1：增加2：减少）"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="业务场景（1：设置授信额度）" :labelCol="labelCol" :wrapperCol="wrapperCol"
              prop="businessScenario">
              <a-input v-model="model.businessScenario" placeholder="请输入业务场景（1：设置授信额度）"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="金额" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="money">
              <a-input-number v-model="model.money" placeholder="请输入金额" style="width: 100%" />
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
  name: 'TabProjectFundPoolChangeLogForm',
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
        add: "/projectFundPoolChangeLog/add",
        edit: "/projectFundPoolChangeLog/edit",
        queryById: "/projectFundPoolChangeLog/queryById"
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