<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :span="6">
            <a-form-item label="银行类别">
              <a-select v-model="queryParam.bankType" placeholder="请选择银行类别">
                <a-select-option value="cmb">招商银行</a-select-option>
                <a-select-option value="icbc">工商银行</a-select-option>
                <a-select-option value="abc">农业银行</a-select-option>
                <a-select-option value="boc">中国银行</a-select-option>
                <a-select-option value="ccb">建设银行</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="账户号">
              <a-input :value="queryParam.accountNo" placeholder="请输入账户号" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="账户名称">
              <a-input :value="queryParam.accountName" placeholder="请输入账户名称" />
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
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
      <a-button type="primary" icon="download" @click="handleExportXls('银行帐户配置')">导出</a-button>
      <j-super-query :fieldList="superFieldList" ref="superQueryModal"
        @handleSuperQuery="handleSuperQuery"></j-super-query>
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
          <a @click="handleEdit(record)">编辑</a>
          <a-divider type="vertical" />
          <a-dropdown>
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
          </a-dropdown>
        </span>
      </a-table>
    </div>

    <tab-bank-account-config-modal ref="modalForm" @ok="modalFormOk"></tab-bank-account-config-modal>
  </a-card>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import TabBankAccountConfigModal from './modules/TabBankAccountConfigModal'

export default {
  name: 'TabBankAccountConfigList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    TabBankAccountConfigModal
  },
  data() {
    return {
      description: '银行帐户配置管理页面',
      // 表头
      columns: [
        {
          title: '公司名称',
          align: "center",
          dataIndex: 'accountName'
        },
        {
          title: '银行账号',
          align: "center",
          dataIndex: 'accountNo'
        },
        {
          title: '开户行',
          align: "center",
          dataIndex: 'bankType',
          customRender: function (text) {
            const emnus = {
              'cmb': '招商银行',
              'icbc': '工商银行',
              'abc': '农业银行',
              'boc': '中国银行',
              'ccb': '建设银行'
            }
            return emnus[text]
          }
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
        list: "/bankAccountConfig/list",
        delete: "/bankAccountConfig/delete",
        deleteBatch: "/bankAccountConfig/deleteBatch",
        exportXlsUrl: "/bankAccountConfig/exportXls",
        importExcelUrl: "/bankAccountConfig/importExcel",
      },
      dictOptions: {},
      superFieldList: [],
      queryParam: {}
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
      fieldList.push({ type: 'string', value: 'bankType', text: '银行类别', dictCode: '' })
      fieldList.push({ type: 'string', value: 'accountNo', text: '账户号', dictCode: '' })
      fieldList.push({ type: 'string', value: 'accountName', text: '账户名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'createBy', text: '创建人', dictCode: '' })
      fieldList.push({ type: 'datetime', value: 'createTime', text: '创建日期', dictCode: '' })
      fieldList.push({ type: 'string', value: 'updateBy', text: '更新人', dictCode: '' })
      fieldList.push({ type: 'datetime', value: 'updateTime', text: '更新日期', dictCode: '' })
      this.superFieldList = fieldList
    }
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>
