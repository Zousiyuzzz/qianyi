<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <div class="search-row-flex" style="display: flex;flex-direction: column;">
          <div
            style="display: flex;flex-direction: row;justify-content: left;width: 100%;flex-wrap: wrap;column-gap: 20px;">
            <div class="search-item">
              <a-form-item label="项目">
                <JSearchSelectTag placeholder="请选择项目" v-model="queryParam.proId" style="width:200px"
                  dict="tab_projectManage,pro_name,id,del_flag = '0'" async allowClear />
              </a-form-item>
            </div>
            <div class="search-item">
              <a-form-item label="交易类型">
                <a-select v-model="queryParam.tradeType" placeholder="请选择交易类型" allow-clear style="width:200px">
                  <a-select-option value="1">充值</a-select-option>
                  <a-select-option value="2">转账</a-select-option>
                  <a-select-option value="3">退款</a-select-option>
                </a-select>
              </a-form-item>
            </div>
            <div class="search-item">
              <a-form-item label="创建日期">
                <a-range-picker v-model:value="createTime" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
                  style="width:200px" />
              </a-form-item>
            </div>
            <div class="search-item">
              <a-form-item label="转入ID">
                <a-input v-model="queryParam.targetAdvertiserId" placeholder="请输入转入ID" allow-clear
                  style="width:200px" />
              </a-form-item>
            </div>
            <div class="search-item">
              <a-form-item label="转出ID">
                <a-input v-model="queryParam.sourceAdvertiserId" placeholder="请输入转出ID" allow-clear
                  style="width:200px" />
              </a-form-item>
            </div>
            <div class="search-item">
              <a-form-item label="状态">
                <a-select v-model="queryParam.state" placeholder="请选择状态" allow-clear style="width:200px">
                  <a-select-option value="1">同意</a-select-option>
                  <a-select-option value="2">待处理</a-select-option>
                  <a-select-option value="3">驳回</a-select-option>
                </a-select>
              </a-form-item>
            </div>
          </div>
          <div style="display: flex;flex-direction: row;justify-content: left;width: 100%;">
            <div class="search-item">
              <a-form-item>
                <a-button type="primary" icon="search" @click="searchQuery">查询</a-button>
                <a-button style="margin-left: 8px" @click="resetQuery">重置</a-button>
              </a-form-item>
            </div>
          </div>
        </div>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <!-- <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button> -->
      <a-button type="primary" icon="download" @click="handleExportXls('充转退记录表')">导出</a-button>
      <!-- <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl"
        @change="handleImportExcel">
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload> -->
      <!-- 高级查询区域 -->
      <!-- <j-super-query :fieldList="superFieldList" ref="superQueryModal"
        @handleSuperQuery="handleSuperQuery"></j-super-query> -->
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <!-- <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button> -->
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchAgree"><a-icon type="delete" />批量同意</a-menu-item>
          <a-menu-item key="1" @click="batchReject"><a-icon type="delete" />批量驳回</a-menu-item>
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

        <!-- 操作列相关插槽 -->
        <span slot="action" slot-scope="text, record">
          <a-popconfirm title="确定同意吗?" v-if="record.state === '2'" @confirm="() => handleAgree(record.id)">
            <a>同意</a>
          </a-popconfirm>
          <a-divider type="vertical" />
          <a-popconfirm title="确定驳回吗?" v-if="record.state === '2'" @confirm="() => handleReject(record.id)">
            <a>驳回</a>
          </a-popconfirm>
          <a-divider type="vertical" />
          <a @click="handleEditTime(record)">修改时间</a>
        </span>
      </a-table>
    </div>

    <tab-fund-transfer-record-modal ref="modalForm" @ok="modalFormOk"></tab-fund-transfer-record-modal>

    <!-- 修改交易时间模态框 -->
    <a-modal title="修改交易时间" :visible="editTimeVisible" @ok="handleEditTimeOk" @cancel="handleEditTimeCancel"
      :confirmLoading="editTimeLoading">
      <a-form-model ref="editTimeForm" :model="editTimeForm" :rules="editTimeRules" layout="vertical">
        <a-form-model-item label="交易时间" prop="createTime">
          <a-date-picker v-model="editTimeForm.createTime" show-time format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择交易时间" style="width: 100%" />
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </a-card>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { postAction } from '@/api/manage'
import TabFundTransferRecordModal from './modules/TabFundTransferRecordModal'

export default {
  name: 'TabFundTransferRecordList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    TabFundTransferRecordModal
  },
  data() {
    return {
      description: '充转退记录表管理页面',
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
          title: '转出方账户Id',
          align: "center",
          dataIndex: 'sourceAdvertiserId'
        },
        {
          title: '转出方账户名称',
          align: "center",
          dataIndex: 'sourceAdvertiserName'
        }, {
          title: '转入方账户Id',
          align: "center",
          dataIndex: 'targetAdvertiserId'
        },
        {
          title: '转入方账户名称',
          align: "center",
          dataIndex: 'targetAdvertiserName'
        },
        {
          title: '资金性质',
          align: "center",
          dataIndex: 'fundsNature',
          customRender: (text) => {
            if (text === '1' || text === 1) return '对公'
            if (text === '2' || text === 2) return '对私'
            return text
          }
        },
        {
          title: '返点形式',
          align: "center",
          dataIndex: 'rebateForm',
          customRender: (text) => {
            if (text === '1' || text === 1) return '返货'
            if (text === '2' || text === 2) return '返现'
            return text
          }
        },
        {
          title: '返点',
          align: "center",
          dataIndex: 'rebateNum',
          customRender: (text) => {
            return ((text || 0) * 100).toFixed(2) + '%'
          }
        },
        {
          title: '交易类型',
          align: "center",
          dataIndex: 'tradeType',
          customRender: (text) => {
            if (text === '1' || text === 1) return '充值'
            if (text === '2' || text === 2) return '转账'
            if (text === '3' || text === 3) return '退款'
            return text
          }
        },
        {
          title: '交易时间',
          align: "center",
          dataIndex: 'createTime'
        },
        {
          title: '交易金额(元)',
          align: "center",
          dataIndex: 'amount'
        },
        {
          title: '状态',
          align: "center",
          dataIndex: 'state',
          customRender: (text) => {
            if (text === '1' || text === 1) return '同意'
            if (text === '2' || text === 2) return '待处理'
            if (text === '3' || text === 3) return '驳回'
            return text
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
        list: "/nonApiFundTransferRecord/list",
        delete: "/fundTransferRecord/delete",
        deleteBatch: "/fundTransferRecord/deleteBatch",
        exportXlsUrl: "/fundTransferRecord/exportXls",
        importExcelUrl: "fundTransferRecord/importExcel",

      },
      dictOptions: {},
      superFieldList: [],
      createTime: [],
      editTimeVisible: false,
      editTimeLoading: false,
      editTimeForm: {
        id: '',
        createTime: ''
      },
      editTimeRules: {
        createTime: [{ required: true, message: '请选择交易时间', trigger: 'change' }]
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
  watch: {
    createTime(newVal) {
      this.queryParam.createTimeJoint = newVal.join(',')
    }
  },
  methods: {
    initDictConfig() {
    },
    resetQuery() {
      this.queryParam = {};
      this.searchQuery();
    },
    // 同意操作
    handleAgree(id) {
      const formData = new FormData();
      formData.append('id', id);
      postAction('/nonApiFundTransferRecord/agree', formData).then(res => {
        if (res.success) {
          this.$message.success('同意成功');
          this.searchQuery();
        } else {
          this.$message.error(res.message || '同意失败');
        }
      }).catch(err => {
        this.$message.error(`同意失败：${err.message}`);
      });
    },
    // 驳回操作
    handleReject(id) {
      const formData = new FormData();
      formData.append('id', id);
      postAction('/nonApiFundTransferRecord/reject', formData).then(res => {
        if (res.success) {
          this.$message.success('驳回成功');
          this.searchQuery();
        } else {
          this.$message.error(res.message || '驳回失败');
        }
      }).catch(err => {
        this.$message.error(`驳回失败：${err.message}`);
      });
    },
    batchAgree() {
      if (this.selectedRowKeys.length <= 0) {
        this.$message.warning('请选择一条记录！');
        return false;
      } else {
        const selectedRows = this.dataSource.filter(item => this.selectedRowKeys.includes(item.id));
        if (selectedRows.some(item => item.state !== '2')) {
          this.$message.warning('请选择待处理状态的记录！');
          return false;
        }
        const formData = new FormData();
        formData.append('id', this.selectedRowKeys.join(','));
        postAction('/nonApiFundTransferRecord/agree', formData).then(res => {
          if (res.success) {
            this.$message.success('同意成功');
            this.searchQuery();
          } else {
            this.$message.error(res.message || '同意失败');
          }
        }).catch(err => {
          this.$message.error(`同意失败：${err.message}`);
        });
      }
    },
    batchReject() {
      if (this.selectedRowKeys.length <= 0) {
        this.$message.warning('请选择一条记录！');
        return false;
      } else {
        const selectedRows = this.dataSource.filter(item => this.selectedRowKeys.includes(item.id));
        if (selectedRows.some(item => item.state !== '2')) {
          this.$message.warning('请选择待处理状态的记录！');
          return false;
        }
        const formData = new FormData();
        formData.append('id', this.selectedRowKeys.join(','));
        postAction('/nonApiFundTransferRecord/reject', formData).then(res => {
          if (res.success) {
            this.$message.success('驳回成功');
            this.searchQuery();
          } else {
            this.$message.error(res.message || '驳回失败');
          }
        }).catch(err => {
          this.$message.error(`驳回失败：${err.message}`);
        });
      }
    },
    getSuperFieldList() {
      let fieldList = [];
      fieldList.push({ type: 'string', value: 'delFlag', text: '删除标识（0：未删除1：已删除）', dictCode: '' })
      fieldList.push({ type: 'string', value: 'channelName', text: '渠道名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'channelPlatform', text: '平台标识', dictCode: '' })
      fieldList.push({ type: 'string', value: 'channelSign', text: '渠道标识', dictCode: '' })
      fieldList.push({ type: 'string', value: 'proId', text: '项目ID', dictCode: '' })
      fieldList.push({ type: 'string', value: 'proName', text: '项目名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'agentId', text: '代理商id', dictCode: '' })
      fieldList.push({ type: 'string', value: 'agentName', text: '代理商名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'targetAdvertiserId', text: '转入方账户Id', dictCode: '' })
      fieldList.push({ type: 'string', value: 'targetAdvertiserName', text: '转入方账户名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'sourceAdvertiserId', text: '转出方账户Id', dictCode: '' })
      fieldList.push({ type: 'string', value: 'sourceAdvertiserName', text: '转出方账户名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'fundsNature', text: '资金性质（1：对公2：对私）', dictCode: '' })
      fieldList.push({ type: 'string', value: 'tradeType', text: '交易类型（1：充值2：转账3：退款）', dictCode: '' })
      fieldList.push({ type: 'string', value: 'rebateForm', text: '返点形式:1：返货2：返现)', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'rebateNum', text: '返点数', dictCode: '' })
      fieldList.push({ type: 'string', value: 'mediaSerialNumber', text: '媒体流水号', dictCode: '' })
      fieldList.push({ type: 'string', value: 'state', text: '状态(1:成功2:处理中3:失败4:已取消)', dictCode: '' })
      fieldList.push({ type: 'string', value: 'batchNumber', text: '批次号', dictCode: '' })
      fieldList.push({ type: 'string', value: 'recordSource', text: '记录来源(1:微信API 2:web客户端3：H5工作台4：微信小程序)', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'amount', text: '交易金额', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'changeMoney', text: '变动金额', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'publicBalance', text: '对公余额', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'privateBalance', text: '对私余额', dictCode: '' })
      fieldList.push({ type: 'string', value: 'transferType', text: '转账类型(1:现金,2:信用,3:框返,4:激励,6:现金+信用,CREDIT_BIDDING:授信竞价,CREDIT_BRAND:授信品牌,CREDIT_GENERAL:授信通用,PREPAY_BIDDING:预付竞价,PREPAY_BRAND:预付品牌,PREPAY_GENERAL:预付通用)', dictCode: '' })
      fieldList.push({ type: 'string', value: 'remarks', text: '备注', dictCode: '' })
      fieldList.push({ type: 'string', value: 'errMsg', text: '失败原因', dictCode: '' })
      this.superFieldList = fieldList
    },
    handleEditTime(record) {
      this.editTimeForm = {
        id: record.id,
        createTime: record.createTime
      };
      this.editTimeVisible = true;
    },
    handleEditTimeOk() {
      this.$refs.editTimeForm.validate(valid => {
        if (valid) {
          this.editTimeLoading = true;
          const formData = new FormData();
          formData.append('id', this.editTimeForm.id);
          formData.append('createTime', this.editTimeForm.createTime);
          postAction('/nonApiFundTransferRecord/updateCreateTime', formData).then(res => {
            if (res.success) {
              this.$message.success('修改成功');
              this.searchQuery();
              this.editTimeVisible = false;
            } else {
              this.$message.error(res.message || '修改失败');
            }
          }).catch(err => {
            this.$message.error(`修改失败：${err.message}`);
          }).finally(() => {
            this.editTimeLoading = false;
          });
        }
      });
    },
    handleEditTimeCancel() {
      this.editTimeVisible = false;
      this.$refs.editTimeForm.resetFields();
    }
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less';

.search-row-flex {
  display: flex;
  align-items: center;
}

.search-item {
  margin-right: 10px;
}

.search-item:last-child {
  margin-right: 0;
}
</style>