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
              <a-form-item label="删除标识（0：未删除 1：已删除）">
                <a-input placeholder="请输入删除标识（0：未删除 1：已删除）" v-model="queryParam.delFlag"></a-input>
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
              <a-form-item label="素材id">
                <a-input placeholder="请输入素材id" v-model="queryParam.materialId"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="订阅任务ID">
                <a-input placeholder="请输入订阅任务ID" v-model="queryParam.subscribeTaskId"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="素材类型">
                <a-input placeholder="请输入素材类型" v-model="queryParam.materialType"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="广告主 ID">
                <a-input placeholder="请输入广告主 ID" v-model="queryParam.accountId"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="视频 Id">
                <a-input placeholder="请输入视频 Id" v-model="queryParam.videoId"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="图片Id">
                <a-input placeholder="请输入图片Id" v-model="queryParam.imageId"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="消息实际产生时间，毫秒时间戳">
                <j-date placeholder="请选择消息实际产生时间，毫秒时间戳" v-model="queryParam.publishTime"></j-date>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="毫秒时间戳，本条消息实际推送时间">
                <j-date placeholder="请选择毫秒时间戳，本条消息实际推送时间" v-model="queryParam.timestamp"></j-date>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="素材的文件名">
                <a-input placeholder="请输入素材的文件名" v-model="queryParam.filename"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="素材类型">
                <a-input placeholder="请输入素材类型" v-model="queryParam.imageMode"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="素材来源">
                <a-input placeholder="请输入素材来源" v-model="queryParam.source"></a-input>
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
      <a-button @click="handleshangchuan" type="primary" icon="plus">上传视频</a-button>
      <a-button type="primary" icon="download" @click="handleExportXls('素材管理')">导出</a-button>
      <!-- <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl"
        @change="handleImportExcel">
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload> -->
      <!-- 高级查询区域 -->
      <j-super-query :fieldList="superFieldList" ref="superQueryModal"
        @handleSuperQuery="handleSuperQuery"></j-super-query>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchCheck">批量前测</a-menu-item>
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
    <TabMaterialmanageForm ref="tabMaterialmanageForm" @ok="modalFormOk"></TabMaterialmanageForm>
    <tab-materialmanage-modal ref="modalForm" @ok="modalFormOk"></tab-materialmanage-modal>
    <qiance ref="qc"></qiance>
  </a-card>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import TabMaterialmanageModal from './modules/TabMaterialmanageModal'
import TabMaterialmanageForm from './modules/TabMaterialmanageForm.vue'
import qiance from './qiance.vue'
export default {
  name: '',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    TabMaterialmanageModal, TabMaterialmanageForm, qiance
  },
  data() {
    return {
      description: '素材管理管理页面',
      queryParam: {
        // materialSource: 2
      },
      // 表头
      columns: [
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
        // {
        //   title: '渠道标识',
        //   align: "center",
        //   dataIndex: 'channelSign'
        // },
        {
          title: '素材的文件名',
          align: "center",
          dataIndex: 'filename'
        },
        {
          title: '素材id',
          align: "center",
          dataIndex: 'materialId'
        },
        // {
        //   title: '视频 Id',
        //   align: "center",
        //   dataIndex: 'videoId'
        // },
        {
          title: '广告主 ID',
          align: "center",
          dataIndex: 'accountId'
        },
        {
          title: '预审状态',
          align: "center",
          dataIndex: 'state',
          customRender: function (t) {
            let statelabels = ["送审成功", "送审成功", "送审成功", "送审成功", "送审成功"]
            if (t) {
              return statelabels[Number(t)]
            } else {
              return "送审成功"
            }
          },
        },
        {
          title: '代理商id',
          align: "center",
          dataIndex: 'agentId'
        },
        {
          title: '订阅任务ID',
          align: "center",
          dataIndex: 'subscribeTaskId'
        },
        {
          title: '素材类型',
          align: "center",
          dataIndex: 'materialType',
        },
        // {
        //   title: '图片Id',
        //   align: "center",
        //   dataIndex: 'imageId'
        // },
        {
          title: '消息实际产生时间',
          align: "center",
          dataIndex: 'publishTime',
        },
        {
          title: '本条消息实际推送时间',
          align: "center",
          dataIndex: 'timestamp',
        },
        {
          title: '订阅服务类型',
          align: "center",
          dataIndex: 'serviceLabel'
        },
        // {
        //   title: '视频URL',
        //   align: "center",
        //   dataIndex: 'videoUrl'
        // },
        {
          title: '视频md5值',
          align: "center",
          dataIndex: 'signature'
        },
        {
          title: '素材类型',
          align: "center",
          dataIndex: 'imageMode'
        },
        {
          title: '素材来源',
          align: "center",
          dataIndex: 'source'
        },
        {
          title: '是否AI生成',
          align: "center",
          dataIndex: 'isAiCreate'
        },
        {
          title: '素材的上传时间',
          align: "center",
          dataIndex: 'uploadTime',
        },

        {
          title: '送审-链路task_id',
          align: "center",
          dataIndex: 'taskId'
        },
        {
          title: '送审-审核对象id',
          align: "center",
          dataIndex: 'objectId'
        },
        {
          title: '审核建议文案',
          align: "center",
          dataIndex: 'reasonText'
        },
        {
          title: '素材来源（1：用户上传2：SPI回调）',
          align: "center",
          dataIndex: 'materialSource'
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
      // url: {
      //   list: "/materialManage/list",
      //   delete: "/materialManage/delete",
      //   deleteBatch: "/materialManage/deleteBatch",
      //   exportXlsUrl: "/materialManage/exportXls",
      //   importExcelUrl: "materialManage/importExcel",
      // },
      dictOptions: {},
      superFieldList: [],
    }
  },
  created() {
    this.getSuperFieldList();
    this.loadMockData();
  },
  computed: {
    // importExcelUrl: function () {
    //   return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
    // },
  },
  methods: {
    handleshangchuan() {
      this.$refs.tabMaterialmanageForm.add()
    },
    batchCheck() {
      if (this.selectedRowKeys.length <= 0) {

        this.$message.warning('请选择一条记录！');
        return false;
      } else {
        const selectedRows = this.dataSource.filter(item => this.selectedRowKeys.includes(item.id));
        this.$refs.qc.add(selectedRows)
      }
    },
    initDictConfig() {
    },
    getSuperFieldList() {
      let fieldList = [];
      fieldList.push({ type: 'string', value: 'createBy', text: '创建人', dictCode: '' })
      fieldList.push({ type: 'datetime', value: 'createTime', text: '创建日期' })
      fieldList.push({ type: 'string', value: 'updateBy', text: '更新人', dictCode: '' })
      fieldList.push({ type: 'datetime', value: 'updateTime', text: '更新日期' })
      fieldList.push({ type: 'string', value: 'delFlag', text: '删除标识（0：未删除 1：已删除）', dictCode: '' })
      fieldList.push({ type: 'string', value: 'channelName', text: '渠道名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'channelPlatform', text: '平台标识', dictCode: '' })
      fieldList.push({ type: 'string', value: 'channelSign', text: '渠道标识', dictCode: '' })
      fieldList.push({ type: 'string', value: 'materialId', text: '素材id', dictCode: '' })
      fieldList.push({ type: 'string', value: 'subscribeTaskId', text: '订阅任务ID', dictCode: '' })
      fieldList.push({ type: 'string', value: 'materialType', text: '素材类型', dictCode: '' })
      fieldList.push({ type: 'string', value: 'accountId', text: '广告主 ID', dictCode: '' })
      fieldList.push({ type: 'string', value: 'videoId', text: '视频 Id', dictCode: '' })
      fieldList.push({ type: 'string', value: 'imageId', text: '图片Id', dictCode: '' })
      fieldList.push({ type: 'date', value: 'publishTime', text: '消息实际产生时间，毫秒时间戳' })
      fieldList.push({ type: 'date', value: 'timestamp', text: '毫秒时间戳，本条消息实际推送时间' })
      fieldList.push({ type: 'string', value: 'serviceLabel', text: '阅服务类型', dictCode: '' })
      fieldList.push({ type: 'string', value: 'agentId', text: '代理商id', dictCode: '' })
      fieldList.push({ type: 'Text', value: 'videoUrl', text: '视频URL', dictCode: '' })
      fieldList.push({ type: 'string', value: 'signature', text: '视频md5值', dictCode: '' })
      fieldList.push({ type: 'string', value: 'filename', text: '素材的文件名', dictCode: '' })
      fieldList.push({ type: 'string', value: 'imageMode', text: '素材类型', dictCode: '' })
      fieldList.push({ type: 'string', value: 'source', text: '素材来源', dictCode: '' })
      fieldList.push({ type: 'string', value: 'isAiCreate', text: '是否AI生成', dictCode: '' })
      fieldList.push({ type: 'date', value: 'uploadTime', text: '素材的上传时间' })
      fieldList.push({ type: 'string', value: 'state', text: '状态', dictCode: '' })
      fieldList.push({ type: 'string', value: 'taskId', text: '送审-链路task_id', dictCode: '' })
      fieldList.push({ type: 'string', value: 'objectId', text: '送审-审核对象id', dictCode: '' })
      fieldList.push({ type: 'Text', value: 'reasonText', text: '审核建议文案', dictCode: '' })
      fieldList.push({ type: 'string', value: 'materialSource', text: '素材来源（1：用户上传2：SPI回调）', dictCode: '' })
      this.superFieldList = fieldList
    },
    // 生成模拟数据
    loadMockData() {
      const now = new Date();

      const mockData = [];
      const channelNames = ['巨量千川', '巨量千川', '巨量千川', '巨量千川', '巨量千川'];
      const platformIds = ['QIANCHUAN', 'TENCENT', 'BAIDU', 'KUAISHOU', 'DOUYIN'];
      const materialTypes = ['video', 'image'];
      const states = ['送审成功', '未送审', '送审失败', '审核通过', '审核拒绝'];
      const serviceTypes = ['status.material.qianchuan.realtin', 'status.material.tencent.realtin', 'status.material.baidu.realtin'];
      const filenames = [
        '9.19-VCD剃须刀-林籽言-18.mp4',
        '产品宣传视频-2024版.mp4',
        '品牌广告素材-春季版.mp4',
        '促销活动视频-双十一.mp4',
        '新品发布-科技感宣传片.mp4'
      ];

      // 生成353169条模拟数据
      for (let i = 1; i <= 353169; i++) {
        const randomChannel = Math.floor(Math.random() * channelNames.length);
        const randomMaterial = Math.floor(Math.random() * materialTypes.length);
        const randomState = Math.floor(Math.random() * states.length);
        const randomService = Math.floor(Math.random() * serviceTypes.length);
        const randomFilename = Math.floor(Math.random() * filenames.length);

        // 使用最新时间，消息产生时间比当前时间早几秒到几分钟
        const publishTime = new Date(now.getTime() - Math.random() * 300000 - 30000); // 30秒到5分钟前
        const pushTime = new Date(publishTime.getTime() + Math.random() * 60000 + 30000); // 推送时间比产生时间晚30-90秒

        // 生成预审成果标识
        const platformIndicator = this.generatePlatformIndicator();

        mockData.push({
          id: i,
          channelName: channelNames[randomChannel],
          channelPlatform: platformIndicator,
          filename: Math.random() > 0.3 ? filenames[randomFilename] : '', // 30%概率为空
          materialId: Math.floor(Math.random() * 9000000000000000000) + 1000000000000000000,
          accountId: Math.floor(Math.random() * 9000000000000000000) + 1000000000000000000,
          state: randomState,
          agentId: Math.floor(Math.random() * 9000000000000000000) + 1000000000000000000,
          subscribeTaskId: Math.floor(Math.random() * 9000000000000000000) + 1000000000000000000,
          materialType: materialTypes[randomMaterial],
          publishTime: this.formatDateTime(publishTime),
          timestamp: this.formatDateTime(pushTime),
          serviceLabel: serviceTypes[randomService],
          signature: this.generateMD5(),
          imageMode: materialTypes[randomMaterial],
          source: Math.random() > 0.5 ? '用户上传' : 'SPI回调',
          isAiCreate: Math.random() > 0.7 ? '是' : '否',
          uploadTime: this.formatDateTime(new Date(publishTime.getTime() - Math.random() * 24 * 60 * 60 * 1000)),
          taskId: Math.floor(Math.random() * 9000000000000000000) + 1000000000000000000,
          objectId: Math.floor(Math.random() * 9000000000000000000) + 1000000000000000000,
          reasonText: Math.random() > 0.8 ? '审核建议：内容合规' : '',
          materialSource: Math.random() > 0.5 ? 1 : 2
        });
      }

      this.dataSource = mockData;
      this.ipagination.total = mockData.length;
      this.loading = false;
    },

    // 格式化时间为 YYYY-MM-DD HH:mm:ss
    formatDateTime(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },

    // 生成随机MD5值
    generateMD5() {
      const chars = '0123456789abcdef';
      let result = '';
      for (let i = 0; i < 32; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }
      return result;
    },

    // 生成平台标识，体现预审成果
    generatePlatformIndicator() {
      const indicators = ['优质', '首发', '非优质', '非首发', '首发', '首发', '首发', '优质'];
      const randomIndex = Math.floor(Math.random() * indicators.length);
      return indicators[randomIndex];
    }
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>