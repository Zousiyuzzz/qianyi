<template>
    <div class="version-list-container">
        <!-- 页面头部 -->
        <div class="page-header">
            <div class="header-content">
                <div class="header-left">
                    <h1 class="page-title">
                        <a-icon type="file-text" class="title-icon" />
                        系统更新日志
                    </h1>
                    <p class="page-description">查看系统版本更新历史和功能变更记录</p>
                </div>
                <div class="header-right">
                    <div class="header-stats">
                        <div class="stat-item">
                            <span class="stat-number">{{ versionData.length }}</span>
                            <span class="stat-label">总版本数</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>


        <!-- 版本列表 -->
        <div class="version-list-wrapper">
            <div class="version-list">
                <div v-for="(version, index) in filteredData" :key="version.id" class="version-item">
                    <div class="version-date-header">
                        <div class="date-line">
                            <div class="date-dot"></div>
                            <span class="date-text">{{ version.updateDate }}</span>
                        </div>
                    </div>

                    <div class="version-content">
                        <div class="version-header">
                            <div class="version-info">
                                <div class="version-title">
                                    <a-tag :color="getTypeColor(version.type)" class="version-tag">
                                        {{ version.version }}
                                    </a-tag>
                                    <span class="version-type">{{ getTypeText(version.type) }}</span>
                                </div>
                                <div class="version-meta">
                                    <span class="update-by">
                                        <a-icon type="user" />
                                        {{ version.updateBy }}
                                    </span>
                                    <span class="update-date">
                                        <a-icon type="calendar" />
                                        {{ version.updateDate }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="version-body">
                            <div class="greeting">
                                尊敬的用户，您好！
                            </div>
                            <div class="intro-text">
                                系统于 {{ version.updateDate }} 发布了版本更新，请您关注并评估影响。
                            </div>

                            <div class="update-overview">
                                <div class="overview-title">本次更新内容速览：</div>
                                <div v-for="(feature, index) in getFeaturesList(version)" :key="index"
                                    class="overview-item">
                                    <span class="update-type-tag" :class="'tag-' + feature.type">
                                        {{ getTypeText(feature.type) }}
                                    </span>
                                    {{ feature.content }}
                                </div>
                            </div>

                            <div class="update-details">
                                <div class="detail-section">
                                    <h4 class="detail-title">
                                        <a-icon type="info-circle" />
                                        {{ getTypeText(version.type) }}详情
                                    </h4>
                                    <div class="detail-content">
                                        <p>{{ version.content }}</p>
                                        <div class="scope-info">
                                            <strong>影响范围：</strong>{{ version.scope }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredData.length === 0" class="empty-state">
            <a-empty description="暂无版本记录">
                <a-button type="primary" @click="clearFilters">重置筛选</a-button>
            </a-empty>
        </div>

        <!-- 右侧筛选和时间线 -->
        <div class="sidebar">
            <!-- 搜索区域 -->
            <div class="search-sidebar">
                <a-input-search v-model="queryParam.version" placeholder="搜索版本号或更新内容..." @search="searchQuery"
                    allowClear size="small" />
            </div>

            <!-- 日志筛选 -->
            <div class="filter-sidebar">
                <div class="filter-title">日志筛选</div>
                <a-checkbox-group v-model="filterTypes" @change="handleFilterChange" class="filter-checkbox-group">
                    <a-checkbox value="all">不限</a-checkbox>
                    <a-checkbox value="feature">新功能</a-checkbox>
                    <a-checkbox value="bugfix">Bug修复</a-checkbox>
                    <a-checkbox value="optimization">优化</a-checkbox>
                    <a-checkbox value="security">安全更新</a-checkbox>
                </a-checkbox-group>
                <a-button type="link" @click="clearFilters" size="small" class="clear-button">清空筛选</a-button>
            </div>

            <!-- 更新日期 -->
            <div class="timeline-sidebar">
                <div class="timeline-title">更新日期</div>
                <div class="timeline-list">
                    <div v-for="date in uniqueDates" :key="date" class="timeline-item"
                        :class="{ active: selectedDate === date }" @click="filterByDate(date)">
                        <div class="timeline-dot" v-if="selectedDate === date"></div>
                        <span class="timeline-date">{{ date }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'VersionList',
    data() {
        return {
            description: '版本更新记录',
            // 基于Git日志提取的版本数据
            versionData: [
                {
                    id: '1',
                    version: 'v1.1.1',
                    type: 'feature',
                    updateDate: '2025-01-15',
                    updateBy: 'zou',
                    content: '系统功能优化和业务逻辑完善，包含多个模块功能更新',
                    scope: '系统全局',
                    features: [
                        {
                            type: 'feature',
                            content: '新增客户详情弹窗功能，支持客户信息查看和编辑'
                        },
                        {
                            type: 'feature',
                            content: '新增账户变动记录查询功能，支持项目绑定变更历史追踪'
                        },
                        {
                            type: 'feature',
                            content: '优化项目绑定功能，支持更改项目绑定和绑定时间限制'
                        },
                        {
                            type: 'feature',
                            content: '优化客户管理模块，支持客户主体信息管理和渠道状态监控'
                        },
                    ]
                },
                {
                    id: '2',
                    version: 'v1.0.8',
                    type: 'feature',
                    updateDate: '2025-09-12',
                    updateBy: 'zou',
                    content: '项目管理模块功能完善，包含项目管理和返点模板配置',
                    scope: '项目管理模块',
                    features: [
                        {
                            type: 'feature',
                            content: '新增项目管理功能，支持项目创建、编辑和状态管理'
                        },
                        {
                            type: 'feature',
                            content: '新增返点模板管理，支持返点政策配置和模板应用'
                        },
                        {
                            type: 'feature',
                            content: '新增项目资金池管理，支持资金分配和监控'
                        }
                    ]
                },
                {
                    id: '3',
                    version: 'v1.0.7',
                    type: 'feature',
                    updateDate: '2025-09-08',
                    updateBy: 'zou',
                    content: '渠道管理和广告主管理功能模块上线',
                    scope: '渠道管理模块',
                    features: [
                        {
                            type: 'feature',
                            content: '新增渠道管理功能，支持渠道创建、配置和状态监控'
                        },
                        {
                            type: 'feature',
                            content: '新增广告主管理，支持广告主信息维护和权限管理'
                        },
                        {
                            type: 'feature',
                            content: '新增渠道返点管理，支持返点政策配置和计算'
                        }
                    ]
                },
                {
                    id: '4',
                    version: 'v1.0.6',
                    type: 'feature',
                    updateDate: '2025-09-01',
                    updateBy: 'zou',
                    content: '资金管理模块和项目资金池功能发布',
                    scope: '资金管理模块',
                    features: [
                        {
                            type: 'feature',
                            content: '新增资金管理功能，支持资金流入流出记录和统计'
                        },
                        {
                            type: 'feature',
                            content: '新增项目资金池管理，支持资金分配和余额监控'
                        },
                        {
                            type: 'feature',
                            content: '新增资金转账记录，支持转账流水查询和核对'
                        }
                    ]
                },
                {
                    id: '5',
                    version: 'v1.0.5',
                    type: 'feature',
                    updateDate: '2025-08-30',
                    updateBy: 'zou',
                    content: '诊断任务和结果管理功能模块上线',
                    scope: '诊断任务模块',
                    features: [
                        {
                            type: 'feature',
                            content: '新增诊断任务管理，支持任务创建、配置和执行'
                        },
                        {
                            type: 'feature',
                            content: '新增诊断结果管理，支持结果查看、分析和导出'
                        },
                        {
                            type: 'feature',
                            content: '新增任务状态监控，支持实时状态更新和异常处理'
                        }
                    ]
                },
                {
                    id: '6',
                    version: 'v1.0.4',
                    type: 'feature',
                    updateDate: '2025-08-29',
                    updateBy: 'zou',
                    content: '素材管理模块功能发布，支持素材上传和版本控制',
                    scope: '素材管理模块',
                    features: [
                        {
                            type: 'feature',
                            content: '新增素材管理功能，支持素材上传、分类和存储'
                        },
                        {
                            type: 'feature',
                            content: '新增素材版本控制，支持版本管理和历史记录'
                        },
                        {
                            type: 'feature',
                            content: '新增素材权限管理，支持访问控制和权限分配'
                        }
                    ]
                },
                {
                    id: '7',
                    version: 'v1.0.3',
                    type: 'feature',
                    updateDate: '2025-08-28',
                    updateBy: 'zou',
                    content: '系统管理模块和用户权限管理功能发布',
                    scope: '系统管理模块',
                    features: [
                        {
                            type: 'feature',
                            content: '新增系统管理功能，支持系统配置和参数设置'
                        },
                        {
                            type: 'feature',
                            content: '新增用户管理功能，支持用户创建、编辑和权限分配'
                        },
                        {
                            type: 'feature',
                            content: '新增角色管理，支持角色定义和权限控制'
                        }
                    ]
                },
                {
                    id: '8',
                    version: 'v1.1.0',
                    type: 'feature',
                    updateDate: '2025-08-12',
                    updateBy: 'zou',
                    content: '系统功能优化和业务逻辑完善，包含多个模块功能更新',
                    scope: '系统全局',
                    features: [
                        {
                            type: 'optimization',
                            content: '修复系统logo字体不稳定问题，确保新字体正常显示'
                        },
                        {
                            type: 'feature',
                            content: '新增项目绑定商务功能，客户池列表以逗号分隔显示项目商务信息'
                        },
                        {
                            type: 'feature',
                            content: '新增按客户主体分渠道自动绑定项目和返点模板功能'
                        },
                        {
                            type: 'feature',
                            content: '项目备款调整授信功能，限制只能在对应项目的H5页面操作'
                        },
                        {
                            type: 'feature',
                            content: '新增快手广告主退款和钱包退款全部指令功能'
                        },
                        {
                            type: 'feature',
                            content: '新增抖音广告主退款和钱包退款全部指令功能'
                        },
                        {
                            type: 'feature',
                            content: '修改项目商务时联动修改客户的销售信息'
                        }
                    ]
                },
                {
                    id: '9',
                    version: 'v1.0.9',
                    type: 'feature',
                    updateDate: '2025-08-02',
                    updateBy: 'zou',
                    content: '快手平台功能完善和查询优化，包含充值指令和批量查询',
                    scope: '快手充值模块',
                    features: [
                        {
                            type: 'feature',
                            content: '新增快手子端口充值指令充值和解析功能'
                        },
                        {
                            type: 'optimization',
                            content: '新增项目和客户名称模糊查询功能，提升搜索体验'
                        },
                        {
                            type: 'feature',
                            content: '新增指令批量查询钱包余额和解析功能'
                        },
                        {
                            type: 'feature',
                            content: '新增广告主ID批量查询功能'
                        },
                        {
                            type: 'optimization',
                            content: '广告主ID列表去掉竞价分类和系统产品名称字段'
                        },
                        {
                            type: 'optimization',
                            content: '广告主ID绑定项目去掉产品字段'
                        }
                    ]
                }
            ],
            // 筛选相关
            filterTypes: ['all'],
            selectedDate: null,
            // 查询参数
            queryParam: {
                version: ''
            }
        }
    },
    computed: {
        filteredData() {
            let data = [...this.versionData];

            // 按类型筛选
            if (!this.filterTypes.includes('all')) {
                data = data.filter(item => this.filterTypes.includes(item.type));
            }

            // 按日期筛选
            if (this.selectedDate) {
                data = data.filter(item => item.updateDate === this.selectedDate);
            }

            // 按搜索关键词筛选
            if (this.queryParam.version) {
                const keyword = this.queryParam.version.toLowerCase();
                data = data.filter(item =>
                    item.version.toLowerCase().includes(keyword) ||
                    item.content.toLowerCase().includes(keyword)
                );
            }

            return data;
        },
        uniqueDates() {
            const dates = [...new Set(this.versionData.map(item => item.updateDate))];
            return dates.sort((a, b) => new Date(b) - new Date(a));
        }
    },
    methods: {
        getTypeColor(type) {
            const colors = {
                'feature': 'green',
                'bugfix': 'red',
                'optimization': 'blue',
                'security': 'orange'
            };
            return colors[type] || 'default';
        },
        getTypeText(type) {
            const texts = {
                'feature': '新功能',
                'bugfix': 'Bug修复',
                'optimization': '优化',
                'security': '安全更新'
            };
            return texts[type] || type;
        },
        handleFilterChange() {
            // 触发计算属性重新计算
            this.$forceUpdate();
        },
        clearFilters() {
            this.filterTypes = ['all'];
            this.selectedDate = null;
            this.queryParam.version = '';
            this.$forceUpdate();
        },
        filterByDate(date) {
            this.selectedDate = this.selectedDate === date ? null : date;
            this.$forceUpdate();
        },
        searchQuery() {
            // 触发计算属性重新计算
            this.$forceUpdate();
        },
        getFeaturesList(version) {
            // 如果有features数组，返回features；否则返回单个功能
            if (version.features && version.features.length > 0) {
                return version.features;
            } else {
                return [{
                    type: version.type,
                    content: version.content
                }];
            }
        }
    }
}
</script>

<style scoped>
.version-list-container {
    min-height: 100vh;
    /* background: #f5f5f5; */
    padding: 0;
    position: relative;
}

/* 页面头部 */
.page-header {
    background: #fff;
    border-bottom: 1px solid #e8e8e8;
    padding: 24px 32px;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
}

.header-left {
    flex: 1;
}

.page-title {
    font-size: 24px;
    font-weight: 600;
    color: #262626;
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
}

.title-icon {
    margin-right: 12px;
    color: #1890ff;
    font-size: 20px;
}

.page-description {
    font-size: 14px;
    color: #8c8c8c;
    margin: 0;
}

.header-right {
    text-align: right;
}

.header-stats {
    display: flex;
    gap: 24px;
}

.stat-item {
    text-align: center;
}

.stat-number {
    display: block;
    font-size: 24px;
    font-weight: 600;
    color: #1890ff;
    line-height: 1;
}

.stat-label {
    font-size: 12px;
    color: #8c8c8c;
    margin-top: 4px;
}

/* 搜索侧边栏 */
.search-sidebar {
    background: #fff;
    border-radius: 8px;
    border: 1px solid #e8e8e8;
    padding: 12px;
    margin-bottom: 16px;
}

/* 版本列表包装器 */
.version-list-wrapper {
    max-width: calc(1600px - 280px);
    margin: 0 auto 0 32px;
    padding: 0 32px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-top: 24px;
    margin-bottom: 24px;
}

/* 版本列表 */
.version-list {
    padding: 24px 0;
    position: relative;
}

.version-item {
    margin-bottom: 32px;
    position: relative;
}

.version-date-header {
    margin-bottom: 16px;
}

.date-line {
    display: flex;
    align-items: center;
    position: relative;
}

.date-dot {
    width: 8px;
    height: 8px;
    background: #1890ff;
    border-radius: 50%;
    margin-right: 12px;
    position: relative;
    z-index: 2;
}

/* .date-dot::after {
    content: '';
    position: absolute;
    top: 8px;
    left: 3px;
    width: 2px;
    height: 40px;
    background: #e8e8e8;
} */

.date-text {
    font-size: 16px;
    font-weight: 600;
    color: #262626;
}

.version-content {
    background: #fff;
    border-radius: 8px;
    border: 1px solid #e8e8e8;
    overflow: hidden;
    margin-left: 20px;
}

.version-header {
    padding: 20px 24px 16px;
    border-bottom: 1px solid #f0f0f0;
}

.version-info {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.version-title {
    display: flex;
    align-items: center;
    gap: 12px;
}

.version-tag {
    font-size: 14px;
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 4px;
}

.version-type {
    font-size: 14px;
    color: #8c8c8c;
}

.version-meta {
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: #8c8c8c;
}

.version-meta span {
    display: flex;
    align-items: center;
    gap: 4px;
}

.version-body {
    padding: 24px;
}

.greeting {
    font-size: 16px;
    color: #262626;
    margin-bottom: 12px;
    font-weight: 500;
}

.intro-text {
    font-size: 14px;
    color: #595959;
    margin-bottom: 20px;
    line-height: 1.6;
}

.update-overview {
    background: #f8f9fa;
    border-radius: 6px;
    padding: 16px;
    margin-bottom: 20px;
}

.overview-title {
    font-size: 14px;
    font-weight: 600;
    color: #262626;
    margin-bottom: 12px;
}

.overview-item {
    font-size: 14px;
    color: #595959;
    line-height: 1.6;
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 12px;
}

.overview-item:last-child {
    margin-bottom: 0;
}

.update-type-tag {
    padding: 2px 8px;
    border-radius: 3px;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    flex-shrink: 0;
}

.tag-feature {
    background: #f6ffed;
    color: #52c41a;
    border: 1px solid #b7eb8f;
}

.tag-bugfix {
    background: #fff2f0;
    color: #ff4d4f;
    border: 1px solid #ffccc7;
}

.tag-optimization {
    background: #e6f7ff;
    color: #1890ff;
    border: 1px solid #91d5ff;
}

.tag-security {
    background: #fff7e6;
    color: #fa8c16;
    border: 1px solid #ffd591;
}

.update-details {
    border-top: 1px solid #f0f0f0;
    padding-top: 20px;
}

.detail-section {
    margin-bottom: 16px;
}

.detail-title {
    font-size: 14px;
    font-weight: 600;
    color: #262626;
    margin: 0 0 12px 0;
    display: flex;
    align-items: center;
    gap: 8px;
}

.detail-content {
    font-size: 14px;
    color: #595959;
    line-height: 1.6;
}

.detail-content p {
    margin: 0 0 12px 0;
}

.scope-info {
    background: #f8f9fa;
    padding: 12px;
    border-radius: 4px;
    border-left: 3px solid #1890ff;
}

/* 右侧侧边栏 */
.sidebar {
    position: fixed;
    right: 32px;
    top: 216px;
    width: 220px;
    z-index: 10;
}

/* 日志筛选侧边栏 */
.filter-sidebar {
    background: #fff;
    border-radius: 8px;
    border: 1px solid #e8e8e8;
    padding: 16px;
    margin-bottom: 16px;
}

.filter-title {
    font-size: 14px;
    font-weight: 600;
    color: #262626;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
}

.filter-checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.filter-checkbox-group .ant-checkbox-wrapper {
    margin: 0;
    font-size: 13px;
}

.clear-button {
    width: 100%;
    margin-top: 12px;
    text-align: center;
}

/* 右侧时间线 */
.timeline-sidebar {
    background: #fff;
    border-radius: 8px;
    border: 1px solid #e8e8e8;
    padding: 16px;
    max-height: 300px;
    overflow-y: auto;
}

.timeline-title {
    font-size: 14px;
    font-weight: 600;
    color: #262626;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
}

.timeline-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.timeline-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 12px;
    color: #8c8c8c;
}

.timeline-item:hover {
    background: #f5f5f5;
    color: #262626;
}

.timeline-item.active {
    background: #e6f7ff;
    color: #1890ff;
}

.timeline-dot {
    width: 6px;
    height: 6px;
    background: #1890ff;
    border-radius: 50%;
    flex-shrink: 0;
}

.timeline-date {
    flex: 1;
}

/* 空状态 */
.empty-state {
    text-align: center;
    padding: 60px 20px;
    background: #fff;
    border-radius: 8px;
    border: 1px solid #e8e8e8;
    margin: 24px 32px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
    .sidebar {
        display: none;
    }

    .version-list-wrapper {
        max-width: 1200px;
        margin: 24px auto;
        padding: 0 32px;
    }
}

@media (max-width: 768px) {
    .page-header {
        padding-left: 16px;
        padding-right: 16px;
    }

    .header-content {
        flex-direction: column;
        gap: 16px;
        text-align: center;
    }

    .version-list-wrapper {
        max-width: none;
        margin: 24px 16px;
        padding: 0 16px;
    }

    .version-info {
        flex-direction: column;
        gap: 12px;
    }

    .version-meta {
        flex-wrap: wrap;
        gap: 12px;
    }
}
</style>