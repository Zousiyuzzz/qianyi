<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="前侧任务表id">
              <a-input placeholder="请输入前侧任务表id" v-model="queryParam.diagnosisTaskId"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="抖音前侧任务id">
              <a-input placeholder="请输入抖音前侧任务id" v-model="queryParam.taskId"></a-input>
            </a-form-item>
          </a-col>
          <template v-if="toggleSearchStatus">
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="视频id">
                <a-input placeholder="请输入视频id" v-model="queryParam.videoId"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="素材id">
                <a-input placeholder="请输入素材id" v-model="queryParam.materialId"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="任务状态允许值: PENDING SUCCESS FAILED">
                <a-input placeholder="请输入任务状态允许值: PENDING SUCCESS FAILED" v-model="queryParam.status"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="是否AD优质素材，允许值 YES AD优质;NO AD非优质;UNKNOWN 无检测结果">
                <a-input placeholder="请输入是否AD优质素材，允许值 YES AD优质;NO AD非优质;UNKNOWN 无检测结果"
                  v-model="queryParam.isAdHighQualityMaterial"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="是否千川优质素材，允许值 YES 千川优质;NO 千川非优质; UNKNOWN 无检测结果">
                <a-input placeholder="请输入是否千川优质素材，允许值 YES 千川优质;NO 千川非优质; UNKNOWN 无检测结果"
                  v-model="queryParam.isEcpHighQualityMaterial"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="是否低效，允许值 YES 低效;NO 非低效;UNKNOWN 无检测结果">
                <a-input placeholder="请输入是否低效，允许值 YES 低效;NO 非低效;UNKNOWN 无检测结果"
                  v-model="queryParam.isInefficientMaterial"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="是否首发，允许值 YES 首发:NO 非首发;UNKNOWN 无检测结果">
                <a-input placeholder="请输入是否首发，允许值 YES 首发:NO 非首发;UNKNOWN 无检测结果"
                  v-model="queryParam.isFirstPublishMaterial"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="非AD优质素材的原因">
                <a-input placeholder="请输入非AD优质素材的原因" v-model="queryParam.notAdHighQualityReason"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="非千川优质素材的原因">
                <a-input placeholder="请输入非千川优质素材的原因" v-model="queryParam.notEcpHighQualityReason"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="创建任务状态（0：成功1：失败）">
                <a-input placeholder="请输入创建任务状态（0：成功1：失败）" v-model="queryParam.taskState"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="失败code">
                <a-input placeholder="请输入失败code" v-model="queryParam.errCode"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="失败原因">
                <a-input placeholder="请输入失败原因" v-model="queryParam.errMessage"></a-input>
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
      <a-button type="primary" icon="download" @click="handleExportXls('前侧任务结果表')">导出</a-button>
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

    <tab-diagnosis-task-result-modal ref="modalForm" @ok="modalFormOk"></tab-diagnosis-task-result-modal>
  </a-card>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import TabDiagnosisTaskResultModal from './modules/TabDiagnosisTaskResultModal'

export default {
  name: 'TabDiagnosisTaskResultList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    TabDiagnosisTaskResultModal
  },
  data() {
    return {
      description: '前侧任务结果表管理页面',
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
          title: '前侧任务表id',
          align: "center",
          dataIndex: 'diagnosisTaskId'
        },
        {
          title: '抖音前侧任务id',
          align: "center",
          dataIndex: 'taskId'
        },
        {
          title: '视频id',
          align: "center",
          dataIndex: 'videoId'
        },
        {
          title: '素材id',
          align: "center",
          dataIndex: 'materialId'
        },
        {
          title: '任务状态允许值: PENDING SUCCESS FAILED',
          align: "center",
          dataIndex: 'status'
        },
        {
          title: '是否AD优质素材，允许值 YES AD优质;NO AD非优质;UNKNOWN 无检测结果',
          align: "center",
          dataIndex: 'isAdHighQualityMaterial'
        },
        {
          title: '是否千川优质素材，允许值 YES 千川优质;NO 千川非优质; UNKNOWN 无检测结果',
          align: "center",
          dataIndex: 'isEcpHighQualityMaterial'
        },
        {
          title: '是否低效，允许值 YES 低效;NO 非低效;UNKNOWN 无检测结果',
          align: "center",
          dataIndex: 'isInefficientMaterial'
        },
        {
          title: '是否首发，允许值 YES 首发:NO 非首发;UNKNOWN 无检测结果',
          align: "center",
          dataIndex: 'isFirstPublishMaterial'
        },
        {
          title: '非AD优质素材的原因',
          align: "center",
          dataIndex: 'notAdHighQualityReason'
        },
        {
          title: '非千川优质素材的原因',
          align: "center",
          dataIndex: 'notEcpHighQualityReason'
        },
        {
          title: '创建任务状态（0：成功1：失败）',
          align: "center",
          dataIndex: 'taskState'
        },
        {
          title: '失败code',
          align: "center",
          dataIndex: 'errCode'
        },
        {
          title: '失败原因',
          align: "center",
          dataIndex: 'errMessage'
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
        list: "/diagnosisTaskResult/tabDiagnosisTaskResult/list",
        delete: "/diagnosisTaskResult/tabDiagnosisTaskResult/delete",
        deleteBatch: "/diagnosisTaskResult/tabDiagnosisTaskResult/deleteBatch",
        exportXlsUrl: "/diagnosisTaskResult/tabDiagnosisTaskResult/exportXls",
        importExcelUrl: "diagnosisTaskResult/tabDiagnosisTaskResult/importExcel",

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
      fieldList.push({ type: 'string', value: 'diagnosisTaskId', text: '前侧任务表id', dictCode: '' })
      fieldList.push({ type: 'string', value: 'taskId', text: '抖音前侧任务id', dictCode: '' })
      fieldList.push({ type: 'string', value: 'videoId', text: '视频id', dictCode: '' })
      fieldList.push({ type: 'string', value: 'materialId', text: '素材id', dictCode: '' })
      fieldList.push({ type: 'string', value: 'status', text: '任务状态允许值: PENDING SUCCESS FAILED', dictCode: '' })
      fieldList.push({ type: 'string', value: 'isAdHighQualityMaterial', text: '是否AD优质素材，允许值 YES AD优质;NO AD非优质;UNKNOWN 无检测结果', dictCode: '' })
      fieldList.push({ type: 'string', value: 'isEcpHighQualityMaterial', text: '是否千川优质素材，允许值 YES 千川优质;NO 千川非优质; UNKNOWN 无检测结果', dictCode: '' })
      fieldList.push({ type: 'string', value: 'isInefficientMaterial', text: '是否低效，允许值 YES 低效;NO 非低效;UNKNOWN 无检测结果', dictCode: '' })
      fieldList.push({ type: 'string', value: 'isFirstPublishMaterial', text: '是否首发，允许值 YES 首发:NO 非首发;UNKNOWN 无检测结果', dictCode: '' })
      fieldList.push({ type: 'Text', value: 'notAdHighQualityReason', text: '非AD优质素材的原因', dictCode: '' })
      fieldList.push({ type: 'Text', value: 'notEcpHighQualityReason', text: '非千川优质素材的原因', dictCode: '' })
      fieldList.push({ type: 'string', value: 'taskState', text: '创建任务状态（0：成功1：失败）', dictCode: '' })
      fieldList.push({ type: 'string', value: 'errCode', text: '失败code', dictCode: '' })
      fieldList.push({ type: 'Text', value: 'errMessage', text: '失败原因', dictCode: '' })
      this.superFieldList = fieldList
    }
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>