<template>
    <a-spin :spinning="confirmLoading">
        <j-form-container :disabled="formDisabled">
            <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
                <a-row>
                    <a-col :span="24">
                        <a-form-model-item label="推广位名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="zoneName">
                            <a-input v-model="model.zoneName" placeholder="请输入推广位名称"></a-input>
                        </a-form-model-item>
                    </a-col>
                    <a-col :span="24">
                        <a-form-model-item label="媒体账户名称" :labelCol="labelCol" :wrapperCol="wrapperCol"
                            prop="mediaAccountName">
                            <a-input v-model="model.mediaAccountName" placeholder="请输入媒体账户名称"></a-input>
                        </a-form-model-item>
                    </a-col>
                    <a-col :span="24">
                        <a-form-model-item label="钉钉机器人" :labelCol="labelCol" :wrapperCol="wrapperCol"
                            prop="dingtalkRobotId">
                            <a-select v-model="model.dingtalkRobotId" placeholder="请选择钉钉机器人" :options="robotOptions"
                                :loading="robotLoading" show-search option-filter-prop="label"
                                :filter-option="filterRobotOption" allowClear @focus="loadRobotOptions" />
                        </a-form-model-item>
                    </a-col>
                </a-row>
            </a-form-model>
        </j-form-container>
    </a-spin>
</template>

<script>
import { httpAction, getAction } from '@/api/manage'
export default {
    name: 'PromotionZoneForm',
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
                zoneName: [{ required: true, message: '请输入推广位名称' }],
                mediaAccountName: [{ required: true, message: '请输入媒体账户名称' }],
                dingtalkRobotId: [{ required: true, message: '请选择钉钉机器人' }],
            },
            url: {
                add: '/promotionZoneConfig/add',
                edit: '/promotionZoneConfig/edit',
                queryById: '/promotionZoneConfig/queryById'
            },
            robotOptions: [],
            robotLoading: false
        }
    },
    computed: {
        formDisabled() {
            return this.disabled
        },
    },
    created() {
        this.modelDefault = JSON.parse(JSON.stringify(this.model));
        this.loadRobotOptions();
    },
    methods: {
        add() {
            this.edit(this.modelDefault);
        },
        edit(record) {
            this.model = Object.assign({}, record);
            this.visible = true;
            this.loadRobotOptions();
        },
        submitForm() {
            const that = this;
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
        loadRobotOptions() {
            if (this.robotOptions.length > 0) return;
            this.robotLoading = true;
            getAction('/dingtalkRobotConfig/list', { pageSize: 100 }).then(res => {
                if (res.success && res.result) {
                    let arr = res.result.records || res.result;
                    this.robotOptions = arr.map(item => ({ label: item.robotName, value: item.id }));
                }
            }).finally(() => {
                this.robotLoading = false;
            })
        },
        filterRobotOption(input, option) {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        }
    }
}
</script>