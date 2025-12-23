<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="月份">
              <a-month-picker v-model="queryParam.dateMonth" placeholder="请选择月份" :value-format="'YYYY-MM'"
                style="width: 100%;" @change="handleMonthChange" />
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="项目">
              <JSearchSelectTag placeholder="请选择项目" v-model="queryParam.proId"
                dict="tab_projectManage,pro_name,id,del_flag = '0'" async allowClear />
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="渠道">
              <a-input placeholder="请输入渠道" v-model="queryParam.business_name"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="合作方式">
              <j-dict-select-tag placeholder="请选择合作方式" v-model="queryParam.collaborationMode"
                dictCode="projectt_hezuotype"></j-dict-select-tag>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="AE">
              <JSearchSelectTag placeholder="请选择AE" v-model="queryParam.aePerson"
                dict="sys_user,realname,id,del_flag = '0'" async>
              </JSearchSelectTag>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="商务">
              <JSearchSelectTag placeholder="请选择商务" v-model="queryParam.businessPerson"
                dict="sys_user,realname,id,del_flag = '0'" async>
              </JSearchSelectTag>
            </a-form-item>
          </a-col>
          <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
          <a-button type="primary" @click="returnatation" icon="mail" v-has="`reminder`"
            style="margin-left: 13px;">回款提醒</a-button>
          <a-button type="primary" icon="download" style="margin-left: 13px;" @click="handleExportXlsFrontend"
            :loading="exportLoading">导出</a-button>
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <!-- <a-button type="primary" @click="handleUpdateData" icon="sync" :loading="updateLoading"> 
        {{ updateLoading ? '刷新中' : '刷新返点数据' }}
      </a-button> -->
    </div>

    <!-- table区域-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{
          selectedRowKeys.length }}</a>项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>

      <a-table ref="table" size="middle" :scroll="tableScrollConfig" bordered rowKey="id" :columns="columns"
        :dataSource="dataSource" :pagination="ipagination" :loading="loading"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        class="j-table-force-nowrap responsive-table" @change="handleTableChange">

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
        <span slot="action" slot-scope="text, record">
          <a v-if="record.overdueDays > 0 && record.collaborationMode != '0'" @click="handleDelay(record)">延期申请</a>
          <span v-else style="color: #ccc;">-</span>
        </span>
      </a-table>
    </div>

    <delay-modal ref="delayModal" @ok="modalFormOk"></delay-modal>
    <!-- <tab-customer-payment-record-modal ref="modalForm" @ok="modalFormOk"></tab-customer-payment-record-modal> -->
    <!-- <fenpei-drawer ref="fenpeiDrawer" @ok="modalFormOk"></fenpei-drawer> -->
  </a-card>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
// import TabCustomerPaymentRecordModal from './modules/TabCustomerPaymentRecordModal'
// import FenpeiDrawer from './FenpeiDrawer'
import DelayModal from './modules/DelayModal'
import { httpAction, getAction } from '@/api/manage'
import { postAction } from '../../api/manage'
import * as XLSX from 'xlsx'
export default {
  name: 'BackmoneyList.vue',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    // TabCustomerPaymentRecordModal,
    // FenpeiDrawer
    DelayModal
  },
  data() {
    return {
      isorter: {
        column: 'month',
        order: 'desc',
      },
      queryParam: {
        dateMonth: null,
        dateMonthBegin: null,
        dateMonthEnd: null
      },
      description: '回款记录表管理页面',
      updateLoading: false, // 添加刷新loading状态
      exportLoading: false, // 导出loading状态
      // 表头
      columns: [
        {
          title: '客户名称',
          align: "center",
          dataIndex: 'customerName',
          minWidth: 140,
          ellipsis: true
        },
        {
          title: '项目名称',
          align: "center",
          dataIndex: 'proName',
          minWidth: 140,
          ellipsis: true
        },
        {
          title: '渠道',
          align: "center",
          dataIndex: 'business_name',
          minWidth: 140,
          ellipsis: true
        },
        {
          title: '月份',
          align: "center",
          dataIndex: 'dateMonth',
          widminWidthth: 80
        },
        {
          title: '合作方式',
          align: "center",
          dataIndex: 'collaborationMode',
          minWidth: 90,
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
          minWidth: 90,
          customRender: (text) => {
            const methodMap = {
              /**
               * 充值结算	0	编辑删除
               * 消耗结算	1	编辑删除
               */
              '0': '充值结算',
              '1': '消耗结算',
            };
            return methodMap[text] || '-';
          }
        },
        {
          title: 'AE',
          align: "center",
          dataIndex: 'aePerson',
          width: 100,
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
          minWidth: 100,
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
          minWidth: 100,
          customRender: (text) => text ? Number(text).toFixed(2) : '0.00',
          sorter: (a, b) => (Number(a.totalCharged) || 0) - (Number(b.totalCharged) || 0),
          sortDirections: ['ascend', 'descend']
        },
        {
          title: '现金消耗',
          align: "center",
          dataIndex: 'cashDrain',
          minWidth: 100,
          customRender: (text) => text ? Number(text).toFixed(2) : '0.00',
          sorter: (a, b) => (Number(a.cashDrain) || 0) - (Number(b.cashDrain) || 0),
          sortDirections: ['ascend', 'descend']
        },
        {
          title: '应回款',
          align: "center",
          dataIndex: 'revenueAmout',
          minWidth: 100,
          customRender: (text, record) => {
            return record.revenueAmout ? Number(record.revenueAmout).toFixed(2) : '0.00'
          },
          sorter: (a, b) => (Number(a.revenueAmout) || 0) - (Number(b.revenueAmout) || 0),
          sortDirections: ['ascend', 'descend']
        },

        {
          title: '已回款',
          align: "center",
          dataIndex: 'arrivalAmount',
          minWidth: 100,
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
          title: '账期天数',
          align: "center",
          dataIndex: 'repayDay',
          minWidth: 80,
          customRender: (text) => text || '-'
        },
        {
          title: '逾期天数',
          align: "center",
          dataIndex: 'overdueDays',
          minWidth: 80,
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
          title: '操作',
          dataIndex: 'action',
          align: "center",
          fixed: "right",
          width: 80,
          scopedSlots: { customRender: 'action' }
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
    this.$set(this.queryParam, 'dateMonth', currentMonth)
    this.$set(this.queryParam, 'dateMonthBegin', currentMonth)
    this.$set(this.queryParam, 'dateMonthEnd', currentMonth)

    this.getSuperFieldList();
    this.getUserIdAndRealnameCombination();
  },
  mounted() {
    // 监听窗口大小变化
    this.handleResize = () => {
      this.$forceUpdate(); // 强制更新以重新计算tableScrollConfig
    };
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    // 清理事件监听器
    if (this.handleResize) {
      window.removeEventListener('resize', this.handleResize);
    }
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
    },
    // 动态计算表格滚动配置
    tableScrollConfig() {
      const screenWidth = window.innerWidth;
      if (screenWidth < 768) {
        return { x: 1200 }; // 小屏幕需要更大的滚动宽度
      } else if (screenWidth < 1200) {
        return { x: 1000 }; // 中等屏幕
      } else {
        return { x: 'max-content' }; // 大屏幕自适应
      }
    }
  },
  methods: {
    // 弹窗确认后的回调
    modalFormOk() {
      // 延期成功后可以刷新列表数据
      this.loadData();
    },
    initDictConfig() {
    },
    returnatation() {
      // /tempProjectPaymentRecords/remind
      postAction('/tempProjectPaymentRecords/remind', {}).then(res => {
        if (res.success) {
          this.$message.success('回款提醒发送成功');
        } else {
          this.$message.error(res.message || '回款提醒发送失败');
        }
      }).catch(err => {
        this.$message.error('回款提醒发送失败');
      });
    },
    // 重写loadData方法，确保在加载数据前设置默认月份
    loadData(arg) {
      // 确保默认月份已设置
      if (!this.queryParam.dateMonth) {
        const date = new Date()
        const currentMonth = date.toISOString().slice(0, 7)
        this.$set(this.queryParam, 'dateMonth', currentMonth)
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
      // 将选择的月份同时赋值给开始和结束月份参数
      if (this.queryParam.dateMonth) {
        this.$set(this.queryParam, 'dateMonthBegin', this.queryParam.dateMonth)
        this.$set(this.queryParam, 'dateMonthEnd', this.queryParam.dateMonth)
      } else {
        this.$set(this.queryParam, 'dateMonthBegin', null)
        this.$set(this.queryParam, 'dateMonthEnd', null)
      }
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
    },

    // 处理延期申请
    handleDelay(record) {
      // 构建传递给弹窗的数据，包含默认的月份和项目ID
      const delayData = {
        month: record.dateMonth || (record.date_time ? record.date_time.substring(0, 7) : ''), // 传递月份，优先使用dateMonth，否则从date_time提取
        proId: record.proId, // 传递项目ID
        proName: record.proName, // 传递项目名称
        customerName: record.customerName, // 传递客户名称
        customerId: record.customerId, // 传递客户ID
      };

      console.log('传递给延期弹窗的数据:', delayData); // 添加调试日志
      this.$refs.delayModal.open(delayData);
    },
    // 前端导出Excel（获取所有数据）
    async handleExportXlsFrontend() {
      this.exportLoading = true
      try {
        // 获取需要导出的列（排除操作列）
        const exportColumns = this.columns.filter(col =>
          col.dataIndex &&
          col.dataIndex !== 'action' &&
          !col.scopedSlots
        )

        // 构建表头
        const headers = exportColumns.map(col => col.title)

        // 获取查询参数
        const baseParams = this.getQueryParams()
        const pageSize = 2000 // 每页2000条
        let pageNo = 1
        let allData = []
        let allDataSource = [] // 保存原始数据用于汇总计算
        let total = 0
        let hasMore = true

        // 显示提示信息
        this.$message.info('开始导出数据，请稍候...')

        // 循环分页获取所有数据
        while (hasMore) {
          const params = {
            ...baseParams,
            pageNo: pageNo,
            pageSize: pageSize
          }

          const response = await getAction(this.url.list, params)

          if (!response || !response.success) {
            throw new Error((response && response.message) || '获取数据失败')
          }

          // 处理返回数据
          let list = []
          if (Array.isArray(response.result)) {
            list = response.result
          } else if (response.result && Array.isArray(response.result.records)) {
            list = response.result.records
            if (response.result.total) {
              total = response.result.total
            }
          } else if (response.result && Array.isArray(response.result.list)) {
            list = response.result.list
            if (response.result.total) {
              total = response.result.total
            }
          }

          if (list.length === 0) {
            hasMore = false
            break
          }

          // 保存原始数据用于汇总计算
          allDataSource.push(...list)

          // 处理数据并添加到总数据中
          const processedData = list.map(item => {
            return exportColumns.map(col => {
              let value = item[col.dataIndex]

              // 处理 customRender
              if (col.customRender && typeof col.customRender === 'function') {
                try {
                  // 使用 call 确保 this 指向正确的 Vue 实例
                  const renderResult = col.customRender.call(this, value, item, 0)
                  // 如果返回的是字符串或数字，使用返回值
                  if (typeof renderResult === 'string' || typeof renderResult === 'number') {
                    value = renderResult
                  }
                  // 如果是 JSX 对象或其他类型，使用原始值
                } catch (error) {
                  // 如果 customRender 执行失败，使用原始值
                  console.warn(`customRender 执行失败 for ${col.dataIndex}:`, error)
                }
              }

              // 处理空值
              if (value === null || value === undefined) {
                return ''
              }

              return String(value)
            })
          })
          allData.push(...processedData)

          // 判断是否还有更多数据
          if (list.length < pageSize) {
            hasMore = false
          } else {
            pageNo++
            // 如果已知总数，判断是否已获取完
            if (total > 0 && allData.length >= total) {
              hasMore = false
            }
          }

          // 显示进度
          if (total > 0) {
            const progress = Math.min(100, Math.floor((allData.length / total) * 100))
            console.log(`导出进度: ${progress}% (${allData.length}/${total})`)
          } else {
            console.log(`已获取 ${allData.length} 条数据，继续获取...`)
          }
        }

        if (allData.length === 0) {
          this.$message.warning('没有数据可导出')
          return
        }

        // 计算所有数据的汇总（从已获取的原始数据中计算）
        // 计算汇总值
        const totalCharged = allDataSource.reduce((sum, record) => sum + (Number(record.totalCharged) || 0), 0)
        const totalCashDrain = allDataSource.reduce((sum, record) => sum + (Number(record.cashDrain) || 0), 0)
        const totalRevenue = allDataSource.reduce((sum, record) => sum + (Number(record.revenue) || 0), 0)
        const totalArrivalAmount = allDataSource.reduce((sum, record) => sum + (Number(record.arrivalAmount) || 0), 0)
        const totalRebateAmount = allDataSource.reduce((sum, record) => sum + (Number(record.rebateAmout) || 0), 0)

        // 添加汇总行（动态匹配列数）
        const summaryRow = new Array(exportColumns.length).fill('')
        const totalChargedIndex = exportColumns.findIndex(col => col.dataIndex === 'totalCharged')
        const totalCashDrainIndex = exportColumns.findIndex(col => col.dataIndex === 'cashDrain')
        const totalRevenueIndex = exportColumns.findIndex(col => col.dataIndex === 'revenueAmout')
        const totalArrivalIndex = exportColumns.findIndex(col => col.dataIndex === 'arrivalAmount')
        const rebateIndex = exportColumns.findIndex(col => col.dataIndex === 'rebateAmout')

        summaryRow[0] = '全部数据汇总'
        if (totalChargedIndex >= 0) summaryRow[totalChargedIndex] = totalCharged.toFixed(2)
        if (totalCashDrainIndex >= 0) summaryRow[totalCashDrainIndex] = totalCashDrain.toFixed(2)
        if (totalRevenueIndex >= 0) summaryRow[totalRevenueIndex] = totalRevenue.toFixed(2)
        if (totalArrivalIndex >= 0) summaryRow[totalArrivalIndex] = totalArrivalAmount.toFixed(2)
        if (rebateIndex >= 0) summaryRow[rebateIndex] = totalRebateAmount.toFixed(2)

        // 创建工作簿
        const wb = XLSX.utils.book_new()

        // 将表头、数据行和汇总行合并
        const worksheetData = [headers, ...allData, [], summaryRow]

        // 创建工作表
        const ws = XLSX.utils.aoa_to_sheet(worksheetData)

        // 设置列宽
        const colWidths = exportColumns.map(col => {
          let width = Math.max(col.title.length * 2, 10)
          if (col.dataIndex.includes('Name') || col.dataIndex.includes('customerName') || col.dataIndex.includes('proName')) {
            width = 20
          } else if (col.dataIndex.includes('business_name')) {
            width = 15
          } else if (col.dataIndex.includes('Time') || col.dataIndex.includes('dateMonth') || col.dataIndex.includes('lastArrivalTime')) {
            width = 15
          } else if (col.minWidth) {
            width = Math.max(width, col.minWidth / 7) // 将像素转换为字符宽度（大约）
          }
          return { wch: width }
        })
        ws['!cols'] = colWidths

        // 添加工作表到工作簿
        XLSX.utils.book_append_sheet(wb, ws, '回款记录')

        // 生成文件名
        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
        const month = this.queryParam.dateMonth || ''
        const fileName = `回款记录${month ? '_' + month : ''}_${timestamp}.xlsx`

        // 导出文件
        XLSX.writeFile(wb, fileName)

        this.$message.success(`成功导出 ${allData.length} 条数据`)
      } catch (error) {
        console.error('前端导出失败:', error)
        this.$message.error(`导出失败：${error.message || '请重试'}`)
      } finally {
        this.exportLoading = false
      }
    }
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less';

/* 响应式表格样式 */
.responsive-table {
  width: 100%;
}

/* 确保表格在小屏幕上可以水平滚动 */
.responsive-table .ant-table {
  min-width: 100%;
}

/* 优化表格单元格内容显示 */
.responsive-table .ant-table-tbody>tr>td {
  padding: 8px 12px;
  word-break: break-word;
}

/* 对于重要列，确保最小宽度 */
.responsive-table .ant-table-thead>tr>th:nth-child(1),
.responsive-table .ant-table-tbody>tr>td:nth-child(1) {
  min-width: 120px;
}

.responsive-table .ant-table-thead>tr>th:nth-child(2),
.responsive-table .ant-table-tbody>tr>td:nth-child(2) {
  min-width: 120px;
}

/* 数字列右对齐 */
.responsive-table .ant-table-tbody>tr>td:nth-child(8),
.responsive-table .ant-table-tbody>tr>td:nth-child(9),
.responsive-table .ant-table-tbody>tr>td:nth-child(10),
.responsive-table .ant-table-tbody>tr>td:nth-child(11) {
  text-align: right;
}

/* 操作列固定宽度 */
.responsive-table .ant-table-thead>tr>th:last-child,
.responsive-table .ant-table-tbody>tr>td:last-child {
  width: 80px !important;
  min-width: 80px !important;
  max-width: 80px !important;
}

/* 在大屏幕上优化显示 */
@media (min-width: 1200px) {
  .responsive-table .ant-table-tbody>tr>td {
    padding: 12px 16px;
  }
}

/* 在中等屏幕上调整 */
@media (max-width: 1199px) and (min-width: 768px) {
  .responsive-table .ant-table-tbody>tr>td {
    padding: 6px 8px;
    font-size: 13px;
  }
}

/* 在小屏幕上进一步优化 */
@media (max-width: 767px) {
  .responsive-table .ant-table-tbody>tr>td {
    padding: 4px 6px;
    font-size: 12px;
  }

  /* 隐藏一些非关键列 */
  .responsive-table .ant-table-thead>tr>th:nth-child(6),
  .responsive-table .ant-table-tbody>tr>td:nth-child(6),
  .responsive-table .ant-table-thead>tr>th:nth-child(7),
  .responsive-table .ant-table-tbody>tr>td:nth-child(7) {
    display: none;
  }
}
</style>