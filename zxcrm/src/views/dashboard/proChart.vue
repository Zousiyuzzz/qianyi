<template>
  <div class="page-header-index-wide">
    <div>
      <div :class="{ top: device != 'desktop', 'top-pc': device == 'desktop' }">
        <div class="top-group day-group">
          <div class="top-item">
            <div class="top-icon"><a-icon type="dollar" /></div>
            <div class="top-content">
              <div class="top-label">昨日总消耗
                <span class="trend-inline" :class="trendDirection">
                  <a-icon :type="trendDirection === 'up' ? 'caret-up' : 'caret-down'" />
                  <span>{{ trendPercentage }}</span>
                </span>
              </div>
              <div class="top-value">¥{{ totalConsumeNum.toFixed(3) }}</div>
            </div>
          </div>
          <div class="top-item">
            <div class="top-icon"><a-icon type="user-add" /></div>
            <div class="top-content">
              <div class="top-label">新开账户数
                <span class="trend-inline" :class="newAccountNumTrendDirection">
                  <a-icon :type="newAccountNumTrendDirection === 'up' ? 'caret-up' : 'caret-down'" />
                  <span>{{ newAccountNumTrendPercentage }}</span>
                </span>
              </div>
              <div class="top-value">{{ newAccountNum }}</div>
            </div>
          </div>
          <div class="top-item">
            <div class="top-icon"><a-icon type="wallet" /></div>
            <div class="top-content">
              <div class="top-label">有花费账户数
                <span class="trend-inline" :class="accountHasConsumeTrendDirection">
                  <a-icon :type="accountHasConsumeTrendDirection === 'up' ? 'caret-up' : 'caret-down'" />
                  <span>{{ accountHasConsumeTrendPercentage }}</span>
                </span>
              </div>
              <div class="top-value">{{ totalHasConsumeAccountNum }}</div>
            </div>
          </div>
        </div>
        <!-- 本月数据卡片分组 -->
        <div class="top-group month-group">
          <div class="top-item">
            <div class="top-icon"><a-icon type="dollar" /></div>
            <div class="top-content">
              <div class="top-label">本月总消耗
                <span class="trend-inline" :class="monthTotalConsumeTrendDirection">
                  <a-icon :type="monthTotalConsumeTrendDirection === 'up' ? 'caret-up' : 'caret-down'" />
                  <span>{{ monthTotalConsumeTrendPercentage }}</span>
                </span>
              </div>
              <div class="top-value">¥{{ (monthTotalConsume || 0).toFixed(2) }}</div>
            </div>
          </div>
          <div class="top-item">
            <div class="top-icon"><a-icon type="user-add" /></div>
            <div class="top-content">
              <div class="top-label">本月新开账户数
                <span class="trend-inline" :class="monthNewAccountTrendDirection">
                  <a-icon :type="monthNewAccountTrendDirection === 'up' ? 'caret-up' : 'caret-down'" />
                  <span>{{ monthNewAccountTrendPercentage }}</span>
                </span>
              </div>
              <div class="top-value">{{ monthNewAccountNum }}</div>
            </div>
          </div>
          <div class="top-item">
            <div class="top-icon"><a-icon type="wallet" /></div>
            <div class="top-content">
              <div class="top-label">本月有花费账户数
                <span class="trend-inline" :class="monthHasConsumeAccountTrendDirection">
                  <a-icon :type="monthHasConsumeAccountTrendDirection === 'up' ? 'caret-up' : 'caret-down'" />
                  <span>{{ monthHasConsumeAccountTrendPercentage }}</span>
                </span>
              </div>
              <div class="top-value">{{ monthHasConsumeAccountNum }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-section" style="height: 46vh; width: 100%; border-radius: 8px; margin-top: 10px;">
        <div class="chart-row"
          style="width: 100%; height: 100%; display: flex; border: 1px solid #f0f0f0; border-radius: 4px; background-color: #fff; overflow: hidden;">
          <div style="flex: 1; max-width: 100%;">
            <PlatformTotalByDay :dateRange="dateRange"></PlatformTotalByDay>
          </div>
        </div>
      </div>

      <div style="height: fit-content;margin-top: 15px;">
        <div class="ranks-row"
          style="width: 100%; height: 100%; display: flex; border: 1px solid #f0f0f0; border-radius: 4px;  gap: 20px;">
          <div style="width: 100%; flex: 1; padding: 0px;">
            <rank-list style="padding: 10px 20px;border-radius: 8px; transition: box-shadow 0.3s ease;" title="渠道消耗排行榜"
              :list="channelRankList" :loading="rankLoading" />
          </div>
          <!-- <div style="width: 100%; flex: 1; padding: 10px;">
            <rank-list style="padding: 10px 20px;" title="客户消耗排行榜" :list="cusRankList" :loading="rankLoading2" />
          </div> -->
          <div style="width: 100%; flex: 1; padding: 0px;">
            <rank-list style="padding: 10px 20px;border-radius: 8px; transition: box-shadow 0.3s ease;" title="项目消耗排行榜"
              :list="proRankList" :loading="rankLoading" />
          </div>
          <div style="width: 100%; flex: 1; padding: 0px;">
            <rank-list style="padding: 10px 20px;border-radius: 8px; transition: box-shadow 0.3s ease;" title="商务消耗排行榜"
              :list="busRankList" :loading="rankLoading" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { httpAction } from '@/api/manage';
import RankList from '@/components/chart/RankList';
import PlatformTotalByDay from './components/platformTotalByDay.vue';
import PlatformTotal from './components/platformTotal.vue';

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
    PlatformTotalByDay,
    PlatformTotal
  },
  mixins: [mixinDevice],
  props: {
    dateRange: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      topLoading: true,
      pendingTopRequests: 0,
      rankLoading: true,
      totalConsumeNum: 0,
      totalConsumeNumLast: 0,
      totalHasConsumeAccountNum: 0,
      totalHasConsumeAccountNumLast: 0,
      newAccountNum: 0,
      newAccountNumLast: 0,
      // 上月数据
      lastMonthTotalConsume: 0,
      lastMonthNewAccount: 0,
      lastMonthHasConsumeAccount: 0,
      // 本月数据
      monthTotalConsume: 0,
      monthNewAccountNum: 0,
      monthHasConsumeAccountNum: 0,
      busRankList: [],
      proRankList: [],
      cusRankList: [],
      salesRankList: [],
      channelRankList: [],
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
    // 同比上月
    totalConsumeMonthTrendPercentage() {
      if (this.lastMonthTotalConsume === 0) return '0%';
      const change = ((this.totalConsumeNum - this.lastMonthTotalConsume) / this.lastMonthTotalConsume) * 100;
      return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
    },
    totalConsumeMonthTrendDirection() {
      if (this.lastMonthTotalConsume === 0) return 'down';
      return this.totalConsumeNum > this.lastMonthTotalConsume ? 'up' : 'down';
    },
    newAccountMonthTrendPercentage() {
      if (this.lastMonthNewAccount === 0) return '0%';
      const change = ((this.newAccountNum - this.lastMonthNewAccount) / this.lastMonthNewAccount) * 100;
      return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
    },
    newAccountMonthTrendDirection() {
      if (this.lastMonthNewAccount === 0) return 'down';
      return this.newAccountNum > this.lastMonthNewAccount ? 'up' : 'down';
    },
    hasConsumeAccountMonthTrendPercentage() {
      if (this.lastMonthHasConsumeAccount === 0) return '0%';
      const change = ((this.totalHasConsumeAccountNum - this.lastMonthHasConsumeAccount) / this.lastMonthHasConsumeAccount) * 100;
      return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
    },
    hasConsumeAccountMonthTrendDirection() {
      if (this.lastMonthHasConsumeAccount === 0) return 'down';
      return this.totalHasConsumeAccountNum > this.lastMonthHasConsumeAccount ? 'up' : 'down';
    },
    // 本月数据同比
    monthTotalConsumeTrendPercentage() {
      if (this.lastMonthTotalConsume === 0) return '0%';
      const change = ((this.monthTotalConsume - this.lastMonthTotalConsume) / this.lastMonthTotalConsume) * 100;
      return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
    },
    monthTotalConsumeTrendDirection() {
      if (this.lastMonthTotalConsume === 0) return 'down';
      return this.monthTotalConsume > this.lastMonthTotalConsume ? 'up' : 'down';
    },
    monthNewAccountTrendPercentage() {
      if (this.lastMonthNewAccount === 0) return '0%';
      const change = ((this.monthNewAccountNum - this.lastMonthNewAccount) / this.lastMonthNewAccount) * 100;
      return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
    },
    monthNewAccountTrendDirection() {
      if (this.lastMonthNewAccount === 0) return 'down';
      return this.monthNewAccountNum > this.lastMonthNewAccount ? 'up' : 'down';
    },
    monthHasConsumeAccountTrendPercentage() {
      if (this.lastMonthHasConsumeAccount === 0) return '0%';
      const change = ((this.monthHasConsumeAccountNum - this.lastMonthHasConsumeAccount) / this.lastMonthHasConsumeAccount) * 100;
      return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
    },
    monthHasConsumeAccountTrendDirection() {
      if (this.lastMonthHasConsumeAccount === 0) return 'down';
      return this.monthHasConsumeAccountNum > this.lastMonthHasConsumeAccount ? 'up' : 'down';
    },

  },
  created() {
    // 默认日期范围由父组件设置，子组件不再修改，避免重复请求
    // 顶部卡片并行加载昨天与前天数据
    this.topLoading = true;
    this.pendingTopRequests = 2;
    this.getTopData();
    this.getYesterdayTopData();
    this.getRankList();
    this.getLastMonthData();
    this.getMonthData();
  },
  mounted() { },
  watch: {
    dateRange: {
      handler(newVal) {
        if (newVal && newVal.length === 2) {
          this.getRankList();
        }
      },
      deep: true
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
      httpAction('/agentdata/topData', {
        beginDate: getYesterday(),
        endDate: getYesterday(),
      }, 'GET')
        .then((res) => {
          if (res.success) {
            this.totalConsumeNum = res.result ? res.result.sumConsume : 0
            this.newAccountNum = res.result ? res.result.newAccountNum : 0
            this.totalHasConsumeAccountNum = res.result ? res.result.consumeAccountNum : 0
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
      httpAction('/agentdata/topData', {
        beginDate: getYesterday(2),
        endDate: getYesterday(2),
      }, 'GET')
        .then((res) => {
          if (res.success) {
            this.totalConsumeNumLast = res.result ? res.result.sumConsume : 0
            this.newAccountNumLast = res.result ? res.result.newAccountNum : 0
            this.totalHasConsumeAccountNumLast = res.result ? res.result.consumeAccountNum : 0
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
      ///agentdata/rankingData
      httpAction('/agentdata/rankingData', {
        beginDate: this.dateRange[0],
        endDate: this.dateRange[1],
      }, 'GET').then((res) => {
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
              name: item.channel_name,
              total: item.total_charged
            }
          })
        } else {
          this.$message.warning(res.message);
        }
        this.rankLoading = false;
      }).catch((error) => {
        // console.log('获取排行榜数据失败', error)
        this.$message.error('获取排行榜数据失败');
      }).finally(() => {
      });
    },


    // getDateRange(days) {
    //   const end = new Date();
    //   const start = new Date();
    //   start.setDate(start.getDate() - days);
    //   return [
    //     `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`,
    //     `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`
    //   ];
    // },

    getLastMonthData() {
      // 获取上个月的数据
      const yesterday = getYesterday();
      const yesterdayDate = new Date(yesterday);
      const lastMonthYesterday = new Date(yesterdayDate);
      lastMonthYesterday.setMonth(lastMonthYesterday.getMonth() - 1);

      // 处理月份天数不同的情况
      const currentDay = yesterdayDate.getDate();
      const lastMonthDays = new Date(lastMonthYesterday.getFullYear(), lastMonthYesterday.getMonth() + 1, 0).getDate();
      const lastMonthDay = Math.min(currentDay, lastMonthDays);
      lastMonthYesterday.setDate(lastMonthDay);

      const lastMonthYesterdayStr = lastMonthYesterday.toISOString().slice(0, 10);
      const lastMonthFirstDayStr = new Date(lastMonthYesterday.getFullYear(), lastMonthYesterday.getMonth(), 1).toISOString().slice(0, 10);

      // 获取上月总消耗和有花费账户数（从上月1号到上月对应的昨天）
      httpAction('agentdata/topData', {
        beginDate: lastMonthFirstDayStr,
        endDate: lastMonthYesterdayStr,
      }, 'GET')
        .then((res) => {
          if (res.success) {
            this.lastMonthTotalConsume = res.result ? res.result.sumConsume : 0
            this.lastMonthHasConsumeAccount = res.result ? res.result.consumeAccountNum : 0
            this.lastMonthNewAccount = res.result ? res.result.newAccountNum : 0
          }
        })
        .catch(e => {
          console.error('获取上月消耗数据失败:', e);
        });
    },
    getMonthData() {
      // 获取本月的数据，从本月1号到昨天
      const yesterday = getYesterday();
      const yesterdayDate = new Date(yesterday);
      const firstDayOfMonth = new Date(yesterdayDate.getFullYear(), yesterdayDate.getMonth(), 1);
      const firstDayStr = firstDayOfMonth.toISOString().slice(0, 10);
      const yesterdayStr = yesterday;

      // 获取本月（从本月1号到昨天）
      httpAction('/agentdata/topData', {
        beginDate: firstDayStr,
        endDate: yesterdayStr,
      }, 'GET')
        .then((res) => {
          if (res.success) {
            this.monthTotalConsume = res.result ? res.result.sumConsume : 0
            this.monthHasConsumeAccountNum = res.result ? res.result.consumeAccountNum : 0
            this.monthNewAccountNum = res.result ? res.result.newAccountNum : 0
          }
        })
        .catch(e => {
          console.error('获取本月消耗数据失败:', e);
        });
    },
  },
};
</script>

<style lang="less" scoped>
.top-pc {
  display: flex;
  justify-content: space-between;
  padding: 16px 24px;
  margin: 10px;
  background: #fff;
  // border-radius: 8px;
  // transition: box-shadow 0.3s ease;
  // border-bottom: 1px solid #f0f0f0;
  // animation: fadeIn 0.5s ease-in;
  // flex-wrap: wrap;

  &-group {
    display: flex;
    flex-direction: row;
    flex: 1;
  }

  &-item {
    display: flex;
    align-items: center;
    flex: none;
    padding: 0 16px;
    position: relative;
    min-width: 200px;
    margin-bottom: 8px;

    &:not(:last-child)::after {
      content: '';
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      height: 40px;
      width: 1px;
      background: #f0f0f0;
    }

    &:nth-child(3n)::after {
      display: none;
    }
  }

  &-icon {
    font-size: 32px;
    color: #1890ff;
    margin-right: 16px;
  }

  &-content {
    display: flex;
    flex-direction: column;
  }

  &-label {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.65);
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    column-gap: 6px;
    white-space: nowrap;
  }

  &-value {
    font-size: 22px;
    font-weight: bold;
    color: rgba(0, 0, 0, 0.85);
    margin-bottom: 8px;
  }

  &-compare {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.65);
    margin-bottom: 4px;

    span {
      margin-right: 8px;
    }
  }

  .trend {
    display: inline-flex;
    align-items: center;
    padding: 2px 6px;
    border-radius: 12px;
    transition: background 0.3s ease;

    &.up {
      background: rgba(245, 34, 45, 0.1);
      color: #f5222d;

      .anticon {
        margin-right: 4px;
      }
    }

    &.down {
      background: rgba(82, 196, 26, 0.1);
      color: #52c41a;

      .anticon {
        margin-right: 4px;
      }
    }

    &-text {
      font-size: 12px;
    }
  }

  .trend-inline {
    display: inline-flex;
    align-items: center;
    column-gap: 4px;
    padding: 0 6px;
    border-radius: 10px;
  }

  .trend-inline.up {
    color: #f5222d;
    background: rgba(245, 34, 45, 0.08);
  }

  .trend-inline.down {
    color: #52c41a;
    background: rgba(82, 196, 26, 0.08);
  }
}


.top {
  display: flex;
  justify-content: space-between;
  padding: 16px 24px;
  margin: 10px;
  background: #fff;
  border-radius: 8px;
  transition: box-shadow 0.3s ease;
  border-bottom: 1px solid #f0f0f0;
  animation: fadeIn 0.5s ease-in;
  flex-wrap: wrap;

  // &:hover {
  //   box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  // }

  &-group {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  &-item {
    display: flex;
    align-items: center;
    flex: none;
    padding: 0 16px;
    position: relative;
    min-width: 200px;
    margin-bottom: 8px;

    &:not(:last-child)::after {
      content: '';
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      height: 40px;
      width: 1px;
      background: #f0f0f0;
    }

    &:nth-child(3n)::after {
      display: none;
    }
  }

  &-icon {
    font-size: 32px;
    color: #1890ff;
    margin-right: 16px;
  }

  &-content {
    display: flex;
    flex-direction: column;
  }

  &-label {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.65);
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    column-gap: 6px;
    white-space: nowrap;
  }

  &-value {
    font-size: 22px;
    font-weight: bold;
    color: rgba(0, 0, 0, 0.85);
    margin-bottom: 8px;
  }

  &-compare {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.65);
    margin-bottom: 4px;

    span {
      margin-right: 8px;
    }
  }

  .trend {
    display: inline-flex;
    align-items: center;
    padding: 2px 6px;
    border-radius: 12px;
    transition: background 0.3s ease;

    &.up {
      background: rgba(245, 34, 45, 0.1);
      color: #f5222d;

      .anticon {
        margin-right: 4px;
      }
    }

    &.down {
      background: rgba(82, 196, 26, 0.1);
      color: #52c41a;

      .anticon {
        margin-right: 4px;
      }
    }

    &-text {
      font-size: 12px;
    }
  }

  .trend-inline {
    display: inline-flex;
    align-items: center;
    column-gap: 4px;
    padding: 0 6px;
    border-radius: 10px;
  }

  .trend-inline.up {
    color: #f5222d;
    background: rgba(245, 34, 45, 0.08);
  }

  .trend-inline.down {
    color: #52c41a;
    background: rgba(82, 196, 26, 0.08);
  }
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

/* 移动端垂直排列 */
@media (max-width: 768px) {
  as {
    flex-direction: column !important;
    height: auto !important;
    row-gap: 10px;
  }

  .chart-row>div {
    max-width: 100% !important;
    width: 100% !important;
  }

  .chart-section {
    height: auto !important;
  }

  .ranks-row {
    flex-direction: column !important;
  }

  .ranks-row>div {
    width: 100% !important;
    // padding: 10px !important;
  }

  .top {
    flex-direction: row;
    align-items: flex-start;
    padding: 12px 12px;
  }

  .top-group {
    width: 50%;
    padding: 0 6px;
  }

  .top-item {
    padding: 6px 8px;
    min-width: auto;
    margin-bottom: 6px;
    justify-content: center;
  }

  .top-icon {
    display: none;
  }

  .top-content {
    align-items: center;
    text-align: center;
  }

  .top-item:after {
    display: none !important;
  }

  .top-label {
    font-size: 12px;
    justify-content: center;
  }

  .top-value {
    font-size: 18px;
  }

  .top-compare {
    font-size: 12px;
  }
}

/* 桌面端为中间两图添加列间距，避免文字贴边重叠 */
.chart-row {
  column-gap: 10px;
}
</style>
