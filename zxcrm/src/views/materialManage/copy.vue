<template>
    <a-card :bordered="false">
        <!-- 查询区域 -->
        <div class="table-page-search-wrapper">
            <a-form layout="inline" @keyup.enter.native="searchQuery">
                <a-row :gutter="24">
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="任务ID">
                            <a-input placeholder="请输入任务ID" v-model="queryParam.taskId"></a-input>
                        </a-form-item>
                    </a-col>
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="广告主账户ID">
                            <a-input placeholder="请输入广告主账户ID" v-model="queryParam.advertiserId"></a-input>
                        </a-form-item>
                    </a-col>
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="原爆款素材ID">
                            <a-input placeholder="请输入原爆款素材ID" v-model="queryParam.originMaterialId"></a-input>
                        </a-form-item>
                    </a-col>
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="批次号">
                            <a-input placeholder="请输入批次号" v-model="queryParam.batchNo"></a-input>
                        </a-form-item>
                    </a-col>
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="任务状态">
                            <a-select v-model="queryParam.status" placeholder="请选择任务状态" allowClear>
                                <a-select-option value="INIT">任务初始化</a-select-option>
                                <a-select-option value="PROCESSING">任务处理中</a-select-option>
                                <a-select-option value="SUCCESS">任务成功</a-select-option>
                                <a-select-option value="FAILED">任务失败</a-select-option>
                                <a-select-option value="PART_SUCCESS">任务部分成功</a-select-option>
                            </a-select>
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
            <!-- <a-button type="primary" icon="download" @click="handleExportXls('抖音裂变任务')">导出</a-button> -->
            <!-- 高级查询区域 -->
            <!-- <j-super-query :fieldList="superFieldList" ref="superQueryModal"
                @handleSuperQuery="handleSuperQuery"></j-super-query> -->
            <a-button type="primary" icon="sync" @click="handleUpdateTaskStatus"
                :loading="updateStatusLoading">更新任务状态</a-button>
        </div>

        <!-- table区域-begin -->
        <div>
            <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
                <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{
                    selectedRowKeys.length
                }}</a>项
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
                    <!-- <a @click="handleEdit(record)">编辑</a>
                    <a-divider type="vertical" v-if="record.taskId" /> -->
                    <a @click="handleViewResult(record)" v-if="record.taskId && record.status == 'SUCCESS'">查看结果</a>
                    <!-- <a-divider type="vertical" />
                    <a-dropdown>
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
        <DouyinFissionTaskModal ref="modalForm" @ok="modalFormOk"></DouyinFissionTaskModal>
        <DouyinFissionTaskResultModal ref="resultModal"></DouyinFissionTaskResultModal>
    </a-card>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import DouyinFissionTaskModal from './modules/DouyinFissionTaskModal'
import DouyinFissionTaskResultModal from './modules/DouyinFissionTaskResultModal'
import { mapGetters } from 'vuex'

export default {
    name: 'DouyinFissionTask',
    mixins: [JeecgListMixin, mixinDevice],
    components: {
        DouyinFissionTaskModal,
        DouyinFissionTaskResultModal
    },
    data() {
        return {
            description: '抖音裂变任务管理页面',
            queryParam: {},
            updateStatusLoading: false,
            // 表头
            columns: [
                {
                    title: '广告主账户ID',
                    align: "center",
                    dataIndex: 'advertiserId'
                },
                {
                    title: '批次号',
                    align: "center",
                    dataIndex: 'batchNo'
                },
                {
                    title: '原料ID',
                    align: "center",
                    dataIndex: 'elementIds'
                },
                {
                    title: '原爆款素材ID',
                    align: "center",
                    dataIndex: 'originMaterialId'
                },
                {
                    title: '任务状态',
                    align: "center",
                    dataIndex: 'status',
                    customRender: function (text) {
                        const statusMap = {
                            'INIT': '任务初始化',
                            'PROCESSING': '任务处理中',
                            'SUCCESS': '任务成功',
                            'FAILED': '任务失败',
                            'PART_SUCCESS': '任务部分成功'
                        }
                        return statusMap[text] || text
                    }
                },
                // {
                //     title: '任务状态错误码',
                //     align: "center",
                //     dataIndex: 'statusCode'
                // },
                {
                    title: '任务状态信息',
                    align: "center",
                    dataIndex: 'statusMessage',
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
                    title: '任务ID',
                    align: "center",
                    dataIndex: 'taskId'
                },
                {
                    title: '生效策略',
                    align: "center",
                    dataIndex: 'strategies',
                    customRender: function (text) {
                        if (!text) return '-'
                        const strategyMap = {
                            'CLIP_REPLACE': '分镜替换',
                            'ROBOT_REPLACE': '人物替换',
                            'HOT_PRE_VIDEO': '爆款开头',
                            'MIX_CUT': '重新混剪',
                            'PRE_VIDEO_CLIP_REPLACE': '前贴扩写',
                            'RAW_MATERIAL_REPLACE': '原料分镜替换',
                            'DERIVE_FROM_CHOSEN_HOT_MID': '自有爆款套路',
                            'DERIVE_FROM_INDUSTRY_HOT_PATTERN': '行业爆款套路',
                            'AIGC_PRE_VIDEO': 'AIGC前贴新增',
                            'AIGC_HUMAN_REPLACE': 'AIGC人物替换',
                            'SMART_REPLACE': '智能裂变'
                        }

                        let strategies = []

                        // 如果是数组，直接解析
                        if (Array.isArray(text)) {
                            strategies = text
                        } else if (typeof text === 'string') {
                            // 去掉方括号，如 "[ROBOT_REPLACE]" -> "ROBOT_REPLACE"
                            const cleanText = text.replace(/^\[|\]$/g, '')
                            // 按逗号分割
                            strategies = cleanText.split(',').map(s => s.trim())
                        }

                        return strategies.map(strategy => strategyMap[strategy] || strategy).join('、')
                    }
                },
                {
                    title: '禁止策略',
                    align: "center",
                    dataIndex: 'excludeStrategies',
                    customRender: function (text) {
                        if (!text) return '-'
                        const strategyMap = {
                            'CLIP_REPLACE': '分镜替换',
                            'ROBOT_REPLACE': '人物替换',
                            'HOT_PRE_VIDEO': '爆款开头',
                            'MIX_CUT': '重新混剪',
                            'PRE_VIDEO_CLIP_REPLACE': '前贴扩写',
                            'RAW_MATERIAL_REPLACE': '原料分镜替换',
                            'DERIVE_FROM_CHOSEN_HOT_MID': '自有爆款套路',
                            'DERIVE_FROM_INDUSTRY_HOT_PATTERN': '行业爆款套路',
                            'AIGC_PRE_VIDEO': 'AIGC前贴新增',
                            'AIGC_HUMAN_REPLACE': 'AIGC人物替换',
                            'SMART_REPLACE': '智能裂变'
                        }

                        let strategies = []

                        // 如果是数组，直接解析
                        if (Array.isArray(text)) {
                            strategies = text
                        } else if (typeof text === 'string') {
                            // 去掉方括号，如 "[ROBOT_REPLACE]" -> "ROBOT_REPLACE"
                            const cleanText = text.replace(/^\[|\]$/g, '')
                            // 按逗号分割
                            strategies = cleanText.split(',').map(s => s.trim())
                        }

                        return strategies.map(strategy => strategyMap[strategy] || strategy).join('、')
                    }
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
                // {
                //     title: '更新人',
                //     align: "center",
                //     dataIndex: 'updateBy'
                // },
                // {
                //     title: '更新日期',
                //     align: "center",
                //     dataIndex: 'updateTime'
                // },
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
                list: "/douyinFissionTask/list",
                delete: "/douyinFissionTask/delete",
                deleteBatch: "/douyinFissionTask/deleteBatch",
                exportXlsUrl: "/douyinFissionTask/exportXls",
                importExcelUrl: "douyinFissionTask/importExcel",
            },
            dictOptions: {},
            superFieldList: [],
        }
    },
    created() {
        this.getSuperFieldList();
    },
    computed: {
        ...mapGetters(["userInfo"]),
        importExcelUrl: function () {
            return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
        },
    },
    methods: {
        handleAdd() {
            this.$refs.modalForm.add();
        },
        handleEdit(record) {
            this.$refs.modalForm.edit(record);
        },
        modalFormOk() {
            // 新增/修改 成功时，重载列表
            this.loadData();
        },
        handleUpdateTaskStatus() {
            this.updateStatusLoading = true;
            this.$http.get('/douyinFissionTask/getTaskInfo').then((res) => {
                if (res.success) {
                    this.$message.success('任务状态更新成功');
                    // 更新成功后刷新列表
                    this.loadData();
                } else {
                    this.$message.warning(res.message || '更新任务状态失败');
                }
            }).catch((error) => {
                this.$message.error('更新任务状态失败');
                console.error('更新任务状态失败:', error);
            }).finally(() => {
                this.updateStatusLoading = false;
            });
        },
        handleViewResult(record) {
            this.$refs.resultModal.show(record.taskId);
        },
        initDictConfig() {
        },
        getSuperFieldList() {
            let fieldList = [];
            fieldList.push({ type: 'string', value: 'advertiserId', text: '广告主账户ID', dictCode: '' })
            fieldList.push({ type: 'string', value: 'batchNo', text: '批次号', dictCode: '' })
            fieldList.push({ type: 'string', value: 'channelName', text: '渠道名称', dictCode: '' })
            fieldList.push({ type: 'string', value: 'channelPlatform', text: '平台标识', dictCode: '' })
            fieldList.push({ type: 'string', value: 'channelSign', text: '渠道标识', dictCode: '' })
            fieldList.push({ type: 'string', value: 'createBy', text: '创建人', dictCode: '' })
            fieldList.push({ type: 'datetime', value: 'createTime', text: '创建日期' })
            fieldList.push({ type: 'string', value: 'delFlag', text: '删除标识（0：未删除 1：已删除）', dictCode: '' })
            fieldList.push({ type: 'string', value: 'elementIds', text: '原料ID', dictCode: '' })
            fieldList.push({ type: 'string', value: 'excludeStrategies', text: '禁止策略', dictCode: '' })
            fieldList.push({ type: 'string', value: 'originMaterialId', text: '原爆款素材ID', dictCode: '' })
            fieldList.push({ type: 'string', value: 'status', text: '任务状态', dictCode: '' })
            fieldList.push({ type: 'int', value: 'statusCode', text: '任务状态错误码' })
            fieldList.push({ type: 'string', value: 'statusMessage', text: '任务状态错误信息', dictCode: '' })
            fieldList.push({ type: 'string', value: 'strategies', text: '生效策略', dictCode: '' })
            fieldList.push({ type: 'datetime', value: 'taskCreateTime', text: '任务创建时间' })
            fieldList.push({ type: 'string', value: 'taskId', text: '任务ID', dictCode: '' })
            fieldList.push({ type: 'datetime', value: 'taskModifyTime', text: '任务更新时间' })
            fieldList.push({ type: 'string', value: 'updateBy', text: '更新人', dictCode: '' })
            fieldList.push({ type: 'datetime', value: 'updateTime', text: '更新日期' })
            this.superFieldList = fieldList
        },
        // 重写 getQueryParams 方法，固定添加 createBy 条件
        getQueryParams() {
            // 调用父类的 getQueryParams 方法
            let params = this.$options.mixins[0].methods.getQueryParams.call(this);

            // 固定添加 createBy 条件
            // admin用户不添加创建人条件
            if (this.userInfo && this.userInfo.realname && this.userInfo.username != 'admin') {
                params.createBy = this.userInfo.realname;
            }

            return params;
        },
    }
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>
