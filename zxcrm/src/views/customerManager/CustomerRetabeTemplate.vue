<template>
    <a-card :bordered="false">
        <!-- 查询区域 -->
        <div class="table-page-search-wrapper">
            <a-form layout="inline" @keyup.enter.native="searchQuery">
                <a-row :gutter="24">
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="模板名称">
                            <a-input placeholder="请输入模板名称" v-model="queryParam.rebateName"></a-input>
                        </a-form-item>
                    </a-col>
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="项目">
                            <JSearchSelectTag placeholder="请选择项目" v-model:value="queryParam.customerId"
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
            </a-form>
        </div>
        <!-- 查询区域-END -->

        <!-- 操作按钮区域 -->
        <div class="table-operator">
            <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
            <a-button type="primary" icon="download" @click="handleFrontendExport"
                :loading="frontendExportLoading">导出</a-button>
            <!-- <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader"
                :action="importExcelUrl" @change="handleImportExcel">
                <a-button type="primary" icon="import">导入</a-button>
            </a-upload> -->
            <!-- 高级查询区域 -->
            <j-super-query :fieldList="superFieldList" ref="superQueryModal"
                @handleSuperQuery="handleSuperQuery"></j-super-query>
            <!-- <a-dropdown v-if="selectedRowKeys.length > 0">
                <a-menu slot="overlay">
                    <a-menu-item key="1" @click="batchDel"><a-icon type="delete" />删除</a-menu-item>
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
                    <a @click="handleEdit(record)">编辑</a>
                    <a-divider type="vertical" />
                    <a @click="handleBinding(record)">关联账户</a>
                    <a-divider type="vertical" />
                    <!-- <a @click="handleRebate(record)">修改记录</a> -->
                    <a-dropdown>
                        <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
                        <a-menu slot="overlay">
                            <a-menu-item>
                                <a @click="handleRebate(record)">修改记录</a>
                            </a-menu-item>
                            <a-menu-item>
                                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                                    <a>删除</a>
                                </a-popconfirm>
                            </a-menu-item>
                        </a-menu>
                    </a-dropdown>
                </span>

            </a-table>
        </div>
        <rebate-drawer ref="rebateDrawer"></rebate-drawer>
        <binding-dia ref="BindingDia" @ok="modalFormOk"></binding-dia>
        <TemplateRebateModal ref="modalForm" @ok="modalFormOk"></TemplateRebateModal>
    </a-card>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import TemplateRebateModal from './modules/TemplateRebateModal.vue'
import RebateDrawer from './RebateDrawer.vue'
import bindingDia from './bindingDia.vue'
import * as XLSX from 'xlsx'
import { getAction } from '@/api/manage'

export default {
    name: 'CustomerRetabeTemplate',
    mixins: [JeecgListMixin, mixinDevice],
    components: {
        RebateDrawer,
        TemplateRebateModal,
        bindingDia
    },
    data() {
        return {
            description: '返点模板管理页面',
            // 表头
            columns: [
                {
                    title: 'id',
                    align: "center",
                    dataIndex: 'id',
                    width: 50
                },
                {
                    title: '模板名称',
                    align: "center",
                    dataIndex: 'rebateName'
                },
                {
                    title: '归属项目',
                    align: "center",
                    dataIndex: 'customerId_pro_name'
                },
                {
                    title: '渠道',
                    align: "center",

                    dataIndex: 'businessName'
                },
                {
                    title: '政策详情',
                    align: "center",
                    dataIndex: 'privateRebate',
                    customRender: (text, record) => {
                        const privateRebate = record.privateRebate === '' ? '-' : (record.privateRebate ? (record.privateRebate * 100).toFixed(2) + '%' : '0%');
                        const externalRebate = record.externalRebate === '' ? '-' : (record.externalRebate ? (record.externalRebate * 100).toFixed(2) + '%' : '0%');
                        return `对私返点：${privateRebate}，对公返点：${externalRebate}`
                    },
                },
                {
                    title: '备注',
                    align: "center",
                    dataIndex: 'remarks'
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
                list: "/customerRebateTemplate/list",
                delete: "/customerRebateTemplate/delete",
                deleteBatch: "/customerRebateTemplate/deleteBatch",
                exportXlsUrl: "/customerRebateTemplate/exportXls",
                importExcelUrl: "customerRebateTemplate/importExcel",
            },
            dictOptions: {},
            superFieldList: [],
            frontendExportLoading: false,
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
    methods: {
        initDictConfig() {
        },
        handleAdd() {
            this.$refs.modalForm.add();
        },
        handleRebate({ id }) {
            this.$refs['rebateDrawer'].show(id)
        },
        handleBinding({ id, customerId, rebateName }) {
            this.$refs['BindingDia'].showModal([], '', id, customerId, rebateName);
        },
        getSuperFieldList() {
            let fieldList = [];
            fieldList.push({ type: 'string', value: 'templateName', text: '模板名称', dictCode: '' })
            fieldList.push({ type: 'number', value: 'externalRebate', text: '对公返点' })
            fieldList.push({ type: 'number', value: 'privateRebate', text: '对私返点' })
            fieldList.push({ type: 'select', value: 'rebateForm', text: '返点形式', dictCode: 'rebate_form' })
            fieldList.push({ type: 'select', value: 'rebateMode', text: '返点模式', dictCode: 'rebate_mode' })
            this.superFieldList = fieldList
        },
        // 前端导出Excel
        async handleFrontendExport() {
            this.frontendExportLoading = true
            try {
                // 获取查询参数
                const params = this.getQueryParams()
                // 设置一个大的pageSize来获取所有数据
                params.pageNo = 1
                params.pageSize = 10000

                const response = await getAction(this.url.list, params)

                if (response && response.success) {
                    // 处理返回数据
                    let data = []
                    let total = 0

                    if (Array.isArray(response.result)) {
                        data = response.result
                        total = data.length
                    } else if (response.result && Array.isArray(response.result.records)) {
                        data = response.result.records
                        total = response.result.total || data.length
                    } else if (response.result && Array.isArray(response.result.list)) {
                        data = response.result.list
                        total = response.result.total || data.length
                    } else {
                        data = []
                        total = 0
                    }

                    if (data.length === 0) {
                        this.$message.warning('没有数据可导出')
                        return
                    }

                    // 过滤掉操作列和不需要导出的列
                    const exportColumns = this.columns.filter(col =>
                        col.dataIndex &&
                        col.dataIndex !== 'action' &&
                        !col.scopedSlots
                    )

                    // 准备表头
                    const headers = exportColumns.map(col => col.title)

                    // 准备数据行
                    const rows = data.map(item => {
                        return exportColumns.map(col => {
                            let value = item[col.dataIndex]

                            // 处理字典文本显示
                            if (col.dataIndex.endsWith('_dictText') || col.dataIndex.endsWith('_pro_name')) {
                                value = item[col.dataIndex]
                            }

                            // 处理自定义渲染（政策详情列）
                            if (col.customRender && typeof col.customRender === 'function') {
                                try {
                                    const rendered = col.customRender(value, item)
                                    if (typeof rendered === 'string') {
                                        value = rendered
                                    } else if (rendered && rendered.props && rendered.props.children) {
                                        const children = rendered.props.children
                                        if (Array.isArray(children)) {
                                            value = children.filter(c => typeof c === 'string').join('')
                                        } else if (typeof children === 'string') {
                                            value = children
                                        }
                                    }
                                } catch (e) {
                                    // 如果提取失败，使用原值
                                }
                            }

                            return value || ''
                        })
                    })

                    // 创建工作表数据
                    const worksheetData = []
                    if (total > 0 && total !== data.length) {
                        const totalRow = new Array(exportColumns.length).fill('')
                        totalRow[0] = `共 ${total} 条数据`
                        worksheetData.push(totalRow)
                    }
                    worksheetData.push(headers, ...rows)

                    // 创建工作簿
                    const workbook = XLSX.utils.book_new()
                    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

                    // 设置列宽
                    const colWidths = exportColumns.map(col => {
                        let width = Math.max(col.title.length * 2, 10)

                        // 特殊列宽度调整
                        if (col.dataIndex === 'rebateName') {
                            width = 20
                        } else if (col.dataIndex === 'customerId_pro_name' || col.dataIndex === 'businessName') {
                            width = 25
                        } else if (col.dataIndex === 'privateRebate') {
                            width = 30
                        } else if (col.dataIndex === 'remarks') {
                            width = 30
                        }

                        return { wch: width }
                    })

                    worksheet['!cols'] = colWidths

                    // 添加工作表到工作簿
                    XLSX.utils.book_append_sheet(workbook, worksheet, '返点模板')

                    // 生成文件名
                    const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_')
                    const fileName = `返点模板_${timestamp}.xlsx`

                    // 导出文件
                    XLSX.writeFile(workbook, fileName)

                    this.$message.success(`成功导出${data.length}条数据${total > data.length ? `（共${total}条）` : ''}`)
                } else {
                    this.$message.error('获取数据失败')
                }
            } catch (error) {
                console.error('前端导出失败:', error)
                this.$message.error('导出失败，请重试')
            } finally {
                this.frontendExportLoading = false
            }
        }
    }
}
</script>
<style scoped>
@import '~@assets/less/common.less';

.table-page-search-wrapper {
    background: #fff;
    border-radius: 4px;
    margin-bottom: 16px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
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
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.ant-alert {
    border-radius: 4px;
    margin-bottom: 16px;
}

.ant-table-thead>tr>th {
    background: #fafafa;
    font-weight: 500;
}

.ant-table-tbody>tr:hover>td {
    background: #f5f5f5;
}

.ant-table-row-selected td {
    background: #e6f7ff !important;
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

.ant-dropdown-menu {
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.ant-dropdown-menu-item {
    padding: 8px 16px;
}

.ant-dropdown-menu-item:hover {
    background: #f5f5f5;
}

@media screen and (max-width: 768px) {
    .table-page-search-wrapper {
        padding: 16px;
    }

    .ant-table-wrapper {
        padding: 16px;
    }

    .table-operator {
        flex-direction: column;
        align-items: stretch;
    }

    .table-operator .ant-btn {
        width: 100%;
        margin-bottom: 8px;
    }
}
</style>