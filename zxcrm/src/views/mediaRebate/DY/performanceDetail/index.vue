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
                                    <a-form-item label="广告主名称">
                                        <a-input placeholder="请输入广告主名称" v-model="queryParam.advertiserName"></a-input>
                                    </a-form-item>
                                </a-col>
                                <a-col :xl="6" :lg="7" :md="8" :sm="24" style="width: 320px;">
                                    <a-form-item label="客户名称">
                                        <a-input placeholder="请输入客户名称" v-model="queryParam.customerName"></a-input>
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
                                    <a-form-item label="项目名称">
                                        <a-input placeholder="请输入项目名称" v-model="queryParam.projectName"></a-input>
                                    </a-form-item>
                                </a-col>
                                <a-col :xl="6" :lg="7" :md="8" :sm="24" style="width: 320px;">
                                    <a-form-item label="渠道名称">
                                        <a-input placeholder="请输入渠道名称" v-model="queryParam.channelName"></a-input>
                                    </a-form-item>
                                </a-col>
                                <a-col :xl="6" :lg="7" :md="8" :sm="24" style="width: 320px;">
                                    <a-form-item label="代理商公司">
                                        <a-input placeholder="请输入代理商公司名称"
                                            v-model="queryParam.agentCompanyName"></a-input>
                                    </a-form-item>
                                </a-col>
                                <a-col :xl="6" :lg="7" :md="8" :sm="24" style="width: 320px;">
                                    <a-form-item label="核算年度">
                                        <a-select placeholder="请选择核算年度" v-model="queryParam.rebateCalcAttributionYear">
                                            <a-select-option value="">全部</a-select-option>
                                            <a-select-option value="2025">2025年</a-select-option>
                                            <a-select-option value="2024">2024年</a-select-option>
                                            <a-select-option value="2023">2023年</a-select-option>
                                            <a-select-option value="2022">2022年</a-select-option>
                                        </a-select>
                                    </a-form-item>
                                </a-col>
                                <a-col :xl="6" :lg="7" :md="8" :sm="24" style="width: 320px;">
                                    <a-form-item label="核算季度">
                                        <a-select placeholder="请选择核算季度"
                                            v-model="queryParam.rebateCalcAttributionQuarter">
                                            <a-select-option value="">全部</a-select-option>
                                            <a-select-option value="Q1">Q1</a-select-option>
                                            <a-select-option value="Q2">Q2</a-select-option>
                                            <a-select-option value="Q3">Q3</a-select-option>
                                            <a-select-option value="Q4">Q4</a-select-option>
                                        </a-select>
                                    </a-form-item>
                                </a-col>
                                <a-col :xl="6" :lg="7" :md="8" :sm="24" style="width: 320px;">
                                    <a-form-item label="核算月度">
                                        <a-select placeholder="请选择核算月度" v-model="queryParam.rebateCalcAttributionMonth">
                                            <a-select-option value="">全部</a-select-option>
                                            <a-select-option value="01">1月</a-select-option>
                                            <a-select-option value="02">2月</a-select-option>
                                            <a-select-option value="03">3月</a-select-option>
                                            <a-select-option value="04">4月</a-select-option>
                                            <a-select-option value="05">5月</a-select-option>
                                            <a-select-option value="06">6月</a-select-option>
                                            <a-select-option value="07">7月</a-select-option>
                                            <a-select-option value="08">8月</a-select-option>
                                            <a-select-option value="09">9月</a-select-option>
                                            <a-select-option value="10">10月</a-select-option>
                                            <a-select-option value="11">11月</a-select-option>
                                            <a-select-option value="12">12月</a-select-option>
                                        </a-select>
                                    </a-form-item>
                                </a-col>
                                <a-col :xl="6" :lg="7" :md="8" :sm="24" style="width: 320px;">
                                    <a-form-item label="合同编号">
                                        <a-input placeholder="请输入合同编号" v-model="queryParam.contractSerial"></a-input>
                                    </a-form-item>
                                </a-col>
                                <a-col :xl="6" :lg="7" :md="8" :sm="24" style="width: 320px;">
                                    <a-form-item label="排期名称">
                                        <a-input placeholder="请输入排期名称" v-model="queryParam.cartName"></a-input>
                                    </a-form-item>
                                </a-col>
                                <a-col :xl="6" :lg="7" :md="8" :sm="24" style="width: 320px;">
                                    <a-form-item label="业务类型">
                                        <a-input placeholder="请输入业务类型" v-model="queryParam.businessType"></a-input>
                                    </a-form-item>
                                </a-col>
                            </a-row>
                        </a-form>
                    </div>
                </div>
            </a-form>
        </div>
        <div>
            <a-table ref="table" size="middle" :scroll="{ x: true }" bordered rowKey="id" :columns="columns"
                :dataSource="dataSource" :pagination="ipagination" :loading="loading" class="j-table-force-nowrap"
                @change="handleTableChange">

                <template slot="performanceCostSlot" slot-scope="text, record">
                    <span style="color: #52c41a; font-weight: 500;">
                        ¥{{ parseFloat(record.performanceCost || 0).toFixed(2) }}
                    </span>
                </template>

                <template slot="creditCostSlot" slot-scope="text, record">
                    <span style="color: #1890ff; font-weight: 500;">
                        ¥{{ parseFloat(record.creditCost || 0).toFixed(2) }}
                    </span>
                </template>

                <template slot="prepayCostSlot" slot-scope="text, record">
                    <span style="color: #faad14; font-weight: 500;">
                        ¥{{ parseFloat(record.prepayCost || 0).toFixed(2) }}
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

export default {
    name: 'DouyinRebatePerformanceDetailList',
    mixins: [JeecgListMixin, mixinDevice],

    data() {
        return {
            description: '抖音返点业绩明细管理页面',
            // 表头
            columns: [
                {
                    title: '广告主ID',
                    align: 'center',
                    dataIndex: 'advertiserId',
                    width: 120,
                },
                {
                    title: '广告主名称',
                    align: 'center',
                    dataIndex: 'advertiserName',
                    width: 150,
                },
                {
                    title: '客户名称',
                    align: 'center',
                    dataIndex: 'customerName',
                    width: 150,
                },
                {
                    title: '项目名称',
                    align: 'center',
                    dataIndex: 'projectName',
                    width: 150,
                },
                {
                    title: '项目编号',
                    align: 'center',
                    dataIndex: 'projectSerial',
                    width: 120,
                },
                {
                    title: '排期名称',
                    align: 'center',
                    dataIndex: 'cartName',
                    width: 150,
                },
                {
                    title: '排期ID',
                    align: 'center',
                    dataIndex: 'cartId',
                    width: 120,
                },
                {
                    title: '渠道名称',
                    align: 'center',
                    dataIndex: 'channelName',
                    width: 120,
                },
                {
                    title: '业绩消耗',
                    align: 'center',
                    dataIndex: 'performanceCost',
                    width: 120,
                    scopedSlots: { customRender: 'performanceCostSlot' },
                },
                {
                    title: '授信消耗',
                    align: 'center',
                    dataIndex: 'creditCost',
                    width: 120,
                    scopedSlots: { customRender: 'creditCostSlot' },
                },
                {
                    title: '预付消耗',
                    align: 'center',
                    dataIndex: 'prepayCost',
                    width: 120,
                    scopedSlots: { customRender: 'prepayCostSlot' },
                },
                {
                    title: '核算年度',
                    align: 'center',
                    dataIndex: 'rebateCalcAttributionYear',
                    width: 100,
                },
                {
                    title: '核算季度',
                    align: 'center',
                    dataIndex: 'rebateCalcAttributionQuarter',
                    width: 100,
                },
                {
                    title: '核算月度',
                    align: 'center',
                    dataIndex: 'rebateCalcAttributionMonth',
                    width: 100,
                },
                {
                    title: '代理商公司',
                    align: 'center',
                    dataIndex: 'agentCompanyName',
                    width: 150,
                },
                {
                    title: '代理商ID',
                    align: 'center',
                    dataIndex: 'agentId',
                    width: 120,
                },
                {
                    title: '合同编号',
                    align: 'center',
                    dataIndex: 'contractSerial',
                    width: 120,
                },
                {
                    title: '我方主体',
                    align: 'center',
                    dataIndex: 'subjectName',
                    width: 150,
                },
                {
                    title: '业务类型',
                    align: 'center',
                    dataIndex: 'businessType',
                    width: 120,
                },
                {
                    title: '投放产品',
                    align: 'center',
                    dataIndex: 'appName',
                    width: 120,
                },
                {
                    title: '广告类型',
                    align: 'center',
                    dataIndex: 'pricingCategory',
                    width: 120,
                },
                {
                    title: '消耗来源',
                    align: 'center',
                    dataIndex: 'costSource',
                    width: 120,
                },
                {
                    title: '招商项目名称',
                    align: 'center',
                    dataIndex: 'merchantsProjectName',
                    width: 150,
                },
                {
                    title: '招商项目编号',
                    align: 'center',
                    dataIndex: 'merchNo',
                    width: 120,
                },
                {
                    title: '招商意向名称',
                    align: 'center',
                    dataIndex: 'intentionName',
                    width: 150,
                },
                {
                    title: '招商意向编号',
                    align: 'center',
                    dataIndex: 'intentionNo',
                    width: 120,
                },
                {
                    title: '平台标识',
                    align: 'center',
                    dataIndex: 'channelPlatform',
                    width: 100,
                },
                {
                    title: '渠道标识',
                    align: 'center',
                    dataIndex: 'channelSign',
                    width: 100,
                },
                {
                    title: '创建时间',
                    align: 'center',
                    dataIndex: 'createTime',
                    width: 150,
                },
            ],
            url: {
                list: '/douyinRebatePerformanceDetail/list',
                delete: "/douyinRebatePerformanceDetail/delete",
                deleteBatch: "/douyinRebatePerformanceDetail/deleteBatch",
                exportXlsUrl: "/douyinRebatePerformanceDetail/exportXls",
                importExcelUrl: "douyinRebatePerformanceDetail/importExcel",

            },
            dictOptions: {},
            superFieldList: [],
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
    methods: {
        initDictConfig() {
        },
        resetQuery() {
            this.queryParam = {};
            this.searchQuery();
        },
        getSuperFieldList() {
            let fieldList = [];
            fieldList.push({ type: 'string', value: 'advertiserId', text: '广告主ID', dictCode: '' })
            fieldList.push({ type: 'string', value: 'advertiserName', text: '广告主名称', dictCode: '' })
            fieldList.push({ type: 'string', value: 'agentCompanyName', text: '代理商公司名称', dictCode: '' })
            fieldList.push({ type: 'string', value: 'agentGroupName', text: '代理商集团名称', dictCode: '' })
            fieldList.push({ type: 'string', value: 'agentGroupType', text: '代理商集团类型', dictCode: '' })
            fieldList.push({ type: 'string', value: 'agentId', text: '代理商ID', dictCode: '' })
            fieldList.push({ type: 'string', value: 'appealFirstIndustryName', text: '(季度)汽车政策一级行业', dictCode: '' })
            fieldList.push({ type: 'string', value: 'appealSecondIndustryName', text: '(季度)汽车政策二级行业', dictCode: '' })
            fieldList.push({ type: 'string', value: 'appName', text: '投放产品名称', dictCode: '' })
            fieldList.push({ type: 'string', value: 'businessType', text: '业务类型名称', dictCode: '' })
            fieldList.push({ type: 'string', value: 'calcOperationTag', text: '(季度)核算运营标签', dictCode: '' })
            fieldList.push({ type: 'string', value: 'cartId', text: '排期ID', dictCode: '' })
            fieldList.push({ type: 'string', value: 'cartName', text: '排期名称', dictCode: '' })
            fieldList.push({ type: 'string', value: 'channelName', text: '渠道名称', dictCode: '' })
            fieldList.push({ type: 'string', value: 'channelPlatform', text: '平台标识', dictCode: '' })
            fieldList.push({ type: 'string', value: 'channelSign', text: '渠道标识', dictCode: '' })
            fieldList.push({ type: 'string', value: 'contractSerial', text: '合同编号', dictCode: '' })
            fieldList.push({ type: 'string', value: 'costSource', text: '消耗来源名称', dictCode: '' })
            fieldList.push({ type: 'number', value: 'creditCost', text: '授信消耗', dictCode: '' })
            fieldList.push({ type: 'string', value: 'customerId', text: '客户ID', dictCode: '' })
            fieldList.push({ type: 'string', value: 'customerName', text: '客户名称', dictCode: '' })
            fieldList.push({ type: 'number', value: 'performanceCost', text: '业绩消耗', dictCode: '' })
            fieldList.push({ type: 'number', value: 'prepayCost', text: '预付消耗', dictCode: '' })
            fieldList.push({ type: 'string', value: 'projectName', text: '项目名称', dictCode: '' })
            fieldList.push({ type: 'string', value: 'projectSerial', text: '项目编号', dictCode: '' })
            fieldList.push({ type: 'string', value: 'rebateCalcAttributionMonth', text: '核算业绩归属月度', dictCode: '' })
            fieldList.push({ type: 'string', value: 'rebateCalcAttributionQuarter', text: '核算业绩归属季度', dictCode: '' })
            fieldList.push({ type: 'string', value: 'rebateCalcAttributionYear', text: '核算业绩归属年度', dictCode: '' })
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
