<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="开始月份">
              <a-month-picker v-model="queryParam.dateMonthBegin" placeholder="请选择开始月份" :value-format="'YYYY-MM'"
                style="width: 100%;" @change="handleMonthChange" />
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="结束月份">
              <a-month-picker v-model="queryParam.dateMonthEnd" placeholder="请选择结束月份" :value-format="'YYYY-MM'"
                style="width: 100%;" @change="handleMonthChange" />
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="项目">
              <JSearchSelectTag placeholder="请选择项目" v-model="queryParam.proId"
                dict="tab_projectManage,pro_name,id,del_flag = '0'" async allowClear />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
      <a-button type="primary" @click="handleUpdateData" icon="sync" :loading="updateLoading">
        {{ updateLoading ? '刷新中' : '刷新返点数据' }}
      </a-button>
      <!-- <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
      <a-button type="primary" icon="download" @click="handleExportXls('客户回款记录表')">导出</a-button> -->
      <!-- <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl"
        @change="handleImportExcel">
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload> -->
      <!-- 高级查询区域 -->
      <!-- <j-super-query :fieldList="superFieldList" ref="superQueryModal"
        @handleSuperQuery="handleSuperQuery"></j-super-query> -->
      <!-- <a-dropdown v-if="selectedRowKeys.length > 0"> -->
      <!-- <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete" />删除</a-menu-item>
        </a-menu> -->
      <!-- <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button> -->
      <!-- </a-dropdown> -->
    </div>

    <!-- table区域-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{
          selectedRowKeys.length }}</a>项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>

      <a-table ref="table" size="middle" :scroll="{ x: true }" bordered rowKey="id" :columns="columns"
        :dataSource="dataSource" :pagination="ipagination" :loading="loading"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }" class="j-table-force-nowrap"
        @change="handleTableChange">

        <template slot="footer">
          <div style="text-align: center; font-weight: bold;padding-top: -10px;">
            <div style="margin-bottom: 8px; color: #1890ff;">当前列表汇总</div>
            <div>
              <span style="margin-right: 20px;">总消耗：{{ totalCharged.toFixed(2) }}</span>
              <span style="margin-right: 20px;">现金消耗：{{ totalCashDrain.toFixed(2) }}</span>
              <span style="margin-right: 20px;">收入：{{ totalRevenue.toFixed(2) }}</span>
              <span style="margin-right: 20px;">返点金额：{{ totalRebateAmount.toFixed(2) }}</span>
              <span>到账金额：{{ totalArrivalAmount.toFixed(2) }}</span>
            </div>
          </div>
        </template>

        <template slot="htmlSlot" slot-scope="text">
          <div v-html="text"></div>
        </template>
        <template slot="imgSlot" slot-scope="text,record">
          <span v-if="!text" style="font-size:  12px;font-style: italic;">无图片</span>
          <img v-else :src="getImgView(text)" :preview="record.id" height="25px" alt=""
            style="max-width:80px;font-size: 12px;font-style: italic;" />
        </template>
        <template slot="fileSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无文件</span>
          <a-button v-else :ghost="true" type="primary" icon="download" size="small" @click="downloadFile(text)">
            下载
          </a-button>
        </template>
      </a-table>
    </div>

    <tab-customer-payment-record-modal ref="modalForm" @ok="modalFormOk"></tab-customer-payment-record-modal>
    <fenpei-drawer ref="fenpeiDrawer" @ok="modalFormOk"></fenpei-drawer>
  </a-card>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import TabCustomerPaymentRecordModal from './modules/TabCustomerPaymentRecordModal'
import FenpeiDrawer from './FenpeiDrawer'
import { queryDepartTreeList } from '@/api/api'
import { httpAction } from '@/api/manage'
export default {
  name: 'BackmoneyList.vue',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    TabCustomerPaymentRecordModal,
    FenpeiDrawer
  },
  data() {
    return {
      isorter: {
        column: 'month',
        order: 'desc',
      },
      queryParam: {
        dateMonthBegin: null,
        dateMonthEnd: null
      },
      description: '回款记录表管理页面',
      updateLoading: false, // 添加刷新loading状态
      // 表头
      columns: [
        {
          title: '客户名称',
          align: "center",
          dataIndex: 'customerName',
          width: 150
        },
        {
          title: '项目名称',
          align: "center",
          dataIndex: 'proName',
          width: 150
        },
        {
          title: '月份',
          align: "center",
          dataIndex: 'dateMonth',
          width: 100
        },
        {
          title: '合作方式',
          align: "center",
          dataIndex: 'collaborationMode',
          width: 100,
          customRender: (text) => {
            const modeMap = {
              '0': '预付',
              '1': '垫付',
              '2': '服务费',
            };
            return modeMap[text] || '';
          }
        },
        {
          title: '结算方式',
          align: "center",
          dataIndex: 'paymentMethod',
          width: 100,
          customRender: (text) => {
            const methodMap = {
              /**
               * 充值结算	0	编辑删除
               * 消耗结算	1	编辑删除
               */
              '0': '充值结算',
              '1': '消耗结算',
            };
            return methodMap[text] || '';
          }
        },
        {
          title: 'AE',
          align: "center",
          dataIndex: 'aePerson',
          width: 120,
          customRender: (text) => {
            if (!text) return '-';
            const user = this.userIdAndRealnameList.find(item => item.id === text);
            return user ? user.realname : text;
          }
        },
        {
          title: '商务',
          align: "center",
          dataIndex: 'businessPerson',
          width: 120,
          customRender: (text) => {
            if (!text) return '-';
            const user = this.userIdAndRealnameList.find(item => item.id === text);
            return user ? user.realname : text;
          }
        },

        {
          title: '总消耗',
          align: "center",
          dataIndex: 'totalCharged',
          width: 120,
          customRender: (text) => text ? Number(text).toFixed(2) : '0.00',
          sorter: (a, b) => (Number(a.totalCharged) || 0) - (Number(b.totalCharged) || 0),
          sortDirections: ['ascend', 'descend']
        },
        {
          title: '现金消耗',
          align: "center",
          dataIndex: 'cashDrain',
          width: 120,
          customRender: (text) => text ? Number(text).toFixed(2) : '0.00',
          sorter: (a, b) => (Number(a.cashDrain) || 0) - (Number(b.cashDrain) || 0),
          sortDirections: ['ascend', 'descend']
        },
        {
          title: '应回款',
          align: "center",
          dataIndex: 'revenueAmout',
          width: 120,
          customRender: (text, record) => {
            return record.revenueAmout ? Number(record.revenueAmout).toFixed(2) : '0.00'
          },
          sorter: (a, b) => a.revenueAmout - b.revenueAmout,
          sortDirections: ['ascend', 'descend']
        },

        {
          title: '已回款',
          align: "center",
          dataIndex: 'arrivalAmount',
          width: 120,
          customRender: (text) => text ? Number(text).toFixed(2) : '未到账',
          sorter: (a, b) => {
            const aValue = a.arrivalAmount ? Number(a.arrivalAmount) : 0;
            const bValue = b.arrivalAmount ? Number(b.arrivalAmount) : 0;
            return aValue - bValue;
          },
          sortDirections: ['ascend', 'descend']
        },
        {
          title: '最后回款日期',
          align: "center",
          dataIndex: 'lastArrivalTime',
          width: 120,
          customRender: (text) => text || '未到账'
        },

        {
          title: '逾期天数',
          align: "center",
          dataIndex: 'overdueDays',
          width: 100,
          customRender: (text) => text || 0
        },
        {
          title: '逾期次数',
          align: "center",
          dataIndex: 'overdueCount',
          minWidth: 80,
          customRender: (text) => text || 0
        },
        {
          title: '预估消耗成本',
          align: "center",
          dataIndex: 'estimated_rebate_amount',
          width: 120,
          customRender: (text) => 0
        },
        {
          title: '实际消耗成本',
          align: "center",
          dataIndex: 'actual_rebate_amount',
          width: 120,
          customRender: (text) => 0
        },

        {
          title: '预估毛利',
          align: "center",
          width: 120,
          customRender: (text, r) => 0
        },

        {
          title: '实际毛利',
          align: "center",
          width: 120,
          customRender: (text, r) => 0
        },
        {
          title: '人员成本',
          align: "center",
          dataIndex: 'project_cost',
          width: 120,
          customRender: (text) => 0
        },
        {
          title: '素材成本',
          align: "center",
          dataIndex: 'material_cost',
          width: 120,
          customRender: (text) => 0
        },
        {
          title: '预估净利',
          align: "center",
          width: 120,
          customRender: (text, r) => 0
        },
        {
          title: '实际净利',
          align: "center",
          width: 120,
          customRender: (text, r) => 0
        }
      ],
      url: {
        // list: "/agentdata/getTotalByCustomerIdAndMonth",
        // list: "/agentdata/getAmountByCustomerIdAndMonth",
        list: "tempProjectPaymentRecords/list",
      },
      dictOptions: {},
      superFieldList: [],
      // 用户ID和真实姓名组合数据
      userIdAndRealnameList: [],
      /* 分页参数 */
      ipagination: {
        current: 1,
        pageSize: 10,
        pageSizeOptions: ['10', '20', '30', '50'],
        showTotal: (total, range) => {
          return range[0] + "-" + range[1] + " 共" + total + "条"
        },
        showQuickJumper: true,
        showSizeChanger: true,
        total: 0,
        // 自定义每页条数选项的显示文本
        // pageSizeOptionsRender: (pageSize) => {
        //   return pageSize === '999999' ? '全部' : `${pageSize}条/页`
        // }
      },
    }
  },
  created() {
    // 在mixin的created之前设置默认值
    const date = new Date()
    const currentMonth = date.toISOString().slice(0, 7)
    this.$set(this.queryParam, 'dateMonthBegin', currentMonth)
    this.$set(this.queryParam, 'dateMonthEnd', currentMonth)

    this.getSuperFieldList();
    this.getUserIdAndRealnameCombination();
  },
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
    },
    totalCharged() {
      return this.dataSource.reduce((sum, record) => sum + (Number(record.totalCharged) || 0), 0);
    },
    totalCashDrain() {
      return this.dataSource.reduce((sum, record) => sum + (Number(record.cashDrain) || 0), 0);
    },
    totalRevenue() {
      return this.dataSource.reduce((sum, record) => sum + (Number(record.revenue) || 0), 0);
    },
    totalArrivalAmount() {
      return this.dataSource.reduce((sum, record) => sum + (Number(record.arrivalAmount) || 0), 0);
    },
    totalRebateAmount() {
      return this.dataSource.reduce((sum, record) => sum + (Number(record.rebateAmout) || 0), 0);
    }
  },
  methods: {
    initDictConfig() {
    },
    // 重写loadData方法，确保在加载数据前设置默认月份
    loadData(arg) {
      // 确保默认月份已设置
      if (!this.queryParam.dateMonthBegin || !this.queryParam.dateMonthEnd) {
        const date = new Date()
        const currentMonth = date.toISOString().slice(0, 7)
        this.$set(this.queryParam, 'dateMonthBegin', currentMonth)
        this.$set(this.queryParam, 'dateMonthEnd', currentMonth)
      }
      // 调用mixin的loadData方法
      this.$options.mixins[0].methods.loadData.call(this, arg);
    },
    handleUpdateData() {
      this.$confirm({
        title: '提示',
        content: '是否要刷新客户返点和媒体返点数据重新运算，大约30s',
        onOk: () => {
          this.updateLoading = true; // 开始刷新时设置loading状态
          this.$http.get('/agentdata/updateData').then(res => {
            if (res.success) {
              this.$message.success('提交成功');
              this.loadData(); // 重新加载列表数据
            } else {
              this.$message.error(res.message || '提交失败');
            }
          }).catch(err => {
            this.$message.error('提交失败');
          }).finally(() => {
            this.updateLoading = false; // 无论成功失败都关闭loading状态
          });
        }
      });
    },
    getSuperFieldList() {
      let fieldList = [];
      fieldList.push({ type: 'string', value: 'delFlag', text: '删除标识（0：未删除1：已删除）', dictCode: '' })
      fieldList.push({ type: 'string', value: 'customerId', text: '客户编号id', dictCode: '' })
      fieldList.push({ type: 'string', value: 'customerName', text: '客户名称', dictCode: '' })
      fieldList.push({ type: 'date', value: 'paymentDate', text: '到账时间' })
      fieldList.push({ type: 'BigDecimal', value: 'amountReceived', text: '到账金额', dictCode: '' })
      fieldList.push({ type: 'string', value: 'serialNumber', text: '支付流水号', dictCode: '' })
      fieldList.push({ type: 'Text', value: 'remarks', text: '备注', dictCode: '' })
      fieldList.push({ type: 'string', value: 'state', text: '状态（0：未分配1：已分配2：部分分配）', dictCode: '' })
      this.superFieldList = fieldList
    },
    handleMonthChange() {
      // 如果两个月份都选择了，验证开始月份不能大于结束月份
      if (this.startMonth && this.endMonth) {
        const start = new Date(this.startMonth);
        const end = new Date(this.endMonth);
        if (start > end) {
          this.$message.warning('开始月份不能大于结束月份');
          this.endMonth = null;
          return;
        }
      }

      // 生成月份数组
      const months = [];
      if (this.startMonth && this.endMonth) {
        // 如果两个月份都选择了，补齐中间月份
        const start = new Date(this.startMonth);
        const end = new Date(this.endMonth);
        let currentDate = new Date(start);
        while (currentDate <= end) {
          months.push(currentDate.toISOString().slice(0, 7));
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
      } else if (this.startMonth) {
        // 如果只选择了开始月份
        months.push(this.startMonth);
      } else if (this.endMonth) {
        // 如果只选择了结束月份
        months.push(this.endMonth);
      }

      this.queryParam.month = months;
    },
    // 获取用户ID和真实姓名组合
    getUserIdAndRealnameCombination() {
      // console.log('开始请求用户ID和真实姓名组合数据...');
      httpAction('/sys/user/getUserIdAndRealnameCombination', {}, 'GET').then((res) => {
        // console.log('请求响应:', res);
        if (res.success) {
          // console.log('用户ID和真实姓名组合数据:', res.result);
          this.userIdAndRealnameList = res.result || [];
        } else {
          // console.log('请求失败:', res.message);
          this.$message.warning(res.message || '获取用户数据失败');
        }
      }).catch((error) => {
        console.error('获取用户ID和真实姓名组合失败:', error);
        this.$message.error('获取用户数据失败');
      });
    }
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>