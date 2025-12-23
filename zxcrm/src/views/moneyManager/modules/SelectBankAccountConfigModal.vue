<template>
  <j-modal
    title="选择银行账户配置"
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
        :scroll="{ x: true }"
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
  name: 'SelectBankAccountConfigModal',
  mixins: [JeecgListMixin],
  data() {
    return {
      description: '选择银行账户配置',
      visible: false,
      // 查询条件
      queryParam: {},
      // 表头
      columns: [
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
          customRender: function(text) {
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
      ],
      url: {
        list: '/bankAccountConfig/list'
      }
    }
  },
  methods: {
    open() {
      this.visible = true
      this.loadData(1)
    },
    handleOk() {
      if (this.selectedRowKeys.length === 0) {
        this.$message.warning('请选择一个银行账户配置')
        return
      }
      this.selectAccount()
    },
    selectAccount() {
      const selectedRecord = this.dataSource.find(item => item.id === this.selectedRowKeys[0])
      if (selectedRecord) {
        // 只返回 id
        this.$emit('select', selectedRecord.id)
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

