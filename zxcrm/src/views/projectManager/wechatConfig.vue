<template>
  <a-card :bordered="false">
    <!-- 微信功能配置查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="微信群/好友名称">
              <a-input placeholder="请输入微信群/好友名称" v-model="queryParam.chatName"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="功能">
              <j-dict-select-tag placeholder="请选择功能" v-model="queryParam.functionName"
                dictCode="wechat_function_name" />
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="项目">
              <JSearchSelectTag placeholder="请选择项目" v-model="queryParam.proId"
                dict="tab_projectManage,pro_name,id,del_flag = '0'" async allowClear />
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="微信名称">
              <a-input placeholder="请输入微信名称" v-model="queryParam.wechatName"></a-input>
            </a-form-item>
          </a-col>
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

    <!-- 微信功能配置操作按钮区域 -->
    <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
      <!-- <a-button type="primary" icon="download" @click="handleExportXls('微信功能配置')">导出</a-button>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete" />删除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
      </a-dropdown> -->
    </div>

    <!-- 微信功能配置表格区域 -->
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

        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>
          <a-divider type="vertical" />
          <a @click="handleTestSend(record)">测试发送</a>
          <a-divider type="vertical" />
          <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
            <a>删除</a>
          </a-popconfirm>
        </span>
      </a-table>
    </div>

    <!-- 模态框 -->
    <wechat-config-modal ref="modalForm" @ok="modalFormOk"></wechat-config-modal>
  </a-card>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { postAction } from '@/api/manage'
import WechatConfigModal from './modules/WechatConfigModal'

export default {
  name: 'WechatConfig',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    WechatConfigModal
  },
  data() {
    return {
      toggleSearchStatus: false,
      description: '微信功能配置管理页面',

      // 微信功能配置表格列
      columns: [
        {
          title: '微信群/好友名称',
          dataIndex: 'chatName',
          align: "center",
          width: 200,
          ellipsis: true
        },
        {
          title: '功能',
          dataIndex: 'functionName_dictText',
          align: "center",
          width: 150,
          ellipsis: true
        },
        {
          title: '微信地址',
          dataIndex: 'wechatAddress',
          align: "center",
          width: 200,
          ellipsis: true
        },
        {
          title: '微信名称',
          dataIndex: 'wechatName',
          align: "center",
          width: 150,
          ellipsis: true
        },
        {
          title: '项目',
          dataIndex: 'proId_dictText',
          align: "center",
          ellipsis: true,
          customRender: (text) => {
            return text ? (
              <a-tooltip title={text}>
                <span style="display: inline-block; width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  {text}
                </span>
              </a-tooltip>
            ) : text
          }
        },
        // {
        //   title: '项目ID',
        //   dataIndex: 'proId_unique_id',
        //   align: "center",
        //   width: 150,
        //   ellipsis: true
        // },
        {
          title: '创建人',
          dataIndex: 'createBy',
          align: "center",
          width: 150,
          ellipsis: true
        },
        {
          title: '创建日期',
          dataIndex: 'createTime',
          align: "center",
          // width: 180,
          customRender: function (text) {
            return !text ? "" : (text.length > 10 ? text.substr(0, 10) : text)
          }
        },
        // {
        //   title: '更新人',
        //   dataIndex: 'updateBy',
        //   align: "center",
        //   width: 150,
        //   ellipsis: true
        // },
        // {
        //   title: '更新日期',
        //   dataIndex: 'updateTime',
        //   align: "center",
        //   width: 180,
        //   customRender: function (text) {
        //     return !text ? "" : (text.length > 10 ? text.substr(0, 10) : text)
        //   }
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

      // 接口URL配置
      url: {
        list: "/wechatFunctionConfig/list",
        delete: "/wechatFunctionConfig/delete",
        deleteBatch: "/wechatFunctionConfig/deleteBatch",
        exportXlsUrl: "/wechatFunctionConfig/exportXls",
        importExcelUrl: "wechatFunctionConfig/importExcel",
      },
      dictOptions: {},
      superFieldList: [],
      // 添加必要的字段
      fieldNullList: [],
      userRoles: []
    }
  },
  methods: {
    // 切换搜索展开/收起
    handleToggleSearch() {
      this.toggleSearchStatus = !this.toggleSearchStatus
    },

    // 初始化字典配置
    initDictConfig() {
    },

    // 获取超级查询字段列表
    getSuperFieldList() {
      let fieldList = [];
      fieldList.push({ type: 'string', value: 'chatName', text: '微信群/好友名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'functionName', text: '功能', dictCode: '' })
      fieldList.push({ type: 'string', value: 'wechatAddress', text: '微信地址', dictCode: '' })
      fieldList.push({ type: 'string', value: 'wechatName', text: '微信名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'proId', text: '项目', dictCode: '' })
      fieldList.push({ type: 'string', value: 'createBy', text: '创建人', dictCode: '' })
      fieldList.push({ type: 'date', value: 'createTime', text: '创建日期' })
      this.superFieldList = fieldList
    },

    // 重写loadData方法以使用当前tab的列
    loadData(arg) {
      if (!this.url.list) {
        this.$message.error("请设置url.list属性!")
        return
      }
      // 加载数据 若传入参数1则加载第一页的内容
      if (arg === 1) {
        this.ipagination.current = 1
      }
      var params = this.getQueryParams() // 查询条件
      this.loading = true
      this.$http.get(this.url.list, {
        params: params
      }).then((res) => {
        if (res.success) {
          this.dataSource = res.result.records || res.result
          if (res.result.total) {
            this.ipagination.total = res.result.total
          }
        } else {
          this.$message.warning(res.message)
        }
      }).finally(() => {
        this.loading = false
      })
    },

    // 模态框相关方法
    handleAdd() {
      this.$refs.modalForm.add()
    },
    handleEdit(record) {
      this.$refs.modalForm.edit(record)
    },
    modalFormOk() {
      this.loadData()
    },
    // 测试发送
    handleTestSend(record) {
      if (!record.id) {
        this.$message.warning('记录ID不存在')
        return
      }
      const formData = new FormData()
      formData.append('id', record.id)
      postAction('/wechatFunctionConfig/testSend', formData).then((res) => {
        if (res.success) {
          this.$message.success('测试发送成功')
        } else {
          this.$message.error(res.message || '测试发送失败')
        }
      }).catch((error) => {
        this.$message.error('测试发送失败')
        console.error(error)
      })
    }
  },
  created() {
    this.getSuperFieldList()
  }
}
</script>

<style scoped>
@import '~@assets/less/common.less';

/* 表格样式优化 */
.j-table-force-nowrap {
  .ant-table-tbody>tr>td {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
