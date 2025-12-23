<template>
    <div class="contract-approval-detail">
        <!-- 合同信息板块 -->
        <div class="form-section contract-section" v-if="businessFormData">
            <h4 class="form-section-title">合同信息</h4>
            <a-descriptions :column="2" bordered>
                <template v-for="(value, key) in businessFormData">
                    <a-descriptions-item
                        v-if="shouldDisplayField(key, value) && !isPartyAField(key) && !isPartyBField(key) && key !== 'collaborationMode' && key !== 'repayDay' && key !== 'creditLimit' && key !== 'remark'"
                        :key="key" :label="getFieldLabel(key)">
                        {{ formatFieldValue(key, value) }}
                    </a-descriptions-item>
                </template>
                <!-- 强制显示字段（始终显示，即使值为空） -->
                <a-descriptions-item label="合作方式" key="collaborationMode">
                    {{ formatFieldValue('collaborationMode', businessFormData ? businessFormData.collaborationMode :
                    null) }}
                </a-descriptions-item>
                <a-descriptions-item label="账期" key="repayDay">
                    {{ formatFieldValue('repayDay', businessFormData ? businessFormData.repayDay : null) }}
                </a-descriptions-item>
                <a-descriptions-item label="授信额度" key="creditLimit">
                    {{ formatFieldValue('creditLimit', businessFormData ? businessFormData.creditLimit : null) }}
                </a-descriptions-item>
                <!-- 邮寄信息放在最后 -->
                <a-descriptions-item
                    v-if="shouldDisplayField('remark', businessFormData ? businessFormData.remark : null)" label="邮寄信息"
                    key="remark">
                    {{ formatFieldValue('remark', businessFormData ? businessFormData.remark : null) }}
                </a-descriptions-item>
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
            <h4 class="form-section-title">附件 ({{ fileList.length }})</h4>
            <a-list :dataSource="fileList" size="small" bordered>
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
        <!-- 调试信息：显示附件列表状态 -->
        <div v-if="fileList && fileList.length === 0" style="padding: 8px; color: #999; font-size: 12px;">
            暂无附件
        </div>
    </div>
</template>

<script>
import { getFileAccessHttpUrl } from '@/api/manage'

export default {
    name: 'ContractApprovalDetail',
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
    watch: {
        fileList: {
            immediate: true,
            handler(newVal) {
                console.log('ContractApprovalDetail - fileList变化:', newVal, '数量:', newVal ? newVal.length : 0)
            }
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
            const excludeFields = ['id', 'proId', 'createBy', 'createTime', 'updateBy', 'updateTime', 'delFlag', 'sysOrgCode', 'tenantId', 'processStatus']
            if (excludeFields.includes(key)) return false

            // 对于合作方式，'0', '1', '2' 都是有效值
            if (key === 'collaborationMode') {
                return value !== null && value !== undefined && value !== '' && (value === '0' || value === '1' || value === '2' || value === 0 || value === 1 || value === 2)
            }

            // 对于数字类型字段（账期、授信额度），0也是有效值，需要显示
            if (key === 'repayDay' || key === 'creditLimit') {
                return value !== null && value !== undefined && value !== ''
            }

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
                'proIdArray': '项目',
                'proUniqueId': '项目唯一标识',
                'contractNo': '合同编号',
                'signDate': '签约日期',
                'endDate': '截止日期',
                'contractType': '合同类型',
                'collaborationMode': '合作方式',
                'repayDay': '账期',
                'creditLimit': '授信额度',
                'partyAName': '甲方单位名称',
                'partyATaxNo': '甲方税号',
                'partyABank': '甲方开户银行',
                'partyAAccount': '甲方银行账号',
                'partyAAddress': '甲方地址',
                'partyAPhone': '甲方电话',
                'accountName': '乙方单位名称',
                'accountNo': '账户号',
                'cardId': '甲方卡号',
                'remark': '邮寄信息'
            }
            return labelMap[key] || key
        },
        // 格式化字段值
        formatFieldValue(key, value) {
            if (value === null || value === undefined) return '-'
            // 处理合作方式
            if (key === 'collaborationMode') {
                const modeMap = {
                    '0': '预付',
                    '1': '垫付',
                    '2': '服务费',
                    0: '预付',
                    1: '垫付',
                    2: '服务费'
                }
                return modeMap[value] || value
            }
            // 处理账期
            if (key === 'repayDay') {
                return value != null ? `${value} 天` : '-'
            }
            // 处理授信额度
            if (key === 'creditLimit') {
                return value != null ? `${value} 元` : '-'
            }
            // 处理日期时间
            if (key === 'signDate' || key === 'endDate') {
                return value || '-'
            }
            // 处理数组（如项目ID数组）
            if (Array.isArray(value)) {
                if (key === 'proIdArray' && this.projectMap) {
                    return value.map(id => this.projectMap[id] || id).join(', ')
                }
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
.contract-approval-detail {
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

    .contract-section {
        .form-section-title {
            color: #1890ff;
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
