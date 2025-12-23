<template>
  <div style="background-color: #fff;">
    <!-- <a-tabs default-active-key="1" v-model="currentSource" @change="sourceChange">
      <a-tab-pane key="1" tab="项目主体" :disabled="loading">
      </a-tab-pane>
      <a-tab-pane key="2" tab="我方主体" :disabled="loading">
      </a-tab-pane>
    </a-tabs> -->

    <a-card :bordered="false">
      <!-- 查询区域 -->
      <div class="table-page-search-wrapper">
        <a-form layout="inline" @keyup.enter.native="searchQuery">
          <a-row :gutter="24">
            <a-col :span="6">
              <a-form-item label="项目名称">
                <a-input v-model="queryParam.proName" placeholder="请输入项目名称" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="账户号">
                <a-input v-model="queryParam.accountNo" placeholder="请输入账户号" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="账户名称">
                <a-input v-model="queryParam.accountName" placeholder="请输入账户名称" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="来源">
                <a-select v-model="queryParam.source" placeholder="请选择来源" allowClear>
                  <a-select-option value="1">人工</a-select-option>
                  <a-select-option value="2">合同</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <!-- 查询区域-END -->

      <!-- 操作按钮区域 -->
      <div class="table-operator">
        <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
        <a-button type="primary" @click="searchReset" icon="reload">重置</a-button>
        <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
        <a-button type="primary" icon="download" @click="handleExportXls('银行账户信息表')">导出</a-button>
        <!-- <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl"
          @change="handleImportExcel">
          <a-button type="primary" icon="import">导入</a-button>
        </a-upload> -->
        <!-- 高级查询区域 -->
        <!-- <j-super-query :fieldList="superFieldList" ref="superQueryModal"
          @handleSuperQuery="handleSuperQuery"></j-super-query> -->
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
            <a v-if="record.source == '1' || record.source == 1" @click="handleEdit(record)">编辑</a>
          </span>

        </a-table>
      </div>

      <tab-bank-account-modal ref="modalForm" @ok="modalFormOk"></tab-bank-account-modal>
    </a-card>
  </div>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import TabBankAccountModal from './modules/TabBankAccountModal'

export default {
  name: 'TabBankAccountList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    TabBankAccountModal
  },
  data() {
    return {
      currentSource: '1',
      description: '银行账户信息表管理页面',
      // 表头
      columns: [
        {
          title: '项目名称',
          align: "center",
          dataIndex: 'proName',
          isLike: true
        },
        {
          title: '账户号',
          align: "center",
          dataIndex: 'accountNo'
        },
        {
          title: '账户名称',
          align: "center",
          dataIndex: 'accountName'
        },
        {
          title: '甲方单位名称',
          align: "center",
          dataIndex: 'partyAName'
        },
        {
          title: '甲方银行账号',
          align: "center",
          dataIndex: 'partyAAccount'
        },
        {
          title: '甲方开户银行',
          align: "center",
          dataIndex: 'partyABank'
        },
        {
          title: '来源',
          align: "center",
          dataIndex: 'source',
          customRender: (text) => {
            const sourceMap = {
              '1': '人工',
              '2': '合同'
            }
            return sourceMap[text] || text
          }
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
        list: "/bankAccount/list",
        delete: "/bankAccount/delete",
        deleteBatch: "/bankAccount/deleteBatch",
        exportXlsUrl: "/bankAccount/exportXls",
        importExcelUrl: "bankAccount/importExcel",

      },
      dictOptions: {},
      superFieldList: [],
      queryParam: {
        proName: '',
        accountNo: '',
        accountName: '',
        source: ''
      }
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
  mounted() {
    this.queryParam.source = this.currentSource
    this.loadData()
  },
  methods: {
    // sourceChange() {
    //   this.queryParam.source = this.currentSource
    //   this.loadData()
    // },
    handleReset() {
      this.queryParam = {
        proName: '',
        accountNo: '',
        accountName: '',
        source: ''
      };
      this.handleSearch();
    },
    initDictConfig() {
    },
    getSuperFieldList() {
      let fieldList = [];
      fieldList.push({ type: 'string', value: 'source', text: '来源（1：项目2：我方）', dictCode: '' })
      // fieldList.push({ type: 'string', value: 'customerId', text: '客户编号id', dictCode: '' })
      fieldList.push({ type: 'string', value: 'customerName', text: '项目名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'corporateName', text: '公司名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'taxId', text: '税号', dictCode: '' })
      fieldList.push({ type: 'string', value: 'openingBank', text: '开户银行', dictCode: '' })
      fieldList.push({ type: 'string', value: 'bankAccount', text: '银行账户', dictCode: '' })
      fieldList.push({ type: 'string', value: 'address', text: '单位地址', dictCode: '' })
      fieldList.push({ type: 'string', value: 'phone', text: '电话', dictCode: '' })
      fieldList.push({ type: 'Text', value: 'remarks', text: '备注', dictCode: '' })
      this.superFieldList = fieldList
    }
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>