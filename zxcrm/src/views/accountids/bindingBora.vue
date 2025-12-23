<template>
    <a-modal title="博拉不参与统计账户绑定" :visible="visible" :confirm-loading="confirmLoading" @ok="handleOk"
        @cancel="handleCancel" :width="800" :maskClosable="false" :keyboard="false">
        <a-spin :spinning="confirmLoading">
            <j-form-container :disabled="formDisabled">
                <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
                    <a-row :gutter="16">
                        <!-- 项目选择 - 锁定为博拉项目 -->
                        <a-col :span="24">
                            <a-form-model-item label="项目" :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }"
                                prop="projectId">
                                <a-input v-model="model.projectName" disabled placeholder="博拉的客户-不参与统计" />
                                <div style="margin-top: 8px; color: #666; font-size: 12px;">
                                    <a-icon type="lock" style="margin-right: 4px;" />
                                    注意：此项目已锁定为博拉不参与统计项目，不可修改
                                </div>
                            </a-form-model-item>
                        </a-col>



                        <!-- 重要提示 -->
                        <a-col :span="24">
                            <a-alert message="重要提示" description="此功能将把选中的账户绑定到博拉不参与统计项目，绑定后这些账户将不参与常规统计。请确认操作无误后再提交。"
                                type="warning" show-icon style="margin-top: 16px;" />
                        </a-col>
                    </a-row>
                </a-form-model>
            </j-form-container>

            <!-- 绑定账号ID的卡片 -->
            <a-card :bordered="false">
                <binding v-model="dataList" @validate="handleValidate" />
                <a-alert v-if="dataListError" type="error" :message="dataListError" show-icon class="error-alert" />
            </a-card>
        </a-spin>
    </a-modal>
</template>

<script>
import { httpAction, postAction } from '@/api/manage'
import { validateDuplicateValue } from '@/utils/util'
import JFormContainer from '@/components/jeecg/JFormContainer'
import binding from './components/binding.vue'

export default {
    name: 'BindingBora',
    components: {
        JFormContainer,
        binding
    },
    data() {
        return {
            visible: false,
            confirmLoading: false,
            formDisabled: false,
            model: {
                projectId: '1968870333095235586', // 锁定的博拉项目ID
                projectName: '博拉的客户-不参与统计'
            },
            selectedAccounts: [],
            channelSign: '',
            dataList: [],
            dataListError: '',
            validatorRules: {
                projectId: [
                    { required: true, message: '请选择项目!' }
                ]
            },
            url: {
                binding: '/accountinfo/bindingPro'
            }
        }
    },
    methods: {
        showModal(selectedRows, channelSign) {
            this.visible = true
            this.selectedAccounts = selectedRows || []
            this.channelSign = channelSign || ''

            // 重置表单，锁定博拉项目ID
            this.model = {
                projectId: '1968870333095235586', // 锁定的博拉项目ID
                projectName: '博拉的客户-不参与统计'
            }

            // 初始化账户ID列表
            this.dataList = this.selectedAccounts.map(account => account.accountId)
            this.dataListError = ''

            // 清除验证
            this.$nextTick(() => {
                if (this.$refs.form) {
                    this.$refs.form.clearValidate()
                }
            })

            // 显示确认信息
            this.$message.info(`准备将 ${this.selectedAccounts.length} 个账户绑定到博拉不参与统计项目`)
        },

        handleOk() {
            // 验证表单
            this.$refs.form.validate((valid) => {
                if (valid) {
                    this.confirmLoading = true

                    // 准备绑定数据
                    const validAccountIds = this.dataList.filter(id => id && id.trim() !== '')
                    if (validAccountIds.length === 0) {
                        this.$message.error('请输入至少一个账户ID')
                        this.confirmLoading = false
                        return
                    }

                    const bindingData = {
                        accountIds: validAccountIds,
                        projectId: this.model.projectId,
                        channelSign: 'DY-JLGG',
                        date: "2000-01-01",
                        isCover: true,
                    }

                    // 调用绑定接口
                    postAction(this.url.binding, bindingData).then((res) => {
                        if (res.success) {
                            this.$message.success(`博拉账户绑定成功！已绑定 ${this.selectedAccounts.length} 个账户到博拉不参与统计项目`)
                            this.visible = false
                            this.$emit('ok')
                        } else {
                            this.$message.error(res.message || '绑定失败')
                        }
                    }).catch((error) => {
                        console.error('博拉绑定失败:', error)
                        this.$message.error('绑定失败，请重试')
                    }).finally(() => {
                        this.confirmLoading = false
                    })
                }
            })
        },

        handleCancel() {
            this.visible = false
        },

        handleValidate(isValid, errorMsg) {
            this.dataListError = isValid ? '' : errorMsg
        }
    }
}
</script>

<style scoped>
.ant-form-item {
    margin-bottom: 16px;
}
</style>
