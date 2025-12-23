<template>
    <a-card :bordered="false">
        <!-- 查询区域 -->
        <div class="table-page-search-wrapper">
            <a-form layout="inline" @keyup.enter.native="searchQuery">
                <a-row :gutter="24">
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="合同编号">
                            <a-input placeholder="请输入合同编号" v-model="queryParam.contractNo"></a-input>
                        </a-form-item>
                    </a-col>
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="合同名称">
                            <a-input placeholder="请输入合同名称" v-model="queryParam.contractName"></a-input>
                        </a-form-item>
                    </a-col>
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="合同类型">
                            <a-select placeholder="请选择合同类型" v-model="queryParam.contractType" :allowClear="true">
                                <a-select-option value="代运营合同">代运营合同</a-select-option>
                                <a-select-option value="代运营垫付预付合同">代运营垫付预付合同</a-select-option>
                                <a-select-option value="自运营合同">自运营合同</a-select-option>
                                <a-select-option value="自运营垫付预付合同">自运营垫付预付合同</a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="甲方单位名称">
                            <a-input placeholder="请输入甲方单位名称" v-model="queryParam.partyAName"></a-input>
                        </a-form-item>
                    </a-col>
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="项目名称">
                            <j-multi-select-tag v-model="queryParam.proId" placeholder="请选择项目"
                                dictCode="projectmanage,pro_name,id,del_flag = '0'"></j-multi-select-tag>
                        </a-form-item>
                    </a-col>
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="流程状态">
                            <a-select placeholder="请选择流程状态" v-model="queryParam.processStatus" :allowClear="true">
                                <a-select-option value="1">待提交</a-select-option>
                                <a-select-option value="2">审批中</a-select-option>
                                <a-select-option value="3">通过</a-select-option>
                                <a-select-option value="4">驳回</a-select-option>
                                <a-select-option value="5">撤回</a-select-option>
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
            <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
        </div>

        <!-- table区域-begin -->
        <div>
            <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;" v-if="hasSelected">
                <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择
                <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项
                <a style="margin-left: 24px" @click="onClearSelected">清空</a>
            </div>

            <a-table ref="table" size="middle" :scroll="{ x: true }" bordered rowKey="id" :columns="columns"
                :dataSource="dataSource" :pagination="ipagination" :loading="loading"
                :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
                class="j-table-force-nowrap" @change="handleTableChange">
                <span slot="action" slot-scope="text, record">
                    <template v-if="record.isArchive === '0'">
                        <a @click="handleArchive(record)">归档</a>
                    </template>
                    <template v-else>
                        <a @click="handleViewFiles(record)">查看文件</a>
                    </template>
                </span>
            </a-table>
        </div>
        <!-- table区域-END -->

        <contract-info-modal ref="modalForm" @ok="modalFormOk"></contract-info-modal>

        <!-- 归档弹窗 -->
        <a-modal title="合同归档" :visible="archiveModalVisible" :confirmLoading="archiveLoading" @ok="handleArchiveSubmit"
            @cancel="handleArchiveCancel" width="600px">
            <div>
                <a-form-item label="上传附件" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
                    <a-upload name="file" :multiple="true" :fileList="archiveFileList"
                        :beforeUpload="beforeArchiveUpload" @remove="handleArchiveRemove">
                        <a-button>
                            <a-icon type="upload" />
                            选择文件
                        </a-button>
                    </a-upload>
                    <div style="margin-top: 8px; color: #999; font-size: 12px;">
                        支持上传多个附件
                    </div>
                </a-form-item>
            </div>
        </a-modal>

        <!-- 查看文件弹窗 -->
        <a-modal title="查看文件" :visible="fileListModalVisible" @cancel="handleFileListCancel" :footer="null"
            width="800px">
            <a-spin :spinning="fileListLoading">
                <a-empty v-if="!fileListLoading && fileList.length === 0" description="暂无文件" />
                <a-list v-else :dataSource="fileList" itemLayout="horizontal">
                    <a-list-item slot="renderItem" slot-scope="item">
                        <a-list-item-meta>
                            <template slot="title">
                                <a-icon type="file" style="margin-right: 8px;" />
                                {{ item.fileName || item.name || '未知文件' }}
                            </template>
                            <template slot="description">
                                <span v-if="item.fileSize">大小: {{ formatFileSize(item.fileSize) }}</span>
                                <span v-if="item.createTime" style="margin-left: 16px;">上传时间: {{ item.createTime
                                }}</span>
                            </template>
                        </a-list-item-meta>
                        <template slot="actions">
                            <a-button type="link" icon="download" @click="downloadFile(item)">下载</a-button>
                        </template>
                    </a-list-item>
                </a-list>
            </a-spin>
        </a-modal>
    </a-card>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { getAction, httpAction, getFileAccessHttpUrl } from '@/api/manage'
import { filterObj } from '@/utils/util'
import ContractInfoModal from './modules/ContractInfoModal'

export default {
    name: 'ContractInfoList',
    mixins: [JeecgListMixin],
    components: {
        ContractInfoModal
    },
    data() {
        return {
            description: '合同信息管理页面',
            // 查询条件
            queryParam: {},
            // 归档相关
            archiveModalVisible: false,
            archiveLoading: false,
            archiveFileList: [],
            currentArchiveRecord: null,
            // 查看文件相关
            fileListModalVisible: false,
            fileListLoading: false,
            fileList: [],
            // 表头
            columns: [
                {
                    title: '流程状态',
                    align: 'center',
                    dataIndex: 'processStatus',
                    width: 100,
                    customRender: (text) => {
                        const statusMap = {
                            '1': '待提交',
                            '2': '审批中',
                            '3': '通过',
                            '4': '驳回',
                            '5': '撤回'
                        }
                        return statusMap[text] || text
                    }
                },
                {
                    title: '合同编号',
                    align: 'center',
                    dataIndex: 'contractNo',
                    width: 150
                },
                // {
                //     title: '合同名称',
                //     align: 'center',
                //     dataIndex: 'contractName',
                //     width: 200
                // },
                {
                    title: '项目名称',
                    align: 'center',
                    dataIndex: 'proName',
                    customRender: (text) => {
                        return text ? (
                            <a-tooltip title={text}>
                                <span style="display: inline-block; width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                    {text}
                                </span>
                            </a-tooltip>
                        ) : text
                    }
                },
                {
                    title: '甲方单位名称',
                    align: 'center',
                    dataIndex: 'partyAName',
                    width: 200
                },
                {
                    title: '付款账号',
                    align: 'center',
                    dataIndex: 'partyAAccount',
                    width: 150
                },
                {
                    title: '乙方单位名称',
                    align: 'center',
                    dataIndex: 'accountName',
                    width: 150
                },
                {
                    title: '签约日期',
                    align: 'center',
                    dataIndex: 'signDate',
                    width: 120
                },
                {
                    title: '截至日期',
                    align: 'center',
                    dataIndex: 'endDate',
                    width: 120
                },
                {
                    title: '合作方式',
                    align: 'center',
                    dataIndex: 'cooperationType',
                    width: 120
                },
                {
                    title: '操作',
                    dataIndex: 'action',
                    align: 'center',
                    fixed: 'right',
                    width: 100,
                    scopedSlots: { customRender: 'action' }
                }
            ],
            url: {
                list: '/contractInfo/list',
                delete: '/contractInfo/delete',
                deleteBatch: '/contractInfo/deleteBatch',
                exportXlsUrl: '/contractInfo/exportXls',
                importExcelUrl: '/contractInfo/importExcel'
            }
        }
    },
    computed: {
        hasSelected() {
            return this.selectedRowKeys.length > 0
        }
    },
    methods: {
        // 重写 getQueryParams 方法，将多选的项目ID数组转换为逗号分隔的字符串
        getQueryParams() {
            let sqp = {}
            if (this.superQueryParams) {
                sqp['superQueryParams'] = encodeURI(this.superQueryParams)
                sqp['superQueryMatchType'] = this.superQueryMatchType
            }
            var param = Object.assign({}, sqp, this.queryParam, this.isorter, this.filters)

            // 处理项目ID多选：如果是数组，转换为逗号分隔的字符串
            if (param.proId && Array.isArray(param.proId)) {
                param.proId = param.proId.join(',')
            }

            param.field = this.getQueryField()
            param.pageNo = this.ipagination.current
            param.pageSize = this.ipagination.pageSize
            return filterObj(param)
        },
        // 审批通过
        handleAgree(id) {
            httpAction('/contractInfo/agree', { id }, 'POST').then(res => {
                if (res.success) {
                    this.$message.success(res.message || '审批通过成功')
                    this.loadData()
                } else {
                    this.$message.warning(res.message || '操作失败')
                }
            }).catch(() => {
                this.$message.error('操作失败')
            })
        },
        // 审批驳回
        handleRefuse(id) {
            httpAction('/contractInfo/refuse', { id }, 'POST').then(res => {
                if (res.success) {
                    this.$message.success(res.message || '审批驳回成功')
                    this.loadData()
                } else {
                    this.$message.warning(res.message || '操作失败')
                }
            }).catch(() => {
                this.$message.error('操作失败')
            })
        },
        // 提交人撤回
        handleRevoke(id) {
            httpAction('/contractInfo/revoke', { id }, 'POST').then(res => {
                if (res.success) {
                    this.$message.success(res.message || '撤回成功')
                    this.loadData()
                } else {
                    this.$message.warning(res.message || '操作失败')
                }
            }).catch(() => {
                this.$message.error('操作失败')
            })
        },
        // 归档
        handleArchive(record) {
            this.currentArchiveRecord = record
            this.archiveFileList = []
            this.archiveModalVisible = true
        },
        // 归档弹窗取消
        handleArchiveCancel() {
            this.archiveModalVisible = false
            this.archiveFileList = []
            this.currentArchiveRecord = null
        },
        // 归档文件上传前处理
        beforeArchiveUpload(file) {
            this.archiveFileList = [...this.archiveFileList, file]
            return false // 阻止自动上传
        },
        // 归档文件移除
        handleArchiveRemove(file) {
            const index = this.archiveFileList.indexOf(file)
            const newFileList = this.archiveFileList.slice()
            newFileList.splice(index, 1)
            this.archiveFileList = newFileList
        },
        // 归档提交
        handleArchiveSubmit() {
            if (!this.currentArchiveRecord) {
                this.$message.warning('未选择要归档的合同')
                return
            }

            if (this.archiveFileList.length === 0) {
                this.$message.warning('请至少上传一个附件')
                return
            }

            this.archiveLoading = true
            const formData = new FormData()

            // 添加所有文件到FormData
            this.archiveFileList.forEach(file => {
                formData.append('files', file)
            })

            // id作为query参数，files作为body参数（FormData）
            const url = `/contractInfo/archive?id=${this.currentArchiveRecord.id}`

            httpAction(url, formData, 'POST').then(res => {
                this.archiveLoading = false
                if (res.success) {
                    this.$message.success(res.message || '归档成功')
                    this.archiveModalVisible = false
                    this.archiveFileList = []
                    this.currentArchiveRecord = null
                    this.loadData()
                } else {
                    this.$message.warning(res.message || '归档失败')
                }
            }).catch(() => {
                this.archiveLoading = false
                this.$message.error('归档失败')
            })
        },
        // 查看文件
        handleViewFiles(record) {
            this.fileListModalVisible = true
            this.fileList = []
            this.fileListLoading = true
            getAction('/fileInfo/listNotPage', { bizId: record.id }).then(res => {
                this.fileListLoading = false
                if (res.success) {
                    this.fileList = res.result || []
                } else {
                    this.$message.warning(res.message || '获取文件列表失败')
                }
            }).catch(() => {
                this.fileListLoading = false
                this.$message.error('获取文件列表失败')
            })
        },
        // 关闭文件列表弹窗
        handleFileListCancel() {
            this.fileListModalVisible = false
            this.fileList = []
        },
        // 下载文件
        downloadFile(file) {
            console.log(file)
            const filePath = file.path || file.url
            if (!filePath) {
                this.$message.warning('文件路径不存在')
                return
            }
            const url = getFileAccessHttpUrl(filePath)
            window.open(url, '_blank')
        },
        // 格式化文件大小
        formatFileSize(bytes) {
            if (!bytes || bytes === 0) return '0 B'
            const k = 1024
            const sizes = ['B', 'KB', 'MB', 'GB']
            const i = Math.floor(Math.log(bytes) / Math.log(k))
            return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
        }
    }
}
</script>

<style scoped>
@import '~@assets/less/common.less';
</style>
