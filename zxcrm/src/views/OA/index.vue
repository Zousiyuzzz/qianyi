<template>
    <div class="oa-container">
        <div class="oa-content-wrapper">
            <!-- 用大卡片包裹所有内容 -->
            <a-card class="main-content-card" :bordered="false">
                <div class="card-inner-wrapper">
                    <!-- 左侧边栏 -->
                    <div class="oa-sidebar">
                        <div class="sidebar-item" :class="{ active: activeSidebar === 'myoa' }"
                            @click="activeSidebar = 'myoa'">
                            <a-icon type="home" />
                            <span>审批中心</span>
                        </div>
                        <div class="sidebar-item" :class="{ active: activeSidebar === 'process-config' }"
                            @click="activeSidebar = 'process-config'">
                            <a-icon type="setting" />
                            <span>流程配置</span>
                        </div>
                    </div>
                    <!-- 主内容区 -->
                    <div class="oa-main-content">
                        <!-- 流程配置页面 -->
                        <ApprovalProcessConfig v-if="activeSidebar === 'process-config'" />

                        <!-- 审批中心页面 -->
                        <template v-else>
                            <div class="approval-center-layout">
                                <!-- 左侧主要内容区 -->
                                <div class="main-content-area">
                                    <!-- 用户信息和审批概览 -->
                                    <div class="user-info-section">
                                        <div class="user-info-wrapper">
                                            <div class="user-card">
                                                <div class="user-avatar">
                                                    {{ userInfo.realname ?
                                                        userInfo.realname.substring(userInfo.realname.length - 2) : '用户' }}
                                                </div>
                                                <div class="user-details">
                                                    <div class="user-name">{{ userInfo.realname || '用户' }}</div>
                                                    <div class="user-role">成员</div>
                                                </div>
                                            </div>

                                            <div class="approval-cards">
                                                <div class="approval-card" @click="handleCardClick('pending')">
                                                    <div class="approval-icon-wrapper">
                                                        <a-icon type="clock-circle"
                                                            style="font-size: 32px; color: #1890ff;" />
                                                    </div>
                                                    <div class="approval-number">{{ pendingCount }}</div>
                                                    <div class="approval-label">待处理</div>
                                                </div>
                                                <div class="approval-card" @click="handleCardClick('processed')">
                                                    <div class="approval-icon-wrapper">
                                                        <a-icon type="check-circle"
                                                            style="font-size: 32px; color: #1890ff;" />
                                                    </div>
                                                    <div class="approval-number">{{ processedCount }}</div>
                                                    <div class="approval-label">已处理</div>
                                                </div>
                                                <div class="approval-card" @click="handleCardClick('initiated')">
                                                    <div class="approval-icon-wrapper">
                                                        <a-icon type="vertical-align-top"
                                                            style="font-size: 32px; color: #1890ff;" />
                                                    </div>
                                                    <div class="approval-number">{{ initiatedCount }}</div>
                                                    <div class="approval-label">我发起</div>
                                                </div>
                                                <div class="approval-card" @click="handleCardClick('copied')">
                                                    <div class="approval-icon-wrapper">
                                                        <a-icon type="file-text"
                                                            style="font-size: 32px; color: #1890ff;" />
                                                    </div>
                                                    <div class="approval-number">{{ copiedCount }}</div>
                                                    <div class="approval-label">抄送我</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- 审批列表 -->
                                    <a-card class="section-card approval-list-section" :bordered="false">
                                        <div class="approval-list-wrapper" ref="approvalListWrapper"
                                            @scroll="handleScroll">
                                            <div v-if="approvalList.length === 0 && !listLoading" class="empty-list">
                                                <a-empty description="暂无数据" />
                                            </div>
                                            <div v-else class="approval-list-container">
                                                <div v-for="(item, index) in approvalList"
                                                    :key="`${activeApprovalCard}-${item.id || index}`"
                                                    class="approval-list-item" @click="handleViewDetail(item)">
                                                    <div class="item-business-type">{{
                                                        getBusinessTypeName(item.businessType) }}</div>
                                                    <div class="item-info">
                                                        <span class="info-label">当前节点：</span>
                                                        <span class="info-value">{{ item.currentNode || item.nodeName ||
                                                            item.assigneeName
                                                            || '-' }}</span>
                                                    </div>
                                                    <div class="item-info">
                                                        <span class="info-label">创建时间：</span>
                                                        <span class="info-value">{{ item.createTime || '-' }}</span>
                                                    </div>
                                                    <div class="item-status">
                                                        <a-tag :color="getStatusColor(item.status)">
                                                            {{ getStatusText(item.status) }}
                                                        </a-tag>
                                                    </div>
                                                </div>
                                            </div>
                                            <div v-if="listLoading && approvalList.length > 0" class="loading-more">
                                                <a-spin size="small" />
                                                <span style="margin-left: 8px;">加载中...</span>
                                            </div>
                                            <div v-if="!hasMore && approvalList.length > 0" class="no-more">
                                                没有更多数据了
                                            </div>
                                            <div v-if="listLoading && approvalList.length === 0"
                                                class="initial-loading">
                                                <a-spin size="large" tip="加载中..." />
                                            </div>
                                        </div>
                                    </a-card>

                                    <!-- 全部审批单 -->
                                    <a-card class="section-card approval-forms-section" :bordered="false">
                                        <div class="approval-forms-header">
                                            <h2 class="approval-forms-title">全部审批单</h2>
                                            <!-- <a-input-search v-model="searchKeyword" placeholder="搜索审批单"
                                                style="width: 300px" @search="handleSearch" allowClear>
                                                <a-icon slot="prefix" type="search" />
                                            </a-input-search> -->
                                        </div>
                                        <!-- <div class="approval-category-tabs">
                                            <div v-for="(category, index) in approvalCategories" :key="index"
                                                class="category-tab"
                                                :class="{ active: activeCategory === category.key }"
                                                @click="activeCategory = category.key">
                                                {{ category.name }}
                                            </div>
                                        </div> -->
                                        <div class="approval-category-content">
                                            <div v-for="(category, index) in filteredCategories" :key="index"
                                                class="category-group">
                                                <!-- <div class="category-header">
                                                    <span class="category-name">{{ category.name }}</span>
                                                    <span class="category-count">{{ category.count }}</span>
                                                </div> -->
                                                <div class="approval-forms-grid">
                                                    <div v-for="(form, formIndex) in category.forms" :key="formIndex"
                                                        class="approval-form-item" @click="handleAddApproval(form)">
                                                        <div class="form-icon"
                                                            :style="{ backgroundColor: form.iconBg }">
                                                            <a-icon :type="form.icon"
                                                                style="font-size: 24px; color: #fff;" />
                                                        </div>
                                                        <div class="form-name">{{ form.name }}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </a-card>
                                </div>

                            </div>
                        </template>
                    </div>
                </div>
            </a-card>
        </div>
        <!-- 审批抽屉：统一处理新增、预览、详情 -->
        <approval-drawer :visible="drawerVisible" :mode="drawerMode" :business-type="currentBusinessType"
            :approval-id="currentApprovalId" :list-item-id="currentListItemId" :process-config="processConfig"
            :parsed-nodes="parsedNodes" :user-map="userMap" :dept-map="deptMap" :role-map="roleMap"
            :current-node-id="currentNodeId" :form-data="formData" :file-list="fileList" :node-person-configs="nodePersonConfigs"
            :process-nodes="processNodes" :approval-detail="approvalDetail" :loading="drawerLoading"
            :submit-loading="submitLoading" @close="handleDrawerClose" @preview="handlePreview"
            @preview-confirm="handlePreviewConfirm" @preview-cancel="handlePreviewCancel"
            @detail-refresh="handleDetailRefresh">
        </approval-drawer>
    </div>
</template>

<script>
import ApprovalProcessConfig from './ApprovalProcessConfig.vue'
import ApprovalDrawer from './flow/ApprovalDrawer.vue'
import { mapGetters } from 'vuex'
import { getApprovalList, queryMyPendingProcesses, queryMyProcessedProcesses, queryMyApproval, queryProcessesCcToMe } from '@/api/api'

export default {
    name: 'OAIndex',
    components: {
        ApprovalProcessConfig,
        ApprovalDrawer
    },
    data() {
        return {
            activeSidebar: 'myoa',
            activeApprovalCard: 'initiated', // 默认显示"我发起的"
            pendingCount: 0,
            processedCount: 0,
            initiatedCount: 0,
            copiedCount: 0,
            // 审批列表相关
            approvalList: [],
            listLoading: false,
            hasMore: true,
            pageNo: 1,
            pageSize: 10,
            queryParams: {},
            // 审批抽屉相关
            drawerVisible: false,
            drawerMode: 'add', // 'add' | 'preview' | 'detail'
            currentBusinessType: '',
            currentApprovalId: null,
            currentListItemId: null, // 列表项的id，用于审批操作
            // 抽屉数据
            processConfig: null,
            parsedNodes: [],
            userMap: {},
            deptMap: {},
            roleMap: {},
            currentNodeId: null,
            formData: {},
            fileList: [], // 附件列表
            nodePersonConfigs: [],
            processNodes: [],
            approvalDetail: null,
            drawerLoading: false,
            submitLoading: false,
            previewData: null, // 预览数据
            // 全部审批单相关
            searchKeyword: '',
            activeCategory: 'all',
            approvalCategories: [
                { key: 'all', name: '全部' },
                { key: 'leave', name: '假勤管理' },
                { key: 'hr', name: '人事管理' },
                { key: 'finance', name: '智能财务' },
                { key: 'legal', name: '法务管理' },
                { key: 'admin', name: '行政管理' },
                { key: 'business', name: '业务管理' },
                { key: 'safety', name: '安全复工' },
                { key: 'other', name: '其他' }
            ],
            approvalForms: [
                {
                    category: 'all',
                    name: '合同',
                    icon: 'file-text',
                    iconBg: '#1890ff',
                    businessType: 'contranct'
                },
                {
                    category: 'all',
                    name: '项目退款',
                    icon: 'dollar',
                    iconBg: '#52c41a',
                    businessType: 'projectRefund'
                },
                {
                    category: 'all',
                    name: '临时授信',
                    icon: 'credit-card',
                    iconBg: '#faad14',
                    businessType: 'projectTempCredit'
                }
            ],
            services: [
                {
                    title: '每日门店巡检',
                    iconBg: '#1890ff',
                    iconText: '+2',
                    badge: '+2',
                    nodes: 3
                },
                {
                    title: '证件管理',
                    iconBg: '#1890ff',
                    iconText: '+2',
                    badge: '+2',
                    nodes: 4
                },
                {
                    title: '产品研发工作流',
                    iconBg: '#1890ff',
                    iconText: '1',
                    badge: null,
                    nodes: 1
                },
                {
                    title: '物业巡逻巡检',
                    iconBg: '#1890ff',
                    iconText: '3',
                    badge: null,
                    nodes: 3
                },
                {
                    title: '采购入库流程',
                    iconBg: '#1890ff',
                    iconText: '+1',
                    badge: '+1',
                    nodes: 2
                },
                {
                    title: '仓库出入管理',
                    iconBg: '#1890ff',
                    iconText: '+3',
                    badge: '+3',
                    nodes: 4
                }
            ]
        }
    },
    computed: {
        ...mapGetters(['userInfo']),
        // 过滤后的分类
        filteredCategories() {
            let categories = {}
            // 按分类分组
            this.approvalForms.forEach(form => {
                if (!categories[form.category]) {
                    categories[form.category] = {
                        key: form.category,
                        name: this.getCategoryName(form.category),
                        count: 0,
                        forms: []
                    }
                }
                // 搜索过滤
                if (!this.searchKeyword || form.name.includes(this.searchKeyword)) {
                    categories[form.category].forms.push(form)
                    categories[form.category].count++
                }
            })
            // 转换为数组并过滤空分类
            let result = Object.values(categories).filter(cat => cat.forms.length > 0)
            // 如果选择了特定分类，只显示该分类
            if (this.activeCategory !== 'all') {
                result = result.filter(cat => cat.key === this.activeCategory)
            }
            return result
        }
    },
    watch: {
        activeApprovalCard(newVal, oldVal) {
            // 切换审批卡片时重新加载数据（不刷新整个页面）
            // 即使点击同一个按钮也会刷新
            if (oldVal !== undefined) {
                // 如果不是首次加载，重置分页和状态（不清空列表，避免闪烁）
                this.resetList()
                // 直接加载新数据，新数据会替换旧数据
                // 滚动位置会在数据加载完成后在 loadApprovalList 中重置
                this.loadApprovalList()
            } else {
                // 首次加载
                this.resetList()
                this.$nextTick(() => {
                    if (this.$refs.approvalListWrapper) {
                        this.$refs.approvalListWrapper.scrollTop = 0
                    }
                })
                this.loadApprovalList()
            }
        }
    },
    mounted() {
        // 初始化只加载当前激活卡片的数据
        this.loadApprovalList()
        // 延迟加载计数，避免阻塞页面
        setTimeout(() => {
            this.updateCounts()
        }, 500)
    },
    methods: {
        // 重置列表
        resetList() {
            this.approvalList = []
            this.pageNo = 1
            this.hasMore = true
        },
        // 获取查询参数（只传分页参数）
        getQueryParams() {
            return {
                pageNo: this.pageNo,
                pageSize: this.pageSize
            }
        },
        // 根据卡片类型获取对应的API方法
        getApiMethod() {
            switch (this.activeApprovalCard) {
                case 'pending':
                    return queryMyPendingProcesses
                case 'processed':
                    return queryMyProcessedProcesses
                case 'initiated':
                    return queryMyApproval
                case 'copied':
                    return queryProcessesCcToMe
                default:
                    return getApprovalList
            }
        },
        // 加载审批列表
        async loadApprovalList() {
            if (this.listLoading || !this.hasMore) {
                return
            }

            this.listLoading = true
            const params = this.getQueryParams()
            const apiMethod = this.getApiMethod()

            try {
                const res = await apiMethod(params)
                if (res && res.success) {
                    let records = (res.result && res.result.records) ? res.result.records : (res.result || [])

                    // 如果是"我发起的"，按createTime倒序排序
                    if (this.activeApprovalCard === 'initiated' && records.length > 0) {
                        records = records.sort((a, b) => {
                            const timeA = a.createTime ? new Date(a.createTime).getTime() : 0
                            const timeB = b.createTime ? new Date(b.createTime).getTime() : 0
                            return timeB - timeA // 倒序
                        })
                    }

                    if (this.pageNo === 1) {
                        this.approvalList = records
                        // 数据加载完成后，重置滚动位置到顶部（避免跳动）
                        this.$nextTick(() => {
                            if (this.$refs.approvalListWrapper) {
                                this.$refs.approvalListWrapper.scrollTop = 0
                            }
                        })
                    } else {
                        this.approvalList = [...this.approvalList, ...records]
                    }

                    // 判断是否还有更多数据
                    if (records.length < this.pageSize) {
                        this.hasMore = false
                    } else {
                        this.pageNo += 1
                    }
                } else {
                    this.$message.error(res.message || '加载数据失败')
                    this.hasMore = false
                }
            } catch (error) {
                console.error('加载审批列表失败:', error)
                this.$message.error('加载数据失败')
                this.hasMore = false
            } finally {
                this.listLoading = false
            }
        },
        // 更新各类型计数
        async updateCounts() {
            try {
                const countParams = {
                    pageNo: 1,
                    pageSize: 1
                }

                // 待处理的
                const pendingRes = await queryMyPendingProcesses(countParams)
                if (pendingRes && pendingRes.success) {
                    const pendingRecords = (pendingRes.result && pendingRes.result.records) ? pendingRes.result.records : (pendingRes.result || [])
                    this.pendingCount = pendingRes.result && pendingRes.result.total ? pendingRes.result.total : pendingRecords.length
                }

                // 已处理的
                const processedRes = await queryMyProcessedProcesses(countParams)
                if (processedRes && processedRes.success) {
                    const processedRecords = (processedRes.result && processedRes.result.records) ? processedRes.result.records : (processedRes.result || [])
                    this.processedCount = processedRes.result && processedRes.result.total ? processedRes.result.total : processedRecords.length
                }

                // 我发起的
                const initiatedRes = await queryMyApproval(countParams)
                if (initiatedRes && initiatedRes.success) {
                    const initiatedRecords = (initiatedRes.result && initiatedRes.result.records) ? initiatedRes.result.records : (initiatedRes.result || [])
                    this.initiatedCount = initiatedRes.result && initiatedRes.result.total ? initiatedRes.result.total : initiatedRecords.length
                }

                // 抄送我的
                const copiedRes = await queryProcessesCcToMe(countParams)
                if (copiedRes && copiedRes.success) {
                    const copiedRecords = (copiedRes.result && copiedRes.result.records) ? copiedRes.result.records : (copiedRes.result || [])
                    this.copiedCount = copiedRes.result && copiedRes.result.total ? copiedRes.result.total : copiedRecords.length
                }
            } catch (error) {
                console.error('更新计数失败:', error)
            }
        },
        // 处理卡片点击
        handleCardClick(cardType) {
            // 如果点击的是当前已激活的卡片，直接刷新列表
            if (this.activeApprovalCard === cardType) {
                this.refreshCurrentList()
            } else {
                // 否则切换卡片（会触发 watch）
                this.activeApprovalCard = cardType
            }
        },
        // 刷新当前列表
        refreshCurrentList() {
            // 重置分页和状态（不清空列表，避免闪烁）
            this.resetList()
            // 重置滚动位置到顶部
            if (this.$refs.approvalListWrapper) {
                this.$refs.approvalListWrapper.scrollTop = 0
            }
            // 直接加载新数据，新数据会替换旧数据
            this.loadApprovalList()
        },
        // 滚动加载
        handleScroll(event) {
            const target = event.target
            const scrollTop = target.scrollTop
            const scrollHeight = target.scrollHeight
            const clientHeight = target.clientHeight

            // 滚动到底部时加载更多（距离底部50px时触发）
            if (scrollTop + clientHeight >= scrollHeight - 50 && this.hasMore && !this.listLoading) {
                this.loadApprovalList()
            }
        },
        // 获取状态颜色
        getStatusColor(status) {
            const statusMap = {
                '1': 'orange', // 待审批
                '2': 'green',  // 已通过
                '3': 'red',    // 已驳回
                '4': 'orange', // 已撤回
                '5': 'blue'    // 审批中
            }
            return statusMap[status] || 'default'
        },
        // 获取状态文本
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
        // 获取分类名称
        getCategoryName(key) {
            const category = this.approvalCategories.find(cat => cat.key === key)
            return category ? category.name : key
        },
        // 获取业务类型名称
        getBusinessTypeName(businessType) {
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
            return typeMap[businessType] || (businessType ? `${businessType}流程` : '未知流程')
        },
        // 搜索
        handleSearch(value) {
            this.searchKeyword = value
        },
        // 打开新增审批单
        handleAddApproval(form) {
            this.currentBusinessType = form.businessType
            this.drawerMode = 'add'
            this.drawerVisible = true
        },
        // 查看审批详情
        handleViewDetail(item) {
            this.currentApprovalId = item.approvalId || item.id
            this.currentListItemId = item.id
            this.drawerMode = 'detail'
            this.drawerVisible = true
            // 加载详情数据
            this.loadDetailData()
        },
        // 加载详情数据
        async loadDetailData() {
            if (!this.currentApprovalId) return
            this.drawerLoading = true
            try {
                const { getApprovalDetail, getContractInfoById, getApprovalNodePersonConfigByApprovalId } = await import('@/api/api')
                const { getAction } = await import('@/api/manage')
                const { DataLoader } = await import('./flow/DataLoader')

                // 加载审批详情
                const res = await getApprovalDetail({ id: this.currentApprovalId })
                if (res && res.success) {
                    this.approvalDetail = res.result
                    this.currentNodeId = res.result.nodeId

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
                    if (res.result.businessType && res.result.businessId) {
                        let businessRes = null
                        if (res.result.businessType === 'contranct' || res.result.businessType === 'contract' || res.result.businessType === '1') {
                            businessRes = await getContractInfoById({ id: res.result.businessId })
                        } else if (res.result.businessType === 'projectRefund') {
                            businessRes = await getAction('/projectRefundRecord/queryById', { id: res.result.businessId })
                        } else if (res.result.businessType === 'projectTempCredit') {
                            businessRes = await getAction('/projectTempCredit/queryById', { id: res.result.businessId })
                        }

                        if (businessRes && businessRes.success && businessRes.result) {
                            this.formData = businessRes.result
                            // 加载附件列表
                            if (res.result.businessId) {
                                try {
                                    console.log('开始查询附件，bizId:', res.result.businessId)
                                    const fileRes = await getAction('/fileInfo/listNotPage', { bizId: res.result.businessId })
                                    console.log('附件接口返回:', fileRes)
                                    
                                    // 参考合同页面的实现方式
                                    if (fileRes && fileRes.success) {
                                        this.fileList = fileRes.result || []
                                        console.log('附件列表已设置:', this.fileList, '数量:', this.fileList.length)
                                    } else {
                                        console.warn('获取附件列表失败:', fileRes && fileRes.message)
                                        this.fileList = []
                                    }
                                } catch (error) {
                                    console.error('获取附件列表失败:', error)
                                    this.fileList = []
                                }
                            }
                        }
                    }

                    // 加载审批节点人员配置
                    const nodeConfigRes = await getApprovalNodePersonConfigByApprovalId({ approvalId: this.currentApprovalId })
                    if (nodeConfigRes && nodeConfigRes.success) {
                        this.nodePersonConfigs = Array.isArray(nodeConfigRes.result)
                            ? nodeConfigRes.result
                            : (nodeConfigRes.result && nodeConfigRes.result.records ? nodeConfigRes.result.records : [])

                        // 解析 nodes 字段
                        let nodesData = null
                        if (nodeConfigRes.result && nodeConfigRes.result.nodes) {
                            nodesData = nodeConfigRes.result.nodes
                        } else if (Array.isArray(nodeConfigRes.result) && nodeConfigRes.result.length > 0 && nodeConfigRes.result[0].nodes) {
                            nodesData = nodeConfigRes.result[0].nodes
                        }

                        if (nodesData) {
                            try {
                                const nodes = typeof nodesData === 'string' ? JSON.parse(nodesData) : nodesData
                                const currentNodeId = this.approvalDetail && this.approvalDetail.nodeId ? String(this.approvalDetail.nodeId) : null
                                this.parsedNodes = Array.isArray(nodes) ? nodes.map(node => ({
                                    ...node,
                                    isCurrent: currentNodeId && String(node.node_id) === currentNodeId
                                })) : []
                            } catch (e) {
                                console.error('解析流程节点失败:', e)
                                this.parsedNodes = []
                            }
                        }
                    }

                    // 加载用户信息
                    const dataLoader = new DataLoader(this)
                    await dataLoader.loadUserAndDeptData()
                    if (this.parsedNodes && this.parsedNodes.length > 0) {
                        await dataLoader.loadAssigneeNames(this.parsedNodes)
                    }
                    this.userMap = dataLoader.userMap
                } else {
                    this.$message.error(res.message || '获取审批详情失败')
                }
            } catch (error) {
                console.error('加载详情失败:', error)
                this.$message.error('加载详情失败')
            } finally {
                this.drawerLoading = false
            }
        },
        // 加载附件列表
        async loadFileList(bizId) {
            if (!bizId) {
                console.log('loadFileList: bizId为空，跳过查询')
                this.fileList = []
                return
            }

            try {
                const { getAction } = await import('@/api/manage')
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
                this.fileList = []
            }
        },
        // 关闭抽屉
        handleDrawerClose() {
            this.drawerVisible = false
            this.drawerMode = 'add'
            this.currentBusinessType = ''
            this.currentApprovalId = null
            this.currentListItemId = null
            // 清空数据
            this.processConfig = null
            this.parsedNodes = []
            this.userMap = {}
            this.currentNodeId = null
            this.formData = {}
            this.fileList = []
            this.nodePersonConfigs = []
            this.processNodes = []
            this.approvalDetail = null
        },
        // 处理预览事件（从 ProcessFlowForm 触发）
        handlePreview(data) {
            // 更新抽屉数据，切换到预览模式
            this.processConfig = data.processConfig
            this.parsedNodes = data.parsedNodes
            this.userMap = data.userMap || {}
            this.deptMap = data.deptMap || {}
            this.roleMap = data.roleMap || {}
            this.formData = data.model
            this.drawerMode = 'preview'
        },
        // 预览确认
        async handlePreviewConfirm(data) {
            // 处理预览确认提交
            this.submitLoading = true
            try {
                const { httpAction, postAction } = await import('@/api/manage')
                const { getFormConfig } = await import('./form/formConfig')
                const { ProcessParser } = await import('./flow/ProcessParser')
                const { DataLoader } = await import('./flow/DataLoader')
                const { DataParser } = await import('./components/ApprovalForm/modules/dataParser')

                const businessType = this.currentBusinessType
                const formConfig = getFormConfig(businessType)

                if (!formConfig) {
                    throw new Error(`未找到业务类型 ${businessType} 的表单配置`)
                }

                // 构建提交数据
                const dataLoader = new DataLoader(this)
                const processParser = new ProcessParser(this, dataLoader)
                processParser.processConfig = data.processConfig
                processParser.parsedNodes = data.parsedNodes

                const dataParser = new DataParser(this)

                // 处理提交数据（合同需要转换 proIdArray 为 proId）
                let submitData = { ...data.formData }
                if (businessType === 'contranct' || businessType === 'contract' || businessType === '1') {
                    // 合同审批：确保 proId 是字符串格式
                    if (submitData.proIdArray && Array.isArray(submitData.proIdArray) && submitData.proIdArray.length > 0) {
                        submitData.proId = submitData.proIdArray.join(',')
                        // 尝试获取项目名称
                        const proNames = submitData.proIdArray.map(id => {
                            // 这里可以从 projectOptions 或 projectCache 中获取
                            return '' // 暂时返回空，如果需要可以完善
                        }).filter(name => name)
                        submitData.proName = proNames.length > 0 ? proNames.join(',') : ''
                    }
                    delete submitData.proIdArray
                }

                let requestData
                if (formConfig.submitType === 'json') {
                    // JSON 格式提交
                    requestData = await dataParser.buildSubmitData(
                        submitData,
                        data.processConfig,
                        data.parsedNodes,
                        processParser
                    )
                } else {
                    // FormData 格式提交
                    const formData = dataParser.buildFormData(
                        submitData,
                        data.processConfig,
                        data.parsedNodes,
                        processParser,
                        submitData.fileList || []
                    )
                    await dataParser.addProcessNodesToFormData(
                        formData,
                        data.processConfig,
                        data.parsedNodes,
                        processParser,
                        submitData
                    )
                    requestData = formData
                }

                // 确定 URL 和 method
                const httpurl = formConfig.api.add
                const method = 'post'

                // 提交数据
                let res
                if (formConfig.submitType === 'json') {
                    res = await postAction(httpurl, requestData)
                } else {
                    res = await httpAction(httpurl, requestData, method)
                }

                if (res && res.success) {
                    this.$message.success(res.message || '提交成功')
                    // 提交成功后刷新列表
                    this.resetList()
                    this.loadApprovalList()
                    this.updateCounts()
                    this.handleDrawerClose()
                } else {
                    this.$message.error(res.message || '提交失败')
                }
            } catch (error) {
                console.error('提交失败:', error)
                this.$message.error(error.message || '提交失败，请稍后重试')
            } finally {
                this.submitLoading = false
            }
        },
        // 预览取消
        handlePreviewCancel() {
            // 返回编辑模式，保留表单数据
            // formData 会通过 initialFormData prop 传递回 ProcessFlowForm
            this.drawerMode = 'add'
        },
        // 详情刷新
        handleDetailRefresh() {
            // 重新加载详情数据
            this.loadDetailData()
            // 刷新列表和计数
            this.resetList()
            this.loadApprovalList()
            this.updateCounts()
        }
    }
}
</script>

<style scoped lang="less">
.oa-container {
    min-height: 100vh;
    background-color: #f5f5f7;
}

// 统一卡片样式
/deep/ .ant-card {
    border-radius: 8px;
    overflow: hidden;
    border: none;
}

.oa-content-wrapper {
    min-height: 100vh;
}

.oa-sidebar {
    width: 200px;
    background-color: #fafafa;
    border-right: 1px solid #f0f0f0;
    padding: 16px 0;
    flex-shrink: 0;

    .sidebar-item {
        display: flex;
        align-items: center;
        padding: 12px 24px;
        cursor: pointer;
        color: #666;
        transition: all 0.3s;

        &:hover {
            background-color: #f5f5f7;
            color: #1890ff;
        }

        &.active {
            background-color: #e6f7ff;
            color: #1890ff;
            border-right: 3px solid #1890ff;
        }

        .anticon {
            margin-right: 12px;
            font-size: 16px;
        }

        span {
            font-size: 14px;
        }
    }
}

.oa-main-content {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
    background-color: #fff;
}

.approval-center-layout {
    display: flex;
    gap: 20px;
    align-items: flex-start;
}

.main-content-area {
    flex: 1;
    min-width: 0;
}


.main-content-card {
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    background-color: #fff;

    /deep/ .ant-card-body {
        padding: 0;
    }
}

.card-inner-wrapper {
    display: flex;
    min-height: calc(100vh - 100px);
}

.section-card {
    margin-bottom: 20px;
    border-radius: 8px;
    background-color: #fafafa;
    transition: all 0.3s;
    border: 1px solid #f0f0f0;

    &:last-child {
        margin-bottom: 0;
    }

    &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    /deep/ .ant-card-body {
        padding: 20px;
    }
}

// 用户信息区域
.user-info-section {
    margin-bottom: 20px;
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    border: 1px solid #f0f0f0;

    .user-info-wrapper {
        display: flex;
        align-items: center;
        gap: 24px;

        .user-card {
            display: flex;
            align-items: center;
            gap: 12px;

            .user-avatar {
                width: 48px;
                height: 48px;
                background-color: #1890ff;
                color: #fff;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                font-weight: 500;
            }

            .user-details {
                .user-name {
                    font-size: 16px;
                    font-weight: 500;
                    color: #262626;
                    margin-bottom: 4px;
                }

                .user-role {
                    font-size: 14px;
                    color: #8c8c8c;
                }
            }
        }

        .approval-cards {
            display: flex;
            gap: 16px;
            flex: 1;

            .approval-card {
                flex: 1;
                padding: 16px;
                background-color: #ffffff;
                border-radius: 8px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s;
                border: 1px solid #e5e5e7;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);

                &:hover {
                    background-color: #ffffff;
                    border-color: #d1d1d6;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                    transform: translateY(-1px);
                }

                .approval-icon-wrapper {
                    margin-bottom: 8px;
                }

                .approval-number {
                    font-size: 24px;
                    font-weight: 600;
                    color: #262626;
                    margin-bottom: 4px;
                }

                .approval-label {
                    font-size: 14px;
                    color: #666;
                }
            }
        }
    }
}

// 全部审批单
.approval-forms-section {
    /deep/ .ant-card-body {
        padding: 24px;
    }

    .approval-forms-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;

        .approval-forms-title {
            font-size: 20px;
            font-weight: 600;
            color: #262626;
            margin: 0;
        }
    }

    .approval-category-tabs {
        display: flex;
        gap: 8px;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid #f0f0f0;
        flex-wrap: wrap;

        .category-tab {
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s;
            color: #666;
            background-color: transparent;
            font-size: 14px;
            white-space: nowrap;

            &:hover {
                color: #1890ff;
                background-color: #f0f0f0;
            }

            &.active {
                color: #1890ff;
                background-color: #e6f7ff;
                font-weight: 500;
            }
        }
    }

    .approval-category-content {
        .category-group {
            margin-bottom: 32px;

            &:last-child {
                margin-bottom: 0;
            }

            .category-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 16px;

                .category-name {
                    font-size: 16px;
                    font-weight: 500;
                    color: #262626;
                }

                .category-count {
                    font-size: 14px;
                    color: #8c8c8c;
                }
            }

            .approval-forms-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                gap: 16px;

                .approval-form-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    padding: 20px 16px;
                    background-color: #fff;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s;
                    border: 1px solid #f0f0f0;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);

                    &:hover {
                        box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
                        transform: translateY(-2px);
                        border-color: #1890ff;
                    }

                    .form-icon {
                        width: 48px;
                        height: 48px;
                        border-radius: 8px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .form-name {
                        font-size: 14px;
                        color: #262626;
                        text-align: center;
                        font-weight: 500;
                    }
                }
            }
        }
    }
}

// 全部审批单
.approval-forms-section-old {
    .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;

        h3 {
            font-size: 18px;
            font-weight: 500;
            color: #262626;
            margin: 0;
        }

        .forms-actions {
            display: flex;
            align-items: center;
            gap: 16px;

            .category-tabs {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;

                .category-tab {
                    padding: 6px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.3s;
                    color: #666;
                    background-color: #fafafa;
                    font-size: 14px;
                    white-space: nowrap;

                    &:hover {
                        background-color: #f0f0f0;
                        color: #1890ff;
                    }

                    &.active {
                        background-color: #1890ff;
                        color: #fff;
                    }
                }
            }
        }
    }

    .approval-forms-list {
        .empty-forms {
            padding: 40px 0;
            text-align: center;
        }

        .category-group {
            margin-bottom: 24px;

            .category-header {
                margin-bottom: 12px;

                .category-name {
                    font-size: 16px;
                    font-weight: 500;
                    color: #262626;
                }
            }

            .forms-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                gap: 16px;

                .form-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    padding: 16px;
                    background-color: #fff;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s;
                    border: 1px solid #f0f0f0;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);

                    &:hover {
                        box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
                        transform: translateY(-2px);
                        border-color: #1890ff;
                    }

                    .form-icon {
                        width: 48px;
                        height: 48px;
                        border-radius: 8px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .form-name {
                        font-size: 14px;
                        color: #262626;
                        text-align: center;
                    }
                }
            }
        }
    }
}

.common-approval-section,
.services-section {
    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .section-title {
            h3 {
                font-size: 18px;
                font-weight: 500;
                color: #262626;
                margin: 0 0 4px 0;
            }

            .section-subtitle {
                font-size: 14px;
                color: #8c8c8c;
            }
        }

        h3 {
            font-size: 18px;
            font-weight: 500;
            color: #262626;
            margin: 0;
        }

        .view-all-link {
            color: #1890ff;
            font-size: 14px;
            text-decoration: none;

            &:hover {
                text-decoration: underline;
            }
        }
    }

    .empty-content-wrapper {
        background-color: #fff;
        border-radius: 8px;
        min-height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
        border: 1px solid #f0f0f0;

        .empty-content {
            text-align: center;
            padding: 40px 0;

            .empty-illustration {
                display: flex;
                justify-content: center;
                align-items: center;
                margin-bottom: 16px;
            }

            .empty-text {
                color: #8c8c8c;
                font-size: 14px;
            }
        }
    }
}

// 审批列表样式
.approval-list-section {
    /deep/ .ant-card-body {
        padding: 0 !important;
    }

    .approval-list-wrapper {
        height: 400px;
        overflow-y: auto;
        padding: 8px;
        position: relative;

        .empty-list {
            padding: 40px 0;
            text-align: center;
        }

        .approval-list-container {
            width: 100%;
        }

        .initial-loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
        }

        .approval-list-item {
            padding: 7px 16px;
            margin-bottom: 6px;
            background-color: #ffffff;
            border-radius: 8px;
            border: 1px solid #e5e5e7;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 24px;

            &:hover {
                background-color: #ffffff;
                border-color: #d1d1d6;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                transform: translateY(-1px);
            }

            &:last-child {
                margin-bottom: 0;
            }

            .item-business-type {
                font-size: 14px;
                font-weight: 500;
                color: #1d1d1f;
                flex: 0 0 auto;
                min-width: 100px;
                letter-spacing: -0.01em;
                line-height: 1.3;
            }

            .item-info {
                font-size: 12px;
                color: #86868b;
                flex: 0 0 auto;
                white-space: nowrap;
                line-height: 1.3;

                .info-label {
                    color: #86868b;
                    margin-right: 4px;
                }

                .info-value {
                    color: #1d1d1f;
                    font-weight: 400;
                }
            }

            .item-status {
                margin-left: auto;
                flex-shrink: 0;
            }
        }

        .loading-more {
            padding: 20px;
            text-align: center;
            color: #8c8c8c;
            font-size: 14px;
        }

        .no-more {
            padding: 20px;
            text-align: center;
            color: #8c8c8c;
            font-size: 14px;
        }
    }
}

// 列表项淡入动画
.list-item-enter-active {
    animation: fadeInUpItem 0.4s ease-out forwards;
}

.list-item-enter {
    opacity: 0;
    transform: translateY(10px);
}

.list-item-enter-to {
    opacity: 1;
    transform: translateY(0);
}

.list-item-leave-active {
    transition: opacity 0.15s ease-in, transform 0.15s ease-in;
}

.list-item-leave {
    opacity: 1;
    transform: translateY(0);
}

.list-item-leave-to {
    opacity: 0;
    transform: translateY(-5px);
}

// 列表项逐个加载动画
@keyframes fadeInUpItem {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.services-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;

    @media (min-width: 1400px) {
        grid-template-columns: repeat(3, 1fr);
    }

    .service-card {
        background-color: #fff;
        text-align: center;
        transition: all 0.3s;
        border-radius: 8px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
        border: 1px solid #f0f0f0;

        &:hover {
            box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
            transform: translateY(-2px);
        }

        /deep/ .ant-card-body {
            padding: 20px;
        }

        .service-icon {
            width: 56px;
            height: 56px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 12px;
            position: relative;
            color: #fff;
            font-size: 20px;
            font-weight: 500;

            .service-icon-text {
                font-size: 20px;
                font-weight: 500;
            }

            .service-badge {
                position: absolute;
                top: -6px;
                right: -6px;
                background-color: #fff;
                color: #1890ff;
                font-size: 11px;
                font-weight: 500;
                padding: 1px 5px;
                border-radius: 10px;
                border: 1px solid #1890ff;
                line-height: 1.2;
            }
        }

        .service-title {
            font-size: 14px;
            font-weight: 500;
            color: #262626;
            margin-bottom: 8px;
        }

        .service-status {
            margin-bottom: 8px;
        }

        .service-detail {
            font-size: 12px;
            color: #8c8c8c;
        }
    }
}

@media (max-width: 1200px) {
    .services-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 1200px) {
    .approval-center-layout {
        flex-direction: column;
    }
}

@media (max-width: 768px) {
    .card-inner-wrapper {
        flex-direction: column;
    }

    .oa-sidebar {
        width: 100%;
        display: flex;
        overflow-x: auto;
        border-right: none;
        border-bottom: 1px solid #f0f0f0;

        .sidebar-item {
            white-space: nowrap;
        }
    }

    .user-info-section {
        .user-info-wrapper {
            flex-direction: column;
            align-items: flex-start;

            .approval-cards {
                width: 100%;
                flex-wrap: wrap;
            }
        }
    }

    .services-grid {
        grid-template-columns: 1fr;
    }
}
</style>
