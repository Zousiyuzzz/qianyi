<template>
    <div style="background-color: #fff;">
        <a-tabs default-active-key="KS" v-model="activeParentTab" @change="handleParentTabChange" tabPosition="top">
            <!-- <a-tab-pane key="DY" tab="巨量" :disabled="loading">
                <a-tabs default-active-key="DY-JLGG" v-model="activeChildTab.JL" @change="handleChildTabChange">
                    <a-tab-pane key="DY-JLGG" tab="巨量广告" :disabled="loading" :loading="loading" />
                    <a-tab-pane key="DY-JLQC" tab="巨量千川" :disabled="loading" />
                    <a-tab-pane key="DY-JLBDT" tab="巨量本地推" :disabled="loading" />
                    <a-tab-pane key="DY-JLXT" tab="巨量星图" :disabled="loading" />
                </a-tabs>
            </a-tab-pane>
            <a-tab-pane key="TX" tab="腾讯" :disabled="loading">
                <a-tabs default-active-key="TX-GDT" v-model="activeChildTab.TX" @change="handleChildTabChange">
                    <a-tab-pane key="TX-GDT" tab="广点通" :disabled="loading" />
                </a-tabs>
            </a-tab-pane> -->
            <a-tab-pane key="KS" tab="快手" :disabled="loading">
                <a-tabs default-active-key="KS-CLYQ" v-model="activeChildTab.KS" @change="handleChildTabChange">
                    <a-tab-pane key="KS-CLYQ" tab="磁力引擎" :disabled="loading" />
                    <a-tab-pane key="KS-CLJN" tab="磁力金牛" :disabled="loading" />
                    <a-tab-pane key="KS-DJK" tab="大健康" :disabled="loading" />
                    <!-- <a-tab-pane key="KS-CLJX" tab="磁力聚星" :disabled="loading" /> -->
                </a-tabs>
            </a-tab-pane>
        </a-tabs>

        <a-card :bordered="false">
            <!-- 查询区域 -->
            <div class="table-page-search-wrapper">
                <a-form layout="inline" @keyup.enter.native="handleSearch">
                    <a-row :gutter="24">
                        <a-col :md="6" :sm="12">
                            <a-form-item label="代理商ID">
                                <a-input v-model.number="queryParam.agentId" placeholder="请输入代理商ID" />
                            </a-form-item>
                        </a-col>
                        <a-col :md="6" :sm="12">
                            <a-form-item label="二级代理ID">
                                <a-input v-model.number="queryParam.secondaryAgentId" placeholder="请输入二级代理ID" />
                            </a-form-item>
                        </a-col>
                        <a-col :md="6" :sm="12">
                            <a-form-item label="二级代理名称">
                                <a-input v-model="queryParam.secondaryAgentName" placeholder="请输入二级代理名称" />
                            </a-form-item>
                        </a-col>
                        <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <a-form-item label="项目">
                                <JSearchSelectTag placeholder="请选择项目" v-model="queryParam.proId"
                                    dict="tab_projectManage,pro_name,id,del_flag = '0'" async allowClear />
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
                        <!-- <a-col :md="6" :sm="12">
                            <a-form-item label="状态">
                                <a-select v-model="queryParam.status" placeholder="请选择状态" allowClear>
                                    <a-select-option value="">全部</a-select-option>
                                    <a-select-option :value="1">启用</a-select-option>
                                    <a-select-option :value="0">禁用</a-select-option>
                                </a-select>
                            </a-form-item>
                        </a-col> -->
                        <a-col :md="6" :sm="8">
                            <span class="table-page-search-submitButtons">
                                <a-button type="primary" @click="handleSearch" icon="search">查询</a-button>
                                <a-button type="primary" @click="handleReset" icon="reload"
                                    style="margin-left: 8px">重置</a-button>
                            </span>
                        </a-col>
                    </a-row>
                </a-form>
            </div>
            <!-- 查询区域-END -->

            <!-- 操作按钮区域 -->
            <div class="table-operator">
                <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
                <a-button type="primary" icon="download" @click="selectExportFileds">导出</a-button>
                <a-dropdown v-if="selectedRowKeys.length > 0">
                    <a-menu slot="overlay">
                        <a-menu-item key="1" @click="batchDel"><a-icon type="delete" />删除</a-menu-item>
                    </a-menu>
                    <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
                </a-dropdown>
            </div>

            <!-- table区域-begin -->
            <div>
                <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;" v-if="selectedRowKeys.length > 0">
                    <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{
                        selectedRowKeys.length }}</a>项
                    <a style="margin-left: 24px" @click="onClearSelected">清空</a>
                </div>

                <a-table size="middle" :scroll="{ x: true }" bordered rowKey="id" :columns="columns"
                    :dataSource="itemList" :pagination="false" :loading="loading"
                    :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }">

                    <span slot="action" slot-scope="text, record, index">
                        <a @click="handleEdit(record)">编辑</a>
                        <a-divider type="vertical" />
                        <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                            <a>删除</a>
                        </a-popconfirm>
                    </span>
                </a-table>
                <a-pagination :current="pagination.current" :page-size="pagination.pageSize" :total="pagination.total"
                    @change="onPageChange" style="margin-top: 16px; text-align: right;" />
            </div>


        </a-card>

        <!-- 新增编辑弹窗 -->
        <sub-port-modal ref="modalForm" @ok="modalFormOk"></sub-port-modal>
    </div>
</template>

<script>
import { getSecondaryAgentInfoList, deleteSecondaryAgentInfo, deleteSecondaryAgentInfoBatch } from '@/api/api'
import { mapGetters, mapState } from 'vuex'
// 新增导出依赖
import * as XLSX from 'xlsx'
import SubPortModal from './modules/SubPortModal'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'


export default {
    name: 'CopyAccountList',
    components: {
        SubPortModal
    },
    mixins: [JeecgListMixin],
    data() {
        return {
            queryParam: {
                agentId: undefined,
                secondaryAgentId: undefined,
                secondaryAgentName: undefined,
                channelSign: 'KS-CLYQ'
            },
            activeParentTab: 'KS',
            activeChildTab: {
                JL: 'DY-JLGG',
                TX: 'TX-GDT',
                KS: 'KS-CLYQ',
                CJHC: 'CJHC'
            },
            itemList: [],
            loading: false,
            columns: [
                { title: '代理商ID', dataIndex: 'agentId', key: 'agentId', align: 'center' },
                { title: '代理商名称', dataIndex: 'agentName', key: 'agentName', align: 'center' },
                // { title: '项目ID', dataIndex: 'proId', key: 'proId', align: 'center' },
                { title: '项目名称', dataIndex: 'proName', key: 'proName', align: 'center' },
                {
                    title: '合作方式', align: "center", dataIndex: 'collaborationMode',
                    customRender: (text) => {
                        if (text) {
                            let arr = ['预付', '垫付', '服务费']
                            return arr[Number(text)] || text
                        } else {
                            return ''
                        }
                    },
                },
                { title: '二级代理ID', dataIndex: 'secondaryAgentId', key: 'secondaryAgentId', align: 'center' },
                { title: '二级代理名称', dataIndex: 'secondaryAgentName', key: 'secondaryAgentName', align: 'center' },
                { title: '渠道标识', dataIndex: 'channelName', key: 'channelName', align: 'center' },
                // { title: '返点模板ID', dataIndex: 'rebateTeptId', key: 'rebateTeptId', align: 'center' },
                { title: '返点模板', dataIndex: 'rebateTeptName', key: 'rebateTeptName', align: 'center' },
                // {
                //     title: '状态',
                //     dataIndex: 'status',
                //     key: 'status',
                //     align: 'center',
                //     customRender: (text) => text === 1 ? '启用' : text === 0 ? '禁用' : '-'
                // },
                { title: '操作', key: 'action', align: 'center', width: 150, scopedSlots: { customRender: 'action' } }
            ],
            pagination: {
                current: 1,
                pageSize: 10,
                total: 0
            },
            selectedRowKeys: [],
            url: {
                list: "/secondaryAgentInfo/list",
                delete: "/secondaryAgentInfo/delete",
                deleteBatch: "/secondaryAgentInfo/deleteBatch",
                exportXlsUrl: "/secondaryAgentInfo/exportXls",
                importExcelUrl: "secondaryAgentInfo/importExcel",
            }
        }
    },
    methods: {
        ...mapGetters(["userInfo"]),
        selectExportFileds() {
            this.handleExportXls('子端口信息')
            // this.$refs['AddAcountIds'].showModal(this.queryParam.channelSign);
        },
        handleSearch() {
            this.loading = true;
            getSecondaryAgentInfoList({
                ...this.queryParam,
                pageNo: this.pagination.current,
                pageSize: this.pagination.pageSize,
                column: 'createTime',
                order: 'desc',
                // createdBy: this.userInfo().id,
                channelSign: this.queryParam.channelSign
            }).then(res => {
                if (res && res.success) {
                    // 兼容不同返回结构
                    this.itemList = res.result && res.result.records ? res.result.records : (res.result || []);
                    // 更新总数以支持分页
                    if (res.result && typeof res.result.total === 'number') {
                        this.pagination.total = res.result.total;
                    }
                    if (res.result && typeof res.result.current === 'number') {
                        this.pagination.current = res.result.current;
                    }
                    if (res.result && typeof res.result.size === 'number') {
                        this.pagination.pageSize = res.result.size;
                    }
                } else {
                    this.itemList = [];
                    this.$message.error((res && res.message) || '查询失败');
                }
            }).catch(() => {
                this.itemList = [];
                this.$message.error('查询失败');
            }).finally(() => {
                this.loading = false;
            });
        },
        handleReset() {
            this.queryParam = {
                agentId: undefined,
                secondaryAgentId: undefined,
                secondaryAgentName: undefined,
                status: undefined,
                channelSign: this.queryParam.channelSign
            };
            this.handleSearch();
        },
        // 父级tab切换
        handleParentTabChange(activeKey) {
            this.activeParentTab = activeKey;
            // 获取当前父tab下的子tab activeKey
            const childTabKey = this.activeChildTab[activeKey];
            this.queryParam.channelSign = childTabKey;
            this.handleSearch();
        },
        // 子级tab切换
        handleChildTabChange(activeKey) {
            // 更新当前父tab下的子tab activeKey
            this.activeChildTab[this.activeParentTab] = activeKey;
            this.queryParam.channelSign = activeKey;
            this.handleSearch();
        },
        // 新增
        handleAdd() {
            this.$refs.modalForm.add(this.queryParam.channelSign);
        },
        // 编辑
        handleEdit(record) {
            this.$refs.modalForm.edit(record, this.queryParam.channelSign);
        },
        // 删除
        handleDelete(id) {
            this.$confirm({
                title: '确认删除',
                content: '确定要删除这条记录吗？',
                onOk: () => {
                    deleteSecondaryAgentInfo({ id: id }).then(res => {
                        if (res.success) {
                            this.$message.success('删除成功');
                            this.handleSearch();
                        } else {
                            this.$message.error(res.message || '删除失败');
                        }
                    }).catch(() => {
                        this.$message.error('删除失败');
                    });
                }
            });
        },
        // 弹窗确认回调
        modalFormOk() {
            this.handleSearch();
        },
        // 批量删除
        batchDel() {
            if (!this.selectedRowKeys.length) {
                this.$message.warning('请选择需要删除的数据');
                return;
            }
            this.$confirm({
                title: '确认删除',
                content: `确定要删除选中的 ${this.selectedRowKeys.length} 条记录吗？`,
                onOk: () => {
                    deleteSecondaryAgentInfoBatch({ ids: this.selectedRowKeys.join(',') }).then(res => {
                        if (res.success) {
                            this.$message.success('批量删除成功');
                            this.selectedRowKeys = [];
                            this.handleSearch();
                        } else {
                            this.$message.error(res.message || '批量删除失败');
                        }
                    }).catch(() => {
                        this.$message.error('批量删除失败');
                    });
                }
            });
        },
        // 选择变化
        onSelectChange(selectedRowKeys) {
            this.selectedRowKeys = selectedRowKeys;
        },
        // 清空选择
        onClearSelected() {
            this.selectedRowKeys = [];
        },
        onPageChange(page) {
            this.pagination.current = page;
            this.handleSearch();
        }
    },
    mounted() {
        this.handleSearch();
    }
}
</script>

<style scoped>
@import '~@/assets/less/common.less';

.table-operator {
    margin-bottom: 18px;
}

.table-page-search-wrapper {
    margin-bottom: 18px;
}

/* 让禁用的tab看起来和正常状态一样 */
:deep(.ant-tabs-tab.ant-tabs-tab-disabled) {
    color: rgba(0, 0, 0, 0.65) !important;
    cursor: pointer !important;
}

:deep(.ant-tabs-tab.ant-tabs-tab-disabled:hover) {
    color: #1890ff !important;
}

:deep(.ant-tabs-tab.ant-tabs-tab-disabled.ant-tabs-tab-active) {
    color: #1890ff !important;
}
</style>