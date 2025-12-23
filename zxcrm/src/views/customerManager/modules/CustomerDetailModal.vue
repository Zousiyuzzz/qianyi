<template>
    <a-modal :title="title" :visible="visible" :width="1000" :footer="null" @cancel="handleCancel"
        :destroyOnClose="true" class="customer-detail-modal">
        <div class="customer-detail-content" v-if="customerData">
            <!-- 基本信息卡片 -->
            <a-card title="基本信息" class="detail-card" :bordered="false">
                <a-row :gutter="[16, 16]">
                    <a-col :span="12">
                        <div class="info-item">
                            <span class="label">客户ID：</span>
                            <span class="value">{{ customerData.id }}</span>
                        </div>
                    </a-col>
                    <a-col :span="12">
                        <div class="info-item">
                            <span class="label">客户主体：</span>
                            <span v-if="!isEditingCustomerName" class="value editable" @dblclick="startEditCustomerName"
                                :title="'双击编辑'">
                                {{ customerData.customerName }}
                            </span>
                            <a-input v-else v-model="editingCustomerName" @blur="saveCustomerName"
                                @pressEnter="saveCustomerName" ref="customerNameInput" size="small"
                                style="width: 200px;" />
                        </div>
                    </a-col>
                    <a-col :span="12">
                        <div class="info-item">
                            <span class="label">商务：</span>
                            <span class="value">{{ customerData.salesPerson_dictText }}</span>
                        </div>
                    </a-col>
                    <a-col :span="12">
                        <div class="info-item">
                            <span class="label">运营方式：</span>
                            <span class="value">{{
                                getOperationModes(customerData.projectsByClientDistinctOnOperationModes) }}</span>
                        </div>
                    </a-col>
                    <a-col :span="12">
                        <div class="info-item">
                            <span class="label">渠道状态：</span>
                            <a-tag :color="getChannelStatusColor(customerData.lastConsumeTimeByProjectChannels)">
                                {{ getChannelStatusSummary(customerData.lastConsumeTimeByProjectChannels) }}
                            </a-tag>
                        </div>
                    </a-col>
                </a-row>
            </a-card>

            <!-- 渠道停投状态详情 -->
            <a-card title="渠道停投状态详情" class="detail-card" :bordered="false" v-if="channelStatusData.length > 0">
                <div class="channel-status-summary">
                    <a-row :gutter="16">
                        <a-col :span="8">
                            <a-statistic title="总渠道数" :value="channelStatusData.length" />
                        </a-col>
                        <a-col :span="8">
                            <a-statistic title="合作中" :value="activeChannelCount" :value-style="{ color: '#52c41a' }" />
                        </a-col>
                        <a-col :span="8">
                            <a-statistic title="已停投" :value="stoppedChannelCount" :value-style="{ color: '#ff4d4f' }" />
                        </a-col>
                    </a-row>
                </div>

                <div class="channel-table-container">
                    <a-table :columns="channelStatusColumns" :dataSource="channelStatusData" :pagination="false"
                        size="middle" bordered rowKey="channel_sign" class="channel-status-table">
                        <template slot="channelName" slot-scope="text, record">
                            <j-dict-name-display :value="record.channel_sign" dictCode="channelSign_system"
                                placeholder="未知渠道" />
                        </template>
                        <template slot="businessPerson" slot-scope="text, record">
                            <span>{{ getUserRealnameById(record.businessPerson) }}</span>
                        </template>
                        <template slot="status" slot-scope="text, record">
                            <a-tag :color="record.status.includes('合作中') ? 'green' : 'red'">
                                {{ record.status }}
                            </a-tag>
                        </template>
                    </a-table>
                </div>
            </a-card>

            <!-- 客户返点信息 -->
            <!-- <a-card title="客户返点信息" class="detail-card" :bordered="false"
                v-if="customerData.customerRebates && customerData.customerRebates.length > 0">
                <div class="rebate-table-container">
                    <a-table :columns="rebateColumns" :dataSource="customerData.customerRebates" :pagination="false"
                        size="small" bordered rowKey="id" class="rebate-table">
                        <template slot="rebateMode" slot-scope="text">
                            <a-tag color="blue">{{ text === '1' ? '按比例' : '固定金额' }}</a-tag>
                        </template>
                        <template slot="rebateForm" slot-scope="text">
                            <a-tag color="purple">{{ text === '1' ? '对公' : '对私' }}</a-tag>
                        </template>
                        <template slot="externalRebate" slot-scope="text">
                            <span class="rebate-value">{{ text ? (text * 100).toFixed(2) + '%' : '-' }}</span>
                        </template>
                        <template slot="privateRebate" slot-scope="text">
                            <span class="rebate-value">{{ text ? (text * 100).toFixed(2) + '%' : '-' }}</span>
                        </template>
                    </a-table>
                </div>
            </a-card> -->
        </div>

        <div class="modal-footer">
            <a-button @click="handleCancel" type="primary">关闭</a-button>
        </div>
    </a-modal>
</template>

<script>
import JDictNameDisplay from '@/components/dict/JDictNameDisplay.vue'

export default {
    name: 'CustomerDetailModal',
    components: {
        JDictNameDisplay
    },
    data() {
        return {
            visible: false,
            title: '客户详情',
            customerData: null,
            channelStatusData: [],
            activeChannelCount: 0,
            stoppedChannelCount: 0,
            // 编辑状态
            isEditingCustomerName: false,
            editingCustomerName: '',
            // 用户ID和真实姓名组合数据
            userIdAndRealnameList: [],
            // 渠道状态表格列定义
            channelStatusColumns: [
                {
                    title: '渠道名称',
                    dataIndex: 'channelName',
                    key: 'channelName',
                    width: 180,
                    ellipsis: true,
                    scopedSlots: { customRender: 'channelName' }
                },
                {
                    title: '项目名称',
                    dataIndex: 'proName',
                    key: 'proName',
                    width: 220,
                    ellipsis: true
                },
                {
                    title: '商务',
                    dataIndex: 'businessPerson',
                    key: 'businessPerson',
                    width: 100,
                    ellipsis: true,
                    scopedSlots: { customRender: 'businessPerson' }
                },
                {
                    title: '最后消耗日期',
                    dataIndex: 'data',
                    key: 'data',
                    width: 130
                },
                {
                    title: '状态',
                    dataIndex: 'status',
                    key: 'status',
                    width: 100,
                    scopedSlots: { customRender: 'status' }
                }
            ],
            // 返点表格列定义
            rebateColumns: [
                {
                    title: '生效日期',
                    dataIndex: 'effectiveDate',
                    key: 'effectiveDate',
                    width: 120
                },
                {
                    title: '结束日期',
                    dataIndex: 'nextEffectiveDate',
                    key: 'nextEffectiveDate',
                    width: 120,
                    customRender: (text) => text || '至今'
                },
                {
                    title: '返点模式',
                    dataIndex: 'rebateMode',
                    key: 'rebateMode',
                    width: 100,
                    scopedSlots: { customRender: 'rebateMode' }
                },
                {
                    title: '返点形式',
                    dataIndex: 'rebateForm',
                    key: 'rebateForm',
                    width: 100,
                    scopedSlots: { customRender: 'rebateForm' }
                },
                {
                    title: '对公返点',
                    dataIndex: 'externalRebate',
                    key: 'externalRebate',
                    width: 120,
                    scopedSlots: { customRender: 'externalRebate' }
                },
                {
                    title: '对私返点',
                    dataIndex: 'privateRebate',
                    key: 'privateRebate',
                    width: 120,
                    scopedSlots: { customRender: 'privateRebate' }
                },
                {
                    title: '备注',
                    dataIndex: 'remarks',
                    key: 'remarks',
                    ellipsis: true
                }
            ]
        }
    },
    methods: {
        show(record, userIdAndRealnameList = []) {
            this.customerData = record;
            this.userIdAndRealnameList = userIdAndRealnameList;
            this.visible = true;
            this.title = `${record.customerName} - 客户详情`;
            this.processChannelStatusData(record);
        },
        handleCancel() {
            this.visible = false;
            this.customerData = null;
            this.channelStatusData = [];
            this.isEditingCustomerName = false;
            this.editingCustomerName = '';
        },
        // 开始编辑客户主体名称
        startEditCustomerName() {
            this.isEditingCustomerName = true;
            this.editingCustomerName = this.customerData.customerName;
            this.$nextTick(() => {
                this.$refs.customerNameInput.focus();
            });
        },
        // 保存客户主体名称
        async saveCustomerName() {
            if (this.editingCustomerName.trim() === '') {
                this.$message.warning('客户主体名称不能为空');
                return;
            }

            if (this.editingCustomerName === this.customerData.customerName) {
                // 没有变化，直接退出编辑状态
                this.isEditingCustomerName = false;
                return;
            }

            try {
                // 调用API保存
                const { httpAction } = require('@/api/manage');
                const result = await httpAction('/customerManage/edit', {
                    ...this.customerData,
                    customerName: this.editingCustomerName.trim()
                }, 'put');

                if (result.success) {
                    this.$message.success('客户主体名称修改成功');
                    this.customerData.customerName = this.editingCustomerName.trim();
                    this.title = `${this.customerData.customerName} - 客户详情`;
                    this.isEditingCustomerName = false;
                    // 通知父组件刷新列表
                    this.$emit('refresh');
                } else {
                    this.$message.error(result.message || '修改失败');
                }
            } catch (error) {
                console.error('保存客户名称失败:', error);
                this.$message.error('保存失败，请重试');
            }
        },
        // 处理渠道状态数据
        processChannelStatusData(record) {
            if (record.lastConsumeTimeByProjectChannels && Array.isArray(record.lastConsumeTimeByProjectChannels)) {
                this.channelStatusData = record.lastConsumeTimeByProjectChannels.map(channel => ({
                    channel_sign: channel.channel_sign,
                    channelName: channel.channel_sign, // 使用原始渠道标识，由JDictNameDisplay组件处理显示
                    proName: channel.proName,
                    businessPerson: channel.businessPerson || record.salesPerson, // 优先使用渠道的商务，如果没有则使用客户的商务
                    data: channel.data,
                    status: this.getChannelStatus(channel.data)
                }));

                // 统计合作中和停投的渠道数量
                this.activeChannelCount = this.channelStatusData.filter(item => item.status.includes('合作中')).length;
                this.stoppedChannelCount = this.channelStatusData.filter(item => item.status.includes('停投')).length;
            } else {
                this.channelStatusData = [];
                this.activeChannelCount = 0;
                this.stoppedChannelCount = 0;
            }
        },
        // 获取渠道状态
        getChannelStatus(date) {
            if (!date) return '-';

            const targetDate = new Date(date);
            const today = new Date();

            const timeDiff = today.getTime() - targetDate.getTime();
            const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

            if (daysDiff < 30) {
                return '合作中';
            } else {
                return `停投${daysDiff}天`;
            }
        },
        // 获取运营方式显示
        getOperationModes(modes) {
            if (!modes || !Array.isArray(modes)) return '-';

            const operationModeMap = {
                '1': '自运营',
                '2': '走量',
                '3': '收量'
            };

            const modeNames = modes.map(mode => operationModeMap[mode] || mode);
            // 去重并保持顺序
            const uniqueModeNames = [...new Set(modeNames)];
            return uniqueModeNames.join('、');
        },
        // 获取渠道状态汇总
        getChannelStatusSummary(channels) {
            if (!channels || !Array.isArray(channels) || channels.length === 0) {
                return '待消耗';
            }

            const today = new Date();
            let activeCount = 0;
            let stoppedCount = 0;

            channels.forEach(channel => {
                if (channel.data) {
                    const targetDate = new Date(channel.data);
                    const timeDiff = today.getTime() - targetDate.getTime();
                    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

                    if (daysDiff < 30) {
                        activeCount++;
                    } else {
                        stoppedCount++;
                    }
                }
            });

            if (activeCount === 0 && stoppedCount > 0) {
                return '全部停投';
            } else if (activeCount > 0 && stoppedCount > 0) {
                return '部分停投';
            } else if (activeCount > 0 && stoppedCount === 0) {
                return '合作中';
            } else {
                return '待消耗';
            }
        },
        // 获取渠道状态颜色
        getChannelStatusColor(channels) {
            const summary = this.getChannelStatusSummary(channels);
            if (summary === '合作中') return 'green';
            if (summary === '部分停投') return 'orange';
            if (summary === '全部停投') return 'red';
            if (summary === '待消耗') return 'blue';
            return 'default';
        },
        // 根据用户ID获取真实姓名
        getUserRealnameById(userId) {
            if (!userId || !this.userIdAndRealnameList.length) {
                return userId || '-';
            }
            const user = this.userIdAndRealnameList.find(item => item.id === userId);
            return user ? user.realname : userId;
        },
    }
}
</script>

<style lang="less" scoped>
.customer-detail-modal {
    .ant-modal-body {
        padding: 24px;
        max-height: 70vh;
        overflow-y: auto;
        overflow-x: hidden;

        /* 只在内容超出时才显示滚动条 */
        &::-webkit-scrollbar {
            width: 6px;
        }

        &::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
        }

        &::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 3px;
        }

        &::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
        }
    }
}

.customer-detail-content {
    .detail-card {
        margin-bottom: 16px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        &:last-child {
            margin-bottom: 0;
        }

        .ant-card-head {
            border-bottom: 1px solid #f0f0f0;

            .ant-card-head-title {
                font-weight: 600;
                color: #262626;
            }
        }
    }

    .info-item {
        display: flex;
        align-items: center;
        margin-bottom: 8px;

        .label {
            color: #666;
            font-weight: 500;
            min-width: 80px;
        }

        .value {
            color: #262626;
            font-weight: 400;

            &.editable {
                cursor: pointer;
                padding: 2px 6px;
                border-radius: 4px;
                transition: all 0.3s ease;

                &:hover {
                    background-color: #f0f0f0;
                    color: #1890ff;
                }
            }
        }
    }

    .channel-status-summary {
        margin-bottom: 16px;
        padding: 16px;
        background: #fafafa;
        border-radius: 6px;

        .ant-statistic {
            text-align: center;
        }
    }

    .channel-table-container,
    .rebate-table-container {
        overflow-x: auto;

        .channel-status-table,
        .rebate-table {
            min-width: 100%;

            .ant-table-thead>tr>th {
                background-color: #fafafa;
                font-weight: 600;
                color: #262626;
            }

            .ant-table-tbody>tr:hover>td {
                background-color: #f5f5f5;
            }
        }
    }

    .rebate-value {
        font-weight: 600;
        color: #1890ff;
    }
}

.modal-footer {
    text-align: center;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
    margin-top: 16px;
}

// 响应式设计
@media (max-width: 768px) {
    .customer-detail-content {
        .info-item {
            flex-direction: column;
            align-items: flex-start;

            .label {
                margin-bottom: 4px;
            }
        }

        .channel-status-summary {
            .ant-row {
                .ant-col {
                    margin-bottom: 16px;
                }
            }
        }
    }
}
</style>
