<template>
    <div style="background-color: #fff;">
        <a-tabs default-active-key="KS" v-model="activeParentTab" @change="handleParentTabChange" tabPosition="top">
            <a-tab-pane key="KS" tab="快手" :disabled="loading">
                <a-tabs default-active-key="KS-CLYQ" v-model="activeChildTab.KS" @change="handleChildTabChange">
                    <a-tab-pane key="KS-CLYQ" tab="磁力引擎" :disabled="loading">
                        <!-- 磁力引擎 -->
                    </a-tab-pane>
                    <a-tab-pane key="KS-CLJN" tab="磁力金牛" :disabled="loading">
                        <!-- 磁力金牛 -->
                    </a-tab-pane>
                    <a-tab-pane key="KS-DJK" tab="大健康" :disabled="loading">
                        <!-- 大健康 -->
                    </a-tab-pane>
                    <a-tab-pane key="KS-CLJX" tab="磁力聚星" :disabled="loading">
                        <!-- 磁力聚星 -->
                    </a-tab-pane>
                </a-tabs>
            </a-tab-pane>
            <a-tab-pane key="DY" tab="巨量" :disabled="loading">
                <a-tabs default-active-key="DY-JLGG" v-model="activeChildTab.JL" @change="handleChildTabChange">
                    <a-tab-pane key="DY-JLGG" tab="巨量广告" :disabled="loading" :loading="loading">
                        <!-- 巨量广告 -->
                    </a-tab-pane>
                    <a-tab-pane key="DY-JLQC" tab="巨量千川" :disabled="loading">
                        <!-- 巨量前川 -->
                    </a-tab-pane>
                    <a-tab-pane key="DY-JLBDT" tab="巨量本地推" :disabled="loading">
                        <!-- 巨量本地推 -->
                    </a-tab-pane>
                    <a-tab-pane key="DY-JLXT" tab="巨量星图" :disabled="loading">
                        <!-- 巨量星图 -->
                    </a-tab-pane>
                </a-tabs>
            </a-tab-pane>
            <a-tab-pane key="TX" tab="腾讯" :disabled="loading">
                <a-tabs default-active-key="TX-GDT" v-model="activeChildTab.TX" @change="handleChildTabChange">
                    <a-tab-pane key="TX-GDT" tab="广点通" :disabled="loading">
                        <!-- 广点通 -->
                    </a-tab-pane>
                </a-tabs>
            </a-tab-pane>
            <a-tab-pane key="XHS" tab="小红书" :disabled="loading">
                <a-tabs default-active-key="XHS" v-model="activeChildTab.XHS" @change="handleChildTabChange">
                    <a-tab-pane key="XHS" tab="小红书" :disabled="loading">
                    </a-tab-pane>
                </a-tabs>
            </a-tab-pane>
            <a-tab-pane key="CJHC" tab="超级汇川" :disabled="loading">
                <a-tabs default-active-key="CJHC" v-model="activeChildTab.CJHC" @change="handleChildTabChange">
                    <a-tab-pane key="CJHC" tab="超级汇川" :disabled="loading">
                    </a-tab-pane>
                </a-tabs>
            </a-tab-pane>
            <a-tab-pane key="BLBL" tab="哔哩哔哩" :disabled="loading">
                <a-tabs default-active-key="BLBL" v-model="activeChildTab.BLBL" @change="handleChildTabChange">
                    <a-tab-pane key="BLBL" tab="哔哩哔哩" :disabled="loading">
                    </a-tab-pane>
                </a-tabs>
            </a-tab-pane>
        </a-tabs>

        <a-card :bordered="false">
            <!-- 查询区域 -->
            <div class="table-page-search-wrapper">
                <a-form layout="inline" @keyup.enter.native="searchQuery">
                    <a-row :gutter="24">
                        <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <a-form-item label="账户主体名称">
                                <a-input placeholder="请输入账户主体名称" v-model="queryParam.subjectName">
                                    <!-- <a-tooltip slot="suffix">
                                        <a-icon type="heat-map" class="super-search-icon" ref="super-search-icon"
                                            @click="setSuperParams" />
                                    </a-tooltip> -->
                                </a-input>
                            </a-form-item>
                        </a-col>
                        <!-- <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <a-form-item label="渠道名称">
                                <a-input placeholder="请输入渠道名称" v-model="queryParam.channelName"></a-input>
                            </a-form-item>
                        </a-col> -->
                        <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <a-form-item label="项目ID">
                                <a-input placeholder="项目ID" v-model="queryParam.uniqueId"></a-input>
                            </a-form-item>
                        </a-col>
                        <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <a-form-item label="项目名称">
                                <a-input placeholder="请输入项目名称" v-model="queryParam.proName"></a-input>
                            </a-form-item>
                        </a-col>

                        <template v-if="toggleSearchStatus">

                            <a-col :xl="6" :lg="7" :md="8" :sm="24">
                                <a-form-item label="合作方式">
                                    <a-select placeholder="请选择" v-model="queryParam.collaborationMode"
                                        :allowClear="true">
                                        <a-select-option value="0">预付</a-select-option>
                                        <a-select-option value="1">垫付</a-select-option>
                                        <a-select-option value="3">服务费</a-select-option>
                                    </a-select>
                                </a-form-item>
                            </a-col>

                            <a-col :xl="6" :lg="7" :md="8" :sm="24">
                                <a-form-model-item label="返点政策模板" :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }"
                                    prop="rebateTeptId">
                                    <!-- and customer_id='${model.projectId}'-->
                                    <JSearchSelectTag placeholder="请选择返点模板" v-model="queryParam.rebateTeptId"
                                        :dict="`tab_customer_rebate_template,rebate_name,id,del_flag = '0'`" async
                                        allowClear />
                                </a-form-model-item>
                            </a-col>

                            <a-col :xl="6" :lg="7" :md="8" :sm="24">
                                <a-form-item label="更新人">
                                    <a-input placeholder="请输入更新人" v-model="queryParam.updateBy"></a-input>
                                </a-form-item>
                            </a-col>
                        </template>
                        <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
                                <a-button type="primary" @click="searchQuery" icon="search"
                                    style="margin-left: 8px">查询</a-button>
                                <a-button type="primary" @click="searchReset" icon="reload"
                                    style="margin-left: 8px">重置</a-button>
                                <a @click="handleToggleSearch" style="margin-left: 8px">
                                    {{ toggleSearchStatus ? '收起' : '展开' }}
                                    <a-icon :type="toggleSearchStatus ? 'up' : 'down'" />
                                </a>
                            </span>
                        </a-col>
                    </a-row>
                </a-form>
            </div>
            <!-- 查询区域-END -->

            <!-- 操作按钮区域 -->
            <div class="table-operator">
                <!-- <a-button type="primary" icon="plus" @click="handleAdd">新增主体</a-button> -->
                <a-button type="primary" icon="sync" @click="handleSyncSubject">更新主体</a-button>
                <!-- <a-button type="primary" icon="download" @click="handleExportXls('账户主体信息')">导出</a-button> -->
                <!-- <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader"
                    :action="importExcelUrl" @change="handleImportExcel">
                    <a-button type="primary" icon="import">导入</a-button>
                </a-upload> -->
                <!-- 高级查询区域 -->
                <j-super-query :fieldList="superFieldList" ref="superQueryModal"
                    @handleSuperQuery="handleSuperQuery"></j-super-query>
                <!-- <a-dropdown v-if="selectedRowKeys.length > 0">
                    <a-menu slot="overlay">
                        <a-menu-item key="1" @click="batchDel"><a-icon type="delete" />批量删除</a-menu-item>
                    </a-menu>
                    <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
                </a-dropdown> -->
            </div>

            <!-- table区域-begin -->
            <div>
                <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
                    <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{
                        selectedRowKeys.length }}</a>项
                    <a style="margin-left: 24px" @click="onClearSelected">清空</a>
                </div>

                <a-table ref="table" size="middle" :scroll="{ x: true }" bordered rowKey="id" :columns="filteredColumns"
                    :dataSource="dataSource" :pagination="ipagination" :loading="loading"
                    :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
                    class="j-table-force-nowrap" @change="handleTableChange">



                    <span slot="action" slot-scope="text, record">
                        <a @click="handleEdit(record)">编辑</a>
                        <!-- <a-divider type="vertical" /> -->
                        <!-- <a-dropdown>
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
                        </a-dropdown> -->
                    </span>

                </a-table>
            </div>

            <AccountSubjectModal ref="modalForm" @ok="modalFormOk"></AccountSubjectModal>
            <!-- <super-search ref="SuperSearch" @ok="superSearchOk"></super-search> -->
        </a-card>
    </div>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'

import AccountSubjectModal from './modules/AccountSubjectModal'
// import superSearch from './components/superSearch.vue'

export default {
    name: 'AccountSubjectList',
    mixins: [JeecgListMixin, mixinDevice],
    components: {
        AccountSubjectModal,
        // superSearch
    },
    data() {
        return {

            queryParam: {
                channelSign: 'KS-CLYQ'
            },
            activeParentTab: 'KS',
            activeChildTab: {
                JL: 'DY-JLGG',
                TX: 'TX-GDT',
                KS: 'KS-CLYQ',
                XHS: 'XHS',
                CJHC: 'CJHC',
                BLBL: 'BLBL'
            },
            description: '账户主体管理页面',
            columns: [

                {
                    title: '账户主体名称',
                    align: "center",
                    dataIndex: 'subjectName',
                    query: ["KS", "DY", "TX", "XHS", "CJHC", "BLBL"]
                },
                // {
                //     title: '渠道名称',
                //     align: "center",
                //     dataIndex: 'channelName',
                //     query: ["KS", "DY", "TX"]
                // },
                // {
                //     title: '平台标识',
                //     align: "center",
                //     dataIndex: 'channelPlatform',
                //     query: ["KS", "DY", "TX"]
                // },
                // {
                //     title: '渠道标识',
                //     align: "center",
                //     dataIndex: 'channelSign',
                //     query: ["KS", "DY", "TX"]
                // },
                {
                    title: '项目名称',
                    align: "center",
                    dataIndex: 'proName',
                    query: ["KS", "DY", "TX", "XHS", "CJHC", "BLBL"]
                },
                {
                    title: '项目ID',
                    align: "center",
                    dataIndex: 'uniqueId',
                    query: ["KS", "DY", "TX", "XHS", "CJHC", "BLBL"]
                },
                {
                    title: '合作方式',
                    align: "center",
                    dataIndex: 'collaborationMode',
                    customRender: (text) => {
                        if (text === '0') {
                            return '预付'
                        } else if (text === '1') {
                            return '垫付'
                        } else if (text === '3') {
                            return '服务费'
                        } else {
                            return text
                        }
                    },
                    query: ["KS", "DY", "TX", "XHS", "CJHC", "BLBL"]
                },
                {
                    title: '返点模板名称',
                    align: "center",
                    dataIndex: 'rebateTeptName',
                    query: ["KS", "DY", "TX", "XHS", "CJHC", "BLBL"]
                },
                // {
                //     title: '创建人',
                //     align: "center",
                //     dataIndex: 'createBy',
                //     query: ["KS", "DY", "TX"]
                // },
                // {
                //     title: '创建日期',
                //     align: "center",
                //     dataIndex: 'createTime',
                //     query: ["KS", "DY", "TX"]
                // },
                {
                    title: '更新人',
                    align: "center",
                    dataIndex: 'updateBy',
                    query: ["KS", "DY", "TX", "XHS", "CJHC", "BLBL"]
                },
                {
                    title: '更新日期',
                    align: "center",
                    dataIndex: 'updateTime',
                    query: ["KS", "DY", "TX", "XHS", "CJHC", "BLBL"]
                },
                {
                    title: '操作',
                    dataIndex: 'action',
                    align: "center",
                    fixed: "right",
                    width: 147,
                    scopedSlots: { customRender: 'action' },
                    query: ["KS", "DY", "TX", "XHS", "CJHC", "BLBL"]
                }
            ],
            url: {
                list: "/accountSubject/list",
                delete: "/accountSubject/delete",
                deleteBatch: "/accountSubject/deleteBatch",
                exportXlsUrl: "/accountSubject/exportXls",
                importExcelUrl: "accountSubject/importExcel",
            },

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
        filteredColumns() {
            return this.columns.filter(column => {
                if (!column.query) return true;
                return column.query.includes(this.activeParentTab);
            });
        }
    },
    methods: {
        setSuperParams() {
            // this.$refs['SuperSearch'].showModal()
        },
        // superSearchOk(superQueryParams, superQueryMatchType) {
        //     if (superQueryParams && superQueryParams.length > 0) {
        //         if (this.$refs['super-search-icon'] && this.$refs['super-search-icon'].$el) {
        //             this.$refs['super-search-icon'].$el.style.color = '#1890ff'
        //         }
        //     } else {
        //         if (this.$refs['super-search-icon'] && this.$refs['super-search-icon'].$el) {
        //             this.$refs['super-search-icon'].$el.style.color = 'rgba(0,0,0,.45)'
        //         }
        //     }
        //     this.handleSuperQuerytwo(superQueryParams)
        // },
        searchReset() {
            // 保留 channelSign 参数
            const channelSign = this.queryParam.channelSign;
            this.queryParam = { channelSign };
            // 重置图标颜色
            if (this.$refs['super-search-icon'] && this.$refs['super-search-icon'].$el) {
                this.$refs['super-search-icon'].$el.style.color = 'rgba(0,0,0,.45)'
            }
            // 重置超级查询参数
            this.superQueryParams = ''
            this.superQueryFlag = false
            // 清除 superSearch 组件中的 lastDataList 数据
            if (this.$refs['SuperSearch']) {
                this.$refs['SuperSearch'].clearLastDataList()
            }
            this.loadData(1);
        },


        // 父级tab切换
        handleParentTabChange(activeKey) {
            this.activeParentTab = activeKey;
            // 获取当前父tab下的子tab activeKey
            let childTabKey;
            if (activeKey === 'KS') {
                childTabKey = this.activeChildTab.KS;
            } else if (activeKey === 'DY') {
                childTabKey = this.activeChildTab.JL;
            } else if (activeKey === 'TX') {
                childTabKey = this.activeChildTab.TX;
            } else if (activeKey === 'XHS') {
                childTabKey = this.activeChildTab.XHS;
            } else if (activeKey === 'CJHC') {
                childTabKey = this.activeChildTab.CJHC;
            } else if (activeKey === 'BLBL') {
                childTabKey = this.activeChildTab.BLBL;
            }
            this.queryParam.channelSign = childTabKey
            this.searchQuery()
        },
        // 子级tab切换
        handleChildTabChange(activeKey) {
            // 根据当前父tab更新对应的子tab activeKey
            if (this.activeParentTab === 'KS') {
                this.activeChildTab.KS = activeKey;
            } else if (this.activeParentTab === 'DY') {
                this.activeChildTab.JL = activeKey;
            } else if (this.activeParentTab === 'TX') {
                this.activeChildTab.TX = activeKey;
            } else if (this.activeParentTab === 'XHS') {
                this.activeChildTab.XHS = activeKey;
            } else if (this.activeParentTab === 'CJHC') {
                this.activeChildTab.CJHC = activeKey;
            } else if (this.activeParentTab === 'BLBL') {
                this.activeChildTab.BLBL = activeKey;
            }
            this.queryParam.channelSign = activeKey
            this.searchQuery()
        },

        getSuperFieldList() {
            let fieldList = [];
            fieldList.push({ type: 'string', value: 'subjectName', text: '账户主体名称', dictCode: '' })
            fieldList.push({ type: 'string', value: 'channelName', text: '渠道名称', dictCode: '' })
            fieldList.push({ type: 'string', value: 'channelPlatform', text: '平台标识', dictCode: '' })
            fieldList.push({ type: 'string', value: 'channelSign', text: '渠道标识', dictCode: '' })
            fieldList.push({ type: 'string', value: 'proName', text: '项目名称', dictCode: '' })
            fieldList.push({ type: 'string', value: 'collaborationMode', text: '合作方式', dictCode: '' })
            fieldList.push({ type: 'string', value: 'rebateTeptName', text: '返点模板名称', dictCode: '' })
            fieldList.push({ type: 'string', value: 'uniqueId', text: '项目唯一标识', dictCode: '' })
            fieldList.push({ type: 'string', value: 'createBy', text: '创建人', dictCode: '' })
            fieldList.push({ type: 'string', value: 'updateBy', text: '更新人', dictCode: '' })
            this.superFieldList = fieldList
        },

        // 新增主体
        handleAdd() {
            this.$refs.modalForm.add();
        },
        // 编辑主体
        handleEdit(record) {
            this.$refs.modalForm.edit(record);
        },
        // 查看详情
        handleDetail(record) {
            this.$refs.modalForm.edit(record);
        },
        // 更新主体
        handleSyncSubject() {
            this.$confirm({
                title: '确认更新',
                content: '确定要更新主体信息吗？',
                onOk: () => {
                    this.loading = true;
                    this.$http.get('/accountSubject/syncSubject').then(res => {
                        if (res.success) {
                            this.$message.success('更新主体成功');
                            // 刷新列表
                            this.loadData(1);
                        } else {
                            this.$message.error(res.message || '更新主体失败');
                        }
                    }).catch(err => {
                        this.$message.error('更新主体失败：' + err.message);
                    }).finally(() => {
                        this.loading = false;
                    });
                }
            });
        }
    },
}
</script>

<style scoped>
@import '~@assets/less/common.less';

.super-search-icon {
    color: rgba(0, 0, 0, .45);
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
