<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <div class="search-row-flex" style="display: flex;flex-direction: column;">
          <div style="display: flex;flex-direction: row;justify-content: left;width: 100%;flex-wrap: wrap">
            <div class="search-item">
              <a-form-item label="项目">
                <a-input v-model="queryParam.proName" placeholder="请输入项目名称" allow-clear style="width:200px" />
              </a-form-item>
            </div>
            <div class="search-item">
              <a-form-item label="代理商">
                <a-input v-model="queryParam.agentName" placeholder="请输入代理商名称" allow-clear style="width:200px" />
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
              <a-form-item label="交易时间">
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
                  <a-select-option value="1">成功</a-select-option>
                  <a-select-option value="2">处理中</a-select-option>
                  <a-select-option value="3">失败</a-select-option>
                  <a-select-option value="4">已取消</a-select-option>
                  <a-select-option value="5">交易异常</a-select-option>
                  <a-select-option value="6">等待中</a-select-option>
                  <a-select-option value="7">部分成功</a-select-option>
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
      <j-super-query :fieldList="superFieldList" ref="superQueryModal"
        @handleSuperQuery="handleSuperQuery"></j-super-query>
      <a-button type="primary" icon="reload" @click="reload()">刷新状态</a-button>

      <a-dropdown v-if="selectedRowKeys.length > 0">
        <!-- <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete" />删除</a-menu-item>
        </a-menu> -->
        <!-- <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button> -->
        <a-button style="margin-left: 8px" @click="updateFundPool"
          v-if="(userRoles.includes('admin') || userRoles.includes('BOSS'))"> 更新资金池 <a-icon type="redo" /></a-button>
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

        <!-- 删除操作列相关插槽 -->
        <!-- <span slot="action" slot-scope="text, record">
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
        </span> -->

      </a-table>
    </div>

    <tab-fund-transfer-record-modal ref="modalForm" @ok="modalFormOk"></tab-fund-transfer-record-modal>
  </a-card>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import TabFundTransferRecordModal from './modules/TabFundTransferRecordModal'
import { postAction, getAction } from '@/api/manage'

export default {
  name: 'TabFundTransferRecordList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    TabFundTransferRecordModal
  },
  data() {
    return {
      userRoles: [],
      description: '充转退记录表管理页面',
      // 表头
      columns: [
        {
          title: '渠道名称',
          align: "center",
          dataIndex: 'channelName'
        },
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
          title: '代理商id',
          align: "center",
          dataIndex: 'agentId'
        },
        {
          title: '代理商名称',
          align: "center",
          dataIndex: 'agentName'
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
          title: '记录来源',
          align: "center",
          dataIndex: 'recordSource',
          customRender: (text) => {
            if (text === '1' || text === 1) return '微信API'
            if (text === '2' || text === 2) return 'web客户端'
            if (text === '3' || text === 3) return 'H5工作台'
            if (text === '4' || text === 4) return '微信小程序'
            if (text === '5' || text === 5) return 'H5工作台-非API'

            return text
          }
        },
        {
          title: '变动金额(元)',
          align: "center",
          dataIndex: 'changeMoney'
        },
        {
          title: '对公余额(元)',
          align: "center",
          dataIndex: 'publicBalance'
        },
        {
          title: '对私余额(元)',
          align: "center",
          dataIndex: 'privateBalance'
        },
        {
          title: '转账类型',
          align: "center",
          dataIndex: 'transferType',
          customRender: (text) => {
            //快手
            if (text === '1' || text === 1) return '现金'
            if (text === '2' || text === 2) return '信用'
            if (text === '3' || text === 3) return '框返'
            if (text === '4' || text === 4) return '激励'
            if (text === '6' || text === 6) return '现金+信用'
            //抖音
            if (text === 'CREDIT_BIDDING') return '授信竞价'
            if (text === 'CREDIT_BRAND') return '授信品牌'
            if (text === 'CREDIT_GENERAL') return '授信通用'
            if (text === 'PREPAY_BIDDING') return '预付竞价'
            if (text === 'PREPAY_BRAND') return '预付品牌'
            if (text === 'PREPAY_GENERAL') return '预付通用'
            //腾讯广告
            if (text === 'FUND_TYPE_CREDIT_ROLL') return '竞价信用账户'
            if (text === 'FUND_TYPE_CASH') return '现金账户'
            if (text === 'FUND_TYPE_TEST_VIRTUAL') return '测试虚拟金账户'
            if (text === 'FUND_TYPE_GIFT') return '赠送账户'
            return text
          }
        },
        {
          title: '备注',
          align: "center",
          dataIndex: 'remarks',
          width: 100,
          customRender: (text) => {
            return text ? (
              <a-tooltip title={text}>
                <span style="display: inline-block; width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  {text}
                </span>
              </a-tooltip>
            ) : text
          }
        }, {
          title: '状态',
          align: "center",
          dataIndex: 'state',
          customRender: (text) => {
            if (text === '1' || text === 1) return '成功'
            if (text === '2' || text === 2) return '处理中'
            if (text === '3' || text === 3) return '失败'
            if (text === '4' || text === 4) return '已取消'
            if (text === '5' || text === 4) return '交易异常'
            if (text === '6' || text === 5) return '等待中'
            if (text === '7' || text === 5) return '部分成功'
            return text
          }
        },
        {
          title: '失败原因',
          align: "center",
          dataIndex: 'errMsg'
        }, {
          title: '媒体流水号',
          align: "center",
          dataIndex: 'mediaSerialNumber'
        },

        {
          title: '批次号',
          align: "center",
          dataIndex: 'batchNumber'
        },
        // {
        //   title: '操作',
        //   dataIndex: 'action',
        //   align: "center",
        //   fixed: "right",
        //   width: 147,
        //   scopedSlots: { customRender: 'action' }
        // }
      ],
      url: {
        list: "fundTransferRecord/listPage",
        delete: "/fundTransferRecord/delete",
        deleteBatch: "/fundTransferRecord/deleteBatch",
        exportXlsUrl: "/fundTransferRecord/exportXls",
        importExcelUrl: "fundTransferRecord/importExcel",

      },
      dictOptions: {},
      superFieldList: [],
      createTime: []
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
  watch: {
    createTime(newVal) {
      this.queryParam.createTimeJoint = newVal.join(',')
    }
  },
  methods: {
    updateFundPool() {
      if (this.selectedRowKeys.length <= 0) {
        this.$message.warning('请选择一条记录！');
        return false;
      } else {
        const selectedRows = this.dataSource.filter(item => this.selectedRowKeys.includes(item.id));
        const ids = selectedRows.map(item => item.id).join(',');
        const isAllFailed = selectedRows.every(item => item.state == 3);
        if (!isAllFailed) {
          this.$message.warning('只能选择失败状态的记录');
          return false;
        }
        this.$confirm({
          title: '确认更新',
          content: `确定要更新选中的 ${this.selectedRowKeys.length} 条记录吗？`,
          okText: '确定',
          cancelText: '取消',
          onOk: () => {
            const formData = new FormData();
            formData.append('ids', ids);

            postAction('/fundTransferRecord/processApiData', formData).then((res) => {
              if (res.success) {
                this.$message.success('更新成功');
                this.loadData();
                this.onClearSelected();
              } else {
                this.$message.error(res.message || '更新失败');
              }
            }).catch((err) => {
              this.$message.error('更新失败：' + err.message);
            });
          }
        });
      }
    },
    reload() {
      postAction("/fundTransferRecord/updateState", {}).then((res) => {
        this.$message.success(res.message);
      });
    },
    initDictConfig() {
    },
    resetQuery() {
      this.queryParam = {};
      this.searchQuery();
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