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
                        <a-form-item label="开票状态">
                            <a-select placeholder="请选择开票状态" v-model="queryParam.invoiceStatus">
                                <a-select-option value="">全部</a-select-option>
                                <a-select-option value="1">未开票</a-select-option>
                                <a-select-option value="2">已开票</a-select-option>
                                <a-select-option value="3">部分开票</a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                </a-row>
                <a-row :gutter="24" v-show="toggleSearchStatus">
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="盖章状态">
                            <a-select placeholder="请选择盖章状态" v-model="queryParam.stampStatus">
                                <a-select-option value="">全部</a-select-option>
                                <a-select-option value="1">未盖章</a-select-option>
                                <a-select-option value="2">已盖章</a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="回收状态">
                            <a-select placeholder="请选择回收状态" v-model="queryParam.archiveStatus">
                                <a-select-option value="">全部</a-select-option>
                                <a-select-option value="1">未回收</a-select-option>
                                <a-select-option value="2">已回收</a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                </a-row>
            </a-form>
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

                <template slot="amountSlot" slot-scope="text, record">
                    <span style="color: #f5222d; font-weight: 500;">
                        ¥{{ parseFloat(record.amount || 0).toFixed(2) }}
                    </span>
                </template>

                <template slot="usedAmountSlot" slot-scope="text, record">
                    <span style="color: #1890ff; font-weight: 500;">
                        ¥{{ parseFloat(record.usedAmount || 0).toFixed(2) }}
                    </span>
                </template>

                <template slot="frozenAmountSlot" slot-scope="text, record">
                    <span style="color: #faad14; font-weight: 500;">
                        ¥{{ parseFloat(record.frozenAmount || 0).toFixed(2) }}
                    </span>
                </template>

                <template slot="invoiceStatusSlot" slot-scope="text, record">
                    <a-tag :color="getInvoiceStatusColor(record.invoiceStatus)">
                        {{ record.invoiceStatusName || getInvoiceStatusText(record.invoiceStatus) }}
                    </a-tag>
                </template>

                <template slot="invoiceAmountSlot" slot-scope="text, record">
                    <span style="color: #52c41a; font-weight: 500;">
                        ¥{{ parseFloat(record.invoiceAmount || 0).toFixed(2) }}
                    </span>
                </template>

                <template slot="invoiceFrozenAmountSlot" slot-scope="text, record">
                    <span style="color: #faad14; font-weight: 500;">
                        ¥{{ parseFloat(record.invoiceFrozenAmount || 0).toFixed(2) }}
                    </span>
                </template>

                <template slot="invoiceAmountRemainSlot" slot-scope="text, record">
                    <span style="color: #1890ff; font-weight: 500;">
                        ¥{{ parseFloat(record.invoiceAmountRemain || 0).toFixed(2) }}
                    </span>
                </template>

                <template slot="stampStatusSlot" slot-scope="text, record">
                    <a-tag :color="getStampStatusColor(record.stampStatus)">
                        {{ record.stampStatusName || getStampStatusText(record.stampStatus) }}
                    </a-tag>
                </template>

                <template slot="archiveStatusSlot" slot-scope="text, record">
                    <a-tag :color="getArchiveStatusColor(record.archiveStatus)">
                        {{ record.archiveStatusName || getArchiveStatusText(record.archiveStatus) }}
                    </a-tag>
                </template>

                <template slot="standardSlot" slot-scope="text, record">
                    <a-tag :color="record.standard === 1 ? 'green' : 'orange'">
                        {{ record.standardName || (record.standard === 1 ? '是' : '否') }}
                    </a-tag>
                </template>

                <span slot="action" slot-scope="text, record">
                    <a @click="handleDetail(record)">详情</a>
                </span>
            </a-table>
        </div>


        <!-- <a-tab-pane key="detail" tab="明细记录">
                <div class="table-page-search-wrapper">
                    <a-form layout="inline" @keyup.enter.native="searchDetailQuery">
                        <a-row :gutter="24">
                            <a-col :xl="6" :lg="7" :md="8" :sm="24">
                                <a-form-item label="渠道名称">
                                    <a-input placeholder="请输入渠道名称" v-model="detailQueryParam.channelName"></a-input>
                                </a-form-item>
                            </a-col>
                            <a-col :xl="6" :lg="7" :md="8" :sm="24">
                                <a-form-item label="代理商名称">
                                    <a-input placeholder="请输入代理商名称" v-model="detailQueryParam.agentName"></a-input>
                                </a-form-item>
                            </a-col>
                            <a-col :xl="6" :lg="7" :md="8" :sm="24">
                                <a-form-item label="查询文件类型">
                                    <a-select placeholder="请选择查询文件类型" v-model="detailQueryParam.queryType">
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
                                <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
                                    <a-button type="primary" @click="searchDetailQuery" icon="search">查询</a-button>
                                    <a-button type="primary" @click="searchDetailReset" icon="reload"
                                        style="margin-left: 8px">重置</a-button>
                                </span>
                            </a-col>
                        </a-row>
                    </a-form>
                </div>

                <div class="table-operator">
                    <a-button type="primary" icon="download" @click="handleDetailExportXls('明细记录')">导出</a-button>
                </div>

                <div>
                    <a-table ref="detailTable" size="middle" :scroll="{ x: true }" bordered rowKey="id"
                        :columns="detailColumns" :dataSource="detailDataSource" :pagination="detailIpagination"
                        :loading="detailLoading" class="j-table-force-nowrap" @change="handleDetailTableChange">

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
                            <a @click="handlePerformanceDetail(record)" v-if="record.queryType.includes('performance')">
                                <a-icon type="bar-chart" /> 业绩明细
                            </a>
                            <a-divider type="vertical" v-if="record.queryType.includes('performance')" />
                            <a @click="handleCalcDetail(record)" v-if="record.queryType.includes('rebate')">
                                <a-icon type="calculator" /> 核算明细
                            </a>
                            <a-divider type="vertical" v-if="record.queryType.includes('rebate')" />
                            <a @click="handleViolationDetail(record)" v-if="record.queryType.includes('punish')">
                                <a-icon type="exclamation-circle" /> 违规明细
                            </a>
                        </span>
                    </a-table>
                </div>
            </a-tab-pane> -->

        <!-- 子表弹窗组件 -->
        <PerformanceDetailModal ref="performanceDetailModal" />
        <CalcDetailModal ref="calcDetailModal" />
        <ViolationDetailModal ref="violationDetailModal" />
    </a-card>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import PerformanceDetailModal from './components/PerformanceDetailModal.vue'
import CalcDetailModal from './components/CalcDetailModal.vue'
import ViolationDetailModal from './components/ViolationDetailModal.vue'

export default {
    name: 'MediaRebateDyFandian',
    mixins: [JeecgListMixin, mixinDevice],
    components: {
        PerformanceDetailModal,
        CalcDetailModal,
        ViolationDetailModal,
    },
    data() {
        return {
            description: '抖音返点流水查询页面',
            disableMixinCreated: true, // 禁用mixin的自动created调用
            activeTab: 'rebate', // 当前激活的tab
            // 表单查询参数
            queryParam: {
                channelName: null,
                status: null,
                agentName: null,
                year: null,
                monthQuarter: null,
                invoiceStatus: null,
                stampStatus: null,
                archiveStatus: null,
            },
            // 表单提交参数
            url: {
                list: '/douyinRebateFlow/list',
                exportXlsUrl: '/douyinRebateFlow/exportXls',
            },
            superFieldList: [],
            // 查询条件
            toggleSearchStatus: false,
            // 明细记录查询参数
            detailQueryParam: {
                channelName: null,
                agentName: null,
                queryType: null,
            },
            // 明细记录数据源
            detailDataSource: [],
            // 明细记录分页参数
            detailIpagination: {
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
            // 明细记录加载状态
            detailLoading: false,
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
                    title: '返点流水编号',
                    align: 'center',
                    dataIndex: 'rebateBalanceSerial',
                    width: 150,
                },
                {
                    title: '返点状态',
                    align: 'center',
                    dataIndex: 'status',
                    width: 100,
                    scopedSlots: { customRender: 'statusSlot' },
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
                    title: '合同编号',
                    align: 'center',
                    dataIndex: 'contractSerial',
                    width: 120,
                },
                {
                    title: '合同名称',
                    align: 'center',
                    dataIndex: 'contractName',
                    width: 150,
                },
                {
                    title: '媒体签约主体',
                    align: 'center',
                    dataIndex: 'contractSubjectName',
                    width: 120,
                },
                {
                    title: '返点总金额',
                    align: 'center',
                    dataIndex: 'amount',
                    width: 120,
                    scopedSlots: { customRender: 'amountSlot' },
                },
                {
                    title: '已使用金额',
                    align: 'center',
                    dataIndex: 'usedAmount',
                    width: 120,
                    scopedSlots: { customRender: 'usedAmountSlot' },
                },
                {
                    title: '冻结金额',
                    align: 'center',
                    dataIndex: 'frozenAmount',
                    width: 120,
                    scopedSlots: { customRender: 'frozenAmountSlot' },
                },
                {
                    title: '媒体创建时间',
                    align: 'center',
                    dataIndex: 'mediaCreateTime',
                    width: 120,
                },
                {
                    title: '开票状态',
                    align: 'center',
                    dataIndex: 'invoiceStatus',
                    width: 100,
                    scopedSlots: { customRender: 'invoiceStatusSlot' },
                },
                {
                    title: '实际开票金额',
                    align: 'center',
                    dataIndex: 'invoiceAmount',
                    width: 120,
                    scopedSlots: { customRender: 'invoiceAmountSlot' },
                },
                {
                    title: '已申请开票金额',
                    align: 'center',
                    dataIndex: 'invoiceFrozenAmount',
                    width: 120,
                    scopedSlots: { customRender: 'invoiceFrozenAmountSlot' },
                },
                {
                    title: '可开票金额',
                    align: 'center',
                    dataIndex: 'invoiceAmountRemain',
                    width: 120,
                    scopedSlots: { customRender: 'invoiceAmountRemainSlot' },
                },
                {
                    title: '盖章状态',
                    align: 'center',
                    dataIndex: 'stampStatus',
                    width: 100,
                    scopedSlots: { customRender: 'stampStatusSlot' },
                },
                {
                    title: '回收状态',
                    align: 'center',
                    dataIndex: 'archiveStatus',
                    width: 100,
                    scopedSlots: { customRender: 'archiveStatusSlot' },
                },
                {
                    title: '是否标准',
                    align: 'center',
                    dataIndex: 'standard',
                    width: 100,
                    scopedSlots: { customRender: 'standardSlot' },
                },
                {
                    title: '签章类型',
                    align: 'center',
                    dataIndex: 'isOnlineStamp',
                    width: 100,
                },
                {
                    title: '平台/业务线',
                    align: 'center',
                    dataIndex: 'platformName',
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
        detailColumns() {
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
                    width: 200,
                    fixed: 'right',
                    scopedSlots: { customRender: 'action' },
                },
            ]
        },
    },
    created() {
        this.getSuperFieldList()
        this.loadData() // 手动调用loadData
    },
    methods: {
        getStatusColor(status) {
            const colorMap = {
                '1': 'blue',        // 待审批
                '2': 'orange',      // 审批中
                '3': 'green',       // 审批完成
                '4': 'red',         // 审批拒绝
            }
            return colorMap[status] || 'blue'
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
        getInvoiceStatusColor(status) {
            const colorMap = {
                '1': 'orange',      // 未开票
                '2': 'green',       // 已开票
                '3': 'blue',        // 部分开票
            }
            return colorMap[status] || 'orange'
        },
        getInvoiceStatusText(status) {
            const textMap = {
                '1': '未开票',
                '2': '已开票',
                '3': '部分开票',
            }
            return textMap[status] || '未知'
        },
        getStampStatusColor(status) {
            const colorMap = {
                '1': 'orange',      // 未盖章
                '2': 'green',       // 已盖章
            }
            return colorMap[status] || 'orange'
        },
        getStampStatusText(status) {
            const textMap = {
                '1': '未盖章',
                '2': '已盖章',
            }
            return textMap[status] || '未知'
        },
        getArchiveStatusColor(status) {
            const colorMap = {
                '1': 'orange',      // 未回收
                '2': 'green',       // 已回收
            }
            return colorMap[status] || 'orange'
        },
        getArchiveStatusText(status) {
            const textMap = {
                '1': '未回收',
                '2': '已回收',
            }
            return textMap[status] || '未知'
        },
        searchQuery() {
            this.ipagination.current = 1
            this.loadData()
        },
        searchReset() {
            this.queryParam = {
                channelName: null,
                status: null,
                agentName: null,
                year: null,
                monthQuarter: null,
                invoiceStatus: null,
                stampStatus: null,
                archiveStatus: null,
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
        handlePerformanceDetail(record) {
            this.$refs.performanceDetailModal.show(record)
        },
        handleCalcDetail(record) {
            this.$refs.calcDetailModal.show(record)
        },
        handleViolationDetail(record) {
            this.$refs.violationDetailModal.show(record)
        },
        // Tab切换处理
        handleTabChange(activeKey) {
            this.activeTab = activeKey
            if (activeKey === 'detail') {
                this.loadDetailData()
            }
        },
        // 明细记录查询
        searchDetailQuery() {
            this.detailIpagination.current = 1
            this.loadDetailData()
        },
        // 明细记录重置
        searchDetailReset() {
            this.detailQueryParam = {
                channelName: null,
                agentName: null,
                queryType: null,
            }
            this.detailIpagination.current = 1
            this.loadDetailData()
        },
        // 明细记录导出
        handleDetailExportXls(fileName) {
            const params = {
                ...this.detailQueryParam,
                ...this.detailIpagination,
            }
            this.$exportXls('/douyinRebateTask/exportXls', params, fileName)
        },
        // 明细记录表格变化
        handleDetailTableChange(pagination, filters, sorter) {
            this.detailIpagination = pagination
            this.loadDetailData()
        },
        // 加载明细记录数据
        loadDetailData() {
            this.detailLoading = true
            // 这里调用实际的API接口
            // this.$api.douyinRebateTask.list(Object.assign(this.detailQueryParam, this.detailIpagination)).then(
            //   (res) => {
            //     this.detailDataSource = res.result.records
            //     this.detailIpagination.total = res.result.total
            //   }
            // ).catch(() => {
            //     this.detailLoading = false
            // }).finally(() => {
            //     this.detailLoading = false
            //   })

            // 模拟数据，实际使用时请替换为真实API调用
            setTimeout(() => {
                this.detailDataSource = []
                this.detailIpagination.total = 0
                this.detailLoading = false
            }, 1000)
        },
        // 任务状态颜色
        getTaskStateColor(state) {
            const colorMap = {
                '1': 'green',      // 成功
                '2': 'red',        // 失败
            }
            return colorMap[state] || 'green'
        },
        // 任务状态文本
        getTaskStateText(state) {
            const textMap = {
                '1': '成功',
                '2': '失败',
            }
            return textMap[state] || '未知'
        },
        // 查询状态颜色
        getQueryStatusColor(status) {
            const colorMap = {
                '1': 'blue',       // 初始化
                '2': 'orange',     // 运行中
                '3': 'green',      // 成功
                '4': 'red',        // 失败
            }
            return colorMap[status] || 'blue'
        },
        // 查询状态文本
        getQueryStatusText(status) {
            const textMap = {
                '1': '初始化',
                '2': '运行中',
                '3': '成功',
                '4': '失败',
            }
            return textMap[status] || '未知'
        },
        // 查询类型文本
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
        handleExportXls(fileName) {
            const params = {
                ...this.queryParam,
                ...this.ipagination,
            }
            this.$exportXls(this.url.exportXlsUrl, params, fileName)
        },
        handleSuperQuery(item) {
            this.queryParam[item.field] = item.value
            this.searchQuery()
        },
        handleTableChange(pagination, filters, sorter) {
            this.ipagination = pagination
            this.loadData()
        },
        getSuperFieldList() {
            // 这里可以调用API获取高级查询字段列表
            // this.$api.douyinRebateFlow.superFieldList().then((res) => {
            //   this.superFieldList = res.result
            // })

            // 模拟数据，实际使用时请替换为真实API调用
            this.superFieldList = [
                { type: 'string', value: 'channelName', text: '渠道名称', dictCode: '' },
                { type: 'select', value: 'status', text: '返点状态', dictCode: 'rebate_status' },
                { type: 'string', value: 'agentName', text: '代理商', dictCode: '' },
                { type: 'number', value: 'year', text: '结算年份', dictCode: '' },
                { type: 'select', value: 'monthQuarter', text: '结算季度/月', dictCode: 'month_quarter' },
                { type: 'select', value: 'invoiceStatus', text: '开票状态', dictCode: 'invoice_status' },
                { type: 'select', value: 'stampStatus', text: '盖章状态', dictCode: 'stamp_status' },
                { type: 'select', value: 'archiveStatus', text: '回收状态', dictCode: 'archive_status' },
                { type: 'string', value: 'contractSerial', text: '合同编号', dictCode: '' },
                { type: 'string', value: 'contractName', text: '合同名称', dictCode: '' },
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
