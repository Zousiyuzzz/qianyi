<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="对公返点" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="externalRebate">
              <!-- 对公返点：消耗数据/(1+客户返点) -->
              <a-input-number v-model="model.externalRebate" placeholder="客户返点" :min="0" :precision="2"
                style="width: 100%;" :formatter="value => `${value}%`"
                :parser="value => value.replace('%', '')"></a-input-number>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="对私返点" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="privateRebate">
              <!--对私返点：消耗数据*(1-客户返点)-->
              <a-input-number v-model="model.privateRebate" placeholder="客户返点" :min="0" :precision="2"
                style="width: 100%;" :formatter="value => `${value}%`"
                :parser="value => value.replace('%', '')"></a-input-number>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="返点形式" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="rebateForm">
              <j-dict-select-tag v-model="model.rebateForm" placeholder="请选择返点形式" dictCode="rebate_type" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="返点模式" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="rebateMode">
              <j-dict-select-tag v-model="model.rebateMode" placeholder="请选择返点模式" dictCode="rebate_mode" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="生效日期" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="effectiveDate">
              <a-date-picker placeholder="请选择生效日期" :disabled="mdisabled" valueFormat="YYYY-MM-DD"
                v-model="model.effectiveDate" style="width: 100%;" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="remarks">
              <a-input v-model="model.remarks" placeholder="请输入备注"></a-input>
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
  name: 'RebateForm',
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
        rebateTeptId: '',
        externalRebate: '',
        privateRebate: '',
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
        add: "/customerRebateTemplateDetails/add",
        edit: "/customerRebateTemplateDetails/edit",
        queryById: "/customerRebateTemplateDetails/queryById"
      },
      validatorRules: {
        rebateForm: [{ required: true, message: '请选择返点形式!' }],
        rebateMode: [{ required: true, message: '请选择返点模式!' }],
        effectiveDate: [{ required: true, message: '请选择生效日期!' }],
        // externalRebate: [{
        //   validator: (rule, value, callback) => {
        //     // if ((value >= 0 && (this.model.privateRebate >= 0))) {
        //     //   callback(new Error('对公返点和对私返点至少有一个'));
        //     // } else {
        //     //   callback();
        //     // }
        //   },
        //   trigger: ['change', 'blur']
        // }],
        // privateRebate: [{
        //   validator: (rule, value, callback) => {
        //     if (value >= 0 && (this.model.externalRebate >= 0)) {
        //       callback(new Error('对公返点和对私返点至少有一个'));
        //     } else {
        //       callback();
        //     }
        //   },
        //   trigger: ['change', 'blur']
        // }]
      },
      idAdd: false,
      rebateTeptId: '',
      mdisabled: false
    }
  },
  watch: {
    // // 监听对公返点变化
    // 'model.externalRebate'(newVal) {
    //   if (newVal) {
    //     // 如果对公返点有值，清空对私返点并触发其校验
    //     this.model.privateRebate = undefined;
    //     this.$nextTick(() => {
    //       this.$refs.form.validateField('privateRebate');
    //     });
    //   }
    // },
    // // 监听对私返点变化
    // 'model.privateRebate'(newVal) {
    //   if (newVal) {
    //     // console.log(newVal)
    //     // 如果对私返点有值，清空对公返点并触发其校验
    //     this.model.externalRebate = undefined;
    //     this.$nextTick(() => {
    //       this.$refs.form.validateField('externalRebate');
    //     });
    //   }
    // }
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
    add(rebateTeptId) {
      this.model.rebateTeptId = rebateTeptId
      this.rebateTeptId = rebateTeptId
      this.idAdd = true
      this.edit(this.modelDefault);
    },
    edit(record) {
      if (record.id) {
        this.model.rebateTeptId = record.rebateTeptId
        this.rebateTeptId = record.rebateTeptId
        this.mdisabled = true
        this.model = Object.assign({}, record);
        this.model.externalRebate *= 100
        this.model.privateRebate *= 100
      } else {
        this.mdisabled = false
      }
      // this.idAdd = false
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
          httpAction(httpurl, {
            ...this.model,
            rebateTeptId: this.rebateTeptId,
            privateRebate: this.model.privateRebate / 100,
            externalRebate: this.model.externalRebate / 100,
          }, method).then((res) => {
            if (res.success) {
              // console.log("调用刷新消耗")
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