<template>
  <div>
    <a-card :bordered="false">
      <!-- 查询区域 -->
      <div class="table-page-search-wrapper">
        <a-form layout="inline" @keyup.enter.native="searchQuery">
          <a-row :gutter="24">
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="钱包ID">
                <a-input placeholder="请输入钱包ID" v-model="queryParam.walletId"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="钱包名称">
                <a-input placeholder="请输入钱包名称" v-model="queryParam.walletName"></a-input>
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
              <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
                <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
                <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
                <a @click="handleToggleSearch" style="margin-left: 8px">
                  {{ toggleSearchStatus ? '收起' : '展开' }}
                  <a-icon :type="toggleSearchStatus ? 'up' : 'down'" />
                </a>
              </span>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24" v-if="toggleSearchStatus">
              <a-form-item label="代理商">
                <a-input placeholder="请输入代理商" v-model="queryParam.advertiserName"></a-input>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <!-- 查询区域-END -->

      <!-- Tabs区域 -->
      <a-tabs v-model="activeTab" @change="handleTabChange" style="margin-bottom: 16px;">
        <a-tab-pane key="KS" tab="快手">
          <!-- 快手类型的内容 -->
        </a-tab-pane>
        <a-tab-pane key="DY" tab="巨量">
          <!-- 巨量类型的内容 -->
        </a-tab-pane>
        <a-tab-pane key="GDT" tab="腾讯">
          <!-- 腾讯类型的内容 -->
        </a-tab-pane>
        <a-tab-pane key="XHS" tab="小红书">
          <!-- 小红书类型的内容 -->
        </a-tab-pane>
        <a-tab-pane key="CJHC" tab="超级汇川">
          <!-- 超级汇川类型的内容 -->
        </a-tab-pane>
        <a-tab-pane key="BLBL" tab="哔哩哔哩">
          <!-- 哔哩哔哩类型的内容 -->
        </a-tab-pane>
      </a-tabs>

      <!-- 操作按钮区域 -->
      <div class="table-operator">
        <a-button v-if="activeTab === 'GDT'" @click="handleAdd()" type="primary" icon="plus">新增</a-button>
        <a-button type="primary" icon="download" @click="handleExportXls('代理商钱包信息表')">导出</a-button>
        <j-super-query :fieldList="superFieldList" ref="superQueryModal"
          @handleSuperQuery="handleSuperQuery"></j-super-query>
        <a-button type="primary" icon="sync" @click="handleSyncWallet" style="margin-left: 8px;">同步钱包</a-button>
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <a-menu slot="overlay">
            <a-menu-item key="1" @click="batchDel"><a-icon type="delete" />删除</a-menu-item>
          </a-menu>
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

        <a-table ref="table" size="middle" :scroll="{ x: true }" bordered rowKey="id" :columns="currentColumns"
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
            <a @click="handleChangeProject(record)">变更项目</a>
          </span>

        </a-table>
      </div>

      <tab-advertiser-wallet-info-modal ref="modalForm" @ok="modalFormOk"></tab-advertiser-wallet-info-modal>
    </a-card>
    <!-- <a-modal title="钱包余额" v-model="balanceModalVisible" :footer="null" :width="800" :destroyOnClose="true">
      <a-tabs v-model="selectedWalletType" style="margin-bottom: 16px;">
        <a-tab-pane v-for="item in balanceList" :key="item.walletType"
          :tab="walletTypeMap[item.walletType] || item.walletType" />
      </a-tabs>
      <div style="display: flex; overflow-x: auto;">
        <div v-for="item in balanceList" v-show="item.walletType === selectedWalletType" :key="item.id"
          style="min-width: 320px; margin-right: 16px;">
          <a-card :title="walletTypeMap[item.walletType] || item.walletType" bordered>
            <template v-if="item.walletType === 'basic_balance'">
              <div style="display: flex; justify-content: space-between;">
                <div>
                  <div class="balance-row">
                    <span class="balance-label">总余额:</span>
                    <span class="balance-value">{{ formatAmount(item.totalBalance) }}</span>
                  </div>
                  <div class="balance-row">
                    <span class="balance-label">总可用余额:</span>
                    <span class="balance-value">{{ formatAmount(item.totalValidBalance) }}</span>
                  </div>
                  <div class="balance-row">
                    <span class="balance-label">总可转余额:</span>
                    <span class="balance-value">{{ formatAmount(item.totalTransferableBalance) }}</span>
                  </div>
                </div>
                <div style="border-left: 1px solid #f0f0f0; margin: 0 16px; height: 64px;"></div>
                <div>
                  <div class="balance-row">
                    <span class="balance-label">非赠款总余额:</span>
                    <span class="balance-value">{{ formatAmount(item.nonGrantBalance) }}</span>
                  </div>
                  <div class="balance-row">
                    <span class="balance-label">非赠款可用余额:</span>
                    <span class="balance-value">{{ formatAmount(item.nonGrantValidBalance) }}</span>
                  </div>
                  <div class="balance-row">
                    <span class="balance-label">非赠款可转余额:</span>
                    <span class="balance-value">{{ formatAmount(item.nonGrantTransferableBalance) }}</span>
                  </div>
                </div>
              </div>
            </template>
            <template v-else>
              <div style="display: flex; justify-content: space-between;">
                <div>
                  <div class="balance-row">
                    <span class="balance-label">总余额:</span>
                    <span class="balance-value">{{ formatAmount(item.totalBalance) }}</span>
                  </div>
                  <div class="balance-row">
                    <span class="balance-label">总可用余额:</span>
                    <span class="balance-value">{{ formatAmount(item.totalValidBalance) }}</span>
                  </div>
                  <div class="balance-row">
                    <span class="balance-label">预付竞价可用余额:</span>
                    <span class="balance-value">{{ formatAmount(item.prepayBiddingValidBalance) }}</span>
                  </div>
                  <div class="balance-row">
                    <span class="balance-label">预付品牌可用余额:</span>
                    <span class="balance-value">{{ formatAmount(item.prepayBrandValidBalance) }}</span>
                  </div>
                </div>
                <div style="border-left: 1px solid #f0f0f0; margin: 0 16px; height: 96px;"></div>
                <div>
                  <div class="balance-row">
                    <span class="balance-label">预付通用可用余额:</span>
                    <span class="balance-value">{{ formatAmount(item.prepayGeneralValidBalance) }}</span>
                  </div>
                  <div class="balance-row">
                    <span class="balance-label">授信竞价可用余额:</span>
                    <span class="balance-value">{{ formatAmount(item.creditBiddingValidBalance) }}</span>
                  </div>
                  <div class="balance-row">
                    <span class="balance-label">授信品牌可用余额:</span>
                    <span class="balance-value">{{ formatAmount(item.creditBrandValidBalance) }}</span>
                  </div>
                  <div class="balance-row">
                    <span class="balance-label">授信通用可用余额:</span>
                    <span class="balance-value">{{ formatAmount(item.creditGeneralValidBalance) }}</span>
                  </div>
                </div>
              </div>
            </template>
          </a-card>
        </div>
      </div>
    </a-modal> -->
    <!-- :activeTab="activeTab"-->
    <change-project-modal :visible="changeProjectModalVisible" :record="changeProjectRecord" @ok="handleChangeProjectOk"
      @cancel="changeProjectModalVisible = false" />
  </div>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import TabAdvertiserWalletInfoModal from './modules/TabAdvertiserWalletInfoModal'
import ChangeProjectModal from './modules/ChangeProjectModal'
import { getAction } from '@/api/manage'

export default {
  name: 'TabAdvertiserWalletInfoList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    TabAdvertiserWalletInfoModal,
    ChangeProjectModal
  },
  data() {
    return {
      description: '代理商钱包信息表管理页面',
      // 统一表头配置
      columns: [
        {
          title: '代理商ID',
          align: "center",
          dataIndex: 'advertiserId',
          query: ["DY", "GDT", "XHS", "CJHC", "BLBL", "KS"]
        },
        {
          title: '代理商名称',
          align: "center",
          dataIndex: 'advertiserName',
          query: ["DY", "GDT", "XHS", "CJHC", "BLBL", "KS"]
        },
        {
          title: '钱包ID',
          align: "center",
          dataIndex: 'walletId',
          query: ["DY", "GDT", "XHS", "CJHC", "BLBL", "KS"]
        },
        {
          title: '钱包名称',
          align: "center",
          dataIndex: 'walletName',
          query: ["DY", "GDT", "XHS", "CJHC", "BLBL", "KS"]
        },
        {
          title: '项目ID',
          align: 'center',
          dataIndex: 'proUniqueId',
          query: ["DY", "GDT", "XHS", "CJHC", "BLBL", "KS"]
        },
        {
          title: '项目名称',
          align: 'center',
          dataIndex: 'proName',
          query: ["DY", "GDT", "XHS", "CJHC", "BLBL", "KS"]
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
          query: ["DY", "GDT", "XHS", "CJHC", "BLBL", "KS"]
        },
        {
          title: '共享钱包类型',
          align: "center",
          dataIndex: 'walletType',
          customRender: function (text) {
            return text === 'MAIN_WALLET' ? '共享钱包' : text === 'SUB_CONSUME_WALLET' ? '投放子钱包' : '管理子钱包';
          },
          query: ["DY", "GDT", "XHS", "CJHC", "BLBL", "KS"]
        },
        {
          title: '返点模板名称',
          align: "center",
          dataIndex: 'rebateTeptName',
          query: ["DY", "GDT", "XHS", "CJHC", "BLBL", "KS"]
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: "center",
          fixed: "right",
          width: 147,
          scopedSlots: { customRender: 'action' },
          query: ["DY", "GDT", "XHS", "CJHC", "BLBL", "KS"]
        }
      ],
      url: {
        list: "/advertiserWalletInfo/list",
        delete: "/advertiserWalletInfo/delete",
        deleteBatch: "/advertiserWalletInfo/deleteBatch",
        exportXlsUrl: "/advertiserWalletInfo/exportXls",
        importExcelUrl: "advertiserWalletInfo/importExcel",

      },
      dictOptions: {},
      superFieldList: [],
      balanceModalVisible: false,
      balanceList: [],
      balanceLoading: false,
      selectedWalletType: '',
      balanceColumns: [
        // ...已废弃，不再用表格... 
      ],
      walletTypeMap: {
        basic_balance: '常用余额',
        ad_only_balance_info: '巨量广告业务线余额',
        ecp_only_balance_info: '巨量千川业务线余额',
        local_only_balance_info: '巨量本地推业务线余额',
        ad_shared_balance_info: '巨量AD/千川/本地推业务线余额'
      },
      activeTab: 'KS', // 默认快手
      channelPlatform: 'KS', // 默认快手
      changeProjectModalVisible: false,
      changeProjectRecord: null,
    }
  },
  created() {
    this.getSuperFieldList();
  },
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
    },
    // 根据当前选中的tab返回对应的列配置
    currentColumns() {
      return this.columns.filter(column => {
        if (!column.query) return true;
        return column.query.includes(this.activeTab);
      });
    }
  },
  methods: {
    initDictConfig() {
    },
    getSuperFieldList() {
      let fieldList = [];
      // fieldList.push({ type: 'string', value: 'delFlag', text: '删除标识（0：未删除1：已删除）', dictCode: '' })
      fieldList.push({ type: 'string', value: 'channelName', text: '渠道名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'channelPlatform', text: '平台标识', dictCode: '' })
      fieldList.push({ type: 'string', value: 'channelSign', text: '渠道标识', dictCode: '' })
      fieldList.push({ type: 'string', value: 'advertiserId', text: '代理商Id', dictCode: '' })
      fieldList.push({ type: 'string', value: 'advertiserName', text: '代理商名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'mainWalletId', text: '共享钱包ID', dictCode: '' })
      fieldList.push({ type: 'string', value: 'walletType', text: '共享钱包类型:MAIN_WALLET 共享钱包,SUB_CONSUME_WALLET 投放子钱包,SUB_MANAGE_WALLET 管理子钱包', dictCode: '' })
      fieldList.push({ type: 'string', value: 'companyId', text: '客户公司ID', dictCode: '' })
      fieldList.push({ type: 'string', value: 'walletId', text: '钱包ID', dictCode: '' })
      fieldList.push({ type: 'string', value: 'walletName', text: '钱包名称', dictCode: '' })
      fieldList.push({ type: 'datetime', value: 'walletCreateTime', text: '钱包创建时间' })
      fieldList.push({ type: 'Text', value: 'walletDescription', text: '钱包描述', dictCode: '' })
      fieldList.push({ type: 'string', value: 'walletStatus', text: '钱包状态', dictCode: '' })
      fieldList.push({ type: 'string', value: 'accountPlatform', text: '账户业务线范围', dictCode: '' })
      fieldList.push({ type: 'int', value: 'advCnt', text: '钱包下的 adv 数量', dictCode: '' })
      this.superFieldList = fieldList
    },
    // 只在查询参数中拼接 *，不影响输入框
    getQueryParams() {
      let params = this.$options.mixins[0].methods.getQueryParams.call(this);
      // 增加 channelPlatform 参数
      params.channelPlatform = this.channelPlatform;
      if (params.walletName) {
        let val = params.walletName;
        if (!val.startsWith('*')) val = '*' + val;
        if (!val.endsWith('*')) val = val + '*';
        params.walletName = val;
      }
      return params;
    },
    handleTabChange(key) {
      this.activeTab = key;
      // 切换tab时设置 channelPlatform
      this.channelPlatform = key;
      this.searchQuery(); // 切换tab时刷新数据
    },
    async handleSyncWallet() {
      this.loading = true;
      try {
        const res = await getAction('/advertiserWalletInfo/synchro');
        if (res.success) {
          this.$message.success(res.message || '同步成功');
          this.loadData(1);
        } else {
          this.$message.error(res.message || '同步失败');
        }
      } catch (e) {
        this.$message.error('同步异常');
      } finally {
        this.loading = false;
      }
    },
    async handleSyncBalance() {
      this.loading = true;
      try {
        const res = await getAction('/advertiserWalletBalance/synchro');
        if (res.success) {
          this.$message.success(res.message || '余额同步成功');
        } else {
          this.$message.error(res.message || '余额同步失败');
        }
      } catch (e) {
        this.$message.error('余额同步异常');
      } finally {
        this.loading = false;
      }
    },
    async handleViewBalance(record) {
      this.balanceModalVisible = true;
      this.balanceLoading = true;
      try {
        const res = await getAction('/advertiserWalletBalance/listNotPage', { walletId: record.walletId });
        if (res.success) {
          const walletTypeOrder = [
            'basic_balance',
            'ad_only_balance_info',
            'ecp_only_balance_info',
            'local_only_balance_info',
            'ad_shared_balance_info'
          ];
          this.balanceList = (res.result || []).sort(
            (a, b) => walletTypeOrder.indexOf(a.walletType) - walletTypeOrder.indexOf(b.walletType)
          );
          if (this.balanceList.length > 0) {
            this.selectedWalletType = this.balanceList[0].walletType;
          }
        } else {
          this.balanceList = [];
          this.$message.error(res.message || '获取余额失败');
        }
      } catch (e) {
        this.balanceList = [];
        this.$message.error('请求异常');
      } finally {
        this.balanceLoading = false;
      }
    },
    formatAmount(val) {
      return val == null ? '-' : Number(val).toFixed(2)
    },
    handleChangeProject(record) {
      this.changeProjectRecord = record
      this.changeProjectModalVisible = true
    },
    handleChangeProjectOk() {
      this.changeProjectModalVisible = false
      this.changeProjectRecord = null
      this.loadData && this.loadData() // 刷新表格
    },
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less';

.balance-row {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 8px;
}

.balance-label {
  font-weight: bold;
  color: #555;
  min-width: 120px;
  text-align: left;
  margin-right: 24px;
}

.balance-value {
  font-size: 18px;
  color: #1890ff;
  font-weight: bold;
  min-width: 80px;
  text-align: right;
  display: inline-block;
}
</style>