<template>
    <a-card :bordered="false">
        <!-- 查询区域 -->
        <div class="table-page-search-wrapper">
            <a-form layout="inline" @keyup.enter.native="searchQuery">
                <a-row :gutter="24">
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="计划ID">
                            <a-input placeholder="请输入计划ID" v-model="queryParam.adId"></a-input>
                        </a-form-item>
                    </a-col>
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="广告主ID">
                            <a-input placeholder="请输入广告主ID" v-model="queryParam.advertiserId"></a-input>
                        </a-form-item>
                    </a-col>

                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="违规单ID">
                            <a-input placeholder="请输入违规单ID" v-model="queryParam.eventId"></a-input>
                        </a-form-item>
                    </a-col>
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="违规类型">
                            <a-select placeholder="请选择违规类型" v-model="queryParam.illegalType" allowClear>
                                <a-select-option value="GENERAL">一般违规(AD)</a-select-option>
                                <a-select-option value="SERIOL">严重违规(AD)</a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="素材ID">
                            <a-input placeholder="请输入素材ID" v-model="queryParam.materialId"></a-input>
                        </a-form-item>
                    </a-col>
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="状态">
                            <a-select placeholder="请选择状态" v-model="queryParam.status" allowClear>
                                <a-select-option value="VALID">生效</a-select-option>
                                <a-select-option value="APPEAL">已申诉(失效)</a-select-option>
                                <a-select-option value="ONAPPEAL">申诉中</a-select-option>
                                <a-select-option value="FAILAPPEAL">申诉失败</a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
                            <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
                            <a-button type="primary" @click="searchReset" icon="reload"
                                style="margin-left: 8px">重置</a-button>
                            <!-- <a @click="handleToggleSearch" style="margin-left: 8px">
                                {{ toggleSearchStatus ? '收起' : '展开' }}
                                <a-icon :type="toggleSearchStatus ? 'up' : 'down'" />
                            </a> -->
                        </span>
                    </a-col>
                </a-row>
            </a-form>
        </div>
        <!-- 查询区域-END -->
        <!-- table区域-begin -->
        <div>
            <!-- <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
                <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{
                    selectedRowKeys.length
                }}</a>项
                <a style="margin-left: 24px" @click="onClearSelected">清空</a>
            </div> -->

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
                    <a @click="handleDetail(record)">详情</a>
                </span>

            </a-table>
        </div>
    </a-card>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'

export default {
    name: 'DouyinViolationScoreRecord',
    mixins: [JeecgListMixin, mixinDevice],
    components: {},
    data() {
        return {
            description: '抖音违规扣分记录管理页面',
            queryParam: {},
            // 表头
            columns: [
                {
                    title: "项目ID",
                    align: "center",
                    dataIndex: 'proId'
                },
                {
                    title: "项目名称",
                    align: "center",
                    dataIndex: 'proName'
                },
                {
                    title: '素材ID',
                    align: "center",
                    dataIndex: 'materialId'
                },
                {
                    title: '计划ID',
                    align: "center",
                    dataIndex: 'adId'
                },
                {
                    title: '广告主ID',
                    align: "center",
                    dataIndex: 'advertiserId'
                },
                {
                    title: '业务线',
                    align: "center",
                    dataIndex: 'businessLine'
                },
                {
                    title: '违规单ID',
                    align: "center",
                    dataIndex: 'eventId'
                },
                {
                    title: '违规类型',
                    align: "center",
                    dataIndex: 'illegalType',
                    customRender: function (text) {
                        const typeMap = {
                            'GENERAL': '一般违规(AD)',
                            'SERIOL': '严重违规(AD)'
                        }
                        return typeMap[text] || text
                    }
                },
                {
                    title: '媒体创建时间',
                    align: "center",
                    dataIndex: 'mediaCreateTime'
                },
                {
                    title: '拒绝理由',
                    align: "center",
                    dataIndex: 'rejectReason',
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
                    title: '扣罚分值',
                    align: "center",
                    dataIndex: 'score'
                },
                {
                    title: '状态',
                    align: "center",
                    dataIndex: 'status',
                    customRender: function (text) {
                        const statusMap = {
                            'VALID': '生效',
                            'APPEAL': '已申诉(失效)',
                            'ONAPPEAL': '申诉中',
                            'FAILAPPEAL': '申诉失败'
                        }
                        const statusColor = {
                            'VALID': '#52c41a',
                            'APPEAL': '#999',
                            'ONAPPEAL': '#1890ff',
                            'FAILAPPEAL': '#f5222d'
                        }
                        const displayText = statusMap[text] || text
                        const color = statusColor[text] || '#000'
                        return <span style={`color: ${color}; font-weight: 500;`}>{displayText}</span>
                    }
                },
                {
                    title: '违规证据截图',
                    align: "center",
                    dataIndex: 'violationEvidenceImg',
                    scopedSlots: { customRender: 'imgSlot' }
                },
                // {
                //     title: '创建人',
                //     align: "center",
                //     dataIndex: 'createBy'
                // },
                {
                    title: '创建日期',
                    align: "center",
                    dataIndex: 'createTime'
                },
            ],
            url: {
                list: "/douyinViolationScoreRecord/list",
                delete: "/douyinViolationScoreRecord/delete",
                deleteBatch: "/douyinViolationScoreRecord/deleteBatch",
                exportXlsUrl: "/douyinViolationScoreRecord/exportXls",
                importExcelUrl: "douyinViolationScoreRecord/importExcel",
            },
            dictOptions: {},
            superFieldList: [],
        }
    },
    created() {
        this.initDictConfig();
        this.getSuperFieldList();
    },
    computed: {
        importExcelUrl: function () {
            return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
        },
    },
    methods: {
        initDictConfig() {
            // 违规类型字典配置
            this.dictOptions.illegalType = [
                { text: '一般违规(AD)', value: 'GENERAL' },
                { text: '严重违规(AD)', value: 'SERIOL' }
            ]
            // 状态字典配置
            this.dictOptions.status = [
                { text: '生效', value: 'VALID' },
                { text: '已申诉(失效)', value: 'APPEAL' },
                { text: '申诉中', value: 'ONAPPEAL' },
                { text: '申诉失败', value: 'FAILAPPEAL' }
            ]
        },
        getSuperFieldList() {
            let fieldList = [];
            fieldList.push({ type: 'string', value: 'adId', text: '计划ID', dictCode: '' })
            fieldList.push({ type: 'string', value: 'advertiserId', text: '广告主ID', dictCode: '' })
            fieldList.push({ type: 'string', value: 'businessLine', text: '业务线', dictCode: '' })
            fieldList.push({ type: 'string', value: 'createBy', text: '创建人', dictCode: '' })
            fieldList.push({ type: 'datetime', value: 'createTime', text: '创建日期' })
            fieldList.push({ type: 'string', value: 'delFlag', text: '删除标识', dictCode: '' })
            fieldList.push({ type: 'string', value: 'eventId', text: '违规单ID', dictCode: '' })
            fieldList.push({ type: 'string', value: 'id', text: '主键ID', dictCode: '' })
            fieldList.push({ type: 'string', value: 'illegalType', text: '违规类型', dictCode: 'illegal_type_dict' })
            fieldList.push({ type: 'string', value: 'materialId', text: '素材ID', dictCode: '' })
            fieldList.push({ type: 'datetime', value: 'mediaCreateTime', text: '媒体创建时间' })
            fieldList.push({ type: 'string', value: 'rejectReason', text: '拒绝理由', dictCode: '' })
            fieldList.push({ type: 'int', value: 'score', text: '扣罚分值' })
            fieldList.push({ type: 'string', value: 'status', text: '状态', dictCode: 'status_dict' })
            fieldList.push({ type: 'string', value: 'updateBy', text: '更新人', dictCode: '' })
            fieldList.push({ type: 'datetime', value: 'updateTime', text: '更新日期' })
            fieldList.push({ type: 'string', value: 'violationEvidenceImg', text: '违规证据截图', dictCode: '' })
            this.superFieldList = fieldList
        }
    }
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>
