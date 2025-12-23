<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="项目名称">
              <a-input placeholder="请输入项目名称" v-model="queryParam.proName"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="唯一ID">
              <a-input placeholder="请输入项目唯一ID" v-model="queryParam.uniqueId"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="运营方式">
              <a-select placeholder="请选择运营方式" v-model="queryParam.operationType" allowClear>
                <a-select-option value="">全部运营方式</a-select-option>
                <a-select-option value="1">自运营</a-select-option>
                <a-select-option value="2">走量</a-select-option>
                <a-select-option value="3">收量</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="客户">
              <JSearchSelectTag placeholder="请选择客户" v-model:value="queryParam.customerId"
                dict="tab_customerManage,customer_name,id,del_flag = '0'" async>
              </JSearchSelectTag>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="渠道">
              <JSearchSelectTag placeholder="请选择渠道" v-model:value="queryParam.businessId"
                dict="tab_business,business_name,id,del_flag = '0'" async>
              </JSearchSelectTag>
            </a-form-item>
          </a-col>
          <template v-if="toggleSearchStatus">
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="空值查询">
                <a-select placeholder="请选择字段" v-model:value="queryParam.fieldNull" :allowClear="true">
                  <a-select-option v-for="column in fieldNullList" :key="column.dataIndex" :value="column.dataIndex">
                    {{ column.title }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="合作方式">
                <j-dict-select-tag placeholder="请选择合作方式" v-model="queryParam.collaborationMode"
                  dictCode="projectt_hezuotype"></j-dict-select-tag>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="AE">
                <JSearchSelectTag placeholder="请选择AE" v-model:value="queryParam.aePerson"
                  dict="sys_user,realname,id,del_flag = '0'" async>
                </JSearchSelectTag>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="商务">
                <JSearchSelectTag placeholder="请选择商务" v-model:value="queryParam.businessPerson"
                  dict="sys_user,realname,id,del_flag = '0'" async>
                </JSearchSelectTag>
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
      <!-- <a-button type="primary" icon="download" @click="handleExportXls('项目管理')">导出</a-button> -->
      <a-button type="primary" icon="download" @click="handleFrontendExport"
        :loading="frontendExportLoading">导出</a-button>
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
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        class="j-table-force-nowrap project-table" @change="handleTableChange" :rowClassName="setRowBackground">

        <template slot="htmlSlot" slot-scope="text">
          <div v-html="e"></div>
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
          <a @click="handleCopyLink(record)">充转退链接</a>

          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a @click="handleDetail(record)">详情</a>
              </a-menu-item>
              <a-menu-item v-if="userInfo().username == 'admin'">
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
              <a-menu-item v-if="record.collaborationMode_dictText === '服务费'">
                <a @click="handleServiceCost(record)">服务费</a>
              </a-menu-item>
              <a-menu-item>
                <a @click="handleUpdateLog(record)">修改记录</a>
              </a-menu-item>
              <a-menu-item>
                <a @click="handleWorkbench(record)">工作台</a>
              </a-menu-item>
              <a-menu-item v-if="(userRoles.includes('admin') || userRoles.includes('BOSS'))">
                <a @click="handleEditUniqueId(record)">修改唯一ID</a>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

      </a-table>
    </div>

    <tab-projectmanage-modal ref="modalForm" @ok="modalFormOk"></tab-projectmanage-modal>
    <service-cost-modal :visible="serviceCostModalVisible" :proId="serviceCostProId" @success="handleServiceCostSuccess"
      @cancel="handleServiceCostCancel" />
    <update-log-modal :visible="updateLogModalVisible" :projectId="updateLogProId" @cancel="handleUpdateLogCancel" />

    <!-- 修改唯一ID弹窗 -->
    <a-modal title="修改唯一ID" :visible="editUniqueIdModalVisible" @ok="handleEditUniqueIdOk"
      @cancel="handleEditUniqueIdCancel" :confirmLoading="editUniqueIdLoading">
      <a-form-model ref="editUniqueIdForm" :model="editUniqueIdForm" :rules="editUniqueIdRules">
        <a-form-model-item label="项目名称" :labelCol="{ span: 6 }" :wrapperCol="{ span: 16 }">
          <a-input v-model="editUniqueIdForm.proName" disabled />
        </a-form-model-item>
        <a-form-model-item label="当前唯一ID" :labelCol="{ span: 6 }" :wrapperCol="{ span: 16 }">
          <a-input v-model="editUniqueIdForm.oldUniqueId" disabled />
        </a-form-model-item>
        <a-form-model-item label="新唯一ID" prop="newUniqueId" :labelCol="{ span: 6 }" :wrapperCol="{ span: 16 }">
          <a-input v-model="editUniqueIdForm.newUniqueId" placeholder="请输入新的唯一ID" />
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </a-card>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import TabProjectmanageModal from './modules/TabProjectmanageModal'
import ServiceCostModal from './modules/ServiceCostModal'
import UpdateLogModal from './modules/UpdateLogModal'
import { formatDate } from '@/utils/date'
import { getAction } from '@/api/manage'
import { mapGetters } from 'vuex'
import ExcelJS from 'exceljs'

export default {
  name: 'TabProjectmanageList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    TabProjectmanageModal,
    ServiceCostModal,
    UpdateLogModal
  },
  data() {
    return {
      fieldNullList: [
        {
          title: '客户',
          dataIndex: 'customer_id',
        },
        {
          title: '渠道',
          dataIndex: 'business_id',
        },
        {
          title: 'AE',
          dataIndex: 'ae_person',
        },
        // {
        //   title: '运营',
        //   dataIndex: 'operation_person',
        // },
        {
          title: '商务',
          dataIndex: 'business_person',
        },
        {
          title: '运营方式',
          dataIndex: 'operation_type',
        },
        {
          title: '合作方式',
          dataIndex: 'collaboration_mode',
        },
        {
          title: '结算方式',
          dataIndex: 'payment_method',
        },
        // {
        //   title: '合作状态',
        //   dataIndex: 'cooperation_status',
        // },
      ],
      userRoles: [],
      description: '项目管理管理页面',
      // 表头
      columns: [
        {
          title: '唯一ID',
          dataIndex: 'uniqueId',
          align: "center",
          width: 80,
          ellipsis: true
        },
        {
          title: '项目名称',
          align: "center",
          dataIndex: 'proName',
          minWidth: 200,
          ellipsis: true,
          // isLike: true,
          customRender: (text, record) => {
            return record ? (
              <a-tooltip title={text}>
                <span style="display: inline-block; width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  {record.isDirect == 'N' && <img src="/bln.png" style={{ marginRight: '4px', height: '1em', marginTop: '-2px' }} />}
                  {record.proName}
                </span>
              </a-tooltip>
            ) : record.proName
          }
          //isDirect
        },
        // {
        //   title: '原用名',
        //   align: "center",
        //   dataIndex: 'proAbbr',
        //   width: 150,
        //   isLike: true
        // },
        {
          title: '客户名称',
          align: "center",
          dataIndex: 'customerName',
          minWidth: 150,
          ellipsis: true
        },
        // {
        //   title: '项目唯一标识',
        //   align: "center",
        //   dataIndex: 'uniqueId',
        //   width: 80
        // },
        // {
        //   title: '产品名称',
        //   align: "center",
        //   dataIndex: 'productIds_dictText',
        //   width: 150
        // },
        // {
        //   title: '投放渠道',
        //   align: "center",
        //   dataIndex: 'channelId',
        //   width: 150
        // },
        {
          title: '渠道名称',
          align: "center",
          dataIndex: 'businessName',
          minWidth: 120,
          ellipsis: true
        },
        // {
        //   title: '返点',
        //   align: "center",
        //   dataIndex: 'rebate',
        //   width: 80
        // },
        {
          title: 'AE',
          align: "center",
          dataIndex: 'aePerson_dictText',
          minWidth: 100,
          ellipsis: true
        },
        // {
        //   title: '销售',
        //   align: "center",
        //   dataIndex: 'salesPersonId_dictText',
        //   width: 150
        // },
        // {
        //   title: '运营',
        //   align: "center",
        //   dataIndex: 'operationPerson_dictText',
        //   minWidth: 100,
        //   ellipsis: true
        // },
        {
          title: '商务',
          align: "center",
          dataIndex: 'businessPerson_dictText',
          minWidth: 100,
          ellipsis: true
        },
        {
          title: '运营方式',
          align: "center",
          dataIndex: 'operationType',
          width: 100,
          ellipsis: true,
          customRender: function (text) {
            const cfg = {
              1: '自运营',
              2: '走量',
              3: '收量',
            }
            return cfg[text] || ''
          },
        },
        {
          title: '合作方式',
          align: "center",
          dataIndex: 'collaborationMode_dictText',
          minWidth: 100,
          ellipsis: true
        },
        {
          title: '结算方式',
          align: "center",
          dataIndex: 'paymentMethod',
          width: 100,
          ellipsis: true,
          customRender: function (text) {
            const m = ['充值结算', '消耗结算']
            return m[text] || ''
          },
        },
        // {
        //   title: '合作状态',
        //   align: "center",
        //   dataIndex: 'cooperationStatus',
        //   width: 150,
        //   customRender: function (text) {
        //     const m = ['', '拟合作', '合作中', '已流失']
        //     return m[text] || ''
        //   },
        // },
        // {
        //   title: '项目开始时间',
        //   align: "center",
        //   dataIndex: 'beginDate',
        //   customRender: function (text) {
        //     return !text ? "" : (text.length > 10 ? text.substr(0, 10) : text)
        //   },
        //   width: 150
        // },
        // {
        //   title: '项目结束时间',
        //   align: "center",
        //   dataIndex: 'endDate',
        //   customRender: function (text) {
        //     return !text ? "" : (text.length > 10 ? text.substr(0, 10) : text)
        //   },
        //   width: 150
        // },
        {
          title: '操作',
          dataIndex: 'action',
          align: "center",
          fixed: "right",
          width: 200,
          scopedSlots: { customRender: 'action' }
        }
      ],
      url: {
        list: "/projectmanage/list",
        delete: "/projectmanage/delete",
        deleteBatch: "/projectmanage/deleteBatch",
        exportXlsUrl: "/projectmanage/exportXls",
        importExcelUrl: "projectmanage/importExcel",

      },
      dictOptions: {},
      superFieldList: [],
      serviceCostModalVisible: false,
      serviceCostProId: '',
      updateLogModalVisible: false,
      updateLogProId: '',
      // 修改唯一ID相关
      editUniqueIdModalVisible: false,
      editUniqueIdLoading: false,
      currentRecord: null, // 保存当前操作的记录
      editUniqueIdForm: {
        id: '',
        proName: '',
        oldUniqueId: '',
        newUniqueId: ''
      },
      editUniqueIdRules: {
        newUniqueId: [
          { required: true, message: '请输入新的唯一ID', trigger: 'blur' },
          { min: 1, max: 50, message: '唯一ID长度在1到50个字符', trigger: 'blur' }
        ]
      },
      // 前端导出相关
      frontendExportLoading: false
    }
  },
  created() {
    this.getSuperFieldList();
    getAction('/sys/api/queryUserRoles', {
      username: this.$store.getters.userInfo.username
    }).then(res => {
      this.userRoles = res
    })

  },
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
    },
  },
  methods: {
    ...mapGetters(["userInfo"]),
    initDictConfig() {
    },
    getSuperFieldList() {
      let fieldList = [];
      // fieldList.push({ type: 'string', value: 'delFlag', text: '删除标识（0：未删除1：已删除）', dictCode: '' })
      fieldList.push({ type: 'string', value: 'proName', text: '项目名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'proAbbr', text: '原用名', dictCode: '' })
      fieldList.push({ type: 'string', value: 'uniqueId', text: '唯一ID', dictCode: '' })
      fieldList.push({ type: 'string', value: 'aePerson', text: 'AE人员', dictCode: '' })
      // fieldList.push({ type: 'string', value: 'salesPerson', text: '销售人员', dictCode: '' })
      // fieldList.push({ type: 'string', value: 'operationPerson', text: '运营人员', dictCode: '' })
      fieldList.push({ type: 'string', value: 'businessPerson', text: '商务人员', dictCode: '' })
      fieldList.push({ type: 'select', value: 'paymentMethod', text: '结算方式', dictCode: 'project_paymentMethod' })
      fieldList.push({ type: 'date', value: 'beginDate', text: '项目开始时间' })
      fieldList.push({ type: 'date', value: 'endDate', text: '项目结束时间' })
      fieldList.push({ type: 'string', value: 'productName', text: '产品名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'channelId', text: '投放渠道', dictCode: '' })
      fieldList.push({ type: 'string', value: 'channelName', text: '渠道名称', dictCode: '' })
      fieldList.push({ type: 'double', value: 'rebate', text: '返点', dictCode: '' })
      this.superFieldList = fieldList
    },
    setRowBackground(record) {
      if (!record.endDate) return '';
      const currentDate = formatDate('YYYY-MM-DD');
      return new Date(currentDate) > new Date(record.endDate) ? 'expired' : '';
    },
    handleServiceCost(record) {
      this.serviceCostProId = record.id
      this.serviceCostModalVisible = true
    },
    handleServiceCostSuccess() {
      this.serviceCostModalVisible = false
      this.$message.success('服务费录入成功')
    },
    handleServiceCostCancel() {
      this.serviceCostModalVisible = false
    },
    handleUpdateLog(record) {
      this.updateLogProId = record.id
      this.updateLogModalVisible = true
    },
    handleUpdateLogCancel() {
      this.updateLogModalVisible = false
    },
    handleWorkbench(record) {
      // 构造完整的URL，带上id参数
      // console.log(record)
      const url = `${window.location.origin}${window.location.pathname}#${'/projectManager/workbench'}?id=${record.uniqueId}&oid=${record.id}`;
      window.open(url, '_blank');
    },
    handleCopyLink(record) {
      // 构造充转退链接URL
      const link = `${window.location.origin}${window.location.pathname}#${'/projectManager/workbench'}?id=${record.uniqueId}&oid=${record.id}`;

      // 使用navigator.clipboard API复制到剪贴板
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(link).then(() => {
          this.$message.success('充转退链接已复制到剪贴板');
        }).catch(err => {
          console.error('复制失败:', err);
          this.fallbackCopyTextToClipboard(link);
        });
      } else {
        // 降级方案：使用传统的document.execCommand方法
        this.fallbackCopyTextToClipboard(link);
      }
    },
    fallbackCopyTextToClipboard(text) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand('copy');
        if (successful) {
          this.$message.success('充转退链接已复制到剪贴板');
        } else {
          this.$message.error('复制失败，请手动复制');
        }
      } catch (err) {
        console.error('复制失败:', err);
        this.$message.error('复制失败，请手动复制');
      }

      document.body.removeChild(textArea);
    },
    // 修改唯一ID相关方法
    handleEditUniqueId(record) {
      this.editUniqueIdForm = {
        id: record.id,
        proName: record.proName,
        oldUniqueId: record.uniqueId,
        newUniqueId: ''
      }
      // 保存完整的record数据，用于后续更新
      this.currentRecord = record
      this.editUniqueIdModalVisible = true
    },
    handleEditUniqueIdOk() {
      this.$refs.editUniqueIdForm.validate((valid) => {
        if (valid) {
          this.editUniqueIdLoading = true

          // 构造更新数据，使用record中的完整数据，只更新uniqueId字段
          const updateData = {
            ...this.currentRecord, // 使用完整的record数据
            uniqueId: this.editUniqueIdForm.newUniqueId // 只更新唯一ID字段
          }

          // 调用API更新唯一ID，使用PUT方法
          this.$http.put('/projectmanage/edit', updateData).then((res) => {
            if (res.success) {
              this.$message.success('唯一ID修改成功')
              this.editUniqueIdModalVisible = false
              this.loadData() // 重新加载数据
            } else {
              this.$message.error(res.message || '修改失败')
            }
          }).catch((error) => {
            console.error('修改唯一ID失败:', error)
            this.$message.error('修改失败，请重试')
          }).finally(() => {
            this.editUniqueIdLoading = false
          })
        }
      })
    },
    handleEditUniqueIdCancel() {
      this.editUniqueIdModalVisible = false
      this.$refs.editUniqueIdForm.resetFields()
    },
    // 前端导出Excel（使用ExcelJS，支持单元格样式）
    async handleFrontendExport() {
      this.frontendExportLoading = true
      try {
        // 调用不分页接口获取全部数据
        const params = this.getQueryParams()
        const response = await getAction('/projectmanage/listNotPage', params)

        if (response && response.success) {
          // 处理返回数据，可能是数组或对象
          let data = []
          let total = 0

          if (Array.isArray(response.result)) {
            data = response.result
            total = data.length
          } else if (response.result && Array.isArray(response.result.records)) {
            // 如果返回的是分页格式
            data = response.result.records
            total = response.result.total || data.length
          } else if (response.result && Array.isArray(response.result.list)) {
            // 如果返回的是list格式
            data = response.result.list
            total = response.result.total || data.length
          } else {
            data = []
            total = 0
          }

          if (data.length === 0) {
            this.$message.warning('没有数据可导出')
            return
          }

          // 过滤掉操作列和不需要导出的列
          const exportColumns = this.columns.filter(col =>
            col.dataIndex &&
            col.dataIndex !== 'action' &&
            !col.scopedSlots
          )

          // 创建Excel工作簿
          const workbook = new ExcelJS.Workbook()
          const worksheet = workbook.addWorksheet('项目管理')

          // 添加总数信息到第一行（如果有总数）
          let headerRowIndex = 1
          if (total > 0 && total !== data.length) {
            worksheet.insertRow(1, [`共 ${total} 条数据`])
            const totalRow = worksheet.getRow(1)
            totalRow.font = { bold: true, color: { argb: 'FF0000FF' } }
            totalRow.alignment = { horizontal: 'left' }
            worksheet.mergeCells(1, 1, 1, exportColumns.length)
            headerRowIndex = 2
          }

          // 设置表头
          const headerRow = worksheet.addRow(exportColumns.map(col => col.title))
          headerRow.font = { bold: true }
          headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
          }
          headerRow.alignment = { vertical: 'middle', horizontal: 'center' }

          // 准备数据行
          data.forEach((item, rowIndex) => {
            const row = worksheet.addRow([])

            exportColumns.forEach((col, colIndex) => {
              let value = item[col.dataIndex]

              // 处理字典文本显示
              if (col.dataIndex.endsWith('_dictText')) {
                value = item[col.dataIndex]
              }

              const cell = row.getCell(colIndex + 1)

              // 处理项目名称列：如果是博拉直签，设置红色背景
              if (col.dataIndex === 'proName') {
                cell.value = value || ''
                cell.alignment = { vertical: 'middle', horizontal: 'left' }

                // 如果是博拉直签，设置红色背景
                if (item.isDirect === 'N') {
                  cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFF0000' } // 红色背景
                  }
                  cell.font = { color: { argb: 'FFFFFFFF' } } // 白色文字
                }
              } else if (col.dataIndex === 'operationType') {
                // 处理运营方式：转换为文本
                let finalValue = ''
                if (col.customRender && typeof col.customRender === 'function') {
                  try {
                    const rendered = col.customRender(value, item)
                    // customRender返回字符串，直接使用
                    if (typeof rendered === 'string') {
                      finalValue = rendered
                    } else {
                      // 如果不是字符串，使用映射
                      const operationTypeMap = { 1: '自运营', 2: '走量', 3: '收量' }
                      finalValue = operationTypeMap[value] || operationTypeMap[String(value)] || ''
                    }
                  } catch (e) {
                    const operationTypeMap = { 1: '自运营', 2: '走量', 3: '收量' }
                    finalValue = operationTypeMap[value] || operationTypeMap[String(value)] || ''
                  }
                } else {
                  const operationTypeMap = { 1: '自运营', 2: '走量', 3: '收量' }
                  finalValue = operationTypeMap[value] || operationTypeMap[String(value)] || ''
                }
                cell.value = finalValue
                cell.alignment = { vertical: 'middle', horizontal: 'left' }
              } else if (col.dataIndex === 'paymentMethod') {
                // 处理结算方式：转换为文本
                let finalValue = ''
                if (col.customRender && typeof col.customRender === 'function') {
                  try {
                    const rendered = col.customRender(value, item)
                    // customRender返回字符串，直接使用
                    if (typeof rendered === 'string') {
                      finalValue = rendered
                    } else {
                      // 如果不是字符串，使用映射
                      const paymentMethodMap = { 0: '充值结算', 1: '消耗结算', 99: '' }
                      finalValue = paymentMethodMap[value] !== undefined ? paymentMethodMap[value] : (paymentMethodMap[String(value)] !== undefined ? paymentMethodMap[String(value)] : '')
                    }
                  } catch (e) {
                    const paymentMethodMap = { 0: '充值结算', 1: '消耗结算', 99: '' }
                    finalValue = paymentMethodMap[value] !== undefined ? paymentMethodMap[value] : (paymentMethodMap[String(value)] !== undefined ? paymentMethodMap[String(value)] : '')
                  }
                } else {
                  const paymentMethodMap = { 0: '充值结算', 1: '消耗结算', 99: '' }
                  finalValue = paymentMethodMap[value] !== undefined ? paymentMethodMap[value] : (paymentMethodMap[String(value)] !== undefined ? paymentMethodMap[String(value)] : '')
                }
                cell.value = finalValue
                cell.alignment = { vertical: 'middle', horizontal: 'left' }
              } else {
                // 处理自定义渲染（尝试提取文本值）
                if (col.customRender && typeof col.customRender === 'function') {
                  try {
                    const rendered = col.customRender(value, item)
                    // 如果是JSX元素，尝试提取文本
                    if (rendered && rendered.props && rendered.props.children) {
                      const children = rendered.props.children
                      if (Array.isArray(children)) {
                        value = children.filter(c => typeof c === 'string').join('')
                      } else if (typeof children === 'string') {
                        value = children
                      }
                    } else if (typeof rendered === 'string' || typeof rendered === 'number') {
                      // 如果customRender直接返回字符串或数字，使用它
                      value = rendered
                    }
                  } catch (e) {
                    // 如果提取失败，使用原值
                  }
                }

                cell.value = value || ''
                cell.alignment = { vertical: 'middle', horizontal: 'left' }
              }
            })
          })

          // 设置列宽
          exportColumns.forEach((col, index) => {
            let width = Math.max(col.title.length * 2, 10)

            // 特殊列宽度调整
            if (col.dataIndex === 'proName') {
              width = 30
            } else if (col.dataIndex === 'customerName' || col.dataIndex === 'businessName') {
              width = 20
            } else if (col.dataIndex === 'uniqueId') {
              width = 15
            } else if (col.dataIndex.includes('Person') || col.dataIndex.includes('Mode') || col.dataIndex.includes('Type')) {
              width = 12
            }

            worksheet.getColumn(index + 1).width = width
          })

          // 生成文件名
          const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_')
          const fileName = `项目管理_${timestamp}.xlsx`

          // 导出文件
          const buffer = await workbook.xlsx.writeBuffer()
          const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = fileName
          link.click()
          window.URL.revokeObjectURL(url)

          this.$message.success(`成功导出${data.length}条数据${total > data.length ? `（共${total}条）` : ''}`)
        } else {
          this.$message.error('获取数据失败')
        }
      } catch (error) {
        console.error('前端导出失败:', error)
        this.$message.error('导出失败，请重试')
      } finally {
        this.frontendExportLoading = false
      }
    }
  }
}
</script>ae
<style scoped>
@import '~@assets/less/common.less';

.expired {
  background-color: red;
}

/* 项目列表表格样式优化 */
.project-table {

  /* 表格单元格样式 */
  .ant-table-tbody>tr>td {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* 项目名称列特殊处理 - 给予更多空间 */
  .ant-table-tbody>tr>td:nth-child(2) {
    max-width: 300px;
  }

  /* 客户名称列 */
  .ant-table-tbody>tr>td:nth-child(3) {
    max-width: 200px;
  }

  /* 渠道名称列 */
  .ant-table-tbody>tr>td:nth-child(4) {
    max-width: 150px;
  }

  /* 人员相关列（AE、运营、商务） */
  .ant-table-tbody>tr>td:nth-child(5),
  .ant-table-tbody>tr>td:nth-child(6),
  .ant-table-tbody>tr>td:nth-child(7) {
    max-width: 120px;
  }

  /* 运营方式、合作方式、结算方式列 */
  .ant-table-tbody>tr>td:nth-child(8),
  .ant-table-tbody>tr>td:nth-child(9),
  .ant-table-tbody>tr>td:nth-child(10) {
    max-width: 100px;
  }

  /* 操作列固定宽度 */
  .ant-table-tbody>tr>td:last-child {
    width: 200px !important;
    min-width: 200px;
    max-width: 200px;
  }

  /* 唯一ID列 */
  .ant-table-tbody>tr>td:first-child {
    max-width: 80px;
  }
}

/* 响应式处理 */
@media (max-width: 1200px) {
  .project-table .ant-table-tbody>tr>td:nth-child(2) {
    max-width: 250px;
  }
}

@media (max-width: 992px) {
  .project-table .ant-table-tbody>tr>td:nth-child(2) {
    max-width: 200px;
  }

  .project-table .ant-table-tbody>tr>td:nth-child(3) {
    max-width: 150px;
  }
}

@media (max-width: 768px) {
  .project-table .ant-table-tbody>tr>td:nth-child(2) {
    max-width: 150px;
  }

  .project-table .ant-table-tbody>tr>td:nth-child(3) {
    max-width: 120px;
  }

  .project-table .ant-table-tbody>tr>td:nth-child(4) {
    max-width: 100px;
  }
}
</style>