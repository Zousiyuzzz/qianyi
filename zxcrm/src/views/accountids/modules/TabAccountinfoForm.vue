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
            <a-form-model-item label="责任人" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="responsiblePerson">
              <a-input v-model="model.responsiblePerson" placeholder="请输入责任人"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="快手ID" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="userId">
              <a-input v-model="model.userId" placeholder="请输入快手ID"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="广告主ID" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="accountId">
              <a-input v-model="model.accountId" placeholder="请输入广告主ID"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="账户类型" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="ucType">
              <a-input v-model="model.ucType" placeholder="请输入账户类型"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="付款类型" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="paymentType">
              <a-input v-model="model.paymentType" placeholder="请输入付款类型"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="快手昵称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="accountName">
              <a-input v-model="model.accountName" placeholder="请输入快手昵称"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="创建账号时间" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="createDate">
              <j-date placeholder="请选择创建账号时间" v-model="model.createDate" :show-time="true"
                date-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="现金余额" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="balance">
              <a-input-number v-model="model.balance" placeholder="请输入现金余额" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="信用账户余额" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="creditBalance">
              <a-input-number v-model="model.creditBalance" placeholder="请输入信用账户余额" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="预留账户余额" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="extendedBalance">
              <a-input-number v-model="model.extendedBalance" placeholder="请输入预留账户余额" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="后返余额" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="rebate">
              <a-input-number v-model="model.rebate" placeholder="请输入后返余额" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="前返余额" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="preRebate">
              <a-input-number v-model="model.preRebate" placeholder="请输入前返余额" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="框返余额" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="contractRebate">
              <a-input-number v-model="model.contractRebate" placeholder="请输入框返余额" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="总余额" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="totalBalance">
              <a-input-number v-model="model.totalBalance" placeholder="请输入总余额" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="账户最低余额" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="loLimit">
              <a-input-number v-model="model.loLimit" placeholder="请输入账户最低余额" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="单次转账金额" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="singleOut">
              <a-input-number v-model="model.singleOut" placeholder="请输入单次转账金额" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="自动转账状态" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="autoOut">
              <a-input v-model="model.autoOut" placeholder="请输入自动转账状态"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="余额不足提醒" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="balanceWarn">
              <a-input v-model="model.balanceWarn" placeholder="请输入余额不足提醒"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="产品名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="productName">
              <a-input v-model="model.productName" placeholder="请输入产品名称"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="首日消耗日期" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="firstCostDay">
              <a-input v-model="model.firstCostDay" placeholder="请输入首日消耗日期"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="一级行业" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="industry">
              <a-input v-model="model.industry" placeholder="请输入一级行业"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="二级行业" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="secondIndustry">
              <a-input v-model="model.secondIndustry" placeholder="请输入二级行业"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="kuaibiBalance" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="kuaibiBalance">
              <a-input v-model="model.kuaibiBalance" placeholder="请输入kuaibiBalance"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="pushBalance" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="pushBalance">
              <a-input v-model="model.pushBalance" placeholder="请输入pushBalance"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="recharged" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="recharged">
              <a-input v-model="model.recharged" placeholder="请输入recharged"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="企业名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="corporationName">
              <a-input v-model="model.corporationName" placeholder="请输入企业名称"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="审核状态 1-审核中; 2-审核通过; 3-审核拒绝; 0-待提交" :labelCol="labelCol" :wrapperCol="wrapperCol"
              prop="reviewStatus">
              <a-input v-model="model.reviewStatus" placeholder="请输入审核状态 1-审核中; 2-审核通过; 3-审核拒绝; 0-待提交"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="冻结状态" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="frozenStatus">
              <a-input v-model="model.frozenStatus" placeholder="请输入冻结状态"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="转账状态" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="transferAccountStatus">
              <a-input v-model="model.transferAccountStatus" placeholder="请输入转账状态"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="appId" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="appId">
              <a-input v-model="model.appId" placeholder="请输入appId"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="createSource" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="createSource">
              <a-input v-model="model.createSource" placeholder="请输入createSource"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="账号认证状态 0-无状态, 1-待认证, 2-认证中, 3-认证通过, 4-认证失败, 5-认证失效" :labelCol="labelCol"
              :wrapperCol="wrapperCol" prop="authenticationStatus">
              <a-input v-model="model.authenticationStatus"
                placeholder="请输入账号认证状态 0-无状态, 1-待认证, 2-认证中, 3-认证通过, 4-认证失败, 5-认证失效"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="账号认证状态详情" :labelCol="labelCol" :wrapperCol="wrapperCol"
              prop="authenticationDetail">
              <a-input v-model="model.authenticationDetail" placeholder="请输入账号认证状态详情"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="合同签约状态 0-无效, 1-签约中, 2-已签约, 3-已终止, 4-已过期, 5-已撤销, 6-已拒签, 7-已删除, 8-提前终止"
              :labelCol="labelCol" :wrapperCol="wrapperCol" prop="contractReviewStatus">
              <a-input v-model="model.contractReviewStatus"
                placeholder="请输入合同签约状态 0-无效, 1-签约中, 2-已签约, 3-已终止, 4-已过期, 5-已撤销, 6-已拒签, 7-已删除, 8-提前终止"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="合同签约状态详情" :labelCol="labelCol" :wrapperCol="wrapperCol"
              prop="contractReviewDetail">
              <a-input v-model="model.contractReviewDetail" placeholder="请输入合同签约状态详情"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="用户审核状态 0-未送审, 1-待审核, 2-审核通过, 3-审核拒绝, 4-封禁" :labelCol="labelCol"
              :wrapperCol="wrapperCol" prop="userReviewStatus">
              <a-input v-model="model.userReviewStatus"
                placeholder="请输入用户审核状态 0-未送审, 1-待审核, 2-审核通过, 3-审核拒绝, 4-封禁"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="用户审核状态详情" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="userReviewDetail">
              <a-input v-model="model.userReviewDetail" placeholder="请输入用户审核状态详情"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="是否为复制账户" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="copyAccount">
              <a-input v-model="model.copyAccount" placeholder="请输入是否为复制账户"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="id" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="reviewDetailId">
              <a-input v-model="model.reviewDetailId" placeholder="请输入id"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="描述" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="reviewDetailDesc">
              <a-input v-model="model.reviewDetailDesc" placeholder="请输入描述"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="激励余额" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="directRebate">
              <a-input-number v-model="model.directRebate" placeholder="请输入激励余额" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="投放渠道" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="channelId">
              <a-input v-model="model.channelId" placeholder="请输入投放渠道"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="渠道名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="channelName">
              <a-input v-model="model.channelName" placeholder="请输入渠道名称"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="渠道标识" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="channelSign">
              <a-input v-model="model.channelSign" placeholder="请输入渠道标识"></a-input>
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
  name: 'TabAccountinfoForm',
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
        add: "/accountinfo/add",
        edit: "/accountinfo/edit",
        queryById: "/accountinfo/queryById"
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