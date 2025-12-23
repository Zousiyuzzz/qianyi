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
                            <a-form-item label="创建日期">
                                <a-range-picker v-model:value="createTime" format="YYYY-MM-DD"
                                    value-format="YYYY-MM-DD" />
                            </a-form-item>
                        </a-col>
                        <!-- <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <a-form-item label="空值查询">
                                <a-select placeholder="请选择字段" v-model:value="queryParam.fieldNull" :allowClear="true">
                                    <a-select-option v-for="column in fieldNullList" :key="column.dataIndex"
                                        :value="column.dataIndex">
                                        {{ column.title }}
                                    </a-select-option>
                                </a-select>
                            </a-form-item>
                        </a-col> -->
                        <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <a-form-item label="变更类型">
                                <a-select placeholder="请选择" v-model:value="queryParam.changeType" :allowClear="true">
                                    <a-select-option value="1">增加</a-select-option>
                                    <a-select-option value="2">减少</a-select-option>
                                </a-select>
                            </a-form-item>
                        </a-col>
                        <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <a-form-item label="状态">
                                <a-select placeholder="请选择" v-model:value="queryParam.state" :allowClear="true">
                                    <a-select-option value="1">登记成功</a-select-option>
                                    <a-select-option value="2">退回成功</a-select-option>
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
                <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
                <a-button type="primary" icon="download" @click="handleExportXls('项目损失记录信息表')">导出</a-button>
                <!-- 高级查询区域 -->
                <j-super-query :fieldList="superFieldList" ref="superQueryModal"
                    @handleSuperQuery="handleSuperQuery"></j-super-query>
                <a-dropdown v-if="selectedRowKeys.length > 0">
                    <a-menu slot="overlay">
                        <a-menu-item key="1" @click="batchDel"><a-icon type="delete" />删除</a-menu-item>
                    </a-menu>
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

                    <span slot="action" slot-scope="text, record">
                        <a @click="handleGiveBack(record)" v-if="record.state == 1">退回</a>
                    </span>

                </a-table>
            </div>

            <tab-loss-record-modal ref="modalForm" @ok="modalFormOk"></tab-loss-record-modal>
        </a-card>
    </div>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { httpAction } from '@/api/manage'
import TabLossRecordModal from './modules/TabLossRecordModal'

export default {
    name: 'TabLossRecordList',
    mixins: [JeecgListMixin, mixinDevice],
    components: {
        TabLossRecordModal,
    },
    data() {
        return {
            fieldNullList: [
                {
                    title: '项目',
                    dataIndex: 'pro_id'
                },
                {
                    title: '资金性质',
                    dataIndex: 'funds_nature'
                },
                {
                    title: '损失金额',
                    dataIndex: 'loss_amount'
                }
            ],
            createTime: [],
            currentFundsNature: '1',
            description: '项目损失记录管理页面',
            // 表头
            columns: [
                {
                    title: '状态',
                    align: "center",
                    dataIndex: 'state',
                    customRender: (text) => {
                        let arr = [' ', '登记成功', '退回成功']
                        return arr[Number(text)] || text
                    },
                },
                {
                    title: '项目ID',
                    align: "center",
                    dataIndex: 'proId_unique_id'
                },
                {
                    title: '项目名称',
                    align: "center",
                    dataIndex: 'proId_pro_name'
                },

                {
                    title: '损失金额',
                    align: "center",
                    dataIndex: 'lossAmount'
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
                    title: '变更类型',
                    align: "center",
                    dataIndex: 'changeType',
                    customRender: (text) => {
                        if (text === '1') {
                            return '增加'
                        } else if (text === '2') {
                            return '减少'
                        } else {
                            return ''
                        }
                    },
                },

                {
                    title: '创建人',
                    align: "center",
                    dataIndex: 'createBy'
                },
                {
                    title: '创建日期',
                    align: "center",
                    dataIndex: 'createTime'
                },
                {
                    title: '备注',
                    align: "center",
                    dataIndex: 'remarks',
                    width: 100,
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
                    width: 147,
                    scopedSlots: { customRender: 'action' }
                }
            ],
            url: {
                list: "/projectLossRecord/list",
                delete: "/projectLossRecord/delete",
                deleteBatch: "/projectLossRecord/deleteBatch",
                exportXlsUrl: "/projectLossRecord/exportXls",
                importExcelUrl: "projectLossRecord/importExcel",
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
            fieldList.push({ type: 'number', value: 'lossAmount', text: '损失金额', dictCode: '' })
            fieldList.push({ type: 'string', value: 'fundsNature', text: '资金性质', dictCode: '' })
            fieldList.push({ type: 'string', value: 'changeType', text: '变更类型', dictCode: '' })
            fieldList.push({ type: 'string', value: 'state', text: '状态', dictCode: '' })

            fieldList.push({ type: 'string', value: 'createBy', text: '创建人', dictCode: '' })
            fieldList.push({ type: 'string', value: 'createTime', text: '创建日期', dictCode: '' })
            fieldList.push({ type: 'Text', value: 'remarks', text: '备注', dictCode: '' })
            this.superFieldList = fieldList
        },
        // 退回操作
        handleGiveBack(record) {
            this.$confirm({
                title: '确认退回',
                content: `确定要退回项目"${record.proId_pro_name || record.proId_unique_id}"的损失记录吗？`,
                onOk: () => {
                    httpAction('/projectLossRecord/giveBack', { id: record.id }, 'post').then((res) => {
                        if (res.success) {
                            this.$message.success('退回成功');
                            this.loadData();
                        } else {
                            this.$message.error(res.message || '退回失败');
                        }
                    }).catch(() => {
                        this.$message.error('退回失败');
                    });
                }
            });
        }

    }
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>
