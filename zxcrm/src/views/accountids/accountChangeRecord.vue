<template>
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
                    <!-- <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="渠道名称">
                            <a-input placeholder="请输入渠道名称" v-model="queryParam.channelName"></a-input>
                        </a-form-item>
                    </a-col>
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="渠道标识">
                            <a-input placeholder="请输入渠道标识" v-model="queryParam.channelSign"></a-input>
                        </a-form-item>
                    </a-col>
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="平台标识">
                            <a-input placeholder="请输入平台标识" v-model="queryParam.channelPlatform"></a-input>
                        </a-form-item>
                    </a-col> -->
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="原项目">
                            <JSearchSelectTag placeholder="原项目" v-model="queryParam.proIdOld"
                                dict="tab_projectManage,pro_name,id,del_flag = '0'" async allowClear />
                        </a-form-item>
                    </a-col>
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="新项目">
                            <JSearchSelectTag placeholder="新项目" v-model="queryParam.proIdNew"
                                dict="tab_projectManage,pro_name,id,del_flag = '0'" async allowClear />
                        </a-form-item>
                    </a-col>
                    <!-- <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="创建人">
                            <a-input placeholder="请输入创建人" v-model="queryParam.createBy"></a-input>
                        </a-form-item>
                    </a-col>
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <a-form-item label="创建日期">
                            <a-range-picker v-model:value="createTime" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
                        </a-form-item>
                    </a-col>
                   -->
                    <a-col :xl="6" :lg="7" :md="8" :sm="24">
                        <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
                            <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
                            <a-button type="primary" @click="searchReset" icon="reload"
                                style="margin-left: 8px">重置</a-button>
                        </span>
                    </a-col>
                </a-row>
            </a-form>
        </div>
        <!-- 查询区域-END -->

        <!-- 操作按钮区域 -->
        <div class="table-operator">
            <!-- 高级查询区域 -->
            <!-- <j-super-query :fieldList="superFieldList" ref="superQueryModal"
                @handleSuperQuery="handleSuperQuery"></j-super-query> -->
        </div>

        <!-- table区域-begin -->
        <div>
            <a-table ref="table" size="middle" :scroll="{ x: true }" bordered rowKey="id" :columns="columns"
                :dataSource="dataSource" :pagination="ipagination" :loading="loading" class="j-table-force-nowrap"
                @change="handleTableChange">

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

        <!-- 详情对比弹窗 -->
        <a-modal title="项目变动详情对比" :visible="detailModalVisible" @ok="handleDetailOk" @cancel="handleDetailCancel"
            :width="1200" :footer="null">
            <div style="display: flex; gap: 20px;">
                <!-- 原项目信息 -->
                <div style="flex: 1;">
                    <h3 style="color: #ff4d4f; margin-bottom: 16px;">原项目信息</h3>
                    <div v-if="detailData.oldProJson"
                        style="background: #fff2f0; padding: 16px; border-radius: 6px; border: 1px solid #ffccc7;">
                        <div v-for="(value, key) in detailData.oldProJson" :key="key" style="margin-bottom: 8px;">
                            <div v-if="getFieldLabel(key)"><strong>{{ getFieldLabel(key) }}</strong>: {{ value || '-' }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 新项目信息 -->
                <div style="flex: 1;">
                    <h3 style="color: #52c41a; margin-bottom: 16px;">新项目信息</h3>
                    <div v-if="detailData.newProJson"
                        style="background: #f6ffed; padding: 16px; border-radius: 6px; border: 1px solid #b7eb8f;">
                        <div v-for="(value, key) in detailData.newProJson" :key="key" style="margin-bottom: 8px;">
                            <div v-if="getFieldLabel(key)"><strong>{{ getFieldLabel(key) }}</strong>: {{ value || '-' }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </a-modal>
    </a-card>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { formatDate } from '@/utils/date'
import { getAction } from '@/api/manage'
import { mapGetters } from 'vuex'

export default {
    name: 'AccountChangeRecordList',
    mixins: [JeecgListMixin, mixinDevice],
    components: {},
    data() {
        return {
            createTime: [],
            description: '账户变动记录管理页面',
            // 表头
            columns: [
                {
                    title: '广告主ID',
                    dataIndex: 'accountId',
                    align: "center",
                    width: 120
                },
                {
                    title: '渠道名称',
                    align: "center",
                    dataIndex: 'channelName',
                    width: 150
                },
                // {
                //     title: '渠道标识',
                //     align: "center",
                //     dataIndex: 'channelSign',
                //     width: 120
                // },
                // {
                //     title: '平台标识',
                //     align: "center",
                //     dataIndex: 'channelPlatform',
                //     width: 120
                // },
                {
                    title: '原项目',
                    align: "center",
                    dataIndex: 'proIdOld',
                    width: 150,
                    customRender: (text, record) => {
                        try {
                            const oldProJson = JSON.parse(record.oldProJson || '{}');
                            return oldProJson.proName || text;
                        } catch (e) {
                            return text;
                        }
                    }
                },
                {
                    title: '新项目',
                    align: "center",
                    dataIndex: 'proIdNew',
                    width: 150,
                    customRender: (text, record) => {
                        try {
                            const newProJson = JSON.parse(record.newProJson || '{}');
                            return newProJson.proName || text;
                        } catch (e) {
                            return text;
                        }
                    }
                },
                {
                    title: '原项目绑定时间',
                    align: "center",
                    dataIndex: 'bindingTimeOld',
                    width: 150,
                    customRender: function (text) {
                        return !text ? "" : (text.length > 10 ? text.substr(0, 10) : text)
                    }
                },
                {
                    title: '新项目绑定时间',
                    align: "center",
                    dataIndex: 'bindingTimeNew',
                    width: 150,
                    customRender: function (text) {
                        return !text ? "" : (text.length > 10 ? text.substr(0, 10) : text)
                    }
                },
                {
                    title: '创建人',
                    align: "center",
                    dataIndex: 'createBy',
                    width: 120
                },
                {
                    title: '创建日期',
                    align: "center",
                    dataIndex: 'createTime',
                    customRender: function (text) {
                        return !text ? "" : (text.length > 10 ? text.substr(0, 10) : text)
                    }
                },
                // {
                //     title: '更新人',
                //     align: "center",
                //     dataIndex: 'updateBy',
                //     width: 120
                // },
                // {
                //     title: '更新日期',
                //     align: "center",
                //     dataIndex: 'updateTime',
                //     width: 150,
                //     customRender: function (text) {
                //         return !text ? "" : (text.length > 10 ? text.substr(0, 10) : text)
                //     }
                // },
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
                list: "/accountProjectHistory/list",
            },
            dictOptions: {},
            superFieldList: [],
            // 详情弹窗相关
            detailModalVisible: false,
            detailData: {
                oldProJson: null,
                newProJson: null
            }
        }
    },
    created() {
    },
    computed: {
    },
    watch: {
        createTime(newVal) {
            this.queryParam.createTimeJoint = newVal.join(',')
        }
    },
    methods: {
        ...mapGetters(["userInfo"]),
        initDictConfig() {
        },
        handleDetail(record) {
            // 解析JSON数据
            try {
                this.detailData.oldProJson = JSON.parse(record.oldProJson || '{}');
                this.detailData.newProJson = JSON.parse(record.newProJson || '{}');
                this.detailModalVisible = true;
            } catch (e) {
                console.error('解析JSON失败:', e);
                this.$message.error('数据解析失败');
            }
        },
        handleDetailOk() {
            this.detailModalVisible = false;
        },
        handleDetailCancel() {
            this.detailModalVisible = false;
        },
        getFieldLabel(key) {
            const fieldLabels = {
                'uniqueId': 'ID',
                'proName': '项目名称',
                'operationPerson_dictText': '运营人员',
                'businessPerson_dictText': '商务人员',
                'aePerson_dictText': 'AE人员',
                'paymentMethod_dictText': '结算方式',
                'customerName': '客户名称',
                'collaborationMode_dictText': '合作方式',
                'operationType_dictText': '运营方式',
                'createBy': '创建人',
                'createTime': '创建时间',
            };
            return fieldLabels[key] || false;
        }
    }
}
</script>

<style scoped>
@import '~@assets/less/common.less';
</style>
