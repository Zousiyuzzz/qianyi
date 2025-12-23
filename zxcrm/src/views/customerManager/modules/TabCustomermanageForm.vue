<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="客户主体" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="customerName">
              <a-input v-model="model.customerName" placeholder="请输入客户主体"></a-input>
            </a-form-model-item>
          </a-col>
          <!-- <a-col :span="24">
            <a-form-model-item label="客户初始行业" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="industry">
              <a-input v-model="model.industry" placeholder="请输入客户初始行业"></a-input>
            </a-form-model-item>
          </a-col> -->
          <!-- <a-col :span="24">
            <a-form-model-item label="客户合作状态" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="customerState">
              <j-dict-select-tag placeholder="请选择客户合作状态" v-model="model.customerState"
                dictCode="customer_cooperate_status"></j-dict-select-tag>
            </a-form-model-item>
          </a-col> -->
          <!-- <a-col :span="24">
            <a-form-model-item label="销售" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="salesPerson">
              <JSearchSelectTag placeholder="请选择销售" v-model:value="model.salesPerson"
                dict="sys_user,realname,id,del_flag = '0'" async>
              </JSearchSelectTag>
            </a-form-model-item>
          </a-col> -->
          <!-- <a-col :span="24">
            <a-form-model-item label="AE" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="aePerson">
              <JSearchSelectTag placeholder="请选择AE" v-model:value="model.aePerson"
                dict="sys_user,realname,id,del_flag = '0'" async>
              </JSearchSelectTag>
            </a-form-model-item>
          </a-col> -->
          <!-- <a-col :span="24">
            <a-form-model-item label="客户回款间隔天数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="intervalDays">
              <a-input-number v-model="model.intervalDays" placeholder="请输入客户回款间隔天数" :min="1" :precision="0"
                style="width: 100%;"></a-input-number>
            </a-form-model-item>
          </a-col> -->
          <!-- <a-col :span="24">
            <a-form-model-item label="实际还款日期" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="repaymentDate">
              <a-input-number v-model="model.repaymentDate" placeholder="请输入客户承诺回款日期" :min="1" :max="31" :precision="0"
                style="width: 100%;"></a-input-number>
            </a-form-model-item>
          </a-col> -->
          <!-- <a-col :span="24">
            <a-form-model-item label="开票日期" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="billingDate">
              <a-input-number v-model="model.billingDate" placeholder="请输入客户承诺回款日期" :min="1" :max="31" :precision="0"
                style="width: 100%;"></a-input-number>
            </a-form-model-item>
          </a-col> -->
          <!-- <a-col :span="24">
            <a-form-model-item label="客户标识" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="sustomerUnique">
              <a-input v-model="model.sustomerUnique" placeholder="请输入返点比例"></a-input>
            </a-form-model-item>
          </a-col> -->
          <!-- <a-col :span="24">
            <a-form-model-item label="返点比例" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="rebate">
              <a-input-number v-model="model.rebate" placeholder="请输入返点比例" :min="0" :precision="2"
                style="width: 100%;"></a-input-number>
            </a-form-model-item>
          </a-col> -->
          <!-- <a-col :span="24">
            <a-form-model-item label="是否服务费" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="isGratuity">
              <a-radio-group v-model="model.isGratuity">
                <a-radio :value="'0'">否</a-radio>
                <a-radio :value="'1'">是</a-radio>
              </a-radio-group>
            </a-form-model-item>
          </a-col> -->
          <!-- <a-col :span="24">
            <a-form-model-item label="客户属性" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="attribute">
              <a-radio-group v-model="model.attribute">
                <a-radio :value="'0'">直客</a-radio>
                <a-radio :value="'1'">二代</a-radio>
              </a-radio-group>
            </a-form-model-item>
          </a-col> -->
          <!-- <a-col :span="24">
            <a-form-model-item label="运营模式" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="operationMode">
              <a-radio-group v-model="model.operationMode">
                <a-radio :value="'0'">自运营</a-radio>
                <a-radio :value="'1'">走量</a-radio>
                <a-radio :value="'2'">收量</a-radio>
              </a-radio-group>
            </a-form-model-item>
          </a-col> -->
          <!-- <a-col :span="24">
            <a-form-model-item label="标签" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="labels">
              <a-input v-model="model.labels" placeholder="请输入标签"></a-input>
            </a-form-model-item>
          </a-col> -->
          <!-- <a-col :span="24">
            <a-form-model-item label="投放媒体" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="mediaPlacement">
              <a-input v-model="model.mediaPlacement" placeholder="请输入投放媒体"></a-input>
            </a-form-model-item>
          </a-col> -->
        </a-row>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>

import { httpAction, getAction } from '@/api/manage'
import { validateDuplicateValue } from '@/utils/util'
import { duplicateCheck } from '@/api/api'

export default {
  name: 'TabCustomermanageForm',
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
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      confirmLoading: false,
      validatorRules: {
        customerName: [{ required: true, message: '请输入客户主体' },
        { validator: this.validateCustomerName }],
        // paymentDate: [{ required: true, message: '请输入客户承诺回款日期' }],
        // repaymentDate: [{ required: true, message: '请输入客户实际还款日期' }],
        // billingDate: [{ required: true, message: '请输入客户开票日期' }],
        // salesPerson: [{ required: true, message: '请选择销售' }],
        // rebate: [{ required: true, message: '请输入返点' }],
        // intervalDays: [{ required: true, message: '请输入客户回款间隔天数' }]
      },
      url: {
        add: "/customerManage/add",
        edit: "/customerManage/edit",
        queryById: "/customerManage/queryById"
      },
      userList: [],
      fetching: true,
      oldPaymentDate: null,
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    },
  },
  created() {
    this.fetchUser()
    //备份model原始值
    this.modelDefault = JSON.parse(JSON.stringify(this.model));
  },
  methods: {
    validateCustomerName(rule, value, callback) {
      var params = {
        tableName: 'tab_customerManage',
        fieldName: 'customer_name',
        fieldVal: value,
        dataId: this.model.id
      };
      duplicateCheck(params).then((res) => {
        if (res.success) {
          callback()
        } else {
          callback("客户名称已存在!")
        }
      })
    },
    fetchUser() {
      this.data = [];
      this.fetching = true;
      httpAction('/sys/user/list', {}, "GET").then((res) => {
        if (res.success) {
          this.userList = res.result.records || []
          this.fetching = false
        } else {
          this.$message.warning(res.message);
        }
      }).finally(() => {

      })
    },
    add() {
      this.edit(this.modelDefault);
      this.oldPaymentDate = null;
    },
    edit(record) {
      this.model = Object.assign({}, record);
      this.visible = true;
      this.oldPaymentDate = record.paymentDate;
    },
    submitForm() {
      const that = this;
      this.$refs.form.validate(valid => {
        if (valid) {
          that.confirmLoading = true;
          let httpurl = '';
          let method = '';
          let isAdd = !this.model.id;

          if (isAdd) {
            httpurl += this.url.add;
            method = 'post';
            const now = new Date();
            const year = now.getFullYear();
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            this.model.startingDate = `${year}-${month}-01`;
          } else {
            httpurl += this.url.edit;
            method = 'put';
          }

          // const paymentDateChanged = this.model.paymentDate !== this.oldPaymentDate;
          // if (isAdd || paymentDateChanged) {

          // }
          try {
            const interval = Number(this.model.intervalDays) || 0;
            this.model.preIntervalDays = interval - 10;
            this.model.monthApart = Math.floor(interval / 30);
            this.model.days = interval % 30;
          } catch (error) {
            // console.log(error)
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