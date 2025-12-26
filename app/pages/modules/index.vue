<template>
  <view class="page modules-page" :style="{ paddingTop: navbarHeight + 'px' }">
    <view class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-content">
        <view class="navbar-left"></view>
        <view class="navbar-title">功能导航</view>
        <view class="navbar-right"></view>
      </view>
    </view>

    <scroll-view class="content-scroll" scroll-y>
      <view class="intro-card">
        <view class="intro-title">常用功能入口</view>
        <view class="intro-desc">已适配移动端的场景可直接打开，未接入的功能会提示。</view>
      </view>

      <!-- 分板块的图标模式 Grid 布局 -->
      <view class="section-container" v-for="group in moduleGroups" :key="group.key">
        <view class="section-header">
          <view class="section-title">{{ group.title }}</view>
          <view class="section-desc" v-if="group.description">{{ group.description }}</view>
        </view>
        <view class="modules-grid">
          <view class="module-card" v-for="mod in group.modules" :key="mod.title" @click="openModule(mod)">
            <view class="module-icon-wrapper">
              <view class="module-icon">{{ getModuleIcon(mod) }}</view>
            </view>
            <view class="module-title">{{ mod.title }}</view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { MODULE_GROUPS } from '../../common/config'
import { openWebView } from '../../common/navigation'
import navbarMixin from '../mixins/navbarMixin'

export default {
  mixins: [navbarMixin],
  data() {
    return {
      moduleGroups: MODULE_GROUPS
    }
  },
  methods: {
    getModuleIcon(mod) {
      // 根据模块标题返回对应的图标
      const iconMap = {
        '分析报表': '📊',
        '汇总报表': '📈',
        '渠道报表': '📉',
        '销售报表': '💹',
        '利润菜单': '💰',
        '工作台': '🖥️',
        '客户池海': '👥',
        '客户回款': '💵',
        '回款延期': '⏰',
        '项目管理': '📋',
        '项目资金池': '🏦',
        '项目资金变动明细': '📝',
        '返点政策模板': '📄',
        '微信机器人配置': '🤖',
        '账户列表': '💳',
        '账户主体': '🏢',
        '共享钱包': '👛',
        '子端口': '🔌',
        '广告主ID复制': '📋',
        '账户绑定变动记录': '📜',
        '充退处理列表': '💸',
        '账户流水明细': '💱',
        '账户消耗明细': '📊',
        '客户到账': '✅',
        '客户退款': '↩️',
        '项目损失': '📉',
        '抬头管理': '📑',
        '数据洞察': '🔍',
        '素材列表': '🖼️',
        '素材裂变': '✨',
        '素材风控': '🛡️',
        '返点管理': '💎',
        '巨量引擎': '🚀',
        '磁力引擎': '🧲',
        '腾讯广告': '🐧',
        '成本导入': '📥',
        '利润报表': '💵',
        '渠道列表': '🌐',
        '平台应用管理': '⚙️',
        '代理商账户': '👔',
        '邮件发送记录': '📧',
        '更新日志': '📝',
        '消息管理': '💬',
        '消息模板': '📋',
        '我的消息': '🔔',
        '路由网关': '🌉',
        '定时任务': '⏲️',
        '日志管理': '📚',
        '数据日志': '📖',
        'Redis 监控': '🔴',
        'Tomcat 信息': '🐱',
        '服务器信息': '🖥️',
        'JVM 信息': '☕',
        '请求追踪': '🔍',
        '磁盘监控': '💾',
        'SQL 监控': '🗄️',
        '在线文档': '📘',
        '在线用户': '👤',
        'Online 表单开发': '📝',
        'Online 报表配置': '📊',
        '系统编码规则': '🔢',
        '系统校验规则': '✓',
        '多数据源管理': '🗃️',
        '用户管理': '👥',
        '角色管理': '🎭',
        '菜单管理': '📑',
        '部门管理': '🏢',
        '我的部门': '👨‍👩‍👧‍👦',
        '通讯录': '📇',
        '数据字典': '📚',
        '分类字典': '🗂️',
        '系统通告': '📢',
        '个人中心': '👤',
        '基本设置': '⚙️',
        '账户绑定': '🔗',
        '个性化设置': '🎨',
        '安全设置': '🔒',
        '新消息通知': '🔔'
      }
      return iconMap[mod.title] || '📦'
    },
    openModule(mod) {
      if (mod && mod.path) {
        openWebView(mod.path, mod.title)
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../common/styles/ios-common.scss';

.modules-page {
  background: #f2f2f7;
}

.content-scroll {
  flex: 1;
  height: 0;
  /* 让 flex 子元素正确计算高度 */
  /* 隐藏滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 和 Edge */
}

.content-scroll::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
  width: 0;
  height: 0;
  background: transparent;
}

.intro-card {
  margin: 12rpx 16rpx;
  padding: 20rpx;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.06);
}

.intro-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #111;
  margin-bottom: 6rpx;
}

.intro-desc {
  font-size: 24rpx;
  color: #6e6e73;
}

/* 板块容器 */
.section-container {
  margin-bottom: 24rpx;
  padding: 0 16rpx;
}

.section-header {
  padding: 20rpx 0 16rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1c1c1e;
  margin-bottom: 8rpx;
}

.section-desc {
  font-size: 24rpx;
  color: #8e8e93;
  line-height: 1.4;
}

/* 图标模式 Grid 布局 */
.modules-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
  background: #f2f2f7;
  padding: 0;
}

.module-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.module-card:active {
  transform: scale(0.95);
  box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.08);
  background: #f8f8f8;
}

.module-icon-wrapper {
  width: 88rpx;
  height: 88rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #f0f5ff 0%, #e6f0ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(46, 135, 255, 0.12);
}

.module-icon {
  font-size: 44rpx;
  line-height: 1;
}

.module-title {
  font-size: 22rpx;
  font-weight: 500;
  color: #1c1c1e;
  text-align: center;
  line-height: 1.3;
  word-break: break-all;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
