<template>
  <div class="analysis-container">
    <!-- 统一的查询条件区域 -->
    <div class="filter-section" v-if="currentPermissionType !== 'none'">
      <div class="filter-content">
        <!-- 左侧查询条件 -->
        <div class="filter-controls">
          <!-- 第一个日期范围选择器 - 所有页面都显示 -->
          <div class="filter-item">
            <label>日期：</label>
            <a-range-picker :value="dateRange" @change="handleDateChange" :ranges="ranges" :allowClear="false"
              format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 200px;" />
          </div>

          <!-- 第二个日期范围选择器 - 所有页面都显示 -->
          <div class="filter-item" v-if="indexStyle === 1 || indexStyle === 2">
            <label>对比：</label>
            <a-range-picker :value="compareDateRange" @change="handleCompareDateChange" :ranges="ranges"
              :allowClear="false" format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 200px;" />
          </div>



          <!-- 渠道选择器 - 汇总和渠道页面都显示 -->
          <div class="filter-item" v-if="indexStyle === 1">
            <span class="query-label">渠道：</span>
            <j-multi-select-tag placeholder="请选择渠道标识" v-model="businessIds" style="width: 330px;"
              dictCode="channelSign_system" />
          </div>

          <!-- 消耗类型筛选 - 只在消耗页面显示 -->
          <div class="filter-item" v-if="indexStyle === 1">
            <label>类型：</label>
            <a-radio-group v-model="consumeFilterType" @change="handleConsumeFilterTypeChange" button-style="solid">
              <a-radio-button value="normal">常规</a-radio-button>
              <a-radio-button value="service">服务费</a-radio-button>
            </a-radio-group>
          </div>

          <!-- 充值和退款筛选 -->
          <div class="filter-item" v-if="indexStyle === 2 && hasChannelPermission">
            <label>类型：</label>
            <a-radio-group v-model="filterType" @change="handleFilterTypeChange" button-style="solid">
              <a-radio-button value="recharge">充值明细</a-radio-button>
              <a-radio-button value="refund">退款明细</a-radio-button>
            </a-radio-group>
          </div>


          <!-- 未绑定账户提示 - 所有页面都显示 -->
          <div class="filter-item">
            <a-popover v-model="bindingPopoverVisible" trigger="click" @visibleChange="getUnbindingNum"
              overlayClassName="custom-popover" placement="bottom">
              <template slot="content">
                <div style="min-width: 300px;">
                  <p class="custom-popover-text">{{ tooltipContent }}</p>
                  <a-button type="primary" size="small" @click="goToBinding"
                    style="margin-top: 8px;background-color: white;color: black;border: #fff;">
                    前往绑定
                  </a-button>
                </div>
              </template>
              <div class="warning-tip" :class="{ 'normal-state': totalUnbindingNum === 0 }"
                style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                <a-icon type="exclamation-circle" :class="{ 'normal-icon': totalUnbindingNum === 0 }"
                  style="color: #ff4d4f; font-size: 18px; animation: pulse 2s infinite;" />
                <span :class="{ 'normal-text': totalUnbindingNum === 0 }"
                  style="color: #ff4d4f; font-size: 14px; font-weight: 500;">
                  {{ totalUnbindingNum === 0 ? '账户已绑定' : '账户待绑定' }}
                </span>
              </div>
            </a-popover>
          </div>

          <!-- 刷新数据按钮 -->
          <div class="filter-item">
            <button class="refresh-button" @click="refreshData">
              <a-icon type="reload" /> 刷新数据
            </button>
          </div>
        </div>

        <!-- 右侧页面切换按钮 -->
        <div class="page-switch-section" v-if="currentPermissionType !== 'none'">
          <div class="tab-group">
            <a-radio-group v-model="indexStyle" buttonStyle="solid">
              <a-radio-button v-if="hasTotalPermission" :value="1">消耗</a-radio-button>
              <a-radio-button v-if="hasChannelPermission" :value="2">充值</a-radio-button>
              <a-radio-button v-if="hasSalesPermission" :value="3">商务</a-radio-button>
              <!-- <a-radio-button v-if="hasSalesPermission" :value="4">服务</a-radio-button> -->
            </a-radio-group>
          </div>
        </div>

        <!-- 调试信息 -->
        <!-- <div class="debug-info" style="font-size: 12px; color: #666; margin-top: 10px;">
          <p>权限状态: {{ currentPermissionType }}</p>
          <p>汇总权限: {{ hasTotalPermission }}</p>
          <p>渠道权限: {{ hasChannelPermission }}</p>
          <p>商务权限: {{ hasSalesPermission }}</p>
          <p>当前页面: {{ indexStyle }}</p>
        </div> -->
      </div>
    </div>

    <!-- 图表内容区域 -->
    <div class="chart-content-container">
      <index-chart ref="indexChart" v-if="indexStyle === 1 && hasTotalPermission" :dateRange="dateRange"
        :compareDateRange="compareDateRange" :businessIds="businessIds" :consumeFilterType="consumeFilterType"
        @update:dateRange="dateRange = $event" @update:compareDateRange="compareDateRange = $event"
        @update:businessIds="businessIds = $event">
      </index-chart>
      <BusinessChart ref="businessChart" v-else-if="indexStyle === 2 && hasChannelPermission" :dateRange="dateRange"
        :compareDateRange="compareDateRange" :businessIds="businessIds" :filterType="filterType"
        @update:dateRange="dateRange = $event" @update:compareDateRange="compareDateRange = $event"
        @update:businessIds="businessIds = $event">
      </BusinessChart>
      <salsChart ref="salsChart" v-else-if="indexStyle === 3 && hasSalesPermission" :dateRange="dateRange"
        @update:dateRange="dateRange = $event">
      </salsChart>
      <serviceChart ref="serviceChart" v-if="indexStyle === 4" :dateRange="dateRange"
        :compareDateRange="compareDateRange" :businessIds="businessIds" @update:dateRange="dateRange = $event"
        @update:compareDateRange="compareDateRange = $event" @update:businessIds="businessIds = $event">
      </serviceChart>

      <NoPermission v-else-if="currentPermissionType === 'none'" />
    </div>

    <!-- 未绑定账户弹窗 -->
    <unbinding-account-modal ref="unbindingAccountModal"></unbinding-account-modal>
  </div>
</template>

<script>
import IndexChart from './IndexChart'
import BusinessChart from './bisnussChart.vue'
import salsChart from './salsChart.vue'
import NoPermission from './NoPermission.vue'
import UnbindingAccountModal from './components/UnbindingAccountModal.vue'
import { mapState } from 'vuex'
import { httpAction } from '@/api/manage'
import moment from 'moment'
import serviceChart from './serviceChart.vue'

function getYesterday(num = 1) {
  const date = new Date();
  date.setDate(date.getDate() - num);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDateRange(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return [
    `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`,
    `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`
  ];
}

export default {
  name: "Analysis",
  components: {
    IndexChart,
    BusinessChart,
    salsChart,
    NoPermission,
    UnbindingAccountModal,
    serviceChart
  },
  data() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const pad = (n) => String(n).padStart(2, '0');
    const firstDayStr = `${firstDay.getFullYear()}-${pad(firstDay.getMonth() + 1)}-${pad(firstDay.getDate())}`;
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    return {
      indexStyle: 1, // 临时默认值，在mounted中会重新设置
      dateRange: [getYesterday(), getYesterday()], // 昨日-昨日
      compareDateRange: [getYesterday(2), getYesterday(2)], // 前日-前日

      businessIds: '',
      filterType: 'recharge', // 充值或退款筛选
      consumeFilterType: 'normal', // 常规消耗或服务费筛选
      ranges: {
        '最近一周': getDateRange(7),
        '最近一月': getDateRange(30),
        '最近一年': getDateRange(365)
      },
      rangeUnbindingNum: 0,
      totalUnbindingNum: 0,
      unbindingLoading: false,
      bindingPopoverVisible: false,
    }
  },
  created() { },
  mounted() {
    // 在权限数据加载完成后设置默认的indexStyle
    this.$nextTick(() => {
      this.indexStyle = this.getDefaultIndexStyle();
    });
    // 页面加载时滚动到最顶部
    this.$nextTick(() => {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 300);
    });
    // 页面加载时自动查询未绑定数量
    this.getUnbindingNum();
  },
  computed: {
    ...mapState({
      // 主路由
      mainRouters: state => state.permission.addRouters,
      // 后台菜单
      permissionMenuList: state => state.user.permissionList
    }),
    hasTotalPermission() {
      return this.permissionMenuList && this.permissionMenuList.some(item => item.component === 'totalCharts')
    },
    hasChannelPermission() {
      return this.permissionMenuList && this.permissionMenuList.some(item => item.component === 'channelCharts')
    },
    hasSalesPermission() {
      return this.permissionMenuList && this.permissionMenuList.some(item => item.component === 'salesCharts')
    },
    currentPermissionType() {
      if (this.hasTotalPermission) return 'total'
      if (this.hasChannelPermission) return 'channel'
      if (this.hasSalesPermission) return 'sales'
      return 'none'
    },
    tooltipContent() {
      if (this.unbindingLoading) {
        return '数据加载中...';
      }
      return `当期周期内未绑定项目且有消耗的广告主ID共有${this.rangeUnbindingNum}个，系统内共有${this.totalUnbindingNum}个`;
    },
  },

  methods: {
    getDefaultIndexStyle() {
      // 按优先级顺序检查权限：汇总 > 渠道 > 销售
      if (this.hasTotalPermission) return 1
      if (this.hasChannelPermission) return 2
      if (this.hasSalesPermission) return 3
      return 1 // 默认返回1，如果没有权限会显示NoPermission组件
    },
    handleDateChange(dates) {
      if (dates && dates.length === 2) {
        this.dateRange = dates;
      }
    },
    handleCompareDateChange(dates) {
      if (dates && dates.length === 2) {
        this.compareDateRange = dates;
      }
    },
    handleFilterTypeChange(value) {
      // 确保传递的是字符串类型
      this.filterType = String(value.target ? value.target.value : value);
      // console.log('筛选类型变化:', this.filterType);
    },
    handleConsumeFilterTypeChange(value) {
      // 确保传递的是字符串类型
      this.consumeFilterType = String(value.target ? value.target.value : value);
      // console.log('消耗筛选类型变化:', this.consumeFilterType);
    },

    getUnbindingNum() {
      this.unbindingLoading = true;
      httpAction('/agentdata/getNotBinDingProAccountId', {
        beginDate: this.dateRange[0],
        endDate: this.dateRange[1],
      }, 'GET')
        .then((res) => {
          if (res.success) {
            this.rangeUnbindingNum = res.result.range_count || 0;
            this.totalUnbindingNum = res.result.total_count || 0;
          } else {
            this.$message.warning(res.message);
          }
        })
        .catch((error) => {
          this.$message.error('获取未绑定数量失败');
        })
        .finally(() => {
          this.unbindingLoading = false;
        });
    },
    goToBinding() {
      // 关闭popover
      this.bindingPopoverVisible = false;
      // 跳转到绑定页面
      this.$refs.unbindingAccountModal.show();
    },

    refreshData() {
      // 刷新所有子组件的数据
      this.$nextTick(() => {
        // 触发子组件的刷新方法
        if (this.$refs.indexChart && this.$refs.indexChart.refreshData) {
          this.$refs.indexChart.refreshData();
        }
        if (this.$refs.businessChart && this.$refs.businessChart.refreshData) {
          this.$refs.businessChart.refreshData();
        }
        if (this.$refs.salsChart && this.$refs.salsChart.refreshData) {
          this.$refs.salsChart.refreshData();
        }
        if (this.$refs.serviceChart && this.$refs.serviceChart.refreshData) {
          this.$refs.serviceChart.refreshData();
        }
      });
    },
  }
}
</script>

<style lang="less" scoped>
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.warning-tip {
  padding: 6px 12px;
  border-radius: 6px;
  background: rgba(255, 77, 79, 0.1);
  border: 1px solid rgba(255, 77, 79, 0.3);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 77, 79, 0.15);
    border-color: rgba(255, 77, 79, 0.5);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(255, 77, 79, 0.2);
  }

  &.normal-state {
    background: rgba(82, 196, 26, 0.1);
    border-color: rgba(82, 196, 26, 0.3);

    &:hover {
      background: rgba(82, 196, 26, 0.15);
      border-color: rgba(82, 196, 26, 0.5);
      box-shadow: 0 2px 8px rgba(82, 196, 26, 0.2);
    }
  }
}

.normal-icon {
  color: #52c41a !important;
  animation: none !important;
}

.normal-text {
  color: #52c41a !important;
}

.analysis-container {
  min-height: 100vh;
  padding: 0;
}

.filter-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 20px;
  margin: 10px;
  margin-top: 20px;
  transition: all 0.3s ease;
  z-index: 10;
  position: relative;

  &:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
}

.filter-content {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;

}

.filter-controls {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;

  label {
    font-size: 14px;
    color: #6b7280;
    white-space: nowrap;
    font-weight: 500;
  }

  /* 确保 Ant Design 组件正常显示 */
  .ant-calendar-picker {
    min-width: 100px;
  }

  .ant-select {
    min-width: 150px;
  }

  /* 保持选中状态的颜色 */
  .ant-radio-group {
    .ant-radio-button-wrapper {
      &.ant-radio-button-wrapper-checked {
        background-color: #165dff;
        border-color: #165dff;
        color: white;

        &:hover {
          background-color: #165dff;
          border-color: #165dff;
          color: white;
        }
      }
    }
  }
}

.page-switch-section {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 200px;
  flex-shrink: 0;
}

.tab-group {
  display: flex;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 4px;

  /* 确保单选按钮组正常显示 */
  .ant-radio-group {
    display: flex;
  }

  .ant-radio-button-wrapper {
    border: none;
    background: transparent;
    color: #6b7280;

    &:hover {
      color: #165dff;
    }

    &.ant-radio-button-wrapper-checked {
      background: #165dff;
      color: white;
      border-color: #165dff;
    }
  }
}

.refresh-button {
  background: #165dff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: rgba(22, 93, 255, 0.9);
  }

  .anticon {
    font-size: 12px;
  }
}

.chart-content-container {
  margin: 0 10px;
  padding: 5px 0;

  /* 覆盖子组件的margin设置，确保对齐 */
  :deep(.page-header-index-wide) {
    margin: 0 !important;
  }

  :deep(.top-pc),
  :deep(.top) {
    margin: 0 !important;
    border-radius: 12px !important;
  }

  /* 只覆盖chart-section的左右margin，保留top margin */
  :deep(.chart-section) {
    margin-left: 0 !important;
    margin-right: 0 !important;
    border-radius: 12px !important;
  }

  :deep(.ranks-row) {
    margin-left: 0 !important;
    margin-right: 0 !important;
    border-radius: 12px !important;
  }

  /* 覆盖bisnussChart组件的样式 */
  :deep(.top-container) {
    margin: 0 !important;
  }

  :deep(.top) {
    border-radius: 12px !important;
  }

  /* 覆盖salsChart组件的样式 */
  :deep(.tab-container) {
    margin: 0 !important;
    border-radius: 12px !important;
  }

  /* 只覆盖明确设置为margin: 0的样式，不覆盖其他margin设置 */
  :deep([style*="margin: 0px"]) {
    margin: 0 !important;
  }

  :deep([style*="margin:0px"]) {
    margin: 0 !important;
  }

  /* 统一所有卡片的样式 */
  :deep(.total-consumption-card) {
    border-radius: 12px !important;
  }

  :deep(.chart-wrapper) {
    border-radius: 12px !important;
  }

  :deep(.chart-container) {
    border-radius: 12px !important;
  }

  /* 覆盖内联样式中的border-radius */
  :deep([style*="border-radius: 4px"]) {
    border-radius: 12px !important;
  }

  :deep([style*="border-radius: 8px"]) {
    border-radius: 12px !important;
  }

  /* 覆盖所有可能的卡片容器 */
  :deep(.chart-row) {
    border-radius: 12px !important;
  }

  :deep(.ranks-row) {
    border-radius: 12px !important;
  }

  /* 确保所有白色背景的容器都有统一的样式 */
  :deep([style*="background-color: #fff"]) {
    border-radius: 12px !important;
  }
}

.top {
  display: flex;
  justify-content: space-around;
  padding: 16px 24px;
  margin-bottom: 24px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  transition: box-shadow 0.3s ease;
  animation: fadeIn 0.5s ease-in;
}

.top-item {
  display: flex;
  align-items: center;
  flex: 1;
  padding: 0 16px;
  position: relative;
}

.top-item:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 40px;
  width: 1px;
  background: #f0f0f0;
}

.top-icon {
  font-size: 32px;
  color: #1890ff;
  margin-right: 16px;
}

.top-content {
  display: flex;
  flex-direction: column;
}

.top-label {
  font-size: 16px;
  color: rgba(0, 0, 0, 0.65);
  margin-bottom: 4px;
}

.top-value {
  font-size: 28px;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.85);
}

.top-compare {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  margin-top: 4px;

  span {
    margin-right: 8px;
  }
}

.trend {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: 8px;
  transition: background 0.3s ease;

  &.up {
    background: rgba(245, 34, 45, 0.1);
    color: #f5222d;

    .anticon {
      margin-right: 2px;
    }
  }

  &.down {
    background: rgba(82, 196, 26, 0.1);
    color: #52c41a;

    .anticon {
      margin-right: 2px;
    }
  }

  &-text {
    font-size: 12px;
  }
}

.list-enter-active {
  animation: slideDown 0.5s;
}

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

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .filter-content {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .filter-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    width: 100%;
  }

  .page-switch-section {
    width: 100%;
    justify-content: center;
  }

  .filter-item {
    width: 100%;
    justify-content: space-between;
    padding: 10px 12px;
  }

  .filter-section {
    padding: 20px 24px;
    margin: 10px;
  }
}

/* 确保所有筛选元素都可见 */
.filter-section * {
  visibility: visible !important;
}

.filter-item {
  visibility: visible !important;
  display: flex !important;
}

.page-switch-section {
  visibility: visible !important;
  display: flex !important;
}

.tab-group {
  visibility: visible !important;
  display: flex !important;
}

/* 强制显示所有 Ant Design 组件 */
.ant-calendar-picker,
.ant-select,
.ant-radio-group,
.ant-radio-button-wrapper {
  visibility: visible !important;
  display: block !important;
}

/* 确保标签页切换按钮可见 */
.ant-radio-button-wrapper {
  display: inline-block !important;
  visibility: visible !important;
}
</style>

<style lang="less">
/* 移动端适配 - 全局样式 */
@media (max-width: 768px) {
  .analysis-container .ranks-row {
    /* 移动端保持无阴影 */
    box-shadow: none;
  }
}

.custom-popover {
  .ant-popover-inner-content {
    background-color: #333;
    color: #fff;
  }

  .ant-popover-arrow {
    border-right-color: #333 !important;
    border-bottom-color: #333 !important;
  }

  .custom-popover-text {
    color: #fff;
    margin-bottom: 8px;
  }

  .ant-btn-primary.ant-btn-background-ghost {
    color: #fff;
    border-color: #fff;

    &:hover {
      color: #fff;
      border-color: #fff;
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
}
</style>