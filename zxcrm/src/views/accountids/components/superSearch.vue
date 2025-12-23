<template>
    <a-modal title="批量查询" :visible="visible" :confirm-loading="confirmLoading" @ok="handleOk" @cancel="handleCancel"
        :width="800" :maskClosable="false" :keyboard="false">
        <a-card :bordered="false">
            <binding v-model="dataList" @validate="handleValidate" @paste="paste" />
            <a-alert v-if="dataListError" type="error" :message="dataListError" show-icon class="error-alert" />
        </a-card>
        <template slot="footer">
            <a-button @click="handleCancel">取消</a-button>
            <a-button @click="handleReset" style="margin-left: 8px">重置</a-button>
            <a-button type="primary" @click="handleOk" :loading="confirmLoading">确定</a-button>
        </template>
    </a-modal>
</template>

<script>
import binding from './binding.vue'
export default {
    name: 'superSearch',
    components: {
        binding
    },
    data() {
        return {
            visible: false,
            confirmLoading: false,
            dataListError: '',
            // 账号ID列表
            dataList: [],
            // 保存上次的 dataList
            lastDataList: [],
            url: {
                add: "/accountinfo/bindingProAndProductm",
                edit: "/accountinfo/edit",
                queryById: "/accountinfo/queryById",
                getProductsByProjectId: "/productManage/getByProId"
            },
        }
    },
    methods: {
        showModal() {
            this.reset()
            this.visible = true
        },
        reset() {
            // 如果有上次的数据，则恢复；否则使用默认值
            if (this.lastDataList.length > 0) {
                this.dataList = [...this.lastDataList]
            } else {
                this.dataList = ['']
            }
            this.dataListError = ''
        },
        // 处理绑定组件的验证事件
        handleValidate(error) {
            this.dataListError = error
        },
        // 验证账号ID列表
        validateDataList() {
            if (this.dataList.length === 0) {
                this.dataListError = '至少输入一个ID'
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
            // 保存当前的 dataList 到 lastDataList
            this.lastDataList = [...this.dataList]

            let superQueryParams = []
            if (this.dataList && this.dataList.length > 0) {
                superQueryParams = this.dataList.map(item => {
                    return {
                        rule: "eq",
                        val: item + '',
                        type: "string",
                        dictCode: "",
                        extendOption: ["Y", "N"],
                        field: "accountId"
                    }
                })
            }
            this.$emit('ok', this.dataList, 'or')
            this.visible = false
        },
        // 处理取消按钮
        handleCancel() {
            this.reset()
            this.visible = false
        },
        // 处理重置按钮
        handleReset() {
            this.dataList = ['']
            this.dataListError = ''
            this.$emit('ok', [], 'and')
            this.visible = false
        },
        paste(data, activeIndex) {
            // 1. 处理粘贴的数据
            const pastedItems = (data && data.match(/\S+/g)) || [];

            // 2. 默认从最后一行开始（如果 activeIndex 无效）
            if (activeIndex === -1) {
                activeIndex = this.dataList.length - 1;
            }

            // 3. 判断当前行是否为空
            const currentLine = this.dataList[activeIndex];
            const isCurrentLineEmpty = (typeof currentLine === 'string') && currentLine.trim() === '';

            if (isCurrentLineEmpty) {
                // 覆盖当前空行
                this.dataList.splice(activeIndex, pastedItems.length, ...pastedItems);
            } else {
                // 从下一行插入
                this.dataList.splice(activeIndex + 1, 0, ...pastedItems);
            }
        },
        // 清除上次的数据列表
        clearLastDataList() {
            this.lastDataList = []
        }
    },
}
</script>

<style lang="less" scoped></style>