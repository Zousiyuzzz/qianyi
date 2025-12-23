<template>
    <a-card :bordered="false">
        <!-- 查询区域 -->
        <div class="table-page-search-wrapper">
            <a-form layout="inline" @keyup.enter.native="searchQuery">
                <div class="search-row-flex" style="display: flex;flex-direction: column;">
                    <div style="display: flex;flex-direction: row;justify-content: left;width: 100%;">
                        <a-form layout="inline" @keyup.enter.native="searchQuery">
                            <a-row :gutter="24">
                                <a-col :xl="6" :lg="7" :md="8" :sm="24" style="width: 320px;">
                                    <a-form-item label="渠道名称">
                                        <a-input placeholder="请输入渠道名称" v-model="queryParam.channelName"></a-input>
                                    </a-form-item>
                                </a-col>
                                <a-col :xl="6" :lg="7" :md="8" :sm="24" style="width: 320px;">
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

                                <a-col :xl="6" :lg="7" :md="8" :sm="24" style="width: 320px;">
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
                                <a-col :xl="6" :lg="7" :md="8" :sm="24" style="width: 320px;">
                                    <a-form-item label="代理商">
                                        <a-input placeholder="请输入代理商名称" v-model="queryParam.agentName"></a-input>
                                    </a-form-item>
                                </a-col>
                                <a-col :xl="6" :lg="7" :md="8" :sm="24" style="width: 320px;">
                                    <a-form-item label="结算年份">
                                        <a-select placeholder="请选择结算年份" v-model="queryParam.year">
                                            <a-select-option value="">全部</a-select-option>
                                            <a-select-option value="2024">2024年</a-select-option>
                                            <a-select-option value="2023">2023年</a-select-option>
                                            <a-select-option value="2022">2022年</a-select-option>
                                        </a-select>
                                    </a-form-item>
                                </a-col>
                                <a-col :xl="6" :lg="7" :md="8" :sm="24" style="width: 320px;">
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
                                <a-col :xl="6" :lg="7" :md="8" :sm="24" style="width: 320px;">
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
                </div>
            </a-form>
        </div>

        <div class="table-operator">
        </div>
        <div>
            <!-- <a-table ref="table" size="middle" :scroll="{ x: true }" bordered rowKey="id" :columns="columns"
                :dataSource="dataSource" :pagination="ipagination" :loading="loading"
                :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
                class="j-table-force-nowrap" @change="handleTableChange">

                <template slot="htmlSlot" slot-scope="text">
                    <div v-html="text"></div>
                </template>
<template slot="imgSlot" slot-scope="text,record">
                    <span v-if="!text" style="font-size: 12px;font-style: italic;">无图片</span>
                    <img v-else :src="getImgView(text)" :preview="record.id" height="25px" alt=""
                        style="max-width:80px;font-size: 12px;font-style: italic;" />
                </template>
<template slot="fileSlot" slot-scope="text">
                    <span v-if="!text" style="font-size: 12px;font-style: italic;">无文件</span>
                    <a-button v-else :ghost="true" type="primary" icon="download" size="small"
                        @click="downloadFile(text)">
                        下载
                    </a-button>
                </template>


<span slot="action" slot-scope="text, record">
    <a-popconfirm title="确定同意吗?" v-if="record.state === '2'" @confirm="() => handleAgree(record.id)">
        <a>同意</a>
    </a-popconfirm>
    <a-divider type="vertical" />
    <a-popconfirm title="确定驳回吗?" v-if="record.state === '2'" @confirm="() => handleReject(record.id)">
        <a>驳回</a>
    </a-popconfirm>
    <a-divider type="vertical" />
    <a @click="handleEditTime(record)">修改时间</a>
</span>
</a-table>
-->

            <a-table ref="table" size="middle" :scroll="{ x: true }" bordered rowKey="id" :columns="columns"
                :dataSource="dataSource" :pagination="ipagination" :loading="loading" class="j-table-force-nowrap"
                @change="handleTableChange"
                :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }">

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


            </a-table>
        </div>
    </a-card>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { postAction } from '@/api/manage'

export default {
    name: 'TabFundTransferRecordList',
    mixins: [JeecgListMixin, mixinDevice],

    data() {
        return {
            description: '充转退记录表管理页面',
            // 表头
            columns: [
                {
                    title: '渠道名称',
                    align: 'center',
                    dataIndex: 'channelName',
                    width: 120,
                },
                {
                    title: '返点核算编号',
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
                //     dataIndex: 'action',
                //     align: 'center',
                //     fixed: 'right',
                //     width: 200,
                //     scopedSlots: { customRender: 'action' },
                // },
            ],
            url: {
                list: '/douyinRebateAccountingFlow/list',
                delete: "/douyinRebateAccountingFlow/delete",
                deleteBatch: "/douyinRebateAccountingFlow/deleteBatch",
                exportXlsUrl: "/douyinRebateAccountingFlow/exportXls",
                importExcelUrl: "douyinRebateAccountingFlow/importExcel",

            },
            dictOptions: {},
            superFieldList: [],
            createTime: [],
            editTimeVisible: false,
            editTimeLoading: false,
            editTimeForm: {
                id: '',
                createTime: ''
            },
            editTimeRules: {
                createTime: [{ required: true, message: '请选择交易时间', trigger: 'change' }]
            }
        }
    },
    created() {
        this.getSuperFieldList();
    },
    computed: {
        importExcelUrl: function () {
            return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
        },
    },
    watch: {
        createTime(newVal) {
            this.queryParam.createTimeJoint = newVal.join(',')
        }
    },
    methods: {
        initDictConfig() {
        },
        resetQuery() {
            this.queryParam = {};
            this.searchQuery();
        },
        // 获取审批状态颜色
        getStatusColor(status) {
            const colorMap = {
                '1': 'orange',    // 待审批
                '2': 'blue',      // 审批中
                '3': 'green',     // 审批完成
                '4': 'red',       // 审批拒绝
            };
            return colorMap[status] || 'default';
        },
        // 获取审批状态文本
        getStatusText(status) {
            const textMap = {
                '1': '待审批',
                '2': '审批中',
                '3': '审批完成',
                '4': '审批拒绝',
            };
            return textMap[status] || '未知';
        },
        getSuperFieldList() {
            let fieldList = [];
            fieldList.push({ type: 'string', value: 'delFlag', text: '删除标识（0：未删除1：已删除）', dictCode: '' })
            fieldList.push({ type: 'string', value: 'channelName', text: '渠道名称', dictCode: '' })
            fieldList.push({ type: 'string', value: 'channelPlatform', text: '平台标识', dictCode: '' })
            fieldList.push({ type: 'string', value: 'channelSign', text: '渠道标识', dictCode: '' })
            fieldList.push({ type: 'string', value: 'proId', text: '项目ID', dictCode: '' })
            fieldList.push({ type: 'string', value: 'proName', text: '项目名称', dictCode: '' })
            fieldList.push({ type: 'string', value: 'agentId', text: '代理商id', dictCode: '' })
            fieldList.push({ type: 'string', value: 'agentName', text: '代理商名称', dictCode: '' })
            fieldList.push({ type: 'string', value: 'targetAdvertiserId', text: '转入方账户Id', dictCode: '' })
            fieldList.push({ type: 'string', value: 'targetAdvertiserName', text: '转入方账户名称', dictCode: '' })
            fieldList.push({ type: 'string', value: 'sourceAdvertiserId', text: '转出方账户Id', dictCode: '' })
            fieldList.push({ type: 'string', value: 'sourceAdvertiserName', text: '转出方账户名称', dictCode: '' })
            fieldList.push({ type: 'string', value: 'fundsNature', text: '资金性质（1：对公2：对私）', dictCode: '' })
            fieldList.push({ type: 'string', value: 'tradeType', text: '交易类型（1：充值2：转账3：退款）', dictCode: '' })
            fieldList.push({ type: 'string', value: 'rebateForm', text: '返点形式:1：返货2：返现)', dictCode: '' })
            fieldList.push({ type: 'BigDecimal', value: 'rebateNum', text: '返点数', dictCode: '' })
            fieldList.push({ type: 'string', value: 'mediaSerialNumber', text: '媒体流水号', dictCode: '' })
            fieldList.push({ type: 'string', value: 'state', text: '状态(1:成功2:处理中3:失败4:已取消)', dictCode: '' })
            fieldList.push({ type: 'string', value: 'batchNumber', text: '批次号', dictCode: '' })
            fieldList.push({ type: 'string', value: 'recordSource', text: '记录来源(1:微信API 2:web客户端3：H5工作台4：微信小程序)', dictCode: '' })
            fieldList.push({ type: 'BigDecimal', value: 'amount', text: '交易金额', dictCode: '' })
            fieldList.push({ type: 'BigDecimal', value: 'changeMoney', text: '变动金额', dictCode: '' })
            fieldList.push({ type: 'BigDecimal', value: 'publicBalance', text: '对公余额', dictCode: '' })
            fieldList.push({ type: 'BigDecimal', value: 'privateBalance', text: '对私余额', dictCode: '' })
            fieldList.push({ type: 'string', value: 'transferType', text: '转账类型(1:现金,2:信用,3:框返,4:激励,6:现金+信用,CREDIT_BIDDING:授信竞价,CREDIT_BRAND:授信品牌,CREDIT_GENERAL:授信通用,PREPAY_BIDDING:预付竞价,PREPAY_BRAND:预付品牌,PREPAY_GENERAL:预付通用)', dictCode: '' })
            fieldList.push({ type: 'string', value: 'remarks', text: '备注', dictCode: '' })
            fieldList.push({ type: 'string', value: 'errMsg', text: '失败原因', dictCode: '' })
            this.superFieldList = fieldList
        },
    }
}
</script>
<style scoped>
@import '~@assets/less/common.less';

.search-row-flex {
    display: flex;
    align-items: center;
}

.search-item {
    margin-right: 10px;
}

.search-item:last-child {
    margin-right: 0;
}
</style>