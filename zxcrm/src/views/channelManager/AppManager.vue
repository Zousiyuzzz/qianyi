<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="渠道名称">
              <a-input placeholder="请输入渠道名称" v-model="queryParam.channelName"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="代理商">
              <a-input placeholder="请输入代理商" v-model="queryParam.agent"></a-input>
            </a-form-item>
          </a-col>
          <template v-if="toggleSearchStatus">
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="账号名称">
                <a-input placeholder="请输入账号名称" v-model="queryParam.accountName"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="开户账号">
                <a-input placeholder="请输入开户账号" v-model="queryParam.openAccount"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="应用名称">
                <a-input placeholder="请输入应用名称" v-model="queryParam.applyName"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="是否跑数据">
                <a-select placeholder="请选择是否跑数据" v-model="queryParam.isRunData" allowClear>
                  <a-select-option value="true">是</a-select-option>
                  <a-select-option value="false">否</a-select-option>
                </a-select>
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

    <!-- Tabs区域 -->
    <a-tabs v-model="activeTab" @change="handleTabChange" style="margin-bottom: 16px;">
      <a-tab-pane key="1" tab="常规">
        <!-- 正常类型的内容 -->
      </a-tab-pane>
      <a-tab-pane key="2" tab="服务费">
        <!-- 服务费类型的内容 -->
      </a-tab-pane>
    </a-tabs>

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button @click="handleAdd()" type="primary" icon="plus">新增</a-button>
      <a-button type="primary" icon="download" @click="handleExportXls('平台验证管理')">导出</a-button>
      <!-- <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl"
        @change="handleImportExcel">
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
          <a @click="handleScpoe(record)">授权</a>
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

    <tab-platformverify-modal ref="modalForm" @ok="modalFormOk"></tab-platformverify-modal>
  </a-card>
</template>

<script>
27, 122.5
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import TabPlatformverifyModal from './modules/TabPlatformverifyModal'
import DeveloperDraw from './DeveloperDraw'

export default {
  name: 'TabChannelList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    TabPlatformverifyModal,
    DeveloperDraw
  },
  data() {
    return {
      visible: false,
      modalWidth: 800,
      drawerWidth: 1600,
      modaltoggleFlag: true,
      confirmLoading: false,
      model: {},
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },

      queryParam: {
        channel_id: '',
        type: '1',
        isRunData: ''
      },
      activeTab: '1',
      columns: [
        // {
        //   title: 'id',
        //   align: "center",
        //   width: 100,
        //   dataIndex: 'id'
        // },
        {
          title: '类型',
          align: "center",
          dataIndex: 'type',
          width: 100,
          customRender: function (t, r, index) {
            return r.type == '1' ? '正常' : '服务费'
          }
        },
        {
          title: '渠道',
          align: "center",
          dataIndex: 'channelName',
          width: 200
        },
        // {
        //   title: '渠道标识(平台应用)',
        //   align: "center",
        //   dataIndex: 'channelSign'
        // },
        {
          title: '应用名称',
          align: "center",
          width: 200,
          dataIndex: 'applyName'
        },
        {
          title: '应用ID',
          align: "center",
          width: 100,
          dataIndex: 'applyId'
        },
        {
          title: '授权状态',
          align: "center",
          width: 200,
          dataIndex: 'state',
          customRender: function (t, r, index) {
            return r.state == 0 ? '已授权' : '未授权'
          }
        },
        {
          title: '代理商ID',
          align: "center",
          width: 100,
          dataIndex: 'agentId'
        },
        {
          title: 'refresh_token',
          align: "center",
          width: 200,
          dataIndex: 'refreshToken'
        },
        {
          title: 'access_token',
          align: "center",
          width: 200,
          dataIndex: 'accessToken'
        },
        {
          title: '账号ID',
          align: "center",
          width: 100,
          dataIndex: 'accountId'
        },
        {
          title: '账号名称',
          align: "center",
          width: 200,
          dataIndex: 'accountName'
        },
        {
          title: '开户账号',
          align: "center",
          width: 200,
          dataIndex: 'openAccount'
        },
        {
          title: '应用密钥',
          align: "center",
          width: 200,
          dataIndex: 'applyCipher'
        },
        {
          title: '是否跑数据',
          align: "center",
          width: 120,
          dataIndex: 'isRunData',
          customRender: function (t, r, index) {
            return r.isRunData === 'true' || r.isRunData === true ? '是' : '否'
          }
        },
        {
          title: '状态',
          align: "center",
          dataIndex: 'delFlag',
          customRender: function (t, r, index) {
            return r.delFlag == 0 ? '正常' : '已删除'
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
        list: "/platformverify/list",
        delete: "/platformverify/delete",
        deleteBatch: "/platformverify/deleteBatch",
        exportXlsUrl: "/platformverify/exportXls",
        importExcelUrl: "platformverify/importExcel",

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
    show(id) {
      this.visible = true;
      this.channel_id = id
      this.queryParam.channelId = id
      this.queryParam.type = '1'
      this.activeTab = '1'
      this.resetScreenSize();
      this.searchQuery()
    },
    //窗口最大化切换
    toggleScreen() {
      if (this.modaltoggleFlag) {
        this.modalWidth = window.innerWidth;
      } else {
        this.modalWidth = 800;
      }
      this.modaltoggleFlag = !this.modaltoggleFlag;
    },
    // 根据屏幕变化,设置抽屉尺寸
    resetScreenSize() {
      let screenWidth = document.body.clientWidth;
      if (screenWidth < 500) {
        this.drawerWidth = screenWidth;
      } else {
        this.drawerWidth = 1600;
      }
    },
    close() {
      this.$emit('close');
      this.visible = false;
    },
    handleCancel() {
      this.close()
    },
    handleScpoe({ url }) {
      window.open(url, '_blank');
    },
    handleTabChange(activeKey) {
      this.activeTab = activeKey;
      this.queryParam.type = activeKey;
      this.searchQuery();
    },
    initDictConfig() {
    },
    getSuperFieldList() {
      let fieldList = [];
      // fieldList.push({ type: 'int', value: 'delFlag', text: '删除标识（0：未删除1：已删除）', dictCode: '' })
      fieldList.push({ type: 'string', value: 'type', text: '类型（1：正常2：服务费）', dictCode: '' })
      fieldList.push({ type: 'string', value: 'channelId', text: '渠道ID', dictCode: '' })
      fieldList.push({ type: 'string', value: 'channelName', text: '渠道名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'agent', text: '代理商', dictCode: '' })
      fieldList.push({ type: 'string', value: 'agentId', text: '代理商ID', dictCode: '' })
      fieldList.push({ type: 'string', value: 'accountId', text: '账号ID', dictCode: '' })
      fieldList.push({ type: 'string', value: 'accountName', text: '账号名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'openAccount', text: '开户账号', dictCode: '' })
      fieldList.push({ type: 'string', value: 'applyId', text: '应用ID', dictCode: '' })
      fieldList.push({ type: 'string', value: 'applyName', text: '应用名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'applyCipher', text: '应用密钥', dictCode: '' })
      fieldList.push({ type: 'string', value: 'accessToken', text: 'access_token', dictCode: '' })
      fieldList.push({ type: 'string', value: 'refreshToken', text: 'refresh_token', dictCode: '' })
      fieldList.push({ type: 'string', value: 'isRunData', text: '是否跑数据(true/false)', dictCode: '' })
      this.superFieldList = fieldList
    }
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>