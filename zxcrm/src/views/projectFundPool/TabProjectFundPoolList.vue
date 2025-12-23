<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="项目ID">
              <a-input placeholder="请输入项目ID" v-model="queryParam.proUniqueId"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="项目名称">
              <a-input placeholder="请输入项目名称" v-model="queryParam.proName"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="合作方式">
              <a-select placeholder="请选择" v-model:value="queryParam.collaborationMode" :allowClear="true">
                <a-select-option value="0">预付</a-select-option>
                <a-select-option value="1">垫付</a-select-option>
                <a-select-option value="2">服务费</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="是否欠款">
              <a-select placeholder="请选择" v-model:value="queryParam.isArrears" :allowClear="true">
                <a-select-option :value="true">是</a-select-option>
                <a-select-option :value="false">否</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="间隔天">
              <a-input placeholder="请输入间隔天数" v-model:value="queryParam.intervalDays" allowClear />
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
    <div class="table-operator" style="display: flex; align-items: center; gap: 12px;">
      <!-- 高级查询区域 -->
      <j-super-query :fieldList="superFieldList" ref="superQueryModal"
        @handleSuperQuery="handleSuperQuery"></j-super-query>
      <a-button type="primary" :loading="syncLoading" icon="sync" @click="handleSyncProject">同步项目</a-button>
      <a-tooltip placement="right">
        <template slot="title">
          项目管理有项目，资金池没有找到，请点击同步按钮
        </template>
        <a-icon type="question-circle" style="color: #1890ff; cursor: pointer;" />
      </a-tooltip>
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
          <a @click="onBalanceManage(record)">余额管理</a>
          <a class="action-link" @click="onSetCreditLimit(record)">设置授信额度</a>
          <a class="action-link" @click="updateArrears(record)"
            v-if="$store.getters.userInfo.username == 'admin'">欠款调整</a>
        </span>

      </a-table>
    </div>

    <tab-project-fund-pool-modal ref="modalForm" @ok="modalFormOk"></tab-project-fund-pool-modal>
    <set-credit-limit-modal :visible="setCreditLimitModalVisible" :record="setCreditLimitRecord"
      @save="handleSetCreditLimitSave" @cancel="handleSetCreditLimitCancel" />
    <balance-manage-modal :visible="balanceManageModalVisible" :record="balanceManageRecord" @ok="handleBalanceManageOk"
      @cancel="handleBalanceManageCancel" />
    <arrears-adjust-modal :visible="arrearsAdjustModalVisible" :record="arrearsAdjustRecord" @ok="handleArrearsAdjustOk"
      @cancel="handleArrearsAdjustCancel" />
  </a-card>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import TabProjectFundPoolModal from './modules/TabProjectFundPoolModal'
import SetCreditLimitModal from './modules/SetCreditLimitModal.vue'
import BalanceManageModal from './modules/BalanceManageModal.vue'
import ArrearsAdjustModal from './modules/ArrearsAdjustModal.vue'
import { postAction } from '@/api/manage'

export default {
  name: 'TabProjectFundPoolList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    TabProjectFundPoolModal,
    SetCreditLimitModal,
    BalanceManageModal,
    ArrearsAdjustModal
  },
  data() {
    return {
      description: '客户资金池信息管理页面',
      // 表头
      columns: [
        {
          title: '项目ID',
          align: "center",
          dataIndex: 'proUniqueId'
        },
        {
          title: '项目名称',
          align: "center",
          dataIndex: 'proName'
        },
        {
          title: '合作方式',
          align: "center",
          dataIndex: 'collaborationMode',
          customRender: (text) => {
            if (text) {
              let arr = ['预付', '垫付', '服务费']
              return arr[Number(text)] || text
            } else {
              return ''
            }
          },
        },
        {
          title: '授信总额度',
          align: "center",
          dataIndex: 'totalCreditLimit',
          sorter: (a, b) => a.totalCreditLimit - b.totalCreditLimit,
          sortDirections: ['ascend', 'descend']
        },
        {
          title: '授信可用余额',
          align: "center",
          dataIndex: 'availableCreditBalance',
          sorter: (a, b) => a.availableCreditBalance - b.availableCreditBalance,
          sortDirections: ['ascend', 'descend']
        },
        {
          title: '总备款',//对公备款+对私备款
          align: 'center',
          dataIndex: 'totalCashReserve',
          sorter: (a, b) => a.totalCashReserve - b.totalCashReserve,
          sortDirections: ['ascend', 'descend']
        }, {
          title: '总欠款',//授信充值欠款
          align: 'center',
          dataIndex: 'totalArrears',
          sorter: (a, b) => a.totalArrears - b.totalArrears,
          sortDirections: ['ascend', 'descend']
        },
        {
          title: '合计总余额',//总备款-授信已充值金额
          align: 'center',
          dataIndex: 'totalBalanceSum',
          sorter: (a, b) => a.totalBalanceSum - b.totalBalanceSum,
          sortDirections: ['ascend', 'descend']
        },
        {
          title: '可用余额', //可用金额= 授信总额度 - 授信已充值金额 - 备款
          align: 'center',
          dataIndex: 'availablebBalance',
          sorter: (a, b) => a.availablebBalance - b.availablebBalance,
          sortDirections: ['ascend', 'descend']
        },
        {
          title: '对公',
          align: 'center',
          children: [
            {
              title: '现金备款',
              align: 'center',
              dataIndex: 'publicCashReserves'
            },
            {
              title: '授信欠款',
              align: 'center',
              dataIndex: 'publicCreditArrears'
            }
          ]
        },
        {
          title: '对私',
          align: 'center',
          children: [
            {
              title: '现金备款',
              align: 'center',
              dataIndex: 'privateCashReserve'
            },
            {
              title: '授信欠款',
              align: 'center',
              dataIndex: 'privateCreditArrears'
            }
          ]
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
        list: "/projectFundPool/list",
        delete: "/projectFundPool/delete",
        deleteBatch: "/projectFundPool/deleteBatch",
        exportXlsUrl: "/projectFundPool/exportXls",
        importExcelUrl: "projectFundPool/importExcel",

      },
      dictOptions: {},
      superFieldList: [],
      setCreditLimitModalVisible: false,
      setCreditLimitRecord: {},
      balanceManageModalVisible: false,
      balanceManageRecord: {},
      arrearsAdjustModalVisible: false,
      arrearsAdjustRecord: {},
      syncLoading: false,
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
      fieldList.push({ type: 'string', value: 'proId', text: '项目ID', dictCode: '' })
      fieldList.push({ type: 'string', value: 'proName', text: '项目名称', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'totalCreditLimit', text: '授信总额度', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'availableCreditBalance', text: '授信可用余额', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'publicCashReserves', text: '对公现金备款', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'publicCreditArrears', text: '对公授信欠款', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'privateCashReserve', text: '对私现金备款', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'privateCreditArrears', text: '对私授信欠款', dictCode: '' })
      this.superFieldList = fieldList
    },
    onSetCreditLimit(record) {
      this.setCreditLimitRecord = { ...record };
      this.setCreditLimitModalVisible = true;
    },
    handleSetCreditLimitSave(data) {
      this.setCreditLimitModalVisible = false;
      this.setCreditLimitRecord = {};
      this.$message.success('授信额度已保存');
      this.loadData(); // 新增：保存后刷新表格
    },
    handleSetCreditLimitCancel() {
      this.setCreditLimitModalVisible = false;
      this.setCreditLimitRecord = {};
    },
    onBalanceManage(record) {
      this.balanceManageRecord = {
        id: record.id,
        ...record,
        proUniqueId: record.proUniqueId,
      };
      this.balanceManageModalVisible = true;
    },
    handleBalanceManageOk() {
      this.balanceManageModalVisible = false;
      this.balanceManageRecord = {};
      this.$message.success('余额管理操作已完成');
      this.loadData();
    },
    handleBalanceManageCancel() {
      this.balanceManageModalVisible = false;
      this.balanceManageRecord = {};
    },
    onArrearsAdjust(record) {
      this.arrearsAdjustRecord = {
        id: record.id,
        ...record,
        proUniqueId: record.proUniqueId,
      };
      this.arrearsAdjustModalVisible = true;
    },
    handleArrearsAdjustOk() {
      this.arrearsAdjustModalVisible = false;
      this.arrearsAdjustRecord = {};
      this.$message.success('欠款调整操作已完成');
      this.loadData();
    },
    handleArrearsAdjustCancel() {
      this.arrearsAdjustModalVisible = false;
      this.arrearsAdjustRecord = {};
    },
    async handleSyncProject() {
      this.syncLoading = true;
      try {
        const res = await postAction('/projectFundPool/syncProject', {});
        if (res && res.success) {
          this.$message.success(res.message || '同步成功');
          this.loadData && this.loadData();
        } else {
          this.$message.error(res && res.message ? res.message : '同步失败');
        }
      } catch (e) {
        this.$message.error('同步请求异常');
      } finally {
        this.syncLoading = false;
      }
    },
    updateArrears(record) {
      this.onArrearsAdjust(record);
    }
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>
<style scoped>
.action-link {
  margin-left: 8px;
  display: inline-block;
}
</style>