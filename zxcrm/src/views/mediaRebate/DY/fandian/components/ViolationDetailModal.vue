<template>
    <a-drawer title="违规明细" :width="1000" :visible="visible" :confirmLoading="confirmLoading" @close="handleCancel"
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
                        <a-form-item label="违规类型">
                            <a-input placeholder="请输入违规类型" v-model="queryParam.violationType"></a-input>
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
            <!-- <a-button type="primary" icon="download" @click="handleExportXls('违规明细')">导出</a-button> -->
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

                <template slot="rebateAmountSlot" slot-scope="text, record">
                    <span style="color: #faad14; font-weight: 500;">
                        ¥{{ parseFloat(record.rebateAmount || 0).toFixed(2) }}
                    </span>
                </template>
            </a-table>
        </div>
    </a-drawer>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'

export default {
    name: 'ViolationDetailModal',
    mixins: [JeecgListMixin],
    data() {
        return {
            description: '违规明细查询',
            visible: false,
            confirmLoading: false,
            rebateBalanceId: null,
            // 表单查询参数
            queryParam: {
                agentCompanyName: null,
                customerName: null,
                violationType: null,
            },
            // 表单提交参数
            url: {
                list: '/douyinRebateViolationDetail/list',
                exportXlsUrl: '/douyinRebateViolationDetail/exportXls',
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
                    title: '结算月度',
                    align: 'center',
                    dataIndex: 'rebateCalcAttributionMonth',
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
                    title: '客户名称',
                    align: 'center',
                    dataIndex: 'customerName',
                    width: 150,
                },
                {
                    title: '(月度)返点核算政策类型',
                    align: 'center',
                    dataIndex: 'monthRebateCalcPolicyType',
                    width: 180,
                },
                {
                    title: '(月度)披露标签名称',
                    align: 'center',
                    dataIndex: 'monthRebateCalcTypeShow',
                    width: 150,
                },
                {
                    title: '(季度)返点核算政策类型',
                    align: 'center',
                    dataIndex: 'rebateCalcPolicyType',
                    width: 180,
                },
                {
                    title: '(季度)披露标签名称',
                    align: 'center',
                    dataIndex: 'rebateCalcTypeShow',
                    width: 150,
                },
                {
                    title: '违规类型',
                    align: 'center',
                    dataIndex: 'violationType',
                    width: 120,
                },
                {
                    title: '违规业绩消耗',
                    align: 'center',
                    dataIndex: 'performanceCost',
                    width: 120,
                    scopedSlots: { customRender: 'performanceCostSlot' },
                },
                {
                    title: '违规业绩返点（核算明细内返点类型涉及金额）',
                    align: 'center',
                    dataIndex: 'rebateAmount',
                    width: 250,
                    scopedSlots: { customRender: 'rebateAmountSlot' },
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
                violationType: null,
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
                violationType: null,
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
            // this.$api.douyinRebateViolationDetail.list(Object.assign(this.queryParam, this.ipagination, { rebateBalanceId: this.rebateBalanceId })).then(
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
