<template>
    <a-drawer title="业绩明细" :width="1200" :visible="visible" :confirmLoading="confirmLoading" @close="handleCancel"
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
                        <a-form-item label="客户名称">
                            <a-input placeholder="请输入客户名称" v-model="queryParam.customerName"></a-input>
                        </a-form-item>
                    </a-col>
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="项目名称">
                            <a-input placeholder="请输入项目名称" v-model="queryParam.projectName"></a-input>
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
            <!-- <a-button type="primary" icon="download" @click="handleExportXls('业绩明细')">导出</a-button> -->
        </div>

        <div>
            <a-table ref="table" size="middle" :scroll="{ x: true }" bordered rowKey="id" :columns="columns"
                :dataSource="dataSource" :pagination="ipagination" :loading="loading" class="j-table-force-nowrap"
                @change="handleTableChange">
                <template slot="prepayCostSlot" slot-scope="text, record">
                    <span style="color: #1890ff; font-weight: 500;">
                        ¥{{ parseFloat(record.prepayCost || 0).toFixed(2) }}
                    </span>
                </template>

                <template slot="creditCostSlot" slot-scope="text, record">
                    <span style="color: #52c41a; font-weight: 500;">
                        ¥{{ parseFloat(record.creditCost || 0).toFixed(2) }}
                    </span>
                </template>

                <template slot="performanceCostSlot" slot-scope="text, record">
                    <span style="color: #f5222d; font-weight: 500;">
                        ¥{{ parseFloat(record.performanceCost || 0).toFixed(2) }}
                    </span>
                </template>
            </a-table>
        </div>
    </a-drawer>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'

export default {
    name: 'PerformanceDetailModal',
    mixins: [JeecgListMixin],
    data() {
        return {
            description: '业绩明细查询',
            visible: false,
            confirmLoading: false,
            rebateBalanceId: null,
            // 表单查询参数
            queryParam: {
                agentCompanyName: null,
                customerName: null,
                projectName: null,
            },
            // 表单提交参数
            url: {
                list: '/douyinRebatePerformanceDetail/list',
                exportXlsUrl: '/douyinRebatePerformanceDetail/exportXls',
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
                    title: '核算业绩归属年度',
                    align: 'center',
                    dataIndex: 'rebateCalcAttributionYear',
                    width: 120,
                },
                {
                    title: '核算业绩归属季度',
                    align: 'center',
                    dataIndex: 'rebateCalcAttributionQuarter',
                    width: 120,
                },
                {
                    title: '核算业绩归属月度',
                    align: 'center',
                    dataIndex: 'rebateCalcAttributionMonth',
                    width: 120,
                },
                {
                    title: '代理商集团名称',
                    align: 'center',
                    dataIndex: 'agentGroupName',
                    width: 150,
                },
                {
                    title: '代理商集团类型',
                    align: 'center',
                    dataIndex: 'agentGroupType',
                    width: 120,
                },
                {
                    title: '代理商公司名称',
                    align: 'center',
                    dataIndex: 'agentCompanyName',
                    width: 150,
                },
                {
                    title: '客户名称',
                    align: 'center',
                    dataIndex: 'customerName',
                    width: 150,
                },
                {
                    title: '广告主名称',
                    align: 'center',
                    dataIndex: 'advertiserName',
                    width: 150,
                },
                {
                    title: '项目名称',
                    align: 'center',
                    dataIndex: 'projectName',
                    width: 150,
                },
                {
                    title: '排期名称',
                    align: 'center',
                    dataIndex: 'cartName',
                    width: 150,
                },
                {
                    title: '招商意向名称',
                    align: 'center',
                    dataIndex: 'intentionName',
                    width: 150,
                },
                {
                    title: '招商项目名称',
                    align: 'center',
                    dataIndex: 'merchantsProjectName',
                    width: 150,
                },
                {
                    title: '招商项目产品线',
                    align: 'center',
                    dataIndex: 'productLineName',
                    width: 120,
                },
                {
                    title: '招商项目子产品线',
                    align: 'center',
                    dataIndex: 'productSubLineName',
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
                    width: 120,
                },
                {
                    title: '渠道三级部门名称',
                    align: 'center',
                    dataIndex: 'channelSalesmanDepartment3Name',
                    width: 150,
                },
                {
                    title: '广告类型名称',
                    align: 'center',
                    dataIndex: 'pricingCategory',
                    width: 120,
                },
                {
                    title: '投放产品名称',
                    align: 'center',
                    dataIndex: 'appName',
                    width: 120,
                },
                {
                    title: '业务类型名称',
                    align: 'center',
                    dataIndex: 'businessType',
                    width: 120,
                },
                {
                    title: '消耗来源名称',
                    align: 'center',
                    dataIndex: 'costSource',
                    width: 120,
                },
                {
                    title: '特殊资源类型',
                    align: 'center',
                    dataIndex: 'specialType',
                    width: 120,
                },
                {
                    title: '违规类型',
                    align: 'center',
                    dataIndex: 'violationType',
                    width: 120,
                },
                {
                    title: '预付消耗',
                    align: 'center',
                    dataIndex: 'prepayCost',
                    width: 120,
                    scopedSlots: { customRender: 'prepayCostSlot' },
                },
                {
                    title: '授信消耗',
                    align: 'center',
                    dataIndex: 'creditCost',
                    width: 120,
                    scopedSlots: { customRender: 'creditCostSlot' },
                },
                {
                    title: '业绩消耗',
                    align: 'center',
                    dataIndex: 'performanceCost',
                    width: 120,
                    scopedSlots: { customRender: 'performanceCostSlot' },
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
                customerName: null,
                projectName: null,
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
                customerName: null,
                projectName: null,
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
            // this.$api.douyinRebatePerformanceDetail.list(Object.assign(this.queryParam, this.ipagination, { rebateBalanceId: this.rebateBalanceId })).then(
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
