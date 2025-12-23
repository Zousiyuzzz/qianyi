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
      <a-button type="primary" icon="download" @click="handleExportXls('tab_bidding_rebate_template')">导出</a-button>
      <!-- <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl"
        @change="handleImportExcel">
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload> -->
      <!-- 高级查询区域 -->
      <j-super-query :fieldList="superFieldList" ref="superQueryModal"
        @handleSuperQuery="handleSuperQuery"></j-super-query>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete" />删除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
      </a-dropdown>
    </div>

    <!-- 表格区域 -->
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
          <a @click="handleRebate(record)">返点</a>
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

    <!-- 主表模态框 -->
    <tab-bidding-rebate-template-modal ref="modalForm" @ok="modalFormOk"></tab-bidding-rebate-template-modal>
    <!-- 子表抽屉 -->
    <tab-bidding-rebate-template-subtable-list ref="subtableDrawer"
      @ok="subtableDrawerOk"></tab-bidding-rebate-template-subtable-list>
  </a-card>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import TabBiddingRebateTemplateModal from './modules/TabBiddingRebateTemplateModal'
import TabBiddingRebateTemplateSubtableList from './TabBiddingRebateTemplateSubtableList'

export default {
  name: 'TabBiddingRebateTemplateList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    TabBiddingRebateTemplateModal,
    TabBiddingRebateTemplateSubtableList // 注册子表抽屉组件
  },
  data() {
    return {
      description: 'tab_bidding_rebate_template',
      // 表格列定义
      columns: [
        {
          title: '渠道名称',
          align: 'center',
          dataIndex: 'channelName'
        },
        {
          title: '平台标识',
          align: 'center',
          dataIndex: 'channelPlatform'
        },
        {
          title: '渠道标识',
          align: 'center',
          dataIndex: 'channelSign'
        },
        {
          title: '结算行业外部分类',
          align: 'center',
          dataIndex: 'classification'
        },
        {
          title: '标签',
          align: 'center',
          dataIndex: 'label_dictText'
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          fixed: 'right',
          width: 147,
          scopedSlots: { customRender: 'action' }
        }
      ],
      // API 地址
      url: {
        list: '/biddingRebateTemplate/list',
        delete: '/biddingRebateTemplate/delete',
        deleteBatch: '/biddingRebateTemplate/deleteBatch',
        exportXlsUrl: '/biddingRebateTemplate/exportXls',
        importExcelUrl: 'biddingRebateTemplate/importExcel'
      },
      dictOptions: {},
      superFieldList: []
    }
  },
  created() {
    // 初始化高级查询字段
    this.getSuperFieldList();
  },
  computed: {
    // 计算导入 Excel 的 URL
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
    }
  },
  methods: {
    // 初始化字典配置
    initDictConfig() {
    },
    // 设置高级查询字段
    getSuperFieldList() {
      let fieldList = [];
      fieldList.push({ type: 'string', value: 'delFlag', text: '删除标识（0：未删除1：已删除）' })
      fieldList.push({ type: 'string', value: 'channelName', text: '渠道名称' })
      fieldList.push({ type: 'string', value: 'channelPlatform', text: '平台标识' })
      fieldList.push({ type: 'string', value: 'channelSign', text: '渠道标识' })
      fieldList.push({ type: 'string', value: 'classification', text: '结算行业外部分类' })
      fieldList.push({ type: 'string', value: 'label', text: '标签（1：自运营2：走量3：收量）' })
      this.superFieldList = fieldList
    },
    // 处理返点操作，打开子表抽屉
    handleRebate(record) {
      this.$refs.subtableDrawer.openDrawer(record.id);
    },
    // 子表抽屉操作成功后的回调
    subtableDrawerOk() {
      // 刷新主表数据
      this.loadData();
    }
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>