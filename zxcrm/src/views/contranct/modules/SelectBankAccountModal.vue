<template>
  <j-modal
    title="选择账户"
    :width="1000"
    :visible="visible"
    switchFullscreen
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭"
  >
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :span="6">
            <a-form-item label="银行类别">
              <a-select v-model="queryParam.bankType" placeholder="请选择银行类别" :allowClear="true">
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
              <a-input v-model="queryParam.accountNo" placeholder="请输入账户号"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="账户名称">
              <a-input v-model="queryParam.accountName" placeholder="请输入账户名称"></a-input>
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

    <!-- table区域-begin -->
    <div>
      <a-table
        ref="table"
        size="middle"
        :scroll="{ x: accountType === 'customer' ? 1340 : true }"
        bordered
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange, type: 'radio' }"
        class="j-table-force-nowrap"
        :customRow="customRow"
        @change="handleTableChange"
      >
      </a-table>
    </div>
    <!-- table区域-END -->
  </j-modal>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { filterObj } from '@/utils/util'

export default {
  name: 'SelectBankAccountModal',
  mixins: [JeecgListMixin],
  props: {
    // 账户类型：'our' 我方主体，'customer' 项目主体
    accountType: {
      type: String,
      default: 'our'
    },
    // 项目ID（用于项目主体查询时过滤）
    proId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      description: '选择账户',
      visible: false,
      // 查询条件
      queryParam: {},
      // 表头（将在 created 中初始化）
      columns: [],
      url: {
        list: '/bankAccountConfig/list'
      }
    }
  },
  created() {
    // 初始化表头和URL
    this.initColumnsAndUrl()
  },
  watch: {
    accountType: {
      handler() {
        this.initColumnsAndUrl()
      }
    }
  },
  methods: {
    initColumnsAndUrl() {
      if (this.accountType === 'customer') {
        this.columns = [
          {
            title: '我方账户号',
            align: 'center',
            dataIndex: 'accountNo',
            width: 150
          },
          {
            title: '我方账户名称',
            align: 'center',
            dataIndex: 'accountName',
            width: 200
          },
          {
            title: '甲方单位名称',
            align: 'center',
            dataIndex: 'partyAName',
            width: 180
          },
          {
            title: '甲方银行账号',
            align: 'center',
            dataIndex: 'partyAAccount',
            width: 180
          },
          {
            title: '甲方税号',
            align: 'center',
            dataIndex: 'partyATaxNo',
            width: 150
          },
          {
            title: '甲方开户银行',
            align: 'center',
            dataIndex: 'partyABank',
            width: 180
          },
          {
            title: '甲方地址',
            align: 'center',
            dataIndex: 'partyAAddress',
            width: 180
          },
          {
            title: '甲方电话',
            align: 'center',
            dataIndex: 'partyAPhone',
            width: 120
          }
        ]
        this.url.list = '/bankAccount/list'
      } else {
        this.columns = [
          {
            title: '公司名称',
            align: 'center',
            dataIndex: 'accountName',
            width: 200
          },
          {
            title: '银行账号',
            align: 'center',
            dataIndex: 'accountNo',
            width: 200
          },
          {
            title: '开户行',
            align: 'center',
            dataIndex: 'bankType',
            width: 150,
            customRender: (text) => {
              const enums = {
                cmb: '招商银行',
                icbc: '工商银行',
                abc: '农业银行',
                boc: '中国银行',
                ccb: '建设银行'
              }
              return enums[text] || text
            }
          }
        ]
        this.url.list = '/bankAccountConfig/list'
      }
    },
    open() {
      this.visible = true
      // 如果是项目主体，设置项目ID过滤条件
      if (this.accountType === 'customer' && this.proId) {
        this.queryParam.proId = this.proId
        this.queryParam.delFlag = '0'
      }
      this.loadData(1)
    },
    handleOk() {
      if (this.selectedRowKeys.length === 0) {
        this.$message.warning('请选择一个账户')
        return
      }
      this.selectAccount()
    },
    selectAccount() {
      const selectedRecord = this.dataSource.find(item => item.id === this.selectedRowKeys[0])
      if (selectedRecord) {
        // 如果是项目主体，使用 partyAName 作为 accountName
        if (this.accountType === 'customer' && selectedRecord.partyAName) {
          selectedRecord.accountName = selectedRecord.partyAName
        }
        this.$emit('select', selectedRecord)
        this.handleCancel()
      }
    },
    // 自定义行属性，点击行即可选择
    customRow(record) {
      return {
        on: {
          click: () => {
            this.selectedRowKeys = [record.id]
            this.selectAccount()
          }
        }
      }
    },
    handleCancel() {
      this.visible = false
      this.selectedRowKeys = []
      this.queryParam = {}
    },
    getQueryParams() {
      let sqp = {}
      if (this.superQueryParams) {
        sqp['superQueryParams'] = encodeURI(this.superQueryParams)
        sqp['superQueryMatchType'] = this.superQueryMatchType
      }
      var param = Object.assign({}, sqp, this.queryParam, this.isorter, this.filters)
      param.field = this.getQueryField()
      param.pageNo = this.ipagination.current
      param.pageSize = this.ipagination.pageSize
      return filterObj(param)
    },
    getQueryField() {
      return 'id,accountName,accountNo,bankType'
    }
  }
}
</script>

<style scoped></style>

