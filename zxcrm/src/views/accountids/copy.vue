<template>
    <div style="background-color: #fff;">
        <a-tabs default-active-key="DY" v-model="activeParentTab" @change="handleParentTabChange" tabPosition="top">
            <a-tab-pane key="DY" tab="巨量" :disabled="loading">
                <a-tabs default-active-key="DY-JLGG" v-model="activeChildTab.JL" @change="handleChildTabChange">
                    <a-tab-pane key="DY-JLGG" tab="巨量广告" :disabled="loading" :loading="loading">
                        <!-- 巨量广告 -->
                    </a-tab-pane>
                    <!-- <a-tab-pane key="DY-JLQC" tab="巨量千川" :disabled="loading"/>
                    <a-tab-pane key="DY-JLBDT" tab="巨量本地推" :disabled="loading"/>
                    <a-tab-pane key="DY-JLXT" tab="巨量星图" :disabled="loading" /> -->
                </a-tabs>
            </a-tab-pane>
            <!-- <a-tab-pane key="TX" tab="腾讯" :disabled="loading">
                <a-tabs default-active-key="TX-GDT" v-model="activeChildTab.TX" @change="handleChildTabChange">
                    <a-tab-pane key="TX-GDT" tab="广点通" :disabled="loading"/>
                </a-tabs>
            </a-tab-pane>
            <a-tab-pane key="KS" tab="快手" :disabled="loading">
                <a-tabs default-active-key="KS-CLYQ" v-model="activeChildTab.KS" @change="handleChildTabChange">
                    <a-tab-pane key="KS-CLYQ" tab="磁力引擎" :disabled="loading"/>
                    <a-tab-pane key="KS-CLJN" tab="磁力金牛" :disabled="loading"/>
                    <a-tab-pane key="KS-DJK" tab="大健康" :disabled="loading"/>
                    <a-tab-pane key="KS-CLJX" tab="磁力聚星" :disabled="loading"/>
                </a-tabs>
            </a-tab-pane> -->
        </a-tabs>

        <a-card :bordered="false">
            <!-- 查询区域 -->
            <div class="table-page-search-wrapper">
                <a-form layout="inline" @keyup.enter.native="handleSearch">
                    <a-row :gutter="24">
                        <a-col :md="6" :sm="12">
                            <a-form-item label="代理商账户ID">
                                <a-input v-model.number="queryParam.agentId" placeholder="请输入代理商账户ID" />
                            </a-form-item>
                        </a-col>
                        <a-col :md="6" :sm="12">
                            <a-form-item label="被复制广告主账户ID">
                                <a-input v-model.number="queryParam.advertiserId" placeholder="请输入被复制广告主账户ID" />
                            </a-form-item>
                        </a-col>
                        <a-col :md="6" :sm="12">
                            <a-form-item label="批次名称">
                                <a-input v-model="queryParam.batchName" placeholder="请输入批次名称" />
                            </a-form-item>
                        </a-col>
                        <a-col :md="6" :sm="12">
                            <a-form-item label="复制状态">
                                <a-select v-model="queryParam.copyStatus" placeholder="请选择复制状态" allowClear>
                                    <a-select-option value="">全部</a-select-option>
                                    <a-select-option value="0">复制中</a-select-option>
                                    <a-select-option value="1">全部成功</a-select-option>
                                    <a-select-option value="2">部分成功</a-select-option>
                                    <a-select-option value="3">全部失败</a-select-option>
                                </a-select>
                            </a-form-item>
                        </a-col>
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
                <a-button @click="showAddModal" type="primary" icon="plus">新增</a-button>
            </div>

            <!-- table区域-begin -->
            <div>
                <a-table size="middle" :scroll="{ x: true }" bordered rowKey="id" :columns="columns"
                    :dataSource="itemList" :pagination="false" :loading="loading">
                    <span slot="copyTag" slot-scope="text, record">
                        {{ (text === true || text === 'true' || text === 1 || text === '1') ? '是' : '否' }}
                    </span>
                    <span slot="reportType" slot-scope="text">
                        {{
                            text === 'EMPTY' ? '不报备' :
                                text === 'ASCEND_REPORT' ? '走量报备' :
                                    text === 'SELF_OPERATION' ? '自运营报备' :
                                        text === 'DESCEND_REPORT' ? '收量报备' :
                                            (text || '-')
                        }}
                    </span>
                    <span slot="isBindingPro" slot-scope="text">
                        {{ getIsBindingPro(text) }}
                    </span>
                    <span slot="copyDelivery" slot-scope="text, record">
                        {{ (text === true || text === 'true' || text === 1 || text === '1') ? '是' : '否' }}
                    </span>
                    <span slot="copyStatus" slot-scope="text">
                        {{
                            text === '0' ? '复制中' :
                                text === '1' ? '全部成功' :
                                    text === '2' ? '部分成功' :
                                        text === '3' ? '全部失败' :
                                            (text || '-')
                        }}
                    </span>
                    <span slot="errorMsg" slot-scope="text">
                        <a-tooltip v-if="text && text.length > 20" :title="text" placement="top">
                            <span>{{ text.substring(0, 20) }}...</span>
                        </a-tooltip>
                        <span v-else>{{ text || '' }}</span>
                    </span>
                    <span slot="action" slot-scope="text, record, index">
                        <a @click="showDetail(record)">查看明细</a>
                    </span>
                </a-table>
                <a-pagination :current="pagination.current" :page-size="pagination.pageSize" :total="pagination.total"
                    @change="onPageChange" style="margin-top: 16px; text-align: right;" />
            </div>

            <!-- 新增账户弹窗 -->
            <a-modal v-model:visible="addModalVisible" title="新增账户" @ok="handleAddOk" @cancel="handleAddCancel"
                :confirm-loading="addModalLoading" width="40%">
                <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
                    <a-form-item label="任务名称" required>
                        <a-input v-model="addForm.batchName" placeholder="请输入任务名称" />
                    </a-form-item>
                    <a-form-item label="被复制广告主账户ID" required>
                        <a-input v-model="addForm.advertiserId" placeholder="请输入被复制广告主账户ID" />
                    </a-form-item>
                    <a-form-item label="复制数量" required>
                        <a-input-number v-model="addForm.quantity" :min="1" :max="500" :step="1" style="width: 100%"
                            placeholder="请输入复制数量" />
                    </a-form-item>
                    <a-form-item label="广告主账户名称" required>
                        <a-input v-model="addForm.advertiserName" placeholder="请输入广告主账户名称" />
                    </a-form-item>
                    <a-form-item label="是否绑定项目" v-if="!(userRoles.length == 1 && (userRoles[0] == 'copy'))">
                        <a-radio-group v-model="addForm.isBindingPro" button-style="solid">
                            <a-radio-button :value="true">是</a-radio-button>
                            <a-radio-button :value="false">否</a-radio-button>
                        </a-radio-group>
                    </a-form-item>
                    <a-form-item label="复制标签">
                        <a-radio-group v-model="addForm.copyTag" button-style="solid">
                            <a-radio-button :value="true">复制</a-radio-button>
                            <a-radio-button :value="false">不复制</a-radio-button>
                        </a-radio-group>
                    </a-form-item>
                    <a-form-item label="报备类型">
                        <a-radio-group v-model="addForm.reportType" button-style="solid">
                            <a-radio-button value="EMPTY">不报备</a-radio-button>
                            <a-radio-button value="ASCEND_REPORT">走量报备</a-radio-button>
                            <a-radio-button value="SELF_OPERATION">自运营报备</a-radio-button>
                            <a-radio-button value="DESCEND_REPORT">收量报备</a-radio-button>
                        </a-radio-group>
                    </a-form-item>
                    <a-form-item label="复制投放资质">
                        <a-radio-group v-model="addForm.copyDelivery" button-style="solid">
                            <a-radio-button :value="true">复制</a-radio-button>
                            <a-radio-button :value="false">不复制</a-radio-button>
                        </a-radio-group>
                    </a-form-item>
                </a-form>
            </a-modal>

            <!-- 明细弹窗 -->
            <a-modal v-model:visible="detailModalVisible" title="账户明细" @cancel="detailModalVisible = false" width="70%"
                :footer="null">
                <!-- 查询区域和导出按钮并排 -->
                <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
                    <a-form layout="inline" @keyup.enter.native="handleDetailSearch">
                        <a-form-item label="状态">
                            <a-select v-model="detailQueryParam.success" placeholder="请选择状态" style="width: 120px;"
                                allowClear>
                                <a-select-option value="">全部</a-select-option>
                                <a-select-option :value="true">成功</a-select-option>
                                <a-select-option :value="false">失败</a-select-option>
                            </a-select>
                        </a-form-item>
                        <a-form-item>
                            <a-button type="primary" @click="handleDetailSearch" icon="search"
                                size="small">查询</a-button>
                            <a-button @click="handleDetailReset" icon="reload" size="small"
                                style="margin-left: 8px">重置</a-button>
                        </a-form-item>
                    </a-form>
                    <!-- 这里是导出按钮 -->
                    <a-button v-if="detailModalVisible" type="primary" icon="download" size="small"
                        @click="exportDetailExcel">导出</a-button>
                </div>
                <a-table :dataSource="detailList" :columns="detailColumns" :loading="detailLoading" :pagination="false"
                    size="small" rowKey="id" bordered
                    style="margin-bottom: 12px; min-height: 200px; background: #fff; border-radius: 4px;" />
                <a-pagination :current="detailPagination.current" :page-size="detailPagination.pageSize"
                    :total="detailPagination.total" @change="onDetailPageChange"
                    style="margin-top: 16px; text-align: right;" size="small" />
            </a-modal>
        </a-card>
    </div>
</template>

<script>
import { advertiserCopy } from '@/api/api'
import { getAdvertiserCopyList, getAdvertiserCopyResultList } from '@/api/api'
import { mapGetters, mapState } from 'vuex'
import { getAction } from '@/api/manage'
// 新增导出依赖
import * as XLSX from 'xlsx'

export default {
    name: 'CopyAccountList',
    data() {
        return {
            userRoles: [],
            queryParam: {
                agentId: undefined,
                advertiserId: undefined,
                batchName: undefined,
                copyStatus: undefined,
                channelSign: 'DY-JLGG'
            },
            activeParentTab: 'DY',
            activeChildTab: {
                JL: 'DY-JLGG',
                TX: 'TX-GDT',
                KS: 'KS-CLYQ',
                CJHC: 'CJHC'
            },
            itemList: [],
            loading: false,
            columns: [
                { title: '创建人', dataIndex: 'createBy_dictText', key: 'createBy_dictText', align: 'center' },
                { title: '批次号', dataIndex: 'batchNumber', key: 'batchNumber', align: 'center' },
                { title: '批次名称', dataIndex: 'batchName', key: 'batchName', align: 'center' },
                { title: '绑定项目', dataIndex: 'isBindingPro', key: 'isBindingPro', align: 'center', scopedSlots: { customRender: 'isBindingPro' } },
                { title: '代理商账户ID', dataIndex: 'agentId', key: 'agentId', align: 'center' },
                { title: '被复制广告主账户ID', dataIndex: 'advertiserId', key: 'advertiserId', align: 'center' },
                { title: '复制数量', dataIndex: 'quantity', key: 'quantity', align: 'center' },
                { title: '广告主账户名称', dataIndex: 'advertiserName', key: 'advertiserName', align: 'center' },
                { title: '创建时间', dataIndex: 'createTime', key: 'createTime', align: 'center' },
                { title: '复制结果', dataIndex: 'copyStatus', key: 'copyStatus', align: 'center', scopedSlots: { customRender: 'copyStatus' } },
                { title: '复制标签', dataIndex: 'copyTag', key: 'copyTag', align: 'center', scopedSlots: { customRender: 'copyTag' } },
                {
                    title: '自运营报备类型', dataIndex: 'reportType', key: 'reportType', align: 'center', scopedSlots: { customRender: 'reportType' }
                },
                { title: '复制投放资质', dataIndex: 'copyDelivery', key: 'copyDelivery', align: 'center', scopedSlots: { customRender: 'copyDelivery' } },
                { title: '错误信息', dataIndex: 'errorMsg', key: 'errorMsg', align: 'center', scopedSlots: { customRender: 'errorMsg' } },
                { title: '操作', key: 'action', align: 'center', width: 100, scopedSlots: { customRender: 'action' } }
            ],
            pagination: {
                current: 1,
                pageSize: 10,
                total: 0
            },
            // 弹窗相关
            addModalVisible: false,
            addModalLoading: false,
            addForm: {
                batchName: '',
                agentId: '',
                advertiserId: '',
                quantity: 1,
                advertiserName: '',
                copyTag: false,
                isBindingPro: true,
                reportType: 'EMPTY',
                copyDelivery: false
            },
            detailModalVisible: false,
            detailData: {},
            detailList: [],
            detailLoading: false,
            detailQueryParam: {
                success: undefined
            },
            detailPagination: {
                current: 1,
                pageSize: 10,
                total: 0
            },
            detailColumns: [
                { title: '明细ID', dataIndex: 'id', key: 'id', align: 'center' },
                { title: '广告主ID', dataIndex: 'advertiserId', key: 'advertiserId', align: 'center' },
                { title: '广告主名称', dataIndex: 'advertiserName', key: 'advertiserName', align: 'center' },
                {
                    title: '状态', dataIndex: 'success', key: 'status', align: 'center',
                    customRender: (text) => (text === true || text === 'true') ? '成功' : (text === false || text === 'false' ? '失败' : '-')
                },
                { title: '失败原因', dataIndex: 'errorMsg', key: 'errorMsg', align: 'center' },
                { title: '创建时间', dataIndex: 'createTime', key: 'createTime', align: 'center' }
            ]
        }
    },
    created() {
        getAction('/sys/api/queryUserRoles', {
            username: this.$store.getters.userInfo.username
        }).then(res => {
            this.userRoles = res
        })
    },
    methods: {
        ...mapGetters(["userInfo"]),
        getIsBindingPro(text) {
            // // console.log(text, 'texttexttexttexttexttext')
            if (text == 'true') {
                return '是'
            } else if (text == 'false') {
                return '否'
            } else {
                return '-'
            }
        },
        handleSearch() {
            this.loading = true;
            getAdvertiserCopyList({
                ...this.queryParam,
                pageNo: this.pagination.current,
                pageSize: this.pagination.pageSize,
                column: 'createTime',
                order: 'desc',
                createdBy: this.userInfo().id,
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
                advertiserId: undefined,
                batchName: undefined,
                copyStatus: undefined,
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
        showAddModal() {
            this.addForm = {
                batchName: '',
                agentId: '',
                advertiserId: '',
                quantity: 1,
                advertiserName: '',
                copyTag: false,
                isBindingPro: true,
                reportType: 'EMPTY',
                copyDelivery: false
            };
            this.addModalVisible = true;
        },
        handleAddOk() {
            const {
                batchName,
                agentId,
                advertiserId,
                quantity,
                advertiserName
            } = this.addForm;
            // if (!batchName || !batchName.trim()) {
            //     this.$message.error('批次名称必填');
            //     return;
            // }
            // if (!agentId || !agentId.toString().trim()) {
            //     this.$message.error('代理商账户ID必填');
            //     return;
            // }
            // if (!advertiserId || !advertiserId.toString().trim()) {
            //     this.$message.error('被复制广告主账户ID必填');
            //     return;
            // }
            if (!quantity || isNaN(quantity) || quantity < 1 || quantity > 500 || !Number.isInteger(Number(quantity))) {
                this.$message.error('复制数量必须为1-500之间的整数');
                return;
            }
            // if (!advertiserName || !advertiserName.trim()) {
            //     this.$message.error('广告主账户名称必填');
            //     return;
            // }
            // if (/[^\w\u4e00-\u9fa5]/.test(advertiserName)) {
            //     this.$message.error('广告主账户名称不能包含特殊字符');
            //     return;
            // }
            // if (/\n/.test(advertiserName)) {
            //     this.$message.error('广告主账户名称不能包含换行符');
            //     return;
            // }
            // if (this.itemList.some(i => i.advertiserName === advertiserName)) {
            //     this.$message.error('广告主账户名称不可重复');
            //     return;
            // }
            this.addModalLoading = true;
            advertiserCopy(this.addForm)
                .then(res => {
                    if (res && res.success) {
                        this.$message.success(res.message || '新增成功');
                        this.addModalVisible = false;
                    } else {
                        this.$message.error((res && res.message) || '新增失败');
                    }
                })
                .catch(() => {
                    this.$message.error('新增失败');
                })
                .finally(() => {
                    this.addModalLoading = false;
                });
            this.addModalVisible = false;
            this.handleSearch();
        },
        handleAddCancel() {
            this.addModalVisible = false;
        },
        showDetail(record) {
            this.detailData = { ...record };
            this.detailModalVisible = true;
            this.detailLoading = true;
            this.detailList = [];
            // 重置查询参数和分页
            this.detailQueryParam = { success: undefined };
            this.detailPagination.current = 1;
            this.detailPagination.total = 0;
            this.loadDetailData();
        },
        loadDetailData() {
            this.detailLoading = true;
            getAdvertiserCopyResultList({
                advertiserCopyId: this.detailData.id,
                pageNo: this.detailPagination.current,
                pageSize: this.detailPagination.pageSize,
                column: 'createTime',
                order: 'desc',
                ...this.detailQueryParam
            })
                .then(res => {
                    if (res && res.success) {
                        // 兼容不同返回结构
                        this.detailList = res.result && res.result.records ? res.result.records : (res.result || []);
                        // 更新分页信息
                        if (res.result && typeof res.result.total === 'number') {
                            this.detailPagination.total = res.result.total;
                        }
                        if (res.result && typeof res.result.current === 'number') {
                            this.detailPagination.current = res.result.current;
                        }
                        if (res.result && typeof res.result.size === 'number') {
                            this.detailPagination.pageSize = res.result.size;
                        }
                    } else {
                        this.detailList = [];
                        this.$message.error((res && res.message) || '明细查询失败');
                    }
                })
                .catch(() => {
                    this.detailList = [];
                    this.$message.error('明细查询失败');
                })
                .finally(() => {
                    this.detailLoading = false;
                });
        },
        onPageChange(page) {
            this.pagination.current = page;
            this.handleSearch();
        },
        onDetailPageChange(page) {
            this.detailPagination.current = page;
            this.loadDetailData();
        },
        handleDetailSearch() {
            this.detailPagination.current = 1;
            this.loadDetailData();
        },
        handleDetailReset() {
            this.detailQueryParam = { success: undefined };
            this.detailPagination.current = 1;
            this.loadDetailData();
        },
        exportDetailExcel() {
            if (!this.detailData.id) {
                this.$message.error('请先打开明细弹窗');
                return;
            }
            this.detailLoading = true;
            getAdvertiserCopyResultList({
                advertiserCopyId: this.detailData.id,
                pageNo: 1,
                pageSize: 1000,
                column: 'createTime',
                order: 'desc',
                ...this.detailQueryParam
            })
                .then(res => {
                    if (res && res.success) {
                        const list = res.result && res.result.records ? res.result.records : (res.result || []);
                        if (!list.length) {
                            this.$message.warning('没有可导出的数据');
                            return;
                        }
                        // 处理表头和数据
                        const data = list.map(item => ({
                            '明细ID': item.id,
                            '广告主ID': item.advertiserId,
                            '广告主名称': item.advertiserName,
                            '状态': (item.success === true || item.success === 'true') ? '成功' : (item.success === false || item.success === 'false' ? '失败' : '-'),
                            '失败原因': item.errorMsg,
                            '创建时间': item.createTime
                        }));
                        const ws = XLSX.utils.json_to_sheet(data);
                        const wb = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(wb, ws, '账户明细');
                        // 文件名用批次名称
                        let fileName = (this.detailData.batchName || '账户明细') + '.xlsx';
                        XLSX.writeFile(wb, fileName);
                    } else {
                        this.$message.error((res && res.message) || '导出失败');
                    }
                })
                .catch(() => {
                    this.$message.error('导出失败');
                })
                .finally(() => {
                    this.detailLoading = false;
                });
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