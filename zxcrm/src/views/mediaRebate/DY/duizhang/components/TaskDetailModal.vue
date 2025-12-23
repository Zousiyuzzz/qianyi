<template>
    <a-drawer title="核算明细任务" :width="1000" :visible="visible" :confirmLoading="confirmLoading" @close="handleCancel"
        :closable="true" :maskClosable="false">
        <div class="table-page-search-wrapper">
            <a-form layout="inline" @keyup.enter.native="searchQuery">
                <a-row :gutter="24">
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="代理商名称">
                            <a-input placeholder="请输入代理商名称" v-model="queryParam.agentName"></a-input>
                        </a-form-item>
                    </a-col>
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="查询文件类型">
                            <a-select placeholder="请选择查询文件类型" v-model="queryParam.queryType">
                                <a-select-option value="">全部</a-select-option>
                                <a-select-option value="month_performance_details">月度业绩明细</a-select-option>
                                <a-select-option value="month_rebate_details">月度核算明细</a-select-option>
                                <a-select-option value="month_punish_details">月度违规明细</a-select-option>
                                <a-select-option value="quarter_performance_details">季度业绩明细</a-select-option>
                                <a-select-option value="quarter_rebate_details">季度核算明细</a-select-option>
                                <a-select-option value="quarter_punish_details">季度违规明细</a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="任务创建状态">
                            <a-select placeholder="请选择任务创建状态" v-model="queryParam.taskState">
                                <a-select-option value="">全部</a-select-option>
                                <a-select-option value="1">成功</a-select-option>
                                <a-select-option value="2">失败</a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
                            <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
                            <a-button type="primary" @click="searchReset" icon="reload"
                                style="margin-left: 8px">重置</a-button>
                        </span>
                    </a-col>
                </a-row>
            </a-form>
        </div>

        <div class="table-operator">
            <a-button type="primary" icon="download" @click="handleExportXls('核算明细任务')">导出</a-button>
        </div>

        <div>
            <a-table ref="table" size="middle" :scroll="{ x: true }" bordered rowKey="id" :columns="columns"
                :dataSource="dataSource" :pagination="ipagination" :loading="loading" class="j-table-force-nowrap"
                @change="handleTableChange">
                <template slot="taskStateSlot" slot-scope="text, record">
                    <a-tag :color="getTaskStateColor(record.taskState)">
                        {{ getTaskStateText(record.taskState) }}
                    </a-tag>
                </template>

                <template slot="queryStatusSlot" slot-scope="text, record">
                    <a-tag :color="getQueryStatusColor(record.queryStatus)">
                        {{ getQueryStatusText(record.queryStatus) }}
                    </a-tag>
                </template>

                <template slot="isDownloadSlot" slot-scope="text, record">
                    <a-tag :color="record.isDownload === 2 ? 'green' : 'orange'">
                        {{ record.isDownload === 2 ? '已下载' : '未下载' }}
                    </a-tag>
                </template>

                <template slot="queryTypeSlot" slot-scope="text, record">
                    <a-tag color="blue">
                        {{ getQueryTypeText(record.queryType) }}
                    </a-tag>
                </template>

                <span slot="action" slot-scope="text, record">
                    <a @click="handleDownload(record)" v-if="record.queryStatus === 3 && record.isDownload === 1">
                        <a-icon type="download" /> 下载
                    </a>
                    <a @click="handleRetry(record)" v-if="record.taskState === 2 || record.queryStatus === 4">
                        <a-icon type="reload" /> 重试
                    </a>
                </span>
            </a-table>
        </div>
    </a-drawer>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'

export default {
    name: 'TaskDetailModal',
    mixins: [JeecgListMixin],
    data() {
        return {
            description: '核算明细任务查询',
            visible: false,
            confirmLoading: false,
            rebateAccountingInfoId: null,
            // 表单查询参数
            queryParam: {
                agentName: null,
                queryType: null,
                taskState: null,
            },
            // 表单提交参数
            url: {
                list: '', // 暂时留空
                exportXlsUrl: '', // 暂时留空
            },
            ipagination: {
                current: 1,
                pageSize: 10,
                pageSizeOptions: ['10', '20', '30', '40', '50'],
                showTotal: (total, range) => {
                    return `当前第 ${range[0]} - ${range[1]} 条 / 共 ${total} 条`
                },
                showQuickJumper: true,
                showSizeChanger: true,
                total: 0,
            },
        }
    },
    computed: {
        columns() {
            return [
                {
                    title: '渠道名称',
                    align: 'center',
                    dataIndex: 'channelName',
                    width: 120,
                },
                {
                    title: '应用ID',
                    align: 'center',
                    dataIndex: 'applyId',
                    width: 120,
                },
                {
                    title: '代理商名称',
                    align: 'center',
                    dataIndex: 'agentName',
                    width: 150,
                },
                {
                    title: '查询文件类型',
                    align: 'center',
                    dataIndex: 'queryType',
                    width: 150,
                    scopedSlots: { customRender: 'queryTypeSlot' },
                },
                {
                    title: '结算年份',
                    align: 'center',
                    dataIndex: 'year',
                    width: 80,
                },
                {
                    title: '结算季度/月度',
                    align: 'center',
                    dataIndex: 'monthQuarter',
                    width: 120,
                },
                {
                    title: '任务创建状态',
                    align: 'center',
                    dataIndex: 'taskState',
                    width: 120,
                    scopedSlots: { customRender: 'taskStateSlot' },
                },
                {
                    title: '失败原因',
                    align: 'center',
                    dataIndex: 'errMsg',
                    width: 200,
                },
                {
                    title: '查询ID',
                    align: 'center',
                    dataIndex: 'queryId',
                    width: 150,
                },
                {
                    title: '数据最新更新时间',
                    align: 'center',
                    dataIndex: 'updateDate',
                    width: 120,
                },
                {
                    title: '查询状态',
                    align: 'center',
                    dataIndex: 'queryStatus',
                    width: 100,
                    scopedSlots: { customRender: 'queryStatusSlot' },
                },
                {
                    title: '任务ID',
                    align: 'center',
                    dataIndex: 'taskId',
                    width: 150,
                },
                {
                    title: '是否下载任务',
                    align: 'center',
                    dataIndex: 'isDownload',
                    width: 120,
                    scopedSlots: { customRender: 'isDownloadSlot' },
                },
                {
                    title: '操作',
                    align: 'center',
                    dataIndex: 'action',
                    width: 120,
                    fixed: 'right',
                    scopedSlots: { customRender: 'action' },
                },
            ]
        },
    },
    methods: {
        show(record) {
            this.visible = true
            this.rebateAccountingInfoId = record.rebateAccountingInfoId
            this.queryParam = {
                agentName: null,
                queryType: null,
                taskState: null,
            }
            this.ipagination.current = 1
            this.getList()
        },
        handleCancel() {
            this.visible = false
        },
        searchQuery() {
            this.ipagination.current = 1
            this.getList()
        },
        searchReset() {
            this.queryParam = {
                agentName: null,
                queryType: null,
                taskState: null,
            }
            this.ipagination.current = 1
            this.getList()
        },
        handleExportXls(fileName) {
            const params = {
                ...this.queryParam,
                rebateAccountingInfoId: this.rebateAccountingInfoId,
                ...this.ipagination,
            }
            this.$exportXls(this.url.exportXlsUrl, params, fileName)
        },
        handleTableChange(pagination, filters, sorter) {
            this.ipagination = pagination
            this.getList()
        },
        getTaskStateColor(state) {
            const colorMap = {
                '1': 'green',      // 成功
                '2': 'red',        // 失败
            }
            return colorMap[state] || 'default'
        },
        getTaskStateText(state) {
            const textMap = {
                '1': '成功',
                '2': '失败',
            }
            return textMap[state] || '未知'
        },
        getQueryStatusColor(status) {
            const colorMap = {
                '1': 'blue',       // 初始化
                '2': 'orange',     // 运行中
                '3': 'green',      // 成功
                '4': 'red',        // 失败
            }
            return colorMap[status] || 'default'
        },
        getQueryStatusText(status) {
            const textMap = {
                '1': '初始化',
                '2': '运行中',
                '3': '成功',
                '4': '失败',
            }
            return textMap[status] || '未知'
        },
        getQueryTypeText(type) {
            const textMap = {
                'month_performance_details': '月度业绩明细',
                'month_rebate_details': '月度核算明细',
                'month_punish_details': '月度违规明细',
                'quarter_performance_details': '季度业绩明细',
                'quarter_rebate_details': '季度核算明细',
                'quarter_punish_details': '季度违规明细',
            }
            return textMap[type] || type
        },
        handleDownload(record) {
            // 处理下载逻辑
            this.$message.info('下载功能待实现')
        },
        handleRetry(record) {
            // 处理重试逻辑
            this.$message.info('重试功能待实现')
        },
        getList() {
            this.loading = true
            // 这里调用实际的API接口
            // this.$api.douyinRebateTask.list(Object.assign(this.queryParam, this.ipagination, { rebateAccountingInfoId: this.rebateAccountingInfoId })).then(
            //   (res) => {
            //     this.dataSource = res.result.records
            //     this.ipagination.total = res.result.total
            //   }
            // ).catch(() => {
            //     this.loading = false
            // }).finally(() => {
            //     this.loading = false
            //   })

            // 模拟数据，实际使用时请替换为真实API调用
            setTimeout(() => {
                this.dataSource = []
                this.ipagination.total = 0
                this.loading = false
            }, 1000)
        },
    },
}
</script>

<style scoped>
@import '~@assets/less/common.less';

.table-page-search-wrapper {
    background: #fff;
    border-radius: 4px;
    margin-bottom: 16px;
}

.table-operator {
    margin-bottom: 18px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
}

.table-operator .ant-btn {
    margin-right: 0;
}

.ant-table-wrapper {
    background: #fff;
    padding: 24px;
    border-radius: 4px;
}

.ant-table-thead>tr>th {
    background: #fafafa;
    font-weight: 500;
}

.ant-table-tbody>tr:hover>td {
    background: #f5f5f5;
}

.ant-form-item {
    margin-bottom: 16px;
}

.ant-input-affix-wrapper {
    border-radius: 4px;
}

.ant-btn {
    border-radius: 4px;
    height: 32px;
    padding: 0 16px;
    font-size: 14px;
}

.ant-btn-primary {
    background: #1890ff;
    border-color: #1890ff;
}

.ant-btn-primary:hover {
    background: #40a9ff;
    border-color: #40a9ff;
}
</style>
