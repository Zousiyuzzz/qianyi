<template>
    <a-card :bordered="false">
        <!-- 查询区域 -->
        <div class="table-page-search-wrapper">
            <a-form layout="inline" @keyup.enter.native="searchQuery">
                <a-row :gutter="24">
                    <!-- 延期申请查询条件 -->
                    <template v-if="activeTab === '1'">
                        <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <a-form-item label="开始月份">
                                <a-month-picker v-model="queryParam.month" placeholder="请选择月份" :value-format="'YYYY-MM'"
                                    style="width: 100%;" />
                            </a-form-item>
                        </a-col>
                        <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <a-form-item label="项目">
                                <JSearchSelectTag placeholder="请选择项目" v-model="queryParam.proId"
                                    dict="tab_projectManage,pro_name,id,del_flag = '0'" async allowClear />
                            </a-form-item>
                        </a-col>
                        <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <a-form-item label="状态">
                                <a-select placeholder="请选择状态" v-model="queryParam.status" allowClear>
                                    <a-select-option value="0">同意</a-select-option>
                                    <a-select-option value="1">驳回</a-select-option>
                                    <a-select-option value="2">处理中</a-select-option>
                                </a-select>
                            </a-form-item>
                        </a-col>
                    </template>

                    <!-- 逾期记录查询条件 -->
                    <template v-if="activeTab === '2'">
                        <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <a-form-item label="月份">
                                <a-month-picker v-model="queryParam.dateMonth" placeholder="请选择月份"
                                    :value-format="'YYYY-MM'" style="width: 100%;" />
                            </a-form-item>
                        </a-col>
                        <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <a-form-item label="项目">
                                <JSearchSelectTag placeholder="请选择项目" v-model="queryParam.proId"
                                    dict="tab_projectManage,pro_name,id,del_flag = '0'" async allowClear />
                            </a-form-item>
                        </a-col>
                        <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <a-form-item label="客户">
                                <JSearchSelectTag placeholder="请选择客户" v-model="queryParam.customerId"
                                    dict="tab_customerManage,customer_name,id,del_flag = '0'" async allowClear />
                            </a-form-item>
                        </a-col>
                        <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <a-form-item label="商务">
                                <JSearchSelectTag placeholder="请选择商务" v-model:value="queryParam.businessPerson"
                                    dict="sys_user,realname,id,del_flag = '0'" async allowClear>
                                </JSearchSelectTag>
                            </a-form-item>
                        </a-col>
                    </template>

                    <a-col :xl="24" :lg="24" :md="24" :sm="24">
                        <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
                        <a-button type="primary" @click="handleReset" icon="reload"
                            style="margin-left: 12px;">重置</a-button>
                        <!-- <a-button type="primary" @click="handleAdd" icon="plus" style="margin-left: 12px;">
                            新增延期申请
                        </a-button> -->
                    </a-col>
                </a-row>
            </a-form>
        </div>
        <!-- 查询区域-END -->

        <!-- Tabs区域 -->
        <a-tabs v-model="activeTab" @change="handleTabChange" style="margin-bottom: 16px;">
            <a-tab-pane key="1" tab="延期申请">
                <!-- 延期申请类型的内容 -->
            </a-tab-pane>
            <a-tab-pane key="2" tab="逾期记录">
                <!-- 逾期记录类型的内容 -->
            </a-tab-pane>
        </a-tabs>

        <!-- 操作按钮区域 -->
        <div class="table-operator" v-if="activeTab === '1'">

            <!-- <a-button type="primary" @click="handleUpdateData" icon="sync" :loading="updateLoading">
          {{ updateLoading ? '刷新中' : '刷新返点数据' }}
        </a-button> -->
        </div>

        <!-- table区域-begin -->
        <div v-if="activeTab === '1'">
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
                    <span v-if="!text" style="font-size:  12px;font-style: italic;">无图片</span>
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

                <template slot="status" slot-scope="text">
                    <span v-if="text === '0'" style="color: #52c41a;">同意</span>
                    <span v-else-if="text === '1'" style="color: red;">驳回</span>
                    <span v-else-if="text === '2'" style="color: orange;">处理中</span>
                    <span v-else>-</span>
                </template>

                <template slot="action" slot-scope="text, record">
                    <a-button v-if="record.status === '2'" type="primary" size="small" @click="handleApprove(record)"
                        style="margin-right: 8px;">
                        同意
                    </a-button>
                    <a-button v-if="record.status === '2'" type="danger" size="small" @click="handleReject(record)">
                        驳回
                    </a-button>
                    <span v-if="record.status !== '2'">-</span>
                </template>

            </a-table>
        </div>

        <!-- 逾期记录表格区域 -->
        <div v-if="activeTab === '2'">
            <a-table ref="overdueTable" size="middle" :scroll="{ x: true }" bordered rowKey="id"
                :columns="overdueColumns" :dataSource="overdueDataSource" :pagination="overduePagination"
                :loading="overdueLoading" class="j-table-force-nowrap" @change="handleOverdueTableChange">

                <template slot="footer">
                    <div style="text-align: center; font-weight: bold;padding-top: -10px;">
                        <div style="margin-bottom: 8px; color: #1890ff;">逾期记录汇总</div>
                        <div>
                            <span style="margin-right: 20px;">总逾期金额：{{ totalOverdueAmount.toFixed(2) }}</span>
                        </div>
                    </div>
                </template>
            </a-table>
        </div>

        <!-- <tab-customer-payment-record-modal ref="modalForm" @ok="modalFormOk"></tab-customer-payment-record-modal> -->
        <!-- <fenpei-drawer ref="fenpeiDrawer" @ok="modalFormOk"></fenpei-drawer> -->
        <delay-modal ref="delayModal" @ok="modalFormOk"></delay-modal>
    </a-card>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
// import TabCustomerPaymentRecordModal from './modules/TabCustomerPaymentRecordModal'
// import FenpeiDrawer from './FenpeiDrawer'
import DelayModal from './modules/DelayModal'
import { httpAction } from '@/api/manage'
export default {
    name: 'BackmoneyList.vue',
    mixins: [JeecgListMixin, mixinDevice],
    components: {
        // TabCustomerPaymentRecordModal,
        // FenpeiDrawer,
        DelayModal
    },
    data() {
        return {
            isorter: {
                column: 'month',
                order: 'desc',
            },
            queryParam: {
                dateMonthBegin: null,
                dateMonthEnd: null,
                proId: null,
                status: null,
                submitReason: null,
                operator: null,
                dateMonth: null,
                customerId: null,
                businessPerson: null
            },
            activeTab: '1',
            description: '回款记录表管理页面',
            updateLoading: false, // 添加刷新loading状态
            // 表头
            columns: [
                {
                    title: '项目',
                    align: "center",
                    dataIndex: 'proId_pro_name',
                    width: 170
                },
                {
                    title: '月份',
                    align: "center",
                    dataIndex: 'month',
                    width: 120
                },
                {
                    title: '延期天数',
                    align: "center",
                    dataIndex: 'delayDays',
                    width: 120
                },
                {
                    title: '提交原因',
                    align: "center",
                    dataIndex: 'submitReason',
                    width: 200
                },
                {
                    title: '状态',
                    align: "center",
                    dataIndex: 'status',
                    width: 170,
                    scopedSlots: { customRender: 'status' }
                },
                {
                    title: '审批备注',
                    align: "center",
                    dataIndex: 'approvalReason',
                    width: 200
                },
                {
                    title: '创建人',
                    align: "center",
                    dataIndex: 'createBy',
                    width: 170
                },
                {
                    title: '创建时间',
                    align: "center",
                    dataIndex: 'createTime',
                },
                // {
                //     title: '更新时间',
                //     align: "center",
                //     dataIndex: 'updateTime',
                //     width: 150
                // },
                {
                    title: '操作',
                    dataIndex: 'action',
                    align: "center",
                    width: 150,
                    fixed: 'right',
                    scopedSlots: { customRender: 'action' }
                },

            ],
            // 逾期记录表格列
            overdueColumns: [
                {
                    title: '项目名称',
                    align: "center",
                    dataIndex: 'proId_pro_name',
                    minWidth: 140,
                    ellipsis: true
                },
                {
                    title: '客户名称',
                    align: "center",
                    dataIndex: 'proId_customer_name',
                    minWidth: 140,
                    ellipsis: true
                },
                {
                    title: '商务',
                    align: "center",
                    dataIndex: 'proId_business_person',
                    minWidth: 100,
                    customRender: (text) => {
                        if (!text) return '-';
                        const user = this.userIdAndRealnameList.find(item => item.id === text);
                        return user ? user.realname : text;
                    }
                },
                {
                    title: '逾期天数',
                    align: "center",
                    dataIndex: 'overdueDays',
                    width: 120
                },
                {
                    title: '账期',
                    align: "center",
                    dataIndex: 'dateMonth',
                    width: 120
                },
                {
                    title: '应回款日期',
                    align: "center",
                    dataIndex: 'repayDay',
                    width: 200
                },
                {
                    title: '实际回款日期',
                    align: "center",
                    dataIndex: 'lastArrivalTime',
                    width: 200
                },
                {
                    title: '逾期金额',
                    align: "center",
                    dataIndex: 'overdueAmount',
                    minWidth: 120,
                    customRender: (text) => text ? Number(text).toFixed(2) : '0.00',
                    sorter: (a, b) => (Number(a.overdueAmount) || 0) - (Number(b.overdueAmount) || 0),
                    sortDirections: ['ascend', 'descend']
                }
            ],
            // 逾期记录相关数据
            overdueDataSource: [],
            overdueLoading: false,
            overduePagination: {
                current: 1,
                pageSize: 10,
                pageSizeOptions: ['10', '20', '30', '50'],
                showTotal: (total, range) => {
                    return range[0] + "-" + range[1] + " 共" + total + "条"
                },
                showQuickJumper: true,
                showSizeChanger: true,
                total: 0,
            },
            url: {
                list: "/projectPaymentDelay/list",
                overdueList: "/projectPaymentOverdueRecords/list",
            },
            dictOptions: {},
            superFieldList: [],
            // 用户ID和真实姓名组合数据
            userIdAndRealnameList: [],
            /* 分页参数 */
            ipagination: {
                current: 1,
                pageSize: 10,
                pageSizeOptions: ['10', '20', '30', '50'],
                showTotal: (total, range) => {
                    return range[0] + "-" + range[1] + " 共" + total + "条"
                },
                showQuickJumper: true,
                showSizeChanger: true,
                total: 0,
                // 自定义每页条数选项的显示文本
                // pageSizeOptionsRender: (pageSize) => {
                //   return pageSize === '999999' ? '全部' : `${pageSize}条/页`
                // }
            },
        }
    },
    created() {
        // 在mixin的created之前设置默认值
        const date = new Date()
        const currentMonth = date.toISOString().slice(0, 7)

        // 计算上月
        let year = date.getFullYear();
        let month = date.getMonth(); // 0-11

        // 如果当前是1月，上月就是去年12月
        if (month === 0) {
            year = year - 1;
            month = 12;
        } else {
            month = month;
        }

        const lastMonthStr = `${year}-${month.toString().padStart(2, '0')}`;

        this.$set(this.queryParam, 'dateMonthBegin', currentMonth)
        this.$set(this.queryParam, 'dateMonthEnd', currentMonth)
        this.$set(this.queryParam, 'dateMonth', lastMonthStr) // 逾期记录默认上月

        this.getSuperFieldList();
        this.getUserIdAndRealnameCombination();
    },
    computed: {
        importExcelUrl: function () {
            return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
        },
        totalOverdueAmount() {
            return this.overdueDataSource.reduce((sum, record) => sum + (Number(record.overdueAmount) || 0), 0);
        }
    },
    methods: {
        initDictConfig() {
        },
        // 处理tab切换
        handleTabChange(activeKey) {
            this.activeTab = activeKey;
            if (activeKey === '1') {
                this.loadData();
            } else if (activeKey === '2') {
                this.loadOverdueData();
            }
        },
        // 加载逾期记录数据
        loadOverdueData() {
            // 确保逾期记录的默认月份已设置
            if (!this.queryParam.dateMonth) {
                const date = new Date();
                // 获取当前月份，然后减去1个月
                let year = date.getFullYear();
                let month = date.getMonth(); // 0-11

                // 如果当前是1月，上月就是去年12月
                if (month === 0) {
                    year = year - 1;
                    month = 12;
                } else {
                    month = month;
                }

                const lastMonthStr = `${year}-${month.toString().padStart(2, '0')}`;
                this.$set(this.queryParam, 'dateMonth', lastMonthStr);
            }

            this.overdueLoading = true;
            const params = {
                pageNo: this.overduePagination.current,
                pageSize: this.overduePagination.pageSize,
                ...this.queryParam
            };

            // 移除延期申请相关的参数
            delete params.status;
            delete params.submitReason;
            delete params.operator;

            httpAction(this.url.overdueList, params, 'GET').then((res) => {
                if (res.success) {
                    this.overdueDataSource = res.result.records || [];
                    this.overduePagination.total = res.result.total || 0;
                } else {
                    this.$message.error(res.message || '加载逾期记录失败');
                }
            }).catch((error) => {
                console.error('加载逾期记录失败:', error);
                this.$message.error('加载逾期记录失败');
            }).finally(() => {
                this.overdueLoading = false;
            });
        },
        // 处理逾期记录表格变化
        handleOverdueTableChange(pagination) {
            this.overduePagination = pagination;
            this.loadOverdueData();
        },
        // 重写loadData方法，确保在加载数据前设置默认月份
        loadData(arg) {
            // 确保默认月份已设置
            if (!this.queryParam.dateMonthBegin || !this.queryParam.dateMonthEnd) {
                const date = new Date()
                const currentMonth = date.toISOString().slice(0, 7)
                this.$set(this.queryParam, 'dateMonthBegin', currentMonth)
                this.$set(this.queryParam, 'dateMonthEnd', currentMonth)
            }
            // 调用mixin的loadData方法
            this.$options.mixins[0].methods.loadData.call(this, arg);
        },
        handleUpdateData() {
            this.$confirm({
                title: '提示',
                content: '是否要刷新客户返点和媒体返点数据重新运算，大约30s',
                onOk: () => {
                    this.updateLoading = true; // 开始刷新时设置loading状态
                    this.$http.get('/agentdata/updateData').then(res => {
                        if (res.success) {
                            this.$message.success('提交成功');
                            this.loadData(); // 重新加载列表数据
                        } else {
                            this.$message.error(res.message || '提交失败');
                        }
                    }).catch(err => {
                        this.$message.error('提交失败');
                    }).finally(() => {
                        this.updateLoading = false; // 无论成功失败都关闭loading状态
                    });
                }
            });
        },
        getSuperFieldList() {
            let fieldList = [];
            fieldList.push({ type: 'string', value: 'delFlag', text: '删除标识（0：未删除1：已删除）', dictCode: '' })
            fieldList.push({ type: 'string', value: 'customerId', text: '客户编号id', dictCode: '' })
            fieldList.push({ type: 'string', value: 'customerName', text: '客户名称', dictCode: '' })
            fieldList.push({ type: 'date', value: 'paymentDate', text: '到账时间' })
            fieldList.push({ type: 'BigDecimal', value: 'amountReceived', text: '到账金额', dictCode: '' })
            fieldList.push({ type: 'string', value: 'serialNumber', text: '支付流水号', dictCode: '' })
            fieldList.push({ type: 'Text', value: 'remarks', text: '备注', dictCode: '' })
            fieldList.push({ type: 'string', value: 'state', text: '状态（0：未分配1：已分配2：部分分配）', dictCode: '' })
            this.superFieldList = fieldList
        },
        handleMonthChange() {
            // 如果两个月份都选择了，验证开始月份不能大于结束月份
            if (this.startMonth && this.endMonth) {
                const start = new Date(this.startMonth);
                const end = new Date(this.endMonth);
                if (start > end) {
                    this.$message.warning('开始月份不能大于结束月份');
                    this.endMonth = null;
                    return;
                }
            }

            // 生成月份数组
            const months = [];
            if (this.startMonth && this.endMonth) {
                // 如果两个月份都选择了，补齐中间月份
                const start = new Date(this.startMonth);
                const end = new Date(this.endMonth);
                let currentDate = new Date(start);
                while (currentDate <= end) {
                    months.push(currentDate.toISOString().slice(0, 7));
                    currentDate.setMonth(currentDate.getMonth() + 1);
                }
            } else if (this.startMonth) {
                // 如果只选择了开始月份
                months.push(this.startMonth);
            } else if (this.endMonth) {
                // 如果只选择了结束月份
                months.push(this.endMonth);
            }

            this.queryParam.month = months;
        },
        // 获取用户ID和真实姓名组合
        getUserIdAndRealnameCombination() {
            // console.log('开始请求用户ID和真实姓名组合数据...');
            httpAction('/sys/user/getUserIdAndRealnameCombination', {}, 'GET').then((res) => {
                // console.log('请求响应:', res);
                if (res.success) {
                    // console.log('用户ID和真实姓名组合数据:', res.result);
                    this.userIdAndRealnameList = res.result || [];
                } else {
                    // console.log('请求失败:', res.message);
                    this.$message.warning(res.message || '获取用户数据失败');
                }
            }).catch((error) => {
                console.error('获取用户ID和真实姓名组合失败:', error);
                this.$message.error('获取用户数据失败');
            });
        },
        // 重置查询条件
        handleReset() {
            if (this.activeTab === '1') {
                // 延期申请重置
                this.queryParam = {
                    dateMonthBegin: null,
                    dateMonthEnd: null,
                    proId: null,
                    status: null,
                    submitReason: null,
                    operator: null,
                    dateMonth: null,
                    customerId: null,
                    businessPerson: null
                };
            } else if (this.activeTab === '2') {
                // 逾期记录重置
                const date = new Date();
                let year = date.getFullYear();
                let month = date.getMonth(); // 0-11

                // 如果当前是1月，上月就是去年12月
                if (month === 0) {
                    year = year - 1;
                    month = 12;
                } else {
                    month = month;
                }

                const lastMonthStr = `${year}-${month.toString().padStart(2, '0')}`;

                this.queryParam = {
                    dateMonthBegin: null,
                    dateMonthEnd: null,
                    proId: null,
                    status: null,
                    submitReason: null,
                    operator: null,
                    dateMonth: lastMonthStr,
                    customerId: null,
                    businessPerson: null
                };
            }
            this.searchQuery();
        },
        // 处理新增延期申请
        handleAdd() {
            this.$refs.delayModal.open();
        },
        // 处理同意延期申请
        handleApprove(record) {
            this.showApprovalModal(record, 'approve', '同意延期申请');
        },
        // 处理驳回延期申请
        handleReject(record) {
            this.showApprovalModal(record, 'reject', '驳回延期申请');
        },
        // 显示审批原因输入弹窗
        showApprovalModal(record, action, title) {
            let approvalReason = '';
            this.$confirm({
                title: title,
                content: h => {
                    return h('div', [
                        h('p', { style: 'margin-bottom: 10px;' }, '请输入审批原因（可选）：'),
                        h('a-textarea', {
                            props: {
                                placeholder: '请输入审批原因...',
                                rows: 3,
                                value: approvalReason
                            },
                            on: {
                                input: (e) => {
                                    approvalReason = e.target.value;
                                }
                            }
                        })
                    ]);
                },
                onOk: () => {
                    this.submitApproval(record, action, approvalReason);
                }
            });
        },
        // 提交审批操作
        submitApproval(record, action, approvalReason = '') {
            const url = action === 'approve' ? '/projectPaymentDelay/approve' : '/projectPaymentDelay/reject';
            const formData = {
                id: record.id,
                approvalReason: approvalReason
            };

            httpAction(url, formData, 'POST').then((res) => {
                if (res.success) {
                    this.$message.success(action === 'approve' ? '同意成功' : '驳回成功');
                    this.loadData(); // 刷新列表
                } else {
                    this.$message.error(res.message || '操作失败');
                }
            }).catch((error) => {
                console.error('审批操作失败:', error);
                this.$message.error('操作失败');
            });
        },
        // 重写searchQuery方法
        searchQuery() {
            if (this.activeTab === '1') {
                this.loadData();
            } else if (this.activeTab === '2') {
                this.loadOverdueData();
            }
        },
        // 弹窗确认后的回调
        modalFormOk() {
            // 延期成功后可以刷新列表数据
            this.loadData();
        }
    }
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>