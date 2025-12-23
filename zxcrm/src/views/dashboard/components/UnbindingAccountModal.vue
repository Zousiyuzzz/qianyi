<template>
    <a-modal title="未绑定项目账户列表" :width="1600" :visible="visible" :destroyOnClose="true" @ok="handleOk"
        @cancel="handleCancel" @afterClose="resetData">
        <div style="background-color: #fff;">
            <a-tabs default-active-key="DY" v-model="activeParentTab" @change="handleParentTabChange" tabPosition="top">
                <a-tab-pane key="DY" tab="巨量">
                    <a-tabs default-active-key="DY-JLGG" v-model="activeChildTab.JL" @change="handleChildTabChange">
                        <a-tab-pane key="DY-JLGG" tab="巨量广告"></a-tab-pane>
                        <a-tab-pane key="DY-JLQC" tab="巨量千川"></a-tab-pane>
                        <a-tab-pane key="DY-JLBDT" tab="巨量本地推"></a-tab-pane>
                        <a-tab-pane key="DY-JLXT" tab="巨量星图"></a-tab-pane>
                    </a-tabs>
                </a-tab-pane>
                <a-tab-pane key="TX" tab="腾讯">
                    <a-tabs default-active-key="TX-GDT" v-model="activeChildTab.TX" @change="handleChildTabChange">
                        <a-tab-pane key="TX-GDT" tab="广点通"></a-tab-pane>
                    </a-tabs>
                </a-tab-pane>
                <a-tab-pane key="KS" tab="快手">
                    <a-tabs default-active-key="KS-CLYQ" v-model="activeChildTab.KS" @change="handleChildTabChange">
                        <a-tab-pane key="KS-CLYQ" tab="磁力引擎"></a-tab-pane>
                        <a-tab-pane key="KS-CLJN" tab="磁力金牛"></a-tab-pane>
                        <a-tab-pane key="KS-DJK" tab="大健康"></a-tab-pane>
                        <a-tab-pane key="KS-CLJX" tab="磁力聚星"></a-tab-pane>
                    </a-tabs>
                </a-tab-pane>
                <a-tab-pane key="CJHC" tab="超级汇川">
                    <a-tabs default-active-key="CJHC" v-model="activeChildTab.CJHC" @change="handleChildTabChange">
                        <a-tab-pane key="CJHC" tab="超级汇川"></a-tab-pane>
                    </a-tabs>
                </a-tab-pane>
            </a-tabs>

            <a-card :bordered="false">
                <!-- 查询区域 -->
                <div class="table-page-search-wrapper">
                    <a-form layout="inline" @keyup.enter.native="searchQuery">
                        <a-row :gutter="24">
                            <a-col :xl="6" :lg="7" :md="8" :sm="24">
                                <a-form-item label="广告主ID">
                                    <a-input placeholder="请输入广告主ID" v-model="queryParam.accountId"></a-input>
                                </a-form-item>
                            </a-col>
                            <a-col :xl="6" :lg="7" :md="8" :sm="24">
                                <a-form-item label="是否绑定项目">
                                    <a-select v-model="queryParam.isBinding" placeholder="请选择是否绑定项目">
                                        <a-select-option value="">请选择</a-select-option>
                                        <a-select-option :value="1">未绑定</a-select-option>
                                        <a-select-option :value="0">已绑定</a-select-option>
                                    </a-select>
                                </a-form-item>
                            </a-col>
                            <a-col :xl="6" :lg="7" :md="8" :sm="24">
                                <a-form-item label="账户主体">
                                    <a-input placeholder="请输入账户主体" v-model="queryParam.corporationName"></a-input>
                                </a-form-item>
                            </a-col>
                            <a-col :xl="6" :lg="7" :md="8" :sm="24">
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
                        <template v-if="toggleSearchStatus">
                            <a-row :gutter="24">
                                <a-col :xl="6" :lg="7" :md="8" :sm="24">
                                    <a-form-item label="快手ID">
                                        <a-input placeholder="请输入快手ID" v-model="queryParam.userId"></a-input>
                                    </a-form-item>
                                </a-col>
                                <a-col :xl="6" :lg="7" :md="8" :sm="24">
                                    <a-form-item label="账户类型">
                                        <a-input placeholder="请输入账户类型" v-model="queryParam.ucType"></a-input>
                                    </a-form-item>
                                </a-col>
                                <a-col :xl="6" :lg="7" :md="8" :sm="24">
                                    <a-form-item label="付款类型">
                                        <a-input placeholder="请输入付款类型" v-model="queryParam.paymentType"></a-input>
                                    </a-form-item>
                                </a-col>
                                <a-col :xl="6" :lg="7" :md="8" :sm="24">
                                    <a-form-item label="账户昵称">
                                        <a-input placeholder="请输入账户昵称" v-model="queryParam.accountName"></a-input>
                                    </a-form-item>
                                </a-col>
                                <a-col :xl="6" :lg="7" :md="8" :sm="24">
                                    <a-form-item label="产品名称">
                                        <a-input placeholder="请输入产品名称" v-model="queryParam.productName"></a-input>
                                    </a-form-item>
                                </a-col>
                                <a-col :xl="6" :lg="7" :md="8" :sm="24">
                                    <a-form-item label="一级行业">
                                        <a-input placeholder="请输入一级行业" v-model="queryParam.industry"></a-input>
                                    </a-form-item>
                                </a-col>
                                <a-col :xl="6" :lg="7" :md="8" :sm="24">
                                    <a-form-item label="二级行业">
                                        <a-input placeholder="请输入二级行业" v-model="queryParam.secondIndustry"></a-input>
                                    </a-form-item>
                                </a-col>
                            </a-row>
                        </template>
                    </a-form>
                </div>

                <!-- 操作按钮区域 -->
                <div class="table-operator">
                    <!-- <a-button type="primary" icon="download" @click="handleExportXls('广告主信息')">导出</a-button> -->
                    <a-dropdown v-if="selectedRowKeys.length > 0">
                        <a-menu slot="overlay">
                            <a-menu-item key="1" @click="batchBindingProject(queryParam.channelSign)">
                                <a-icon type="link" />批量绑定项目
                            </a-menu-item>
                        </a-menu>
                        <a-button style="margin-left: 8px">批量操作 <a-icon type="down" /></a-button>
                    </a-dropdown>
                </div>

                <!-- table区域 -->
                <div>
                    <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
                        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{
                            selectedRowKeys.length }}</a>项
                        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
                    </div>

                    <a-table ref="table" size="middle" :scroll="{ x: true }" bordered rowKey="id"
                        :columns="filteredColumns" :dataSource="dataSource" :pagination="{
                            showTotal: (total) => `共 ${total} 条`,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            current: ipagination.current,
                            pageSize: ipagination.pageSize,
                            total: ipagination.total,
                            showSizeChanger: true,
                            pageSizeOptions: ['10', '20', '30', '40'],
                            onChange: (page, pageSize) => {
                                this.ipagination.current = page;
                                this.ipagination.pageSize = pageSize;
                                this.loadData();
                            },
                            onShowSizeChange: (current, size) => {
                                this.ipagination.current = 1;
                                this.ipagination.pageSize = size;
                                this.loadData();
                            }
                        }" :loading="loading"
                        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
                        class="j-table-force-nowrap" @change="handleTableChange">
                    </a-table>
                </div>
            </a-card>
        </div>
        <binding-dia ref="BindingDia" @ok="modalFormOk"></binding-dia>
        <tab-accountinfo-modal ref="modalForm" @ok="modalFormOk"></tab-accountinfo-modal>
    </a-modal>
</template>

<script>
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import bindingDia from '@/views/accountids/bindingDia.vue'
import TabAccountinfoModal from '@/views/accountids/modules/TabAccountinfoModal'

export default {
    name: 'UnbindingAccountModal',
    mixins: [JeecgListMixin, mixinDevice],
    components: {
        bindingDia,
        TabAccountinfoModal
    },
    data() {
        return {
            visible: false,
            toggleSearchStatus: false,
            queryParam: {
                channelSign: 'DY-JLGG',
                isBinding: 1, // 默认查询未绑定的
                userId: '',
                ucType: '',
                paymentType: '',
                accountName: '',
                productName: '',
                industry: '',
                secondIndustry: '',
                corporationName: '',
                channelName: '',
                isHaveData: 0
            },
            activeParentTab: 'DY',
            activeChildTab: {
                JL: 'DY-JLGG',
                TX: 'TX-GDT',
                KS: 'KS-CLYQ',
                CJHC: 'CJHC'
            },
            description: '未绑定项目账户列表',
            columns: [
                {
                    title: '广告主ID',
                    align: "center",
                    dataIndex: 'accountId',
                    query: ["KS", "DY", "TX", "XHS", "CJHC", "BLBL"]
                },
                // {
                //     title: '账户昵称',
                //     align: "center",
                //     dataIndex: 'accountName',
                //     query: ["KS", "DY", "XHS", "CJHC", "BLBL"]
                // },
                // {
                //     title: '渠道名称',
                //     align: "center",
                //     dataIndex: 'channelName',
                //     query: ["KS", "DY", "TX"]
                // },
                {
                    title: '账户主体',
                    align: "center",
                    dataIndex: 'corporation_name',
                    query: ["KS", "DY", "TX", "XHS", "CJHC", "BLBL"]
                },
                {
                    title: '代理商ID',
                    align: "center",
                    dataIndex: 'agentId',
                    query: ["TX", "XHS", "CJHC", "BLBL"]
                },
                {
                    title: '账户主体',
                    align: "center",
                    dataIndex: 'corporationName',
                    query: ["KS", "DY", "TX", "XHS", "CJHC", "BLBL"]
                },
                {
                    title: '一级行业',
                    align: "center",
                    dataIndex: 'industry',
                    query: ["KS", "DY", "TX", "XHS", "CJHC", "BLBL"]
                },
                // {
                //     title: '二级行业',
                //     align: "center",
                //     dataIndex: 'secondIndustry',
                //     query: ["KS", "DY", "TX", "XHS", "CJHC", "BLBL"]
                // },
                {
                    title: '创建账号时间',
                    align: "center",
                    dataIndex: 'createDate',
                    query: ["KS", "DY", "XHS", "CJHC", "BLBL"]
                },
                {
                    title: '媒体产品名称',
                    align: "center",
                    dataIndex: 'productName',
                    query: ["KS", "TX", "XHS", "CJHC", "BLBL"]
                },
                {
                    title: '返点政策模板',
                    align: "center",
                    query: ["KS", "TX", "DY", "XHS", "CJHC", "BLBL"],
                    dataIndex: 'rebateTeptId',
                    customRender: function (t, r) {
                        return r.rebateTeptName
                    },
                },
                {
                    title: '项目名称',
                    align: "center",
                    dataIndex: 'proId_pro_name',
                    query: ["KS", "DY", "TX", "XHS", "CJHC", "BLBL"]
                },
                {
                    title: '合作方式',
                    align: "center",
                    dataIndex: 'proId_collaboration_mode',
                    customRender: (text) => {
                        if (text) {
                            let arr = ['预付', '垫付', '服务费']
                            return arr[Number(text)] || text
                        } else {
                            return ''
                        }
                    },
                    query: ["KS", "DY", "TX", "XHS", "CJHC", "BLBL"]
                },
            ],
            url: {
                list: {
                    url: "/accountinfo/list",
                    method: "post"
                },
                exportXlsUrl: "/accountinfo/exportXls"
            }
        }
    },
    computed: {
        filteredColumns() {
            return this.columns.filter(column => {
                if (!column.query) return true;
                return column.query.includes(this.activeParentTab);
            });
        }
    },
    methods: {
        show() {
            this.visible = true;
            // 每次打开弹窗都默认巨量-巨量广告
            this.activeParentTab = 'DY';
            this.activeChildTab.JL = 'DY-JLGG';
            this.queryParam.channelSign = 'DY-JLGG';
            this.resetData();
            this.searchQuery();
        },
        handleOk() {
            this.visible = false;
            this.resetData();
        },
        handleCancel() {
            this.visible = false;
            this.resetData();
        },
        resetData() {
            // 重置查询参数
            this.queryParam = {
                channelSign: 'DY-JLGG',
                isBinding: 1,
                userId: '',
                ucType: '',
                paymentType: '',
                accountName: '',
                productName: '',
                industry: '',
                secondIndustry: '',
                corporationName: '',
                channelName: '',
                isHaveData: 0
            };
            // 重置表格数据
            this.dataSource = [];
            // 重置选中状态
            this.selectedRowKeys = [];
            // 重置分页
            this.ipagination = {
                current: 1,
                pageSize: 10,
                total: 0
            };
            // 重置展开状态
            this.toggleSearchStatus = false;
        },
        //批量绑定项目
        batchBindingProject(channelSign) {
            if (this.selectedRowKeys.length <= 0) {
                this.$message.warning('请选择一条记录！');
                return false;
            } else {
                const selectedRows = this.dataSource.filter(item => this.selectedRowKeys.includes(item.id));
                this.$refs.BindingDia.showModal(selectedRows, channelSign);
            }
        },
        // 父级tab切换
        handleParentTabChange(activeKey) {
            this.activeParentTab = activeKey;
            const childTabKey = this.activeChildTab[activeKey];
            this.queryParam.channelSign = childTabKey;
            this.searchQuery();
        },
        // 子级tab切换
        handleChildTabChange(activeKey) {
            this.activeChildTab[this.activeParentTab] = activeKey;
            this.queryParam.channelSign = activeKey;
            this.searchQuery();
        },
        handleToggleSearch() {
            this.toggleSearchStatus = !this.toggleSearchStatus;
        },
        searchReset() {
            this.queryParam = {
                channelSign: this.queryParam.channelSign, // 保留 channelSign 字段
                isHaveData: 0,
                isBinding: 1
            }
            this.loadData(1);
        },
        handleAdd() {
            this.$refs.modalForm.add();
            this.$refs.modalForm.title = "新增产品";
        },
    }
}
</script>

<style scoped>
@import '~@assets/less/common.less';
</style>