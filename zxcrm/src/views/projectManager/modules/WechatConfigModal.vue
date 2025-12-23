<template>
    <a-modal :title="title" :width="modalWidth" :visible="visible" @ok="handleOk"
        :okButtonProps="{ class: { 'jee-hidden': disableSubmit } }" @cancel="handleCancel" cancelText="关闭"
        :bodyStyle="bodyStyle" :maskClosable="false" :destroyOnClose="true">
        <div class="modal-content">
            <!-- 微信功能配置字段 -->
            <template>
                <div class="form-section">
                    <h4 class="section-title">
                        <a-icon type="appstore" />
                        微信功能配置信息
                    </h4>
                    <a-form-model ref="form" :model="form" :rules="validatorRules" :label-col="labelCol"
                        :wrapper-col="wrapperCol">
                        <a-row :gutter="24">
                            <a-col :span="24">
                                <a-form-model-item label="微信群/好友名称" prop="chatName">
                                    <a-input v-model="form.chatName" placeholder="请输入微信群/好友名称" size="large" />
                                </a-form-model-item>
                            </a-col>
                            <a-col :span="24">
                                <a-form-model-item label="功能" prop="functionName">
                                    <j-multi-select-tag v-model="form.functionName" placeholder="请选择功能"
                                        dictCode="wechat_function_name" />
                                </a-form-model-item>
                            </a-col>
                            <a-col :span="24">
                                <a-form-model-item label="微信地址">
                                    <div class="readonly-field">{{ form.wechatAddress || '--' }}</div>
                                </a-form-model-item>
                            </a-col>
                            <a-col :span="24">
                                <a-form-model-item label="微信名称">
                                    <div class="readonly-field">{{ form.wechatName || '--' }}</div>
                                </a-form-model-item>
                            </a-col>
                            <a-col :span="24">
                                <a-form-model-item label="项目" prop="proId">
                                    <JSearchSelectTag placeholder="请选择项目" v-model="form.proId"
                                        dict="tab_projectManage,pro_name,id,del_flag = '0'" async allowClear
                                        mode="multiple" />
                                </a-form-model-item>
                            </a-col>
                        </a-row>
                    </a-form-model>
                </div>
            </template>
        </div>
    </a-modal>
</template>

<script>
import { httpAction } from '@/api/manage'
import { ajaxGetDictItems, getDictItemsFromCache } from '@/api/api'
import { initDictOptions } from '@/components/dict/JDictSelectUtil'

export default {
    name: 'WechatConfigModal',
    props: {
        activeTab: {
            type: String,
            default: 'wechatFunctionConfig'
        }
    },
    data() {
        return {
            title: '',
            modalWidth: 900,
            visible: false,
            disableSubmit: false,
            labelCol: { span: 6 },
            wrapperCol: { span: 18 },
            form: {},
            validatorRules: {},
            bodyStyle: {
                padding: '24px 32px',
                maxHeight: '70vh',
                overflowY: 'auto'
            }
        }
    },
    mounted() {
        this.getWechatServeConfig()
    },
    methods: {
        add() {
            this.visible = true
            this.title = '新增'
            this.form = {}
            this.setValidatorRules()
            this.loadWechatConfig()
        },
        edit(record) {
            this.visible = true
            this.title = '编辑'
            this.form = { ...record }
            // 处理布尔值字段
            if (this.activeTab === 'wechatGroupAdminConfig') {
                this.form.creditAdjustPermission = this.form.creditAdjustPermission === 'true' || this.form.creditAdjustPermission === true
                this.form.creditSetPermission = this.form.creditSetPermission === 'true' || this.form.creditSetPermission === true
                this.form.fundPreparePermission = this.form.fundPreparePermission === 'true' || this.form.fundPreparePermission === true
            }
            this.setValidatorRules()
            this.loadWechatConfig()
        },
        close() {
            this.$emit('close')
            this.visible = false
        },
        handleOk() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    this.submitForm()
                }
            })
        },
        handleCancel() {
            this.close()
        },
        submitForm() {
            const url = this.getSubmitUrl()
            const method = this.form.id ? 'put' : 'post'

            httpAction(url, this.form, method).then((res) => {
                if (res.success) {
                    this.$message.success(this.form.id ? '编辑成功' : '新增成功')
                    this.$emit('ok')
                    this.close()
                } else {
                    this.$message.error(res.message || '操作失败')
                }
            }).catch((error) => {
                this.$message.error('操作失败')
                console.error(error)
            })
        },
        getSubmitUrl() {
            return this.form.id ? '/wechatFunctionConfig/edit' : '/wechatFunctionConfig/add'
        },
        setValidatorRules() {
            this.validatorRules = {
                chatName: [{ required: true, message: '请输入微信群/好友名称', trigger: 'blur' }],
                functionName: [{ required: true, message: '请输入功能', trigger: 'blur' }]
                // proId: [{ required: true, message: '请选择项目', trigger: 'change' }]
            }
        },
        // 获取 wechat_serve_config 字典数据并赋值到表单
        async loadWechatConfig() {
            try {
                // 优先从缓存获取
                let dictData = getDictItemsFromCache('wechat_serve_config')

                // 如果缓存中没有，则从服务器获取
                if (!dictData || dictData.length === 0) {
                    const res = await ajaxGetDictItems('wechat_serve_config', null)
                    if (res.success && res.result) {
                        dictData = res.result
                    }
                }

                if (dictData && dictData.length > 0) {
                    // 查找 value 为 "微信地址" 的项
                    const addressItem = dictData.find(item => item.value === '微信地址')
                    if (addressItem && addressItem.text) {
                        this.$set(this.form, 'wechatAddress', addressItem.text)
                        console.log('设置微信地址:', addressItem.text)
                    }

                    // 查找 value 为 "微信名称" 的项
                    const nameItem = dictData.find(item => item.value === '微信名称')
                    if (nameItem && nameItem.text) {
                        this.$set(this.form, 'wechatName', nameItem.text)
                        console.log('设置微信名称:', nameItem.text)
                    }
                }
            } catch (error) {
                console.error('加载微信配置字典失败:', error)
            }
        },
        // 获取 wechat_serve_config 字典数据（调试用）
        async getWechatServeConfig() {
            console.log('=== 开始获取 wechat_serve_config 字典 ===')

            // 方法1: 先尝试从缓存获取
            const cacheData = getDictItemsFromCache('wechat_serve_config')
            if (cacheData) {
                console.log('从缓存获取 wechat_serve_config:', cacheData)
            } else {
                console.log('缓存中没有 wechat_serve_config 数据')
            }

            // 方法2: 使用 initDictOptions 方法（优先缓存，没有则请求服务器）
            try {
                const res = await initDictOptions('wechat_serve_config')
                if (res.success) {
                    console.log('使用 initDictOptions 获取 wechat_serve_config:', res.result)
                } else {
                    console.warn('initDictOptions 获取失败:', res)
                }
            } catch (error) {
                console.error('initDictOptions 获取异常:', error)
            }

            // 方法3: 直接从服务器获取
            try {
                const res = await ajaxGetDictItems('wechat_serve_config', null)
                console.log('直接从服务器获取 wechat_serve_config:', res)
                if (res.success) {
                    console.log('服务器返回的字典数据:', JSON.stringify(res.result, null, 2))
                }
            } catch (error) {
                console.error('直接从服务器获取异常:', error)
            }

            console.log('=== 结束获取 wechat_serve_config 字典 ===')
        }
    }
}
</script>

<style scoped>
.modal-content {
    padding: 0;
}

.form-section {
    margin-bottom: 24px;
}

.section-title {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 2px solid #f0f0f0;
    font-size: 16px;
    font-weight: 600;
    color: #1890ff;
}

.section-title .anticon {
    margin-right: 8px;
    font-size: 18px;
}

.permission-section {
    margin-top: 24px;
    padding: 20px;
    background: #fafafa;
    border-radius: 8px;
    border: 1px solid #e8e8e8;
    overflow: hidden;
}

.permission-title {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    font-size: 14px;
    font-weight: 600;
    color: #666;
}

.permission-title .anticon {
    margin-right: 6px;
    color: #1890ff;
}

.permission-item {
    text-align: center;
    padding: 16px 12px;
    background: #fff;
    border-radius: 6px;
    border: 1px solid #e8e8e8;
    transition: all 0.3s ease;
    min-height: 140px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.permission-item:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-color: #1890ff;
}

.permission-switch {
    display: flex;
    justify-content: center;
    margin: 8px 0;
}

.permission-desc {
    margin-top: 8px;
    margin-bottom: 0;
    font-size: 12px;
    color: #999;
    line-height: 1.4;
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
}

/* 表单样式优化 */
.ant-form-item {
    margin-bottom: 20px;
}

.ant-form-item-label {
    font-weight: 500;
}

.ant-input,
.ant-select {
    border-radius: 6px;
}

/* 只读字段样式 */
.readonly-field {
    padding: 8px 12px;
    min-height: 40px;
    line-height: 24px;
    background-color: #f5f5f5;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    color: #333;
    font-size: 14px;
    display: flex;
    align-items: center;
}

.ant-input:focus,
.ant-select:focus {
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

/* 开关样式优化 */
.ant-switch {
    background-color: #d9d9d9;
}

.ant-switch-checked {
    background-color: #1890ff;
}

/* 选择器选项样式 */
.ant-select-option {
    display: flex;
    align-items: center;
}

.ant-select-option .anticon {
    margin-right: 6px;
}

/* 权限配置区域特殊处理 */
.permission-section .ant-row {
    margin: 0 -8px;
}

.permission-section .ant-col {
    padding: 0 8px;
}

/* 确保权限项内容不被遮挡 */
.permission-item .ant-form-item-label {
    white-space: nowrap;
    overflow: visible;
    text-overflow: unset;
    margin-bottom: 8px;
}

.permission-item .ant-form-item-label>label {
    font-size: 13px;
    font-weight: 500;
    color: #333;
    line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .modal-content {
        padding: 16px;
    }

    .permission-section {
        padding: 16px;
    }

    .permission-item {
        padding: 12px 8px;
        min-height: 120px;
    }

    .permission-desc {
        font-size: 11px;
    }
}

@media (max-width: 480px) {
    .permission-section .ant-row {
        flex-direction: column;
    }

    .permission-section .ant-col {
        width: 100% !important;
        max-width: 100% !important;
        flex: 0 0 100% !important;
        margin-bottom: 16px;
    }
}
</style>
