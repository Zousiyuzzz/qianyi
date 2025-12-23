<template>
    <div>
        <a-card :bordered="false">
            <!-- 查询区域 -->
            <div class="table-page-search-wrapper">
                <a-form layout="inline" @keyup.enter.native="searchQuery">
                    <a-row :gutter="24">
                        <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <a-form-item label="批次号">
                                <a-input placeholder="请输入批次号" v-model="queryParam.batch"></a-input>
                            </a-form-item>
                        </a-col>
                        <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <a-form-item label="接收邮箱">
                                <a-input placeholder="请输入接收邮箱" v-model="queryParam.email"></a-input>
                            </a-form-item>
                        </a-col>
                        <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <a-form-item label="发送邮箱">
                                <a-input placeholder="请输入发送邮箱" v-model="queryParam.sendEmail"></a-input>
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
                        <a-col :xl="6" :lg="7" :md="8" :sm="24" v-if="toggleSearchStatus">
                            <a-form-item label="标题">
                                <a-input placeholder="请输入标题" v-model="queryParam.title"></a-input>
                            </a-form-item>
                        </a-col>
                        <a-col :xl="6" :lg="7" :md="8" :sm="24" v-if="toggleSearchStatus">
                            <a-form-item label="状态">
                                <a-select placeholder="请选择状态" v-model:value="queryParam.state" :allowClear="true">
                                    <a-select-option value="true">成功</a-select-option>
                                    <a-select-option value="false">失败</a-select-option>
                                    <a-select-option value="afoot">进行中</a-select-option>
                                </a-select>
                            </a-form-item>
                        </a-col>
                        <a-col :xl="6" :lg="7" :md="8" :sm="24" v-if="toggleSearchStatus">
                            <a-form-item label="邮件类型">
                                <a-select placeholder="请选择邮件类型" v-model:value="queryParam.emailType" :allowClear="true">
                                    <a-select-option value="1">邮箱</a-select-option>
                                    <a-select-option value="2">短信</a-select-option>
                                </a-select>
                            </a-form-item>
                        </a-col>
                        <a-col :xl="6" :lg="7" :md="8" :sm="24" v-if="toggleSearchStatus">
                            <a-form-item label="操作类型">
                                <a-select placeholder="请选择操作类型" v-model:value="queryParam.operationType"
                                    :allowClear="true">
                                    <a-select-option value="1">系统发送</a-select-option>
                                    <a-select-option value="2">手动发送</a-select-option>
                                </a-select>
                            </a-form-item>
                        </a-col>
                        <a-col :xl="6" :lg="7" :md="8" :sm="24" v-if="toggleSearchStatus">
                            <a-form-item label="创建人">
                                <a-input placeholder="请输入创建人" v-model="queryParam.createBy"></a-input>
                            </a-form-item>
                        </a-col>
                        <a-col :xl="6" :lg="7" :md="8" :sm="24" v-if="toggleSearchStatus">
                            <a-form-item label="创建日期">
                                <a-range-picker v-model="createTimeRange" format="YYYY-MM-DD" />
                            </a-form-item>
                        </a-col>
                    </a-row>
                </a-form>
            </div>
            <!-- 查询区域-END -->

            <!-- 操作按钮区域 -->
            <div class="table-operator">
                <a-button type="primary" icon="download" @click="handleExportXls('邮件发送记录表')">导出</a-button>
                <j-super-query :fieldList="superFieldList" ref="superQueryModal"
                    @handleSuperQuery="handleSuperQuery"></j-super-query>
            </div>

            <!-- table区域-begin -->
            <div>
                <a-table ref="table" size="middle" :scroll="{ x: true }" bordered rowKey="id" :columns="columns"
                    :dataSource="dataSource" :pagination="ipagination" :loading="loading"
                    :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
                    class="j-table-force-nowrap" @change="handleTableChange">

                    <span slot="action" slot-scope="text, record">
                        <a @click="handleDetail(record)" style="margin-right: 8px">详情</a>
                        <a @click="handleResend(record)">重新发送</a>
                    </span>

                </a-table>
            </div>
        </a-card>

        <!-- 详情模态框 -->
        <a-modal title="邮件详情" :visible="detailVisible" :width="800" :footer="null" @cancel="detailVisible = false"
            :destroyOnClose="true">
            <div style="max-height: 600px; overflow-y: auto;">
                <a-descriptions :column="1" bordered>
                    <a-descriptions-item label="批次号">{{ detailRecord.batch || '-' }}</a-descriptions-item>
                    <a-descriptions-item label="接收邮箱">{{ detailRecord.email || '-' }}</a-descriptions-item>
                    <a-descriptions-item label="发送邮箱">{{ detailRecord.sendEmail || '-' }}</a-descriptions-item>
                    <a-descriptions-item label="抄送邮箱">{{ detailRecord.cc || '-' }}</a-descriptions-item>
                    <a-descriptions-item label="手机号码">{{ detailRecord.phone || '-' }}</a-descriptions-item>
                    <a-descriptions-item label="标题">{{ detailRecord.title || '-' }}</a-descriptions-item>
                    <a-descriptions-item label="邮件类型">
                        {{ detailRecord.emailType === '1' ? '邮箱' : detailRecord.emailType === '2' ? '短信' : '-' }}
                    </a-descriptions-item>
                    <a-descriptions-item label="操作类型">
                        {{ detailRecord.operationType === '1' ? '系统发送' : detailRecord.operationType === '2' ? '手动发送' :
                            '-' }}
                    </a-descriptions-item>
                    <a-descriptions-item label="状态">
                        {{ detailRecord.state === 'true' ? '成功' : detailRecord.state === 'false' ? '失败' :
                            detailRecord.state === 'afoot' ? '进行中' : '-' }}
                    </a-descriptions-item>
                    <a-descriptions-item label="是否为Html">
                        {{ detailRecord.isHtml === 'true' ? '是' : detailRecord.isHtml === 'false' ? '否' : '-' }}
                    </a-descriptions-item>
                    <a-descriptions-item label="是否重新发送">
                        {{ detailRecord.isResending === 'true' ? '是' : detailRecord.isResending === 'false' ? '否' : '-'
                        }}
                    </a-descriptions-item>
                    <a-descriptions-item label="失败原因">{{ detailRecord.errMsg || '-' }}</a-descriptions-item>
                    <a-descriptions-item label="创建人">{{ detailRecord.createBy || '-' }}</a-descriptions-item>
                    <a-descriptions-item label="创建日期">{{ detailRecord.createTime || '-' }}</a-descriptions-item>
                    <a-descriptions-item label="发送内容" :span="1">
                        <!-- <div v-if="detailRecord.content" v-html="detailRecord.content"
                            style="max-width: 100%; word-wrap: break-word; padding: 10px; border: 1px solid #e8e8e8; border-radius: 4px; background-color: #fafafa;">
                        </div>
                        
                        <span v-else>-</span> -->
                        <div v-if="detailRecord.isHtml == 'true'" class="email-html-content" v-html="scopedHtmlContent">
                        </div>
                        <span v-else>{{ detailRecord.content }}</span>
                    </a-descriptions-item>
                </a-descriptions>
            </div>
        </a-modal>
    </div>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { getAction, postAction } from '@/api/manage'
import moment from 'moment'

export default {
    name: 'EmailSendRecordList',
    mixins: [JeecgListMixin, mixinDevice],
    data() {
        return {
            isorter: {
                field: 'createTime',
                order: 'desc',
            },
            description: '邮件发送记录管理页面',
            createTimeRange: [],
            columns: [
                {
                    title: '状态',
                    align: "center",
                    dataIndex: 'state',
                    width: 100,
                    customRender: (text) => {
                        if (text === 'true') return '成功'
                        if (text === 'false') return '失败'
                        if (text === 'afoot') return '进行中'
                        return text || ''
                    }
                },
                {
                    title: '是否重新发送',
                    align: "center",
                    dataIndex: 'isResending',
                    width: 120,
                    customRender: (text) => {
                        if (text === 'true') return '是'
                        if (text === 'false') return '否'
                        return text || ''
                    }
                },
                {
                    title: '标题',
                    align: "center",
                    dataIndex: 'title',
                    width: 200,
                },
                {
                    title: '接收邮箱',
                    align: "center",
                    dataIndex: 'email',
                    width: 180,
                },
                {
                    title: '发送邮箱',
                    align: "center",
                    dataIndex: 'sendEmail',
                    width: 180,
                },
                {
                    title: '抄送邮箱',
                    align: "center",
                    dataIndex: 'cc',
                    width: 180,
                },
                {
                    title: '手机号码',
                    align: "center",
                    dataIndex: 'phone',
                    width: 120,
                },
                // {
                //     title: '发送内容',
                //     align: "center",
                //     dataIndex: 'content',
                //     width: 300,
                //     customRender: (text) => {
                //         if (text && text.length > 50) {
                //             return text.substring(0, 50) + '...'
                //         }
                //         return text || ''
                //     }
                // },
                {
                    title: '邮件类型',
                    align: "center",
                    dataIndex: 'emailType',
                    width: 100,
                    customRender: (text) => {
                        if (text === '1') return '邮箱'
                        if (text === '2') return '短信'
                        return text || ''
                    }
                },
                {
                    title: '操作类型',
                    align: "center",
                    dataIndex: 'operationType',
                    width: 120,
                    customRender: (text) => {
                        if (text === '1') return '系统发送'
                        if (text === '2') return '手动发送'
                        return text || ''
                    }
                },

                {
                    title: '是否为Html',
                    align: "center",
                    dataIndex: 'isHtml',
                    width: 100,
                    customRender: (text) => {
                        if (text === 'true') return '是'
                        if (text === 'false') return '否'
                        return text || ''
                    }
                },

                {
                    title: '失败原因',
                    align: "center",
                    dataIndex: 'errMsg',
                    width: 200,
                },
                {
                    title: '创建人',
                    align: "center",
                    dataIndex: 'createBy',
                    width: 120,
                },
                {
                    title: '创建日期',
                    align: "center",
                    dataIndex: 'createTime',
                    width: 180,
                    sorter: true,
                }, {
                    title: '批次号',
                    align: "center",
                    dataIndex: 'batch',
                    width: 120,
                },
                {
                    title: '删除标识',
                    align: "center",
                    dataIndex: 'delFlag',
                    width: 100,
                    customRender: (text) => {
                        if (text === '0') return '未删除'
                        if (text === '1') return '已删除'
                        return text || ''
                    }
                },
                {
                    title: '操作',
                    dataIndex: 'action',
                    align: "center",
                    fixed: "right",
                    width: 150,
                    scopedSlots: { customRender: 'action' },
                }
            ],
            url: {
                list: "/emailSendRecord/list",
            },
            dictOptions: {},
            superFieldList: [],
            detailVisible: false,
            detailRecord: {},
        }
    },
    computed: {
        // 处理 HTML 内容，给样式添加作用域，防止影响页面其他部分
        scopedHtmlContent() {
            if (!this.detailRecord.content || this.detailRecord.isHtml !== 'true') {
                return ''
            }
            let html = this.detailRecord.content

            // 去掉字符串中的 \n 字符（转义的换行符）
            html = html.replace(/\\n/g, '')
            // 如果还想去掉实际的换行符，可以使用：html = html.replace(/\n/g, '')

            // 如果包含 style 标签，给样式选择器添加作用域前缀
            if (html.includes('<style') || html.includes('<STYLE')) {
                // 匹配 style 标签及其内容
                html = html.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (match, styleContent) => {
                    // 给样式选择器添加 .email-html-content 前缀
                    // 先处理复杂的选择器（包含伪类、伪元素等）
                    let scopedStyle = styleContent
                        // 处理包含伪类的选择器，如 tr:nth-child(even)
                        .replace(/(^|\n|\r)\s*([a-zA-Z][\w-]*):([\w-]+)\(([^)]*)\)\s*\{/g, '$1  .email-html-content $2:$3($4) {')
                        // 处理简单的伪类选择器，如 tr:hover
                        .replace(/(^|\n|\r)\s*([a-zA-Z][\w-]*):([\w-]+)\s*\{/g, '$1  .email-html-content $2:$3 {')
                        // 处理逗号分隔的多个选择器，如 th, td
                        .replace(/(^|\n|\r)\s*([a-zA-Z][\w-]*)\s*,\s*([a-zA-Z][\w-]*)\s*\{/g, '$1  .email-html-content $2, .email-html-content $3 {')
                        // 处理普通选择器，如 table, th, td
                        .replace(/(^|\n|\r)\s*([a-zA-Z][\w-]*)\s*\{/g, '$1  .email-html-content $2 {')

                    return `<style>${scopedStyle}</style>`
                })
            }

            return html
        }
    },
    created() {
        this.getSuperFieldList();
    },
    methods: {
        initDictConfig() {
        },
        getSuperFieldList() {
            let fieldList = [
                {
                    type: 'string',
                    value: 'batch',
                    text: '批次号',
                },
                {
                    type: 'string',
                    value: 'email',
                    text: '接收邮箱',
                },
                {
                    type: 'string',
                    value: 'sendEmail',
                    text: '发送邮箱',
                },
                {
                    type: 'string',
                    value: 'cc',
                    text: '抄送邮箱',
                },
                {
                    type: 'string',
                    value: 'phone',
                    text: '手机号码',
                },
                {
                    type: 'string',
                    value: 'title',
                    text: '标题',
                },
                {
                    type: 'string',
                    value: 'content',
                    text: '发送内容',
                },
                {
                    type: 'string',
                    value: 'emailType',
                    text: '邮件类型',
                },
                {
                    type: 'string',
                    value: 'operationType',
                    text: '操作类型',
                },
                {
                    type: 'string',
                    value: 'state',
                    text: '状态',
                },
                {
                    type: 'string',
                    value: 'createBy',
                    text: '创建人',
                },
                {
                    type: 'date',
                    value: 'createTime',
                    text: '创建日期',
                },
            ]
            this.superFieldList = fieldList
        },
        // 查看详情
        handleDetail(record) {
            this.detailRecord = record
            this.detailVisible = true
        },
        // 重新发送
        handleResend(record) {
            this.$confirm({
                title: '确认重新发送',
                content: `确定要重新发送该邮件吗？`,
                onOk: () => {
                    postAction('/emailSendRecord/resend', { id: record.id }).then((res) => {
                        if (res.success) {
                            this.$message.success('重新发送成功')
                            this.loadData()
                        } else {
                            this.$message.error(res.message || '重新发送失败')
                        }
                    }).catch(() => {
                        this.$message.error('重新发送失败')
                    })
                }
            })
        },
        // 获取查询参数
        getQueryParams() {
            var param = Object.assign({}, this.queryParam, this.isorter);
            param.field = this.getQueryField();
            param.pageNo = this.ipagination.current;
            param.pageSize = this.ipagination.pageSize;
            // 处理创建日期范围
            if (this.createTimeRange && this.createTimeRange.length === 2) {
                param.createTime_begin = moment(this.createTimeRange[0]).format('YYYY-MM-DD')
                param.createTime_end = moment(this.createTimeRange[1]).format('YYYY-MM-DD')
            }
            return param;
        },
    }
}
</script>

<style scoped>
/* @import '~@assets/less/common.less'; */
</style>

<style>
/* 限制后端返回的 HTML 样式作用域，防止影响页面其他部分 */
.email-html-content {
    isolation: isolate;
    /* 创建新的层叠上下文 */
    contain: layout style;
    /* 限制样式影响范围 */
}
</style>
