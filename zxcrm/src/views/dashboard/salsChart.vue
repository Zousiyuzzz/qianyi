<template>
  <div class="page-header-index-wide" style="background-color: #fff;">
    <div style="padding-top: 10px;">
      <!-- Tab Switching -->
      <div class="tab-container">
        <div class="tab-header">
          <a-tabs v-model="activeTab" @change="handleTabChange">
            <a-tab-pane key="pro" tab="项目消耗"></a-tab-pane>
            <!-- <a-tab-pane key="cus" tab="客户消耗"></a-tab-pane> -->
            <!-- <a-tab-pane key="bus" tab="业务消耗"></a-tab-pane> -->
            <a-tab-pane key="channel" tab="渠道消耗"></a-tab-pane>
            <a-tab-pane key="proRecharge" tab="项目充值"></a-tab-pane>
            <a-tab-pane key="proRefund" tab="项目退款"></a-tab-pane>
            <a-tab-pane key="channelRecharge" tab="渠道充值"></a-tab-pane>
            <a-tab-pane key="channelRefund" tab="渠道退款"></a-tab-pane>
          </a-tabs>
          <!-- 刷新按钮 -->
          <!-- <a-button type="primary" icon="reload" :loading="refreshing" @click="refreshData" class="refresh-btn">
            刷新数据
          </a-button> -->
        </div>
        <!-- Total Consumption Cards -->
        <div class="total-consumption-cards">
          <div class="total-consumption-card">
            <a-icon type="pay-circle" class="total-icon" />
            <div class="total-content">
              <span class="total-label">总消耗金额</span>
              <span class="total-value">￥{{ (totalConsume || 0).toFixed(3) }}</span>
              <span class="total-date">{{ dateRange[0] }} 至 {{ dateRange[1] }}</span>
            </div>
          </div>
          <div class="total-consumption-card">
            <a-icon type="wallet" class="total-icon" />
            <div class="total-content">
              <span class="total-label">总现金消耗</span>
              <span class="total-value">￥{{ (totalCashDrain || 0).toFixed(3) }}</span>
              <span class="total-date">{{ dateRange[0] }} 至 {{ dateRange[1] }}</span>
            </div>
          </div>
        </div>
        <!-- Main Chart Container -->
        <div class="chart-container">
          <div class="chart-wrapper">
            <div class="chart-content">
              <a-spin :spinning="saleLoading1" class="chart-spin" v-if="activeTab === 'pro'">
                <proTotal :dateRange="dateRange" :proCousumeList="proCousumeList"></proTotal>
              </a-spin>
              <!-- <a-spin :spinning="saleLoading2" class="chart-spin" v-if="activeTab === 'cus'">
                <cusTotal :dateRange="dateRange" :proCousumeList="cusCousumeList"></cusTotal>
              </a-spin> -->
              <!-- <a-spin :spinning="saleLoading3" class="chart-spin" v-if="activeTab === 'bus'">
                <busTotal :dateRange="dateRange" :proCousumeList="busCousumeList"></busTotal>
              </a-spin> -->
              <a-spin :spinning="saleLoading4" class="chart-spin" v-if="activeTab === 'channel'">
                <channelTotal :dateRange="dateRange" :proCousumeList="channelCousumeList"></channelTotal>
              </a-spin>
              <a-spin :spinning="saleLoading5" class="chart-spin" v-if="activeTab === 'proRecharge'">
                <proRechargeTotal :dateRange="dateRange" :proRechargeList="proRechargeList"></proRechargeTotal>
              </a-spin>
              <a-spin :spinning="saleLoading6" class="chart-spin" v-if="activeTab === 'proRefund'">
                <proRefundTotal :dateRange="dateRange" :proRefundList="proRefundList"></proRefundTotal>
              </a-spin>
              <a-spin :spinning="saleLoading7" class="chart-spin" v-if="activeTab === 'channelRecharge'">
                <channelRechargeTotal :dateRange="dateRange" :channelRechargeList="channelRechargeList">
                </channelRechargeTotal>
              </a-spin>
              <a-spin :spinning="saleLoading8" class="chart-spin" v-if="activeTab === 'channelRefund'">
                <channelRefundTotal :dateRange="dateRange" :channelRefundList="channelRefundList"></channelRefundTotal>
              </a-spin>
            </div>
          </div>
        </div>
        <!-- <div class="additional-charts">
          <div class="chart-wrapper">
            <div ref="dailyTrendChart" class="chart"></div>
          </div>
          <div class="chart-wrapper">
            <div ref="consumptionPieChart" class="chart"></div>
          </div>
          <div class="chart-wrapper">
            <div ref="consumptionBarChart" class="chart"></div>
          </div>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script>
import { httpAction } from '@/api/manage';
import proTotal from './sales/proTotal.vue';
import channelTotal from './sales/channelTotal.vue';
import proRechargeTotal from './sales/proRechargeTotal.vue';
import proRefundTotal from './sales/proRefundTotal.vue';
import channelRechargeTotal from './sales/channelRechargeTotal.vue';
import channelRefundTotal from './sales/channelRefundTotal.vue';
import { getDictLabel, getDictLabelSync, getDictLabels, getDictLabelsSync } from '@/utils/dictUtils'


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
    proTotal,
    channelTotal,
    proRechargeTotal,
    proRefundTotal,
    channelRechargeTotal,
    channelRefundTotal,
  },
  props: {
    dateRange: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      loading: true,
      activeTab: 'pro',
      proCousumeList: [],
      channelCousumeList: [],
      proRechargeList: [],
      proRefundList: [],
      channelRechargeList: [],
      channelRefundList: [],
      totalConsume: 0,
      totalCashDrain: 0,
      saleLoading1: false,
      saleLoading4: false,
      saleLoading5: false,
      saleLoading6: false,
      saleLoading7: false,
      saleLoading8: false,
      refreshing: false,

    };
  },
  computed: {

    currentConsumeList() {
      return this.activeTab === 'pro' ? this.proCousumeList :
        this.activeTab === 'channel' ? this.channelCousumeList :
          this.activeTab === 'proRecharge' ? this.proRechargeList :
            this.activeTab === 'proRefund' ? this.proRefundList :
              this.activeTab === 'channelRecharge' ? this.channelRechargeList :
                this.activeTab === 'channelRefund' ? this.channelRefundList :
                  this.proCousumeList;
    },
  },
  created() {
    this.getDataByActiveTab();
  },
  watch: {
    dateRange: {
      handler(newVal) {
        if (newVal && newVal.length === 2) {
          this.getDataByActiveTab();
        }
      },
      deep: true
    },
  },
  methods: {
    getDataByActiveTab() {
      switch (this.activeTab) {
        case 'pro':
          this.getProConsumeData();
          break;
        case 'channel':
          this.getChannelConsumeData();
          break;
        case 'proRecharge':
          this.getProRechargeData();
          break;
        case 'proRefund':
          this.getProRefundData();
          break;
        case 'channelRecharge':
          this.getChannelRechargeData();
          break;
        case 'channelRefund':
          this.getChannelRefundData();
          break;
        default:
          this.getProConsumeData();
      }
    },

    // 删除getddddata方法，因为项目消耗数据现在在getConsumeDataBySales中处理
    getTotalConsumeBySalePerson() {
      // 计算总消耗金额和总现金消耗
      this.calculateTotalConsumption();
    },
    calculateTotalConsumption() {
      // 计算总消耗金额 (total_charged的总和)
      this.totalConsume = this.proCousumeList.reduce((sum, item) => {
        return sum + (parseFloat(item.total_charged) || 0);
      }, 0);

      // 计算总现金消耗 (cash_drain的总和)
      this.totalCashDrain = this.proCousumeList.reduce((sum, item) => {
        return sum + (parseFloat(item.cash_drain) || 0);
      }, 0);
    },
    getProConsumeData() {
      this.saleLoading1 = true;
      let params = {
        beginDate: this.dateRange[0].format ? this.dateRange[0].format('YYYY-MM-DD') : this.dateRange[0],
        endDate: this.dateRange[1].format ? this.dateRange[1].format('YYYY-MM-DD') : this.dateRange[1],
        businessPerson: this.$store.getters.userInfo.id || '',
      }
      httpAction('/agentdata/businessDataPro', params, 'GET')
        .then((res) => {
          if (res.success) {
            // 处理返回的数据，使用total_charged作为金额字段
            this.proCousumeList = res.result.map(item => ({
              ...item,
              total_charged_in_yuan: item.total_charged, // 将total_charged映射为total_charged_in_yuan
              pro_name: item.pro_name,
              pro_id: item.pro_id,
              date_time: item.date_time,
              cash_drain: item.cash_drain,
              consumeAccountNum: item.consumeAccountNum,
              date: this.dateRange[0], // 保留原有的date字段用于兼容
            }));
            // 计算总消耗金额和总现金消耗
            this.calculateTotalConsumption();
          } else {
            this.$message.warning(res.message);
          }
        })
        .finally(() => {
          this.saleLoading1 = false;
        });
    },

    getChannelConsumeData() {
      this.saleLoading4 = true;
      let params = {
        beginDate: this.dateRange[0].format ? this.dateRange[0].format('YYYY-MM-DD') : this.dateRange[0],
        endDate: this.dateRange[1].format ? this.dateRange[1].format('YYYY-MM-DD') : this.dateRange[1],
        businessPerson: this.$store.getters.userInfo.id || '',
      }
      httpAction('/agentdata/businessDataChannel', params, 'GET')
        .then((res) => {
          if (res.success) {
            // 处理返回的数据，使用total_charged作为金额字段
            this.channelCousumeList = res.result.map(item => ({
              ...item,
              total_charged_in_yuan: item.total_charged, // 将total_charged映射为total_charged_in_yuan
              channelName: item.channel_sign, // 使用 channel_sign 作为渠道名称
              channel_id: item.channel_sign, // 使用 channel_sign 作为渠道ID
              date_time: item.date_time,
              cash_drain: item.cash_drain,
              consumeAccountNum: item.consumeAccountNum,
              date: this.dateRange[0], // 保留原有的date字段用于兼容
            }));
          } else {
            this.$message.warning(res.message);
          }
        })
        .finally(() => {
          this.saleLoading4 = false;
        });
    },

    getProRechargeData() {
      this.saleLoading5 = true;
      httpAction(
        '/fundTransferRecord/rechargeUserData',
        {
          beginDate: this.dateRange[0].format ? this.dateRange[0].format('YYYY-MM-DD') : this.dateRange[0],
          endDate: this.dateRange[1].format ? this.dateRange[1].format('YYYY-MM-DD') : this.dateRange[1],
          userId: this.$store.getters.userInfo.id || '',
        },
        'GET'
      )
        .then((res) => {
          if (res.success) {
            // 使用 rechargeUserDataPro 数组
            this.proRechargeList = res.result.rechargeUserDataPro.map(item => ({
              ...item,
              pro_name: item.pro_name,
              pro_id: item.pro_id,
              amount: item.amount,
              changeMoney: item.changeMoney,
              accountNum: item.accountNum,
              create_date: item.create_date,
              total_charged_in_yuan: item.amount, // 将amount映射为total_charged_in_yuan用于图表显示
              date: this.dateRange[0], // 保留原有的date字段用于兼容
            }));
          } else {
            this.$message.warning(res.message);
          }
        })
        .finally(() => {
          this.saleLoading5 = false;
        });
    },

    getProRefundData() {
      this.saleLoading6 = true;
      httpAction(
        '/fundTransferRecord/refundUserData',
        {
          beginDate: this.dateRange[0],
          endDate: this.dateRange[1],
          userId: this.$store.getters.userInfo.id || '',
        },
        'GET'
      )
        .then((res) => {
          if (res.success) {
            this.proRefundList = res.result.refundUserDataPro.map(item => ({
              ...item,
              pro_name: item.projectName || item.pro_name,
              pro_id: item.projectId || item.pro_id,
              amount: item.amount || item.changeMoney,
              id: item.id,
              date: this.dateRange[0],
            }));
          } else {
            this.$message.warning(res.message);
          }
        })
        .finally(() => {
          this.saleLoading6 = false;
        });
    },

    getChannelRechargeData() {
      this.saleLoading7 = true;
      httpAction(
        '/fundTransferRecord/rechargeUserData',
        {
          beginDate: this.dateRange[0].format ? this.dateRange[0].format('YYYY-MM-DD') : this.dateRange[0],
          endDate: this.dateRange[1].format ? this.dateRange[1].format('YYYY-MM-DD') : this.dateRange[1],
          userId: this.$store.getters.userInfo.id || '',
        },
        'GET'
      )
        .then((res) => {
          if (res.success) {
            // 使用 rechargeUserDataChannel 数组
            this.channelRechargeList = res.result.rechargeUserDataChannel.map(item => ({
              ...item,
              channelName: item.channel_sign, // 使用 channel_sign 作为渠道名称
              channel_id: item.channel_sign, // 使用 channel_sign 作为渠道ID
              amount: item.amount,
              changeMoney: item.changeMoney,
              accountNum: item.accountNum,
              create_date: item.create_date,
              total_charged_in_yuan: item.amount, // 将amount映射为total_charged_in_yuan用于图表显示
              date: this.dateRange[0], // 保留原有的date字段用于兼容
            }));
          } else {
            this.$message.warning(res.message);
          }
        })
        .finally(() => {
          this.saleLoading7 = false;
        });
    },

    getChannelRefundData() {
      this.saleLoading8 = true;
      httpAction(
        '/fundTransferRecord/refundUserData',
        {
          beginDate: this.dateRange[0],
          endDate: this.dateRange[1],
          userId: this.$store.getters.userInfo.id || '',
        },
        'GET'
      )
        .then((res) => {
          if (res.success) {
            this.channelRefundList = res.result.refundUserDataChannel.map(item => ({
              ...item,
              channel_name: item.channel_sign,
              channel_id: item.channelId || item.channel_id,
              amount: item.amount || item.changeMoney,
              id: item.id,
              date: this.dateRange[0],
            }));
          } else {
            this.$message.warning(res.message);
          }
        })
        .finally(() => {
          this.saleLoading8 = false;
        });
    },

    handleTabChange(key) {
      this.activeTab = key;
      // 切换tab时请求对应数据
      this.getDataByActiveTab();
    },
    refreshData() {
      this.refreshing = true;
      this.getDataByActiveTab();

      // 等待数据加载完成
      const checkLoading = () => {
        const currentLoading = this.getCurrentLoadingState();
        if (!currentLoading) {
          this.refreshing = false;
          this.$message.success('数据刷新成功');
        } else {
          setTimeout(checkLoading, 100);
        }
      };
      checkLoading();
    },

    getCurrentLoadingState() {
      switch (this.activeTab) {
        case 'pro':
          return this.saleLoading1;
        case 'channel':
          return this.saleLoading4;
        case 'proRecharge':
          return this.saleLoading5;
        case 'proRefund':
          return this.saleLoading6;
        case 'channelRecharge':
          return this.saleLoading7;
        case 'channelRefund':
          return this.saleLoading8;
        default:
          return this.saleLoading1;
      }
    },
  },
};
</script>

<style lang="less" scoped>
.tab-container {
  padding: 8px;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.total-consumption-cards {
  display: flex;
  gap: 12px;
  margin: 8px 0;
}

.total-consumption-card {
  flex: 1;
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  padding: 12px;

  .total-icon {
    font-size: 24px;
    color: #1890ff;
    margin-right: 12px;
  }

  .total-content {
    display: flex;
    flex-direction: column;

    .total-label {
      font-size: 14px;
      color: #666;
      margin-bottom: 4px;
    }

    .total-value {
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }

    .total-date {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
    }
  }
}

.chart-container {
  height: 50vh;
  padding: 8px;
  min-width: 100%;
}

.chart-wrapper {
  width: 100%;
  height: 100%;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  position: relative;
}

.chart-content {
  width: 100%;
  height: 100%;
  position: relative;
}

.chart-spin {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-spin :deep(.ant-spin-container) {
  width: 100%;
  height: 100%;
}

.refresh-btn {
  margin-left: 10px;
}

.additional-charts {
  display: flex;
  gap: 8px;
  padding: 8px;
}

.additional-charts .chart-wrapper {
  flex: 1;
  height: 30vh;
}

.chart {
  width: 100%;
  height: 100%;
}
</style>