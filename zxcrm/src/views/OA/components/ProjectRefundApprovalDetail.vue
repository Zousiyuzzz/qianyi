<template>
    <div class="project-refund-approval-detail">
        <!-- 退款信息板块 -->
        <div class="form-section refund-section" v-if="businessFormData">
            <h4 class="form-section-title">退款信息</h4>
            <a-descriptions :column="2" bordered>
                <!-- 项目字段优先显示 -->
                <a-descriptions-item
                    v-if="shouldDisplayField('proName', businessFormData ? businessFormData.proName : null)" label="项目"
                    key="proName">
                    {{ formatFieldValue('proName', businessFormData ? businessFormData.proName : null) }}
                </a-descriptions-item>
                <template v-for="(value, key) in businessFormData">
                    <a-descriptions-item
                        v-if="shouldDisplayField(key, value) && !isPartyAField(key) && !isPartyBField(key) && key !== 'proName'"
                        :key="key" :label="getFieldLabel(key)">
                        {{ formatFieldValue(key, value) }}
                    </a-descriptions-item>
                </template>
            </a-descriptions>
        </div>

        <!-- 甲方信息板块 -->
        <div class="form-section party-a-section" v-if="businessFormData">
            <h4 class="form-section-title">甲方信息</h4>
            <a-descriptions :column="2" bordered>
                <template v-for="(value, key) in businessFormData">
                    <a-descriptions-item v-if="shouldDisplayField(key, value) && isPartyAField(key)" :key="key"
                        :label="getFieldLabel(key)">
                        {{ formatFieldValue(key, value) }}
                    </a-descriptions-item>
                </template>
            </a-descriptions>
        </div>

        <!-- 乙方信息板块 -->
        <div class="form-section party-b-section" v-if="businessFormData">
            <h4 class="form-section-title">乙方信息</h4>
            <a-descriptions :column="2" bordered>
                <template v-for="(value, key) in businessFormData">
                    <a-descriptions-item v-if="shouldDisplayField(key, value) && isPartyBField(key)" :key="key"
                        :label="getFieldLabel(key)">
                        {{ formatFieldValue(key, value) }}
                    </a-descriptions-item>
                </template>
            </a-descriptions>
        </div>

        <!-- 附件信息板块 -->
        <div class="form-section file-section" v-if="fileList && fileList.length > 0">
            <h4 class="form-section-title">附件</h4>
            <a-list :dataSource="fileList" size="small">
                <a-list-item slot="renderItem" slot-scope="item">
                    <a-list-item-meta>
                        <span slot="title">
                            <a-icon type="paper-clip" style="margin-right: 8px;" />
                            {{ item.name || item.fileName || item.path || '未知文件' }}
                        </span>
                        <span slot="description" v-if="item.size">
                            大小：{{ formatFileSize(item.size) }}
                        </span>
                    </a-list-item-meta>
                    <template slot="actions">
                        <a-button type="link" icon="download" size="small" @click="downloadFile(item)">下载</a-button>
                    </template>
                </a-list-item>
            </a-list>
        </div>
    </div>
</template>

<script>
import { getFileAccessHttpUrl } from '@/api/manage'

export default {
    name: 'ProjectRefundApprovalDetail',
    props: {
        businessFormData: {
            type: Object,
            default: null
        },
        fileList: {
            type: Array,
            default: () => []
        }
    },
    methods: {
        // 判断是否是甲方字段
        isPartyAField(key) {
            const partyAFields = ['partyAName', 'partyATaxNo', 'partyABank', 'partyAAccount', 'partyAAddress', 'partyAPhone']
            return partyAFields.includes(key)
        },
        // 判断是否是乙方字段
        isPartyBField(key) {
            const partyBFields = ['accountName', 'accountNo', 'proName', 'contractNo']
            return partyBFields.includes(key)
        },
        // 判断字段是否应该显示
        shouldDisplayField(key, value) {
            // 排除一些不需要显示的字段
            const excludeFields = ['id', 'proId', 'createBy', 'createTime', 'updateBy', 'updateTime', 'delFlag', 'sysOrgCode', 'tenantId', 'processStatus', 'collaborationMode', 'repayDay', 'creditLimit', 'remark', 'state', 'bankAccountId', 'bankAccountConfigId', 'ourTitleId']
            if (excludeFields.includes(key)) return false

            // 排除空值
            if (value === null || value === undefined || value === '') return false
            // 排除数组中的空值
            if (Array.isArray(value) && value.length === 0) return false
            return true
        },
        // 获取字段标签
        getFieldLabel(key) {
            const labelMap = {
                'proName': '项目',
                'proId': '项目ID',
                'proUniqueId': '项目唯一标识',
                'refundAmount': '退款金额',
                'fundsNature': '资金性质',
                'dateMonth': '退款月份',
                'refundTime': '退款时间',
                'customerTitleId': '客户抬头ID',
                'customerTitle': '客户抬头',
                'ourTitleId': '我方抬头ID',
                'ourTitle': '我方抬头',
                'remarks': '备注',
                'state': '状态',
                'partyAName': '甲方单位名称',
                'partyATaxNo': '甲方税号',
                'partyABank': '甲方开户银行',
                'partyAAccount': '甲方银行账号',
                'partyAAddress': '甲方地址',
                'partyAPhone': '甲方电话',
                'accountName': '乙方单位名称',
                'accountNo': '账户号',
                'bankAccountId': '抬头管理ID',
                'bankAccountConfigId': '我方抬头ID',
                'businessId': '业务表ID'
            }
            return labelMap[key] || key
        },
        // 格式化字段值
        formatFieldValue(key, value) {
            if (value === null || value === undefined) return '-'
            // 处理资金性质
            if (key === 'fundsNature') {
                const natureMap = {
                    '1': '对公',
                    '2': '对私',
                    1: '对公',
                    2: '对私'
                }
                return natureMap[value] || value
            }
            // 处理状态
            if (key === 'state') {
                const stateMap = {
                    '1': '退款中',
                    '2': '退款成功',
                    '3': '退款驳回',
                    '4': '退款撤回',
                    1: '退款中',
                    2: '退款成功',
                    3: '退款驳回',
                    4: '退款撤回'
                }
                return stateMap[value] || value
            }
            // 处理退款金额
            if (key === 'refundAmount') {
                return value != null ? `${value} 元` : '-'
            }
            // 处理日期时间
            if (key === 'refundTime' || key === 'signDate' || key === 'endDate') {
                return value || '-'
            }
            // 默认返回原值
            return value
        },
        // 下载文件
        downloadFile(file) {
            const filePath = file.path || file.url || file.filePath || file.fileUrl
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

<style scoped lang="less">
.project-refund-approval-detail {
    .form-section {
        margin-bottom: 24px;

        &:last-child {
            margin-bottom: 0;
        }

        .form-section-title {
            font-size: 16px;
            font-weight: 500;
            color: #333;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 1px solid #f0f0f0;
        }
    }

    .refund-section {
        .form-section-title {
            color: #52c41a;
        }
    }

    .party-a-section {
        .form-section-title {
            color: #52c41a;
        }
    }

    .party-b-section {
        .form-section-title {
            color: #52c41a;
        }
    }

    .file-section {
        .form-section-title {
            color: #722ed1;
        }
    }
}
</style>
