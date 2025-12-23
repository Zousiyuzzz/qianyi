<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="季度" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="quarter" required>
              <a-select v-model="model.quarter" placeholder="请选择季度" style="width: 100%">
                <a-select-option :value="1">第一季度</a-select-option>
                <a-select-option :value="2">第二季度</a-select-option>
                <a-select-option :value="3">第三季度</a-select-option>
                <a-select-option :value="4">第四季度</a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="月份" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="month" required>
              <a-month-picker placeholder="请选择月份" v-model="model.month" style="width: 100%" value-format="YYYY-MM-01" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="预估返点" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="estimatedRebate"
              required>
              <a-input-number v-model="model.estimatedRebate" placeholder="请输入预估返点" style="width: 100%" :min="0"
                :precision="2" :formatter="value => `${value}%`" :parser="value => value.replace('%', '')" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="实际返点" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="actualRebate">
              <a-input-number v-model="model.actualRebate" placeholder="请输入实际返点" style="width: 100%" :min="0"
                :precision="2" :formatter="value => `${value}%`" :parser="value => value.replace('%', '')" />
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
  name: 'TabBiddingRebateTemplateSubtableForm',
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
        quarter: undefined,
        month: undefined,
        estimatedRebate: undefined,
        actualRebate: undefined
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
        quarter: [
          { required: true, message: '请选择季度!' },
          { type: 'number', min: 1, max: 4, message: '季度必须为1-4之间的数字' }
        ],
        month: [
          { required: true, message: '请选择月份!' }
        ],
        estimatedRebate: [
          { required: true, message: '请输入预估返点!' },
          { type: 'number', min: 0, message: '预估返点必须大于等于0' }
        ]
      },
      url: {
        add: "/biddingRebateTemplateSubtable/add",
        edit: "/biddingRebateTemplateSubtable/edit",
        queryById: "/biddingRebateTemplateSubtable/queryById"
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
    add(biddingRebateId) {
      this.edit({ ...this.modelDefault, biddingRebateId });
    },
    edit(record) {
      // 处理返点数据，乘以100
      const processedRecord = {
        ...record,
        estimatedRebate: record.estimatedRebate ? record.estimatedRebate * 100 : undefined,
        actualRebate: record.actualRebate ? record.actualRebate * 100 : undefined
      };
      this.model = Object.assign({}, processedRecord);
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
          // 处理返点数据，除以100
          const submitData = {
            ...this.model,
            estimatedRebate: this.model.estimatedRebate ? this.model.estimatedRebate / 100 : undefined,
            actualRebate: this.model.actualRebate ? this.model.actualRebate / 100 : undefined
          };
          httpAction(httpurl, submitData, method).then((res) => {
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