<template>
  <div>
    <a-spin :spinning="confirmLoading">
      <j-form-container :disabled="formDisabled">
        <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
          <a-row>
            <a-col :span="24" v-if="model.source == '1' || model.source == 1">
              <a-form-model-item label="项目" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="proId">
                <JSearchSelectTag placeholder="请选择项目" v-model="model.proId"
                  dict="tab_projectManage,pro_name,id,del_flag = '0'" async allowClear />
              </a-form-model-item>
            </a-col>
            <a-col :span="24">
              <a-form-model-item label="我方主体" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="bankAccountId">
                <a-input-search v-model="bankAccountConfigName" placeholder="请选择我方主体" read-only
                  @search="handleSelectBankAccount">
                  <a-button slot="enterButton" type="primary">选择</a-button>
                </a-input-search>
              </a-form-model-item>
            </a-col>
            <a-col :span="24">
              <a-form-model-item label="甲方银行账号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="partyAAccount">
                <a-input v-model="model.partyAAccount" placeholder="请输入甲方银行账号"></a-input>
              </a-form-model-item>
            </a-col>
            <a-col :span="24">
              <a-form-model-item label="甲方单位名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="partyAName">
                <a-input v-model="model.partyAName" placeholder="请输入甲方单位名称"></a-input>
              </a-form-model-item>
            </a-col>
            <a-col :span="24">
              <a-form-model-item label="甲方税号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="partyATaxNo">
                <a-input v-model="model.partyATaxNo" placeholder="请输入甲方税号"></a-input>
              </a-form-model-item>
            </a-col>
            <a-col :span="24">
              <a-form-model-item label="甲方开户银行" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="partyABank">
                <a-input v-model="model.partyABank" placeholder="请输入甲方开户银行"></a-input>
              </a-form-model-item>
            </a-col>
            <a-col :span="24">
              <a-form-model-item label="甲方地址" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="partyAAddress">
                <a-input v-model="model.partyAAddress" placeholder="请输入甲方地址"></a-input>
              </a-form-model-item>
            </a-col>
            <a-col :span="24">
              <a-form-model-item label="甲方电话" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="partyAPhone">
                <a-input v-model="model.partyAPhone" placeholder="请输入甲方电话"></a-input>
              </a-form-model-item>
            </a-col>
          </a-row>
        </a-form-model>
      </j-form-container>
    </a-spin>
    <select-bank-account-config-modal ref="selectBankAccountConfigModal"
      @select="onBankAccountConfigSelect"></select-bank-account-config-modal>
  </div>
</template>

<script>

import { httpAction, getAction } from '@/api/manage'
import { validateDuplicateValue } from '@/utils/util'
import SelectBankAccountConfigModal from './SelectBankAccountConfigModal'

export default {
  name: 'TabBankAccountForm',
  components: {
    SelectBankAccountConfigModal
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
        source: '1'
      },
      bankAccountConfigName: '',
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
        bankAccountId: [{ required: true, message: '请选择我方主体' }]
      },
      url: {
        add: "/bankAccount/add",
        edit: "/bankAccount/edit",
        queryById: "/bankAccount/queryById"
      }
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    },
  },
  watch: {
    'model.source': {
      handler(newVal, oldVal) {
        // 当source改变时，清空proId
        if (newVal !== oldVal) {
          if (newVal == '2' || newVal == 2) {
            this.model.proId = '';
            this.model.proName = '';
          }
        }
      },
      immediate: false
    },
  },
  created() {
    //备份model原始值
    this.modelDefault = JSON.parse(JSON.stringify(this.model));
    this.bankAccountConfig = null;
  },
  methods: {
    handleSourceChange(value) {
      if (value == '2' || value == 2) {
        this.model.proId = '';
        this.model.proName = '';
      }
    },
    handleSelectBankAccount() {
      this.$refs.selectBankAccountConfigModal.open();
    },
    onBankAccountConfigSelect(bankAccountId) {
      // 只接收 id
      this.model.bankAccountId = bankAccountId;
      // 根据 id 查询详细信息用于显示
      if (bankAccountId) {
        getAction("/bankAccountConfig/queryById", { id: bankAccountId }).then((res) => {
          if (res.success && res.result) {
            this.bankAccountConfig = res.result;
            this.bankAccountConfigName = `${res.result.accountName} - ${res.result.accountNo}`;
            // 自动填充账户号和账户名称
            if (!this.model.accountNo) {
              this.model.accountNo = res.result.accountNo;
            }
            if (!this.model.accountName) {
              this.model.accountName = res.result.accountName;
            }
          }
        });
      }
    },
    add(initialData) {
      const defaultModel = JSON.parse(JSON.stringify(this.modelDefault));
      console.log('TabBankAccountForm add - 接收到的 initialData:', initialData)
      console.log('TabBankAccountForm add - modelDefault:', this.modelDefault)
      console.log('TabBankAccountForm add - defaultModel (合并前):', defaultModel)

      if (initialData) {
        Object.assign(defaultModel, initialData);
      }

      // 清空银行配置显示名称
      this.bankAccountConfigName = '';
      this.bankAccountConfig = null;

      console.log('TabBankAccountForm add - defaultModel (合并后):', defaultModel)
      this.edit(defaultModel);
    },
    edit(record) {
      // 确保所有字段都被正确设置
      this.model = Object.assign({}, record);
      // 如果 record 中有 proId，确保它被设置
      if (record.hasOwnProperty('proId')) {
        this.model.proId = record.proId
      }
      // 确保 source 被正确设置
      if (record.hasOwnProperty('source')) {
        this.model.source = String(record.source)
      } else {
        this.model.source = '1'
      }
      // 设置银行配置名称显示
      if (record.bankAccountId) {
        this.model.bankAccountId = record.bankAccountId
        // 根据 bankAccountId 查询详细信息用于显示
        getAction("/bankAccountConfig/queryById", { id: record.bankAccountId }).then((res) => {
          if (res.success && res.result) {
            this.bankAccountConfig = res.result;
            this.bankAccountConfigName = `${res.result.accountName} - ${res.result.accountNo}`;
          }
        }).catch(() => {
          // 如果查询失败，尝试使用 record 中的信息
          if (record.accountName && record.accountNo) {
            this.bankAccountConfigName = `${record.accountName} - ${record.accountNo}`
          }
        });
      }
      this.visible = true;
    },
    submitForm() {
      const that = this;
      this.$refs.form.validate(valid => {
        if (valid) {
          // 新增时直接提交，不再校验 corporateName 重复性
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
          // 确保 source 是数字类型（后端可能需要）
          if (typeof this.model.source === 'string') {
            this.model.source = parseInt(this.model.source)
          }
          if (this.model.source == 2) {
            this.model.proId = ''
            this.model.customerName = ''
          }
          httpAction(httpurl, this.model, method).then((res) => {
            console.log('TabBankAccountForm 提交成功，返回结果:', res)
            if (res.success) {
              that.$message.success(res.message);
              // 如果是新增，需要重新查询获取新增的ID
              if (!this.model.id) {
                // 根据提交的数据重新查询获取ID，查询全部不限制source
                const queryParams = {
                  proId: this.model.proId || '',
                  corporateName: this.model.corporateName || ''
                }
                console.log('TabBankAccountForm 新增成功，重新查询获取ID，查询参数:', queryParams)
                getAction("/bankAccount/list", queryParams).then((queryRes) => {
                  if (queryRes.success && queryRes.result && queryRes.result.records && queryRes.result.records.length > 0) {
                    // 获取最新的一条记录（应该是刚添加的）
                    const latestRecord = queryRes.result.records[0]
                    this.model.id = latestRecord.id
                    console.log('TabBankAccountForm 查询到新增的ID:', this.model.id)

                    // 传递包含ID的结果
                    const result = { id: this.model.id, ...latestRecord }
                    console.log('TabBankAccountForm emit ok，传递的 result:', result)
                    that.$emit('ok', result);
                  } else {
                    // 如果查询不到，至少传递model中的数据
                    const result = {
                      id: this.model.id,
                      proId: this.model.proId,
                      corporateName: this.model.corporateName,
                      source: this.model.source
                    }
                    console.log('TabBankAccountForm 查询不到ID，传递 model 数据:', result)
                    that.$emit('ok', result);
                  }
                }).catch((err) => {
                  console.error('TabBankAccountForm 查询新增ID失败:', err)
                  // 即使查询失败，也传递model中的数据
                  const result = {
                    proId: this.model.proId,
                    corporateName: this.model.corporateName,
                    source: this.model.source
                  }
                  that.$emit('ok', result);
                })
              } else {
                // 编辑模式，直接传递结果
                const result = typeof res.result === 'object' && res.result !== null ? res.result : {}
                if (this.model.id && !result.id) {
                  result.id = this.model.id
                }
                console.log('TabBankAccountForm emit ok，传递的 result:', result)
                that.$emit('ok', result);
              }
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