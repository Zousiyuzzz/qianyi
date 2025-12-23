<template>
    <a-form-model ref="form" :model="model" :rules="validatorRules" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-model-item label="广告主账户ID" prop="advertiserId">
            <a-input v-model="model.advertiserId" placeholder="请输入广告主账户ID"></a-input>
        </a-form-model-item>

        <a-form-model-item label="爆款素材ID" prop="materialIds">
            <a-input v-model="model.materialIds" placeholder="请输入爆款素材ID"></a-input>
        </a-form-model-item>

        <a-form-model-item label="原料ID" prop="elementIds">
            <a-input v-model="model.elementIds" placeholder="请输入原料ID"></a-input>
        </a-form-model-item>

        <a-form-model-item label="生效策略" prop="strategies">
            <a-select v-model="model.strategies" mode="multiple" placeholder="请选择生效策略" allowClear>
                <a-select-option value="CLIP_REPLACE">分镜替换</a-select-option>
                <a-select-option value="ROBOT_REPLACE">人物替换</a-select-option>
                <a-select-option value="HOT_PRE_VIDEO">爆款开头</a-select-option>
                <a-select-option value="MIX_CUT">重新混剪</a-select-option>
                <a-select-option value="PRE_VIDEO_CLIP_REPLACE">前贴扩写</a-select-option>
                <a-select-option value="RAW_MATERIAL_REPLACE">原料分镜替换</a-select-option>
                <a-select-option value="DERIVE_FROM_CHOSEN_HOT_MID">自有爆款套路（仅千川账户支持）</a-select-option>
                <a-select-option value="DERIVE_FROM_INDUSTRY_HOT_PATTERN">行业爆款套路（仅千川账户支持）</a-select-option>
                <a-select-option value="AIGC_PRE_VIDEO">AIGC前贴新增</a-select-option>
                <a-select-option value="AIGC_HUMAN_REPLACE">AIGC人物替换</a-select-option>
                <a-select-option value="SMART_REPLACE">智能裂变</a-select-option>
            </a-select>
            <div class="field-tip">
                生效策略，默认为空全生效；支持项：CLIP_REPLACE-分镜替换，ROBOT_REPLACE-人物替换，HOT_PRE_VIDEO-爆款开头，MIX_CUT-重新混剪，PRE_VIDEO_CLIP_REPLACE-前贴扩写，RAW_MATERIAL_REPLACE-原料分镜替换，DERIVE_FROM_CHOSEN_HOT_MID-自有爆款套路（仅千川账户支持），DERIVE_FROM_INDUSTRY_HOT_PATTERN-行业爆款套路（仅千川账户支持），AIGC_PRE_VIDEO-AIGC前贴新增，AIGC_HUMAN_REPLACE-AIGC人物替换，SMART_REPLACE-智能裂变
            </div>
        </a-form-model-item>

        <a-form-model-item label="禁止策略" prop="excludeStrategies">
            <a-select v-model="model.excludeStrategies" mode="multiple" placeholder="请选择禁止策略" allowClear>
                <a-select-option value="CLIP_REPLACE">分镜替换</a-select-option>
                <a-select-option value="ROBOT_REPLACE">人物替换</a-select-option>
                <a-select-option value="HOT_PRE_VIDEO">爆款开头</a-select-option>
                <a-select-option value="MIX_CUT">重新混剪</a-select-option>
                <a-select-option value="PRE_VIDEO_CLIP_REPLACE">前贴扩写</a-select-option>
                <a-select-option value="RAW_MATERIAL_REPLACE">原料分镜替换</a-select-option>
                <a-select-option value="DERIVE_FROM_CHOSEN_HOT_MID">自有爆款套路（仅千川账户支持）</a-select-option>
                <a-select-option value="DERIVE_FROM_INDUSTRY_HOT_PATTERN">行业爆款套路（仅千川账户支持）</a-select-option>
                <a-select-option value="AIGC_PRE_VIDEO">AIGC前贴新增</a-select-option>
                <a-select-option value="AIGC_HUMAN_REPLACE">AIGC人物替换</a-select-option>
                <a-select-option value="SMART_REPLACE">智能裂变</a-select-option>
            </a-select>
            <div class="field-tip">禁止策略，范围同生效策略，优先级高于生效策略（两者都有时不生效）</div>
            <div class="field-tip">裂变限制(单条素材每天可裂变1次，最多裂变5次)</div>
        </a-form-model-item>
    </a-form-model>
</template>

<script>
import { httpAction } from '@/api/manage'

export default {
    name: 'DouyinFissionTaskForm',
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
            labelCol: { xs: { span: 24 }, sm: { span: 6 } },
            wrapperCol: { xs: { span: 24 }, sm: { span: 16 } },
            confirmLoading: false,
            validatorRules: {
                advertiserId: [
                    { required: true, message: '请输入广告主账户ID!' }
                ],
                materialIds: [
                    { required: true, message: '请输入爆款素材ID!' }
                ]
            },
            url: {
                add: "/douyinFissionTask/submitTask",
                edit: "/douyinFissionTask/edit",
                queryById: "/douyinFissionTask/queryById"
            }
        }
    },
    computed: {
        formDisabled() {
            return this.disabled
        }
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

            // 处理strategies、excludeStrategies和originMaterialId字段，确保多选组件能正确显示
            if (this.model.strategies && typeof this.model.strategies === 'string') {
                this.model.strategies = this.model.strategies.split(',').filter(item => item.trim());
            }
            if (this.model.excludeStrategies && typeof this.model.excludeStrategies === 'string') {
                this.model.excludeStrategies = this.model.excludeStrategies.split(',').filter(item => item.trim());
            }
            if (this.model.materialIds) {
                if (typeof this.model.materialIds === 'string') {
                    this.model.materialIds = this.model.materialIds.split(',').filter(item => item.trim());
                } else if (Array.isArray(this.model.materialIds)) {
                    this.model.materialIds = this.model.materialIds.join(',');
                }
            }

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

                    // 准备提交数据，将strategies、excludeStrategies和originMaterialId转换为数组
                    const submitData = { ...this.model };
                    if (submitData.strategies && typeof submitData.strategies === 'string') {
                        submitData.strategies = submitData.strategies.split(',').filter(item => item.trim());
                    }
                    if (submitData.excludeStrategies && typeof submitData.excludeStrategies === 'string') {
                        submitData.excludeStrategies = submitData.excludeStrategies.split(',').filter(item => item.trim());
                    }
                    if (submitData.materialIds && typeof submitData.materialIds === 'string') {
                        submitData.materialIds = submitData.materialIds.split(',').filter(item => item.trim());
                    }

                    httpAction(httpurl, submitData, method).then((res) => {
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
        popupCallback(row) {
            this.model = Object.assign({}, row);
        }
    }
}
</script>

<style scoped>
.field-tip {
    font-size: 12px;
    color: #999;
    margin-top: 4px;
    line-height: 1.4;
}
</style>
