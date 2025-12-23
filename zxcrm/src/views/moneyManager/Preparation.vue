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
                            <a-form-item label="合作方式">
                                <j-dict-select-tag placeholder="请选择合作方式" v-model="queryParam.collaborationMode"
                                    dictCode="projectt_hezuotype" clearable></j-dict-select-tag>
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
                            <a-form-item label="状态">
                                <a-select placeholder="请选择状态" v-model="queryParam.state" :allowClear="true">
                                    <a-select-option value="1">正常</a-select-option>
                                    <a-select-option value="2">撤销</a-select-option>
                                </a-select>
                            </a-form-item>
                        </a-col>
                        <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <a-form-item label="项目主体">
                                <!-- <JSearchSelectTag placeholder="请选择更新人" v-model:value="queryParam.updateBy"
                                    :allowClear="true" dict="sys_user,realname,realname,del_flag = '0'" async>
                                </JSearchSelectTag> -->
                                <a-input placeholder="请输入项目主体" v-model="queryParam.customerTitle"></a-input>
                            </a-form-item>
                        </a-col>
                        <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <a-form-item label="到账时间">
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
                    </a-row>
                </a-form>
            </div>
            <!-- 查询区域-END -->

            <!-- 操作按钮区域 -->
            <div class="table-operator">
                <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
                <a-button type="primary" icon="download" @click="handleExportXls('资金准备信息表')">导出</a-button>
                <a-button type="primary" icon="download" @click="downloadTemplate">下载模板</a-button>
                <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader"
                    :action="importExcelUrl" @change="handleImportExcel" :beforeUpload="beforeUpload"
                    :customRequest="handleCustomImport">
                    <a-button type="primary" icon="import">导入客户到账数据</a-button>
                </a-upload>
                <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
                <!-- <j-super-query :fieldList="superFieldList" ref="superQueryModal"
                    @handleSuperQuery="handleSuperQuery"></j-super-query> -->
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

                    <template slot="action" slot-scope="text, record">
                        <a @click="handleAllocate(record)">分配</a>
                    </template>
                </a-table>
            </div>

            <tab-bank-account-modal ref="modalForm" @ok="modalFormOk"></tab-bank-account-modal>
            <preparation-edit-modal ref="editModal" @ok="modalFormOk"></preparation-edit-modal>
            <preparation-allocate-modal ref="allocateModal" @ok="modalFormOk"></preparation-allocate-modal>

            <!-- 导入确认弹窗 -->
            <a-modal title="确认导入数据" :visible="importConfirmVisible" :width="1800" :footer="null"
                @cancel="handleImportCancel">
                <div style="margin-bottom: 16px;">
                    <a-alert message="请确认以下数据是否正确，可以点击编辑按钮修改数据" type="info" show-icon style="margin-bottom: 16px;" />
                    <a-button type="primary" @click="handleConfirmImport" :loading="importLoading"
                        style="margin-right: 8px;">
                        确认导入
                    </a-button>
                    <a-button @click="handleImportCancel">取消</a-button>
                </div>

                <a-table :columns="importColumns" :dataSource="importDataList" :pagination="false"
                    :scroll="{ x: 1500, y: 400 }" size="small" bordered>
                    <template slot="proNameSlot" slot-scope="text, record, index">
                        <div v-if="record.proId">
                            {{ record.proName }}
                        </div>
                        <a-select v-else v-model="record.proId" style="width: 100%" placeholder="请选择项目"
                            @change="(value) => handleProIdChange(value, record)">
                            <a-select-option v-for="project in projects" :key="project.uniqueId"
                                :value="project.uniqueId">
                                {{ project.proName }}
                            </a-select-option>
                        </a-select>
                    </template>

                    <template slot="proIdSlot" slot-scope="text, record, index">
                        <span>{{ record.proId || '-' }}</span>
                    </template>

                    <template slot="customerTitleSlot" slot-scope="text, record, index">
                        <div v-if="record.customerTitleId">
                            {{ record.customerTitle }}
                        </div>
                        <a-select v-else v-model="record.customerTitleId" style="width: 100%" placeholder="请选择项目主体"
                            @change="(value) => handleCustomerTitleIdChange(value, record)">
                            <a-select-option v-for="account in filterProjectAccountList(record)" :key="account.id"
                                :value="account.id">
                                {{ account.corporateName }}
                            </a-select-option>
                        </a-select>
                    </template>

                    <template slot="customerTitleIdSlot" slot-scope="text, record, index">
                        <span>{{ record.customerTitleId || '-' }}</span>
                    </template>

                    <template slot="ourTitleSlot" slot-scope="text, record, index">
                        <div v-if="record.ourTitleId">
                            {{ record.ourTitle }}
                        </div>
                        <a-select v-else v-model="record.ourTitleId" style="width: 100%" placeholder="请选择我方主体"
                            @change="(value) => handleOurTitleIdChange(value, record)">
                            <a-select-option v-for="account in bankAccounts" :key="account.id" :value="account.id">
                                {{ account.corporateName }}
                            </a-select-option>
                        </a-select>
                    </template>

                    <template slot="ourTitleIdSlot" slot-scope="text, record, index">
                        <span>{{ record.ourTitleId || '-' }}</span>
                    </template>

                    <template slot="fundsNatureSlot" slot-scope="text, record, index">
                        <a-select v-model="record.fundsNature" style="width: 100%" placeholder="请选择资金性质">
                            <a-select-option value="1">对公</a-select-option>
                            <a-select-option value="2">对私</a-select-option>
                        </a-select>
                    </template>

                    <template slot="arrivalTimeSlot" slot-scope="text, record, index">
                        <a-date-picker v-model="record.arrivalTime" style="width: 100%" placeholder="请选择到账时间"
                            format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
                    </template>

                    <template slot="actionSlot" slot-scope="text, record, index">
                        <a-button type="link" size="small" @click="handleEditImportRow(record, index)">
                            编辑
                        </a-button>
                        <a-button type="link" size="small" @click="handleDeleteImportRow(index)"
                            style="color: #ff4d4f;">
                            删除
                        </a-button>
                    </template>
                </a-table>
            </a-modal>
        </a-card>
    </div>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { postAction, getAction } from '@/api/manage'
import TabBankAccountModal from './modules/TabBankAccountModal'
import PreparationEditModal from './modules/PreparationEditModal'
import PreparationAllocateModal from './modules/PreparationAllocateModal'
import * as XLSX from 'xlsx'
import moment from 'moment'

export default {
    name: 'TabBankAccountList',
    mixins: [JeecgListMixin, mixinDevice],
    components: {
        TabBankAccountModal,
        PreparationEditModal,
        PreparationAllocateModal
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
            ],
            createTime: [],
            currentFundsNature: '1',
            description: '资金准备管理页面',
            // 表头
            columns: [
                {
                    title: '项目ID',
                    align: "center",
                    dataIndex: 'proUniqueId'
                },
                {
                    title: '项目名称',
                    align: "center",
                    dataIndex: 'proName'
                },
                {
                    title: '渠道',
                    align: "center",
                    dataIndex: 'businessId_dictText',
                    width: 200
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
                    title: '状态',
                    align: "center",
                    dataIndex: 'state',
                    customRender: (text) => {
                        /**
                            *  已认款
                               待认款
                               撤销
                            */
                        let arr = ['', '已认款', '撤销', '待认款']
                        return arr[Number(text)]
                    },
                },
                {
                    title: '到账金额',
                    align: "center",
                    dataIndex: 'arrivalAmount'
                },
                {
                    title: '到账时间',
                    align: "center",
                    dataIndex: 'arrivalTime'
                },
                {
                    title: '还款月份',
                    align: "center",
                    dataIndex: 'dateMonth'
                },
                {
                    title: '资金性质',
                    align: "center",
                    dataIndex: 'fundsNature',
                    customRender: (text) => {
                        let arr = ['', '对公', '对私']
                        return arr[Number(text)]
                    },
                },
                {
                    title: '项目主体',
                    align: "center",
                    dataIndex: 'customerTitle'
                },
                {
                    title: '我方主体',
                    align: "center",
                    dataIndex: 'ourTitle'
                },
                {
                    title: '更新人',
                    align: "center",
                    dataIndex: 'updateBy'
                },
                {
                    title: '创建日期',
                    align: "center",
                    dataIndex: 'createTime'
                },
                {
                    title: '备注',
                    align: "center",
                    dataIndex: 'remarks'
                },
                {
                    title: '来源',
                    align: "center",
                    dataIndex: 'source',
                    width: 120,
                    customRender: (text, record) => {
                        const remarks = record.remarks
                        if (!remarks) {
                            return 'WEB资金池'
                        }
                        const remarksStr = String(remarks).trim()
                        if (remarksStr === '银行到账') {
                            return '银行API'
                        } else if (remarksStr === '对公备款' || remarksStr === '对私备款') {
                            return 'WEB资金池'
                        } else if (remarksStr.startsWith('对公备款') || remarksStr.startsWith('对私备款')) {
                            return 'H5工作台'
                        } else {
                            return '解析失败:' + remarksStr
                        }
                    }
                },
                {
                    title: '操作',
                    dataIndex: 'action',
                    align: "center",
                    fixed: "right",
                    width: 100,
                    scopedSlots: { customRender: 'action' }
                }
            ],
            url: {
                list: "/projectFundReserve/list",
                delete: "/projectFundReserve/delete",
                deleteBatch: "/projectFundReserve/deleteBatch",
                exportXlsUrl: "/projectFundReserve/exportXls",
                importExcelUrl: "projectFundReserve/importExcel",
                downloadTemplateUrl: "/projectFundReserve/downloadTemplate",
                importCustomerArrivalUrl: "/projectFundReserve/importData",
                projectManageList: "/projectmanage/list",
                bankAccountList: "/bankAccount/list"
            },
            dictOptions: {},
            superFieldList: [],
            // 导入确认相关
            importConfirmVisible: false,
            importDataList: [],
            importLoading: false,
            projects: [],
            bankAccounts: [],
            // 缓存数据，用于显示ID信息
            cachedProjects: [],
            cachedBankAccounts: [],
            importColumns: [
                {
                    title: '项目名称',
                    dataIndex: 'proName',
                    width: 200,
                    scopedSlots: { customRender: 'proNameSlot' }
                },
                {
                    title: '项目ID',
                    dataIndex: 'proId',
                    width: 100,
                    scopedSlots: { customRender: 'proIdSlot' }
                },
                {
                    title: '到账金额',
                    dataIndex: 'arrivalAmount',
                    width: 120
                },
                {
                    title: '到账时间',
                    dataIndex: 'arrivalTime',
                    width: 120,
                    scopedSlots: { customRender: 'arrivalTimeSlot' }
                },
                {
                    title: '资金性质',
                    dataIndex: 'fundsNature',
                    width: 120,
                    scopedSlots: { customRender: 'fundsNatureSlot' }
                },
                {
                    title: '项目主体',
                    dataIndex: 'customerTitle',
                    width: 200,
                    scopedSlots: { customRender: 'customerTitleSlot' }
                },
                {
                    title: '项目主体ID',
                    dataIndex: 'customerTitleId',
                    width: 200,
                    scopedSlots: { customRender: 'customerTitleIdSlot' }
                },
                {
                    title: '我方主体',
                    dataIndex: 'ourTitle',
                    width: 200,
                    scopedSlots: { customRender: 'ourTitleSlot' }
                },
                {
                    title: '我方主体ID',
                    dataIndex: 'ourTitleId',
                    width: 200,
                    scopedSlots: { customRender: 'ourTitleIdSlot' }
                },
                // {
                //     title: '操作',
                //     dataIndex: 'action',
                //     width: 120,
                //     fixed: 'right',
                //     scopedSlots: { customRender: 'actionSlot' }
                // }
            ],
            queryParam: {
                fundsNature: '1'
            }
        }
    },
    created() {
        this.getSuperFieldList();
    },
    mounted() {
        this.queryParam.fundsNature = '1'
    },
    computed: {
        importExcelUrl: function () {
            return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
        },

    },
    watch: {
        createTime(newVal) {
            this.queryParam.arrivalTimeJoint = newVal.join(',')
        }
    },
    methods: {
        filterProjectAccountList(record) {
            // // console.log(record, 'recordrecordrecordrecordrecordrecordrecordrecord')
            // // console.log(this.bankAccounts, 'this.bankAccounts')
            return this.bankAccounts.filter(item => item.source === '1' && item.customerId == record.LONGID);
        },
        fundsNatureChange() {
            this.queryParam.fundsNature = this.currentFundsNature
            this.loadData()
        },

        // 重写loadData方法，在查询时保存项目和银行账户信息
        async loadData(arg) {
            if (arg === 1) {
                this.ipagination.current = 1;
            }
            var params = this.getQueryParams();//查询条件
            this.loading = true;
            try {
                // 同时获取项目和银行账户数据用于缓存
                const [projectRes, bankAccountRes] = await Promise.all([
                    getAction(this.url.projectManageList, { pageNo: 1, pageSize: 10000 }),
                    getAction(this.url.bankAccountList, { pageNo: 1, pageSize: 10000 })
                ]);

                if (projectRes.success) {
                    this.cachedProjects = projectRes.result.records || [];
                }
                if (bankAccountRes.success) {
                    this.cachedBankAccounts = bankAccountRes.result.records || [];
                }

                // 获取主数据
                const res = await getAction(this.url.list, params);
                if (res.success) {
                    this.dataSource = res.result.records;
                    this.ipagination.total = res.result.total;
                }
            } catch (error) {
            } finally {
                this.loading = false;
            }
        },
        // 下载模板
        async downloadTemplate() {
            try {
                // 获取下拉选项数据
                const [projectRes, bankAccountRes] = await Promise.all([
                    getAction(this.url.projectManageList, { pageNo: 1, pageSize: 10000 }),
                    getAction(this.url.bankAccountList, { pageNo: 1, pageSize: 10000 })
                ]);

                if (!projectRes.success || !bankAccountRes.success) {
                    this.$message.error('获取下拉选项数据失败');
                    return;
                }

                // 提取项目和账户数据
                const projects = projectRes.result.records || [];
                const bankAccounts = bankAccountRes.result.records || [];
                // 生成纯名称格式的选项
                const projectOptions = projects.map(p => p.proName);
                const bankAccountOptions = bankAccounts.map(a => a.corporateName);

                // 创建工作簿
                const wb = XLSX.utils.book_new();

                // 创建 Sheet1：上传模板
                const headers = ['项目', '到账金额', '到账时间', '资金性质', '项目主体', '我方主体'];
                const ws1 = XLSX.utils.aoa_to_sheet([headers]);

                // 设置列宽
                ws1['!cols'] = [
                    { wch: 30 }, // 项目
                    { wch: 15 }, // 到账金额
                    { wch: 15 }, // 到账时间
                    { wch: 10 }, // 资金性质
                    { wch: 30 }, // 项目主体
                    { wch: 30 }  // 我方主体
                ];

                // 添加数据验证（下拉选项）
                const fundsNatureOptions = ['对公', '对私'];

                // 为项目列（A列）设置下拉选项，引用 Sheet2 的 A 列
                const projectRange = `Sheet2!A2:A${projectOptions.length + 1}`;
                for (let row = 2; row <= 100; row++) {
                    const cellAddress = `A${row}`;
                    ws1[cellAddress] = { t: 's', v: '' };
                    if (!ws1['!dataValidation']) ws1['!dataValidation'] = {};
                    ws1['!dataValidation'][cellAddress] = {
                        type: 'list',
                        allowBlank: true,
                        formula1: projectRange,
                        showDropDown: true
                    };
                }

                // 为资金性质列（D列）设置固定下拉选项
                for (let row = 2; row <= 100; row++) {
                    const cellAddress = `D${row}`;
                    ws1[cellAddress] = { t: 's', v: '' };
                    if (!ws1['!dataValidation']) ws1['!dataValidation'] = {};
                    ws1['!dataValidation'][cellAddress] = {
                        type: 'list',
                        allowBlank: true,
                        formula1: `"${fundsNatureOptions.join(',')}"`,
                        showDropDown: true
                    };
                }

                // 为项目主体列（E列）设置下拉选项，引用 Sheet2 的 B 列
                const customerTitleRange = `Sheet2!B2:B${bankAccountOptions.length + 1}`;
                for (let row = 2; row <= 100; row++) {
                    const cellAddress = `E${row}`;
                    ws1[cellAddress] = { t: 's', v: '' };
                    if (!ws1['!dataValidation']) ws1['!dataValidation'] = {};
                    ws1['!dataValidation'][cellAddress] = {
                        type: 'list',
                        allowBlank: true,
                        formula1: customerTitleRange,
                        showDropDown: true
                    };
                }

                // 为我方抬头列（F列）设置下拉选项，引用 Sheet2 的 C 列
                const ourTitleRange = `Sheet2!C2:C${bankAccountOptions.length + 1}`;
                for (let row = 2; row <= 100; row++) {
                    const cellAddress = `F${row}`;
                    ws1[cellAddress] = { t: 's', v: '' };
                    if (!ws1['!dataValidation']) ws1['!dataValidation'] = {};
                    ws1['!dataValidation'][cellAddress] = {
                        type: 'list',
                        allowBlank: true,
                        formula1: ourTitleRange,
                        showDropDown: true
                    };
                }

                // 创建 Sheet2：附加选择列表
                const ws2Data = [
                    ['项目', '项目主体', '我方主体'],
                    ...Array(Math.max(projectOptions.length, bankAccountOptions.length)).fill().map((_, i) => [
                        projectOptions[i] || '',
                        bankAccountOptions[i] || '',
                        bankAccountOptions[i] || ''
                    ])
                ];
                const ws2 = XLSX.utils.aoa_to_sheet(ws2Data);
                ws2['!cols'] = [
                    { wch: 30 }, // 项目
                    { wch: 30 }, // 项目主体
                    { wch: 30 }  // 我方主体
                ];

                // 将工作表添加到工作簿
                XLSX.utils.book_append_sheet(wb, ws1, 'Sheet1');
                XLSX.utils.book_append_sheet(wb, ws2, 'Sheet2');

                // 生成 Excel 文件并下载
                const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                const blob = new Blob([wbout], { type: 'application/octet-stream' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = '客户到账上传模板.xlsx';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);

                this.$message.success('模板下载成功');
            } catch (error) {
                this.$message.error(`生成模板失败：${error.message}`);
            }
        },

        // 上传前检查
        beforeUpload(file) {
            const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                file.type === 'application/vnd.ms-excel';
            if (!isExcel) {
                this.$message.error('只能上传Excel文件!');
                return false;
            }
            const isLt10M = file.size / 1024 / 1024 < 10;
            if (!isLt10M) {
                this.$message.error('文件大小不能超过10MB!');
                return false;
            }
            return true;
        },

        // 处理导入Excel
        handleImportExcel(info) {
            if (info.file.status === 'done') {
                if (info.file.response.success) {
                    this.$message.success('导入成功');
                    this.searchQuery();
                } else {
                    this.$message.error(info.file.response.message || '导入失败');
                }
            } else if (info.file.status === 'error') {
                this.$message.error('导入失败');
            }
        },

        // 自定义导入处理 - 前端解析Excel文件
        async handleCustomImport({ file }) {
            await this.parseExcelFile(file);
        },

        // 解析Excel文件
        async parseExcelFile(file) {
            let projects = [];
            let bankAccounts = [];

            try {
                // 优先使用缓存的数据，如果没有则重新获取
                if (this.cachedProjects.length > 0 && this.cachedBankAccounts.length > 0) {
                    projects = this.cachedProjects;
                    bankAccounts = this.cachedBankAccounts;
                } else {
                    // 获取项目和银行账户数据
                    const [projectRes, bankAccountRes] = await Promise.all([
                        getAction(this.url.projectManageList, { pageNo: 1, pageSize: 10000 }),
                        getAction(this.url.bankAccountList, { pageNo: 1, pageSize: 10000 })
                    ]);

                    if (!projectRes.success || !bankAccountRes.success) {
                        this.$message.error('获取下拉选项数据失败');
                        return;
                    }

                    projects = projectRes.result.records || [];
                    bankAccounts = bankAccountRes.result.records || [];

                    // 保存到缓存中
                    this.cachedProjects = projects;
                    this.cachedBankAccounts = bankAccounts;
                }

                // 保存到data中供模板使用
                this.projects = projects;
                this.bankAccounts = bankAccounts;

                // 调试信息：打印获取到的数据

                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, {
                            type: 'array',
                            cellDates: true,
                            cellNF: true,
                            cellText: false
                        });

                        const firstSheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[firstSheetName];
                        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:AZ10000');

                        let headerRow = 1;
                        let headers = [];
                        for (let C = range.s.c; C <= range.e.c; ++C) {
                            const cellAddress = XLSX.utils.encode_cell({ r: headerRow - 1, c: C });
                            const cell = worksheet[cellAddress];
                            headers.push(cell ? (cell.w || cell.v || '').toString().trim() : '');
                        }


                        const fieldMapping = {
                            '项目': 'proName',
                            '到账金额': 'arrivalAmount',
                            '到账时间': 'arrivalTime',
                            '资金性质': 'fundsNature',
                            '项目主体': 'customerTitle',
                            '我方主体': 'ourTitle'
                        };

                        const mappedHeaders = headers.map(header => fieldMapping[header] || header);


                        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                            header: mappedHeaders,
                            range: headerRow,
                            defval: '',
                            raw: false
                        });


                        const processedData = jsonData.map((row, index) => {
                            const processedRow = {};

                            // 根据名称查找ID的函数 - 只进行精确匹配，如果匹配到多条则清空
                            const findIdByName = (name, options, fieldName) => {
                                if (!name) {
                                    return '';
                                }
                                const nameValue = String(name).trim();

                                // 调试信息：打印所有可用的选项

                                // 查找所有匹配的选项
                                const matchedOptions = options.filter(opt => opt.name === nameValue);

                                if (matchedOptions.length === 0) {
                                    this.$message.warning(`第 ${index + 1} 行${fieldName}未找到精确匹配项，当前值: "${nameValue}"`);
                                    return '';
                                } else if (matchedOptions.length === 1) {
                                    return matchedOptions[0].id;
                                } else {
                                    this.$message.warning(`第 ${index + 1} 行${fieldName}匹配到多条数据，请在确认界面手动选择，当前值: "${nameValue}"`);
                                    return '';
                                }
                            };

                            // 处理项目
                            processedRow.proName = row.proName ? String(row.proName).trim() : '';
                            processedRow.proId = findIdByName(row.proName, projects.map(p => ({ id: p.uniqueId, name: p.proName })), '项目');
                            processedRow.LONGID = findIdByName(row.proName, projects.map(p => ({ id: p.id, name: p.proName })), '项目');

                            // 处理项目主体
                            processedRow.customerTitle = row.customerTitle ? String(row.customerTitle).trim() : '';
                            processedRow.customerTitleId = findIdByName(row.customerTitle, bankAccounts.map(a => ({ id: a.id, name: a.corporateName })), '项目主体');

                            // 处理我方抬头
                            processedRow.ourTitle = row.ourTitle ? String(row.ourTitle).trim() : '';
                            processedRow.ourTitleId = findIdByName(row.ourTitle, bankAccounts.map(a => ({ id: a.id, name: a.corporateName })), '我方主体');

                            // 处理到账金额
                            processedRow.arrivalAmount = row.arrivalAmount ? String(row.arrivalAmount).trim() : '';
                            if (processedRow.arrivalAmount && isNaN(parseFloat(processedRow.arrivalAmount))) {
                                this.$message.warning(`第 ${index + 1} 行到账金额格式不正确，应为数字，当前值: ${processedRow.arrivalAmount}`);
                                processedRow.arrivalAmount = '';
                            }

                            // 处理资金性质
                            const nature = (row.fundsNature || '').toString().trim().toLowerCase();
                            processedRow.fundsNature = nature.includes('对公') ? '1' : nature.includes('对私') ? '2' : '1';

                            // 处理日期
                            if (row.arrivalTime) {
                                let parsedDate;
                                if (typeof row.arrivalTime === 'number') {
                                    try {
                                        const date = XLSX.SSF.parse_date_code(row.arrivalTime);
                                        parsedDate = moment({
                                            year: date.y,
                                            month: date.m - 1,
                                            day: date.d
                                        });
                                    } catch (e) {
                                        this.$message.warning(`第 ${index + 1} 行到账时间格式不正确，值: ${row.arrivalTime}`);
                                        parsedDate = null;
                                    }
                                } else {
                                    const strValue = String(row.arrivalTime).trim();
                                    parsedDate = moment(strValue, [
                                        'YYYY-MM-DD',
                                        'M/D/YYYY',
                                        'YYYY/M/D',
                                        'MM/DD/YY',
                                        'M/D/YY',
                                        'MM-DD-YY',
                                        'M-D-YY'
                                    ], true);
                                }
                                if (parsedDate && parsedDate.isValid()) {
                                    // 确保年份为四位数
                                    const year = parsedDate.year();
                                    if (year < 100) {
                                        parsedDate.year(year + 2000); // 假设 00-99 表示 2000-2099
                                    }
                                    processedRow.arrivalTime = parsedDate.format('YYYY-MM-DD');
                                } else {
                                    this.$message.warning(`第 ${index + 1} 行到账时间格式不正确，应为 YYYY-MM-DD 或类似格式，当前值: ${row.arrivalTime}`);
                                    processedRow.arrivalTime = '';
                                }
                            } else {
                                this.$message.warning(`第 ${index + 1} 行到账时间为空`);
                                processedRow.arrivalTime = '';
                            }

                            return processedRow;
                        });

                        // 过滤掉完全无效的行（所有ID都为空的行）
                        const validData = processedData.filter(row => {
                            const hasAnyId = row.proId || row.customerTitleId || row.ourTitleId;
                            return hasAnyId;
                        });

                        if (validData.length === 0) {
                            this.$message.warning('Excel 文件中没有有效数据，所有行均缺少必要的匹配项');
                            return;
                        }

                        // 检查是否有未完全匹配的行
                        const incompleteRows = validData.filter(row => !row.proId || !row.customerTitleId || !row.ourTitleId);
                        if (incompleteRows.length > 0) {
                            this.$message.warning(`发现 ${incompleteRows.length} 行数据未完全匹配，请在确认界面中手动选择正确的匹配项`);
                        }

                        this.importDataList = validData;
                        this.importConfirmVisible = true;
                        this.$message.success(`Excel文件解析成功，共解析到 ${validData.length} 条有效数据，请确认数据`);
                    } catch (error) {
                        this.$message.error(`解析Excel文件失败：${error.message}`);
                    }
                };
                reader.onerror = () => {
                    this.$message.error('读取文件失败，请检查文件是否损坏');
                };
                reader.readAsArrayBuffer(file);
            } catch (error) {
                this.$message.error(`解析Excel文件失败：${error.message}`);
            }
        },

        // 确认导入
        handleConfirmImport() {
            if (this.importDataList.length === 0) {
                this.$message.warning('没有数据可导入');
                return;
            }

            // 验证数据完整性
            for (let i = 0; i < this.importDataList.length; i++) {
                const row = this.importDataList[i];
                if (!row.proId) {
                    this.$message.error(`第 ${i + 1} 行项目未找到匹配项`);
                    return;
                }
                if (!row.arrivalAmount || isNaN(parseFloat(row.arrivalAmount))) {
                    this.$message.error(`第 ${i + 1} 行到账金额格式不正确`);
                    return;
                }
                if (!row.arrivalTime) {
                    this.$message.error(`第 ${i + 1} 行到账时间缺失`);
                    return;
                }
                if (!row.fundsNature) {
                    this.$message.error(`第 ${i + 1} 行资金性质缺失`);
                    return;
                }
                // if (!row.customerTitleId) {
                //     this.$message.error(`第 ${i + 1} 行项目主体未找到匹配项`);
                //     return;
                // }
                // if (!row.ourTitleId) {
                //     this.$message.error(`第 ${i + 1} 行我方主体未找到匹配项`);
                //     return;
                // }
            }

            this.importLoading = true;
            // 准备提交数据，仅包含必要字段
            const submitData = this.importDataList.map(row => ({
                proId: row.proId,
                arrivalAmount: row.arrivalAmount,
                arrivalTime: row.arrivalTime,
                fundsNature: row.fundsNature,
                customerTitleId: row.customerTitleId,
                ourTitleId: row.ourTitleId
            }));

            // const formData = new FormData();
            // formData.append('data', JSON.stringify(submitData));
            // formData.append('templateType', 'customerArrival');
            postAction(this.url.importCustomerArrivalUrl, submitData).then(res => {
                this.importLoading = false;
                if (res.success) {
                    this.$message.success('客户到账数据导入成功');
                    this.importConfirmVisible = false;
                    this.importDataList = [];
                    this.searchQuery();
                } else {
                    this.$message.error(res.message || '导入失败');
                }
            }).catch(err => {
                this.importLoading = false;
                this.$message.error(`导入失败：${err.message}`);
            });
        },

        // 取消导入
        handleImportCancel() {
            this.importConfirmVisible = false;
            this.importDataList = [];
            this.importLoading = false;
        },

        // 编辑导入行数据
        handleEditImportRow(record, index) {
            this.$message.info('请在表格中直接编辑数据');
        },

        // 删除导入行数据
        handleDeleteImportRow(index) {
            this.$confirm({
                title: '确认删除',
                content: '确定要删除这条数据吗？',
                onOk: () => {
                    this.importDataList.splice(index, 1);
                    this.$message.success('删除成功');
                }
            });
        },

        // 处理项目ID变化
        handleProIdChange(value, record) {
            const project = this.projects.find(p => p.uniqueId === value);
            if (project) {
                record.proName = project.proName;
            }
        },

        // 处理项目主体ID变化
        handleCustomerTitleIdChange(value, record) {
            const account = this.bankAccounts.find(a => a.id === value);
            if (account) {
                record.customerTitle = account.corporateName;
            }
        },

        // 处理我方抬头ID变化
        handleOurTitleIdChange(value, record) {
            const account = this.bankAccounts.find(a => a.id === value);
            if (account) {
                record.ourTitle = account.corporateName;
            }
        },

        // 撤回操作
        handleReview(id) {
            const formData = new FormData();
            formData.append('id', id);
            postAction('/projectFundReserve/revokeFundReserve', formData).then(res => {
                if (res.success) {
                    this.$message.success('撤回成功');
                    this.searchQuery();
                } else {
                    this.$message.error(res.message || '撤回失败');
                }
            }).catch(err => {
                this.$message.error(`撤回失败：${err.message}`);
            });
        },

        // 编辑记录
        handleEdit(record) {
            this.$refs.editModal.edit(record);
            this.$refs.editModal.title = "编辑";
        },
        // 分配记录
        handleAllocate(record) {
            this.$refs.allocateModal.edit(record);
            this.$refs.allocateModal.title = "分配";
        },
        // 根据备注获取来源文本
        getSourceText(remarks) {
            if (!remarks) {
                return '资金池';
            }
            const remarksStr = String(remarks).trim();
            if (remarksStr === '银行到账') {
                return '银行API';
            } else if (remarksStr.startsWith('对公备款') || remarksStr.startsWith('对私备款')) {
                return 'H5工作台';
            } else {
                return '资金池';
            }
        },

        initDictConfig() {
        },

        getSuperFieldList() {
            let fieldList = [];
            fieldList.push({ type: 'string', value: 'proName', text: '项目名称', dictCode: '' });
            fieldList.push({ type: 'string', value: 'collaborationMode', text: '合作方式', dictCode: '' });
            fieldList.push({ type: 'number', value: 'arrivalAmount', text: '到账金额', dictCode: '' });
            fieldList.push({ type: 'string', value: 'arrivalTime', text: '到账时间', dictCode: '' });
            fieldList.push({ type: 'string', value: 'fundsNature', text: '资金性质', dictCode: '' });
            fieldList.push({ type: 'string', value: 'customerTitle', text: '项目主体', dictCode: '' });
            fieldList.push({ type: 'string', value: 'ourTitle', text: '我方主体', dictCode: '' });
            fieldList.push({ type: 'string', value: 'createBy', text: '创建人', dictCode: '' });
            fieldList.push({ type: 'string', value: 'createTime', text: '创建日期', dictCode: '' });
            fieldList.push({ type: 'string', value: 'state', text: '状态', dictCode: '' });
            fieldList.push({ type: 'Text', value: 'remarks', text: '备注', dictCode: '' });
            this.superFieldList = fieldList;
        }
    }
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>