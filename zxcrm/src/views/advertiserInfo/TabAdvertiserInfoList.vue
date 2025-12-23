<template>
  <div style="background-color: #fff;">
    <a-tabs default-active-key="KS" v-model="activeParentTab" @change="handleParentTabChange" tabPosition="top">
      <a-tab-pane key="KS" tab="快手" :disabled="loading">
        <a-tabs default-active-key="KS-CLYQ" v-model="activeChildTab.KS" @change="handleChildTabChange">
          <a-tab-pane key="KS-CLYQ" tab="磁力引擎" :disabled="loading">
          </a-tab-pane>
          <a-tab-pane key="KS-CLJN" tab="磁力金牛" :disabled="loading">
          </a-tab-pane>
          <a-tab-pane key="KS-DJK" tab="大健康" :disabled="loading">
          </a-tab-pane>
          <a-tab-pane key="KS-CLJX" tab="磁力聚星" :disabled="loading">
          </a-tab-pane>
        </a-tabs>
      </a-tab-pane>
      <a-tab-pane key="DY" tab="巨量" :disabled="loading">
        <a-tabs default-active-key="DY-JLGG" v-model="activeChildTab.JL" @change="handleChildTabChange">
          <a-tab-pane key="DY-JLGG" tab="巨量广告" :disabled="loading" :loading="loading">
            <!-- 巨量广告 -->
          </a-tab-pane>
          <a-tab-pane key="DY-JLQC" tab="巨量千川" :disabled="loading">
            <!-- 巨量前川 -->
          </a-tab-pane>
          <a-tab-pane key="DY-JLBDT" tab="巨量本地推" :disabled="loading">
          </a-tab-pane>
          <a-tab-pane key="DY-JLXT" tab="巨量星图" :disabled="loading">
          </a-tab-pane>
          <a-tab-pane key="DY-GXQB" tab="共享钱包" :disabled="loading">
          </a-tab-pane>
        </a-tabs>
      </a-tab-pane>
      <a-tab-pane key="TX" tab="腾讯" :disabled="loading">
        <a-tabs default-active-key="TX-GDT" v-model="activeChildTab.TX" @change="handleChildTabChange">
          <a-tab-pane key="TX-GDT" tab="广点通" :disabled="loading">
          </a-tab-pane>
        </a-tabs>
      </a-tab-pane>
      <a-tab-pane key="XHS" tab="小红书" :disabled="loading">
        <a-tabs default-active-key="XHS" v-model="activeChildTab.XHS" @change="handleChildTabChange">
          <a-tab-pane key="XHS" tab="小红书" :disabled="loading">
          </a-tab-pane>
        </a-tabs>
      </a-tab-pane>
      <!-- <a-tab-pane key="CJHC" tab="超级汇川" :disabled="loading">
        <a-tabs default-active-key="CJHC" v-model="activeChildTab.CJHC" @change="handleChildTabChange">
          <a-tab-pane key="CJHC" tab="超级汇川" :disabled="loading">
          </a-tab-pane>
        </a-tabs>
      </a-tab-pane>
      <a-tab-pane key="BLBL" tab="哔哩哔哩" :disabled="loading">
        <a-tabs default-active-key="BLBL" v-model="activeChildTab.BLBL" @change="handleChildTabChange">
          <a-tab-pane key="BLBL" tab="哔哩哔哩" :disabled="loading">
          </a-tab-pane>
        </a-tabs>error loading model: error loading model architecture: unknown model architecture: 'sd3'
      </a-tab-pane> -->
      <a-tab-pane key="FMT" tab="泛媒体" :disabled="loading">
      </a-tab-pane>
    </a-tabs>

    <a-card :bordered="false">
      <!-- 查询区域 -->
      <div class="table-page-search-wrapper">
        <a-form layout="inline" @keyup.enter.native="searchQuery">
          <a-row :gutter="24">
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="代理商ID">
                <a-input placeholder="请输入代理商ID" v-model="queryParam.advertiserId">
                  <a-tooltip slot="suffix">
                    <a-icon type="heat-map" class="super-search-icon" ref="super-search-icon" @click="setSuperParams" />
                  </a-tooltip>
                </a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="代理商名称">
                <a-input placeholder="请输入代理商名称" v-model="queryParam.advertiserName"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="渠道名称">
                <a-input placeholder="请输入渠道名称" v-model="queryParam.channelName"></a-input>
              </a-form-item>
            </a-col>
            <template v-if="toggleSearchStatus">
              <!-- <a-col :xl="6" :lg="7" :md="8" :sm="24">
                <a-form-item label="授权状态">
                  <a-select v-model="queryParam.isValid" placeholder="请选择授权状态">
                    <a-select-option value="">请选择</a-select-option>
                    <a-select-option value="true">已授权</a-select-option>
                    <a-select-option value="false">未授权</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col> -->
              <a-col :xl="6" :lg="7" :md="8" :sm="24">
                <a-form-item label="资金类型">
                  <a-select v-model="queryParam.capitalType" placeholder="请选择资金类型">
                    <a-select-option value="">请选择</a-select-option>
                    <a-select-option value="CREDIT_BIDDING">授信竞价</a-select-option>
                    <a-select-option value="CREDIT_BRAND">授信品牌</a-select-option>
                    <a-select-option value="CREDIT_GENERAL">授信通用</a-select-option>
                    <a-select-option value="PREPAY_BIDDING">预付竞价</a-select-option>
                    <a-select-option value="PREPAY_BRAND">预付品牌</a-select-option>
                    <a-select-option value="PREPAY_GENERAL">预付通用</a-select-option>
                    <a-select-option value="FUND_TYPE_CREDIT_ROLL">竞价信用账户</a-select-option>
                    <a-select-option value="FUND_TYPE_CASH">现金账户</a-select-option>
                    <a-select-option value="FUND_TYPE_TEST_VIRTUAL">测试虚拟金账户</a-select-option>
                    <a-select-option value="FUND_TYPE_GIFT">赠送账户</a-select-option>
                    <a-select-option value="1">现金</a-select-option>
                    <a-select-option value="2">信用</a-select-option>
                    <a-select-option value="6">现金+信用</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :xl="6" :lg="7" :md="8" :sm="24">
                <a-form-item label="代理商角色">
                  <a-input placeholder="请输入代理商角色" v-model="queryParam.advertiserRole"></a-input>
                </a-form-item>
              </a-col>
              <a-col :xl="6" :lg="7" :md="8" :sm="24">
                <a-form-item label="应用ID">
                  <a-input placeholder="请输入应用ID" v-model="queryParam.applyId"></a-input>
                </a-form-item>
              </a-col>
              <a-col :xl="6" :lg="7" :md="8" :sm="24">
                <a-form-item label="平台标识">
                  <a-input placeholder="请输入平台标识" v-model="queryParam.channelPlatform"></a-input>
                </a-form-item>
              </a-col>
            </template>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
                <a-button type="primary" @click="searchQuery" icon="search" style="margin-left: 8px">查询</a-button>
                <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
                <a @click="handleToggleSearch" style="margin-left: 8px">
                  {{ toggleSearchStatus ? '收起' : '展开' }}
                  <a-icon :type="toggleSearchStatus ? 'up' : 'down'" />
                </a>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <!-- 查询区域-END -->

      <!-- 操作按钮区域 -->
      <div class="table-operator">
        <a-button type="primary" icon="plus" @click="handleAdd">添加代理商</a-button>
        <a-button type="primary" icon="download" @click="handleExportXls('代理商信息')">导出</a-button>
        <a-button type="primary" icon="sync" @click="handleSyncSubject">更新主体</a-button>
        <!-- 高级查询区域 -->
        <j-super-query :fieldList="superFieldList" ref="superQueryModal"
          @handleSuperQuery="handleSuperQuery"></j-super-query>
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <a-menu slot="overlay">
            <a-menu-item key="1" @click="batchConfig"><a-icon type="setting" />批量配置</a-menu-item>
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

        <!-- 共享钱包独立表格 -->
        <a-table v-if="isSharedWallet" ref="walletTable" size="middle" :scroll="{ x: true }" bordered
          rowKey="mainWalletId" :columns="walletColumns" :dataSource="walletDataSource" :pagination="walletPagination"
          :loading="walletLoading" :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
          class="j-table-force-nowrap" @change="handleWalletTableChange">

          <span slot="walletAction" slot-scope="text, record">
            <a @click="handleWalletConfig(record)">配置</a>
          </span>

        </a-table>

        <!-- 普通代理商信息表格 -->
        <a-table v-else ref="table" size="middle" :scroll="{ x: true }" bordered rowKey="id" :columns="filteredColumns"
          :dataSource="dataSource" :pagination="ipagination" :loading="loading"
          :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }" class="j-table-force-nowrap"
          @change="handleTableChange">

          <template slot="htmlSlot" slot-scope="text, record" v-if="getShow(record)">
            <div v-html="text"></div>
          </template>

          <template slot="authStatus" slot-scope="text">
            <div v-if="text === 'true'" style="display: flex; align-items: center; justify-content: center;">
              <div style="width: 8px; height: 8px; border-radius: 50%; background-color: #52c41a; margin-right: 6px;">
              </div>
              <span>已授权</span>
            </div>
            <div v-else-if="text === 'false'" style="display: flex; align-items: center; justify-content: center;">
              <div style="width: 8px; height: 8px; border-radius: 50%; background-color: #ff4d4f; margin-right: 6px;">
              </div>
              <span>未授权</span>
            </div>
            <span v-else>{{ text }}</span>
          </template>

          <span slot="action" slot-scope="text, record">
            <a @click="handleConfig(record)">配置</a>
          </span>

        </a-table>
      </div>
      <!-- 配置弹窗 -->
      <a-modal title="配置" :visible="configModalVisible" @ok="handleConfigOk" @cancel="handleConfigCancel"
        :confirmLoading="configModalLoading">
        <a-form-model ref="configForm" :model="configForm" :rules="configRules" configFormlayout="vertical">
          <a-form-model-item label="代理商ID">
            <a-input v-model="configForm.advertiserId" disabled />
          </a-form-model-item>
          <a-form-model-item label="代理商名称">
            <a-input v-model="configForm.advertiserName" />
          </a-form-model-item>
          <a-form-model-item label="默认资金类型" prop="defaultCapitalType">
            <a-select v-model="configForm.defaultCapitalType" placeholder="请选择默认资金类型">
              <a-select-option v-if="configForm.channelPlatform === 'DY'" value="CREDIT_BIDDING">授信竞价</a-select-option>
              <a-select-option v-if="configForm.channelPlatform === 'DY'" value="CREDIT_BRAND">授信品牌</a-select-option>
              <a-select-option v-if="configForm.channelPlatform === 'DY'" value="CREDIT_GENERAL">授信通用</a-select-option>
              <a-select-option v-if="configForm.channelPlatform === 'DY'" value="PREPAY_BIDDING">预付竞价</a-select-option>
              <a-select-option v-if="configForm.channelPlatform === 'DY'" value="PREPAY_BRAND">预付品牌</a-select-option>
              <a-select-option v-if="configForm.channelPlatform === 'DY'" value="PREPAY_GENERAL">预付通用</a-select-option>
              <a-select-option v-if="configForm.channelPlatform === 'GDT'"
                value="FUND_TYPE_CREDIT_ROLL">竞价信用账户</a-select-option>
              <a-select-option v-if="configForm.channelPlatform === 'GDT'" value="FUND_TYPE_CASH">现金账户</a-select-option>
              <a-select-option v-if="configForm.channelPlatform === 'GDT'"
                value="FUND_TYPE_TEST_VIRTUAL">测试虚拟金账户</a-select-option>
              <a-select-option v-if="configForm.channelPlatform === 'GDT'" value="FUND_TYPE_GIFT">赠送账户</a-select-option>
              <a-select-option v-if="configForm.channelPlatform === 'KS'" value="1">现金</a-select-option>
              <a-select-option v-if="configForm.channelPlatform === 'KS'" value="2">信用</a-select-option>
              <a-select-option v-if="configForm.channelPlatform === 'KS'" value="6">现金+信用</a-select-option>

              <a-select-option v-if="configForm.channelPlatform === 'XHS'" value="1">现金</a-select-option>
              <a-select-option v-if="configForm.channelPlatform === 'XHS'" value="2">信用</a-select-option>
              <a-select-option v-if="configForm.channelPlatform === 'CJHC'" value="1">现金</a-select-option>
              <a-select-option v-if="configForm.channelPlatform === 'CJHC'" value="2">信用</a-select-option>
              <a-select-option v-if="configForm.channelPlatform === 'BLBL'" value="1">现金</a-select-option>
              <a-select-option v-if="configForm.channelPlatform === 'BLBL'" value="2">信用</a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item label="是否授权API" prop="isMediaPlatform">
            <a-select v-model="configForm.isMediaPlatform" placeholder="请选择默认资金类型">
              <a-select-option value="0">是</a-select-option>
              <a-select-option value="1">否</a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item label="备注" prop="remarks">
            <a-textarea v-model="configForm.remarks" placeholder="请输入备注" :rows="4" />
          </a-form-model-item>
        </a-form-model>
      </a-modal>

      <!-- 钱包配置弹窗 -->
      <a-modal title="钱包配置" :visible="walletConfigModalVisible" @ok="handleWalletConfigOk"
        @cancel="handleWalletConfigCancel" :confirmLoading="walletConfigModalLoading">
        <a-form-model ref="walletConfigForm" :model="walletConfigForm" :rules="walletConfigRules" layout="vertical">
          <a-form-model-item label="钱包ID">
            <a-input v-model="walletConfigForm.mainWalletId" disabled />
          </a-form-model-item>
          <a-form-model-item label="钱包名称">
            <a-input v-model="walletConfigForm.mainWalletName" />
          </a-form-model-item>
          <a-form-model-item label="是否授权API" prop="isMediaPlatform" required>
            <a-select v-model="walletConfigForm.isMediaPlatform" placeholder="请选择是否授权API">
              <a-select-option value="0">是</a-select-option>
              <a-select-option value="1">否</a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item label="资金类型" prop="capitalType" required>
            <a-select style="width: 100%;" v-model="walletConfigForm.capitalType" placeholder="请选择资金类型"
              :disabled="!activeParentTab" :key="activeParentTab">
              <a-select-option v-if="activeParentTab === 'DY'" value="CREDIT_BIDDING">授信竞价</a-select-option>
              <a-select-option v-if="activeParentTab === 'DY'" value="CREDIT_BRAND">授信品牌</a-select-option>
              <a-select-option v-if="activeParentTab === 'DY'" value="CREDIT_GENERAL">授信通用</a-select-option>
              <a-select-option v-if="activeParentTab === 'DY'" value="PREPAY_BIDDING">预付竞价</a-select-option>
              <a-select-option v-if="activeParentTab === 'DY'" value="PREPAY_BRAND">预付品牌</a-select-option>
              <a-select-option v-if="activeParentTab === 'DY'" value="PREPAY_GENERAL">预付通用</a-select-option>
              <a-select-option v-if="activeParentTab === 'TX'" value="FUND_TYPE_CREDIT_ROLL">竞价信用账户</a-select-option>
              <a-select-option v-if="activeParentTab === 'TX'" value="FUND_TYPE_CASH">现金账户</a-select-option>
              <a-select-option v-if="activeParentTab === 'TX'" value="FUND_TYPE_TEST_VIRTUAL">测试虚拟金账户</a-select-option>
              <a-select-option v-if="activeParentTab === 'TX'" value="FUND_TYPE_GIFT">赠送账户</a-select-option>
              <a-select-option v-if="activeParentTab === 'KS'" value="1">现金</a-select-option>
              <a-select-option v-if="activeParentTab === 'KS'" value="2">信用</a-select-option>
              <a-select-option v-if="activeParentTab === 'KS'" value="6">现金+信用</a-select-option>
              <a-select-option v-if="activeParentTab === 'XHS'" value="1">现金</a-select-option>
              <a-select-option v-if="activeParentTab === 'XHS'" value="2">信用</a-select-option>
              <a-select-option v-if="activeParentTab === 'CJHC'" value="1">现金</a-select-option>
              <a-select-option v-if="activeParentTab === 'CJHC'" value="2">信用</a-select-option>
              <a-select-option v-if="activeParentTab === 'BLBL'" value="1">现金</a-select-option>
              <a-select-option v-if="activeParentTab === 'BLBL'" value="2">信用</a-select-option>
              <a-select-option v-if="activeParentTab === 'FMT'" value="1">现金</a-select-option>
              <a-select-option v-if="activeParentTab === 'FMT'" value="2">信用</a-select-option>
            </a-select>
          </a-form-model-item>
        </a-form-model>

      </a-modal>
    </a-card>
    <TabAdvertiserInfoModal ref="tabAdvertiserInfoModal" />
  </div>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { updateAdvertiserCapitalType } from '@/api/api'
import TabAdvertiserInfoModal from './modules/TabAdvertiserInfoModal.vue'
import { getAction, postAction } from '@/api/manage'

export default {
  name: 'TabAdvertiserInfoList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    TabAdvertiserInfoModal
  },
  data() {
    return {
      datalist: [''],
      originalColumns: [], // 保存原始columns配置
      queryParam: {
        channelSign: 'KS-CLYQ'
      },
      activeParentTab: 'KS',
      activeChildTab: {
        JL: 'DY-JLGG',
        TX: 'TX-GDT',
        KS: 'KS-CLYQ',
        CJHC: 'CJHC',
        XHS: 'XHS',
        BLBL: 'BLBL',
        FMT: 'CJHC,BLBL,WYMS'
      },
      description: '代理商信息管理页面',
      // 表头
      columns: [
        {
          title: '代理商ID',
          align: "center",
          dataIndex: 'advertiserId',
          query: ["KS", "DY", "TX", "XHS", "CJHC", "BLBL", "FMT"]
        },
        {
          title: '代理商名称',
          align: "center",
          dataIndex: 'advertiserName',
          query: ["KS", "DY", "TX", "XHS", "CJHC", "BLBL", "FMT"]
        },
        // {
        //   title: '渠道名称',
        //   align: "center",
        //   dataIndex: 'channelSign',
        //   query: ["KS", "DY", "TX"]
        // },
        // {
        //   title: '授权状态',
        //   align: "center",
        //   dataIndex: 'isValid',
        //   query: ["KS", "DY", "TX", "XHS", "CJHC", "BLBL"],
        //   scopedSlots: { customRender: 'authStatus' }
        // },
        {
          title: '默认资金类型',
          align: "center",
          dataIndex: 'capitalType',
          query: ["KS", "DY", "TX", "XHS", "CJHC", "BLBL", "FMT"],
          customRender: (text) => {
            if (text === 'CREDIT_BIDDING') return '授信竞价'
            if (text === 'CREDIT_BRAND') return '授信品牌'
            if (text === 'CREDIT_GENERAL') return '授信通用'
            if (text === 'PREPAY_BIDDING') return '预付竞价'
            if (text === 'PREPAY_BRAND') return '预付品牌'
            if (text === 'PREPAY_GENERAL') return '预付通用'
            if (text === 'FUND_TYPE_CREDIT_ROLL') return '竞价信用账户'
            if (text === 'FUND_TYPE_CASH') return '现金账户'
            if (text === 'FUND_TYPE_TEST_VIRTUAL') return '测试虚拟金账户'
            if (text === 'FUND_TYPE_GIFT') return '赠送账户'
            if (text === '1') return '现金'
            if (text === '2') return '信用'
            if (text === '6') return '现金+信用'
            return text
          }
        },
        // {
        //   title: '代理商角色',
        //   align: "center",
        //   dataIndex: 'advertiserRole',
        //   query: ["KS", "DY", "TX"]
        // },
        // {
        //   title: '应用ID',
        //   align: "center",
        //   dataIndex: 'applyId',
        //   query: ["KS", "DY", "TX"]
        // },
        {
          title: '是否授权API',
          align: "center",
          dataIndex: 'isMediaPlatform',
          query: ["KS", "DY", "TX", "XHS", "CJHC", "BLBL", "FMT"],
          customRender: (text) => {
            if (text === '1') return '否'
            if (text === '0') return '是'
            return text
          }
        },
        {
          title: '备注',
          align: "center",
          dataIndex: 'remarks',
          query: ["KS", "DY", "TX", "XHS", "CJHC", "BLBL", "FMT"]
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: "center",
          fixed: "right",
          width: 147,
          query: ["KS", "DY", "TX", "XHS", "CJHC", "BLBL", "FMT"],
          scopedSlots: { customRender: 'action' }
        }
      ],
      url: {
        list: "/advertiserInfo/list",
        delete: "/advertiserInfo/delete",
        deleteBatch: "/advertiserInfo/deleteBatch",
        exportXlsUrl: "/advertiserInfo/exportXls",
        importExcelUrl: "advertiserInfo/importExcel",

      },
      dictOptions: {},
      superFieldList: [],
      // 配置弹窗相关数据
      configModalVisible: false,
      configModalLoading: false,
      configForm: {
        id: '',
        advertiserId: '',
        advertiserName: '',
        defaultCapitalType: '',
        remarks: '',
        channelPlatform: '',
        isMediaPlatform: '1'
      },
      configRules: {
        defaultCapitalType: [
          { required: true, message: '请选择默认资金类型', trigger: 'change' }
        ]
      },
      // 钱包配置弹窗相关数据
      walletConfigModalVisible: false,
      walletConfigModalLoading: false,
      walletConfigForm: {
        mainWalletId: '',
        mainWalletName: '',
        isMediaPlatform: '',
        capitalType: ''
      },
      walletConfigRules: {
        isMediaPlatform: [
          { required: true, message: '请选择是否授权API', trigger: 'change' }
        ],
        capitalType: [
          { required: true, message: '请选择资金类型', trigger: 'change' }
        ]
      },
      // 共享钱包独立数据
      walletDataSource: [],
      walletPagination: {
        current: 1,
        pageSize: 10,
        pageSizeOptions: ['10', '20', '30', '200'],
        showTotal: (total, range) => {
          return range[0] + "-" + range[1] + " 共" + total + "条"
        },
        showQuickJumper: true,
        showSizeChanger: true,
        total: 0
      },
      walletLoading: false,
      walletColumns: [
        {
          title: '钱包ID',
          align: "center",
          dataIndex: 'mainWalletId',
          key: 'mainWalletId'
        },
        {
          title: '钱包名称',
          align: "center",
          dataIndex: 'mainWalletName',
          key: 'mainWalletName'
        },
        {
          title: '是否授权API',
          align: "center",
          dataIndex: 'isMediaPlatform',
          key: 'isMediaPlatform',
          customRender: (text) => {
            if (text == '0') return '是'
            if (text == '1') return '否'
            return text
          }
        },
        {
          title: '资金类型',
          align: "center",
          dataIndex: 'capitalType',
          key: 'capitalType',
          customRender: (text) => {
            if (text === 'CREDIT_BIDDING') return '授信竞价'
            if (text === 'CREDIT_BRAND') return '授信品牌'
            if (text === 'CREDIT_GENERAL') return '授信通用'
            if (text === 'PREPAY_BIDDING') return '预付竞价'
            if (text === 'PREPAY_BRAND') return '预付品牌'
            if (text === 'PREPAY_GENERAL') return '预付通用'
            if (text === 'FUND_TYPE_CREDIT_ROLL') return '竞价信用账户'
            if (text === 'FUND_TYPE_CASH') return '现金账户'
            if (text === 'FUND_TYPE_TEST_VIRTUAL') return '测试虚拟金账户'
            if (text === 'FUND_TYPE_GIFT') return '赠送账户'
            if (text === '1') return '现金'
            if (text === '2') return '信用'
            if (text === '6') return '现金+信用'
            return text
          }
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: "center",
          fixed: "right",
          width: 147,
          scopedSlots: { customRender: 'walletAction' }
        }
      ]
    }
  },
  created() {
    this.getSuperFieldList();
    // 保存原始columns配置
    this.originalColumns = [...this.columns];
  },
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
    },
    filteredColumns() {
      return this.columns.filter(column => {
        if (!column.query) return true;
        return column.query.includes(this.activeParentTab);
      });
    },
    isSharedWallet() {
      return this.activeParentTab === 'DY' && this.activeChildTab.JL === 'DY-GXQB';
    }
  },
  methods: {
    // 更新主体
    handleSyncSubject() {
      this.$confirm({
        title: '确认更新',
        content: '确定要更新代理商信息吗？',
        onOk: () => {
          this.loading = true;
          this.$http.post('/advertiserInfo/updateData').then(res => {
            if (res.success) {
              this.$message.success('更新代理商信息成功');
              // 刷新列表
              this.loadData(1);
            } else {
              this.$message.error(res.message || '更新代理商信息失败');
            }
          }).catch(err => {
            this.$message.error('更新代理商信息失败：' + err.message);
          }).finally(() => {
            this.loading = false;
          });
        }
      });
    },
    setSuperParams() {
      this.$refs['superQueryModal'].showModal()
    },
    superSearchOk(superQueryParams, superQueryMatchType) {
      // 检查是否有有效的查询参数（过滤掉空字符串）
      const validParams = superQueryParams.filter(param => param.val && param.val.trim() !== '');
      const hasValidParams = validParams.length > 0;

      if (hasValidParams) {
        if (this.$refs['super-search-icon'] && this.$refs['super-search-icon'].$el) {
          this.$refs['super-search-icon'].$el.style.color = '#1890ff'
        }
      } else {
        if (this.$refs['super-search-icon'] && this.$refs['super-search-icon'].$el) {
          this.$refs['super-search-icon'].$el.style.color = 'rgba(0,0,0,.45)'
        }
      }
      // 只传递有效的参数给 handleSuperQuery
      this.handleSuperQuery(validParams, superQueryMatchType)
    },
    searchReset() {
      // 保留 channelSign 参数
      const channelSign = this.queryParam.channelSign;
      this.queryParam = { channelSign };
      // 重置图标颜色
      if (this.$refs['super-search-icon'] && this.$refs['super-search-icon'].$el) {
        this.$refs['super-search-icon'].$el.style.color = 'rgba(0,0,0,.45)'
      }
      // 重置超级查询参数
      this.superQueryParams = ''
      this.superQueryFlag = false
      // 清除 superQueryModal 组件中的 lastDataList 数据
      if (this.$refs['superQueryModal']) {
        this.$refs['superQueryModal'].clearLastDataList()
      }

      // 如果是共享钱包页面，刷新共享钱包数据
      if (this.activeChildTab.JL === 'DY-GXQB') {
        this.loadWalletData(1)
      } else {
        this.loadData(1)
      }
    },
    // 重写查询方法，支持共享钱包
    searchQuery() {
      if (this.isSharedWallet) {
        // 共享钱包模式，调用共享钱包数据加载方法
        this.loadWalletData(1)
      } else {
        // 普通模式，调用 mixin 的 loadData 方法
        this.loadData(1)
      }
      // 点击查询清空列表选中行
      this.selectedRowKeys = []
      this.selectionRows = []
    },
    getShow(list) {
      // console.log(list)
      let target = this.activeParentTab
    },
    getQueryField() {
      var str = "id,";
      if (this.activeParentTab == '') { }
      this.columns.forEach((value) => {
        let list = value.query || []
        let target = this.activeParentTab
        if (list.includes(target)) {
          str += "," + value.dataIndex;
        }
      });
      return str;
    },
    // 父级tab切换
    handleParentTabChange(activeKey) {
      this.activeParentTab = activeKey;
      // 如果当前是泛媒体，直接设置参数并返回
      if (activeKey === 'FMT') {
        Object.keys(this.queryParam).forEach(key => {
          delete this.queryParam[key]
        })
        this.$set(this.queryParam, 'channelSign', 'CJHC,BLBL,WYMS')
        this.url.list = '/advertiserInfo/list'
        this.columns = [...this.originalColumns]
        this.searchQuery()
        return
      }

      // 获取当前父tab下的子tab activeKey
      let childTabKey;
      if (activeKey === 'KS') {
        childTabKey = this.activeChildTab.KS;
      } else if (activeKey === 'DY') {
        childTabKey = this.activeChildTab.JL;
      } else if (activeKey === 'TX') {
        childTabKey = this.activeChildTab.TX;
      } else if (activeKey === 'XHS') {
        childTabKey = this.activeChildTab.XHS;
      } else if (activeKey === 'CJHC') {
        childTabKey = this.activeChildTab.CJHC;
      } else if (activeKey === 'BLBL') {
        childTabKey = this.activeChildTab.BLBL;
      }

      if (childTabKey === 'DY-GXQB') {
        // 切换到共享钱包tab
        this.getBigWallet()
      } else {
        // 切换到其他tab，恢复原始的代理商信息列表
        // 清除所有查询参数，重新设置，确保不包含channelPlatform
        Object.keys(this.queryParam).forEach(key => {
          delete this.queryParam[key]
        })
        this.$set(this.queryParam, 'channelSign', childTabKey)
        this.url.list = '/advertiserInfo/list'
        // 恢复原始columns配置
        this.columns = [...this.originalColumns]
        this.searchQuery()
      }
    },
    // 子级tab切换
    handleChildTabChange(activeKey) {
      // 根据当前父tab更新对应的子tab activeKey
      if (this.activeParentTab === 'KS') {
        this.activeChildTab.KS = activeKey;
      } else if (this.activeParentTab === 'DY') {
        this.activeChildTab.JL = activeKey;
      } else if (this.activeParentTab === 'TX') {
        this.activeChildTab.TX = activeKey;
      } else if (this.activeParentTab === 'XHS') {
        this.activeChildTab.XHS = activeKey;
      }

      if (activeKey === 'DY-GXQB') {
        // 切换到共享钱包tab
        this.getBigWallet()
      } else {
        // 切换到其他tab，恢复原始的代理商信息列表
        // 清除所有查询参数，重新设置，确保不包含channelPlatform
        Object.keys(this.queryParam).forEach(key => {
          delete this.queryParam[key]
        })
        this.$set(this.queryParam, 'channelSign', activeKey)
        this.url.list = '/advertiserInfo/list'
        // 恢复原始columns配置
        this.columns = [...this.originalColumns]
        this.searchQuery()
      }
    },
    getBigWallet() {
      // 清空之前的查询参数，避免影响共享钱包数据加载
      this.queryParam = { channelPlatform: 'DY' }
      // 加载共享钱包数据
      this.loadWalletData(1)
    },
    // 加载共享钱包数据
    loadWalletData(arg) {
      if (arg === 1) {
        this.walletPagination.current = 1
      }
      const params = {
        channelPlatform: 'DY',
        pageNo: this.walletPagination.current,
        pageSize: this.walletPagination.pageSize
      }
      this.walletLoading = true
      console.log('加载共享钱包数据，参数：', params)
      getAction('/advertiserWalletInfo/mainWalletList', params).then((res) => {
        console.log('共享钱包接口返回：', res)
        if (res.success && res.result) {
          // 处理返回的数据，根据不同的数据结构处理
          let dataList = []
          let total = 0

          if (Array.isArray(res.result)) {
            // 如果 result 直接是数组
            dataList = res.result
            total = res.result.length
          } else if (res.result.records && Array.isArray(res.result.records)) {
            // 如果 result 是对象，包含 records 数组
            dataList = res.result.records
            total = res.result.total || res.result.records.length
          } else if (res.result.result && Array.isArray(res.result.result)) {
            // 如果 result.result 是数组
            dataList = res.result.result
            total = res.result.total || res.result.result.length
          } else if (res.result.result && res.result.result.records && Array.isArray(res.result.result.records)) {
            // 如果 result.result.records 是数组
            dataList = res.result.result.records
            total = res.result.result.total || res.result.result.records.length
          }

          this.walletDataSource = dataList
          this.walletPagination.total = total
        } else {
          this.$message.warning(res.message || '加载共享钱包数据失败')
          this.walletDataSource = []
          this.walletPagination.total = 0
        }
      }).catch((err) => {
        this.$message.error('加载共享钱包数据失败：' + (err.message || '未知错误'))
        this.walletDataSource = []
        this.walletPagination.total = 0
      }).finally(() => {
        this.walletLoading = false
      })
    },
    // 共享钱包表格变化处理
    handleWalletTableChange(pagination) {
      this.walletPagination.current = pagination.current
      this.walletPagination.pageSize = pagination.pageSize
      this.loadWalletData()
    },
    // 钱包配置方法
    handleWalletConfig(record) {
      this.walletConfigForm = {
        mainWalletId: record.mainWalletId || '',
        mainWalletName: record.mainWalletName || '',
        isMediaPlatform: record.isMediaPlatform || '',
        capitalType: record.capitalType || ''
      }
      this.walletConfigModalVisible = true
    },
    handleWalletConfigOk() {
      this.$refs.walletConfigForm.validate((valid) => {
        if (valid) {
          this.walletConfigModalLoading = true
          // 调用API保存钱包配置
          const formData = new FormData()
          formData.append('isMediaPlatform', this.walletConfigForm.isMediaPlatform + '')
          formData.append('mainWalletId', this.walletConfigForm.mainWalletId + '')
          formData.append('mainWalletName', this.walletConfigForm.mainWalletName + '')
          formData.append('capitalType', this.walletConfigForm.capitalType + '')

          // 使用postAction发送formdata格式的数据
          postAction('/advertiserWalletInfo/updateIsMediaPlatformByMaxWalletId', formData).then((res) => {
            this.$message.success('钱包配置保存成功')
            this.walletConfigModalVisible = false
            this.loadWalletData()
          }).catch((err) => {
            this.$message.error('钱包配置保存失败：' + (err.message || '未知错误'))
          }).finally(() => {
            this.walletConfigModalLoading = false
          })
        }
      })
    },
    handleWalletConfigCancel() {
      this.walletConfigModalVisible = false
      this.$refs.walletConfigForm.resetFields()
    },
    initDictConfig() {
    },
    getSuperFieldList() {
      let fieldList = [];
      fieldList.push({ type: 'string', value: 'advertiserId', text: '代理商ID', dictCode: '' })
      fieldList.push({ type: 'string', value: 'advertiserName', text: '代理商名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'channelName', text: '渠道名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'channelPlatform', text: '平台标识', dictCode: '' })
      fieldList.push({ type: 'string', value: 'channelSign', text: '渠道标识', dictCode: '' })
      fieldList.push({ type: 'string', value: 'applyId', text: '应用ID', dictCode: '' })
      // fieldList.push({ type: 'string', value: 'isValid', text: '授权状态', dictCode: '' })
      fieldList.push({ type: 'string', value: 'advertiserRole', text: '代理商角色', dictCode: '' })
      fieldList.push({ type: 'string', value: 'capitalType', text: '资金类型', dictCode: '' })
      fieldList.push({ type: 'Text', value: 'remarks', text: '备注', dictCode: '' })
      this.superFieldList = fieldList
    },
    handleAdd() {
      this.$refs.tabAdvertiserInfoModal.add()
    },
    batchConfig() {
      if (this.selectedRowKeys.length <= 0) {
        this.$message.warning('请选择一条记录！');
        return false;
      } else {
        this.$message.info('批量配置功能待实现');
      }
    },
    // 配置相关方法
    handleConfig(record) {
      // 根据渠道标识推断平台
      let channelPlatform = ''
      if (record.channelSign) {
        if (record.channelSign.startsWith('DY-')) {
          channelPlatform = 'DY'
        } else if (record.channelSign.startsWith('TX-')) {
          channelPlatform = 'GDT'
        } else if (record.channelSign.startsWith('KS-')) {
          channelPlatform = 'KS'
        } else if (record.channelSign === 'XHS') {
          channelPlatform = 'XHS'
        } else if (record.channelSign === 'CJHC') {
          channelPlatform = 'CJHC'
        } else if (record.channelSign === 'BLBL') {
          channelPlatform = 'BLBL'
        } else if (record.channelSign && (record.channelSign.includes('CJHC') || record.channelSign.includes('BLBL') || record.channelSign.includes('WYMS'))) {
          // 泛媒体情况，根据实际channelSign判断
          if (record.channelSign === 'CJHC' || record.channelSign.startsWith('CJHC')) {
            channelPlatform = 'CJHC'
          } else if (record.channelSign === 'BLBL' || record.channelSign.startsWith('BLBL')) {
            channelPlatform = 'BLBL'
          } else if (record.channelSign === 'WYMS' || record.channelSign.startsWith('WYMS')) {
            channelPlatform = 'WYMS'
          }
        }
      }

      this.configForm = {
        id: record.id || '',
        advertiserId: record.advertiserId || '',
        advertiserName: record.advertiserName || '',
        defaultCapitalType: record.capitalType || '',
        remarks: record.remarks || '',
        channelPlatform: channelPlatform,
        isMediaPlatform: record.isMediaPlatform || '1'
      }
      this.configModalVisible = true
    },
    handleConfigOk() {
      this.$refs.configForm.validate((valid) => {
        if (valid) {
          this.configModalLoading = true
          // 调用API保存配置
          const params = {
            id: this.configForm.id,
            capitalType: this.configForm.defaultCapitalType,
            remarks: this.configForm.remarks,
            advertiserName: this.configForm.advertiserName,
            isMediaPlatform: this.configForm.isMediaPlatform
          }
          updateAdvertiserCapitalType(params).then((res) => {
            if (res.success) {
              this.$message.success('配置保存成功')
              this.configModalVisible = false
              this.loadData()
            } else {
              this.$message.error(res.message || '配置保存失败')
            }
          }).catch((err) => {
            this.$message.error('配置保存失败：' + (err.message || '未知错误'))
          }).finally(() => {
            this.configModalLoading = false
          })
        }
      })
    },
    handleConfigCancel() {
      this.configModalVisible = false
      this.$refs.configForm.resetFields()
    }
  }
}
</script>

<style scoped>
@import '~@assets/less/common.less';

.super-search-icon {
  color: rgba(0, 0, 0, .45);
}

/* 让禁用的tab看起来和正常状态一样 */
:deep(.ant-tabs-tab.ant-tabs-tab-disabled) {
  color: rgba(0, 0, 0, 0.65) !important;
  cursor: pointer !important;
}

:deep(.ant-tabs-tab.ant-tabs-tab-disabled:hover) {
  color: #1890ff !important;
}

:deep(.ant-tabs-tab.ant-tabs-tab-disabled.ant-tabs-tab-active) {
  color: #1890ff !important;
}
</style>
