<template>
  <scroll-view class="page modules-page" scroll-y>
    <view class="navbar">
      <view class="navbar-content">
        <view class="navbar-left"></view>
        <view class="navbar-title">功能导航</view>
        <view class="navbar-right"></view>
      </view>
    </view>

    <view class="intro-card">
      <view class="intro-title">常用功能入口</view>
      <view class="intro-desc">已适配移动端的场景可直接打开，未接入的功能会提示。</view>
    </view>

    <view class="section-card" v-for="group in moduleGroups" :key="group.key">
      <view class="section-header">
        <view>
          <view class="section-title">{{ group.title }}</view>
          <view class="section-desc">{{ group.description }}</view>
        </view>
        <view class="section-arrow">›</view>
      </view>
      <view class="module-grid">
        <view class="module-item" v-for="mod in group.modules" :key="mod.title" @click="openModule(mod)">
          <view class="module-icon">{{ getModuleIcon(mod) }}</view>
          <view class="module-meta">
            <text class="module-name">{{ mod.title }}</text>
            <text class="module-desc">{{ mod.desc }}</text>
          </view>
          <text class="item-arrow">›</text>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<script>
import { MODULE_GROUPS } from '../../common/config'
import { openWebView } from '../../common/navigation'

export default {
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

.intro-card {
  margin: 20rpx 16rpx 12rpx;
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

.section-card {
  background: #fff;
  margin: 12rpx 16rpx;
  padding: 16rpx;
  border-radius: 20rpx;
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4rpx 6rpx 12rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #111;
}

.section-desc {
  font-size: 24rpx;
  color: #6e6e73;
  margin-top: 4rpx;
}

.section-arrow {
  font-size: 34rpx;
  color: #c7c7cc;
  font-weight: 300;
}

.module-grid {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-top: 10rpx;
}

.module-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 10rpx;
  border-radius: 16rpx;
  transition: background 0.12s ease;
}

.module-item:active {
  background: rgba(0, 0, 0, 0.04);
}

.module-icon {
  width: 78rpx;
  height: 78rpx;
  border-radius: 18rpx;
  background: linear-gradient(135deg, #f0f5ff 0%, #e6f0ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 42rpx;
  color: #1c1c1e;
  box-shadow: 0 4rpx 12rpx rgba(46, 135, 255, 0.12);
}

.module-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.module-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #111;
}

.module-desc {
  font-size: 24rpx;
  color: #6e6e73;
  line-height: 1.4;
}

.item-arrow {
  font-size: 32rpx;
  color: #c7c7cc;
  font-weight: 300;
}
</style>
