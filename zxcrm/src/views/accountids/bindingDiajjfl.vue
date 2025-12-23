<template>
    <a-modal title="广告主ID绑定竞价分类" :visible="visible" :confirm-loading="confirmLoading" @ok="handleOk"
        @cancel="handleCancel" :width="800" :maskClosable="false" :keyboard="false">
        <a-spin :spinning="confirmLoading">
            <j-form-container :disabled="formDisabled">
                <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
                    <a-row :gutter="16">
                        <!-- 项目选择 -->
                        <!-- <a-col :span="24">
                            <a-form-model-item label="项目" :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }"
                                prop="projectId">
                                <JSearchSelectTag placeholder="请选择项目" v-model="model.projectId"
                                    dict="tab_projectManage,pro_name,id,del_flag = '0'" async allowClear />
                            </a-form-model-item>
                        </a-col> -->

                        <!-- 产品选择（替换为普通下拉） -->
                        <!-- <a-col :span="24">
                            <a-form-model-item label="产品" :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }"
                                prop="productmId">
                                <div style="display: flex; align-items: center;">
                                    <a-select v-model="model.productmId" placeholder="请选择产品" allowClear
                                        :options="productOptions" style="flex: 1;">
                                    </a-select>
                                </div>
                            </a-form-model-item>
                        </a-col> -->

                        <!-- 竞价分类选择（替换为普通下拉） -->
                        <a-col :span="24" v-if="Sign">
                            <a-form-model-item label="竞价分类" :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }"
                                prop="biddingRebateId">
                                <JSearchSelectTag placeholder="请选择竞价分类" v-model="model.biddingRebateId"
                                    :dict="`tab_bidding_rebate_template,cont,id,del_flag = '0' and channel_sign = '${Sign}'`"
                                    async allowClear />
                            </a-form-model-item>
                        </a-col>

                        <!-- 绑定时间选择 -->
                        <a-col :span="24">
                            <a-form-model-item label="绑定时间" :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }"
                                prop="date">
                                <a-date-picker v-model="model.date" valueFormat="YYYY-MM-DD" style="width: 100%"
                                    :disabledDate="disabledDate" />
                            </a-form-model-item>
                        </a-col>

                        <!-- 是否覆盖选项 -->
                        <a-col :span="24">
                            <a-form-model-item label="是否覆盖" :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }"
                                prop="isCover">
                                <a-radio-group v-model="model.isCover" button-style="solid">
                                    <a-radio-button :value="true">覆盖</a-radio-button>
                                    <a-radio-button :value="false">不覆盖</a-radio-button>
                                </a-radio-group>
                                <div class="form-item-help">
                                    选择覆盖会覆盖从绑定时间开始往后所有的消耗数据，否则只会覆盖未绑定竞价分类日期的消耗数据
                                </div>
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

            <!-- 新增产品弹窗 -->
            <a-modal title="新增产品" :visible="addProductVisible" :confirm-loading="addProductLoading"
                @ok="handleAddProductOk" @cancel="handleAddProductCancel" :width="500">
                <a-form-model ref="addProductForm" :model="addProductModel" :rules="addProductRules">
                    <a-form-model-item label="产品名称" :labelCol="{ span: 6 }" :wrapperCol="{ span: 16 }"
                        prop="productName">
                        <a-input v-model="addProductModel.productName" placeholder="请输入产品名称" />
                    </a-form-model-item>
                </a-form-model>
            </a-modal>
        </a-spin>
    </a-modal>
</template>

<script>
import { httpAction } from '@/api/manage'
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
            dataList: [],
            // 账号ID列表错误信息
            dataListError: '',
            // 产品选择器的选项列表
            productOptions: [],
            // 表单数据模型
            model: {
                date: undefined,
                isCover: true,
                biddingRebateId: undefined
            },
            // 表单验证规则
            validatorRules: {
                date: [{
                    required: true,
                    message: '请选择绑定日期',
                    validator: (rule, value, callback) => {
                        if (!value) {
                            callback(new Error('请选择绑定日期'))
                        } else if (moment(value).isAfter(moment(), 'day')) {
                            callback(new Error('绑定日期不能晚于今天'))
                        } else {
                            callback()
                        }
                    }
                }],
                biddingRebateId: [{ required: true, message: '请选择竞价分类' }]
            },
            // API 地址
            url: {
                add: "/accountinfo/bindingRebate",
                edit: "/accountinfo/edit",
                queryById: "/accountinfo/queryById",
                getProductsByProjectId: "/productManage/getByProId"
            },
            // 新增产品相关
            addProductVisible: false,
            addProductLoading: false,
            addProductModel: {
                productName: ''
            },
            addProductRules: {
                productName: [
                    { required: true, message: '请输入产品名称', trigger: 'blur' }
                ]
            }
        }
    },
    computed: {
        // 控制表单是否禁用
        formDisabled() {
            return this.disabled
        }
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
        showModal(idlist, channel) {
            this.Sign = channel
            this.dataList = idlist.map(item => item.accountId).filter(Boolean) || []
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

                const response = await axios({
                    method: 'post',
                    url: this.API_BASE_URL + '/accountinfo/bindingRebate',
                    data: {
                        date: this.model.date,
                        isCover: this.model.isCover,
                        biddingRebateId: this.model.biddingRebateId,
                        // accountIds: this.dataList.map(item => this.Sign + item)
                        channelSign: this.Sign,
                        accountIds: this.dataList
                    },
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Access-Token': Vue.ls.get(ACCESS_TOKEN)

                    }
                })

                if (response.data.success) {
                    this.$message.success(response.data.message)
                    this.$emit('ok')
                    this.handleCancel()
                } else {
                    this.$message.warning(response.data.message || '操作失败')
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
            this.productOptions = [];
        },

        // 显示新增产品弹窗
        showAddProductModal() {
            this.addProductVisible = true;
            this.addProductModel.productName = '';
        },

        // 处理新增产品确认
        async handleAddProductOk() {
            try {
                this.addProductLoading = true;
                await this.$refs.addProductForm.validate();

                const { success, message, result } = await httpAction('/productManage/add', {
                    productName: this.addProductModel.productName,
                }, 'post');

                if (success) {
                    this.$message.success('添加成功');
                    // 刷新产品列表
                    await this.fetchProductsByProjectId(this.model.projectId);
                    // 关闭弹窗
                    this.handleAddProductCancel();
                } else {
                    this.$message.warning(message || '添加失败');
                }
            } catch (error) {
                console.error('添加产品失败:', error);
                this.$message.error('添加产品失败');
            } finally {
                this.addProductLoading = false;
            }
        },

        // 处理新增产品取消
        handleAddProductCancel() {
            this.addProductVisible = false;
            this.$refs.addProductForm.resetFields();
        }
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