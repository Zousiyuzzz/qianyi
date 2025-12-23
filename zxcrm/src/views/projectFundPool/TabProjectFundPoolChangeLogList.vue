<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="项目ID">
              <a-input placeholder="请输入项目ID" v-model="queryParam.proUniqueId"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="项目名称">
              <a-input placeholder="请输入项目名称" v-model="queryParam.proName"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="合作方式">
              <a-select placeholder="请选择" v-model="queryParam.collaborationMode" :allowClear="true">
                <a-select-option value="0">预付</a-select-option>
                <a-select-option value="1">垫付</a-select-option>
                <a-select-option value="2">服务费</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="资金性质">
              <a-select v-model="queryParam.fundsNature" placeholder="请选择资金性质" allowClear>
                <a-select-option v-for="item in fundsNatureOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="变更类型">
              <a-select v-model="queryParam.changeType" placeholder="请选择变更类型" allowClear>
                <a-select-option v-for="item in changeTypeOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="业务场景">
              <a-select v-model="queryParam.businessScenario" placeholder="请选择业务场景" allowClear>
                <a-select-option v-for="item in businessScenarioOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="业务发生时间">
              <a-range-picker v-model="createTime" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="批次号">
              <a-input v-model="queryParam.batchNumber"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button type="primary" icon="download" @click="handleExportXls('项目资金池变更记录')">导出</a-button>
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
      </a-table>
    </div>

    <tab-project-fund-pool-change-log-modal ref="modalForm" @ok="modalFormOk"></tab-project-fund-pool-change-log-modal>
  </a-card>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import TabProjectFundPoolChangeLogModal from './modules/TabProjectFundPoolChangeLogModal'

export default {
  name: 'TabProjectFundPoolChangeLogList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    TabProjectFundPoolChangeLogModal
  },
  data() {
    return {
      description: '项目资金池变更记录管理页面',
      createTime: [],
      // 表头
      columns: [

        {
          title: '业务发生时间',
          align: "center",
          dataIndex: 'createTime'
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
          title: '合作方式',
          align: "center",
          dataIndex: 'collaborationMode',
          customRender: (text) => {
            if (text) {
              let arr = ['预付', '垫付', '服务费']
              return arr[Number(text)] || text
            } else {
              return ''
            }
          },
        }, {
          title: '记录来源',
          align: 'center',
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
          title: '变更类型',
          align: "center",
          dataIndex: 'changeType',
          customRender: (text) => {
            if (text === '1' || text === 1) return '增加'
            if (text === '2' || text === 2) return '减少'
            return text
          }
        },
        {
          /**
           * 业务场景（1：设置授信额度2:项目备款3：账户充值4：账户转账5：账户退款
           * 6：调整授信额度7：钱包充值8：钱包退款9：子端口充值10:子端口退款11:客户退款）
           */
          title: '业务场景',
          align: "center",
          dataIndex: 'businessScenario',
          customRender: (text) => {
            if (text == 1) return '设置授信额度'
            if (text == 2) return '项目备款'
            if (text == 3) return '账户充值'
            if (text == 4) return '账户转账'
            if (text == 5) return '账户退款'
            if (text == 6) return '调整授信'
            if (text == 7) return '钱包充值'
            if (text == 8) return '钱包退款'
            if (text == 9) return '子端口充值'
            if (text == 10) return '子端口退款'
            if (text == 11) return '客户退款'
            if (text == 12) return '撤销备款'
            if (text == 13) return '项目划转'
            if (text == 14) return '到账导入'
            if (text == 15) return '非API充值'
            if (text == 16) return '非API退款'
            if (text == 17) return '项目损失'
            return text
          }
        },
        {
          title: '操作人',
          align: "center",
          dataIndex: 'createBy_dictText'
        },
        {
          title: '金额',
          align: "center",
          dataIndex: 'money'
        },
        {
          title: '授信总额度',
          align: "center",
          dataIndex: 'totalCreditLimit'
        },
        {
          title: '授信可用余额',
          align: "center",
          dataIndex: 'availableCreditBalance'
        },
        {
          title: '总备款',//对公备款+对私备款
          align: 'center',
          dataIndex: 'totalCashReserve',
        }, {
          title: '总欠款',//授信充值欠款
          align: 'center',
          dataIndex: 'totalArrears',
        },
        {
          title: '合计总余额',//总备款-授信已充值金额
          align: 'center',
          dataIndex: 'totalBalanceSum',
        },
        {
          title: '可用余额', //可用金额= 授信总额度 - 授信已充值金额 - 备款
          align: 'center',
          dataIndex: 'availablebBalance',
        }, {
          title: '对公',
          align: 'center',
          children: [
            {
              title: '现金备款',
              align: 'center',
              dataIndex: 'publicCashReserves'
            },
            {
              title: '授信欠款',
              align: 'center',
              dataIndex: 'publicCreditArrears'
            }
          ]
        },
        {
          title: '对私',
          align: 'center',
          children: [
            {
              title: '现金备款',
              align: 'center',
              dataIndex: 'privateCashReserve'
            },
            {
              title: '授信欠款',
              align: 'center',
              dataIndex: 'privateCreditArrears'
            }
          ]
        },
        {
          title: '备注',
          align: 'center',
          dataIndex: 'remarks',
          width: 100,
          customRender: (text) => {
            return text ? (
              <a-tooltip title={text}>
                <span style="display: inline-block; width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  {text}
                </span>
              </a-tooltip>
            ) : text
          }
        },

      ],
      fundsNatureOptions: [
        { value: '', label: '全部' },
        { value: '1', label: '对公' },
        { value: '2', label: '对私' }
      ],
      changeTypeOptions: [
        { value: '', label: '全部' },
        { value: '1', label: '增加' },
        { value: '2', label: '减少' }
      ],
      businessScenarioOptions: [
        { value: '', label: '全部' },
        { value: '1', label: '设置授信额度' },
        { value: '2', label: '项目备款' },
        { value: '3', label: '账户充值' },
        { value: '4', label: '账户转账' },
        { value: '5', label: '账户退款' },
        { value: '6', label: '调整授信' },
        { value: '7', label: '钱包充值' },
        { value: '8', label: '钱包退款' },
        { value: '9', label: '子端口充值' },
        { value: '10', label: '子端口退款' },
        { value: '11', label: '项目退款' },
        { value: '12', label: '撤销备款' },
        { value: '13', label: '项目划转' },
        { value: '14', label: '到账导入' },
        { value: '15', label: '非API充值' },
        { value: '16', label: '非API退款' },
        { value: '17', label: '项目损失' },
      ],
      queryParam: {
        proId: '',
        proName: '',
        fundsNature: '',
        changeType: '',
        businessScenario: ''
      },
      url: {
        list: "/projectFundPoolChangeLog/list",
        delete: "/projectFundPoolChangeLog/delete",
        deleteBatch: "/projectFundPoolChangeLog/deleteBatch",
        exportXlsUrl: "/projectFundPoolChangeLog/exportXls",
        importExcelUrl: "projectFundPoolChangeLog/importExcel",

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
  watch: {
    createTime(newVal) {
      this.queryParam.createTimeJoint = newVal.join(',')
    }
  },
  methods: {
    initDictConfig() {
    },
    getSuperFieldList() {
      let fieldList = [];
      fieldList.push({ type: 'string', value: 'delFlag', text: '删除标识（0：未删除1：已删除）', dictCode: '' })
      fieldList.push({ type: 'string', value: 'proId', text: '项目ID', dictCode: '' })
      fieldList.push({ type: 'string', value: 'proName', text: '项目名称', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'totalCreditLimit', text: '授信总额度', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'availableCreditBalance', text: '授信可用余额', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'publicCashReserves', text: '对公现金备款', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'publicCreditArrears', text: '对公授信欠款', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'privateCashReserve', text: '对私现金备款', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'privateCreditArrears', text: '对私授信欠款', dictCode: '' })
      fieldList.push({ type: 'string', value: 'fundsNature', text: '资金性质（1：对公2：对私）', dictCode: '' })
      fieldList.push({ type: 'string', value: 'changeType', text: '变更类型（1：增加2：减少）', dictCode: '' })
      fieldList.push({ type: 'string', value: 'businessScenario', text: '业务场景（1：设置授信额度）', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'money', text: '金额', dictCode: '' })
      this.superFieldList = fieldList
    }
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>