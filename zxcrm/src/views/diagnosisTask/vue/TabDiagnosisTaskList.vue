<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="创建人">
              <a-input placeholder="请输入创建人" v-model="queryParam.createBy"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="创建日期">
              <j-date :show-time="true" date-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择创建日期"
                v-model="queryParam.createTime"></j-date>
            </a-form-item>
          </a-col>
          <template v-if="toggleSearchStatus">
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="更新人">
                <a-input placeholder="请输入更新人" v-model="queryParam.updateBy"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="更新日期">
                <j-date :show-time="true" date-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择更新日期"
                  v-model="queryParam.updateTime"></j-date>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="删除标识（0：未删除1：已删除）">
                <a-input placeholder="请输入删除标识（0：未删除1：已删除）" v-model="queryParam.delFlag"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="渠道名称">
                <a-input placeholder="请输入渠道名称" v-model="queryParam.channelName"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="平台标识">
                <a-input placeholder="请输入平台标识" v-model="queryParam.channelPlatform"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="渠道标识">
                <a-input placeholder="请输入渠道标识" v-model="queryParam.channelSign"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="代理商Id">
                <a-input placeholder="请输入代理商Id" v-model="queryParam.agentId"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="素材列表">
                <a-input placeholder="请输入素材列表" v-model="queryParam.videoIds"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="广告主id">
                <a-input placeholder="请输入广告主id" v-model="queryParam.advertiserId"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="推广id">
                <a-input placeholder="请输入推广id" v-model="queryParam.refPromotionId"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="目标投放平台（QIANCHUAN；AD）">
                <a-input placeholder="请输入目标投放平台（QIANCHUAN；AD）" v-model="queryParam.platform"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="推广转化目标">
                <a-input placeholder="请输入推广转化目标" v-model="queryParam.externalAction"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="受众性别（ALL；MALE；DEMALE）">
                <a-input placeholder="请输入受众性别（ALL；MALE；DEMALE）" v-model="queryParam.audienceGender"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="受众年龄（ALL；18-23；24-30；31-40；41-49；50）">
                <a-input placeholder="请输入受众年龄（ALL；18-23；24-30；31-40；41-49；50）"
                  v-model="queryParam.audienceAge"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="受众地区">
                <a-input placeholder="请输入受众地区" v-model="queryParam.audienceRegion"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="受众网络（ALL；5G；4G；3G；2G；WIFI）">
                <a-input placeholder="请输入受众网络（ALL；5G；4G；3G；2G；WIFI）" v-model="queryParam.audienceNetwork"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="客户主体名称">
                <a-input placeholder="请输入客户主体名称" v-model="queryParam.cusName"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="计费方式（OCPC；CPA；OCPM）">
                <a-input placeholder="请输入计费方式（OCPC；CPA；OCPM）" v-model="queryParam.pricingType"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="是否最优成本出价">
                <a-input placeholder="请输入是否最优成本出价" v-model="queryParam.costCap"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="是否稳定成本出价">
                <a-input placeholder="请输入是否稳定成本出价" v-model="queryParam.targetCost"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="是否最大转化出价">
                <a-input placeholder="请输入是否最大转化出价" v-model="queryParam.nobid"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="目标转化成本">
                <a-input placeholder="请输入目标转化成本" v-model="queryParam.cpaBid"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="目标点击成本">
                <a-input placeholder="请输入目标点击成本" v-model="queryParam.cpcBid"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="预算金额">
                <a-input placeholder="请输入预算金额" v-model="queryParam.budget"></a-input>
              </a-form-item>
            </a-col>
          </template>
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
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
      <a-button type="primary" icon="download" @click="handleExportXls('前侧任务表')">导出</a-button>
      <!-- <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">
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

    <!-- table区域-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{
          selectedRowKeys.length
          }}</a>项
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

    <tab-diagnosis-task-modal ref="modalForm" @ok="modalFormOk"></tab-diagnosis-task-modal>
  </a-card>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import TabDiagnosisTaskModal from './modules/TabDiagnosisTaskModal'

export default {
  name: 'TabDiagnosisTaskList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    TabDiagnosisTaskModal
  },
  data() {
    return {
      description: '前侧任务表管理页面',
      // 表头
      columns: [
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: "center",
          customRender: function (t, r, index) {
            return parseInt(index) + 1;
          }
        },
        {
          title: '删除标识（0：未删除1：已删除）',
          align: "center",
          dataIndex: 'delFlag'
        },
        {
          title: '渠道名称',
          align: "center",
          dataIndex: 'channelName'
        },
        {
          title: '平台标识',
          align: "center",
          dataIndex: 'channelPlatform'
        },
        {
          title: '渠道标识',
          align: "center",
          dataIndex: 'channelSign'
        },
        {
          title: '代理商Id',
          align: "center",
          dataIndex: 'agentId'
        },
        {
          title: '素材列表',
          align: "center",
          dataIndex: 'videoIds'
        },
        {
          title: '广告主id',
          align: "center",
          dataIndex: 'advertiserId'
        },
        {
          title: '推广id',
          align: "center",
          dataIndex: 'refPromotionId'
        },
        {
          title: '目标投放平台（QIANCHUAN；AD）',
          align: "center",
          dataIndex: 'platform'
        },
        {
          title: '推广转化目标',
          align: "center",
          dataIndex: 'externalAction'
        },
        {
          title: '受众性别（ALL；MALE；DEMALE）',
          align: "center",
          dataIndex: 'audienceGender'
        },
        {
          title: '受众年龄（ALL；18-23；24-30；31-40；41-49；50）',
          align: "center",
          dataIndex: 'audienceAge'
        },
        {
          title: '受众地区',
          align: "center",
          dataIndex: 'audienceRegion'
        },
        {
          title: '受众网络（ALL；5G；4G；3G；2G；WIFI）',
          align: "center",
          dataIndex: 'audienceNetwork'
        },
        {
          title: '客户主体名称',
          align: "center",
          dataIndex: 'cusName'
        },
        {
          title: '计费方式（OCPC；CPA；OCPM）',
          align: "center",
          dataIndex: 'pricingType'
        },
        {
          title: '是否最优成本出价',
          align: "center",
          dataIndex: 'costCap'
        },
        {
          title: '是否稳定成本出价',
          align: "center",
          dataIndex: 'targetCost'
        },
        {
          title: '是否最大转化出价',
          align: "center",
          dataIndex: 'nobid'
        },
        {
          title: '目标转化成本',
          align: "center",
          dataIndex: 'cpaBid'
        },
        {
          title: '目标点击成本',
          align: "center",
          dataIndex: 'cpcBid'
        },
        {
          title: '预算金额',
          align: "center",
          dataIndex: 'budget'
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
        list: "/diagnosisTask/tabDiagnosisTask/list",
        delete: "/diagnosisTask/tabDiagnosisTask/delete",
        deleteBatch: "/diagnosisTask/tabDiagnosisTask/deleteBatch",
        exportXlsUrl: "/diagnosisTask/tabDiagnosisTask/exportXls",
        importExcelUrl: "diagnosisTask/tabDiagnosisTask/importExcel",

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
      fieldList.push({ type: 'string', value: 'createBy', text: '创建人', dictCode: '' })
      fieldList.push({ type: 'datetime', value: 'createTime', text: '创建日期' })
      fieldList.push({ type: 'string', value: 'updateBy', text: '更新人', dictCode: '' })
      fieldList.push({ type: 'datetime', value: 'updateTime', text: '更新日期' })
      fieldList.push({ type: 'string', value: 'delFlag', text: '删除标识（0：未删除1：已删除）', dictCode: '' })
      fieldList.push({ type: 'string', value: 'channelName', text: '渠道名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'channelPlatform', text: '平台标识', dictCode: '' })
      fieldList.push({ type: 'string', value: 'channelSign', text: '渠道标识', dictCode: '' })
      fieldList.push({ type: 'string', value: 'agentId', text: '代理商Id', dictCode: '' })
      fieldList.push({ type: 'Text', value: 'videoIds', text: '素材列表', dictCode: '' })
      fieldList.push({ type: 'string', value: 'advertiserId', text: '广告主id', dictCode: '' })
      fieldList.push({ type: 'string', value: 'refPromotionId', text: '推广id', dictCode: '' })
      fieldList.push({ type: 'string', value: 'platform', text: '目标投放平台（QIANCHUAN；AD）', dictCode: '' })
      fieldList.push({ type: 'string', value: 'externalAction', text: '推广转化目标', dictCode: '' })
      fieldList.push({ type: 'string', value: 'audienceGender', text: '受众性别（ALL；MALE；DEMALE）', dictCode: '' })
      fieldList.push({ type: 'string', value: 'audienceAge', text: '受众年龄（ALL；18-23；24-30；31-40；41-49；50）', dictCode: '' })
      fieldList.push({ type: 'string', value: 'audienceRegion', text: '受众地区', dictCode: '' })
      fieldList.push({ type: 'string', value: 'audienceNetwork', text: '受众网络（ALL；5G；4G；3G；2G；WIFI）', dictCode: '' })
      fieldList.push({ type: 'string', value: 'cusName', text: '客户主体名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'pricingType', text: '计费方式（OCPC；CPA；OCPM）', dictCode: '' })
      fieldList.push({ type: 'string', value: 'costCap', text: '是否最优成本出价', dictCode: '' })
      fieldList.push({ type: 'string', value: 'targetCost', text: '是否稳定成本出价', dictCode: '' })
      fieldList.push({ type: 'string', value: 'nobid', text: '是否最大转化出价', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'cpaBid', text: '目标转化成本', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'cpcBid', text: '目标点击成本', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'budget', text: '预算金额', dictCode: '' })
      this.superFieldList = fieldList
    }
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>