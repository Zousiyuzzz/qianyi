<template>
  <view class="page" :style="{ paddingTop: navbarHeight + 'px' }">
    <!-- Navbar -->
    <view class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-content">
        <view class="navbar-left" @click.stop="handleBack">
          <text class="back-icon">‹</text>
        </view>
        <view class="navbar-title">{{ crud.ui.pageTitle }}</view>
        <view class="navbar-right"></view>
      </view>
    </view>

    <scroll-view class="content-scroll" scroll-y v-if="projectData">
      <!-- 动态分组渲染 -->
      <view class="group" v-for="g in renderGroups" :key="g.key" v-if="g.show">
        <!-- header group -->
        <view class="group-header" v-if="g.type === 'header'">
          <text class="project-name">{{ getVal(projectData, crud.header.titleProp) || '-' }}</text>
          <text class="project-sub">{{ getVal(projectData, crud.header.subProp) || '-' }}</text>
        </view>

        <!-- rows group -->
        <template v-else>
          <block v-for="(row, idx) in g.rows" :key="g.key + '_' + idx">
            <view class="group-item" :class="row.className || ''">
              <template v-if="row.kind === 'sectionTitle'">
                <text>{{ row.title }}</text>
              </template>

              <template v-else>
                <text class="label">{{ row.label }}</text>
                <text class="value" :class="row.valueClass || ''">{{ row.value }}</text>
              </template> 
            </view>

            <view class="divider" v-if="row.showDivider !== false && idx !== g.rows.length - 1"></view>
          </block> 
        </template>
      </view>

      <!-- 底部操作 -->
      <view class="bottom-safe">
        <view class="bottom-actions">
          <button class="btn ios-secondary" @click="handleEdit">{{ crud.ui.buttons.edit }}</button>
          <button class="btn ios-primary" @click="handleChangeLog">{{ crud.ui.buttons.changeLog }}</button>
        </view>
      </view>
    </scroll-view>

    <view class="loading" v-if="loading">
      <text>{{ crud.ui.loadingText }}</text>
    </view>
  </view>
</template>

<script>
import { getProjectDetail, getProjectFundPool } from '../../common/api/project'
import { openWebView } from '../../common/navigation'
import navbarMixin from '../mixins/navbarMixin'

/**
 * ======= 你复制“客户详情”只需要改这里 =======
 * - ui 文案
 * - api.detail/api.fundPool（可选）
 * - header.titleProp/header.subProp
 * - groups（各分组&字段）
 * - actions（编辑/变动明细/跳转）
 */
const crud = {
  ui: {
    pageTitle: '项目详情',
    loadingText: '加载中...',
    buttons: {
      edit: '修改项目',
      changeLog: '变动明细'
    }
  },

  storage: {
    tempKey: '_temp_project_data'
  },

  api: {
    detail: getProjectDetail,
    fundPool: getProjectFundPool
  },

  header: {
    titleProp: 'proName',
    subProp: 'customerName'
  },

  // 文本映射（详情里用）
  dict: {
    operationType: { 1: '自运营', 2: '走量', 3: '收量' },
    paymentMethod: { 0: '充值结算', 1: '消耗结算' }
  },

  // fundPool 字段映射（保持你原来的字段名）
  fundFields: {
    availableBalance: 'availablebBalance',
    totalCreditLimit: 'totalCreditLimit',
    availableCreditBalance: 'availableCreditBalance',
    totalCashReserve: 'totalCashReserve',
    totalArrears: 'totalArrears',

    publicCashReserves: 'publicCashReserves',
    publicCreditArrears: 'publicCreditArrears',

    privateCashReserve: 'privateCashReserve',
    privateCreditArrears: 'privateCreditArrears'
  },

  // Web 工作台（保留你原行为）
  web: {
    workbenchPath: '/projectManager/workbench',
    titleWorkbench: '项目工作台'
  },

  routes: {
    fundChangeLog: '/pages/project/fundChangeLog'
  }
}

export default {
  mixins: [navbarMixin],
  data() {
    return {
      crud,
      projectId: '',
      projectData: null,
      fundPoolData: null,
      loading: false
    }
  },

  computed: {
    renderGroups() {
      const groups = []

      // 1) header
      groups.push({
        key: 'header',
        type: 'header',
        show: true
      })

      // 2) 基础信息（全部从配置生成）
      groups.push({
        key: 'base',
        type: 'rows',
        show: true,
        rows: [
          { label: '渠道', value: this.getVal(this.projectData, 'businessName') || '-', showDivider: true },
          { label: '运营方式', value: this.getOperationTypeText(this.getVal(this.projectData, 'operationType')), showDivider: true },
          { label: '商务', value: this.getVal(this.projectData, 'businessPerson_dictText') || '-', showDivider: true },
          { label: 'AE', value: this.getVal(this.projectData, 'aePerson_dictText') || '-', showDivider: true },
          { label: '合作方式', value: this.getVal(this.projectData, 'collaborationMode_dictText') || '-', showDivider: true },
          { label: '结算方式', value: this.getPaymentMethodText(this.getVal(this.projectData, 'paymentMethod')), showDivider: false }
        ]
      })

      // 3) 可用余额
      groups.push({
        key: 'balance',
        type: 'rows',
        show: !!this.fundPoolData,
        rows: [
          {
            className: 'large',
            label: '可用余额',
            value: `¥${this.formatNumber(this.getVal(this.fundPoolData, this.crud.fundFields.availableBalance) || 0)}`,
            valueClass: 'balance-value',
            showDivider: false
          }
        ]
      })

      // 4) 资金概览
      groups.push({
        key: 'overview',
        type: 'rows',
        show: !!this.fundPoolData,
        rows: [
          { label: '授信总额度', value: `¥${this.formatNumber(this.getVal(this.fundPoolData, this.crud.fundFields.totalCreditLimit) || 0)}` },
          { label: '授信可用', value: `¥${this.formatNumber(this.getVal(this.fundPoolData, this.crud.fundFields.availableCreditBalance) || 0)}` },
          { label: '总备款', value: `¥${this.formatNumber(this.getVal(this.fundPoolData, this.crud.fundFields.totalCashReserve) || 0)}` },
          {
            label: '总欠款',
            value: `¥${this.formatNumber(this.getVal(this.fundPoolData, this.crud.fundFields.totalArrears) || 0)}`,
            valueClass: 'negative',
            showDivider: false
          }
        ]
      })

      // 5) 对公资金
      groups.push({
        key: 'public',
        type: 'rows',
        show: !!this.fundPoolData,
        rows: [
          { kind: 'sectionTitle', className: 'section-title', title: '对公资金' },
          { label: '现金备款', value: `¥${this.formatNumber(this.getVal(this.fundPoolData, this.crud.fundFields.publicCashReserves) || 0)}` },
          {
            label: '授信欠款',
            value: `¥${this.formatNumber(this.getVal(this.fundPoolData, this.crud.fundFields.publicCreditArrears) || 0)}`,
            valueClass: 'negative',
            showDivider: false
          }
        ]
      })

      // 6) 对私资金
      groups.push({
        key: 'private',
        type: 'rows',
        show: !!this.fundPoolData,
        rows: [
          { kind: 'sectionTitle', className: 'section-title', title: '对私资金' },
          { label: '现金备款', value: `¥${this.formatNumber(this.getVal(this.fundPoolData, this.crud.fundFields.privateCashReserve) || 0)}` },
          {
            label: '授信欠款',
            value: `¥${this.formatNumber(this.getVal(this.fundPoolData, this.crud.fundFields.privateCreditArrears) || 0)}`,
            valueClass: 'negative',
            showDivider: false
          }
        ]
      })

      // 修正：sectionTitle 行需要 divider（保持你原 UI 视觉）
      groups.forEach(g => {
        if (g.type !== 'rows') return
        g.rows = g.rows.map((row, i) => {
          if (row.kind === 'sectionTitle') return { ...row, showDivider: true }
          // 最后一行默认不显示 divider（跟你原来一致）
          if (i === g.rows.length - 1 && row.showDivider === undefined) return { ...row, showDivider: false }
          return row
        })
      })

      return groups
    }
  },

  onLoad(query) {
    this.projectId = query.id
    const tempData = uni.getStorageSync(this.crud.storage.tempKey)
    if (tempData && String(tempData.id) === String(this.projectId)) {
      this.projectData = tempData
      uni.removeStorageSync(this.crud.storage.tempKey)
      this.loadFundPool()
    } else {
      this.loadDetail()
    }
  },

  methods: {
    handleBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack({
          delta: 1,
          fail: () => {
            uni.switchTab({ url: '/pages/modules/index' })
          }
        })
      } else {
        uni.switchTab({ url: '/pages/modules/index' })
      }
    },

    getVal(obj, prop) {
      if (!obj || !prop) return ''
      if (prop.indexOf('.') > -1) {
        return prop.split('.').reduce((acc, k) => (acc ? acc[k] : undefined), obj)
      }
      return obj[prop]
    },

    async loadFundPool() {
      const res = await this.crud.api.fundPool({ proId: this.projectId })
      if (res && res.success) {
        const list = (res.result && (res.result.records || res.result.list)) || []
        this.fundPoolData = list.length ? list[0] : null
      }
    },

    async loadDetail() {
      this.loading = true
      try {
        const detailRes = await this.crud.api.detail(this.projectId)
        const fundRes = await this.crud.api.fundPool({ proId: this.projectId })
        if (detailRes && detailRes.success) {
          this.projectData = detailRes.result
        }
        if (fundRes && fundRes.success) {
          const list = (fundRes.result && (fundRes.result.records || fundRes.result.list)) || []
          this.fundPoolData = list.length ? list[0] : null
        }
      } finally {
        this.loading = false
      }
    },

    handleChangeLog() {
      uni.navigateTo({ url: `${this.crud.routes.fundChangeLog}?proId=${encodeURIComponent(this.projectId)}` })
    },

    handleEdit() {
      const url = `${this.crud.web.workbenchPath}?id=${encodeURIComponent(this.projectData.uniqueId || '')}&oid=${encodeURIComponent(this.projectId || '')}`
      openWebView(url, this.crud.web.titleWorkbench)
    },

    formatNumber(num) {
      return Number(num || 0).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },

    getOperationTypeText(v) {
      return this.crud.dict.operationType[v] || '-'
    },

    getPaymentMethodText(v) {
      return this.crud.dict.paymentMethod[v] || '-'
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../common/styles/ios-common.scss';

.group {
  margin: 16rpx;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
}

.group-header {
  padding: 20rpx;
}

.project-name {
  font-size: 34rpx;
  font-weight: 600;
}

.project-sub {
  margin-top: 6rpx;
  font-size: 26rpx;
  color: #6e6e73;
}

.group-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
}

.group-item.large {
  flex-direction: column;
  align-items: flex-start;
}

.group-item.section-title {
  font-weight: 600;
}

.label {
  font-size: 24rpx;
  color: #8e8e93;
}

.value {
  font-size: 26rpx;
  color: #1c1c1e;
}

/* 这里保持你原来的负数色 */
.value.negative {
  color: #ff3b30;
}

/* balance 特殊字体（通过 valueClass 复用） */
.balance-value {
  margin-top: 6rpx;
  font-size: 40rpx;
  font-weight: 600;
}

/* Divider */
.divider {
  height: 1rpx;
  background: rgba(0, 0, 0, .06);
  margin-left: 20rpx;
}

/* Bottom actions */
.bottom-safe {
  position: sticky;
  bottom: 0;
  background: #f2f2f7;
  padding-bottom: env(safe-area-inset-bottom);
}

.bottom-actions {
  display: flex;
  gap: 12rpx;
  padding: 12rpx 16rpx 16rpx;
}

.btn {
  flex: 1;
  height: 72rpx;
  border-radius: 18rpx;
  font-size: 26rpx;
}

.btn::after {
  border: none;
}

.btn.ios-secondary {
  background: #ededf0;
  color: #1c1c1e;
}

.btn.ios-primary {
  background: #ffffff;
  color: #0a84ff;
  box-shadow: 0 0 0 1rpx rgba(0, 0, 0, .06) inset;
}

/* Loading */
.loading {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}
</style>
