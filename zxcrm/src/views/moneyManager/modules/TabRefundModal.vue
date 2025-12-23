<template>
    <j-modal :title="title" :width="width" :visible="visible" switchFullscreen @ok="handleOk"
        :okButtonProps="{ class: { 'jee-hidden': disableSubmit } }" @cancel="handleCancel" cancelText="关闭">
        <tab-refund-form ref="realForm" @ok="submitCallback" :disabled="disableSubmit"></tab-refund-form>

        <!-- 自定义按钮区域 -->
        <template slot="footer">
            <div style="text-align: right;">
                <a-button v-if="showActionButtons && (userRoles.includes('money') || userRoles.includes('admin'))"
                    @click="handleButton1" type="primary" style="margin-right: 8px;">
                    同意
                </a-button>
                <a-button v-if="showActionButtons && (userRoles.includes('money') || userRoles.includes('admin'))"
                    @click="handleButton2" type="danger" style="margin-right: 8px;">
                    驳回
                </a-button>
                <a-button type="primary" @click="handleOk" v-if="isAdd">确定</a-button>
                <a-button @click="handleCancel">取消</a-button>
            </div>
        </template>
    </j-modal>
</template>

<script>
import TabRefundForm from './TabRefundForm'
import { getAction } from '@/api/manage'

export default {
    name: 'TabRefundModal',
    components: {
        TabRefundForm
    },
    data() {
        return {
            userRoles: [],
            title: '',
            width: 800,
            visible: false,
            disableSubmit: false,
            showActionButtons: false,
            isAdd: false,
        }
    },
    created() {
        // console.log(this.$store.getters.userInfo.username, 'this.$store.getters.userInfo.username')
        getAction('/sys/api/queryUserRoles', {
            username: this.$store.getters.userInfo.username
        }).then(res => {
            this.userRoles = res
        })
    },
    watch: {
        visible(newVal) {
            if (!newVal) {
                this.isAdd = false
            }
        }
    },
    methods: {
        add() {
            this.isAdd = true
            this.visible = true
            this.$nextTick(() => {
                this.$refs.realForm.add();
            })
        },
        edit(record) {
            this.visible = true
            this.$nextTick(() => {
                this.$refs.realForm.edit(record);
                // 只有在退款中状态时才显示操作按钮
                this.showActionButtons = record.state == 1;
            })
        },
        close() {
            this.showActionButtons = false
            this.isAdd = false
            this.$emit('close');
            this.visible = false;
        },
        handleOk() {
            this.$refs.realForm.submitForm();
        },
        submitCallback() {
            this.$emit('ok');
            this.visible = false;
        },
        handleCancel() {
            this.close()
        },
        // 按钮1的处理方法
        handleButton1() {
            this.$emit('approve', this.$refs.realForm.model);
        },
        // 按钮2的处理方法
        handleButton2() {
            this.$emit('reject', this.$refs.realForm.model);
        }
    }
}
</script>