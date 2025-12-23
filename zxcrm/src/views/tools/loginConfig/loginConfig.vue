<template>
    <a-card :bordered="false">
        <!-- 查询区域 -->
        <div class="table-page-search-wrapper">
            <a-form layout="inline" @keyup.enter.native="searchQuery">
                <a-row :gutter="24">
                    <a-col :md="8" :sm="12">
                        <a-form-item label="账号">
                            <a-input placeholder="输入账号模糊查询" v-model="queryParam.userName"></a-input>
                        </a-form-item>
                    </a-col>
                    <a-col :md="8" :sm="12">
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
            <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
            <a-button type="primary" icon="download" @click="handleExportXls('登录配置')">导出</a-button>
            <!-- <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader"
                :action="importExcelUrl" @change="handleImportExcel">
                <a-button type="primary" icon="import">导入</a-button>
            </a-upload> -->
            <j-super-query :fieldList="superFieldList" ref="superQueryModal"
                @handleSuperQuery="handleSuperQuery"></j-super-query>
            <a-dropdown v-if="selectedRowKeys.length > 0">
                <a-menu slot="overlay">
                    <a-menu-item key="1" @click="batchDel"><a-icon type="delete" />删除</a-menu-item>
                </a-menu>
                <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
            </a-dropdown>
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
                <span slot="action" slot-scope="text, record">
                    <a @click="handleEdit(record)">编辑</a>
                    <a-divider type="vertical" />
                    <a @click="handleRicecow(record)">授权</a>
                    <a-divider type="vertical" />
                    <a>
                        <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                            <a>删除</a>
                        </a-popconfirm>
                    </a>
                </span>
            </a-table>
        </div>

        <login-config-modal ref="modalForm" @ok="modalFormOk" @ricecow="handleModalRicecow"></login-config-modal>
        <ricecow-modal ref="ricecowModal" :userName="currentRecord.userName"
            :password="currentRecord.password"></ricecow-modal>
    </a-card>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import LoginConfigModal from './LoginConfigModal'
import RicecowModal from './RicecowModal'

export default {
    name: 'LoginConfig',
    mixins: [JeecgListMixin, mixinDevice],
    components: {
        LoginConfigModal,
        RicecowModal
    },
    data() {
        return {
            queryParam: {},
            isorter: {},
            description: '登录配置页面',
            currentRecord: {},
            columns: [
                {
                    title: '账号',
                    align: 'center',
                    dataIndex: 'userName'
                },
                {
                    title: '密码',
                    align: 'center',
                    dataIndex: 'password',
                    customRender: function (text) {
                        return text ? '******' : '';
                    }
                },
                {
                    title: '登录信息',
                    align: 'center',
                    dataIndex: 'loginInfo'
                },
                {
                    title: '操作',
                    dataIndex: 'action',
                    align: 'center',
                    fixed: 'right',
                    width: 120,
                    scopedSlots: { customRender: 'action' }
                }
            ],
            url: {
                list: '/promotionPlatformAccount/list',
                delete: '/promotionPlatformAccount/delete',
                deleteBatch: '/promotionPlatformAccount/deleteBatch',
                exportXlsUrl: '/promotionPlatformAccount/exportXls',
                importExcelUrl: 'promotionPlatformAccount/importExcel',
            },
            dictOptions: {},
            superFieldList: [],
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
        initDictConfig() { },
        getSuperFieldList() {
            let fieldList = [];
            fieldList.push({ type: 'string', value: 'userName', text: '账号', dictCode: '' })
            fieldList.push({ type: 'string', value: 'password', text: '密码', dictCode: '' })
            this.superFieldList = fieldList
        },
        handleRicecow(record) {
            this.currentRecord = record;
            this.$refs.ricecowModal.show();
        },
        handleModalRicecow(data) {
            this.currentRecord = data;
            this.$refs.ricecowModal.show();
        },
    }
}
</script>

<style scoped>
@import '~@assets/less/common.less';
</style>
