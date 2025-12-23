<template>
    <a-drawer title="审批详情" :width="800" :visible="visible" @close="handleClose" :bodyStyle="{ padding: '24px' }">

        <a-spin :spinning="loading">
            <div v-if="approvalDetail" class="detail-content">
                <!-- 基本信息 -->
                <div class="info-section">
                    <h3 class="section-title">基本信息</h3>
                    <a-descriptions :column="2" bordered>
                        <a-descriptions-item label="审批标题">
                            {{ approvalDetail.title || '-' }}
                        </a-descriptions-item>
                        <a-descriptions-item label="业务类型">
                            {{ businessTypeName }}
                        </a-descriptions-item>
                        <a-descriptions-item label="审批状态">
                            <a-tag :color="getStatusColor(approvalDetail.status)">
                                {{ getStatusText(approvalDetail.status) }}
                            </a-tag>
                        </a-descriptions-item>
                        <a-descriptions-item label="创建时间">
                            {{ approvalDetail.createTime || '-' }}
                        </a-descriptions-item>
                    </a-descriptions>
                </div>

                <!-- 业务表单详情 -->
                <div class="info-section" v-if="businessFormData">
                    <h3 class="section-title">表单内容</h3>
                    <div class="form-content">
                        <!-- 根据业务类型动态加载不同的详情组件 -->
                        <contract-approval-detail v-if="isContractApproval" :business-form-data="businessFormData"
                            :file-list="fileList" />
                        <project-temp-credit-approval-detail v-if="isProjectTempCreditApproval"
                            :business-form-data="businessFormData" :file-list="fileList" />
                        <project-refund-approval-detail v-else-if="isProjectRefundApproval"
                            :business-form-data="businessFormData" :file-list="fileList" />
                        <div v-else class="form-section">
                            <a-alert message="暂不支持的业务类型" type="warning" />
                        </div>
                    </div>
                </div>

                <!-- 审批流程 -->
                <div class="info-section"
                    v-if="(parsedNodes && parsedNodes.length > 0) || (processNodes && processNodes.length > 0) || (nodePersonConfigs && nodePersonConfigs.length > 0)">
                    <h3 class="section-title">审批流程</h3>
                    <!-- 优先显示解析后的流程节点 -->
                    <div class="process-flow" v-if="parsedNodes && parsedNodes.length > 0">
                        <div v-for="(node, index) in parsedNodes" :key="node.node_id || index" class="process-node">
                            <div class="node-content" :class="{ 'current-node': node.isCurrent }">
                                <div class="node-icon">
                                    <a-icon v-if="node.node_key === 'start'" type="play-circle" />
                                    <a-icon v-else-if="node.node_key === 'end'" type="check-circle" />
                                    <a-icon v-else-if="node.node_key === 'cc'" type="file-text" />
                                    <a-icon v-else type="user" />
                                </div>
                                <div class="node-info">
                                    <div class="node-name">
                                        {{ (node.node_name == '结束' ? '审批完成' : node.node_name) || '-' }}
                                        <a-tag v-if="node.isCurrent" color="blue" style="margin-left: 8px;">当前</a-tag>
                                    </div>
                                    <div class="node-users" v-if="node.user_ids">
                                        {{ getUserNames(node.user_ids) }}
                                    </div>
                                </div>
                            </div>
                            <div v-if="index < parsedNodes.length - 1" class="node-arrow">
                                <a-icon type="arrow-right" />
                            </div>
                        </div>
                    </div>
                    <!-- 如果没有解析后的节点，显示节点人员配置数据 -->
                    <div class="process-flow" v-else-if="nodePersonConfigs && nodePersonConfigs.length > 0">
                        <div v-for="(config, index) in nodePersonConfigs" :key="config.id || index"
                            class="process-node">
                            <div class="node-content" :class="{ 'current-node': isCurrentNode(config.nodeId) }">
                                <div class="node-icon">
                                    <a-icon type="user" />
                                </div>
                                <div class="node-info">
                                    <div class="node-name">
                                        {{ config.nodeName || '-' }}
                                        <a-tag v-if="isCurrentNode(config.nodeId)" color="blue"
                                            style="margin-left: 8px;">当前</a-tag>
                                    </div>
                                    <div class="node-users" v-if="config.assigneeName">
                                        {{ config.assigneeName }}
                                    </div>
                                    <div class="node-status" v-if="config.status">
                                        <a-tag :color="getNodeStatusColor(config.status)">
                                            {{ getNodeStatusText(config.status) }}
                                        </a-tag>
                                    </div>
                                </div>
                            </div>
                            <div v-if="index < nodePersonConfigs.length - 1" class="node-arrow">
                                <a-icon type="arrow-right" />
                            </div>
                        </div>
                    </div>
                    <!-- 如果没有节点人员配置，显示原有的流程节点 -->
                    <div class="process-flow" v-else-if="processNodes && processNodes.length > 0">
                        <div v-for="(node, index) in processNodes" :key="index" class="process-node">
                            <div class="node-content"
                                :class="{ 'active': node.isActive, 'completed': node.isCompleted }">
                                <div class="node-icon">
                                    <a-icon v-if="node.node_key === 'start'" type="play-circle" />
                                    <a-icon v-else-if="node.node_key === 'end'" type="check-circle" />
                                    <a-icon v-else-if="node.node_key === 'cc'" type="file-text" />
                                    <a-icon v-else type="user" />
                                </div>
                                <div class="node-info">
                                    <div class="node-name">{{ node.node_name || '-' }}</div>
                                    <div class="node-users" v-if="node.user_ids">
                                        {{ getAssigneeNames(node) }}
                                    </div>
                                </div>
                            </div>
                            <div v-if="index < processNodes.length - 1" class="node-arrow">
                                <a-icon type="arrow-right" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 审批意见 -->
                <div class="info-section" v-if="approvalDetail.opinion">
                    <h3 class="section-title">审批意见</h3>
                    <div class="opinion-content">
                        {{ approvalDetail.opinion }}
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div class="action-section" v-if="canOperate">
                    <a-divider />
                    <!-- 审批意见输入框 -->
                    <div class="opinion-input-wrapper" v-if="canApprove">
                        <div class="opinion-label">修改建议</div>
                        <a-textarea v-model="opinionText" placeholder="请输入审批意见（选填）" :rows="3" :maxLength="500"
                            show-count />
                    </div>
                    <div class="action-buttons">
                        <a-button v-if="canApprove" type="primary" icon="check" @click="handleApprove"
                            :loading="approveLoading">
                            审批通过
                        </a-button>
                        <a-button v-if="canApprove" type="danger" icon="close" @click="handleRefuse"
                            :loading="refuseLoading">
                            审批拒绝
                        </a-button>
                        <a-button v-if="canWithdraw" icon="rollback" @click="handleWithdraw" :loading="withdrawLoading">
                            撤销审批
                        </a-button>
                    </div>
                </div>
            </div>

            <a-empty v-else-if="!loading" description="暂无数据" />
        </a-spin>

    </a-drawer>
</template>

<script>
import { getApprovalDetail, approvalAgree, approvalRefuse, withdrawApproval, getContractInfoById, getApprovalNodePersonConfigByApprovalId } from '@/api/api'
import { mapGetters } from 'vuex'
import { getAction } from '@/api/manage'
import ContractApprovalDetail from './ContractApprovalDetail.vue'
import ProjectRefundApprovalDetail from './ProjectRefundApprovalDetail.vue'
import ProjectTempCreditApprovalDetail from './ProjectTempCreditApprovalDetail.vue'

export default {
    name: 'ApprovalDetail',
    components: {
        ContractApprovalDetail,
        ProjectTempCreditApprovalDetail,
        ProjectRefundApprovalDetail
    },
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        approvalId: {
            type: String,
            default: null
        },
        listItemId: {
            type: String,
            default: null
        }
    },
    data() {
        return {
            loading: false,
            approvalDetail: null,
            processNodes: [],
            nodePersonConfigs: [], // 审批节点人员配置数据
            parsedNodes: [], // 解析后的流程节点数据
            userMap: {}, // 用户ID到用户名的映射
            businessFormData: null, // 业务表单数据
            fileList: [], // 附件列表
            formLoading: false, // 表单加载状态
            projectMap: {}, // 项目名称映射
            approveLoading: false,
            refuseLoading: false,
            withdrawLoading: false,
            opinionText: '',
            loadingDetailFlag: false // 防止重复加载的标志位
        }
    },
    computed: {
        ...mapGetters(['userInfo']),
        // 是否可以操作（待审批状态且当前用户是审批人）
        canOperate() {
            if (!this.approvalDetail) return false
            // 状态：1待审批 2已通过 3已驳回 4已撤回 5审批中
            return this.approvalDetail.status === '1' || this.approvalDetail.status === '5'
        },
        // 是否可以审批通过/拒绝
        canApprove() {
            if (!this.canOperate) return false
            // 检查当前用户是否在待审批人列表中
            if (this.approvalDetail.currentUsers) {
                const currentUserId = (this.userInfo && this.userInfo.id) || (this.userInfo && this.userInfo.username)
                // currentUsers可能是字符串（逗号分隔）或数组
                if (typeof this.approvalDetail.currentUsers === 'string') {
                    return this.approvalDetail.currentUsers.split(',').includes(currentUserId)
                } else if (Array.isArray(this.approvalDetail.currentUsers)) {
                    return this.approvalDetail.currentUsers.includes(currentUserId)
                }
            }
            return false
        },
        // 是否可以撤销（我发起的且未完成）
        canWithdraw() {
            if (!this.approvalDetail) return false
            const currentUserId = (this.userInfo && this.userInfo.id) || (this.userInfo && this.userInfo.username)
            const isMyApproval = this.approvalDetail.createBy === currentUserId
            const canWithdrawStatus = ['1', '5'].includes(this.approvalDetail.status)
            return isMyApproval && canWithdrawStatus
        },
        // 是否是合同审批
        isContractApproval() {
            return this.approvalDetail && this.approvalDetail.businessType === 'contranct'
        },
        // 是否是项目退款审批
        isProjectRefundApproval() {
            return this.approvalDetail && this.approvalDetail.businessType === 'projectRefund'
        },
        // 是否是临时授信审批
        isProjectTempCreditApproval() {
            return this.approvalDetail && this.approvalDetail.businessType === 'projectTempCredit'
        },
        // 业务类型名称（计算属性）
        businessTypeName() {
            if (!this.approvalDetail || !this.approvalDetail.businessType) return '-'
            const businessType = this.approvalDetail.businessType
            const typeMap = {
                '1': '合同',
                'contranct': '合同',
                'contract': '合同',
                'projectRefund': '项目退款',
                'projectTempCredit': '临时授信',
                'legal': '法务流程',
                'hr': '人事流程',
                'admin': '行政流程',
                'business': '业务流程',
                'other': '其他流程'
            }
            return typeMap[businessType] || businessType
        }
    },
    watch: {
        visible(newVal) {
            console.log('visible watch 触发，newVal:', newVal, 'approvalId:', this.approvalId)
            if (newVal && this.approvalId) {
                console.log('visible 为 true 且有 approvalId，准备调用 loadDetail')
                // 使用 nextTick 确保只触发一次
                this.$nextTick(() => {
                    if (!this.loadingDetailFlag) {
                        console.log('nextTick 中调用 loadDetail')
                        this.loadDetail()
                    } else {
                        console.log('loadingDetailFlag 为 true，跳过 loadDetail')
                    }
                })
            } else if (!newVal) {
                console.log('visible 为 false，重置状态')
                // 关闭时重置所有状态
                this.loadingDetailFlag = false
                this.loading = false
                this.approvalDetail = null
                this.businessFormData = null
                this.fileList = []
            } else {
                console.log('visible 或 approvalId 条件不满足，跳过 loadDetail')
            }
        },
        approvalId(newVal) {
            console.log('approvalId watch 触发，newVal:', newVal, 'visible:', this.visible)
            if (newVal && this.visible && !this.loadingDetailFlag) {
                console.log('approvalId 有值且 visible 为 true，准备调用 loadDetail')
                // 使用 nextTick 确保只触发一次
                this.$nextTick(() => {
                    if (!this.loadingDetailFlag) {
                        console.log('nextTick 中调用 loadDetail')
                        this.loadDetail()
                    } else {
                        console.log('loadingDetailFlag 为 true，跳过 loadDetail')
                    }
                })
            } else {
                console.log('approvalId watch 条件不满足，跳过 loadDetail')
            }
        }
    },
    methods: {
        async loadDetail() {
            console.log('========== loadDetail 开始执行 ==========')
            const id = this.approvalId
            console.log('approvalId:', id)
            if (!id) {
                console.error('缺少审批ID')
                this.$message.error('缺少审批ID')
                return
            }

            // 防止重复请求
            if (this.loadingDetailFlag) {
                console.log('loadingDetailFlag 为 true，跳过重复请求')
                return
            }
            this.loadingDetailFlag = true

            this.loading = true
            try {
                console.log('准备调用 getApprovalDetail，id:', id)
                const res = await getApprovalDetail({ id })
                console.log('getApprovalDetail 返回:', res)
                if (res && res.success) {
                    this.approvalDetail = res.result
                    // 解析流程节点
                    if (res.result.nodes) {
                        try {
                            this.processNodes = JSON.parse(res.result.nodes)
                        } catch (e) {
                            console.error('解析流程节点失败:', e)
                            this.processNodes = []
                        }
                    }
                    // 加载业务表单数据
                    console.log('审批详情返回:', res.result)
                    console.log('businessType:', res.result.businessType, 'businessId:', res.result.businessId)
                    if (res.result.businessType && res.result.businessId) {
                        console.log('准备加载业务表单数据，businessType:', res.result.businessType, 'businessId:', res.result.businessId)
                        await this.loadBusinessFormData(res.result.businessType, res.result.businessId)
                    } else {
                        console.warn('businessType 或 businessId 为空，跳过加载业务表单数据')
                    }
                    // 加载审批节点人员配置
                    await this.loadNodePersonConfigs(id)
                } else {
                    this.$message.error(res.message || '获取审批详情失败')
                }
            } catch (error) {
                console.error('获取审批详情失败:', error)
                this.$message.error('获取审批详情失败')
                // 确保在错误时也重置状态
                this.loading = false
                this.loadingDetailFlag = false
            } finally {
                this.loading = false
                this.loadingDetailFlag = false
            }
        },
        getStatusColor(status) {
            const statusMap = {
                '1': 'blue',      // 待审批
                '2': 'green',     // 已通过
                '3': 'red',       // 已驳回
                '4': 'orange',    // 已撤回
                '5': 'cyan'       // 审批中
            }
            return statusMap[status] || 'default'
        },
        getStatusText(status) {
            const statusMap = {
                '1': '待审批',
                '2': '已通过',
                '3': '已驳回',
                '4': '已撤回',
                '5': '审批中'
            }
            return statusMap[status] || '未知'
        },
        // 判断是否为当前节点
        isCurrentNode(nodeId) {
            if (!nodeId || !this.approvalDetail || !this.approvalDetail.nodeId) return false
            return String(nodeId) === String(this.approvalDetail.nodeId)
        },
        getAssigneeNames(node) {
            if (!node.user_ids) return '-'
            // 这里可以根据需要解析用户ID并显示用户名
            return node.user_ids
        },
        // 加载业务表单数据
        async loadBusinessFormData(businessType, businessId) {
            console.log('loadBusinessFormData 被调用，businessType:', businessType, 'businessId:', businessId)
            if (!businessId) {
                console.warn('loadBusinessFormData: businessId为空，返回')
                return
            }

            this.formLoading = true
            try {
                let res = null
                // 根据业务类型调用不同的接口
                if (businessType === 'contranct' || businessType === 'contract' || businessType === '1') {
                    // 合同详情
                    console.log('调用合同详情接口，businessId:', businessId)
                    res = await getContractInfoById({ id: businessId })
                } else if (businessType === 'projectRefund') {
                    // 项目退款详情
                    console.log('调用项目退款详情接口，businessId:', businessId)
                    res = await getAction('/projectRefundRecord/queryById', { id: businessId })
                } else if (businessType === 'projectTempCredit') {
                    // 临时授信详情
                    console.log('调用临时授信详情接口，businessId:', businessId)
                    res = await getAction('/projectTempCredit/queryById', { id: businessId })
                } else {
                    // 其他业务类型可以在这里扩展
                    console.log('暂不支持的业务类型:', businessType)
                    return
                }

                console.log('业务表单接口返回:', res)
                if (res && res.success && res.result) {
                    this.businessFormData = res.result
                    // 调试：输出业务表单数据，检查新字段
                    console.log('业务表单数据:', res.result)
                    console.log('合作方式:', res.result.collaborationMode)
                    console.log('账期:', res.result.repayDay)
                    console.log('授信额度:', res.result.creditLimit)
                    // 如果是合同，需要处理项目ID数组
                    if (businessType === 'contranct' && res.result.proId) {
                        await this.loadProjectNames(res.result.proId)
                    }
                    // 加载附件列表
                    console.log('准备调用 loadFileList，businessId:', businessId)
                    await this.loadFileList(businessId)
                } else {
                    console.warn('获取业务表单数据失败:', res && res.message)
                    console.warn('res:', res)
                }
            } catch (error) {
                console.error('获取业务表单数据失败:', error)
            } finally {
                this.formLoading = false
            }
        },
        // 加载项目名称
        async loadProjectNames(proId) {
            if (!proId) return
            // 如果proId是字符串，转换为数组
            const proIdArray = typeof proId === 'string' ? proId.split(',').filter(id => id) : (Array.isArray(proId) ? proId : [])
            if (proIdArray.length === 0) return

            try {
                // 这里需要调用项目列表接口，根据ID获取项目名称
                // 暂时先不实现，如果需要可以添加
                // const res = await getProjectList({ ids: proIdArray.join(',') })
            } catch (error) {
                console.error('加载项目名称失败:', error)
            }
        },
        // 加载附件列表
        async loadFileList(bizId) {
            if (!bizId) {
                console.log('loadFileList: bizId为空，跳过查询')
                return
            }

            try {
                console.log('开始查询附件，bizId:', bizId)
                const res = await getAction('/fileInfo/listNotPage', { bizId })
                console.log('附件接口返回:', res)

                // 参考合同页面的实现方式
                if (res && res.success) {
                    this.fileList = res.result || []
                    console.log('附件列表已设置:', this.fileList, '数量:', this.fileList.length)
                } else {
                    console.warn('获取附件列表失败:', res && res.message)
                    this.fileList = []
                }
            } catch (error) {
                console.error('获取附件列表失败:', error)
                this.$message.error('获取附件列表失败: ' + (error.message || '未知错误'))
                this.fileList = []
            }
        },
        // 加载审批节点人员配置
        async loadNodePersonConfigs(approvalId) {
            if (!approvalId) return

            try {
                const res = await getApprovalNodePersonConfigByApprovalId({ approvalId })
                if (res && res.success) {
                    this.nodePersonConfigs = Array.isArray(res.result) ? res.result : (res.result && res.result.records ? res.result.records : [])
                    console.log('审批节点人员配置:', this.nodePersonConfigs)

                    // 解析 nodes 字段（JSON 字符串）
                    // 注意：nodes 可能在 res.result 中，也可能在 res.result 的某个对象中
                    let nodesData = null
                    if (res.result && res.result.nodes) {
                        nodesData = res.result.nodes
                    } else if (Array.isArray(res.result) && res.result.length > 0 && res.result[0].nodes) {
                        nodesData = res.result[0].nodes
                    }

                    if (nodesData) {
                        try {
                            const nodes = typeof nodesData === 'string' ? JSON.parse(nodesData) : nodesData
                            // 根据当前节点ID标记当前节点
                            const currentNodeId = this.approvalDetail && this.approvalDetail.nodeId ? String(this.approvalDetail.nodeId) : null
                            this.parsedNodes = Array.isArray(nodes) ? nodes.map(node => ({
                                ...node,
                                isCurrent: currentNodeId && String(node.node_id) === currentNodeId
                            })) : []
                            console.log('解析后的流程节点:', this.parsedNodes)
                            console.log('当前节点ID:', currentNodeId)

                            // 加载用户信息
                            await this.loadUserNames()
                        } catch (e) {
                            console.error('解析流程节点失败:', e)
                            console.error('nodes 数据:', nodesData)
                            this.parsedNodes = []
                        }
                    } else {
                        console.warn('未找到 nodes 字段，res.result:', res.result)
                        this.parsedNodes = []
                    }
                } else {
                    console.warn('获取审批节点人员配置失败:', res && res.message)
                    this.nodePersonConfigs = []
                    this.parsedNodes = []
                }
            } catch (error) {
                console.error('获取审批节点人员配置失败:', error)
                this.nodePersonConfigs = []
                this.parsedNodes = []
            }
        },
        // 加载用户信息
        async loadUserNames() {
            // 收集所有需要查询的用户ID
            const userIds = new Set()
            if (this.parsedNodes && this.parsedNodes.length > 0) {
                this.parsedNodes.forEach(node => {
                    if (node.user_ids) {
                        const ids = typeof node.user_ids === 'string' ? node.user_ids.split(',') : [node.user_ids]
                        ids.forEach(id => {
                            if (id && id.trim()) {
                                userIds.add(id.trim())
                            }
                        })
                    }
                })
            }

            if (userIds.size === 0) return

            try {
                // 使用 getMultiUser 接口获取用户信息
                const userIdsStr = Array.from(userIds).join(',') + ','
                const res = await getAction('/sys/user/getMultiUser', { id: userIdsStr })
                if (res && Array.isArray(res)) {
                    res.forEach(user => {
                        if (user.id) {
                            this.$set(this.userMap, user.id, user.realname || user.username || user.id)
                        }
                    })
                    console.log('用户映射:', this.userMap)
                }
            } catch (error) {
                console.error('加载用户信息失败:', error)
            }
        },
        // 根据用户ID获取用户名
        getUserNames(userIds) {
            if (!userIds) return '-'
            const ids = typeof userIds === 'string' ? userIds.split(',').map(id => id.trim()) : [userIds]
            const names = ids.map(id => {
                return this.userMap[id] || id
            }).filter(name => name)
            return names.length > 0 ? names.join('、') : '-'
        },
        // 判断是否为甲方字段
        isPartyAField(key) {
            const partyAFields = ['partyAName', 'partyATaxNo', 'partyABank', 'partyAAccount', 'partyAAddress', 'partyAPhone', 'cardId']
            return partyAFields.includes(key)
        },
        // 判断是否为乙方字段
        isPartyBField(key) {
            const partyBFields = ['accountName', 'accountNo', 'proName', 'contractNo']
            return partyBFields.includes(key)
        },
        // 获取业务类型名称
        getBusinessTypeName(businessType) {
            if (!businessType) return '-'
            const typeMap = {
                '1': '合同',
                'contranct': '合同',
                'contract': '合同',
                'projectRefund': '项目退款',
                'projectTempCredit': '临时授信',
                'legal': '法务流程',
                'hr': '人事流程',
                'admin': '行政流程',
                'business': '业务流程',
                'other': '其他流程'
            }
            return typeMap[businessType] || businessType
        },
        // 判断是否有其他字段
        hasOtherFields() {
            if (!this.businessFormData) return false
            for (const [key, value] of Object.entries(this.businessFormData)) {
                if (this.shouldDisplayField(key, value) && !this.isPartyAField(key) && !this.isPartyBField(key)) {
                    return true
                }
            }
            return false
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
                'remark': '邮寄信息',
                'remarks': '备注',
                'files': '附件',
                // 项目退款字段
                'refundAmount': '退款金额',
                'fundsNature': '资金性质',
                'dateMonth': '退款月份',
                'refundTime': '退款时间',
                'customerTitleId': '客户抬头ID',
                'customerTitle': '客户抬头',
                'ourTitleId': '我方抬头ID',
                'ourTitle': '我方抬头',
                'state': '状态',
                'rejectReason': '驳回原因',
                'bankAccountId': '抬头管理ID',
                'bankAccountConfigId': '我方抬头ID',
                'businessId': '业务表ID'
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
            // 处理账期
            if (key === 'repayDay') {
                return value != null ? `${value} 天` : '-'
            }
            // 处理授信额度
            if (key === 'creditLimit') {
                return value != null ? `${value} 元` : '-'
            }
            // 处理日期时间
            if (key === 'refundTime' || key === 'signDate' || key === 'endDate') {
                return value || '-'
            }

            // 默认返回原值
            return value
            // 处理数组（如项目ID数组）
            if (Array.isArray(value)) {
                if (key === 'proIdArray' && this.projectMap) {
                    return value.map(id => this.projectMap[id] || id).join(', ')
                }
                return value.join(', ')
            }
            // 处理文件列表
            if (key === 'files' && Array.isArray(value)) {
                return value.map(file => file.name || file).join(', ')
            }
            return value
        },
        handleClose() {
            // 重置所有状态
            this.loading = false
            this.loadingDetailFlag = false
            this.approvalDetail = null
            this.businessFormData = null
            this.fileList = []
            this.opinionText = ''
            this.$emit('close')
        },
        handleApprove() {
            this.submitApprove()
        },
        handleRefuse() {
            this.submitRefuse()
        },
        handleWithdraw() {
            this.$confirm({
                title: '确认撤销',
                content: '确定要撤销此审批吗？',
                onOk: async () => {
                    await this.submitWithdraw()
                }
            })
        },
        async submitApprove() {
            // 使用列表项的id（从props传入的listItemId）
            const recordId = this.listItemId
            if (!recordId) {
                this.$message.error('缺少审批记录ID')
                return
            }

            this.approveLoading = true
            try {
                // 使用 FormData 传参，key 还是 approvalTaskId，但值从列表项的id取
                const formData = new FormData()
                formData.append('approvalTaskId', recordId)
                formData.append('opinion', this.opinionText || '')

                const res = await approvalAgree(formData)
                if (res && res.success) {
                    this.$message.success('审批通过成功')
                    this.opinionText = '' // 清空意见
                    await this.loadDetail()
                    this.$emit('refresh')
                } else {
                    this.$message.error(res.message || '审批通过失败')
                }
            } catch (error) {
                console.error('审批通过失败:', error)
                this.$message.error('审批通过失败')
            } finally {
                this.approveLoading = false
            }
        },
        async submitRefuse() {
            // 使用列表项的id（从props传入的listItemId）
            const recordId = this.listItemId
            if (!recordId) {
                this.$message.error('缺少审批记录ID')
                return
            }

            this.refuseLoading = true
            try {
                // 使用 FormData 传参，key 还是 approvalTaskId，但值从列表项的id取
                const formData = new FormData()
                formData.append('approvalTaskId', recordId)
                formData.append('opinion', this.opinionText || '')

                const res = await approvalRefuse(formData)
                if (res && res.success) {
                    this.$message.success('审批拒绝成功')
                    this.opinionText = '' // 清空意见
                    await this.loadDetail()
                    this.$emit('refresh')
                } else {
                    this.$message.error(res.message || '审批拒绝失败')
                }
            } catch (error) {
                console.error('审批拒绝失败:', error)
                this.$message.error('审批拒绝失败')
            } finally {
                this.refuseLoading = false
            }
        },
        async submitWithdraw() {
            if (!this.approvalDetail.businessId || !this.approvalDetail.businessType) {
                this.$message.error('缺少业务信息')
                return
            }

            this.withdrawLoading = true
            try {
                // 使用 FormData 传参
                const formData = new FormData()
                formData.append('businessId', this.approvalDetail.businessId)
                formData.append('businessType', this.approvalDetail.businessType)

                const res = await withdrawApproval(formData)
                if (res && res.success) {
                    this.$message.success('撤销审批成功')
                    this.opinionText = '' // 清空意见
                    await this.loadDetail()
                    this.$emit('refresh')
                } else {
                    this.$message.error(res.message || '撤销审批失败')
                }
            } catch (error) {
                console.error('撤销审批失败:', error)
                this.$message.error('撤销审批失败')
            } finally {
                this.withdrawLoading = false
            }
        }
    }
}
</script>

<style lang="less" scoped>
.detail-content {
    .info-section {
        margin-bottom: 32px;

        .section-title {
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 16px;
            color: #262626;
        }

        .opinion-content {
            padding: 16px;
            background-color: #fafafa;
            border-radius: 4px;
            border: 1px solid #e8e8e8;
            color: #595959;
            line-height: 1.6;
        }
    }

    .form-content {
        margin-top: 16px;
    }

    .form-section {
        margin-bottom: 24px;

        &:last-child {
            margin-bottom: 0;
        }

        .form-section-title {
            font-size: 16px;
            font-weight: 500;
            color: #262626;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e8e8e8;
        }

        &.party-a-section .form-section-title {
            color: #1890ff;
        }

        &.party-b-section .form-section-title {
            color: #52c41a;
        }

        &.other-section .form-section-title {
            color: #8c8c8c;
        }
    }

    .process-flow {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;
        padding: 24px;
        background-color: #fafafa;
        border-radius: 4px;
        border: 1px solid #e8e8e8;

        .process-node {
            display: flex;
            align-items: center;
            gap: 8px;

            .node-content {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 20px;
                background-color: #fff;
                border-radius: 8px;
                border: 1px solid #e8e8e8;
                transition: all 0.3s;

                &.active {
                    border-color: #1890ff;
                    background-color: #e6f7ff;
                }

                &.current-node {
                    border-color: #1890ff;
                    background-color: #e6f7ff;
                    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
                }

                &.completed {
                    border-color: #52c41a;
                    background-color: #f6ffed;
                }

                .node-icon {
                    font-size: 20px;
                    color: #1890ff;
                }

                .node-info {
                    .node-name {
                        font-size: 14px;
                        font-weight: 500;
                        color: #262626;
                        margin-bottom: 4px;
                    }

                    .node-users {
                        font-size: 12px;
                        color: #8c8c8c;
                    }
                }
            }

            .node-arrow {
                color: #d9d9d9;
                font-size: 16px;
            }
        }
    }

    .action-section {
        margin-top: 32px;

        .opinion-input-wrapper {
            margin-bottom: 16px;

            .opinion-label {
                font-size: 12px;
                color: #8c8c8c;
                margin-bottom: 8px;
            }
        }

        .action-buttons {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
        }
    }
}
</style>
