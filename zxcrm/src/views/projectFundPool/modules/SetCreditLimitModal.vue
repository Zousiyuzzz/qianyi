<template>
    <a-modal :title="'设置授信额度'" :visible="visible" @ok="handleOk" @cancel="handleCancel" okText="保存" cancelText="取消"
        width="500px">
        <a-form :model="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
            <!-- <a-form-item label="项目ID">
                <a-input v-model="form.proId" disabled />
            </a-form-item> -->
            <a-form-item label="项目名称">
                <a-input v-model="form.proName" disabled />
            </a-form-item>
            <a-form-item label="设置授信额度" :rules="[{ required: true, message: '请输入授信额度' }]">
                <a-input-number v-model="form.totalCreditLimit" style="width: 100%" placeholder="请输入授信额度" />
            </a-form-item>
        </a-form>
    </a-modal>
</template>

<script>
import { setCreditLimit } from '@/api/api'
export default {
    name: 'SetCreditLimitModal',
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        record: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            form: {
                proName: '',
                proId: '',
                totalCreditLimit: null,
                id: '' // 新增id字段
            }
        }
    },
    watch: {
        record: {
            immediate: true,
            handler(val) {
                if (val) {
                    this.form = {
                        proName: val.proName || '',
                        proId: val.proId || '',
                        totalCreditLimit: val.totalCreditLimit || null,
                        id: val.id || '', // 同步id
                        proUniqueId: val.proUniqueId || ''
                    }
                }
            }
        },
        visible(val) {
            if (!val) {
                this.$emit('update:record', {});
            }
        }
    },
    methods: {

        async handleOk() {
            if (!this.form.totalCreditLimit && this.form.totalCreditLimit !== 0) {
                this.$message.error('请输入授信额度');
                return;
            }
            if (this.form.totalCreditLimit < 0) {
                this.$message.error('授信额度不能小于0');
                return;
            }
            try {
                const res = await setCreditLimit({ ...this.form });
                if (res && res.code === 200) {
                    this.$message.success('授信额度设置成功');
                    this.$emit('save', { ...this.form });
                } else {
                    let msg = (res && (res.message || res.msg)) ? (res.message || res.msg) : '设置授信额度失败';
                    this.$message.error(msg);
                }
            } catch (e) {
                let msg = '设置授信额度失败';
                if (e && e.response && e.response.data) {
                    msg = e.response.data.message || e.response.data.msg || msg;
                } else if (e && (e.message || e.msg)) {
                    msg = e.message || e.msg;
                }
                this.$message.error(msg);
            }
        },
        handleCancel() {
            this.$emit('cancel');
        }
    }
}
</script>