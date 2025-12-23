<template>
  <a-drawer title="返点记录" :width="1200" placement="right" :closable="false" @close="closeDrawer" :visible="visible"
    destroyOnClose>
    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
      <a-button @click="handleAdd(biddingRebateId)" type="primary" icon="plus">新增</a-button>
      <a-button type="primary" icon="download"
        @click="handleExportXls('tab_bidding_rebate_template_subtable')">导出</a-button>
      <!-- <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl"
        @change="handleImportExcel">
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload> -->
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete" />删除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
      </a-dropdown>
    </div>

    <!-- 表格区域 -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;" v-if="selectedRowKeys.length > 0">
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

    <!-- 子表模态框 -->
    <tab-bidding-rebate-template-subtable-modal ref="modalForm"
      @ok="modalFormOk"></tab-bidding-rebate-template-subtable-modal>
  </a-drawer>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import TabBiddingRebateTemplateSubtableModal from './modules/TabBiddingRebateTemplateSubtableModal'

export default {
  name: 'TabBiddingRebateTemplateSubtableList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    TabBiddingRebateTemplateSubtableModal
  },
  data() {
    return {
      description: 'tab_bidding_rebate_template_subtable',
      // 抽屉显示状态
      visible: false,
      // 主表记录的 biddingRebateId
      biddingRebateId: null,
      // 表格列定义
      columns: [
        {
          title: '返点归属季度',
          align: 'center',
          dataIndex: 'quarter'
        },
        {
          title: '返点归属月份',
          align: 'center',
          dataIndex: 'month',
          customRender: function (text) {
            return text.substr(0, 7)
          }
        },
        {
          title: '预估返点',
          align: 'center',
          dataIndex: 'estimatedRebate',
          customRender: function (text) {
            return text.toFixed(5) * 100 + '%'
          }
        },
        {
          title: '实际返点',
          align: 'center',
          dataIndex: 'actualRebate',
          customRender: function (text) {
            return text.toFixed(5) * 100 + '%'
          }
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
        list: '/biddingRebateTemplateSubtable/list',
        delete: '/biddingRebateTemplateSubtable/delete',
        deleteBatch: '/biddingRebateTemplateSubtable/deleteBatch',
        exportXlsUrl: '/biddingRebateTemplateSubtable/exportXls',
        importExcelUrl: 'biddingRebateTemplateSubtable/importExcel'
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
      fieldList.push({ type: 'string', value: 'biddingRebateId', text: '竞价分类返点模板ID' })
      fieldList.push({ type: 'int', value: 'quarter', text: '季度' })
      fieldList.push({ type: 'date', value: 'month', text: '月份' })
      fieldList.push({ type: 'number', value: 'estimatedRebate', text: '预估返点' })
      fieldList.push({ type: 'number', value: 'actualRebate', text: '实际返点' })
      this.superFieldList = fieldList
    },
    // 打开抽屉并加载数据
    openDrawer(biddingRebateId) {
      this.biddingRebateId = biddingRebateId;
      this.visible = true;
      this.loadData(1); // 加载第一页数据
    },
    // 关闭抽屉
    closeDrawer() {
      this.visible = false;
      this.biddingRebateId = null;
      this.onClearSelected();
      this.$emit('close');
    },
    // 子表模态框操作成功回调
    modalFormOk() {
      // 刷新子表数据
      this.loadData();
      this.$emit('ok');
    },
    // 重写 loadData 方法以支持 biddingRebateId 过滤
    loadData(arg) {
      if (!this.url.list) {
        this.$message.error('请设置url.list属性!');
        return;
      }
      // 加载数据 若传入参数1则从第一页开始
      if (arg === 1) {
        this.ipagination.current = 1;
      }
      let params = this.getQueryParams(); // 获取查询条件
      if (this.biddingRebateId) {
        params.biddingRebateId = this.biddingRebateId; // 添加 biddingRebateId 过滤条件
      }
      this.loading = true;
      this.$http.get(this.url.list, { params }).then(res => {
        if (res.success) {
          this.dataSource = res.result.records || res.result;
          this.ipagination.total = res.result.total || 0;
        } else {
          this.$message.warning(res.message);
        }
        this.loading = false;
      });
    }
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less';

/** 抽屉按钮间距 */
.table-operator .ant-btn {
  margin-right: 8px;
}
</style>