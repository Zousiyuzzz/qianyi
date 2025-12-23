<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="渠道标识" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="businessSign">
              <j-dict-select-tag placeholder="请选择渠道标识" v-model="model.businessSign"
                dictCode="channel_identify"></j-dict-select-tag>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="渠道名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="businessName">
              <a-input v-model="model.businessName" placeholder="请输入渠道名称"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="返点上限" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="rebate">
              <a-input-number v-model="model.rebate" placeholder="请输入返点上限" style="width: 100%" />
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>

import { duplicateCheck } from '@/api/api'
import { httpAction } from '@/api/manage'

export default {
  name: 'TabChannelForm',
  components: {
  },
  props: {
    //表单禁`
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
        businessSign: [{ required: true, message: '请选择渠道标识' }],
        businessName: [{ required: true, message: '请输入渠道名称' },
        { validator: this.validateChannelName }],
        rebate: [{ required: true, message: '请输入返点' }],
      },
      url: {
        add: "/business/add",
        edit: "/business/edit",
        queryById: "/business/queryById"
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
    validateChannelName(rule, value, callback) {
      var params = {
        tableName: 'tab_business',
        fieldName: 'business_name',
        fieldVal: value,
        dataId: this.model.id
      };
      duplicateCheck(params).then((res) => {
        if (res.success) {
          callback()
        } else {
          callback("渠道名称已存在!")
        }
      })
    },
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