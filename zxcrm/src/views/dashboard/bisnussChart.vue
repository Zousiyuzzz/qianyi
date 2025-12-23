<template>
  <div class="dashboard-container">

    <!-- 关键指标卡片 -->
    <div class="metrics-grid">
      <!-- 充值金额 -->
      <div class="metric-card">
        <div v-if="topLoading" class="loading-overlay">
          <a-spin size="large" />
          <p>加载中...</p>
        </div>
        <div class="metric-header">
          <div class="metric-info">
            <p class="metric-label">充值金额</p>
            <h3 class="metric-value">¥{{ rechargeAmount.toFixed(3) }}</h3>
          </div>
          <div class="metric-icon">
            <a-icon type="dollar" />
          </div>
        </div>
        <div class="metric-trend">
          <span class="trend-indicator" :class="rechargeAmountTrendDirection">
            <a-icon :type="rechargeAmountTrendDirection === 'up' ? 'arrow-up' : 'arrow-down'" />
            {{ rechargeAmountTrendPercentage }}
          </span>
          <span class="trend-label">较对比周期</span>
        </div>
      </div>

      <!-- 交易金额 -->
      <div class="metric-card">
        <div v-if="topLoading" class="loading-overlay">
          <a-spin size="large" />
          <p>加载中...</p>
        </div>
        <div class="metric-header">
          <div class="metric-info">
            <p class="metric-label">交易金额</p>
            <h3 class="metric-value">¥{{ rechargeChangeMoney.toFixed(3) }}</h3>
          </div>
          <div class="metric-icon">
            <a-icon type="wallet" />
          </div>
        </div>
        <div class="metric-trend">
          <span class="trend-indicator" :class="rechargeChangeMoneyTrendDirection">
            <a-icon :type="rechargeChangeMoneyTrendDirection === 'up' ? 'arrow-up' : 'arrow-down'" />
            {{ rechargeChangeMoneyTrendPercentage }}
          </span>
          <span class="trend-label">较对比周期</span>
        </div>
      </div>

      <!-- 充值账户数 -->
      <div class="metric-card">
        <div v-if="topLoading" class="loading-overlay">
          <a-spin size="large" />
          <p>加载中...</p>
        </div>
        <div class="metric-header">
          <div class="metric-info">
            <p class="metric-label">充值账户数</p>
            <h3 class="metric-value">{{ rechargeAccountNum }}</h3>
          </div>
          <div class="metric-icon">
            <a-icon type="team" />
          </div>
        </div>
        <div class="metric-trend">
          <span class="trend-indicator" :class="rechargeAccountNumTrendDirection">
            <a-icon :type="rechargeAccountNumTrendDirection === 'up' ? 'arrow-up' : 'arrow-down'" />
            {{ rechargeAccountNumTrendPercentage }}
          </span>
          <span class="trend-label">较对比周期</span>
        </div>
      </div>

      <!-- 退款金额 -->
      <div class="metric-card">
        <div v-if="topLoading" class="loading-overlay">
          <a-spin size="large" />
          <p>加载中...</p>
        </div>
        <div class="metric-header">
          <div class="metric-info">
            <p class="metric-label">退款金额</p>
            <h3 class="metric-value">¥{{ refundAmount.toFixed(3) }}</h3>
          </div>
          <div class="metric-icon">
            <a-icon type="rollback" />
          </div>
        </div>
        <div class="metric-trend">
          <span class="trend-indicator" :class="refundAmountTrendDirection">
            <a-icon :type="refundAmountTrendDirection === 'up' ? 'arrow-up' : 'arrow-down'" />
            {{ refundAmountTrendPercentage }}
          </span>
          <span class="trend-label">较对比周期</span>
        </div>
      </div>

      <!-- 退款交易金额 -->
      <div class="metric-card">
        <div v-if="topLoading" class="loading-overlay">
          <a-spin size="large" />
          <p>加载中...</p>
        </div>
        <div class="metric-header">
          <div class="metric-info">
            <p class="metric-label">退款交易金额</p>
            <h3 class="metric-value">¥{{ refundChangeMoney.toFixed(3) }}</h3>
          </div>
          <div class="metric-icon">
            <a-icon type="transaction" />
          </div>
        </div>
        <div class="metric-trend">
          <span class="trend-indicator" :class="refundChangeMoneyTrendDirection">
            <a-icon :type="refundChangeMoneyTrendDirection === 'up' ? 'arrow-up' : 'arrow-down'" />
            {{ refundChangeMoneyTrendPercentage }}
          </span>
          <span class="trend-label">较对比周期</span>
        </div>
      </div>

      <!-- 退款账户数 -->
      <div class="metric-card">
        <div v-if="topLoading" class="loading-overlay">
          <a-spin size="large" />
          <p>加载中...</p>
        </div>
        <div class="metric-header">
          <div class="metric-info">
            <p class="metric-label">退款账户数</p>
            <h3 class="metric-value">{{ refundAccountNum }}</h3>
          </div>
          <div class="metric-icon">
            <a-icon type="user-delete" />
          </div>
        </div>
        <div class="metric-trend">
          <span class="trend-indicator" :class="refundAccountNumTrendDirection">
            <a-icon :type="refundAccountNumTrendDirection === 'up' ? 'arrow-up' : 'arrow-down'" />
            {{ refundAccountNumTrendPercentage }}
          </span>
          <span class="trend-label">较对比周期</span>
        </div>
      </div>
    </div>

    <!-- 图表和明细区域 -->
    <div class="charts-section">
      <!-- 日报 -->
      <div class="chart-card">
        <div v-if="dailyReportLoading" class="loading-overlay">
          <a-spin size="large" />
          <p>加载中...</p>
        </div>
        <div class="chart-header">
          <h3 class="chart-title">日报</h3>
          <div class="filter-controls">
            <a-range-picker v-model="dailyReportDateRange" :placeholder="['开始日期', '结束日期']"
              @change="onDailyReportDateChange" style="margin-right: 10px; width: 210px;" format="YYYY-MM-DD"
              value-format="YYYY-MM-DD" />
            <a-select v-model="dailyReportMediaFilter" placeholder="选择媒体" style="width: 120px; margin-right: 10px;"
              @change="onDailyReportMediaChange" allowClear>
              <a-select-option value="">全部媒体</a-select-option>
              <a-select-option v-for="media in mediaOptions" :key="media.value" :value="media.value">
                {{ media.label }}
              </a-select-option>
            </a-select>
            <a-select v-model="dailyReportOperationTypeFilter" placeholder="选择运营类型"
              style="width: 120px; margin-right: 10px;" @change="onDailyReportOperationTypeChange" allowClear>
              <a-select-option value="">全部运营类型</a-select-option>
              <a-select-option v-for="type in operationTypeOptions" :key="type.value" :value="type.value">
                {{ type.label }}
              </a-select-option>
            </a-select>
            <a-button type="primary" @click="refreshDailyReportList" :loading="dailyReportLoading">
              刷新
            </a-button>
            <a-button type="default" @click="downloadDailyReportAsImage" :loading="downloadLoading">
              <a-icon type="download" />
              下载图片
            </a-button>
          </div>
        </div>
        <div class="chart-container">
          <div class="daily-report-table">
            <table>
              <thead>
                <tr>
                  <th>项目名称</th>
                  <th>运营类型</th>
                  <th>渠道</th>
                  <th colspan="2">{{ formatDateDisplay(dailyReportDateRange && dailyReportDateRange[0]) }}</th>
                  <th colspan="2">{{ formatDateDisplay(dailyReportDateRange && dailyReportDateRange[1]) }}</th>
                  <th colspan="2">环比</th>
                  <!-- <th>媒体</th> -->
                </tr>
                <tr>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th>充值</th>
                  <th>退款</th>
                  <th>充值</th>
                  <th>退款</th>
                  <th>充值</th>
                  <th>退款</th>
                  <!-- <th></th> -->
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in dailyReportList" :key="index">
                  <td>{{ item.name }}</td>
                  <td>{{ getOperationTypeText(item.operationType) }}</td>
                  <td>
                    <j-dict-name-display :value="item.channelSign" dictCode="channelSign_system" placeholder="未知渠道" />
                  </td>
                  <td class="amount recharge">¥{{ formatNumber(item.date1Recharge || 0) }}</td>
                  <td class="amount refund">¥{{ formatNumber(item.date1Refund || 0) }}</td>
                  <td class="amount recharge">¥{{ formatNumber(item.date2Recharge || 0) }}</td>
                  <td class="amount refund">¥{{ formatNumber(item.date2Refund || 0) }}</td>
                  <td class="comparison recharge" :class="getComparisonClass(item.rechargeComparison)">
                    {{ formatComparison(item.rechargeComparison) }}
                  </td>
                  <td class="comparison refund" :class="getComparisonClass(item.refundComparison)">
                    {{ formatComparison(item.refundComparison) }}
                  </td>
                  <!-- <td>{{ getMediaByChannel(item.channelSign) }}</td> -->
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 渠道明细 -->
      <div class="rank-card">
        <div v-if="rankLoading" class="loading-overlay">
          <a-spin size="large" />
          <p>加载中...</p>
        </div>
        <h3 class="rank-title">{{ String(filterType) === 'recharge' ? '渠道充值明细' : '渠道退款明细' }}</h3>
        <div class="rank-list">
          <div v-for="(item, index) in currentChannelRankList" :key="index" class="rank-item">
            <div class="rank-info">
              <div class="rank-number" :class="getRankClass(index + 1)">{{ index + 1 }}</div>
              <span class="rank-name">
                <j-dict-name-display :value="item.name" dictCode="channelSign_system" placeholder="未知渠道" />
              </span>
            </div>
            <span class="rank-value">¥{{ formatNumber(item.total) }}</span>
          </div>
        </div>
      </div>

      <!-- 项目明细 -->
      <div class="rank-card">
        <div v-if="rankLoading" class="loading-overlay">
          <a-spin size="large" />
          <p>加载中...</p>
        </div>
        <h3 class="rank-title">{{ String(filterType) === 'recharge' ? '项目充值明细' : '项目退款明细' }}</h3>
        <div class="rank-list">
          <div v-for="(item, index) in currentProRankList" :key="index" class="rank-item">
            <div class="rank-info">
              <div class="rank-number" :class="getRankClass(index + 1)">{{ index + 1 }}</div>
              <span class="rank-name">{{ item.name }}</span>
            </div>
            <span class="rank-value">¥{{ formatNumber(item.total) }}</span>
          </div>
        </div>
      </div>
    </div>



    <!-- 商务明细 -->
    <div class="business-rank-section">
      <div v-if="rankLoading" class="loading-overlay">
        <a-spin size="large" />
        <p>加载中...</p>
      </div>
      <h3 class="business-rank-title">{{ String(filterType) === 'recharge' ? '商务充值明细' : '商务退款明细' }}</h3>
      <div class="business-rank-table">
        <table>
          <thead>
            <tr>
              <th>排名</th>
              <th>商务名称</th>
              <th>{{ String(filterType) === 'recharge' ? '充值金额' : '退款金额' }}</th>
              <th>{{ String(filterType) === 'recharge' ? '交易金额' : '交易金额' }}</th>
              <!-- <th>新开主体数</th> -->
              <!-- <th>有花费账户数</th> -->
              <!-- <th>操作</th> -->
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in currentBusRankList" :key="index">
              <td>
                <div class="rank-number" :class="getRankClass(index + 1)">{{ index + 1 }}</div>
              </td>
              <td>{{ item.name }}</td>
              <td class="amount">¥{{ formatNumber(item.amount || 0) }}</td>
              <td class="amount">¥{{ formatNumber(item.changeMoney || 0) }}</td>
              <!-- <td>{{ item.newSubjectNum || 0 }}</td> -->
              <!-- <td>{{ item.businessPerson || 0 }}</td> -->
              <!-- <td>
                <button class="detail-button">详情</button>
              </td> -->
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { httpAction } from '@/api/manage';
import RankList from '@/components/chart/RankList';
import PlatformTotal from './components/platformTotal.vue';
import JDictNameDisplay from '@/components/dict/JDictNameDisplay.vue';
import { mixinDevice } from '@/utils/mixin.js'

function getYesterday(num = 1) {
  const date = new Date();
  date.setDate(date.getDate() - num);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default {
  name: 'BisnussChart',
  components: {
    RankList,
    JDictNameDisplay,
    PlatformTotal
  },
  mixins: [mixinDevice],
  props: {
    dateRange: {
      type: Array,
      required: true
    },
    compareDateRange: {
      type: Array,
      required: true
    },
    businessIds: {
      type: String,
      default: ''
    },
    filterType: {
      type: String,
      default: 'recharge'
    }
  },
  data() {
    return {
      // 加载状态
      topLoading: true,
      pendingTopRequests: 0,
      rankLoading: true,

      // 当前周期数据
      rechargeAmount: 0,
      rechargeChangeMoney: 0,
      rechargeAccountNum: 0,
      refundAmount: 0,
      refundChangeMoney: 0,
      refundAccountNum: 0,

      // 对比周期数据
      rechargeAmountLast: 0,
      rechargeChangeMoneyLast: 0,
      rechargeAccountNumLast: 0,
      refundAmountLast: 0,
      refundChangeMoneyLast: 0,
      refundAccountNumLast: 0,



      // 充值明细数据
      busRankList: [],
      proRankList: [],
      channelRankList: [],

      // 退款明细数据
      refundBusRankList: [],
      refundProRankList: [],
      refundChannelRankList: [],

      // 日报相关数据
      dailyReportList: [], // 日报数据列表
      dailyReportDateRange: [], // 日报日期范围
      dailyReportMediaFilter: '', // 日报媒体筛选
      dailyReportOperationTypeFilter: '', // 日报运营类型筛选
      dailyReportLoading: false, // 日报加载状态
      downloadLoading: false, // 下载状态
      mediaOptions: [
        { value: '头条', label: '头条' },
        { value: '腾讯', label: '腾讯' },
        { value: '快手', label: '快手' },
        { value: '超级汇川', label: '超级汇川' },
        { value: '小红书', label: '小红书' },
        { value: '哔哩哔哩', label: '哔哩哔哩' },
        { value: '其他', label: '其他' }
      ],
      operationTypeOptions: [
        { value: 1, label: '自运营' },
        { value: 2, label: '走量' },
        { value: 3, label: '收量' }
      ],

      // API请求配置
      apiRequests: {
        topData: {
          url: '/fundTransferRecord/summaryData',
          method: 'GET',
          params: {}
        },
        rechargeRankingData: {
          url: '/fundTransferRecord/rechargeRankingData',
          method: 'GET',
          params: {}
        },
        refundRankingData: {
          url: '/fundTransferRecord/refundRankingData',
          method: 'GET',
          params: {}
        },
        rechargeDataPro: {
          url: '/fundTransferRecord/rechargeDataPro',
          method: 'GET',
          params: {}
        },
        refundDataPro: {
          url: '/fundTransferRecord/refundDataPro',
          method: 'GET',
          params: {}
        }
      }
    };
  },
  computed: {
    // 充值金额趋势
    rechargeAmountTrendPercentage() {
      if (this.rechargeAmountLast === 0) return '0%';
      const change = ((this.rechargeAmount - this.rechargeAmountLast) / this.rechargeAmountLast) * 100;
      return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
    },
    rechargeAmountTrendDirection() {
      if (this.rechargeAmountLast === 0) return 'down';
      return this.rechargeAmount > this.rechargeAmountLast ? 'up' : 'down';
    },
    // 交易金额趋势
    rechargeChangeMoneyTrendPercentage() {
      if (this.rechargeChangeMoneyLast === 0) return '0%';
      const change = ((this.rechargeChangeMoney - this.rechargeChangeMoneyLast) / this.rechargeChangeMoneyLast) * 100;
      return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
    },
    rechargeChangeMoneyTrendDirection() {
      if (this.rechargeChangeMoneyLast === 0) return 'down';
      return this.rechargeChangeMoney > this.rechargeChangeMoneyLast ? 'up' : 'down';
    },
    // 充值账户数趋势
    rechargeAccountNumTrendPercentage() {
      if (this.rechargeAccountNumLast === 0) return '0%';
      const change = ((this.rechargeAccountNum - this.rechargeAccountNumLast) / this.rechargeAccountNumLast) * 100;
      return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
    },
    rechargeAccountNumTrendDirection() {
      if (this.rechargeAccountNumLast === 0) return 'down';
      return this.rechargeAccountNum > this.rechargeAccountNumLast ? 'up' : 'down';
    },
    // 退款金额趋势
    refundAmountTrendPercentage() {
      if (this.refundAmountLast === 0) return '0%';
      const change = ((this.refundAmount - this.refundAmountLast) / this.refundAmountLast) * 100;
      return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
    },
    refundAmountTrendDirection() {
      if (this.refundAmountLast === 0) return 'down';
      return this.refundAmount > this.refundAmountLast ? 'up' : 'down';
    },
    // 退款交易金额趋势
    refundChangeMoneyTrendPercentage() {
      if (this.refundChangeMoneyLast === 0) return '0%';
      const change = ((this.refundChangeMoney - this.refundChangeMoneyLast) / this.refundChangeMoneyLast) * 100;
      return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
    },
    refundChangeMoneyTrendDirection() {
      if (this.refundChangeMoneyLast === 0) return 'down';
      return this.refundChangeMoney > this.refundChangeMoneyLast ? 'up' : 'down';
    },
    // 退款账户数趋势
    refundAccountNumTrendPercentage() {
      if (this.refundAccountNumLast === 0) return '0%';
      const change = ((this.refundAccountNum - this.refundAccountNumLast) / this.refundAccountNumLast) * 100;
      return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
    },
    refundAccountNumTrendDirection() {
      if (this.refundAccountNumLast === 0) return 'down';
      return this.refundAccountNum > this.refundAccountNumLast ? 'up' : 'down';
    },
    // 动态数据计算属性
    currentBusRankList() {
      const filterType = String(this.filterType);
      return filterType === 'recharge' ? this.busRankList : this.refundBusRankList;
    },
    currentProRankList() {
      const filterType = String(this.filterType);
      return filterType === 'recharge' ? this.proRankList : this.refundProRankList;
    },
    currentChannelRankList() {
      const filterType = String(this.filterType);
      return filterType === 'recharge' ? this.channelRankList : this.refundChannelRankList;
    },

    // 净收入趋势
    netAmountTrendPercentage() {
      const currentNet = this.rechargeAmount - this.refundAmount;
      const lastNet = this.rechargeAmountLast - this.refundAmountLast;
      if (lastNet === 0) return '0%';
      const change = ((currentNet - lastNet) / lastNet) * 100;
      return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
    },
    netAmountTrendDirection() {
      const currentNet = this.rechargeAmount - this.refundAmount;
      const lastNet = this.rechargeAmountLast - this.refundAmountLast;
      if (lastNet === 0) return 'down';
      return currentNet > lastNet ? 'up' : 'down';
    }
  },
  created() {
    // 默认日期范围由父组件设置，子组件不再修改，避免重复请求
    // 顶部卡片并行加载两个日期区间的数据
    this.topLoading = true;
    this.pendingTopRequests = 2;
    this.getTopData();
    this.getYesterdayTopData();
    // 同时获取充值和退款数据
    this.getRechargeRankList();
    this.getRefundRankList();

    // 设置日报默认日期范围为前天-昨天
    const yesterday = this.getYesterday(1);
    const dayBeforeYesterday = this.getYesterday(2);
    this.dailyReportDateRange = [dayBeforeYesterday, yesterday];

    // 初始化日报数据
    this.$nextTick(() => {
      this.getDailyReportList();
    });
  },
  mounted() { },
  watch: {
    dateRange: {
      handler(newVal) {
        if (newVal && newVal.length === 2) {
          this.getRechargeRankList();
          this.getRefundRankList();
          this.getTopData();
        }
      },
      deep: true
    },
    compareDateRange: {
      handler(newVal) {
        if (newVal && newVal.length === 2) {
          this.getYesterdayTopData();
        }
      },
      deep: true
    },
    businessIds: {
      handler(newVal) {
        this.getTopData();
        this.getYesterdayTopData();
        this.getRechargeRankList();
        this.getRefundRankList();
      }
    },
    filterType: {
      handler(newVal, oldVal) {
        // 当筛选类型变化时，不需要重新请求数据，因为数据已经加载了
        // 只需要切换显示的数据即可
        // console.log('筛选类型变化:', newVal, '之前:', oldVal, '类型:', typeof newVal);
      }
    }
  },
  methods: {
    sectorClick(p) { },
    /**
     * 顶部数据
     * newAccountNum 新开账户数
     * sumConsume 总消耗
     * consumeAccountNum 有消耗账户数
     */
    getTopData() {
      const requestConfig = this.apiRequests.topData;
      requestConfig.params = {
        beginDate: this.dateRange[0],
        endDate: this.dateRange[1],
        ...(this.businessIds && { channelSign: this.businessIds })
      };

      httpAction(requestConfig.url, requestConfig.params, requestConfig.method)
        .then((res) => {
          if (res.success) {
            // 充值数据
            this.rechargeAmount = (res.result && res.result.rechargeSummary && res.result.rechargeSummary.amount) || 0;
            this.rechargeChangeMoney = (res.result && res.result.rechargeSummary && res.result.rechargeSummary.changeMoney) || 0;
            this.rechargeAccountNum = (res.result && res.result.rechargeSummary && res.result.rechargeSummary.accountNum) || 0;

            // 退款数据
            this.refundAmount = (res.result && res.result.refundSummary && res.result.refundSummary.amount) || 0;
            this.refundChangeMoney = (res.result && res.result.refundSummary && res.result.refundSummary.changeMoney) || 0;
            this.refundAccountNum = (res.result && res.result.refundSummary && res.result.refundSummary.accountNum) || 0;
          } else {
            this.$message.warning(res.message);
          }
        })
        .finally(() => {
          this.pendingTopRequests = Math.max(0, this.pendingTopRequests - 1);
          if (this.pendingTopRequests === 0) this.topLoading = false;
        });
    },
    getYesterdayTopData() {
      const requestConfig = this.apiRequests.topData;
      requestConfig.params = {
        beginDate: this.compareDateRange[0],
        endDate: this.compareDateRange[1],
        ...(this.businessIds && { channelSign: this.businessIds })
      };

      httpAction(requestConfig.url, requestConfig.params, requestConfig.method)
        .then((res) => {
          if (res.success) {
            // 充值数据
            this.rechargeAmountLast = (res.result && res.result.rechargeSummary && res.result.rechargeSummary.amount) || 0;
            this.rechargeChangeMoneyLast = (res.result && res.result.rechargeSummary && res.result.rechargeSummary.changeMoney) || 0;
            this.rechargeAccountNumLast = (res.result && res.result.rechargeSummary && res.result.rechargeSummary.accountNum) || 0;

            // 退款数据
            this.refundAmountLast = (res.result && res.result.refundSummary && res.result.refundSummary.amount) || 0;
            this.refundChangeMoneyLast = (res.result && res.result.refundSummary && res.result.refundSummary.changeMoney) || 0;
            this.refundAccountNumLast = (res.result && res.result.refundSummary && res.result.refundSummary.accountNum) || 0;
          } else {
            this.$message.warning(res.message);
          }
        })
        .finally(() => {
          this.pendingTopRequests = Math.max(0, this.pendingTopRequests - 1);
          if (this.pendingTopRequests === 0) this.topLoading = false;
        });
    },

    // 获取充值排行榜数据
    getRechargeRankList() {
      this.rankLoading = true;
      const requestConfig = this.apiRequests.rechargeRankingData;
      requestConfig.params = {
        beginDate: this.dateRange[0],
        endDate: this.dateRange[1],
        ...(this.businessIds && { channelSign: this.businessIds })
      };

      httpAction(requestConfig.url, requestConfig.params, requestConfig.method)
        .then((res) => {
          if (res.success) {
            //项目
            this.proRankList = res.result.rechargeRankingDataPro.map(item => {
              return {
                ...item,
                name: item.proName,
                total: item.amount
              }
            })
            //销售
            this.busRankList = res.result.rechargeRankingDataBusiness.map(item => {
              return {
                ...item,
                name: item.realname,
                total: item.amount
              }
            })
            //渠道
            this.channelRankList = res.result.rechargeRankingDataChannel.map(item => {
              return {
                ...item,
                name: item.channelSign,
                total: item.amount
              }
            })
          } else {
            this.$message.warning(res.message);
          }
        })
        .catch((error) => {
          // console.log('获取充值明细数据失败', error)
          this.$message.error('获取充值明细数据失败');
        })
        .finally(() => {
          this.rankLoading = false;
        });
    },

    // 获取退款排行榜数据
    getRefundRankList() {
      this.rankLoading = true;
      const requestConfig = this.apiRequests.refundRankingData;
      requestConfig.params = {
        beginDate: this.dateRange[0],
        endDate: this.dateRange[1],
        ...(this.businessIds && { channelSign: this.businessIds })
      };

      httpAction(requestConfig.url, requestConfig.params, requestConfig.method)
        .then((res) => {
          if (res.success) {
            // 根据实际返回的数据结构调整字段名
            const result = res.result || {};

            //项目 - 尝试不同的字段名
            const proData = result.refundRankingDataPro || result.rechargeRankingDataPro || [];
            this.refundProRankList = proData.map(item => {
              return {
                ...item,
                name: item.proName || item.name,
                total: item.amount || 0
              }
            })

            //销售 - 尝试不同的字段名
            const businessData = result.refundRankingDataBusiness || result.rechargeRankingDataBusiness || [];
            this.refundBusRankList = businessData.map(item => {
              return {
                ...item,
                name: item.realname || item.name,
                total: item.amount || 0
              }
            })

            //渠道 - 尝试不同的字段名
            const channelData = result.refundRankingDataChannel || result.rechargeRankingDataChannel || [];
            this.refundChannelRankList = channelData.map(item => {
              return {
                ...item,
                name: item.channelSign,
                total: item.amount || 0
              }
            })
          } else {
            this.$message.warning(res.message);
          }
        })
        .catch((error) => {
          // console.log('获取退款明细数据失败', error)
          this.$message.error('获取退款明细数据失败');
        })
        .finally(() => {
          this.rankLoading = false;
        });
    },

    // 获取排行榜数据（根据筛选类型）
    getRankList() {
      if (this.filterType === 'recharge') {
        this.getRechargeRankList();
      } else {
        this.getRefundRankList();
      }
    },



    // 新增方法
    refreshData() {
      this.getTopData();
      this.getYesterdayTopData();
      this.getRechargeRankList();
      this.getRefundRankList();
    },

    formatNumber(num) {
      return new Intl.NumberFormat('zh-CN').format(num);
    },

    getRankClass(rank) {
      if (rank >= 1 && rank <= 10) {
        return `rank-${rank}`;
      }
      return 'rank-other';
    },

    // 日报相关方法
    getDailyReportList() {
      // console.log('开始获取日报数据...');
      // console.log('日报日期范围:', this.dailyReportDateRange);

      this.dailyReportLoading = true;

      if (!this.dailyReportDateRange || this.dailyReportDateRange.length !== 2) {
        // console.log('日报日期范围无效，跳过请求');
        this.dailyReportLoading = false;
        return;
      }

      // 获取两个日期
      const date1 = this.formatDate(this.dailyReportDateRange[0]);
      const date2 = this.formatDate(this.dailyReportDateRange[1]);

      // console.log('请求日期1:', date1);
      // console.log('请求日期2:', date2);

      // 同时请求充值和退款接口，每个日期4个请求
      const rechargeRequest1 = httpAction(this.apiRequests.rechargeDataPro.url, {
        beginDate: date1,
        endDate: date1,
        ...(this.businessIds && { channelSign: this.businessIds })
      }, 'GET');

      const refundRequest1 = httpAction(this.apiRequests.refundDataPro.url, {
        beginDate: date1,
        endDate: date1,
        ...(this.businessIds && { channelSign: this.businessIds })
      }, 'GET');

      const rechargeRequest2 = httpAction(this.apiRequests.rechargeDataPro.url, {
        beginDate: date2,
        endDate: date2,
        ...(this.businessIds && { channelSign: this.businessIds })
      }, 'GET');

      const refundRequest2 = httpAction(this.apiRequests.refundDataPro.url, {
        beginDate: date2,
        endDate: date2,
        ...(this.businessIds && { channelSign: this.businessIds })
      }, 'GET');

      // 并行请求所有数据
      Promise.all([rechargeRequest1, refundRequest1, rechargeRequest2, refundRequest2])
        .then(([rechargeRes1, refundRes1, rechargeRes2, refundRes2]) => {
          // 输出接口返回的JSON数据
          // console.log('充值/退款日报接口返回数据:');
          // console.log('第一个日期充值数据:', JSON.stringify(rechargeRes1, null, 2));
          // console.log('第一个日期退款数据:', JSON.stringify(refundRes1, null, 2));
          // console.log('第二个日期充值数据:', JSON.stringify(rechargeRes2, null, 2));
          // console.log('第二个日期退款数据:', JSON.stringify(refundRes2, null, 2));

          // 处理数据
          const date1RechargeData = rechargeRes1.success && rechargeRes1.result ? rechargeRes1.result : [];
          const date1RefundData = refundRes1.success && refundRes1.result ? refundRes1.result : [];
          const date2RechargeData = rechargeRes2.success && rechargeRes2.result ? rechargeRes2.result : [];
          const date2RefundData = refundRes2.success && refundRes2.result ? refundRes2.result : [];

          // console.log('处理后的数据:');
          // console.log('第一个日期充值数据:', date1RechargeData);
          // console.log('第一个日期退款数据:', date1RefundData);
          // console.log('第二个日期充值数据:', date2RechargeData);
          // console.log('第二个日期退款数据:', date2RefundData);

          // 合并充值和退款数据
          this.processDailyReportData(date1RechargeData, date1RefundData, date2RechargeData, date2RefundData);
        })
        .catch((error) => {
          // console.log('获取日报数据失败', error);
          this.$message.error('获取日报数据失败');
        })
        .finally(() => {
          this.dailyReportLoading = false;
        });
    },

    // 处理日报数据对比 - 合并充值和退款数据
    processDailyReportData(date1RechargeData, date1RefundData, date2RechargeData, date2RefundData) {
      // console.log('开始处理日报数据对比...');

      // 创建项目映射，用于匹配两个日期的数据
      const projectMap = new Map();

      // 处理第一个日期的充值数据
      date1RechargeData.forEach(item => {
        const projectId = item.pro_id;
        const channelSign = item.channel_sign || '';
        const uniqueKey = `${projectId}_${channelSign}`;

        projectMap.set(uniqueKey, {
          name: item.pro_name || '未知项目',
          date1Recharge: item.amount || 0,
          date1Refund: 0,
          date2Recharge: 0,
          date2Refund: 0,
          date1Net: 0, // 净收入 = 充值 - 退款
          date2Net: 0,
          comparison: 0,
          projectId: item.pro_id,
          channelSign: channelSign,
          operationType: item.operation_type || '',
        });
      });

      // 处理第一个日期的退款数据
      date1RefundData.forEach(item => {
        const projectId = item.pro_id;
        const channelSign = item.channel_sign || '';
        const uniqueKey = `${projectId}_${channelSign}`;

        if (projectMap.has(uniqueKey)) {
          const existing = projectMap.get(uniqueKey);
          existing.date1Refund = item.amount || 0;
        } else {
          projectMap.set(uniqueKey, {
            name: item.pro_name || '未知项目',
            date1Recharge: 0,
            date1Refund: item.amount || 0,
            date2Recharge: 0,
            date2Refund: 0,
            date1Net: 0,
            date2Net: 0,
            comparison: 0,
            projectId: item.pro_id,
            channelSign: channelSign,
            operationType: item.operation_type || '',
          });
        }
      });

      // 处理第二个日期的充值数据
      date2RechargeData.forEach(item => {
        const projectId = item.pro_id;
        const channelSign = item.channel_sign || '';
        const uniqueKey = `${projectId}_${channelSign}`;

        if (projectMap.has(uniqueKey)) {
          const existing = projectMap.get(uniqueKey);
          existing.date2Recharge = item.amount || 0;
        } else {
          projectMap.set(uniqueKey, {
            name: item.pro_name || '未知项目',
            date1Recharge: 0,
            date1Refund: 0,
            date2Recharge: item.amount || 0,
            date2Refund: 0,
            date1Net: 0,
            date2Net: 0,
            comparison: 0,
            projectId: item.pro_id,
            channelSign: channelSign,
            operationType: item.operation_type || '',
          });
        }
      });

      // 处理第二个日期的退款数据
      date2RefundData.forEach(item => {
        const projectId = item.pro_id;
        const channelSign = item.channel_sign || '';
        const uniqueKey = `${projectId}_${channelSign}`;

        if (projectMap.has(uniqueKey)) {
          const existing = projectMap.get(uniqueKey);
          existing.date2Refund = item.amount || 0;
        } else {
          projectMap.set(uniqueKey, {
            name: item.pro_name || '未知项目',
            date1Recharge: 0,
            date1Refund: 0,
            date2Recharge: 0,
            date2Refund: item.amount || 0,
            date1Net: 0,
            date2Net: 0,
            comparison: 0,
            projectId: item.pro_id,
            channelSign: channelSign,
            operationType: item.operation_type || '',
          });
        }
      });

      // 计算净收入和环比
      projectMap.forEach((item, key) => {
        item.date1Net = item.date1Recharge - item.date1Refund;
        item.date2Net = item.date2Recharge - item.date2Refund;

        // 计算充值环比百分比：(后一日充值 - 前一日充值) / 前一日充值 * 100
        item.rechargeComparison = item.date1Recharge !== 0 ? ((item.date2Recharge - item.date1Recharge) / item.date1Recharge) * 100 : 0;

        // 计算退款环比百分比：(后一日退款 - 前一日退款) / 前一日退款 * 100
        item.refundComparison = item.date1Refund !== 0 ? ((item.date2Refund - item.date1Refund) / item.date1Refund) * 100 : 0;

        // 计算净收入环比百分比：(后一日净收入 - 前一日净收入) / 前一日净收入 * 100
        item.comparison = item.date1Net !== 0 ? ((item.date2Net - item.date1Net) / Math.abs(item.date1Net)) * 100 : 0;
      });

      // 转换为数组格式并按第二个日期净收入排序
      let result = Array.from(projectMap.values())
        .sort((a, b) => (b.date2Net || 0) - (a.date2Net || 0));

      // console.log('处理后的项目数据:', result);

      // 应用媒体筛选
      if (this.dailyReportMediaFilter) {
        result = result.filter(item => {
          const media = this.getMediaByChannel(item.channelSign);
          return media === this.dailyReportMediaFilter;
        });
      }

      // 应用运营类型筛选
      if (this.dailyReportOperationTypeFilter) {
        result = result.filter(item => {
          return item.operationType == this.dailyReportOperationTypeFilter;
        });
      }

      // console.log('最终日报数据:', result);
      this.dailyReportList = result;
    },

    // 日报事件处理方法
    onDailyReportDateChange(dates) {
      this.dailyReportDateRange = dates;
      this.getDailyReportList();
    },

    onDailyReportMediaChange(value) {
      this.dailyReportMediaFilter = value;
      this.getDailyReportList();
    },

    onDailyReportOperationTypeChange(value) {
      this.dailyReportOperationTypeFilter = value;
      this.getDailyReportList();
    },

    refreshDailyReportList() {
      this.getDailyReportList();
    },

    // 格式化日期
    formatDate(date) {
      if (!date) return '';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    // 格式化日期显示（用于表头）
    formatDateDisplay(date) {
      if (!date) return '选择日期';

      // 如果是字符串格式的日期，直接返回格式化后的字符串
      if (typeof date === 'string') {
        return date.replace(/-/g, '/');
      }

      // 如果是Date对象，按原来的逻辑处理
      if (date instanceof Date && !isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
      }

      return '选择日期';
    },

    // 格式化环比数据
    formatComparison(comparison) {
      if (comparison === 0) return '0%';
      return comparison > 0 ? `+${comparison.toFixed(2)}%` : `${comparison.toFixed(2)}%`;
    },

    // 获取环比样式类
    getComparisonClass(comparison) {
      if (comparison === 0) return '';
      return comparison > 0 ? 'positive' : 'negative';
    },

    // 根据渠道标识获取媒体名称
    getMediaByChannel(channelSign) {
      if (!channelSign) return '未知';

      const channelMap = {
        'DY-JLGG': '头条',
        'TX-GDT': '腾讯',
        'CJHC': '超级汇川',
        'KS-CLJN': '快手',
        'DY-JLBDT': '头条',
        'DY-JLQC': '头条',
        'DY-JLXT': '头条',
        'KS-CLJX': '快手',
        'KS-CLYQ': '快手',
        'KS-DJK': '快手',
        'XHS': '小红书',
        'BLBL': '哔哩哔哩',
      };

      return channelMap[channelSign] || '其他';
    },

    // 根据运营类型数值获取对应的文本
    getOperationTypeText(operationType) {
      if (!operationType) return '-';

      const operationTypeMap = {
        1: '自运营',
        2: '走量',
        3: '收量'
      };

      return operationTypeMap[operationType] || '-';
    },

    // 下载日报数据为图片
    downloadDailyReportAsImage() {
      this.downloadLoading = true;

      // 使用 html2canvas 将表格转换为图片
      this.$nextTick(() => {
        const tableElement = document.querySelector('.daily-report-table');
        if (!tableElement) {
          this.$message.error('未找到表格元素');
          this.downloadLoading = false;
          return;
        }

        // 创建一个临时的克隆元素用于截图，避免影响原表格显示
        const clonedElement = tableElement.cloneNode(true);

        // 设置克隆元素的样式，确保能完整显示所有内容
        clonedElement.style.position = 'absolute';
        clonedElement.style.left = '-9999px';
        clonedElement.style.top = '0';
        clonedElement.style.overflow = 'visible';
        clonedElement.style.height = 'auto';
        clonedElement.style.width = tableElement.offsetWidth + 'px';
        clonedElement.style.backgroundColor = '#ffffff';
        clonedElement.style.zIndex = '-1';

        // 将克隆元素添加到页面中
        document.body.appendChild(clonedElement);

        // 获取表格的实际内容高度
        const table = clonedElement.querySelector('table');
        const actualHeight = table ? table.offsetHeight : clonedElement.scrollHeight;

        // 动态引入 html2canvas
        import('html2canvas').then(html2canvas => {
          const canvas = html2canvas.default || html2canvas;

          canvas(clonedElement, {
            backgroundColor: '#ffffff',
            scale: 2, // 提高图片质量
            useCORS: true,
            allowTaint: true,
            width: clonedElement.scrollWidth,
            height: actualHeight,
            scrollX: 0,
            scrollY: 0,
            windowWidth: clonedElement.scrollWidth,
            windowHeight: actualHeight
          }).then(canvas => {
            // 创建下载链接
            const link = document.createElement('a');
            // 根据是否选择媒体和运营类型来生成文件名
            let fileName = `充退日报数据_${this.formatDateForFileName(new Date())}`;
            if (this.dailyReportMediaFilter) {
              fileName += `_${this.dailyReportMediaFilter}`;
            }
            if (this.dailyReportOperationTypeFilter) {
              const operationTypeText = this.getOperationTypeText(this.dailyReportOperationTypeFilter);
              fileName += `_${operationTypeText}`;
            }
            fileName += '.png';
            link.download = fileName;
            link.href = canvas.toDataURL('image/png');

            // 触发下载
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.$message.success('图片下载成功');
            this.downloadLoading = false;
          }).catch(error => {
            console.error('生成图片失败:', error);
            this.$message.error('生成图片失败');
            this.downloadLoading = false;
          }).finally(() => {
            // 清理临时元素
            if (document.body.contains(clonedElement)) {
              document.body.removeChild(clonedElement);
            }
          });
        }).catch(error => {
          console.error('加载html2canvas失败:', error);
          this.$message.error('下载功能暂时不可用');
          this.downloadLoading = false;
          // 清理临时元素
          if (document.body.contains(clonedElement)) {
            document.body.removeChild(clonedElement);
          }
        });
      });
    },

    // 格式化文件名中的日期
    formatDateForFileName(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}${month}${day}_${hours}${minutes}`;
    },

    // 获取指定天数的日期字符串（与父组件保持一致）
    getYesterday(num = 1) {
      const date = new Date();
      date.setDate(date.getDate() - num);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },


  },
};
</script>

<style lang="less" scoped>
.dashboard-container {
  margin-top: 10px;
  font-family: 'Inter', system-ui, sans-serif;
  min-height: 100vh;
}



/* 关键指标卡片 */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.metric-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 20px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.metric-info {
  flex: 1;
}

.metric-label {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.metric-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(22, 93, 255, 0.1);
  color: #165dff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  .metric-card:hover & {
    background: #165dff;
    color: white;
  }
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 8px;
}

.trend-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;

  &.up {
    color: #dc2626;
  }

  &.down {
    color: #16a34a;
  }

  .anticon {
    font-size: 12px;
  }
}

.trend-label {
  font-size: 12px;
  color: #9ca3af;
}



/* 图表和明细区域 */
.charts-section {
  display: grid;
  grid-template-columns: 1.8fr 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.chart-card,
.rank-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 20px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-controls .ant-date-picker,
.filter-controls .ant-select {
  margin-right: 10px;
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  width: fit-content;
  text-wrap: nowrap;
  margin-right: 10px;
}

.chart-container {
  height: auto;
  min-height: 320px;
}

.daily-report-table {
  overflow-x: auto;
  height: 400px;
  overflow-y: auto;
}

.daily-report-table table {
  width: 100%;
  border-collapse: collapse;
}

.daily-report-table th {
  padding: 8px 12px;
  text-align: left;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #f3f4f6;
  white-space: nowrap;
}

/* 项目名称列不折行，其他列紧凑 */
.daily-report-table th:first-child,
.daily-report-table td:first-child {
  min-width: 150px;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.daily-report-table td {
  padding: 8px 12px;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s ease;
  font-size: 12px;
  white-space: nowrap;
}

.daily-report-table tr:hover td {
  background: #f9fafb;
}

.daily-report-table .amount {
  font-weight: 500;
  color: #1f2937;
}

.daily-report-table .amount.recharge {
  color: #16a34a;
  /* 绿色表示充值 */
}

.daily-report-table .amount.refund {
  color: #dc2626;
  /* 红色表示退款 */
}

.daily-report-table .comparison {
  font-weight: 500;
  color: #1f2937;

  &.positive {
    color: #16a34a;
  }

  &.negative {
    color: #dc2626;
  }

  &.recharge {
    &.positive {
      color: #16a34a;
      /* 充值增长用绿色 */
    }

    &.negative {
      color: #dc2626;
      /* 充值下降用红色 */
    }
  }

  &.refund {
    &.positive {
      color: #dc2626;
      /* 退款增长用红色（表示退款增加） */
    }

    &.negative {
      color: #16a34a;
      /* 退款下降用绿色（表示退款减少） */
    }
  }
}

.rank-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 20px 0;
}

.rank-list {
  max-height: none;
  overflow-y: visible;
  height: 300px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    display: none;
  }
}

.rank-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  margin-bottom: 10px;

  &:hover {
    background: #ebebeb;
  }
}

.rank-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rank-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  color: white;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;

  &.rank-1 {
    background: #dc2626;
  }

  &.rank-2 {
    background: #ef4444;
  }

  &.rank-3 {
    background: #f97316;
  }

  &.rank-4 {
    background: #f59e0b;
  }

  &.rank-5 {
    background: #eab308;
  }

  &.rank-6 {
    background: #fbbf24;
  }

  &.rank-7 {
    background: #f59e0b;
  }

  &.rank-8 {
    background: #d97706;
  }

  &.rank-9 {
    background: #b45309;
  }

  &.rank-10 {
    background: #92400e;
  }

  &.rank-other {
    background: #d1d5db;
  }
}

.rank-name {
  color: #374151;
  font-weight: 500;
  transition: color 0.2s ease;
  font-weight: bold;

  // .rank-item:hover & {
  //   color: #52565e;
  // }
}

.rank-value {
  font-weight: 500;
  color: #1f2937;
  font-weight: bold;
}

/* 商务明细表格 */
.business-rank-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 20px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
}

.business-rank-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 20px 0;
}

.business-rank-table {
  overflow-x: auto;
  height: 400px;
  overflow-y: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #f3f4f6;
}

td {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s ease;
}

tr:hover td {
  background: #f9fafb;
}

.amount {
  font-weight: 500;
  color: #1f2937;
}

.detail-button {
  color: #165dff;
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: rgba(22, 93, 255, 0.8);
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .metric-card {
    padding: 16px;
  }

  .metric-value {
    font-size: 20px;
  }



  .rank-list {
    max-height: none;
  }
}

/* Loading 效果 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 12px;
  backdrop-filter: blur(2px);

  p {
    margin-top: 12px;
    color: #6b7280;
    font-size: 14px;
  }
}

.metric-card,
.chart-card,
.rank-card,
.business-rank-section {
  position: relative;
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.metric-card,
.chart-card,
.rank-card,
.business-rank-section {
  animation: fadeIn 0.5s ease-out;
}
</style>
