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
            <a-button class="excel-download-btn" @click="downloadAsExcel" :loading="downloadLoading">
              <a-icon type="file-excel" />
              下载Excel
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
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 class="rank-title" style="margin: 0;">项目消耗明细</h3>
          <div style="display: flex; gap: 8px;">
            <a-input v-model="proDetailNameFilter" placeholder="项目名称模糊匹配" style="width: 200px;"
              @change="onProDetailNameChange" allowClear>
            </a-input>
            <a-button type="primary" @click="refreshConsumptionSummary" :loading="consumptionSummaryLoading"
              v-if="(userRoles.includes('admin') || userRoles.includes('BOSS'))">
              刷新
            </a-button>
          </div>
        </div>
        <div class="rank-list">
          <div v-for="(item, index) in filteredProRankList" :key="index" class="rank-item"
            @click="openProjectDetailModal(item)" style="cursor: pointer;">
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
            <tr v-for="(item, index) in busRankList" :key="index" @click="openProjectDetailModal(item)"
              style="cursor: pointer;">
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

    <!-- 项目消耗详情弹窗 -->
    <a-modal :title="`${selectedProject.proId ? '项目' : '商务'}消耗详情`" :visible="projectDetailModalVisible"
      @ok="handleModalOk" @cancel="handleModalCancel" :width="1200" :footer="null"
      :bodyStyle="{ maxHeight: '80vh', minHeight: '600px', overflow: 'auto', padding: '16px' }"
      :style="{ top: '20px' }">
      <div class="modal-content-wrapper">
        <!-- 只在表格数据为空且正在加载时显示全屏加载 -->
        <div v-if="projectDetailLoading && (!projectDetailData || projectDetailData.length === 0)"
          style="text-align: center; padding: 50px;">
          <a-spin size="large" />
          <p style="margin-top: 16px;">加载中...</p>
        </div>
        <div v-else>
          <div style="margin-bottom: 16px;display: flex;justify-content: space-between;">
            <h4>{{ selectedProject.proId ? '项目' : '商务' }}：{{ selectedProject.name }}</h4>
            <h4>合计: 总消耗:¥{{ formatNumber(selectedProject.total_charged || 0) }} 现金消耗:¥{{
              formatNumber(selectedProject.cash_drain || 0) }}
            </h4>
          </div>

          <!-- 日期范围选择 -->
          <div style="margin-bottom: 16px;" v-if="selectedProject.proId">
            <a-range-picker v-model="projectDetailDateRange" :placeholder="['开始日期', '结束日期']"
              @change="onProjectDetailDateChange" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
              style="margin-right: 16px;" />
            <a-button type="primary" @click="loadProjectDetailData" :loading="projectDetailLoading">
              查询
            </a-button>
          </div>

          <!-- 消耗趋势图表 -->
          <div v-if="!selectedProject.proId && selectedProject.businessPerson" class="consumption-chart-container"
            style="margin-bottom: 20px; min-height: 520px;">
            <h4 style="margin-bottom: 12px; color: #6b7280;">消耗趋势分析</h4>

            <!-- 客户图表loading -->
            <div style="position: relative;">
              <!-- 图表容器始终存在，确保ECharts能正确初始化 -->
              <div ref="consumptionChart" style="width: 100%; height: 500px; min-width: 800px; display: block;">
              </div>

              <!-- Loading遮罩层，使用绝对定位覆盖在图表上 -->
              <div v-if="chartLoading" class="chart-loading-overlay">
                <a-spin size="large">
                  <a-icon slot="indicator" type="loading-3-quarters" spin style="font-size: 48px; color: #165dff;" />
                </a-spin>
                <p class="loading-text">正在加载图表数据...</p>
                <div class="loading-progress">
                  <div class="progress-bar"></div>
                </div>
              </div>
            </div>

            <!-- 项目明细图表 -->
            <div v-if="showProjectChart"
              style="margin-top: 20px; padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h4 style="margin: 0; color: #475569; display: flex; align-items: center;">
                  <a-icon type="bar-chart" style="margin-right: 8px; color: #14b8a6;" />
                  {{ selectedCustomerData && selectedCustomerData.customerName }} - 项目明细
                </h4>
                <a-button size="small" type="danger" ghost @click="closeProjectChart">
                  <a-icon type="close" />
                  关闭
                </a-button>
              </div>

              <!-- 项目图表loading -->
              <div v-if="projectChartLoading" class="chart-loading-container project-loading">
                <a-spin size="large">
                  <a-icon slot="indicator" type="loading-3-quarters" spin style="font-size: 40px; color: #14b8a6;" />
                </a-spin>
                <p class="loading-text">正在加载项目数据...</p>
              </div>

              <div v-show="!projectChartLoading" ref="projectChart"
                style="width: 100%; height: 400px; min-width: 600px;">
              </div>
            </div>
          </div>

          <!-- 数据表格 -->
          <a-table :columns="selectedProject.proId ? computedProjectDetailColumns : computedBusColumns"
            :dataSource="projectDetailData" :pagination="projectDetailPagination" size="small" bordered
            @change="handleProjectDetailTableChange" :loading="projectDetailLoading" :scroll="{ y: 500 }"
            style="height: 500px; max-height: 500px;">
            <template slot="totalCharged" slot-scope="text">
              ¥{{ formatNumber(text) }}
            </template>
            <template slot="cashDrain" slot-scope="text">
              ¥{{ formatNumber(text) }}
            </template>
          </a-table>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script>
import { httpAction, getAction } from '@/api/manage';
import RankList from '@/components/chart/RankList';

import PlatformTotal from './components/platformTotal.vue';
import JDictNameDisplay from '@/components/dict/JDictNameDisplay.vue';
import { filterDictTextByCache } from '@/components/dict/JDictSelectUtil';

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
    consumeFilterType: {
      type: String,
      default: 'normal'
    }
  },
  data() {
    return {
      // 用户角色
      userRoles: [],

      // 加载状态
      topLoading: true,
      pendingTopRequests: 0,
      rankLoading: true,
      consumptionSummaryLoading: false,

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
      filteredProRankList: [], // 筛选后的项目明细数据
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
      proDetailNameFilter: '', // 项目明细名称筛选

      // 详情弹窗相关数据
      projectDetailModalVisible: false,
      projectDetailLoading: false,
      businessDetailModalVisiable: false,
      selectedProject: {},
      projectDetailDateRange: [],
      projectDetailData: [],
      projectDetailPagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        showQuickJumper: true
      },
      // 图表相关数据
      consumptionChartInstance: null,
      consumptionChartData: [],
      chartLoading: false,
      // 项目详情图表
      projectChartInstance: null,
      selectedCustomerData: null,
      showProjectChart: false,
      projectChartLoading: false,
      // 排序参数
      projectDetailSorter: {
        column: '',
        order: ''
      },
      busColumns: [
        {
          title: '日期',
          dataIndex: 'date_time',
          key: 'date_time',
          align: 'center',
          width: 120,
          sorter: true
        },
        {
          title: '项目名称',
          dataIndex: 'proName',
          key: 'proName',
          align: 'center',
          width: 200,
          sorter: true
        },
        {
          title: '渠道',
          dataIndex: 'channelName',
          key: 'channelName',
          align: 'center',
          width: 200,
          sorter: true
        },
        {
          title: '客户名称',
          dataIndex: 'customerName',
          key: 'customerName',
          align: 'center',
          width: 250,
          sorter: true
        },
        {
          title: '合作方式',
          dataIndex: 'collaborationMode',
          key: 'collaborationMode',
          align: 'center',
          width: 100,
          sorter: true,
          customRender: (text) => {
            const modeMap = {
              '0': '预付',
              '1': '垫付',
              '2': '服务费'
            };
            return modeMap[text] || text;
          }
        },
        {
          title: '总消耗',
          dataIndex: 'totalCharged',
          key: 'totalCharged',
          align: 'center',
          width: 120,
          sorter: true,
          scopedSlots: { customRender: 'totalCharged' }
        },
        {
          title: '现金消耗',
          dataIndex: 'cashDrain',
          key: 'cashDrain',
          align: 'center',
          width: 120,
          sorter: true,
          scopedSlots: { customRender: 'cashDrain' }
        }
      ],
      projectDetailColumns: [
        {
          title: '日期',
          dataIndex: 'date_time',
          key: 'date_time',
          align: 'center',
          width: 120,
          sorter: true
        },
        {
          title: '项目名称',
          dataIndex: 'proName',
          key: 'proName',
          align: 'center',
          width: 200,
          sorter: true
        },
        {
          title: '客户名称',
          dataIndex: 'customerName',
          key: 'customerName',
          align: 'center',
          width: 250,
          sorter: true
        },
        {
          title: '合作方式',
          dataIndex: 'collaborationMode',
          key: 'collaborationMode',
          align: 'center',
          width: 100,
          sorter: true,
          customRender: (text) => {
            const modeMap = {
              '0': '预付',
              '1': '垫付',
              '2': '服务费'
            };
            return modeMap[text] || text;
          }
        },
        {
          title: '总消耗',
          dataIndex: 'totalCharged',
          key: 'totalCharged',
          align: 'center',
          width: 120,
          sorter: true,
          scopedSlots: { customRender: 'totalCharged' }
        },
        {
          title: '现金消耗',
          dataIndex: 'cashDrain',
          key: 'cashDrain',
          align: 'center',
          width: 120,
          sorter: true,
          scopedSlots: { customRender: 'cashDrain' }
        }
      ],

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
          url: '/agentdata/topData',
          method: 'GET',
          params: {}
        },
        rankingData: {
          url: '/agentdata/rankingData',
          method: 'GET',
          params: {}
        },
        rankingDataPro: {
          url: '/agentdata/rankingDataPro',
          method: 'GET',
          params: {}
        }
      }
    };
  },
  computed: {
    // 根据消耗类型动态生成API URL
    dynamicApiUrls() {
      if (this.consumeFilterType === 'service') {
        return {
          topData: '/rebateReport/serviceChannelTopData',
          rankingData: '/rebateReport/serviceRankingData',
          rankingDataPro: '/rebateReport/serviceRankingDataProDay'
        };
      } else {
        return {
          topData: '/agentdata/topData',
          rankingData: '/agentdata/rankingData',
          rankingDataPro: '/agentdata/rankingDataPro'
        };
      }
    },
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
    // 动态生成带排序状态的商务列配置
    computedBusColumns() {
      return this.busColumns.map(col => {
        if (col.sorter && col.dataIndex === this.projectDetailSorter.column) {
          return {
            ...col,
            sortOrder: this.projectDetailSorter.order === 'asc' ? 'ascend' : (this.projectDetailSorter.order === 'desc' ? 'descend' : false)
          };
        }
        return col;
      });
    },
    // 动态生成带排序状态的项目列配置
    computedProjectDetailColumns() {
      return this.projectDetailColumns.map(col => {
        if (col.sorter && col.dataIndex === this.projectDetailSorter.column) {
          return {
            ...col,
            sortOrder: this.projectDetailSorter.order === 'asc' ? 'ascend' : (this.projectDetailSorter.order === 'desc' ? 'descend' : false)
          };
        }
        return col;
      });
    },
  },
  created() {
    // 获取用户角色
    getAction('/sys/api/queryUserRoles', {
      username: this.$store.getters.userInfo.username
    }).then(res => {
      this.userRoles = res
    })

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
    consumeFilterType: {
      handler(newVal, oldVal) {
        // 当消耗类型变化时，重新加载所有数据
        if (newVal !== oldVal) {
          // console.log('消耗类型变化:', newVal, '之前:', oldVal);
          this.getTopData();
          this.getYesterdayTopData();
          this.getRankList();
        }
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
      const params = {
        beginDate: this.dateRange[0],
        endDate: this.dateRange[1],
        ...(this.businessIds && { channelSign: this.businessIds })
      };

      httpAction(this.dynamicApiUrls.topData, params, 'GET')
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
      const params = {
        beginDate: this.compareDateRange[0],
        endDate: this.compareDateRange[1],
        ...(this.businessIds && { channelSign: this.businessIds }) 
      };

      httpAction(this.dynamicApiUrls.topData, params, 'GET')
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
      const params = {
        beginDate: this.dateRange[0],
        endDate: this.dateRange[1],
        ...(this.businessIds && { channelSign: this.businessIds })
      };

      httpAction(this.dynamicApiUrls.rankingData, params, 'GET')
        .then((res) => {
          if (res.success) {
            //项目
            this.proRankList = (res.result.proRanking || []).map(item => {
              return {
                ...item,
                name: item.pro_name,
                total: item.total_charged
              }
            })
            // 初始化筛选后的项目明细数据
            this.filterProDetailList()
            //销售
            this.busRankList = (res.result.businessRanking || []).map(item => {
              return {
                ...item,
                name: item.realname,
                total: item.total_charged
              }
            })
            //渠道
            this.channelRankList = (res.result.channelRanking || []).map(item => {
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
      const request1 = httpAction(this.dynamicApiUrls.rankingDataPro, {
        beginDate: date1,
        endDate: date1
      }, 'GET');

      // 第二次请求：第二个日期
      const request2 = httpAction(this.dynamicApiUrls.rankingDataPro, {
        beginDate: date2,
        endDate: date2
      }, 'GET');

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
      if (!proRankList || !Array.isArray(proRankList)) {
        this.projectRankList = [];
        return;
      }

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
      if (!proRankList || !Array.isArray(proRankList)) {
        this.projectRankList = [];
        return;
      }

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

    onProDetailNameChange(e) {
      this.proDetailNameFilter = e.target.value;
      this.filterProDetailList();
      // 筛选后调整图表尺寸
      this.handleTableDataChange();
    },

    filterProDetailList() {
      // 确保 proDetailNameFilter 是字符串类型
      const filterValue = String(this.proDetailNameFilter || '');

      if (!filterValue.trim()) {
        // 如果没有筛选条件，显示所有数据
        this.filteredProRankList = [...this.proRankList];
      } else {
        // 应用项目名称模糊匹配筛选
        const filterKeyword = filterValue.trim().toLowerCase();
        this.filteredProRankList = this.proRankList.filter(item => {
          return item.name && item.name.toLowerCase().includes(filterKeyword);
        });
      }
    },

    // 刷新消耗汇总数据
    refreshConsumptionSummary() {
      this.consumptionSummaryLoading = true;

      httpAction('/rebateReport/updateConsumptionSummary', {}, 'GET')
        .then((res) => {
          if (res.success) {
            // 显示成功消息，优先使用 result 字段，其次使用 message 字段
            const successMsg = res.result || res.message || '更新成功';
            this.$message.success(successMsg);
            // 刷新成功后重新加载项目消耗明细数据
            this.getRankList();
          } else {
            this.$message.warning(res.message || '更新失败');
          }
        })
        .catch((error) => {
          console.error('刷新消耗汇总数据失败', error);
          this.$message.error('刷新消耗汇总数据失败');
        })
        .finally(() => {
          this.consumptionSummaryLoading = false;
          // 刷新后调整图表尺寸
          this.handleTableDataChange();
        });
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

    // 新增：下载日报数据为Excel
    downloadAsExcel() {
      this.downloadLoading = true;

      try {
        // 动态引入 xlsx
        import('xlsx').then(XLSX => {
          // 准备Excel数据
          const excelData = this.prepareExcelData();

          // 创建工作簿
          const wb = XLSX.utils.book_new();

          // 创建工作表
          const ws = XLSX.utils.aoa_to_sheet(excelData);

          // 设置列宽
          const colWidths = [
            { wch: 20 }, // 项目名称
            { wch: 12 }, // 运营类型
            { wch: 15 }, // 渠道
            { wch: 15 }, // 日期1
            { wch: 15 }, // 日期2
            { wch: 10 }, // 环比
            { wch: 12 }  // 媒体
          ];
          ws['!cols'] = colWidths;

          // 添加工作表到工作簿
          XLSX.utils.book_append_sheet(wb, ws, '日报数据');

          // 生成Excel文件
          const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

          // 创建下载链接
          const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');

          // 生成文件名
          let fileName = `日报数据_${this.formatDateForFileName(new Date())}`;
          if (this.projectMediaFilter) {
            fileName += `_${this.projectMediaFilter}`;
          }
          if (this.projectOperationTypeFilter) {
            const operationTypeText = this.getOperationTypeText(this.projectOperationTypeFilter);
            fileName += `_${operationTypeText}`;
          }
          fileName += '.xlsx';

          link.download = fileName;
          link.href = url;

          // 触发下载
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // 清理URL对象
          window.URL.revokeObjectURL(url);

          this.$message.success('Excel文件下载成功');
          this.downloadLoading = false;
        }).catch(error => {
          console.error('加载xlsx库失败:', error);
          this.$message.error('Excel下载功能暂时不可用');
          this.downloadLoading = false;
        });
      } catch (error) {
        console.error('生成Excel失败:', error);
        this.$message.error('生成Excel失败');
        this.downloadLoading = false;
      }
    },

    // 新增：准备Excel数据
    prepareExcelData() {
      // 表头
      const headers = [
        '项目名称',
        '运营类型',
        '渠道',
        this.formatDateDisplay(this.projectDateRange && this.projectDateRange[0]),
        this.formatDateDisplay(this.projectDateRange && this.projectDateRange[1]),
        '环比',
        '媒体'
      ];

      // 数据行
      const dataRows = this.projectConsumptionList.map(item => {
        // 使用字典缓存解析渠道名称
        const channelText = filterDictTextByCache('channelSign_system', item.channelSign) || item.channelSign || '';

        return [
          item.name || '',
          this.getOperationTypeText(item.operationType),
          channelText,
          `¥${this.formatNumber(item.date1 || 0)}`,
          `¥${this.formatNumber(item.date2 || 0)}`,
          this.formatComparison(item.comparison),
          this.getMediaByChannel(item.channelSign)
        ];
      });

      // 合并表头和数据
      return [headers, ...dataRows];
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
    },

    // 项目详情弹窗相关方法
    openProjectDetailModal(item) {
      console.log('打开项目详情弹窗，项目数据:', item);
      console.log('item.pro_id:', item.pro_id);
      console.log('item.business_person:', item.business_person);

      this.selectedProject = {
        name: item.name,
        cash_drain: item.cash_drain || 0,
        total_charged: item.total_charged || 0,
      };

      // 根据传入的 item 动态设置 proId 或 businessPerson
      if (item.pro_id) {
        delete this.selectedProject.businessPerson
        this.selectedProject.proId = item.pro_id
        console.log('这是项目详情，proId:', item.pro_id);
      } else if (item.business_person) {
        delete this.selectedProject.proId
        this.selectedProject.businessPerson = item.business_person
        console.log('这是商务详情，business_person:', item.business_person);
      }

      this.projectDetailModalVisible = true;

      // 使用父组件的日期范围作为默认值
      this.projectDetailDateRange = [...this.dateRange];

      // 重置分页状态
      this.projectDetailPagination.current = 1;
      this.projectDetailPagination.total = 0;

      // 重置排序状态
      this.projectDetailSorter.column = '';
      this.projectDetailSorter.order = '';

      // 自动加载数据
      this.loadProjectDetailData();

      // 如果是商务详情，加载图表数据（现在使用 customerId）
      if (!item.pro_id && item.business_person) {
        console.log('准备加载商务消耗图表');
        // 使用 setTimeout 确保弹窗完全打开后再加载图表
        setTimeout(() => {
          // 如果有 customerId，使用 customerId，否则使用 business_person
          const queryParam = item.customer_id || item.customerId || item.business_person;
          console.log('查询参数:', queryParam);
          this.loadConsumptionChartData(queryParam);
        }, 300);
      }
    },

    handleModalOk() {
      this.projectDetailModalVisible = false;
      this.cleanupChart();
    },

    handleModalCancel() {
      this.projectDetailModalVisible = false;
      this.cleanupChart();
    },

    // 清理图表
    cleanupChart() {
      if (this.consumptionChartInstance) {
        console.log('清理客户图表实例');
        this.consumptionChartInstance.dispose();
        this.consumptionChartInstance = null;
      }
      if (this.projectChartInstance) {
        console.log('清理项目图表实例');
        this.projectChartInstance.dispose();
        this.projectChartInstance = null;
      }
      this.consumptionChartData = [];
      this.showProjectChart = false;
      this.selectedCustomerData = null;
    },

    onProjectDetailDateChange(dates) {
      this.projectDetailDateRange = dates;
    },
    /**
     *  projectDetailColumns: [
        {
          title: '日期',
          dataIndex: 'date_time',
          key: 'date_time',
          align: 'center',
          width: 120
        },
        {
          title: '项目名称',
          dataIndex: 'proName',
          key: 'proName',
          align: 'center',
          width: 200
        },
        {
          title: '客户名称',
          dataIndex: 'customerName',
          key: 'customerName',
          align: 'center',
          width: 250
        },
        {
          title: '合作方式',
          dataIndex: 'collaborationMode',
          key: 'collaborationMode',
          align: 'center',
          width: 100,
          customRender: (text) => {
            const modeMap = {
              '0': '预付',
              '1': '垫付',
              '2': '服务费'
            };
            return modeMap[text] || text;
          }
        },
        {
          title: '总消耗',
          dataIndex: 'totalCharged',
          key: 'totalCharged',
          align: 'center',
          width: 120,
          scopedSlots: { customRender: 'totalCharged' }
        },
        {
          title: '现金消耗',
          dataIndex: 'cashDrain',
          key: 'cashDrain',
          align: 'center',
          width: 120,
          scopedSlots: { customRender: 'cashDrain' }
        }
     */
    loadProjectDetailData() {
      // if (!this.selectedProject.proId) {
      //   this.$message.warning('项目ID不能为空');
      //   return;
      // }

      this.projectDetailLoading = true;

      const params = {
        pageNo: this.projectDetailPagination.current,
        pageSize: this.projectDetailPagination.pageSize
      };

      if (this.selectedProject.businessPerson) {
        params.businessPerson = this.selectedProject.businessPerson
      } else if (this.selectedProject.proId) {
        params.proId = this.selectedProject.proId
      }

      // 如果有选择日期范围，添加日期参数
      if (this.projectDetailDateRange && this.projectDetailDateRange.length === 2) {
        params.dateBegin = this.projectDetailDateRange[0];
        params.dateEnd = this.projectDetailDateRange[1];
      }

      // 添加排序参数
      if (this.projectDetailSorter.column) {
        params.column = this.projectDetailSorter.column;
        params.order = this.projectDetailSorter.order;
      }

      httpAction('/rebateReport/getProjectDailyConsumption', params, 'GET')
        .then((res) => {
          if (res.success) {
            // 处理返回的数据
            if (res.result && Array.isArray(res.result.records)) {
              this.projectDetailData = res.result.records.map(item => ({
                date_time: item.date_time || item.date || item.dateTime,
                proName: item.proName || item.pro_name,
                customerName: item.customerName || item.customer_name,
                collaborationMode: item.collaborationMode || item.collaboration_mode,
                totalCharged: item.totalCharged || item.total_charged || 0,
                cashDrain: item.cashDrain || item.cash_drain || 0,
                channelName: item.channelName || item.channel_name || '-',
              }));

              // 更新分页信息
              this.projectDetailPagination.total = res.result.total || 0;
              this.projectDetailPagination.current = res.result.current || 1;

              // 计算合计数据：优先使用后端返回的合计，否则计算当前页数据合计
              if (res.result.totalCharged !== undefined && res.result.cashDrain !== undefined) {
                // 后端返回了合计数据
                this.selectedProject.total_charged = res.result.totalCharged || 0;
                this.selectedProject.cash_drain = res.result.cashDrain || 0;
              } else {
                // 计算当前页数据的合计（如果后端没有返回合计）
                const totalCharged = this.projectDetailData.reduce((sum, item) => {
                  return sum + (parseFloat(item.totalCharged) || 0);
                }, 0);
                const cashDrain = this.projectDetailData.reduce((sum, item) => {
                  return sum + (parseFloat(item.cashDrain) || 0);
                }, 0);
                this.selectedProject.total_charged = totalCharged;
                this.selectedProject.cash_drain = cashDrain;
              }
            } else {
              this.projectDetailData = [];
              this.projectDetailPagination.total = 0;
              this.selectedProject.total_charged = 0;
              this.selectedProject.cash_drain = 0;
            }
          } else {
            this.$message.warning(res.message || '获取项目消耗数据失败');
            this.projectDetailData = [];
            this.projectDetailPagination.total = 0;
            this.selectedProject.total_charged = 0;
            this.selectedProject.cash_drain = 0;
          }
        })
        .catch((error) => {
          console.error('获取项目消耗数据失败', error);
          this.$message.error('获取项目消耗数据失败');
          this.projectDetailData = [];
        })
        .finally(() => {
          this.projectDetailLoading = false;
        });
    },

    // 处理项目详情表格分页、排序变化
    handleProjectDetailTableChange(pagination, filters, sorter) {
      // 更新分页信息
      this.projectDetailPagination.current = pagination.current;
      this.projectDetailPagination.pageSize = pagination.pageSize;

      // 更新排序信息
      if (sorter && sorter.field) {
        // 将排序字段转换为后端期望的格式
        this.projectDetailSorter.column = sorter.field;
        // 转换排序方向: ascend -> asc, descend -> desc
        this.projectDetailSorter.order = sorter.order === 'ascend' ? 'asc' : (sorter.order === 'descend' ? 'desc' : '');
      } else {
        // 清空排序
        this.projectDetailSorter.column = '';
        this.projectDetailSorter.order = '';
      }

      // 保存图表实例状态
      const chartInstances = {
        consumption: this.consumptionChartInstance,
        project: this.projectChartInstance
      };

      // 重新加载数据后调整图表尺寸
      this.loadProjectDetailData().then(() => {
        // 延迟调整，确保DOM更新完成
        this.$nextTick(() => {
          // 恢复图表实例
          this.consumptionChartInstance = chartInstances.consumption;
          this.projectChartInstance = chartInstances.project;

          // 如果图表实例丢失，重新初始化
          this.reinitializeCharts();

          this.handleTableDataChange();
          // 强制重新渲染图表
          this.forceChartResize();
        });
      });
    },

    // 加载商务消耗趋势图表数据
    loadConsumptionChartData(queryParam) {
      console.log('开始加载图表数据，查询参数:', queryParam);
      this.chartLoading = true;

      // 根据参数类型决定使用哪个字段（可能是 customerId 或 businessPerson）
      // 获取本月最后一日和上月1日
      const today = new Date();
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

      const params = {
        businessPerson: queryParam,
        dateBegin: this.formatDate(firstDayOfLastMonth),
        dateEnd: this.formatDate(lastDayOfMonth)
      };
      console.log('请求参数:', params);

      httpAction('/rebateReport/getDailyConsumption', params, 'GET')
        .then((res) => {
          console.log('接口返回数据:', res);
          if (res.success && res.result && res.result.length > 0) {
            // 按 dateMonth 分组汇总数据
            const groupedData = this.groupDataByMonth(res.result);
            this.consumptionChartData = groupedData;
            console.log('按月分组后的数据:', this.consumptionChartData);
            console.log('数据条数:', this.consumptionChartData.length);
            console.log('第一条数据示例:', this.consumptionChartData[0]);

            // 延迟初始化图表，确保DOM已渲染
            this.$nextTick(() => {
              console.log('准备初始化图表');
              this.initConsumptionChart();
            });
          } else {
            console.warn('没有返回有效数据');
            this.$message.warning(res.message || '暂无消耗趋势数据');
            this.consumptionChartData = [];
            this.chartLoading = false;
          }
        })
        .catch((error) => {
          console.error('获取消耗趋势数据失败', error);
          this.$message.error('获取消耗趋势数据失败');
          this.consumptionChartData = [];
          this.chartLoading = false;
        });
    },

    // 转换数据格式：按客户分组，每个月份作为一个系列
    groupDataByMonth(data) {
      console.log('原始数据条数:', data.length);

      // 获取所有唯一的月份（排序）
      const monthsSet = new Set();
      data.forEach(item => {
        if (item.dateMonth) {
          monthsSet.add(item.dateMonth);
        }
      });
      const months = Array.from(monthsSet).sort();
      console.log('所有月份:', months);

      // 获取所有唯一的客户，并存储每个客户下的项目
      const customersMap = new Map();
      data.forEach(item => {
        const customerKey = `${item.customerId}_${item.customerName}`;
        if (!customersMap.has(customerKey)) {
          customersMap.set(customerKey, {
            customerId: item.customerId,
            customerName: item.customerName,
            data: {}, // 存储每个月份的汇总数据
            projects: [] // 存储该客户的所有项目
          });
        }

        // 添加项目信息（去重）
        const customer = customersMap.get(customerKey);
        const projectExists = customer.projects.find(p => p.proId === item.proId);
        if (!projectExists) {
          customer.projects.push({
            proId: item.proId,
            proName: item.proName,
            channelName: item.channelName,
            data: {}
          });
        }
      });

      // 填充每个客户在每个月份的汇总数据，同时填充项目数据
      data.forEach(item => {
        const customerKey = `${item.customerId}_${item.customerName}`;
        const customer = customersMap.get(customerKey);
        if (customer && item.dateMonth) {
          // 累加客户在该月份的总消耗
          customer.data[item.dateMonth] = (customer.data[item.dateMonth] || 0) + (item.totalCharged || 0);

          // 填充项目数据
          const project = customer.projects.find(p => p.proId === item.proId);
          if (project) {
            project.data[item.dateMonth] = (project.data[item.dateMonth] || 0) + (item.totalCharged || 0);
          }
        }
      });

      const result = {
        months: months,
        customers: Array.from(customersMap.values()),
        rawData: data // 保存原始数据，供后续使用
      };

      console.log('转换后的数据结构:', result);
      console.log('客户数量:', result.customers.length);
      return result;
    },

    // 初始化商务消耗趋势图表（客户维度）
    initConsumptionChart() {
      console.log('initConsumptionChart 被调用');
      console.log('consumptionChart ref 是否存在:', !!this.$refs.consumptionChart);

      if (!this.$refs.consumptionChart) {
        console.error('图表容器 ref 不存在！');
        return;
      }

      if (!this.consumptionChartData || !this.consumptionChartData.customers || this.consumptionChartData.customers.length === 0) {
        console.warn('没有图表数据');
        return;
      }

      // 如果图表实例已存在，先销毁
      if (this.consumptionChartInstance) {
        console.log('销毁旧的图表实例');
        this.consumptionChartInstance.dispose();
        this.consumptionChartInstance = null;
      }

      // 动态导入 echarts
      import('echarts').then(echarts => {
        console.log('echarts 加载成功，开始初始化图表');
        this.consumptionChartInstance = echarts.init(this.$refs.consumptionChart);

        const { months, customers } = this.consumptionChartData;

        console.log('月份列表:', months);
        console.log('客户列表:', customers);

        // X轴数据：客户名称
        const customerNames = customers.map(c => c.customerName);

        // 为每个月份生成一条折线
        const series = months.map((month, index) => {
          // 每个客户在该月份的数据
          const monthData = customers.map(customer => {
            return customer.data[month] || 0;
          });

          // 为每个月份分配不同的颜色
          const colors = [
            '#165dff', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6',
            '#ec4899', '#06b6d4', '#10b981', '#f97316', '#6366f1'
          ];
          const color = colors[index % colors.length];

          return {
            name: month,
            type: 'line',
            smooth: true,
            data: monthData,
            lineStyle: {
              width: 2,
              color: color
            },
            itemStyle: {
              color: color
            },
            emphasis: {
              focus: 'series'
            }
          };
        });

        console.log('X轴客户名称:', customerNames);
        console.log('系列数据:', series);

        // 配置图表选项
        const option = {
          title: {
            text: '客户消耗趋势（按月对比）',
            subtext: '点击数据点或客户名称查看项目明细',
            left: 'center',
            textStyle: {
              fontSize: 16,
              fontWeight: 600,
              color: '#1f2937'
            },
            subtextStyle: {
              fontSize: 11,
              color: '#9ca3af'
            }
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross'
            },
            formatter: (params) => {
              let result = `<div style="font-weight: bold; margin-bottom: 5px;">${params[0].axisValue}</div>`;
              params.forEach(item => {
                result += `<div style="display: flex; align-items: center; margin: 3px 0;">
                  <span style="display: inline-block; width: 10px; height: 10px; background-color: ${item.color}; border-radius: 50%; margin-right: 5px;"></span>
                  <span style="flex: 1;">${item.seriesName}:</span>
                  <span style="font-weight: bold; margin-left: 10px;">¥${this.formatNumber(item.value)}</span>
                </div>`;
              });
              // 检查项目数据
              const customerIndex = params[0].dataIndex;
              const customer = this.consumptionChartData.customers[customerIndex];
              const projectCount = customer && customer.projects ? customer.projects.length : 0;

              result += `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280;">点击数据点查看项目明细 (${projectCount}个项目)</div>`;
              return result;
            }
          },
          legend: {
            data: months,
            top: 55,
            type: 'scroll',
            textStyle: {
              fontSize: 12,
              color: '#6b7280'
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '12%',
            top: 80,
            containLabel: true
          },
          dataZoom: [
            {
              type: 'slider',
              show: true,
              xAxisIndex: [0],
              start: 0,
              end: customerNames.length > 20 ? (20 / customerNames.length * 100) : 100,
              bottom: '3%',
              height: 20,
              handleSize: '80%',
              handleStyle: {
                color: '#165dff'
              },
              textStyle: {
                color: '#6b7280'
              },
              borderColor: '#e5e7eb',
              fillerColor: 'rgba(22, 93, 255, 0.1)',
              moveHandleSize: 7
            },
            {
              type: 'inside',
              xAxisIndex: [0],
              start: 0,
              end: customerNames.length > 20 ? (20 / customerNames.length * 100) : 100,
              zoomOnMouseWheel: true,
              moveOnMouseMove: true,
              moveOnMouseWheel: false
            }
          ],
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: customerNames,
            axisLabel: {
              fontSize: 11,
              color: '#6b7280',
              rotate: 45,
              interval: 0,
              cursor: 'pointer',
              formatter: function (value) {
                return value;
              }
            },
            axisLine: {
              lineStyle: {
                color: '#e5e7eb'
              }
            },
            triggerEvent: true
          },
          yAxis: {
            type: 'value',
            name: '消耗金额（元）',
            nameTextStyle: {
              fontSize: 12,
              color: '#6b7280'
            },
            axisLabel: {
              fontSize: 11,
              color: '#6b7280',
              formatter: (value) => {
                if (value >= 10000000) {
                  return (value / 10000000).toFixed(0) + '千万';
                } else if (value >= 1000000) {
                  return (value / 1000000).toFixed(0) + '百万';
                } else if (value >= 10000) {
                  return (value / 10000).toFixed(0) + '万';
                } else if (value >= 1000) {
                  return (value / 1000).toFixed(0) + '千';
                }
                return value.toFixed(0);
              }
            },
            splitLine: {
              lineStyle: {
                color: '#f3f4f6',
                type: 'dashed'
              }
            }
          },
          series: series
        };

        console.log('图表配置:', option);
        this.consumptionChartInstance.setOption(option);
        console.log('图表初始化完成！');

        // 确保图表正确渲染并调整尺寸
        setTimeout(() => {
          if (this.consumptionChartInstance) {
            this.consumptionChartInstance.resize();
            console.log('图表尺寸已调整');
          }
        }, 100);

        // 图表渲染完成后关闭loading
        this.chartLoading = false;

        // 添加点击事件：点击数据点或X轴标签展开项目明细
        this.consumptionChartInstance.on('click', (params) => {
          console.log('点击事件详情:', params);

          let customerIndex = -1;
          let customer = null;

          if (params.componentType === 'series') {
            // 点击数据点
            customerIndex = params.dataIndex;
            customer = customers[customerIndex];
            console.log('点击数据点的客户:', customer);
          } else if (params.componentType === 'xAxis' || params.componentType === 'xAxisLabel') {
            // 点击X轴标签
            customerIndex = params.dataIndex;
            customer = customers[customerIndex];
            console.log('点击X轴标签的客户:', customer);
          } else if (params.componentType === 'grid') {
            // 点击网格区域，尝试从坐标获取索引
            console.log('点击网格区域，坐标:', params.offsetX, params.offsetY);
            // 这里可以添加根据坐标计算客户索引的逻辑
            return;
          }

          if (customer) {
            // 展开该客户的项目明细
            this.showCustomerProjects(customer);
          } else {
            console.log('未找到对应的客户数据');
          }
        });

        // 添加X轴标签点击事件
        this.consumptionChartInstance.on('click', (params) => {
          // 如果点击的是X轴标签区域
          if (params.componentType === 'xAxis' || params.componentType === 'xAxisLabel') {
            const customerIndex = params.dataIndex;
            const customer = customers[customerIndex];
            if (customer) {
              console.log('点击X轴标签，展开客户:', customer.customerName);
              this.showCustomerProjects(customer);
            }
          }
        });

        // 监听窗口大小变化
        window.addEventListener('resize', this.handleChartResize);
      }).catch(error => {
        console.error('加载 echarts 失败:', error);
        this.$message.error('图表初始化失败');
        this.chartLoading = false;
      });
    },

    // 展开客户的项目明细
    showCustomerProjects(customer) {
      console.log('展开客户项目:', customer);

      this.selectedCustomerData = customer;
      this.showProjectChart = true;
      this.projectChartLoading = true;

      this.$nextTick(() => {
        this.initProjectChart();
      });
    },

    // 初始化项目明细图表
    initProjectChart() {
      console.log('initProjectChart 被调用');
      const chartRef = this.$refs.projectChart;

      if (!chartRef) {
        console.error('项目图表容器不存在');
        return;
      }

      if (!this.selectedCustomerData) {
        console.warn('没有选中客户数据');
        return;
      }

      // 如果没有项目数据，创建一个默认的项目数据
      if (!this.selectedCustomerData.projects || this.selectedCustomerData.projects.length === 0) {
        console.warn('没有项目数据，创建默认项目');
        this.selectedCustomerData.projects = [{
          proName: '默认项目',
          data: {}
        }];
      }

      // 如果图表实例已存在，先销毁
      if (this.projectChartInstance) {
        this.projectChartInstance.dispose();
        this.projectChartInstance = null;
      }

      import('echarts').then(echarts => {
        this.projectChartInstance = echarts.init(chartRef);

        const { projects } = this.selectedCustomerData;
        const months = this.consumptionChartData.months;

        // X轴：项目名称
        const projectNames = projects.map(p => p.proName);

        // 为每个月份生成一条折线
        const series = months.map((month, index) => {
          const monthData = projects.map(project => {
            return project.data[month] || 0;
          });

          const colors = [
            '#165dff', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6',
            '#ec4899', '#06b6d4', '#10b981', '#f97316', '#6366f1'
          ];
          const color = colors[index % colors.length];

          return {
            name: month,
            type: 'line',
            smooth: true,
            data: monthData,
            lineStyle: {
              width: 2,
              color: color
            },
            itemStyle: {
              color: color
            },
            emphasis: {
              focus: 'series'
            }
          };
        });

        const option = {
          title: {
            text: `${this.selectedCustomerData.customerName} - 项目消耗明细`,
            left: 'center',
            textStyle: {
              fontSize: 14,
              fontWeight: 600,
              color: '#1f2937'
            }
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross'
            },
            formatter: (params) => {
              let result = `<div style="font-weight: bold; margin-bottom: 5px;">${params[0].axisValue}</div>`;
              params.forEach(item => {
                result += `<div style="display: flex; align-items: center; margin: 3px 0;">
                  <span style="display: inline-block; width: 10px; height: 10px; background-color: ${item.color}; border-radius: 50%; margin-right: 5px;"></span>
                  <span style="flex: 1;">${item.seriesName}:</span>
                  <span style="font-weight: bold; margin-left: 10px;">¥${this.formatNumber(item.value)}</span>
                </div>`;
              });
              return result;
            }
          },
          legend: {
            data: months,
            top: 35,
            type: 'scroll',
            textStyle: {
              fontSize: 11,
              color: '#6b7280'
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '12%',
            top: 60,
            containLabel: true
          },
          dataZoom: [
            {
              type: 'slider',
              show: true,
              xAxisIndex: [0],
              start: 0,
              end: projectNames.length > 15 ? (15 / projectNames.length * 100) : 100,
              bottom: '3%',
              height: 18,
              handleSize: '80%',
              handleStyle: {
                color: '#14b8a6'
              },
              textStyle: {
                color: '#6b7280',
                fontSize: 10
              },
              borderColor: '#e5e7eb',
              fillerColor: 'rgba(20, 184, 166, 0.1)',
              moveHandleSize: 6
            },
            {
              type: 'inside',
              xAxisIndex: [0],
              start: 0,
              end: projectNames.length > 15 ? (15 / projectNames.length * 100) : 100,
              zoomOnMouseWheel: true,
              moveOnMouseMove: true,
              moveOnMouseWheel: false
            }
          ],
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: projectNames,
            axisLabel: {
              fontSize: 10,
              color: '#6b7280',
              rotate: 45,
              interval: 0
            },
            axisLine: {
              lineStyle: {
                color: '#e5e7eb'
              }
            }
          },
          yAxis: {
            type: 'value',
            name: '金额（元）',
            nameTextStyle: {
              fontSize: 11,
              color: '#6b7280'
            },
            axisLabel: {
              fontSize: 10,
              color: '#6b7280',
              formatter: (value) => {
                if (value >= 10000000) {
                  return (value / 10000000).toFixed(0) + '千万';
                } else if (value >= 1000000) {
                  return (value / 1000000).toFixed(0) + '百万';
                } else if (value >= 10000) {
                  return (value / 10000).toFixed(0) + '万';
                } else if (value >= 1000) {
                  return (value / 1000).toFixed(0) + '千';
                }
                return value.toFixed(0);
              }
            },
            splitLine: {
              lineStyle: {
                color: '#f3f4f6',
                type: 'dashed'
              }
            }
          },
          series: series
        };

        this.projectChartInstance.setOption(option);
        console.log('项目图表初始化完成');

        // 确保图表正确渲染并调整尺寸
        setTimeout(() => {
          if (this.projectChartInstance) {
            this.projectChartInstance.resize();
            console.log('项目图表尺寸已调整');
          }
        }, 100);

        // 图表渲染完成后关闭loading
        this.projectChartLoading = false;
      }).catch(error => {
        console.error('加载项目图表失败:', error);
        this.projectChartLoading = false;
      });
    },

    // 关闭项目明细
    closeProjectChart() {
      this.showProjectChart = false;
      this.selectedCustomerData = null;
      if (this.projectChartInstance) {
        this.projectChartInstance.dispose();
        this.projectChartInstance = null;
      }
    },

    // 处理图表大小调整
    handleChartResize() {
      this.$nextTick(() => {
        if (this.consumptionChartInstance) {
          this.consumptionChartInstance.resize();
        }
        if (this.projectChartInstance) {
          this.projectChartInstance.resize();
        }
      });
    },

    // 监听表格数据变化，重新调整图表尺寸
    handleTableDataChange() {
      // 延迟调整图表尺寸，等待表格渲染完成
      setTimeout(() => {
        this.handleChartResize();
      }, 100);
    },

    // 强制重新调整图表尺寸
    forceChartResize() {
      this.$nextTick(() => {
        // 延迟执行，确保DOM完全更新
        setTimeout(() => {
          if (this.consumptionChartInstance) {
            this.consumptionChartInstance.resize();
          }
          if (this.projectChartInstance) {
            this.projectChartInstance.resize();
          }
        }, 200);
      });
    },

    // 重新初始化图表（当图表实例丢失时）
    reinitializeCharts() {
      this.$nextTick(() => {
        // 如果图表实例丢失，重新初始化
        if (!this.consumptionChartInstance && this.$refs.consumptionChart && this.consumptionChartData) {
          this.initConsumptionChart();
        }
        if (!this.projectChartInstance && this.$refs.projectChart && this.selectedCustomerData) {
          this.initProjectChart();
        }
      });
    }
  },

  mounted() {
    // 确保图表容器有正确的尺寸
    this.$nextTick(() => {
      if (this.consumptionChartInstance) {
        this.consumptionChartInstance.resize();
      }
      if (this.projectChartInstance) {
        this.projectChartInstance.resize();
      }
    });
  },

  beforeDestroy() {
    // 清理图表实例
    if (this.consumptionChartInstance) {
      this.consumptionChartInstance.dispose();
      this.consumptionChartInstance = null;
    }
    if (this.projectChartInstance) {
      this.projectChartInstance.dispose();
      this.projectChartInstance = null;
    }
    // 移除窗口大小变化监听
    window.removeEventListener('resize', this.handleChartResize);
  }
};
</script>

<style lang="less" scoped>
.dashboard-container {
  margin-top: 10px;
  font-family: 'Inter', system-ui, sans-serif;
  min-height: 100vh;
}

/* Excel下载按钮样式 */
.excel-download-btn {
  background: #217346 !important;
  border-color: #217346 !important;
  color: #ffffff !important;
  transition: all 0.3s ease;

  &:hover {
    background: #1a5c37 !important;
    border-color: #1a5c37 !important;
    color: #ffffff !important;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(33, 115, 70, 0.3);
  }

  &:active {
    background: #144d2c !important;
    border-color: #144d2c !important;
    transform: translateY(0);
  }

  &:focus {
    background: #217346 !important;
    border-color: #217346 !important;
    color: #ffffff !important;
  }

  .anticon {
    color: #ffffff !important;
  }
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

/* 消耗趋势图表容器样式 */
.consumption-chart-container {
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

/* 图表加载动画样式 */
.chart-loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  width: 100%;
  background: linear-gradient(135deg, #f6f8fb 0%, #ffffff 100%);
  border-radius: 8px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg,
        transparent 0%,
        rgba(22, 93, 255, 0.05) 50%,
        transparent 100%);
    animation: shimmer 2s infinite;
  }

  &.project-loading {
    min-height: 400px;

    &::before {
      background: linear-gradient(90deg,
          transparent 0%,
          rgba(20, 184, 166, 0.05) 50%,
          transparent 100%);
    }
  }
}

.loading-text {
  margin-top: 20px;
  font-size: 16px;
  color: #6b7280;
  font-weight: 500;
  animation: pulse 1.5s ease-in-out infinite;
  z-index: 1;
}

.loading-progress {
  width: 200px;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  margin-top: 16px;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #165dff 0%, #14b8a6 100%);
  border-radius: 2px;
  animation: progress 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }

  100% {
    left: 100%;
  }
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

@keyframes progress {
  0% {
    width: 0%;
    margin-left: 0%;
  }

  50% {
    width: 70%;
    margin-left: 15%;
  }

  100% {
    width: 0%;
    margin-left: 100%;
  }
}

/* 弹窗样式优化 */
.ant-modal-body {
  max-height: 80vh !important;
  overflow-y: auto !important;
}

.ant-modal-content {
  max-height: 90vh !important;
  overflow: hidden !important;
}

/* 表格容器样式优化 */
.ant-table-wrapper {
  max-height: 500px !important;
  overflow-y: auto !important;
}

.ant-table-tbody {
  max-height: 400px !important;
  overflow-y: auto !important;
}

/* 弹窗内容区域样式优化 */
.modal-content-wrapper {
  min-height: 600px;
  display: flex;
  flex-direction: column;
}

/* 确保图表容器高度稳定 */
.consumption-chart-container {
  flex-shrink: 0;
  position: relative;
}

/* 表格区域样式优化 */
.ant-table-container {
  flex-shrink: 0;
  min-height: 500px;
}

/* 图表loading遮罩层样式 */
.chart-loading-overlay {
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
  border-radius: 8px;
}
</style>
