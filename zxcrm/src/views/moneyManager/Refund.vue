<template>
    <div style="background-color: #fff;">
        <a-tabs default-active-key="1" v-model="currentFundsNature" @change="fundsNatureChange">
            <a-tab-pane key="1" tab="对公" :disabled="loading">
            </a-tab-pane>
            <a-tab-pane key="2" tab="对私" :disabled="loading">
            </a-tab-pane>
        </a-tabs>
        <a-card :bordered="false">
            <!-- 查询区域 -->
            <div class="table-page-search-wrapper">
                <a-form layout="inline" @keyup.enter.native="searchQuery">
                    <a-row :gutter="24">
                        <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <a-form-item label="项目ID">
                                <a-input placeholder="请输入项目ID" v-model="queryParam.proUniqueId"></a-input>
                            </a-form-item>
                        </a-col>
                        <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <a-form-item label="项目">
                                <JSearchSelectTag placeholder="请选择" v-model:value="queryParam.proId" :allowClear="true"
                                    dict="tab_projectManage,pro_name,id,del_flag = '0'" async>
                                </JSearchSelectTag>
                            </a-form-item>
                        </a-col>
                        <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <a-form-item label="渠道">
                                <JSearchSelectTag placeholder="请选择渠道" v-model:value="queryParam.businessId"
                                    dict="tab_business,business_name,id,del_flag = '0'" async>
                                </JSearchSelectTag>
                            </a-form-item>
                        </a-col>
                        <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <a-form-item label="合作方式">
                                <a-select placeholder="请选择" v-model:value="queryParam.collaborationMode"
                                    :allowClear="true">
                                    <a-select-option value="0">预付</a-select-option>
                                    <a-select-option value="1">垫付</a-select-option>
                                    <a-select-option value="2">服务费</a-select-option>
                                </a-select>
                            </a-form-item>
                        </a-col>
                        <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <a-form-item label="创建日期">
                                <a-range-picker v-model:value="createTime" format="YYYY-MM-DD"
                                    value-format="YYYY-MM-DD" />
                            </a-form-item>
                        </a-col>
                        <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <a-form-item label="空值查询">
                                <a-select placeholder="请选择字段" v-model:value="queryParam.fieldNull" :allowClear="true">
                                    <a-select-option v-for="column in fieldNullList" :key="column.dataIndex"
                                        :value="column.dataIndex">
                                        {{ column.title }}
                                    </a-select-option>
                                </a-select>
                            </a-form-item>
                        </a-col>
                        <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <a-form-item label="状态">
                                <a-select placeholder="请选择" v-model:value="queryParam.state" :allowClear="true">
                                    <a-select-option value="1">退款中</a-select-option>
                                    <a-select-option value="2">退款成功</a-select-option>
                                    <a-select-option value="3">退款驳回</a-select-option>
                                </a-select>
                            </a-form-item>
                        </a-col>
                    </a-row>
                </a-form>
            </div>
            <!-- 查询区域-END -->

            <!-- 操作按钮区域 -->
            <div class="table-operator">
                <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
                <!-- <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button> -->
                <a-button type="primary" icon="download" @click="handleExportXls('退款记录信息表')">导出</a-button>
                <!-- <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader"
                    :action="importExcelUrl" @change="handleImportExcel">
                    <a-button type="primary" icon="import">导入</a-button>
                </a-upload> -->
                <!-- 高级查询区域 -->
                <j-super-query :fieldList="superFieldList" ref="superQueryModal"
                    @handleSuperQuery="handleSuperQuery"></j-super-query>
                <a-dropdown v-if="selectedRowKeys.length > 0">
                    <a-menu slot="overlay">
                        <a-menu-item key="1" @click="batchDel"><a-icon type="delete" />删除</a-menu-item>
                    </a-menu>
                    <!-- <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button> -->
                </a-dropdown>
            </div>

            <!-- table区域-begin -->
            <div>
                <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
                    <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{
                        selectedRowKeys.length }}</a>项
                    <a style="margin-left: 24px" @click="onClearSelected">清空</a>
                </div>

                <a-table ref="table" size="middle" :scroll="{ x: true }" bordered rowKey="id" :columns="columns"
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

                    <!-- <span slot="action" slot-scope="text, record">
                        <a @click="handleEdit(record)">编辑</a>
                        <a-popconfirm title="确定同意退款吗?" @confirm="() => handleApprove(record.id)">
                            <a @confirm="() => handleApprove(record.id)" v-if="record.state == 1">同意</a>
                        </a-popconfirm>
                        <a-divider type="vertical" v-if="record.state == 1" />
                        <a @click="handleReject(record)" v-if="record.state == 1">驳回</a>
                        <a-divider type="vertical" v-if="record.state == 1" />
                        <a @click="handleDetail(record)">详情</a>
                        <a-dropdown>
                        <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
                        <a-menu slot="overlay">
                            <a-menu-item>
                                <a @click="handleDetail(record)">详情</a>
                            </a-menu-item>
                            <a-menu-item>
                                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                                    <a>删除</a>
                                </a-popconfirm>
                            </a-menu-item>
                        </a-menu>
                    </a-dropdown>
                    </span> -->

                </a-table>
            </div>

            <tab-refund-modal ref="modalForm" @ok="modalFormOk" @approve="handleApproveFromModal"
                @reject="handleRejectFromModal"></tab-refund-modal>
            <tab-reject-modal ref="rejectModal" @ok="rejectModalOk"></tab-reject-modal>
        </a-card>
    </div>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { httpAction } from '@/api/manage'
import TabRefundModal from './modules/TabRefundModal'
import TabRejectModal from './modules/TabRejectModal'

export default {
    name: 'TabRefundList',
    mixins: [JeecgListMixin, mixinDevice],
    components: {
        TabRefundModal,
        TabRejectModal,
    },
    data() {
        return {
            fieldNullList: [
                {
                    title: '项目主体',
                    dataIndex: 'customer_title'
                },
                {
                    title: '我方主体',
                    dataIndex: 'our_title'
                },
                {
                    title: '资金性质',
                    dataIndex: 'funds_nature'
                },
                {
                    title: '项目',
                    dataIndex: 'pro_id'
                },
                {
                    title: '退款金额',
                    dataIndex: 'refund_amount'
                }
            ],
            createTime: [],
            currentFundsNature: '1',
            description: '退款记录管理页面',
            // 表头
            columns: [
                {
                    title: '项目名称',
                    align: "center",
                    dataIndex: 'proName'
                },
                {
                    title: '项目唯一标识',
                    align: "center",
                    dataIndex: 'proUniqueId'
                },
                {
                    title: '合作方式',
                    align: "center",
                    dataIndex: 'collaborationMode',
                    customRender: (text) => {
                        if (text) {
                            let arr = ['预付', '垫付', '服务费']
                            return arr[Number(text)] || text
                        } else {
                            return ''
                        }
                    },
                },
                {
                    title: '资金性质',
                    align: "center",
                    dataIndex: 'fundsNature',
                    customRender: (text) => {
                        let arr = ['', '对公', '对私']
                        return arr[Number(text)] || text
                    },
                },
                {
                    title: '退款时间',
                    align: "center",
                    dataIndex: 'refundTime'
                },
                {
                    title: '退款金额',
                    align: "center",
                    dataIndex: 'refundAmount'
                },
                {
                    title: '客户抬头',
                    align: "center",
                    dataIndex: 'customerTitle'
                },
                {
                    title: '我方抬头',
                    align: "center",
                    dataIndex: 'ourTitle'
                },

                {
                    title: '状态',
                    align: "center",
                    dataIndex: 'state',
                    customRender: (text) => {
                        let arr = [' ', '退款中', '退款成功', '退款驳回', '退款撤回']
                        return arr[Number(text)] || text
                    },
                },
                // {
                //     title: '驳回原因',
                //     align: "center",
                //     dataIndex: 'rejectReason',
                //     width: 100,
                //     customRender: (text) => {
                //         return text ? (
                //             <a-tooltip title={text}>
                //                 <span style="display: inline-block; width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                //                     {text}
                //                 </span>
                //             </a-tooltip>
                //         ) : text
                //     }
                // },
                // {
                //     title: '抬头管理Id',
                //     align: "center",
                //     dataIndex: 'bankAccountId'
                // },
                // {
                //     title: '我方抬头id',
                //     align: "center",
                //     dataIndex: 'bankAccountConfigId'
                // },
                {
                    title: '乙方账户号',
                    align: "center",
                    dataIndex: 'accountNo'
                },
                {
                    title: '乙方账户名称',
                    align: "center",
                    dataIndex: 'accountName'
                },
                {
                    title: '甲方银行账号',
                    align: "center",
                    dataIndex: 'partyAAccount'
                },
                {
                    title: '甲方单位名称',
                    align: "center",
                    dataIndex: 'partyAName'
                },
                // {
                //     title: '甲方税号',
                //     align: "center",
                //     dataIndex: 'partyATaxNo'
                // },
                {
                    title: '甲方开户银行',
                    align: "center",
                    dataIndex: 'partyABank'
                },
                // {
                //     title: '甲方地址',
                //     align: "center",
                //     dataIndex: 'partyAAddress'
                // },
                // {
                //     title: '甲方电话',
                //     align: "center",
                //     dataIndex: 'partyAPhone'
                // },
                {
                    title: '备注',
                    align: "center",
                    dataIndex: 'remarks',
                    width: 100,
                    customRender: (text) => {
                        // 将text中的join字符替换成空字符串
                        const processedText = text ? text.replace(/join/gi, '') : text;
                        return processedText ? (
                            <a-tooltip title={processedText}>
                                <span style="display: inline-block; width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                    {processedText}
                                </span>
                            </a-tooltip>
                        ) : processedText
                    }
                },
                // {
                //     title: '操作',
                //     dataIndex: 'action',
                //     align: "center",
                //     fixed: "right",
                //     width: 147,
                //     scopedSlots: { customRender: 'action' }
                // }
            ],
            url: {
                list: "/projectRefundRecord/list",
                delete: "/projectRefundRecord/delete",
                deleteBatch: "/projectRefundRecord/deleteBatch",
                exportXlsUrl: "/projectRefundRecord/exportXls",
                importExcelUrl: "projectRefundRecord/importExcel",
            },
            dictOptions: {},
            superFieldList: [],
            queryParam: {
                fundsNature: '1'
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
    mounted() {
        this.queryParam.fundsNature = '1'
    },
    methods: {
        fundsNatureChange() {
            this.queryParam.fundsNature = this.currentFundsNature
            this.loadData()
        },
        initDictConfig() {
        },
        getSuperFieldList() {
            let fieldList = [];
            fieldList.push({ type: 'string', value: 'proName', text: '项目名称', dictCode: '' })
            fieldList.push({ type: 'string', value: 'collaborationMode', text: '合作方式', dictCode: '' })
            fieldList.push({ type: 'number', value: 'refundAmount', text: '退款金额', dictCode: '' })
            fieldList.push({ type: 'string', value: 'fundsNature', text: '资金性质', dictCode: '' })
            fieldList.push({ type: 'string', value: 'customerTitle', text: '项目主体', dictCode: '' })
            fieldList.push({ type: 'string', value: 'ourTitle', text: '我方主体', dictCode: '' })
            fieldList.push({ type: 'string', value: 'rejectReason', text: '驳回原因', dictCode: '' })
            fieldList.push({ type: 'string', value: 'createBy', text: '创建人', dictCode: '' })
            fieldList.push({ type: 'string', value: 'createTime', text: '创建日期', dictCode: '' })
            fieldList.push({ type: 'Text', value: 'remarks', text: '备注', dictCode: '' })
            this.superFieldList = fieldList
        },
        // 同意退款
        handleApprove(id) {
            const params = {
                id: id,
                state: 2
            };
            this.$confirm({
                title: '确认',
                content: '确定同意退款吗？',
                onOk: () => {
                    httpAction('/projectRefundRecord/refundApproval', params, 'post').then((res) => {
                        if (res.success) {
                            this.$message.success('操作成功');
                            this.loadData();
                        } else {
                            this.$message.error(res.message || '操作失败');
                        }
                    }).catch(() => {
                        this.$message.error('操作失败');
                    });
                }
            });
        },
        // handleDetail(record) {
        //     this.$refs.modalForm.edit(record);
        // },
        handleReject(record) {
            this.$refs.rejectModal.add(record);
        },
        rejectModalOk() {
            this.loadData();
        },
        handleApproveFromModal(record) {
            this.handleApprove(record.id);
            this.$refs.modalForm.close();
        },
        handleRejectFromModal(record) {
            this.handleReject(record);
            this.$refs.modalForm.close();
        }
    }
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>