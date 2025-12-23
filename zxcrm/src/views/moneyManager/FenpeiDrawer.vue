<template>
    <a-drawer :title="title" :maskClosable="true" :width="drawerWidth" placement="right" :closable="true"
        @close="handleCancel" :visible="visible" style="height: 100%;">

        <template slot="title">
            <div style="width: 100%;">
                <span>{{ title }}</span>
                <span style="display:inline-block;width:calc(100% - 51px);padding-right:10px;text-align: right">
                    <a-button @click="toggleScreen" icon="appstore"
                        style="height:20px;width:20px;border:0px"></a-button>
                </span>
            </div>

        </template>
        <a-spin :spinning="confirmLoading">
            <a-card :bordered="false">
                <!-- 查询区域 -->
                <div class="table-page-search-wrapper">
                    <a-form layout="inline" @keyup.enter.native="searchQuery">
                        <a-row :gutter="24">
                            <!-- <a-col :xl="6" :lg="7" :md="8" :sm="24">
                                <a-form-item label="返点">
                                    <a-input-number style="width: 92%;" v-model:value="queryParam.rebate"
                                        :formatter="value => `${value}%`"
                                        :parser="value => value.replace('%', '')"></a-input-number>
                                </a-form-item>
                            </a-col>
                            <a-col :xl="6" :lg="7" :md="8" :sm="24">
                                <a-form-item label="生效日期">
                                    <a-date-picker placeholder="请选择生效日期" valueFormat="YYYY-MM-DD"
                                        v-model="queryParam.effectiveDate" />
                                </a-form-item>
                            </a-col> -->
                            <a-col :xl="6" :lg="7" :md="8" :sm="24">
                                <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
                                    <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
                                    <a-button type="primary" @click="searchReset" icon="reload"
                                        style="margin-left: 8px">重置</a-button>
                                    <a-button type="primary" icon="download" style="margin-left: 8px"
                                        @click="handleExportXls('资金分配记录')">导出</a-button>
                                    <a-button @click="handleAdd()" type="primary" icon="plus"
                                        style="margin-left: 8px">新增</a-button>
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

                <!-- 操作按钮区域 -->
                <div class="table-operator">

                    <!-- <a-button @click="handleAdd(customer_id)" type="primary" icon="plus">新增</a-button>
                    <a-button type="primary" icon="download" @click="handleExportXls('平台验证管理')">导出</a-button>
                    <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader"
                        :action="importExcelUrl" @change="handleImportExcel">
                        <a-button type="primary" icon="import">导入</a-button>
                    </a-upload> -->
                    <!-- <j-super-query :fieldList="superFieldList" ref="superQueryModal"
                    @handleSuperQuery="handleSuperQuery"></j-super-query>
                <a-dropdown v-if="selectedRowKeys.length > 0">
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
                            <!-- <a @click="handleEdit(record)">编辑</a> -->
                            <a-popconfirm v-if="record.state != '1'" title="确定退回吗?"
                                @confirm="() => handleRefund(record.id)">
                                <a>退回</a>
                            </a-popconfirm>
                            <!-- <a-dropdown>
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

            </a-card>
        </a-spin>


        <div class="drawer-bootom-button">
            <a-button @click="handleCancel" type="primary" :loading="confirmLoading">关闭</a-button>
        </div>

        <TabFundAllocationsModal ref="tabFundAllocationsModal" @ok="searchQuery"></TabFundAllocationsModal>
    </a-drawer>
</template>

<script>
import { mixinDevice } from '@/utils/mixin'
import { httpAction } from '@/api/manage'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import TabFundAllocationsModal from './modules/TabFundAllocationsModal.vue'
export default {
    name: "FenpeiDrawer",
    mixins: [JeecgListMixin, mixinDevice],
    components: {
        TabFundAllocationsModal
    },
    data() {
        return {
            title: "资金分配列表",
            visible: false,
            modalWidth: 800,
            drawerWidth: 1000,
            modaltoggleFlag: true,
            confirmLoading: false,
            model: {},
            labelCol: {
                xs: { span: 24 },
                sm: { span: 5 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },

            queryParam: {},
            columns: [
                {
                    title: '客户回款记录ID',
                    align: "center",
                    dataIndex: 'paymentRecordId'
                },
                {
                    title: '分配状态',
                    align: "center",
                    dataIndex: "state",
                    customRender: function (text) {
                        return text == "1" ? "已退回" : "正常"
                    }
                },
                {
                    title: '客户名称',
                    align: "center",
                    dataIndex: 'customerName'
                },
                {
                    title: '项目名称',
                    align: "center",
                    dataIndex: 'projectName'
                },
                {
                    title: '分配金额',
                    align: "center",
                    dataIndex: 'money'
                },
                {
                    title: '归属日期(年-月)',
                    align: "center",
                    dataIndex: 'vestingDay',
                    customRender: function (text) {
                        return !text ? "" : (text.length > 10 ? text.substr(0, 10) : text)
                    }
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
                list: "/fundAllocations/list",
                // delete: "/fundAllocations/refund",
                // deleteBatch: "/customerRebate/deleteBatch",
                exportXlsUrl: "/fundAllocations/exportXls",
                // importExcelUrl: "customerRebate/importExcel",
            },
            dictOptions: {},
            superFieldList: [],
            paymentRecordId: ''
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
        show(id) {
            // console.log(id, 'paymentRecordId')
            id += ''
            this.visible = true;
            this.paymentRecordId = id
            this.queryParam.paymentRecordId = id
            this.searchQuery()
            this.resetScreenSize();
        },
        searchReset() {
            // this.queryParam = {
            //     paymentRecordId: this.paymentRecordId
            // }
            this.loadData(1);
        },
        //窗口最大化切换
        toggleScreen() {
            if (this.modaltoggleFlag) {
                this.modalWidth = window.innerWidth;
            } else {
                this.modalWidth = 800;
            }
            this.modaltoggleFlag = !this.modaltoggleFlag;
        },
        // 根据屏幕变化,设置抽屉尺寸
        resetScreenSize() {
            let screenWidth = document.body.clientWidth;
            if (screenWidth < 500) {
                this.drawerWidth = screenWidth;
            } else {
                this.drawerWidth = 1600;
            }
        },
        close() {
            this.$emit('close');
            this.visible = false;
        },
        handleCancel() {
            this.close()
        },
        initDictConfig() {
        },
        getSuperFieldList() {
            let fieldList = [];
            // fieldList.push({ type: 'int', value: 'delFlag', text: '删除标识（0：未删除1：已删除）', dictCode: '' })
            // fieldList.push({ type: 'number', value: 'rebate', text: '返点', dictCode: '' })
            // fieldList.push({ type: 'date', value: 'effectiveDate', text: '生效日期', dictCode: '' })

            this.superFieldList = fieldList
        },
        handleAdd() {
            this.$refs['tabFundAllocationsModal'].add(this.paymentRecordId)
        },
        handleRefund(id) {
            httpAction("/fundAllocations/refund", { id }, "POST").then((res) => {
                if (res.success) {
                    this.searchQuery()
                    this.$message.success(res.message);
                    this.$emit('ok');
                } else {
                    this.$message.warning(res.message);
                }
            }).finally(() => {
                this.confirmLoading = false;
            })
        }
    }
}
</script>

<style scoped>
.avatar-uploader>.ant-upload {
    width: 104px;
    height: 104px;
}

.ant-upload-select-picture-card i {
    font-size: 49px;
    color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
    margin-top: 8px;
    color: #666;
}

.ant-table-tbody .ant-table-row td {
    padding-top: 10px;
    padding-bottom: 10px;
}

.drawer-bootom-button {
    position: absolute;
    bottom: 0;
    width: 100%;
    border-top: 1px solid #e8e8e8;
    padding: 10px 16px;
    text-align: right;
    left: 0;
    background: #fff;
    border-radius: 0 0 2px 2px;
}

/*【JTC-502】 添加用户两个滚动条*/
/deep/ .ant-drawer-body {
    padding-bottom: 53px;
}
</style>