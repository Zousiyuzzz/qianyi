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
                                    <a-form-item label="代理商公司">
                                        <a-input placeholder="请输入代理商公司名称"
                                            v-model="queryParam.agentCompanyName"></a-input>
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
                                    <a-form-item label="结算年份">
                                        <a-select placeholder="请选择结算年份" v-model="queryParam.rebateCalcAttributionYear">
                                            <a-select-option value="">全部</a-select-option>
                                            <a-select-option :value="2025">2025年</a-select-option>
                                            <a-select-option :value="2024">2024年</a-select-option>
                                            <a-select-option :value="2023">2023年</a-select-option>
                                            <a-select-option :value="2022">2022年</a-select-option>
                                        </a-select>
                                    </a-form-item>
                                </a-col>
                                <a-col :xl="6" :lg="7" :md="8" :sm="24" style="width: 320px;">
                                    <a-form-item label="结算周期">
                                        <a-select placeholder="请选择结算周期"
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
                                    <a-form-item label="代理商集团">
                                        <a-input placeholder="请输入代理商集团名称" v-model="queryParam.agentGroupName"></a-input>
                                    </a-form-item>
                                </a-col>
                                <a-col :xl="6" :lg="7" :md="8" :sm="24" style="width: 320px;">
                                    <a-form-item label="合同编号">
                                        <a-input placeholder="请输入商务协议编号" v-model="queryParam.contractSerial"></a-input>
                                    </a-form-item>
                                </a-col>
                                <a-col :xl="6" :lg="7" :md="8" :sm="24" style="width: 320px;">
                                    <a-form-item label="渠道三级部门">
                                        <a-input placeholder="请输入渠道三级部门"
                                            v-model="queryParam.channelSalesmanDepartment3Name"></a-input>
                                    </a-form-item>
                                </a-col>
                                <a-col :xl="6" :lg="7" :md="8" :sm="24" style="width: 320px;">
                                    <a-form-item label="核算政策类型">
                                        <a-input placeholder="请输入返点核算政策类型"
                                            v-model="queryParam.rebateCalcPolicyType"></a-input>
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

                <template slot="amountSlot" slot-scope="text">
                    <span style="color: #f5222d; font-weight: 500;">
                        ¥{{ parseFloat(text || 0).toFixed(2) }}
                    </span>
                </template>

            </a-table>
        </div>

        <!-- 合计统计 -->
        <div class="table-summary" v-if="dataSource && dataSource.length > 0">
            <a-descriptions bordered size="small" :column="4">
                <a-descriptions-item label="业绩消耗合计">
                    <span style="color: #52c41a; font-weight: 600;">
                        ¥{{ calculateTotal('performanceCost') }}
                    </span>
                </a-descriptions-item>
                <a-descriptions-item label="竞价基础返点合计">
                    <span style="color: #f5222d; font-weight: 600;">
                        ¥{{ calculateTotal('bidBaseReabteAmount') }}
                    </span>
                </a-descriptions-item>
                <a-descriptions-item label="品牌基础返点合计">
                    <span style="color: #f5222d; font-weight: 600;">
                        ¥{{ calculateTotal('quarterBrandBaseRebateAmount') }}
                    </span>
                </a-descriptions-item>
                <a-descriptions-item label="IP返点合计">
                    <span style="color: #f5222d; font-weight: 600;">
                        ¥{{ calculateTotal('ipRebateAmount') }}
                    </span>
                </a-descriptions-item>
            </a-descriptions>
        </div>
    </a-card>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'

export default {
    name: 'DouyinRebateCalcDetailList',
    mixins: [JeecgListMixin, mixinDevice],

    data() {
        return {
            description: '抖音返点核算明细管理页面',
            // 表头
            columns: [
                {
                    title: '渠道名称',
                    align: 'center',
                    dataIndex: 'channelName',
                    width: 120,
                    fixed: 'left',
                },
                {
                    title: '代理商公司',
                    align: 'center',
                    dataIndex: 'agentCompanyName',
                    width: 150,
                },
                {
                    title: '代理商集团',
                    align: 'center',
                    dataIndex: 'agentGroupName',
                    width: 150,
                },
                {
                    title: '结算年份',
                    align: 'center',
                    dataIndex: 'rebateCalcAttributionYear',
                    width: 100,
                },
                {
                    title: '结算周期',
                    align: 'center',
                    dataIndex: 'rebateCalcAttributionQuarter',
                    width: 100,
                },
                {
                    title: '业绩消耗',
                    align: 'center',
                    dataIndex: 'performanceCost',
                    width: 120,
                    scopedSlots: { customRender: 'performanceCostSlot' },
                },
                {
                    title: '竞价基础返点',
                    align: 'center',
                    dataIndex: 'bidBaseReabteAmount',
                    width: 130,
                    scopedSlots: { customRender: 'amountSlot' },
                },
                {
                    title: '竞价风控返点',
                    align: 'center',
                    dataIndex: 'bidRiskControl',
                    width: 130,
                    scopedSlots: { customRender: 'amountSlot' },
                },
                {
                    title: '竞价资金类型返点',
                    align: 'center',
                    dataIndex: 'bidTypeRebateNormal',
                    width: 150,
                    scopedSlots: { customRender: 'amountSlot' },
                },
                {
                    title: '品牌基础返点',
                    align: 'center',
                    dataIndex: 'quarterBrandBaseRebateAmount',
                    width: 130,
                    scopedSlots: { customRender: 'amountSlot' },
                },
                {
                    title: '品牌客户拓新返点',
                    align: 'center',
                    dataIndex: 'brandCustomerExpansionRebateAmount',
                    width: 150,
                    scopedSlots: { customRender: 'amountSlot' },
                },
                {
                    title: '品牌特定产品返点',
                    align: 'center',
                    dataIndex: 'brandSpecialProductRebateAmount',
                    width: 150,
                    scopedSlots: { customRender: 'amountSlot' },
                },
                {
                    title: 'IP返点',
                    align: 'center',
                    dataIndex: 'ipRebateAmount',
                    width: 120,
                    scopedSlots: { customRender: 'amountSlot' },
                },
                {
                    title: 'IP类型',
                    align: 'center',
                    dataIndex: 'ipType',
                    width: 120,
                },
                {
                    title: '汽车首发素材返点',
                    align: 'center',
                    dataIndex: 'vehicleFirstEffectiveCostRebateAmount',
                    width: 150,
                    scopedSlots: { customRender: 'amountSlot' },
                },
                {
                    title: '汽车优质素材返点',
                    align: 'center',
                    dataIndex: 'vehicleHighCostRebateAmount',
                    width: 150,
                    scopedSlots: { customRender: 'amountSlot' },
                },
                {
                    title: '其他返点',
                    align: 'center',
                    dataIndex: 'otherRebate',
                    width: 120,
                    scopedSlots: { customRender: 'amountSlot' },
                },
                {
                    title: '季度累计竞价基础返点',
                    align: 'center',
                    dataIndex: 'normalQuarterBaseMetricRebateAmount',
                    width: 180,
                    scopedSlots: { customRender: 'amountSlot' },
                },
                {
                    title: '商务协议编号',
                    align: 'center',
                    dataIndex: 'contractSerial',
                    width: 150,
                },
                {
                    title: '渠道三级部门',
                    align: 'center',
                    dataIndex: 'channelSalesmanDepartment3Name',
                    width: 150,
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
                    title: '(季度)核算政策类型',
                    align: 'center',
                    dataIndex: 'rebateCalcPolicyType',
                    width: 150,
                },
                {
                    title: '(季度)披露标签',
                    align: 'center',
                    dataIndex: 'rebateCalcTypeShow',
                    width: 150,
                },
                {
                    title: '(月度)核算政策类型',
                    align: 'center',
                    dataIndex: 'monthRebateCalcPolicyType',
                    width: 150,
                },
                {
                    title: '(月度)披露标签',
                    align: 'center',
                    dataIndex: 'monthRebateCalcTypeShow',
                    width: 150,
                },
                {
                    title: '品牌特定产品类型',
                    align: 'center',
                    dataIndex: 'specBrandProduct',
                    width: 150,
                },
                {
                    title: '是否结算拓新返点',
                    align: 'center',
                    dataIndex: 'isCalCustomerExpansionCostRebate',
                    width: 150,
                },
                {
                    title: '创建时间',
                    align: 'center',
                    dataIndex: 'createTime',
                    width: 150,
                },
            ],
            url: {
                list: '/douyinRebateCalcDetail/list',
                delete: "/douyinRebateCalcDetail/delete",
                deleteBatch: "/douyinRebateCalcDetail/deleteBatch",
                exportXlsUrl: "/douyinRebateCalcDetail/exportXls",
                importExcelUrl: "douyinRebateCalcDetail/importExcel",

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
        // 计算合计
        calculateTotal(field) {
            if (!this.dataSource || this.dataSource.length === 0) {
                return '0.00';
            }
            const total = this.dataSource.reduce((sum, item) => {
                return sum + (parseFloat(item[field]) || 0);
            }, 0);
            return total.toFixed(2);
        },
        getSuperFieldList() {
            let fieldList = [];
            fieldList.push({ type: 'string', value: 'agentCompanyName', text: '代理商公司名称', dictCode: '' })
            fieldList.push({ type: 'string', value: 'agentGroupName', text: '代理商集团名称', dictCode: '' })
            fieldList.push({ type: 'number', value: 'bidBaseReabteAmount', text: '竞价基础返点（金额）', dictCode: '' })
            fieldList.push({ type: 'number', value: 'bidRiskControl', text: '竞价风控返点(金额)', dictCode: '' })
            fieldList.push({ type: 'number', value: 'bidTypeRebateNormal', text: '竞价资金类型返点-常规部分(金额)', dictCode: '' })
            fieldList.push({ type: 'number', value: 'brandCustomerExpansionRebateAmount', text: '品牌客户拓新返点(金额)', dictCode: '' })
            fieldList.push({ type: 'number', value: 'brandSpecialProductRebateAmount', text: '品牌特定产品返点-不含闭环开屏(金额)', dictCode: '' })
            fieldList.push({ type: 'string', value: 'channelName', text: '渠道名称', dictCode: '' })
            fieldList.push({ type: 'string', value: 'channelPlatform', text: '平台标识', dictCode: '' })
            fieldList.push({ type: 'string', value: 'channelSalesmanDepartment3Name', text: '渠道三级部门', dictCode: '' })
            fieldList.push({ type: 'string', value: 'channelSign', text: '渠道标识', dictCode: '' })
            fieldList.push({ type: 'string', value: 'contractSerial', text: '商务协议编号', dictCode: '' })
            fieldList.push({ type: 'number', value: 'ipRebateAmount', text: 'IP返点(金额)', dictCode: '' })
            fieldList.push({ type: 'string', value: 'ipType', text: '结算IP类型', dictCode: '' })
            fieldList.push({ type: 'string', value: 'isCalCustomerExpansionCostRebate', text: '是否结算品牌客户拓新返点', dictCode: '' })
            fieldList.push({ type: 'string', value: 'monthRebateCalcPolicyType', text: '(月度)返点核算政策类型', dictCode: '' })
            fieldList.push({ type: 'string', value: 'monthRebateCalcTypeShow', text: '(月度)披露标签名称', dictCode: '' })
            fieldList.push({ type: 'number', value: 'normalQuarterBaseMetricRebateAmount', text: '附:季度累计发放竞价基础返点金额(含月度结算)', dictCode: '' })
            fieldList.push({ type: 'number', value: 'otherRebate', text: '其他返点(金额)', dictCode: '' })
            fieldList.push({ type: 'number', value: 'performanceCost', text: '业绩消耗', dictCode: '' })
            fieldList.push({ type: 'number', value: 'quarterBrandBaseRebateAmount', text: '品牌基础返点(金额)', dictCode: '' })
            fieldList.push({ type: 'string', value: 'rebateCalcAttributionQuarter', text: '结算周期', dictCode: '' })
            fieldList.push({ type: 'integer', value: 'rebateCalcAttributionYear', text: '结算年份', dictCode: '' })
            fieldList.push({ type: 'string', value: 'rebateCalcPolicyType', text: '(季度)返点核算政策类型', dictCode: '' })
            fieldList.push({ type: 'string', value: 'rebateCalcTypeShow', text: '(季度)披露标签名称', dictCode: '' })
            fieldList.push({ type: 'string', value: 'specBrandProduct', text: '结算品牌特定产品类型', dictCode: '' })
            fieldList.push({ type: 'number', value: 'vehicleFirstEffectiveCostRebateAmount', text: '竞价首发素材占比返点-汽车政策(金额)', dictCode: '' })
            fieldList.push({ type: 'number', value: 'vehicleHighCostRebateAmount', text: '竞价优质素材占比返点-汽车政策(金额)', dictCode: '' })
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

.table-summary {
    margin-top: 16px;
    padding: 16px;
    background: #fafafa;
    border-radius: 4px;
}
</style>
