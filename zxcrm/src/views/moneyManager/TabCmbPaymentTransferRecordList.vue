<template>
    <div style="background-color: #fff;">

        <!-- 'cmb': '招商银行',
              'icbc': '工商银行',
              'abc': '农业银行',
              'boc': '中国银行',
              'ccb': '建设银行' -->

        <a-tabs default-active-key="cmb" v-model="activeParentTab" @change="handleParentTabChange" tabPosition="top">

            <a-tab-pane key="cmb" tab="招商银行" :disabled="loading">
            </a-tab-pane>
            <a-tab-pane key="icbc" tab="工商银行" :disabled="loading">
            </a-tab-pane>
            <a-tab-pane key="abc" tab="农业银行" :disabled="loading">
            </a-tab-pane>
            <a-tab-pane key="boc" tab="中国银行" :disabled="loading">
            </a-tab-pane>
            <a-tab-pane key="ccb" tab="建设银行" :disabled="loading">
            </a-tab-pane>

        </a-tabs>
        <a-card :bordered="false">
            <!-- 查询区域 -->
            <div class="table-page-search-wrapper">
                <a-form layout="inline" @keyup.enter.native="searchQuery">
                    <a-row :gutter="24">
                        <a-col :span="6">
                            <a-form-item label="转出账号">
                                <a-input v-model="queryParam.dbtAcc" placeholder="请输入转出账号" />
                            </a-form-item>
                        </a-col>
                        <a-col :span="6">
                            <a-form-item label="收方账号">
                                <a-input v-model="queryParam.crtAcc" placeholder="请输入收方账号" />
                            </a-form-item>
                        </a-col>
                        <a-col :span="6">
                            <a-form-item label="收方户名">
                                <a-input v-model="queryParam.crtNam" placeholder="请输入收方户名" />
                            </a-form-item>
                        </a-col>
                        <span class="table-page-search-submitButtons">
                            <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
                            <a-button type="primary" @click="searchReset" icon="reload"
                                style="margin-left: 10px;">重置</a-button>
                        </span>
                    </a-row>
                </a-form>
            </div>
            <!-- 查询区域-END -->

            <!-- 操作按钮区域 -->
            <div class="table-operator">
                <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
                <a-button type="primary" icon="download" @click="handleExportXls('招商银行转账记录')">导出</a-button>
                <j-super-query :fieldList="superFieldList" ref="superQueryModal"
                    @handleSuperQuery="handleSuperQuery"></j-super-query>
                <a-dropdown v-if="selectedRowKeys.length > 0">
                    <a-menu slot="overlay">
                        <a-menu-item key="1" @click="batchDel"><a-icon type="delete" />删除</a-menu-item>
                    </a-menu>
                    <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
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
                    <span slot="action" slot-scope="text, record">
                        <a v-if="record.cmbTransactionRecord && record.cmbTransactionRecord.fildat"
                            @click="downloadHuidan(record.cmbTransactionRecord.fildat)">查看回单</a>
                    </span>
                </a-table>
            </div>

            <tab-cmb-payment-transfer-record-modal ref="modalForm"
                @ok="modalFormOk"></tab-cmb-payment-transfer-record-modal>
        </a-card>
    </div>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import TabCmbPaymentTransferRecordModal from './modules/TabCmbPaymentTransferRecordModal'

export default {
    name: 'TabCmbPaymentTransferRecordList',
    mixins: [JeecgListMixin, mixinDevice],
    components: {
        TabCmbPaymentTransferRecordModal,
    },
    data() {
        return {
            activeParentTab: 'cmb',
            title: '招商银行转账记录列表',
            description: '招商银行转账记录管理页面',
            columns: [
                {
                    title: '转出账号',
                    align: "center",
                    dataIndex: 'dbtAcc',
                },
                {
                    title: '收方账号',
                    align: "center",
                    dataIndex: 'crtAcc',
                },
                {
                    title: '收方户名',
                    align: "center",
                    dataIndex: 'crtNam',
                    customRender: (text) => {
                        return text ? (
                            <a-tooltip title={text}>
                                <span style="display: inline-block; width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                    {text}
                                </span>
                            </a-tooltip>
                        ) : text
                    }
                },
                {
                    title: '收方开户行名称',
                    align: "center",
                    dataIndex: 'crtBnk',
                    customRender: (text) => {
                        return text ? (
                            <a-tooltip title={text}>
                                <span style="display: inline-block; width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                    {text}
                                </span>
                            </a-tooltip>
                        ) : text
                    }
                },
                {
                    title: '交易金额',
                    align: "center",
                    dataIndex: 'trsAmt',
                },
                {
                    title: '结算通道',
                    align: "center",
                    dataIndex: 'stlChn',
                    customRender: (text) => {
                        const map = {
                            'G': '普通',
                            'Q': '快速',
                            'R': '实时-超网',
                            'I': '智能路由'
                        }
                        return map[text] || text
                    }
                },
                {
                    title: '用途',
                    align: "center",
                    dataIndex: 'nusAge',
                    customRender: (text) => {
                        return text ? (
                            <a-tooltip title={text}>
                                <span style="display: inline-block; width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                    {text}
                                </span>
                            </a-tooltip>
                        ) : text
                    }
                },
                {
                    title: '请求状态',
                    align: "center",
                    dataIndex: 'reqSts',
                    customRender: (text) => {
                        const map = {
                            'AUT': '等待审批',
                            'NTE': '终审完毕',
                            'BNK': '银行处理中',
                            'WRF': '银行处理中',
                            'FIN': '完成',
                            'OPR': '数据接收中'
                        }
                        return map[text] || text
                    }
                },
                {
                    title: '业务处理结果',
                    align: "center",
                    dataIndex: 'rtnFlg',
                    customRender: (text, record) => {
                        if (record.reqSts !== 'FIN') {
                            return '-'
                        }
                        const map = {
                            'S': '成功',
                            'F': '失败',
                            'B': '退票',
                            'R': '否决',
                            'D': '过期',
                            'C': '撤消',
                            'U': '银行挂账'
                        }
                        return map[text] || text
                    }
                },
                {
                    title: '错误码',
                    align: "center",
                    dataIndex: 'errCod',
                },
                {
                    title: '错误文本',
                    align: "center",
                    dataIndex: 'errTxt',
                    customRender: (text) => {
                        return text ? (
                            <a-tooltip title={text}>
                                <span style="display: inline-block; width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                    {text}
                                </span>
                            </a-tooltip>
                        ) : text
                    }
                },
                {
                    title: '提示文本',
                    align: "center",
                    dataIndex: 'msgTxt',
                    customRender: (text) => {
                        return text ? (
                            <a-tooltip title={text}>
                                <span style="display: inline-block; width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                    {text}
                                </span>
                            </a-tooltip>
                        ) : text
                    }
                },
                {
                    title: '操作',
                    dataIndex: 'action',
                    align: "center",
                    fixed: "right",
                    width: 120,
                    scopedSlots: { customRender: 'action' }
                }
            ],
            url: {
                list: "/cmbPaymentTransferRecord/list",
                delete: "/cmbPaymentTransferRecord/delete",
                deleteBatch: "/cmbPaymentTransferRecord/deleteBatch",
                exportXlsUrl: "/cmbPaymentTransferRecord/exportXls",
                importExcelUrl: "/cmbPaymentTransferRecord/importExcel",
            },
            dictOptions: {},
            superFieldList: [],
            queryParam: {}
        }
    },
    created() {
        this.getSuperFieldList();
        this.queryParam.bankType = this.activeParentTab;
    },
    computed: {
        importExcelUrl: function () {
            return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
        },
    },
    methods: {
        handleParentTabChange(type) {
            this.queryParam.bankType = type;
            this.searchQuery()
        },
        searchReset() {
            this.queryParam = {
                bankType: this.queryParam.bankType,
                dbtAcc: null,
                crtAcc: null,
                crtNam: null,
            }
            this.searchQuery()
        },
        initDictConfig() {
        },
        getSuperFieldList() {
            let fieldList = [];
            fieldList.push({ type: 'string', value: 'dbtAcc', text: '转出账号', dictCode: '' })
            fieldList.push({ type: 'string', value: 'crtAcc', text: '收方账号', dictCode: '' })
            fieldList.push({ type: 'string', value: 'crtNam', text: '收方户名', dictCode: '' })
            fieldList.push({ type: 'string', value: 'crtBnk', text: '收方开户行名称', dictCode: '' })
            fieldList.push({ type: 'BigDecimal', value: 'trsAmt', text: '交易金额', dictCode: '' })
            fieldList.push({ type: 'string', value: 'stlChn', text: '结算通道', dictCode: '' })
            fieldList.push({ type: 'string', value: 'nusAge', text: '用途', dictCode: '' })
            fieldList.push({ type: 'string', value: 'reqSts', text: '请求状态', dictCode: '' })
            fieldList.push({ type: 'string', value: 'rtnFlg', text: '业务处理结果', dictCode: '' })
            fieldList.push({ type: 'string', value: 'errCod', text: '错误码', dictCode: '' })
            fieldList.push({ type: 'string', value: 'errTxt', text: '错误文本', dictCode: '' })
            fieldList.push({ type: 'string', value: 'msgTxt', text: '提示文本', dictCode: '' })
            this.superFieldList = fieldList
        },
        // 下载回单
        downloadHuidan(url) {
            if (!url) {
                this.$message.warning("暂无回单可下载");
                return;
            }
            // 打开新窗口下载
            const link = document.createElement('a');
            link.href = url;
            link.target = "_blank";
            link.download = ""; // 让浏览器自动命名
            link.click();
        }
    }
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>
