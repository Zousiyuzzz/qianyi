<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-model-item label="转出账号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="dbtAcc">
              <!-- <a-input v-model="model.dbtAcc" placeholder="请输入转出账号" :maxLength="35"></a-input> -->
              <JSearchSelectTag placeholder="请选择转出账号" v-model="model.dbtAcc"
                :dict="`tab_bank_account_config,account_no,account_no,del_flag = '0' and bank_type = 'cmb'`" async
                allowClear />
            </a-form-model-item>
          </a-col>

          <a-col :span="24">
            <a-form-model-item label="智能识别" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-textarea v-model="receiverIntelligentText"
                placeholder="请粘贴或输入收款方信息文本，系统将自动识别并填入下方字段（支持多种格式，如：收款方账号、账户名、开户行、金额、项目等）" :rows="4">
              </a-textarea>
              <div style="margin-top: 8px;">
                <a-button type="link" size="small" @click="parseReceiverInfo">识别填入</a-button>
                <a-button type="link" size="small" @click="clearReceiverIntelligentText">清空</a-button>
              </div>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="收方账号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="crtAcc">
              <a-input v-model="model.crtAcc" placeholder="请输入收方账号" :maxLength="35"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="收方户名" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="crtNam">
              <a-input v-model="model.crtNam" placeholder="请输入收方户名（最长100汉字）" :maxLength="300"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="收方开户行名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="crtBnk">
              <a-input v-model="model.crtBnk" placeholder="请输入收方开户行名称（最长30汉字）" :maxLength="90"></a-input>
            </a-form-model-item>
          </a-col>

          <a-col :span="24">
            <a-form-model-item label="交易金额" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="trsAmt">
              <a-input-number v-model="model.trsAmt" placeholder="请输入交易金额" :precision="2" :min="0"
                style="width: 100%;"></a-input-number>
            </a-form-model-item>
          </a-col>

          <a-col :span="24">
            <a-form-model-item label="用途" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="nusAge">
              <a-textarea v-model="model.nusAge" rows="3" placeholder="请输入用途（最长100汉字）" :maxLength="300"></a-textarea>
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
  name: 'TabCmbPaymentTransferRecordForm',
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
      receiverIntelligentText: '',
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
        dbtAcc: [{ required: true, message: '请输入转出账号' }],
        crtAcc: [{ required: true, message: '请输入收方账号' }],
        crtNam: [{ required: true, message: '请输入收方户名' }],
        crtBnk: [{ required: true, message: '请输入收方开户行名称' }],
        trsAmt: [{ required: true, message: '请输入交易金额' }],
        nusAge: [{ required: true, message: '请输入用途' }],
      },
      url: {
        add: "/cmbPaymentTransferRecord/transfer",
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
      // 设置默认值
      const defaultData = {
        ccyNbr: '10', // 币种默认10人民币
        stlChn: 'G', // 结算通道默认G普通
        trsTyp: '100001', // 业务种类默认100001
        drpFlg: 'A', // 直汇普通标志默认A普通
        ...initialData
      }
      this.edit(Object.assign({}, this.modelDefault, defaultData))
    },
    edit(record) {
      this.model = Object.assign({}, record)
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.confirmLoading = true
        let httpurl = this.url.add
        let method = 'post'
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
    },
    // 解析收款方信息
    parseReceiverInfo() {
      if (!this.receiverIntelligentText || !this.receiverIntelligentText.trim()) {
        this.$message.warning('请输入要识别的文本')
        return
      }
      const text = this.receiverIntelligentText.trim()

      // 解析收方账号 (crtAcc)
      const accountPatterns = [
        /收款方账号[：:\s]*([0-9]+)/i,
        /效果充值[^：:]*银行账号[：:\s]*([0-9]+)/i,
        /银行账号[：:\s]*([0-9]+)/i,
        /账号[：:\s]*([0-9]+)/i,
        /账户[：:\s]*([0-9]+)/i
      ]
      for (const pattern of accountPatterns) {
        const match = text.match(pattern)
        if (match && match[1]) {
          this.$set(this.model, 'crtAcc', match[1].trim())
          break
        }
      }

      // 解析收方户名 (crtNam)
      const namePatterns = [
        /收款方账户名称[：:\s]*([^\n\r：:@]+)/i,
        /账户名称[：:\s]*([^\n\r：:@]+)/i,
        /账户名[：:\s]*([^\n\r：:@]+)/i,
        /户名[：:\s]*([^\n\r：:@]+)/i
      ]
      for (const pattern of namePatterns) {
        const match = text.match(pattern)
        if (match && match[1]) {
          let name = match[1].trim().replace(/[●•]/g, '').trim()
          // 移除@符号及其后面的内容（如@侯相如）
          name = name.replace(/@[^\s]*/g, '').trim()
          if (name) {
            this.$set(this.model, 'crtNam', name)
            break
          }
        }
      }

      // 解析收方开户行名称 (crtBnk)
      const bankPatterns = [
        /收款方银行名称[：:\s]*([^\n\r：:@]+)/i,
        /开户行[：:\s]*([^\n\r：:@]+)/i,
        /银行名称[：:\s]*([^\n\r：:@]+)/i
      ]
      for (const pattern of bankPatterns) {
        const match = text.match(pattern)
        if (match && match[1]) {
          let bank = match[1].trim().replace(/[●•]/g, '').trim()
          // 移除@符号及其后面的内容
          bank = bank.replace(/@[^\s]*/g, '').trim()
          if (bank) {
            this.$set(this.model, 'crtBnk', bank)
            break
          }
        }
      }

      // 解析交易金额 (trsAmt)
      const amountPatterns = [
        /金额[：:\s]*[¥￥]?\s*([0-9,，.]+)\s*(万|千|百|十)?[万千百十]?[元人民币]?/i,
        /金额[：:\s]*([0-9,，.]+)\s*(万|千|百|十)?[万千百十]?[元人民币]?/i,
        /[¥￥]\s*([0-9,，.]+)/i
      ]
      for (const pattern of amountPatterns) {
        const match = text.match(pattern)
        if (match && match[1]) {
          let amountStr = match[1].replace(/[,，]/g, '')
          let amount = parseFloat(amountStr)

          // 处理单位：万、千、百、十
          const fullMatch = text.match(/金额[：:\s]*[¥￥]?\s*([0-9,，.]+)\s*(万|千|百|十)?[万千百十]?[元人民币]?/i)
          if (fullMatch && fullMatch[2]) {
            const unit = fullMatch[2]
            if (unit === '万') {
              amount = amount * 10000
            } else if (unit === '千') {
              amount = amount * 1000
            } else if (unit === '百') {
              amount = amount * 100
            } else if (unit === '十') {
              amount = amount * 10
            }
          }

          if (!isNaN(amount) && amount > 0) {
            this.$set(this.model, 'trsAmt', amount)
            break
          }
        }
      }

      // 解析用途/项目 (nusAge)
      const projectPatterns = [
        /项目[：:\s]*([^\n\r：:@]+)/i,
        /用途[：:\s]*([^\n\r：:@]+)/i
      ]
      for (const pattern of projectPatterns) {
        const match = text.match(pattern)
        if (match && match[1]) {
          let project = match[1].trim()
          // 移除@符号及其后面的内容
          project = project.replace(/@[^\s]*/g, '').trim()
          if (project) {
            this.$set(this.model, 'nusAge', project)
            break
          }
        }
      }

      this.$message.success('收款方信息识别完成')
    },
    // 清空智能识别文本
    clearReceiverIntelligentText() {
      this.receiverIntelligentText = ''
    }
  }
}
</script>

<style scoped></style>
