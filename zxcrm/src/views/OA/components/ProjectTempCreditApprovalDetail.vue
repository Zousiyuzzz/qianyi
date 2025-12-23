<template>
    <div class="project-temp-credit-approval-detail">
        <!-- 临时授信信息板块 -->
        <div class="form-section temp-credit-section" v-if="businessFormData">
            <h4 class="form-section-title">临时授信信息</h4>
            <a-descriptions :column="2" bordered>
                <template v-for="(value, key) in businessFormData">
                    <a-descriptions-item v-if="shouldDisplayField(key, value)" :key="key" :label="getFieldLabel(key)">
                        {{ formatFieldValue(key, value) }}
                    </a-descriptions-item>
                </template>
                <a-descriptions-item label="合同编号">
                    {{ businessFormData.contractInfo.contractNo || '-' }}
                </a-descriptions-item>
                <a-descriptions-item label="备注">
                    {{ businessFormData.remark || '-' }}
                </a-descriptions-item>
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
    name: 'ProjectTempCreditApprovalDetail',
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
    mounted() {
    },
    methods: {
        // 判断字段是否应该显示
        shouldDisplayField(key, value) {
            // 排除一些不需要显示的字段
            const excludeFields = ['remark', 'contractInfo', 'id', 'createBy', 'createTime', 'hasContract', 'contractId', 'updateBy', 'updateTime', 'delFlag', 'sysOrgCode', 'tenantId', 'processStatus', 'proId', 'status', 'isIncrease']
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
                'proName': '项目名称',
                'tempAmount': '临时授信金额',
                'startDate': '临时授信生效日期',
                'endDate': '临时授信回款日期',
            }
            return labelMap[key] || key
        },
        // 格式化字段值
        formatFieldValue(key, value) {
            if (value === null || value === undefined) return '-'
            // 处理临时授信金额
            if (key === 'tempAmount') {
                return value != null ? `${value} 元` : '-'
            }
            // 处理日期
            if (key === 'startDate' || key === 'endDate') {
                return value || '-'
            }
            // 处理数组（如项目ID数组）
            if (Array.isArray(value)) {
                return value.join(', ')
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
.project-temp-credit-approval-detail {
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

    .temp-credit-section {
        .form-section-title {
            color: #1890ff;
        }
    }

    .file-section {
        .form-section-title {
            color: #722ed1;
        }
    }
}
</style>
