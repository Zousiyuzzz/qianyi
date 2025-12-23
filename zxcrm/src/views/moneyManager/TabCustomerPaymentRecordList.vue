<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
      <a-button type="primary" icon="download" @click="handleExportXls('客户回款记录表')">导出</a-button>
      <!-- <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl"
        @change="handleImportExcel">
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload> -->
      <!-- 高级查询区域 -->
      <j-super-query :fieldList="superFieldList" ref="superQueryModal"
        @handleSuperQuery="handleSuperQuery"></j-super-query>
      <a-button type="primary" @click="showMonthPicker" icon="calendar">回款提醒</a-button>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <!-- <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete" />删除</a-menu-item>
        </a-menu> -->
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
      </a-dropdown>
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
        @change="handleTableChange" :customRow="customRow">

        <template slot="htmlSlot" slot-scope="text">
          <div v-html="text"></div>
        </template>
        <template slot="imgSlot" slot-scope="text,record">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无图片</span>
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
          <!-- <a @click="handleEdit(record)">编辑</a>
          <a-divider type="vertical" /> -->
          <a @click="handleDetail(record)">详情</a>
          <a-divider type="vertical" />
          <a @click="handleFenpei(record)">分配</a>
          <!-- <a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a @click="handleDetail(record)">详情</a>
              </a-menu-item>
              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown> -->
        </span>

      </a-table>
    </div>

    <tab-customer-payment-record-modal ref="modalForm" @ok="modalFormOk"></tab-customer-payment-record-modal>
    <fenpei-drawer ref="fenpeiDrawer" @ok="modalFormOk"></fenpei-drawer>

    <!-- 年月选择弹窗 -->
    <a-modal title="选择年月" :visible="monthPickerVisible" @ok="handleMonthConfirm" @cancel="handleMonthCancel"
      :confirmLoading="remindLoading">
      <a-month-picker v-model="selectedMonth" style="width: 100%" placeholder="请选择年月" format="YYYY-MM" />
    </a-modal>
  </a-card>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import TabCustomerPaymentRecordModal from './modules/TabCustomerPaymentRecordModal'
import FenpeiDrawer from './FenpeiDrawer'
export default {
  name: 'TabCustomerPaymentRecordList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    TabCustomerPaymentRecordModal,
    FenpeiDrawer
  },
  data() {
    return {
      description: '客户回款记录表管理页面',
      monthPickerVisible: false,
      selectedMonth: null,
      remindLoading: false,
      // 表头
      columns: [
        {
          title: '客户名称',
          align: "center",
          dataIndex: 'customerName'
        },
        {
          title: '状态',
          align: "center",
          dataIndex: 'state_dictText'
        },
        {
          title: '到账时间',
          align: "center",
          dataIndex: 'paymentDate',
          customRender: function (text) {
            return !text ? "" : (text.length > 10 ? text.substr(0, 10) : text)
          }
        },
        {
          title: '到账金额',
          align: "center",
          dataIndex: 'amountReceived',
          customRender: function (text) {
            return text + '元'
          }
        },
        {
          title: '已分配金额',
          align: "center",
          dataIndex: 'allocationsMoney',
          customRender: function (text) {
            return text + '元'
          }
        },
        {
          title: '未分配金额',
          align: "center",
          customRender: function (text, record) {
            return (record.amountReceived - record.allocationsMoney).toFixed(2) + '元'
          }
        },
        {
          title: '项目主体',
          align: "center",
          dataIndex: 'customerBankAccountId_dictText'
        },
        {
          title: '我方主体',
          align: "center",
          dataIndex: 'weBankAccountId_dictText'
        },
        {
          title: '支付流水号',
          align: "center",
          dataIndex: 'serialNumber'
        },
        {
          title: '备注',
          align: "center",
          dataIndex: 'remarks'
        },

        {
          title: '操作',
          dataIndex: 'action',
          align: "center",
          fixed: "right",
          width: 147,
          scopedSlots: { customRender: 'action' }
        }
      ],
      url: {
        list: "/customerPaymentRecord/list",
        delete: "/customerPaymentRecord/delete",
        deleteBatch: "/customerPaymentRecord/deleteBatch",
        exportXlsUrl: "/customerPaymentRecord/exportXls",
        importExcelUrl: "customerPaymentRecord/importExcel",

      },
      dictOptions: {},
      superFieldList: [],
    }
  },
  created() {
    this.getSuperFieldList();
  },
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
    },
  },
  methods: {
    initDictConfig() {
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
    handleFenpei({ id }) {
      this.$refs['fenpeiDrawer'].show(id)
    },
    customRow(record) {
      // 根据条件返回不同的样式对象
      if (record.state === '0') {  // 未分配
        return {
          style: {
            'background-color': '#fff2f0',  // 浅红色背景
          },
        }
      } else if (record.state === '1') {  // 已分配
        return {
          style: {
            'background-color': '#f6ffed',  // 浅绿色背景
          }
        }
      } else if (record.state === '2') {  // 部分分配
        return {
          style: {
            'background-color': '#e6f7ff',  // 浅蓝色背景
          }
        }
      }
      // 默认样式
      return {}
    },
    showMonthPicker() {
      this.monthPickerVisible = true;
    },
    handleMonthCancel() {
      this.monthPickerVisible = false;
      this.selectedMonth = null;
    },
    onMonthChange(date) {
      this.selectedMonth = date;
    },
    handleMonthConfirm() {
      if (!this.selectedMonth) {
        this.$message.warning('请选择年月');
        return;
      }

      this.remindLoading = true;
      const month = this.selectedMonth.format('YYYY-MM');
      this.$http.get('/customerManage/remind', {
        params: { month }
      }).then(res => {
        if (res.success) {
          this.$message.success('邮件发送成功');
        } else {
          this.$message.error(res.message || '提醒失败');
        }
      }).catch(err => {
        this.$message.error('提醒失败');
      }).finally(() => {
        this.remindLoading = false;
        this.monthPickerVisible = false;
        this.selectedMonth = null;
      });
    },
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>