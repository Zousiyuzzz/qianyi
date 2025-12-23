<template>
    <a-card :bordered="false">
        <!-- 查询区域 -->
        <div class="table-page-search-wrapper">
            <a-form layout="inline" @keyup.enter.native="searchQuery">
                <a-row :gutter="24">
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="渠道名称">
                            <a-input placeholder="请输入渠道名称" v-model="queryParam.channelName"></a-input>
                        </a-form-item>
                    </a-col>
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="审批状态">
                            <a-select placeholder="请选择审批状态" v-model="queryParam.status">
                                <a-select-option value="">全部</a-select-option>
                                <a-select-option value="1">待审批</a-select-option>
                                <a-select-option value="2">审批中</a-select-option>
                                <a-select-option value="3">审批完成</a-select-option>
                                <a-select-option value="4">审批拒绝</a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>

                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
                            <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
                            <a-button type="primary" @click="searchReset" icon="reload"
                                style="margin-left: 8px">重置</a-button>
                            <a @click="handleToggleSearch" style="margin-left: 8px">
                                {{ toggleSearchStatus ? '收起' : '展开' }}
                                <a-icon :type="toggleSearchStatus ? 'up' : 'down'" />
                            </a>
                        </span>
                    </a-col>
                </a-row>
                <a-row :gutter="24" v-show="toggleSearchStatus">
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="代理商">
                            <a-input placeholder="请输入代理商名称" v-model="queryParam.agentName"></a-input>
                        </a-form-item>
                    </a-col>
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="结算年份">
                            <a-select placeholder="请选择结算年份" v-model="queryParam.year">
                                <a-select-option value="">全部</a-select-option>
                                <a-select-option value="2024">2024年</a-select-option>
                                <a-select-option value="2023">2023年</a-select-option>
                                <a-select-option value="2022">2022年</a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="结算季度/月">
                            <a-select placeholder="请选择结算季度/月" v-model="queryParam.monthQuarter">
                                <a-select-option value="">全部</a-select-option>
                                <a-select-option value="1">1月</a-select-option>
                                <a-select-option value="2">2月</a-select-option>
                                <a-select-option value="3">3月</a-select-option>
                                <a-select-option value="4">4月</a-select-option>
                                <a-select-option value="5">5月</a-select-option>
                                <a-select-option value="6">6月</a-select-option>
                                <a-select-option value="7">7月</a-select-option>
                                <a-select-option value="8">8月</a-select-option>
                                <a-select-option value="9">9月</a-select-option>
                                <a-select-option value="10">10月</a-select-option>
                                <a-select-option value="11">11月</a-select-option>
                                <a-select-option value="12">12月</a-select-option>
                                <a-select-option value="13">Q1</a-select-option>
                                <a-select-option value="14">Q2</a-select-option>
                                <a-select-option value="15">Q3</a-select-option>
                                <a-select-option value="16">Q4</a-select-option>
                                <a-select-option value="17">上半年</a-select-option>
                                <a-select-option value="18">下半年</a-select-option>
                                <a-select-option value="19">全年</a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="是否已创建返点">
                            <a-select placeholder="请选择是否已创建返点" v-model="queryParam.isCreateRebate">
                                <a-select-option value="">全部</a-select-option>
                                <a-select-option value="1">是</a-select-option>
                                <a-select-option value="2">否</a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                </a-row>
            </a-form>
        </div>

        <!-- 操作按钮区域 -->
        <div class="table-operator">
            <!-- <a-button type="primary" icon="download" @click="handleExportXls('抖音返点核算流水')">导出</a-button> -->
            <j-super-query :fieldList="superFieldList" ref="superQueryModal"
                @handleSuperQuery="handleSuperQuery"></j-super-query>
        </div>

        <!-- table区域 -->
        <div>
            <a-table ref="table" size="middle" :scroll="{ x: true }" bordered rowKey="id" :columns="columns"
                :dataSource="dataSource" :pagination="ipagination" :loading="loading" class="j-table-force-nowrap"
                @change="handleTableChange">

                <template slot="statusSlot" slot-scope="text, record">
                    <a-tag :color="getStatusColor(record.status)">
                        {{ record.statusName || getStatusText(record.status) }}
                    </a-tag>
                </template>

                <template slot="isCreateRebateSlot" slot-scope="text, record">
                    <a-tag :color="record.isCreateRebate === 1 ? 'green' : 'orange'">
                        {{ record.isCreateRebateName || (record.isCreateRebate === 1 ? '是' : '否') }}
                    </a-tag>
                </template>

                <template slot="amountSlot" slot-scope="text, record">
                    <span style="color: #f5222d; font-weight: 500;">
                        ¥{{ parseFloat(record.amount || 0).toFixed(2) }}
                    </span>
                </template>

                <template slot="performanceAmountSlot" slot-scope="text, record">
                    <span style="color: #52c41a; font-weight: 500;">
                        ¥{{ parseFloat(record.performanceAmount || 0).toFixed(2) }}
                    </span>
                </template>

                <span slot="action" slot-scope="text, record">
                    <a @click="handleDetail(record)">详情</a>
                    <a-divider type="vertical" />
                    <a @click="handleTaskDetail(record)">
                        <a-icon type="file-text" /> 任务明细
                    </a>
                </span>
            </a-table>
        </div>

        <!-- 任务明细弹窗组件 -->
        <TaskDetailModal ref="taskDetailModal" />
    </a-card>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import TaskDetailModal from './components/TaskDetailModal.vue'

export default {
    name: 'MediaRebateDyDuizhang',
    mixins: [mixinDevice, JeecgListMixin],
    components: {
        TaskDetailModal,
    },
    data() {
        return {
            description: '抖音返点核算流水查询页面',
            // disableMixinCreated: true, // 禁用mixin的自动created调用
            // 表单查询参数
            queryParam: {
                channelName: null,
                status: null,
                agentName: null,
                year: null,
                monthQuarter: null,
                isCreateRebate: null,
            },
            superFieldList: [],
            // 查询条件
            toggleSearchStatus: false,
            // 表单提交参数 - 放在最后确保不被覆盖
            url: {

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
                    title: '返点核算信息编号',
                    align: 'center',
                    dataIndex: 'rebateAccountingInfoSerial',
                    width: 150,
                },
                {
                    title: '审批状态',
                    align: 'center',
                    dataIndex: 'status',
                    width: 100,
                    scopedSlots: { customRender: 'statusSlot' },
                },
                {
                    title: '是否已创建返点',
                    align: 'center',
                    dataIndex: 'isCreateRebate',
                    width: 120,
                    scopedSlots: { customRender: 'isCreateRebateSlot' },
                },
                {
                    title: '返点流水编号',
                    align: 'center',
                    dataIndex: 'rebateBalanceSerial',
                    width: 150,
                },
                {
                    title: '使用类型',
                    align: 'center',
                    dataIndex: 'useTypeNames',
                    width: 120,
                },
                {
                    title: '代理商',
                    align: 'center',
                    dataIndex: 'agentName',
                    width: 120,
                },
                {
                    title: '结算年份',
                    align: 'center',
                    dataIndex: 'year',
                    width: 80,
                },
                {
                    title: '结算季度/月',
                    align: 'center',
                    dataIndex: 'monthQuarterName',
                    width: 100,
                },
                {
                    title: '返点金额',
                    align: 'center',
                    dataIndex: 'amount',
                    width: 120,
                    scopedSlots: { customRender: 'amountSlot' },
                },
                {
                    title: '业绩基数',
                    align: 'center',
                    dataIndex: 'performanceAmount',
                    width: 120,
                    scopedSlots: { customRender: 'performanceAmountSlot' },
                },
                {
                    title: '返点结算类型',
                    align: 'center',
                    dataIndex: 'typeName',
                    width: 120,
                },
                {
                    title: '合同编号',
                    align: 'center',
                    dataIndex: 'contractSerial',
                    width: 120,
                },
                {
                    title: '媒体签约主体',
                    align: 'center',
                    dataIndex: 'contractSubjectName',
                    width: 120,
                },
                {
                    title: '媒体创建时间',
                    align: 'center',
                    dataIndex: 'mediaCreateTime',
                    width: 120,
                },
                {
                    title: '当前审批节点',
                    align: 'center',
                    dataIndex: 'currentApprovalStatusName',
                    width: 150,
                },
                // {
                //     title: '操作',
                //     align: 'center',
                //     dataIndex: 'action',
                //     width: 80,
                //     fixed: 'right',
                //     scopedSlots: { customRender: 'action' },
                // },
            ]
        },
    },
    created() {
        // this.getSuperFieldList()
        this.loadData() // 手动调用loadData
    },
    methods: {
        getStatusColor(status) {
            const colorMap = {
                '1': 'blue',        // 待审批 - 蓝色
                '2': 'orange',      // 审批中 - 橙色
                '3': 'green',       // 审批完成 - 绿色
                '4': 'red',         // 审批拒绝 - 红色
            }
            return colorMap[status] || 'default'
        },
        getStatusText(status) {
            const textMap = {
                '1': '待审批',
                '2': '审批中',
                '3': '审批完成',
                '4': '审批拒绝',
            }
            return textMap[status] || '未知'
        },
        searchReset() {
            this.queryParam = {
                channelName: null,
                status: null,
                agentName: null,
                year: null,
                monthQuarter: null,
                isCreateRebate: null,
            }
            this.ipagination.current = 1
            this.loadData()
        },
        handleToggleSearch() {
            this.toggleSearchStatus = !this.toggleSearchStatus
            this.$nextTick(() => {
                this.$refs.table.layout()
            })
        },
        handleDetail(record) {
            // 这里可以跳转到详情页面或打开详情弹窗
            this.$message.info('查看详情功能待实现')
        },
        handleTaskDetail(record) {
            this.$refs.taskDetailModal.show(record)
        },
        searchQuery() {
            this.ipagination.current = 1
            this.loadData()
        },
        handleTableChange(pagination, filters, sorter) {
            this.ipagination = pagination
            this.loadData()
        },
        getSuperFieldList() {
            // 设置高级查询字段
            this.superFieldList = [
                { type: 'string', value: 'channelName', text: '渠道名称', dictCode: '' },
                { type: 'select', value: 'status', text: '审批状态', dictCode: 'approval_status' },
                { type: 'string', value: 'agentName', text: '代理商', dictCode: '' },
                { type: 'number', value: 'year', text: '结算年份', dictCode: '' },
                { type: 'select', value: 'monthQuarter', text: '结算季度/月', dictCode: 'month_quarter' },
                { type: 'select', value: 'isCreateRebate', text: '是否已创建返点', dictCode: 'yes_no' },
            ]
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

@media screen and (max-width: 768px) {
    .table-page-search-wrapper {
        padding: 16px;
    }

    .ant-table-wrapper {
        padding: 16px;
    }

    .table-operator {
        flex-direction: column;
        align-items: stretch;
    }

    .table-operator .ant-btn {
        width: 100%;
        margin-bottom: 8px;
    }
}
</style>
