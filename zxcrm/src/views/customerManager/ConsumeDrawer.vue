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
                <div>
                    <a-table ref="table" size="middle" bordered rowKey="id" :columns="columns" :dataSource="dataSource"
                        :pagination="ipagination" :loading="loading"
                        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
                        :customRow="customRow" class="j-table-force-nowrap" @change="handleTableChange">

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
                            </a-dropdown>
                        </span>

                    </a-table>
                </div>

                <RebateModal ref="modalForm" @ok="modalFormOk"></RebateModal>
            </a-card>
        </a-spin>

        <div class="drawer-bootom-button">
            <a-button @click="handleCancel" type="primary" :loading="confirmLoading">关闭</a-button>
        </div>
    </a-drawer>
</template>

<script>
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import RebateModal from './modules/RebateModal.vue'
import { httpAction } from '@/api/manage'

export default {
    name: "ConsumeDrawer",
    mixins: [JeecgListMixin, mixinDevice],
    components: {
        RebateModal
    },
    data() {
        return {
            title: "客户回款状态列表",
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
                    title: '项目名称',
                    align: "center",
                    dataIndex: 'proName',
                    width: 150
                },
                {
                    title: '月份',
                    align: "center",
                    dataIndex: 'dateMonth',
                    width: 100
                },
                {
                    title: '合作方式',
                    align: "center",
                    dataIndex: 'collaborationMode',
                    width: 100,
                    customRender: (text) => {
                        const modeMap = {
                            '0': '预付',
                            '1': '垫付',
                            '2': '服务费',
                        };
                        return modeMap[text] || text;
                    }
                },
                {
                    title: 'AE',
                    align: "center",
                    dataIndex: 'aePerson',
                    width: 120,
                    customRender: (text) => {
                        if (!text) return '-';
                        const user = this.userIdAndRealnameList.find(item => item.id === text);
                        return user ? user.realname : text;
                    }
                },
                {
                    title: '商务',
                    align: "center",
                    dataIndex: 'businessPerson',
                    width: 120,
                    customRender: (text) => {
                        if (!text) return '-';
                        const user = this.userIdAndRealnameList.find(item => item.id === text);
                        return user ? user.realname : text;
                    }
                },
                {
                    title: '总消耗',
                    align: "center",
                    dataIndex: 'totalCharged',
                    width: 120,
                    customRender: (text) => text ? Number(text).toFixed(2) : '0.00'
                },
                {
                    title: '现金消耗',
                    align: "center",
                    dataIndex: 'cashDrain',
                    width: 120,
                    customRender: (text) => text ? Number(text).toFixed(2) : '0.00'
                },
                {
                    title: '应回款',
                    align: "center",
                    dataIndex: 'revenue',
                    width: 120,
                    customRender: (text, record) => {
                        return record.revenue ? Number(record.revenue).toFixed(2) : '0.00'
                    }
                },
                {
                    title: '已回款',
                    align: "center",
                    dataIndex: 'arrivalAmount',
                    width: 120,
                    customRender: (text) => text ? Number(text).toFixed(2) : '未到账'
                },
                {
                    title: '最后回款日期',
                    align: "center",
                    dataIndex: 'lastArrivalTime',
                    width: 120,
                    customRender: (text) => text || '未到账'
                },
                {
                    title: '逾期天数',
                    align: "center",
                    dataIndex: 'overdueDays',
                    width: 100,
                    customRender: (text) => text || 0
                },
                {
                    title: '逾期次数',
                    align: "center",
                    dataIndex: 'overdueCount',
                    minWidth: 80,
                    customRender: (text) => text || 0
                },
                {
                    title: '回款状态',
                    align: "center",
                    dataIndex: 'repayStatus',
                    width: 100,
                    customRender: (text, record) => {
                        const arrivalAmount = Number(record.arrivalAmount) || 0;
                        const revenue = Number(record.revenue) || 0;

                        if (arrivalAmount === 0) {
                            return '未回款';
                        } else if (arrivalAmount < revenue) {
                            return '部分回款';
                        } else {
                            return '回款完成';
                        }
                    }
                },
            ],
            url: {
                list: "tempProjectPaymentRecords/list"
            },
            customer_id: '',
            // 用户ID和真实姓名组合数据
            userIdAndRealnameList: []
        }
    },
    created() {
        this.getUserIdAndRealnameCombination();
    },
    methods: {
        show(id) {
            id += ''
            this.visible = true;
            this.customer_id = id

            this.queryParam = {
                customerId: id
            }

            this.searchQuery()
            this.resetScreenSize();
        },
        searchReset() {
            this.queryParam = {
                customerId: this.customer_id
            }
            this.loadData(1);
        },
        toggleScreen() {
            if (this.modaltoggleFlag) {
                this.modalWidth = window.innerWidth;
            } else {
                this.modalWidth = 800;
            }
            this.modaltoggleFlag = !this.modaltoggleFlag;
        },
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
            // 清空数据源，避免下次打开时显示旧数据
            this.dataSource = [];
            this.selectedRowKeys = [];
        },
        handleCancel() {
            this.close()
        },
        async searchQuery() {
            this.loadData(1);
        },
        async loadData(arg) {
            if (!this.url.list) {
                this.$message.error('请设置url.list属性!')
                return
            }
            //加载数据 若传入参数1则加载第一页的内容
            if (arg === 1) {
                this.ipagination.current = 1;
            }
            this.loading = true;
            try {
                const params = this.getQueryParams();//查询条件
                const res = await this.$http.get(this.url.list, { params });
                if (res.success) {
                    // 为每条数据添加唯一的id
                    this.dataSource = res.result.records.map((item, index) => ({
                        ...item,
                        id: item.id ? `${item.id}_${index}` : `main_${index}` // 确保id唯一性
                    }));
                    this.ipagination.total = res.result.total;
                }
            } catch (error) {
                console.error('加载数据失败:', error);
            } finally {
                this.loading = false;
            }
        },
        customRow(record) {
            const arrivalAmount = Number(record.arrivalAmount) || 0;
            const revenue = Number(record.revenue) || 0;

            if (arrivalAmount === 0) {
                return {
                    style: {
                        'background-color': '#fff2f0'  // 未回款 - 浅红色背景
                    }
                }
            } else if (arrivalAmount < revenue) {
                return {
                    style: {
                        'background-color': '#e6f7ff'  // 部分回款 - 浅蓝色背景
                    }
                }
            } else {
                return {
                    style: {
                        'background-color': '#f6ffed'  // 回款完成 - 浅绿色背景
                    }
                }
            }
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

::v-deep .ant-drawer-body {
    padding-bottom: 53px;
}
</style>