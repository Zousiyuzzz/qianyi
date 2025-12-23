<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="类型" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="type">
              <a-radio-group v-model="model.type">
                <a-radio value="1">常规</a-radio>
                <a-radio value="2">服务费</a-radio>
              </a-radio-group>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="渠道名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="channelName">
              <a-input v-model="model.channelName" placeholder="请输入渠道名称"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="平台标识" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="channelPlatform">
              <j-dict-select-tag placeholder="请选择平台标识" v-model="model.channelPlatform"
                dictCode="platform_signs"></j-dict-select-tag>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="渠道标识" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="channelSign">
              <j-dict-select-tag placeholder="请选择渠道标识" v-model="model.channelSign"
                dictCode="channelSign_system"></j-dict-select-tag>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="代理商ID" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="agentId">
              <a-input v-model="model.agentId" placeholder="请输入代理商ID"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="账号ID" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="accountId">
              <a-input v-model="model.accountId" placeholder="请输入账号ID"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="账号名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="accountName">
              <a-input v-model="model.accountName" placeholer="请输入账号名称"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="开户账号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="openAccount">
              <a-input v-model="model.openAccount" placeholder="请输入开户账号"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="应用ID" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="applyId">
              <a-input v-model="model.applyId" placeholder="请输入应用ID"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="应用名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="applyName">
              <a-input v-model="model.applyName" placeholder="请输入应用名称"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="应用密钥" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="applyCipher">
              <a-input v-model="model.applyCipher" placeholder="请输入应用密钥"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <!--v-if="idAdd"-->
            <a-form-model-item label="回调url" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="url">
              <a-input v-model="model.url" placeholder="url" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="是否跑数据" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="isRunData">
              <a-select v-model="model.isRunData" placeholder="请选择是否跑数据">
                <a-select-option value="true">是</a-select-option>
                <a-select-option value="false">否</a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <!-- <a-col :span="24">
            <a-form-model-item label="access_token" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="accessToken">
              <a-input v-model="model.accessToken" placeholder="请输入用于验证权限的 token"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="refresh_token" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="refreshToken">
              <a-input v-model="model.refreshToken" placeholder="请输入用于获取新的 access_token"></a-input>
            </a-form-model-item>
          </a-col> -->
        </a-row>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>

import { httpAction } from '@/api/manage'

export default {
  name: 'TabPlatformverifyForm',
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
        channelId: '',
        type: '1',
        isRunData: ''
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
        type: [
          { required: true, message: '请选择类型!' }
        ]
      },
      url: {
        add: "/platformverify/add",
        edit: "/platformverify/edit",
        queryById: "/platformverify/queryById"
      },
      idAdd: false,
      channelId: ''
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
    add(channelId) {
      this.channelId = channelId
      this.idAdd = true
      // this.edit(this.modelDefault);
      this.model = Object.assign({}, this.modelDefault);
      this.visible = true;
    },
    edit(record) {
      this.channelId = record.channelId
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
          httpAction(httpurl, {
            ...this.model,
            channelId: this.channelId,
          }, method).then((res) => {
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