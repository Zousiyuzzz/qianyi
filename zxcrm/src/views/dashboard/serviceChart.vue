<template>
  <div class="dashboard-container">

    <!-- 关键指标卡片 -->
    <div class="metrics-grid">
      <!-- 总消耗 -->
      <div class="metric-card">
        <div v-if="topLoading" class="loading-overlay">
          <a-spin size="large" />
          <p>加载中...</p>
        </div>
        <div class="metric-header">
          <div class="metric-info">
            <p class="metric-label">总消耗</p>
            <h3 class="metric-value">¥{{ totalConsumeNum.toFixed(3) }}</h3>
          </div>
          <div class="metric-icon">
            <a-icon type="dollar" />
          </div>
        </div>
        <div class="metric-trend">
          <span class="trend-indicator" :class="trendDirection">
            <a-icon :type="trendDirection === 'up' ? 'arrow-up' : 'arrow-down'" />
            {{ trendPercentage }}
          </span>
          <span class="trend-label">较对比周期</span>
        </div>
      </div>

      <!-- 现金消耗 -->
      <div class="metric-card">
        <div v-if="topLoading" class="loading-overlay">
          <a-spin size="large" />
          <p>加载中...</p>
        </div>
        <div class="metric-header">
          <div class="metric-info">
            <p class="metric-label">现金消耗</p>
            <h3 class="metric-value">¥{{ (cashDrain || 0).toFixed(3) }}</h3>
          </div>
          <div class="metric-icon">
            <a-icon type="wallet" />
          </div>
        </div>
        <div class="metric-trend">
          <span class="trend-indicator" :class="cashDrainTrendDirection">
            <a-icon :type="cashDrainTrendDirection === 'up' ? 'arrow-up' : 'arrow-down'" />
            {{ cashDrainTrendPercentage }}
          </span>
          <span class="trend-label">较对比周期</span>
        </div>
      </div>

      <!-- 新开主体数 -->
      <div class="metric-card">
        <div v-if="topLoading" class="loading-overlay">
          <a-spin size="large" />
          <p>加载中...</p>
        </div>
        <div class="metric-header">
          <div class="metric-info">
            <p class="metric-label">新开主体数</p>
            <h3 class="metric-value">{{ newSubjectNum || 0 }}</h3>
          </div>
          <div class="metric-icon">
            <a-icon type="team" />
          </div>
        </div>
        <div class="metric-trend">
          <span class="trend-indicator" :class="newSubjectNumTrendDirection">
            <a-icon :type="newSubjectNumTrendDirection === 'up' ? 'arrow-up' : 'arrow-down'" />
            {{ newSubjectNumTrendPercentage }}
          </span>
          <span class="trend-label">较对比周期</span>
        </div>
      </div>

      <!-- 有花费账户数 -->
      <div class="metric-card">
        <div v-if="topLoading" class="loading-overlay">
          <a-spin size="large" />
          <p>加载中...</p>
        </div>
        <div class="metric-header">
          <div class="metric-info">
            <p class="metric-label">有花费账户数</p>
            <h3 class="metric-value">{{ totalHasConsumeAccountNum }}</h3>
          </div>
          <div class="metric-icon">
            <a-icon type="user-add" />
          </div>
        </div>
        <div class="metric-trend">
          <span class="trend-indicator" :class="accountHasConsumeTrendDirection">
            <a-icon :type="accountHasConsumeTrendDirection === 'up' ? 'arrow-up' : 'arrow-down'" />
            {{ accountHasConsumeTrendPercentage }}
          </span>
          <span class="trend-label">较对比周期</span>
        </div>
      </div>
    </div>

    <!-- 图表和明细区域 -->
    <div class="charts-section">
      <!-- 项目消耗明细排行榜 -->
      <div class="chart-card">
        <div v-if="projectRankLoading" class="loading-overlay">
          <a-spin size="large" />
          <p>加载中...</p>
        </div>
        <div class="chart-header">
          <h3 class="chart-title">日报</h3>
          <div class="filter-controls">
            <a-range-picker v-model="projectDateRange" :placeholder="['开始日期', '结束日期']" @change="onProjectDateChange"
              style="margin-right: 10px; width: 210px;" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
            <a-select v-model="projectMediaFilter" placeholder="选择媒体" style="width: 120px; margin-right: 10px;"
              @change="onProjectMediaChange" allowClear>
              <a-select-option value="">全部媒体</a-select-option>
              <a-select-option v-for="media in mediaOptions" :key="media.value" :value="media.value">
                {{ media.label }}
              </a-select-option>
            </a-select>
            <a-select v-model="projectOperationTypeFilter" placeholder="选择运营类型"
              style="width: 120px; margin-right: 10px;" @change="onProjectOperationTypeChange" allowClear>
              <a-select-option value="">全部运营类型</a-select-option>
              <a-select-option v-for="type in operationTypeOptions" :key="type.value" :value="type.value">
                {{ type.label }}
              </a-select-option>
            </a-select>
            <a-button type="primary" @click="refreshProjectRankList" :loading="projectRankLoading">
              刷新
            </a-button>
            <a-button type="default" @click="downloadAsImage" :loading="downloadLoading">
              <a-icon type="download" />
              下载图片
            </a-button>
          </div>
        </div>
        <div class="chart-container">
          <div class="project-rank-table">
            <table>
              <thead>
                <tr>
                  <th>项目名称</th>
                  <th>运营类型</th>
                  <th>渠道</th>
                  <th>{{ formatDateDisplay(projectDateRange && projectDateRange[0]) }}</th>
                  <th>{{ formatDateDisplay(projectDateRange && projectDateRange[1]) }}</th>
                  <th>环比</th>
                  <th>媒体</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in projectConsumptionList" :key="index">
                  <td>{{ item.name }}</td>
                  <td>{{ getOperationTypeText(item.operationType) }}</td>
                  <td>
                    <j-dict-name-display :value="item.channelSign" dictCode="channelSign_system" placeholder="未知渠道" />
                  </td>
                  <td class="amount">¥{{ formatNumber(item.date1 || 0) }}</td>
                  <td class="amount">¥{{ formatNumber(item.date2 || 0) }}</td>
                  <td class="comparison" :class="getComparisonClass(item.comparison)">
                    {{ formatComparison(item.comparison) }}
                  </td>
                  <td>{{ getMediaByChannel(item.channelSign) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 渠道消耗明细 -->
      <div class="rank-card">
        <div v-if="rankLoading" class="loading-overlay">
          <a-spin size="large" />
          <p>加载中...</p>
        </div>
        <h3 class="rank-title">渠道消耗明细</h3>
        <div class="rank-list">
          <div v-for="(item, index) in channelRankList" :key="index" class="rank-item">
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

      <!-- 项目消耗明细 -->
      <div class="rank-card">
        <div v-if="rankLoading" class="loading-overlay">
          <a-spin size="large" />
          <p>加载中...</p>
        </div>
        <h3 class="rank-title">项目消耗明细</h3>
        <div class="rank-list">
          <div v-for="(item, index) in proRankList" :key="index" class="rank-item">
            <div class="rank-info">
              <div class="rank-number" :class="getRankClass(index + 1)">{{ index + 1 }}</div>
              <span class="rank-name">{{ item.name }}</span>
            </div>
            <span class="rank-value">¥{{ formatNumber(item.total) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 商务消耗明细 -->
    <div class="business-rank-section">
      <div v-if="rankLoading" class="loading-overlay">
        <a-spin size="large" />
        <p>加载中...</p>
      </div>
      <h3 class="business-rank-title">商务消耗明细</h3>
      <div class="business-rank-table">
        <table>
          <thead>
            <tr>
              <th>排名</th>
              <th>商务名称</th>
              <th>总消耗</th>
              <th>现金消耗</th>
              <!-- <th>新开主体数</th> -->
              <th>有花费账户数</th>
              <!-- <th>操作</th> -->
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in busRankList" :key="index">
              <td>
                <div class="rank-number" :class="getRankClass(index + 1)">{{ index + 1 }}</div>
              </td>
              <td>{{ item.name }}</td>
              <td class="amount">¥{{ formatNumber(item.total_charged || 0) }}</td>
              <td class="amount">¥{{ formatNumber(item.cash_drain || 0) }}</td>
              <!-- <td>{{ item.newSubjectNum || 0 }}</td> -->
              <td>{{ item.consumeAccountNum || 0 }}</td>
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

import moment from 'moment';
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

    PlatformTotal,
    JDictNameDisplay
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
  },
  data() {
    return {
      // 加载状态
      topLoading: true,
      pendingTopRequests: 0,
      rankLoading: true,

      // 当前周期数据
      totalConsumeNum: 0,
      totalHasConsumeAccountNum: 0,
      newAccountNum: 0,
      cashDrain: 0,
      newSubjectNum: 0,

      // 对比周期数据
      totalConsumeNumLast: 0,
      totalHasConsumeAccountNumLast: 0,
      newAccountNumLast: 0,
      cashDrainLast: 0,
      newSubjectNumLast: 0,

      // 明细数据
      busRankList: [],
      proRankList: [],
      cusRankList: [],
      salesRankList: [],
      channelRankList: [],
      projectConsumptionList: [], // 项目消耗明细排行榜数据

      // 项目排行榜独立筛选
      projectDateRange: [],
      projectChannelFilter: '',
      projectMediaFilter: '', // 新增：媒体筛选
      projectOperationTypeFilter: '', // 新增：运营类型筛选
      projectRankLoading: false,
      downloadLoading: false, // 新增：下载状态
      channelOptions: [
        { value: 'channel1', label: '渠道1' },
        { value: 'channel2', label: '渠道2' },
        { value: 'channel3', label: '渠道3' }
      ],
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
          url: '/rebateReport/topData',
          method: 'GET',
          params: {}
        },
        rankingData: {
          url: '/rebateReport/rankingData',
          method: 'GET',
          params: {}
        },
        rankingDataPro: {
          url: '/rebateReport/rankingDataPro',
          method: 'GET',
          params: {}
        }
      }
    };
  },
  computed: {
    trendPercentage() {
      if (this.totalConsumeNumLast === 0) return '0%';
      const change = ((this.totalConsumeNum - this.totalConsumeNumLast) / this.totalConsumeNumLast) * 100;
      return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
    },
    trendDirection() {
      if (this.totalConsumeNumLast === 0) return 'down';
      return this.totalConsumeNum > this.totalConsumeNumLast ? 'up' : 'down';
    },
    accountHasConsumeTrendPercentage() {
      if (this.totalHasConsumeAccountNumLast === 0) return '0%';
      const change =
        ((this.totalHasConsumeAccountNum - this.totalHasConsumeAccountNumLast) / this.totalHasConsumeAccountNumLast) * 100;
      return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
    },
    accountHasConsumeTrendDirection() {
      if (this.totalHasConsumeAccountNumLast === 0) return 'down';
      return this.totalHasConsumeAccountNum > this.totalHasConsumeAccountNumLast ? 'up' : 'down';
    },
    newAccountNumTrendPercentage() {
      if (this.newAccountNumLast === 0) return '0%';
      const change = ((this.newAccountNum - this.newAccountNumLast) / this.newAccountNumLast) * 100;
      return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
    },
    newAccountNumTrendDirection() {
      if (this.newAccountNumLast === 0) return 'down';
      return this.newAccountNum > this.newAccountNumLast ? 'up' : 'down';
    },
    // 现金消耗趋势
    cashDrainTrendPercentage() {
      if (this.cashDrainLast === 0) return '0%';
      const change = ((this.cashDrain - this.cashDrainLast) / this.cashDrainLast) * 100;
      return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
    },
    cashDrainTrendDirection() {
      if (this.cashDrainLast === 0) return 'down';
      return this.cashDrain > this.cashDrainLast ? 'up' : 'down';
    },
    // 新开主体数趋势
    newSubjectNumTrendPercentage() {
      if (this.newSubjectNumLast === 0) return '0%';
      const change = ((this.newSubjectNum - this.newSubjectNumLast) / this.newSubjectNumLast) * 100;
      return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
    },
    newSubjectNumTrendDirection() {
      if (this.newSubjectNumLast === 0) return 'down';
      return this.newSubjectNum > this.newSubjectNumLast ? 'up' : 'down';
    },
  },
  created() {
    // 默认日期范围由父组件设置，子组件不再修改，避免重复请求
    // 顶部卡片并行加载两个日期区间的数据
    this.topLoading = true;
    this.pendingTopRequests = 2;
    this.getTopData();
    this.getYesterdayTopData();
    this.getRankList();

    // 设置日报默认日期范围为前天-昨天（使用字符串格式，与父组件保持一致）
    const yesterday = this.getYesterday(1);
    const dayBeforeYesterday = this.getYesterday(2);

    this.projectDateRange = [dayBeforeYesterday, yesterday];
  },
  mounted() { },
  watch: {
    dateRange: {
      handler(newVal) {
        if (newVal && newVal.length === 2) {
          this.getRankList();
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
        this.getRankList();
      }
    },
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
            this.totalConsumeNum = res.result ? res.result.sumConsume : 0
            this.newAccountNum = res.result ? res.result.newAccountNum : 0
            this.totalHasConsumeAccountNum = res.result ? res.result.consumeAccountNum : 0
            this.cashDrain = res.result ? res.result.cashDrain : 0
            this.newSubjectNum = res.result ? res.result.newSubjectNum : 0
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
            this.totalConsumeNumLast = res.result ? res.result.sumConsume : 0
            this.newAccountNumLast = res.result ? res.result.newAccountNum : 0
            this.totalHasConsumeAccountNumLast = res.result ? res.result.consumeAccountNum : 0
            this.cashDrainLast = res.result ? res.result.cashDrain : 0
            this.newSubjectNumLast = res.result ? res.result.newSubjectNum : 0
          } else {
            this.$message.warning(res.message);
          }
        })
        .finally(() => {
          this.pendingTopRequests = Math.max(0, this.pendingTopRequests - 1);
          if (this.pendingTopRequests === 0) this.topLoading = false;
        });
    },

    getRankList() {
      this.rankLoading = true;
      const requestConfig = this.apiRequests.rankingData;
      requestConfig.params = {
        beginDate: this.dateRange[0],
        endDate: this.dateRange[1],
        ...(this.businessIds && { channelSign: this.businessIds })
      };

      httpAction(requestConfig.url, requestConfig.params, requestConfig.method)
        .then((res) => {
          if (res.success) {
            //项目
            this.proRankList = res.result.proRanking.map(item => {
              return {
                ...item,
                name: item.pro_name,
                total: item.total_charged
              }
            })
            //销售
            this.busRankList = res.result.businessRanking.map(item => {
              return {
                ...item,
                name: item.realname,
                total: item.total_charged
              }
            })
            //渠道
            this.channelRankList = res.result.channelRanking.map(item => {
              return {
                ...item,
                name: item.channel_sign,
                total: item.total_charged
              }
            })

            // 更新项目消耗明细排行榜（如果没有独立筛选）
            if (!this.projectDateRange || this.projectDateRange.length === 0) {
              this.processProjectDataByDate(this.proRankList);
            } else {
              // 如果有日期范围，调用项目排行榜数据加载
              this.getProjectRankList();
            }
          } else {
            this.$message.warning(res.message);
          }
        })
        .catch((error) => {
          // console.log('获取明细数据失败', error)
          this.$message.error('获取明细数据失败');
        })
        .finally(() => {
          this.rankLoading = false;
        });
    },



    // 新增方法
    refreshData() {
      this.getTopData();
      this.getYesterdayTopData();
      this.getRankList();
      this.refreshChart();
    },

    refreshChart() {
      // 图表已替换为项目消耗明细排行榜
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

    // 项目排行榜相关方法
    getProjectRankList() {
      this.projectRankLoading = true;

      if (!this.projectDateRange || this.projectDateRange.length !== 2) {
        // 如果没有选择日期范围，使用proRankList作为备选
        this.processProjectDataByDate(this.proRankList);
        this.projectRankLoading = false;
        return;
      }

      // 获取两个日期
      const date1 = this.formatDate(this.projectDateRange[0]);
      const date2 = this.formatDate(this.projectDateRange[1]);

      // 第一次请求：第一个日期
      const request1 = httpAction(this.apiRequests.rankingDataPro.url, {
        beginDate: date1,
        endDate: date1
      }, this.apiRequests.rankingDataPro.method);

      // 第二次请求：第二个日期
      const request2 = httpAction(this.apiRequests.rankingDataPro.url, {
        beginDate: date2,
        endDate: date2
      }, this.apiRequests.rankingDataPro.method);

      // 并行请求两个日期的数据
      Promise.all([request1, request2])
        .then(([res1, res2]) => {
          let date1Data = [];
          let date2Data = [];

          // 处理第一个日期的响应
          if (res1.success && res1.result) {
            if (Array.isArray(res1.result)) {
              date1Data = res1.result;
            } else if (res1.result.proRanking) {
              date1Data = res1.result.proRanking;
            }
          }

          // 处理第二个日期的响应
          if (res2.success && res2.result) {
            if (Array.isArray(res2.result)) {
              date2Data = res2.result;
            } else if (res2.result.proRanking) {
              date2Data = res2.result.proRanking;
            }
          }

          // 使用两个日期的数据进行对比
          this.processProjectDataByTwoDates(date1Data, date2Data);
        })
        .catch((error) => {
          // console.log('获取项目排行榜数据失败', error);
          // 使用proRankList作为备选数据
          this.processProjectDataByDate(this.proRankList);
        })
        .finally(() => {
          this.projectRankLoading = false;
        });
    },

    // 处理项目数据，按照项目-日分组
    processProjectDataByDate(proRankList) {
      if (!this.projectDateRange || this.projectDateRange.length !== 2) {
        // 如果没有选择日期范围，使用原有格式
        let result = proRankList.map(item => ({
          name: item.pro_name || '未知项目',
          total: item.total_charged || 0,
          channelSign: item.channel_sign || '',
          operationType: item.operation_type || ''
        }));

        // 应用媒体筛选
        if (this.projectMediaFilter) {
          result = result.filter(item => {
            const media = this.getMediaByChannel(item.channelSign);
            return media === this.projectMediaFilter;
          });
        }

        // 应用运营类型筛选
        if (this.projectOperationTypeFilter) {
          result = result.filter(item => {
            return item.operationType == this.projectOperationTypeFilter;
          });
        }

        this.projectConsumptionList = result;
        return;
      }

      // 获取两个日期的数据
      const date1 = this.formatDate(this.projectDateRange[0]);
      const date2 = this.formatDate(this.projectDateRange[1]);

      // 基于proRankList创建两个日期的对比数据
      // 这里应该根据实际的API返回数据结构来处理
      let result = proRankList.map(item => {
        // 根据实际数据结构提取信息
        const projectName = item.pro_name || '未知项目';
        const projectId = item.pro_id;
        const totalCharged = item.total_charged || 0;
        const cashDrain = item.cash_drain || 0;
        const consumeAccountNum = item.consumeAccountNum || 0;
        const channelSign = item.channel_sign || '';

        // 这里需要根据实际API返回的数据结构来获取两个日期的数据
        // 如果API返回的是按日期分组的数据，需要重新组织
        return {
          name: projectName,
          date1: totalCharged, // 第一个日期的数据
          date2: totalCharged, // 第二个日期的数据（需要从API获取）
          comparison: 0, // 需要计算两个日期的差值
          projectId: projectId,
          channelSign: channelSign,
          operationType: item.operation_type || '',
          cashDrain: cashDrain,
          consumeAccountNum: consumeAccountNum
        };
      });

      // 应用媒体筛选
      if (this.projectMediaFilter) {
        result = result.filter(item => {
          const media = this.getMediaByChannel(item.channelSign);
          return media === this.projectMediaFilter;
        });
      }

      // 应用运营类型筛选
      if (this.projectOperationTypeFilter) {
        result = result.filter(item => {
          return item.operationType == this.projectOperationTypeFilter;
        });
      }

      this.projectConsumptionList = result;
    },

    // 新增：处理按日期分组的项目数据
    processProjectDataByDateRange(apiData) {
      if (!this.projectDateRange || this.projectDateRange.length !== 2) {
        return;
      }

      // 假设API返回的数据结构是按日期分组的
      // 例如：{ "2024-01-01": [...], "2024-01-02": [...] }
      const date1 = this.formatDate(this.projectDateRange[0]);
      const date2 = this.formatDate(this.projectDateRange[1]);

      // 如果API返回的是按日期分组的数据
      if (apiData[date1] && apiData[date2]) {
        const date1Data = apiData[date1];
        const date2Data = apiData[date2];

        // 创建项目映射，用于匹配两个日期的数据
        // 使用 projectId + channel_sign 作为唯一键
        const projectMap = new Map();

        // 处理第一个日期的数据
        date1Data.forEach(item => {
          const projectId = item.pro_id || item.pro_name;
          const channelSign = item.channel_sign || '';
          const uniqueKey = `${projectId}_${channelSign}`;

          projectMap.set(uniqueKey, {
            name: item.pro_name || '未知项目',
            date1: item.total_charged || 0,
            date2: 0,
            comparison: 0,
            projectId: item.pro_id,
            channelSign: channelSign,
            operationType: item.operation_type || '',
            cashDrain: item.cash_drain || 0,
            consumeAccountNum: item.consumeAccountNum || 0
          });
        });

        // 处理第二个日期的数据，并计算环比
        date2Data.forEach(item => {
          const projectId = item.pro_id || item.pro_name;
          const channelSign = item.channel_sign || '';
          const uniqueKey = `${projectId}_${channelSign}`;

          if (projectMap.has(uniqueKey)) {
            const existing = projectMap.get(uniqueKey);
            existing.date2 = item.total_charged || 0;
            // 计算环比百分比：(后一日 - 前一日) / 前一日 * 100
            existing.comparison = existing.date1 > 0 ? ((existing.date2 - existing.date1) / existing.date1) * 100 : 0;
          } else {
            // 如果第一个日期没有该项目+渠道组合，添加新项目
            projectMap.set(uniqueKey, {
              name: item.pro_name || '未知项目',
              date1: 0,
              date2: item.total_charged || 0,
              comparison: 0, // 第一个日期没有数据，环比为0
              projectId: item.pro_id,
              channelSign: channelSign,
              operationType: item.operation_type || '',
              cashDrain: item.cash_drain || 0,
              consumeAccountNum: item.consumeAccountNum || 0
            });
          }
        });

        // 转换为数组格式
        let result = Array.from(projectMap.values());

        // 应用媒体筛选
        if (this.projectMediaFilter) {
          result = result.filter(item => {
            const media = this.getMediaByChannel(item.channelSign);
            return media === this.projectMediaFilter;
          });
        }

        // 应用运营类型筛选
        if (this.projectOperationTypeFilter) {
          result = result.filter(item => {
            return item.operationType == this.projectOperationTypeFilter;
          });
        }

        this.projectConsumptionList = result;
      } else {
        // 如果API返回的不是按日期分组的数据，使用原有逻辑
        this.processProjectDataByDate(apiData);
      }
    },

    // 新增：处理两个日期的项目数据对比
    processProjectDataByTwoDates(date1Data, date2Data) {
      // 创建项目映射，用于匹配两个日期的数据
      // 使用 projectId + channel_sign 作为唯一键
      const projectMap = new Map();

      // 处理第一个日期的数据
      date1Data.forEach(item => {
        const projectId = item.pro_id || item.pro_name;
        const channelSign = item.channel_sign || '';
        const uniqueKey = `${projectId}_${channelSign}`;

        projectMap.set(uniqueKey, {
          name: item.pro_name || '未知项目',
          date1: item.total_charged || 0,
          date2: 0,
          comparison: 0,
          projectId: item.pro_id,
          channelSign: channelSign,
          operationType: item.operation_type || '',
          cashDrain: item.cash_drain || 0,
          consumeAccountNum: item.consumeAccountNum || 0
        });
      });

      // 处理第二个日期的数据，并计算环比
      date2Data.forEach(item => {
        const projectId = item.pro_id || item.pro_name;
        const channelSign = item.channel_sign || '';
        const uniqueKey = `${projectId}_${channelSign}`;

        if (projectMap.has(uniqueKey)) {
          const existing = projectMap.get(uniqueKey);
          existing.date2 = item.total_charged || 0;
          // 计算环比百分比：(后一日 - 前一日) / 前一日 * 100
          existing.comparison = existing.date1 > 0 ? ((existing.date2 - existing.date1) / existing.date1) * 100 : 0;
        } else {
          // 如果第一个日期没有该项目+渠道组合，添加新项目
          projectMap.set(uniqueKey, {
            name: item.pro_name || '未知项目',
            date1: 0,
            date2: item.total_charged || 0,
            comparison: 0, // 第一个日期没有数据，环比为0
            projectId: item.pro_id,
            channelSign: channelSign,
            operationType: item.operation_type || '',
            cashDrain: item.cash_drain || 0,
            consumeAccountNum: item.consumeAccountNum || 0
          });
        }
      });

      // 转换为数组格式并按消耗金额排序
      let result = Array.from(projectMap.values())
        .sort((a, b) => (b.date2 || 0) - (a.date2 || 0));

      // 应用媒体筛选
      if (this.projectMediaFilter) {
        result = result.filter(item => {
          const media = this.getMediaByChannel(item.channelSign);
          return media === this.projectMediaFilter;
        });
      }

      // 应用运营类型筛选
      if (this.projectOperationTypeFilter) {
        result = result.filter(item => {
          return item.operationType == this.projectOperationTypeFilter;
        });
      }

      this.projectConsumptionList = result;
    },

    onProjectDateChange(dates) {
      this.projectDateRange = dates;
      this.getProjectRankList();
    },

    onProjectChannelChange(value) {
      this.projectChannelFilter = value;
      // 渠道筛选暂时不处理，保持原有逻辑
      // this.getProjectRankList();
    },

    onProjectMediaChange(value) {
      this.projectMediaFilter = value;
      this.getProjectRankList();
    },

    onProjectOperationTypeChange(value) {
      this.projectOperationTypeFilter = value;
      this.getProjectRankList();
    },

    refreshProjectRankList() {
      this.getProjectRankList();
    },

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

    // 新增：下载日报数据为图片
    downloadAsImage() {
      this.downloadLoading = true;

      // 使用 html2canvas 将表格转换为图片
      this.$nextTick(() => {
        const tableElement = document.querySelector('.project-rank-table');
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
            let fileName = `日报数据_${this.formatDateForFileName(new Date())}`;
            if (this.projectMediaFilter) {
              fileName += `_${this.projectMediaFilter}`;
            }
            if (this.projectOperationTypeFilter) {
              const operationTypeText = this.getOperationTypeText(this.projectOperationTypeFilter);
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

    // 新增：格式化文件名中的日期
    formatDateForFileName(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}${month}${day}_${hours}${minutes}`;
    },

    // 新增：获取指定天数的日期字符串（与父组件保持一致）
    getYesterday(num = 1) {
      const date = new Date();
      date.setDate(date.getDate() - num);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
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

.chart-legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;

  &.current {
    background: #165dff;
  }

  &.compare {
    background: #d1d5db;
  }
}

.legend-text {
  font-size: 12px;
  color: #6b7280;
}

.chart-container {
  height: auto;
  min-height: 320px;
}

.project-rank-table {
  overflow-x: auto;
  height: 400px;
  overflow-y: auto;
}

.project-rank-table table {
  width: 100%;
  border-collapse: collapse;
}

.project-rank-table th {
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
.project-rank-table th:first-child,
.project-rank-table td:first-child {
  min-width: 150px;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-rank-table td {
  padding: 8px 12px;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s ease;
  font-size: 12px;
  white-space: nowrap;
}

.project-rank-table tr:hover td {
  background: #f9fafb;
}

.project-rank-table .amount {
  font-weight: 500;
  color: #1f2937;
}

.project-rank-table .comparison {
  font-weight: 500;
  color: #1f2937;

  &.positive {
    color: #16a34a;
  }

  &.negative {
    color: #dc2626;
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
  height: 400px;
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

  .chart-container {
    height: auto;
    min-height: 250px;
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
