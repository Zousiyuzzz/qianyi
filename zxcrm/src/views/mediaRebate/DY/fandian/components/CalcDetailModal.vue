<template>
    <a-drawer title="核算明细" :width="1200" :visible="visible" :confirmLoading="confirmLoading" @close="handleCancel"
        :closable="true" :maskClosable="false">
        <div class="table-page-search-wrapper">
            <a-form layout="inline" @keyup.enter.native="searchQuery">
                <a-row :gutter="24">
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="代理商公司名称">
                            <a-input placeholder="请输入代理商公司名称" v-model="queryParam.agentCompanyName"></a-input>
                        </a-form-item>
                    </a-col>
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="商务协议编号">
                            <a-input placeholder="请输入商务协议编号" v-model="queryParam.contractSerial"></a-input>
                        </a-form-item>
                    </a-col>
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="返点核算政策类型">
                            <a-select placeholder="请选择返点核算政策类型" v-model="queryParam.rebateCalcPolicyType">
                                <a-select-option value="">全部</a-select-option>
                                <a-select-option value="月度">月度</a-select-option>
                                <a-select-option value="季度">季度</a-select-option>
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
            <!-- <a-button type="primary" icon="download" @click="handleExportXls('核算明细')">导出</a-button> -->
        </div>

        <div>
            <a-table ref="table" size="middle" :scroll="{ x: true }" bordered rowKey="id" :columns="columns"
                :dataSource="dataSource" :pagination="ipagination" :loading="loading" class="j-table-force-nowrap"
                @change="handleTableChange">
                <template slot="performanceCostSlot" slot-scope="text, record">
                    <span style="color: #f5222d; font-weight: 500;">
                        ¥{{ parseFloat(record.performanceCost || 0).toFixed(2) }}
                    </span>
                </template>

                <template slot="bidBaseReabteAmountSlot" slot-scope="text, record">
                    <span style="color: #1890ff; font-weight: 500;">
                        ¥{{ parseFloat(record.bidBaseReabteAmount || 0).toFixed(2) }}
                    </span>
                </template>

                <template slot="bidTypeRebateNormalSlot" slot-scope="text, record">
                    <span style="color: #52c41a; font-weight: 500;">
                        ¥{{ parseFloat(record.bidTypeRebateNormal || 0).toFixed(2) }}
                    </span>
                </template>

                <template slot="bidRiskControlSlot" slot-scope="text, record">
                    <span style="color: #faad14; font-weight: 500;">
                        ¥{{ parseFloat(record.bidRiskControl || 0).toFixed(2) }}
                    </span>
                </template>

                <template slot="quarterBrandBaseRebateAmountSlot" slot-scope="text, record">
                    <span style="color: #722ed1; font-weight: 500;">
                        ¥{{ parseFloat(record.quarterBrandBaseRebateAmount || 0).toFixed(2) }}
                    </span>
                </template>

                <template slot="brandSpecialProductRebateAmountSlot" slot-scope="text, record">
                    <span style="color: #eb2f96; font-weight: 500;">
                        ¥{{ parseFloat(record.brandSpecialProductRebateAmount || 0).toFixed(2) }}
                    </span>
                </template>

                <template slot="ipRebateAmountSlot" slot-scope="text, record">
                    <span style="color: #13c2c2; font-weight: 500;">
                        ¥{{ parseFloat(record.ipRebateAmount || 0).toFixed(2) }}
                    </span>
                </template>

                <template slot="brandCustomerExpansionRebateAmountSlot" slot-scope="text, record">
                    <span style="color: #fa8c16; font-weight: 500;">
                        ¥{{ parseFloat(record.brandCustomerExpansionRebateAmount || 0).toFixed(2) }}
                    </span>
                </template>

                <template slot="vehicleFirstEffectiveCostRebateAmountSlot" slot-scope="text, record">
                    <span style="color: #a0d911; font-weight: 500;">
                        ¥{{ parseFloat(record.vehicleFirstEffectiveCostRebateAmount || 0).toFixed(2) }}
                    </span>
                </template>

                <template slot="vehicleHighCostRebateAmountSlot" slot-scope="text, record">
                    <span style="color: #f759ab; font-weight: 500;">
                        ¥{{ parseFloat(record.vehicleHighCostRebateAmount || 0).toFixed(2) }}
                    </span>
                </template>

                <template slot="otherRebateSlot" slot-scope="text, record">
                    <span style="color: #36cfc9; font-weight: 500;">
                        ¥{{ parseFloat(record.otherRebate || 0).toFixed(2) }}
                    </span>
                </template>

                <template slot="normalQuarterBaseMetricRebateAmountSlot" slot-scope="text, record">
                    <span style="color: #ff7875; font-weight: 500;">
                        ¥{{ parseFloat(record.normalQuarterBaseMetricRebateAmount || 0).toFixed(2) }}
                    </span>
                </template>
            </a-table>
        </div>
    </a-drawer>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'

export default {
    name: 'CalcDetailModal',
    mixins: [JeecgListMixin],
    data() {
        return {
            description: '核算明细查询',
            visible: false,
            confirmLoading: false,
            rebateBalanceId: null,
            // 表单查询参数
            queryParam: {
                agentCompanyName: null,
                contractSerial: null,
                rebateCalcPolicyType: null,
            },
            // 表单提交参数
            url: {
                list: '/douyinRebateCalcDetail/list',
                exportXlsUrl: '/douyinRebateCalcDetail/exportXls',
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
                    title: '结算年份',
                    align: 'center',
                    dataIndex: 'rebateCalcAttributionYear',
                    width: 80,
                },
                {
                    title: '结算周期',
                    align: 'center',
                    dataIndex: 'rebateCalcAttributionQuarter',
                    width: 100,
                },
                {
                    title: '代理商集团名称',
                    align: 'center',
                    dataIndex: 'agentGroupName',
                    width: 150,
                },
                {
                    title: '代理商公司名称',
                    align: 'center',
                    dataIndex: 'agentCompanyName',
                    width: 150,
                },
                {
                    title: '渠道三级部门',
                    align: 'center',
                    dataIndex: 'channelSalesmanDepartment3Name',
                    width: 150,
                },
                {
                    title: '商务协议编号',
                    align: 'center',
                    dataIndex: 'contractSerial',
                    width: 120,
                },
                {
                    title: '结算IP类型',
                    align: 'center',
                    dataIndex: 'ipType',
                    width: 120,
                },
                {
                    title: '结算品牌特定产品类型',
                    align: 'center',
                    dataIndex: 'specBrandProduct',
                    width: 150,
                },
                {
                    title: '是否结算品牌客户拓新返点',
                    align: 'center',
                    dataIndex: 'isCalCustomerExpansionCostRebate',
                    width: 180,
                },
                {
                    title: '(月度)返点核算政策类型',
                    align: 'center',
                    dataIndex: 'monthRebateCalcPolicyType',
                    width: 180,
                },
                {
                    title: '(季度)返点核算政策类型',
                    align: 'center',
                    dataIndex: 'rebateCalcPolicyType',
                    width: 180,
                },
                {
                    title: '(月度)披露标签名称',
                    align: 'center',
                    dataIndex: 'monthRebateCalcTypeShow',
                    width: 150,
                },
                {
                    title: '(季度)披露标签名称',
                    align: 'center',
                    dataIndex: 'rebateCalcTypeShow',
                    width: 150,
                },
                {
                    title: '业绩消耗',
                    align: 'center',
                    dataIndex: 'performanceCost',
                    width: 120,
                    scopedSlots: { customRender: 'performanceCostSlot' },
                },
                {
                    title: '竞价基础返点（金额）',
                    align: 'center',
                    dataIndex: 'bidBaseReabteAmount',
                    width: 150,
                    scopedSlots: { customRender: 'bidBaseReabteAmountSlot' },
                },
                {
                    title: '竞价资金类型返点-常规部分(金额)',
                    align: 'center',
                    dataIndex: 'bidTypeRebateNormal',
                    width: 200,
                    scopedSlots: { customRender: 'bidTypeRebateNormalSlot' },
                },
                {
                    title: '竞价风控返点(金额)',
                    align: 'center',
                    dataIndex: 'bidRiskControl',
                    width: 150,
                    scopedSlots: { customRender: 'bidRiskControlSlot' },
                },
                {
                    title: '品牌基础返点(金额)',
                    align: 'center',
                    dataIndex: 'quarterBrandBaseRebateAmount',
                    width: 150,
                    scopedSlots: { customRender: 'quarterBrandBaseRebateAmountSlot' },
                },
                {
                    title: '品牌特定产品返点-不含闭环开屏(金额)',
                    align: 'center',
                    dataIndex: 'brandSpecialProductRebateAmount',
                    width: 220,
                    scopedSlots: { customRender: 'brandSpecialProductRebateAmountSlot' },
                },
                {
                    title: 'IP返点(金额)',
                    align: 'center',
                    dataIndex: 'ipRebateAmount',
                    width: 120,
                    scopedSlots: { customRender: 'ipRebateAmountSlot' },
                },
                {
                    title: '品牌客户拓新返点(金额)',
                    align: 'center',
                    dataIndex: 'brandCustomerExpansionRebateAmount',
                    width: 150,
                    scopedSlots: { customRender: 'brandCustomerExpansionRebateAmountSlot' },
                },
                {
                    title: '竞价首发素材占比返点-汽车政策(金额)',
                    align: 'center',
                    dataIndex: 'vehicleFirstEffectiveCostRebateAmount',
                    width: 220,
                    scopedSlots: { customRender: 'vehicleFirstEffectiveCostRebateAmountSlot' },
                },
                {
                    title: '竞价优质素材占比返点-汽车政策(金额)',
                    align: 'center',
                    dataIndex: 'vehicleHighCostRebateAmount',
                    width: 220,
                    scopedSlots: { customRender: 'vehicleHighCostRebateAmountSlot' },
                },
                {
                    title: '其他返点(金额)',
                    align: 'center',
                    dataIndex: 'otherRebate',
                    width: 120,
                    scopedSlots: { customRender: 'otherRebateSlot' },
                },
                {
                    title: '附:季度累计发放竞价基础返点金额(含月度结算)',
                    align: 'center',
                    dataIndex: 'normalQuarterBaseMetricRebateAmount',
                    width: 280,
                    scopedSlots: { customRender: 'normalQuarterBaseMetricRebateAmountSlot' },
                },
            ]
        },
    },
    methods: {
        show(record) {
            this.visible = true
            this.rebateBalanceId = record.rebateBalanceId
            this.queryParam = {
                agentCompanyName: null,
                contractSerial: null,
                rebateCalcPolicyType: null,
            }
            this.ipagination.current = 1
            this.getList()
        },
        handleOk() {
            this.visible = false
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
                agentCompanyName: null,
                contractSerial: null,
                rebateCalcPolicyType: null,
            }
            this.ipagination.current = 1
            this.getList()
        },
        handleExportXls(fileName) {
            const params = {
                ...this.queryParam,
                rebateBalanceId: this.rebateBalanceId,
                ...this.ipagination,
            }
            this.$exportXls(this.url.exportXlsUrl, params, fileName)
        },
        handleTableChange(pagination, filters, sorter) {
            this.ipagination = pagination
            this.getList()
        },
        getList() {
            this.loading = true
            // 这里调用实际的API接口
            // this.$api.douyinRebateCalcDetail.list(Object.assign(this.queryParam, this.ipagination, { rebateBalanceId: this.rebateBalanceId })).then(
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
