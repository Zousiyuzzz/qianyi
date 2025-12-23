<template>
  <div style="background-color: #fff;">

    <!-- 'cmb': '招商银行',
              'icbc': '工商银行',
              'abc': '农业银行',
              'boc': '中国银行',
              'ccb': '建设银行' -->

    <a-tabs default-active-key="cmb" v-model="activeParentTab" @change="handleParentTabChange" tabPosition="top">

      <a-tab-pane key="cmb" tab="招商银行" :disabled="loading">
      </a-tab-pane>
      <a-tab-pane key="icbc" tab="工商银行" :disabled="loading">
      </a-tab-pane>
      <a-tab-pane key="abc" tab="农业银行" :disabled="loading">
      </a-tab-pane>
      <a-tab-pane key="boc" tab="中国银行" :disabled="loading">
      </a-tab-pane>
      <a-tab-pane key="ccb" tab="建设银行" :disabled="loading">
      </a-tab-pane>

    </a-tabs>
    <a-card :bordered="false">
      <!-- 查询区域 -->
      <div class="table-page-search-wrapper">
        <a-form layout="inline" @keyup.enter.native="searchQuery">
          <a-row :gutter="24">
            <a-col :span="6">
              <a-form-item label="账户名称">
                <a-input v-model="queryParam.accountName" placeholder="请输入账户名称" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="账户号">
                <a-input v-model="queryParam.accountNo" placeholder="请输入账户号" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="交易日">
                <a-range-picker v-model="queryParam.transDateRange" format="YYYY-MM-DD" :placeholder="['开始日期', '结束日期']"
                  @change="onTransDateChange" style="width: 100%;" />
              </a-form-item>
            </a-col>
            <span class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 10px;">重置</a-button>
            </span>
          </a-row>
        </a-form>
      </div>
      <!-- 查询区域-END -->

      <!-- 操作按钮区域 -->
      <div class="table-operator">
        <!-- <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button> -->
        <a-button type="primary" icon="download" @click="handleExportXls('招商银行交易记录')">导出</a-button>
        <!-- <j-super-query :fieldList="superFieldList" ref="superQueryModal"
          @handleSuperQuery="handleSuperQuery"></j-super-query> -->
        <!-- <a-dropdown v-if="selectedRowKeys.length > 0">
          <a-menu slot="overlay">
            <a-menu-item key="1" @click="batchDel"><a-icon type="delete" />删除</a-menu-item>
          </a-menu>
          <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
        </a-dropdown> -->
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
          <div slot="money" slot-scope="text">
            <div :class="{ green: text > 0, red: text < 0 }">
              {{ text }}
            </div>
          </div>
          <!-- <span slot="action" slot-scope="text, record">
            <a v-if="record.isAssigned == 0 && record.transAmount >= 0" @click="openAssignModal(record)">分配</a>
          </span> -->
          <div slot="special" slot-scope="text">
            <div :class="{ huidan: text }" @click="downloadHuidan(text)">
              {{ "查看回单" }}
            </div>
          </div>
        </a-table>
      </div>

      <tab-cmb-transaction-record-modal ref="modalForm" @ok="modalFormOk"></tab-cmb-transaction-record-modal>

      <a-modal title="分配资金" :visible="assignModalVisible" :confirmLoading="assignLoading" @ok="handleAssignSubmit"
        @cancel="closeAssignModal">
        <a-form-model :labelCol="{ span: 5 }" :wrapperCol="{ span: 18 }">
          <a-form-model-item label="项目">
            <JSearchSelectTag v-model="assignProjectId" placeholder="请选择项目"
              dict="tab_projectManage,pro_name,id,del_flag = '0'" async />
          </a-form-model-item>
        </a-form-model>
      </a-modal>
    </a-card>
  </div>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import TabCmbTransactionRecordModal from './modules/TabCmbTransactionRecordModal'
import { formatTime, parseCmbDebitCreditCode, parseCmbAmountType } from '@/utils/myTool'
import { httpAction } from '@/api/manage'

export default {
  name: 'TabCmbTransactionRecordList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    TabCmbTransactionRecordModal,
  },
  data() {
    return {
      spppp: {
        bankType: 'cmb'
      },
      activeParentTab: 'cmb',
      title: '招商银行交易记录列表',
      description: '招商银行交易记录管理页面',
      columns: [
        {
          title: '交易时间',
          align: "center",
          dataIndex: 'transTime',
          customRender: function (text, record) {
            return record.transDate + ' ' + formatTime(text)
          }
        },
        {
          title: '现金金额',
          align: "center",
          dataIndex: 'transAmount',
          scopedSlots: { customRender: 'money' }
        },
        {
          title: '操作类型',
          align: "center",
          customRender: function (text, record) {
            return record.transAmount >= 0 ? '收款' : '付款'
          }
        },
        {
          title: '客户银行名称',
          align: "center",
          dataIndex: 'ctpBankName',
          customRender: (text) => {
            return text ? (
              <a-tooltip title={text}>
                <span style="display: inline-block; width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  {text}
                </span>
              </a-tooltip>
            ) : text
          }
        },
        {
          title: '客户主体',
          align: "center",
          dataIndex: 'ctpAcctName',
          customRender: (text) => {
            return text ? (
              <a-tooltip title={text}>
                <span style="display: inline-block; width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  {text}
                </span>
              </a-tooltip>
            ) : text
          }
        },
        {
          title: '我方银行名称',
          align: "center",
          dataIndex: 'accountName',
          customRender: (text) => {
            return text ? (
              <a-tooltip title={text}>
                <span style="display: inline-block; width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  {text}
                </span>
              </a-tooltip>
            ) : text
          }
        },
        {
          title: '摘要',
          align: "center",
          dataIndex: 'remarkTextClt',
          customRender: (text) => {
            return text ? (
              <a-tooltip title={text}>
                <span style="display: inline-block; width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  {text}
                </span>
              </a-tooltip>
            ) : text
          }
        },
        {
          title: '交易类型',
          align: "center",
          dataIndex: 'textCode',
          customRender: function (text) {
            return parseCmbAmountType(text)
          }
        },
        {
          title: '流水号',
          align: "center",
          dataIndex: 'transSequenceIdn',
        },
        {
          title: '操作',
          align: "center",
          dataIndex: 'fildat',
          scopedSlots: { customRender: 'special' }
        },
        // {
        //   title: '操作',
        //   dataIndex: 'action',
        //   align: "center",
        //   fixed: "right",
        //   width: 120,
        //   scopedSlots: { customRender: 'action' }
        // }
      ],
      url: {
        list: "/cmbTransactionRecord/list",
        delete: "/cmbTransactionRecord/delete",
        deleteBatch: "/cmbTransactionRecord/deleteBatch",
        exportXlsUrl: "/cmbTransactionRecord/exportXls",
        importExcelUrl: "/cmbTransactionRecord/importExcel",
      },
      dictOptions: {},
      superFieldList: [],
      queryParam: {
        transDateRange: []
      },
      assignModalVisible: false,
      assignLoading: false,
      assignProjectId: null,
      currentRecord: null
    }
  },
  created() {
    this.getSuperFieldList();
    this.queryParam.bankType = this.activeParentTab;
  },
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
    },
  },
  methods: {
    handleParentTabChange(type) {
      this.queryParam.bankType = type;
      this.searchQuery()
    },
    // 下载回单
    downloadHuidan(url) {
      if (!url) {
        this.$message.warning("暂无回单可下载");
        return;
      }
      // 打开新窗口下载
      const link = document.createElement('a');
      link.href = url;
      link.target = "_blank";
      link.download = ""; // 让浏览器自动命名
      link.click();
    },
    onTransDateChange(date, dateString) {
      this.queryParam.transDate_begin = dateString && dateString.length ? dateString[0] : null
      this.queryParam.transDate_end = dateString && dateString.length ? dateString[1] : null
    },
    searchReset() {
      console.log(this.queryParam)
      this.queryParam = {
        bankType: this.queryParam.bankType,
        accountName: null,
        accountNo: null,
        transDateRange: [],
        transDate_begin: null,
        transDate_end: null,
      }
      console.log(this.queryParam)
      this.searchQuery()
    },
    initDictConfig() {
    },
    getSuperFieldList() {
      let fieldList = [];
      fieldList.push({ type: 'date', value: 'transDate', text: '交易日', dictCode: '' })
      fieldList.push({ type: 'string', value: 'transSequenceIdn', text: '流水号', dictCode: '' })
      fieldList.push({ type: 'string', value: 'transTime', text: '交易时间', dictCode: '' })
      fieldList.push({ type: 'date', value: 'valueDate', text: '起息日', dictCode: '' })
      fieldList.push({ type: 'string', value: 'loanCode', text: '借贷码', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'transAmount', text: '交易金额', dictCode: '' })
      fieldList.push({ type: 'string', value: 'currencyNbr', text: '币种', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'acctOnlineBal', text: '余额', dictCode: '' })
      fieldList.push({ type: 'string', value: 'textCode', text: '交易类型', dictCode: '' })
      fieldList.push({ type: 'string', value: 'remarkTextClt', text: '你方摘要', dictCode: '' })
      fieldList.push({ type: 'string', value: 'ctpAcctNbr', text: '收付方帐号', dictCode: '' })
      fieldList.push({ type: 'string', value: 'ctpAcctName', text: '收付方名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'accountNo', text: '账户号', dictCode: '' })
      fieldList.push({ type: 'string', value: 'accountName', text: '账户名称', dictCode: '' })
      this.superFieldList = fieldList
    },
    openAssignModal(record) {
      this.currentRecord = record
      this.assignProjectId = null
      this.assignModalVisible = true
    },
    closeAssignModal() {
      this.assignModalVisible = false
      this.assignProjectId = null
      this.currentRecord = null
    },
    handleAssignSubmit() {
      if (!this.assignProjectId) {
        this.$message.warning('请选择项目后再提交')
        return
      }
      if (!this.currentRecord) {
        this.$message.error('未找到要分配的记录')
        return
      }
      this.assignLoading = true
      httpAction('/cmbTransactionRecord/projectDistribution', {
        recordId: this.currentRecord.id,
        proId: this.assignProjectId + ''
      }, 'post')
        .then(res => {
          if (res.success) {
            this.$message.success(res.message || '分配成功')
            this.closeAssignModal()
            this.loadData()
          } else {
            this.$message.warning(res.message || '分配失败')
          }
        })
        .finally(() => {
          this.assignLoading = false
        })
    }
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less';

.huidan {
  cursor: pointer;
  color: #1890ff;
}

.green {
  color: #f5222d;
}

.red {
  color: #52c41a;
}
</style>
