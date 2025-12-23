<template>
    <a-modal title="广告主ID绑定返点政策模板" :visible="visible" :confirm-loading="confirmLoading" @ok="handleOk"
        @cancel="handleCancel" :width="800" :maskClosable="false" :keyboard="false">
        <a-spin :spinning="confirmLoading">
            <j-form-container :disabled="formDisabled">
                <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
                    <a-row :gutter="16">
                        <!-- 项目选择 -->
                        <a-col :span="24">
                            <a-form-model-item label="返点政策模板" :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }"
                                prop="rebateTeptId">
                                <JSearchSelectTag placeholder="请选择返点政策模板" v-model="model.rebateTeptId"
                                    dict="tab_customer_rebate_template,rebate_name,id,del_flag = '0'" async
                                    allowClear />
                                <div class="form-item-help">
                                    更换绑定会动态计算历史数据
                                </div>
                            </a-form-model-item>
                        </a-col>
                    </a-row>
                    <a-row :gutter="16">
                        <!-- 项目选择 -->
                        <a-col :span="24">
                            <a-form-model-item label="媒体渠道" :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }"
                                prop="rebateTeptId">
                                <j-dict-select-tag v-model="Sign" placeholder="媒体渠道" dictCode="channelSign_system" />
                            </a-form-model-item>
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
import { postAction } from '@/api/manage'
import binding from './components/binding.vue'
import moment from 'moment'
import axios from 'axios'
import { ACCESS_TOKEN, TENANT_ID } from "@/store/mutation-types"
import Vue from 'vue'

export default {
    name: 'ProjectBindingModal',
    components: {
        binding
    },
    data() {
        return {
            // 渠道标识
            Sign: '',
            // 控制模态框显示
            visible: false,
            // 控制表单加载状态
            confirmLoading: false,
            // 账号ID列表
            dataList: [''],
            // 账号ID列表错误信息
            dataListError: '',
            // 产品选择器的选项列表
            productOptions: [],
            // 表单数据模型
            model: {
                rebateTeptId: undefined,
                accountIds: []
            },
            // 表单验证规则
            validatorRules: {
                rebateTeptId: [{ required: true, message: '请选择返点政策模板' }],
            },
        }
    },
    computed: {
        // 控制表单是否禁用
        formDisabled() {
            return this.disabled
        }
    },
    watch: {

    },
    methods: {
        // 禁用未来的日期
        disabledDate(current) {
            return current && current > moment().endOf('day')
        },

        // 初始化添加表单
        add() {
            this.edit(this.modelDefault)
        },

        // 编辑表单数据
        edit(record) {
            this.model = Object.assign({}, record)
            this.visible = true
        },

        // 显示模态框并初始化账号ID列表
        showModal(idlist, channel, rebateTeptId) {
            this.model.rebateTeptId = rebateTeptId || ''
            this.Sign = channel || ''
            this.dataList = idlist.length > 0 ? idlist.map(item => item.accountId).filter(Boolean) : ['']
            this.visible = true
        },

        // 处理绑定组件的验证事件
        handleValidate(error) {
            this.dataListError = error
        },

        // 验证账号ID列表
        validateDataList() {
            if (this.dataList.length === 0) {
                this.dataListError = '至少需要绑定一个账号ID'
                return false
            }

            if (this.dataList.some(item => !item || item.trim() === '')) {
                this.dataListError = '账号ID不能为空'
                return false
            }

            this.dataListError = ''
            return true
        },

        // 处理确认按钮
        async handleOk() {
            try {
                // // console.log()
                this.confirmLoading = true

                // 验证表单
                const formValid = await this.$refs.form.validate()
                if (!formValid) return

                // 验证账号列表
                if (!this.validateDataList()) return

                const response = await postAction('customerRebateTemplate/binding', {
                    rebateTeptId: this.model.rebateTeptId,
                    // accountIds: this.dataList.map(item => this.Sign + item)
                    channelSign: this.Sign,
                    accountIds: this.dataList
                })
                // // console.log(response)
                if (response.success) {
                    this.$message.success(response.message)
                    this.$emit('ok')
                    this.handleCancel()
                } else {
                    this.$message.warning(response.message || '操作失败')
                }
            } catch (error) {
                console.error('提交失败:', error)
                this.$message.error('提交失败，请稍后重试')
            } finally {
                this.confirmLoading = false
            }
        },

        // 处理取消按钮
        handleCancel() {
            this.dataList = ['']
            this.dataListError = ''
            this.visible = false
            this.$refs.form.resetFields()
        },


        // 处理新增产品确认

    },

    created() {
        // 保存默认的 model 数据
        this.modelDefault = JSON.parse(JSON.stringify(this.model))
    }
}
</script>

<style lang="less" scoped>
.binding-card {
    margin-top: 16px;

    ::v-deep .ant-card-head {
        border-bottom: none;
        padding-bottom: 0;
    }
}

.error-alert {
    margin-top: 8px;
}

.form-item-help {
    color: rgba(0, 0, 0, 0.45);
    font-size: 12px;
    line-height: 1.5;
    margin-top: 4px;
}
</style>