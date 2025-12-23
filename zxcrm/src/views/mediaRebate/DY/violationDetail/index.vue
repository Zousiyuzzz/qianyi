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
                                    <a-form-item label="违规类型">
                                        <a-input placeholder="请输入违规类型" v-model="queryParam.violationType"></a-input>
                                    </a-form-item>
                                </a-col>
                                <a-col :xl="6" :lg="7" :md="8" :sm="24" style="width: 320px;">
                                    <a-form-item label="代理商公司">
                                        <a-input placeholder="请输入代理商公司名称"
                                            v-model="queryParam.agentCompanyName"></a-input>
                                    </a-form-item>
                                </a-col>
                                <a-col :xl="6" :lg="7" :md="8" :sm="24" style="width: 320px;">
                                    <a-form-item label="代理商集团">
                                        <a-input placeholder="请输入代理商集团名称" v-model="queryParam.agentGroupName"></a-input>
                                    </a-form-item>
                                </a-col>
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
                                    <a-form-item label="结算月度">
                                        <a-select placeholder="请选择结算月度" v-model="queryParam.rebateCalcAttributionMonth">
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
                                        <a-input placeholder="请输入商务协议编号" v-model="queryParam.contractSerial"></a-input>
                                    </a-form-item>
                                </a-col>
                                <a-col :xl="6" :lg="7" :md="8" :sm="24" style="width: 320px;">
                                    <a-form-item label="渠道三级部门">
                                        <a-input placeholder="请输入渠道三级部门"
                                            v-model="queryParam.channelSalesmanDepartment3Name"></a-input>
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

                <template slot="violationTypeSlot" slot-scope="text">
                    <a-tag color="red">
                        {{ text }}
                    </a-tag>
                </template>

                <template slot="performanceCostSlot" slot-scope="text, record">
                    <span style="color: #f5222d; font-weight: 500;">
                        ¥{{ parseFloat(record.performanceCost || 0).toFixed(2) }}
                    </span>
                </template>

                <template slot="rebateAmountSlot" slot-scope="text, record">
                    <span style="color: #ff4d4f; font-weight: 500;">
                        ¥{{ parseFloat(record.rebateAmount || 0).toFixed(2) }}
                    </span>
                </template>

            </a-table>
        </div>

        <!-- 合计统计 -->
        <div class="table-summary" v-if="dataSource && dataSource.length > 0">
            <a-descriptions bordered size="small" :column="3">
                <a-descriptions-item label="违规记录数">
                    <span style="color: #1890ff; font-weight: 600;">
                        {{ dataSource.length }} 条
                    </span>
                </a-descriptions-item>
                <a-descriptions-item label="违规业绩消耗合计">
                    <span style="color: #f5222d; font-weight: 600;">
                        ¥{{ calculateTotal('performanceCost') }}
                    </span>
                </a-descriptions-item>
                <a-descriptions-item label="违规业绩返点合计">
                    <span style="color: #ff4d4f; font-weight: 600;">
                        ¥{{ calculateTotal('rebateAmount') }}
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
    name: 'DouyinRebateViolationDetailList',
    mixins: [JeecgListMixin, mixinDevice],

    data() {
        return {
            description: '抖音返点违规明细管理页面',
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
                    title: '违规类型',
                    align: 'center',
                    dataIndex: 'violationType',
                    width: 150,
                    scopedSlots: { customRender: 'violationTypeSlot' },
                },
                {
                    title: '客户名称',
                    align: 'center',
                    dataIndex: 'customerName',
                    width: 150,
                },
                {
                    title: '违规业绩消耗',
                    align: 'center',
                    dataIndex: 'performanceCost',
                    width: 130,
                    scopedSlots: { customRender: 'performanceCostSlot' },
                },
                {
                    title: '违规业绩返点',
                    align: 'center',
                    dataIndex: 'rebateAmount',
                    width: 130,
                    scopedSlots: { customRender: 'rebateAmountSlot' },
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
                    title: '结算月度',
                    align: 'center',
                    dataIndex: 'rebateCalcAttributionMonth',
                    width: 100,
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
                    title: '创建时间',
                    align: 'center',
                    dataIndex: 'createTime',
                    width: 150,
                },
            ],
            url: {
                list: '/douyinRebateViolationDetail/list',
                delete: "/douyinRebateViolationDetail/delete",
                deleteBatch: "/douyinRebateViolationDetail/deleteBatch",
                exportXlsUrl: "/douyinRebateViolationDetail/exportXls",
                importExcelUrl: "douyinRebateViolationDetail/importExcel",

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
            fieldList.push({ type: 'string', value: 'channelName', text: '渠道名称', dictCode: '' })
            fieldList.push({ type: 'string', value: 'channelPlatform', text: '平台标识', dictCode: '' })
            fieldList.push({ type: 'string', value: 'channelSalesmanDepartment3Name', text: '渠道三级部门', dictCode: '' })
            fieldList.push({ type: 'string', value: 'channelSign', text: '渠道标识', dictCode: '' })
            fieldList.push({ type: 'string', value: 'contractSerial', text: '商务协议编号', dictCode: '' })
            fieldList.push({ type: 'string', value: 'customerName', text: '客户名称', dictCode: '' })
            fieldList.push({ type: 'string', value: 'monthRebateCalcPolicyType', text: '(月度)返点核算政策类型', dictCode: '' })
            fieldList.push({ type: 'string', value: 'monthRebateCalcTypeShow', text: '(月度)披露标签名称', dictCode: '' })
            fieldList.push({ type: 'number', value: 'performanceCost', text: '违规业绩消耗', dictCode: '' })
            fieldList.push({ type: 'number', value: 'rebateAmount', text: '违规业绩返点（核算明细内返点类型涉及金额）', dictCode: '' })
            fieldList.push({ type: 'string', value: 'rebateCalcAttributionMonth', text: '结算月度', dictCode: '' })
            fieldList.push({ type: 'integer', value: 'rebateCalcAttributionYear', text: '结算年份', dictCode: '' })
            fieldList.push({ type: 'string', value: 'rebateCalcPolicyType', text: '(季度)返点核算政策类型', dictCode: '' })
            fieldList.push({ type: 'string', value: 'rebateCalcTypeShow', text: '(季度)披露标签名称', dictCode: '' })
            fieldList.push({ type: 'string', value: 'violationType', text: '违规类型', dictCode: '' })
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
