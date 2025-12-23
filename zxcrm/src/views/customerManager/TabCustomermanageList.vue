<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="客户主体">
              <a-input placeholder="请输入客户主体" v-model="queryParam.customerName"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="商务">
              <JSearchSelectTag placeholder="请选择商务名称" v-model:value="queryParam.businessPerson"
                :dictOptions="swdictOptions" :allowClear="false">
              </JSearchSelectTag>
            </a-form-item>
          </a-col>
          <!--operationType  运营方式(1:自运营2:走量3:收量)-->
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
      <a-button type="primary" icon="download" @click="handleExportXls('客户管理')">导出</a-button>
      <!-- <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl"
        @change="handleImportExcel">
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload> -->
      <!-- 高级查询区域 -->
      <!-- <j-super-query :fieldList="superFieldList" ref="superQueryModal"
        @handleSuperQuery="handleSuperQuery"></j-super-query>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete" />删除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
      </a-dropdown> -->
    </div>

    <!-- table区域-begin -->
    <div>
      <!-- <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{
          selectedRowKeys.length }}</a>项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div> -->

      <a-table ref="table" size="middle" :scroll="{ x: true }" bordered rowKey="id" :columns="columns"
        :dataSource="dataSource" :pagination="ipagination" :loading="loading"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        class="j-table-force-nowrap customer-table" @change="handleTableChange">

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
          <a @click="handleDetail(record)">详情</a>
          <a-divider type="vertical" />
          <a @click="handleConsume(record)">回款状态</a>
        </span>

      </a-table>
    </div>

    <tab-customermanage-modal ref="modalForm" @ok="modalFormOk"></tab-customermanage-modal>
    <rebate-drawer ref="rebateDrawer"></rebate-drawer>
    <consume-drawer ref="consumeDrawer"></consume-drawer>
    <customer-update-log-modal :visible="updateLogModalVisible" :customerId="updateLogCustomerId"
      @cancel="handleUpdateLogCancel" />
    <customer-detail-modal ref="customerDetailModal" @refresh="handleRefresh"></customer-detail-modal>
  </a-card>
</template>

<script>
import RebateDrawer from './RebateDrawer.vue'
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import TabCustomermanageModal from './modules/TabCustomermanageModal'
import ConsumeDrawer from './ConsumeDrawer.vue'
import CustomerUpdateLogModal from './modules/CustomerUpdateLogModal.vue'
import CustomerDetailModal from './modules/CustomerDetailModal.vue'
import JDictNameDisplay from '@/components/dict/JDictNameDisplay.vue'
import { ajaxGetDictItems, getDictItemsFromCache } from '@/api/api'
import { queryDepartTreeList } from '@/api/api'
import { httpAction } from '@/api/manage'

export default {
  name: 'TabCustomermanageList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    TabCustomermanageModal,
    RebateDrawer,
    ConsumeDrawer,
    CustomerUpdateLogModal,
    CustomerDetailModal,
    JDictNameDisplay
  },
  data() {
    return {
      swdictOptions: [],
      description: '客户管理管理页面',
      // 表头
      columns: [
        {
          title: '客户ID',
          align: "center",
          dataIndex: 'id',
          width: 80,
          ellipsis: true
        },
        // {
        //   title: '客户ID',
        //   align: "center",
        //   dataIndex: 'sustomerUnique'
        // },
        {
          title: '客户主体',
          align: "center",
          dataIndex: 'customerName',
          isLike: true,
          minWidth: 200,
          ellipsis: true
        },
        {
          title: '商务',
          align: "center",
          dataIndex: 'salesPerson_dictText',
          minWidth: 100,
          ellipsis: true
        },
        {
          title: '运营方式',
          align: "center",
          dataIndex: 'projectsByClientDistinctOnOperationModes',
          minWidth: 120,
          ellipsis: true,
          customRender: (text, record) => {
            if (!record.projectsByClientDistinctOnOperationModes || !Array.isArray(record.projectsByClientDistinctOnOperationModes)) {
              return '-';
            }

            // 运营方式字典映射
            const operationModeMap = {
              '1': '自运营',
              '2': '走量',
              '3': '收量'
            };

            const modes = record.projectsByClientDistinctOnOperationModes.map(mode => operationModeMap[mode] || mode);
            // 去重并保持顺序
            const uniqueModes = [...new Set(modes)];
            return uniqueModes.join('、');
          }
        },
        {
          title: '已合作渠道',
          align: "center",
          dataIndex: 'lastConsumeTimeByProjectChannels',
          minWidth: 180,
          ellipsis: true,
          customRender: (text, record) => {
            if (!record.lastConsumeTimeByProjectChannels || !Array.isArray(record.lastConsumeTimeByProjectChannels)) {
              return '-';
            }

            // 提取所有渠道标识并去重
            const channelSigns = record.lastConsumeTimeByProjectChannels
              .map(channel => channel.channel_sign)
              .filter(sign => sign) // 过滤掉空值
              .filter((sign, index, arr) => arr.indexOf(sign) === index); // 去重

            // 将渠道标识转换为渠道名称
            const channelNames = channelSigns.map(sign => this.getChannelDisplayName(sign));
            const showText = channelNames.join('、');
            return showText ? (
              <a-tooltip title={showText}>
                <span style="display: inline-block; width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  {showText}
                </span>
              </a-tooltip>
            ) : showText
          }
        },
        {
          title: '合作状态',
          align: "center",
          dataIndex: 'cooperationStatus',
          width: 100,
          ellipsis: true,
          customRender: (text, record) => {
            if (!record.lastConsumeTimeByProjectChannels || !Array.isArray(record.lastConsumeTimeByProjectChannels)) {
              return <span style={{ color: '#69c0ff', fontWeight: 'bold' }}>待消耗</span>;
            }
            return this.getChannelStatusSummary(record.lastConsumeTimeByProjectChannels);
          }
        },
        // {
        //   title: 'AE',
        //   align: "center",
        //   dataIndex: 'aePerson_dictText'
        // },
        // {
        //   title: "返点",
        //   align: "center",
        //   dataIndex: 'customerRebates',
        //   customRender: (text, record) => {
        //     if (!record.customerRebates || !Array.isArray(record.customerRebates)) {
        //       return '-';
        //     }

        //     const currentDate = new Date();
        //     // 找到当前生效的返点记录
        //     const activeRebate = record.customerRebates.find(rebate => {
        //       const effectiveDate = new Date(rebate.effectiveDate);
        //       // 如果没有结束日期，则只要开始日期小于等于当前日期就生效
        //       if (!rebate.nextEffectiveDate) {
        //         return currentDate >= effectiveDate;
        //       }
        //       const nextEffectiveDate = new Date(rebate.nextEffectiveDate);
        //       return currentDate >= effectiveDate && currentDate <= nextEffectiveDate;
        //     });

        //     if (!activeRebate) {
        //       return '-';
        //     }

        //     return (
        //       <div>
        //         <div style={{ color: '#666' }}>
        //           {activeRebate.effectiveDate} {activeRebate.nextEffectiveDate ? `-- ${activeRebate.nextEffectiveDate}` : '-- 至今'} |
        //           对公: {activeRebate.externalRebate ? (activeRebate.externalRebate * 100).toFixed(2) + '%' : '-'} |
        //           对私: {activeRebate.privateRebate ? (activeRebate.privateRebate * 100).toFixed(2) + '%' : '-'}
        //         </div>
        //       </div>
        //     );
        //   }
        // },
        // {
        //   title: '回款间隔天数',
        //   align: "center",
        //   dataIndex: 'intervalDays'
        // },
        // {
        //   title: '实际还款日期',
        //   align: "center",
        //   dataIndex: 'repaymentDate'
        // },
        // {
        //   title: '开票日期',
        //   align: "center",
        //   dataIndex: 'billingDate'
        // },
        // {
        //   title: '是否服务费',
        //   align: "center",
        //   dataIndex: 'isGratuity_dictText'
        // },
        // {
        //   title: '客户初始行业',
        //   align: "center",
        //   dataIndex: 'industry'
        // },
        // {
        //   title: '客户属性',
        //   align: "center",
        //   dataIndex: 'attribute_dictText'
        // },
        // {
        //   title: '客户产品',
        //   align: "center",
        //   dataIndex: 'products'
        // },
        // {
        //   title: '运营模式',
        //   align: "center",
        //   dataIndex: 'operationMode_dictText'
        // },
        // {
        //   title: '标签',
        //   align: "center",
        //   dataIndex: 'labels'
        // },
        // {
        //   title: '投放媒体',
        //   align: "center",
        //   dataIndex: 'mediaPlacement'
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
        list: "/customerManage/list",
        delete: "/customerManage/delete",
        deleteBatch: "/customerManage/deleteBatch",
        exportXlsUrl: "/customerManage/exportXls",
        importExcelUrl: "customerManage/importExcel",

      },
      dictOptions: {},
      superFieldList: [],
      updateLogModalVisible: false,
      updateLogCustomerId: '',
      channelDictOptions: [], // 渠道字典选项
      swdictOptions: [], // 商务字典选项
      // 用户ID和真实姓名组合数据
      userIdAndRealnameList: [],
    }
  },
  created() {
    this.getSuperFieldList();
    this.initChannelDictData();
    this.getBusinessPersonList();
    this.getUserIdAndRealnameCombination();
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
      fieldList.push({ type: 'string', value: 'customerName', text: '客户名称', dictCode: '' })
      // fieldList.push({ type: 'string', value: 'customerState', text: '客户合作状态', dictCode: '' })
      fieldList.push({ type: 'Text', value: 'sustomerUnique', text: '客户标识', dictCode: '' })
      fieldList.push({ type: 'string', value: 'salesPerson', text: '销售', dictCode: '' })
      fieldList.push({ type: 'string', value: 'abPerson', text: 'AE', dictCode: '' })
      fieldList.push({ type: 'number', value: 'paymentDate', text: '客户承诺回款日期' })
      fieldList.push({ type: 'number', value: 'repaymentDate', text: '实际还款日期' })
      fieldList.push({ type: 'number', value: 'billingDate', text: '开票日期', dictCode: '' })
      fieldList.push({ type: 'select', value: 'isGratuity', text: '是否服务费', dictCode: 'customer_isGratuity' })
      fieldList.push({ type: 'string', value: 'industry', text: '客户初始行业', dictCode: '' })
      fieldList.push({ type: 'select', value: 'attribute', text: '客户属性', dictCode: 'customer_attribute' })
      fieldList.push({ type: 'string', value: 'products', text: '客户产品', dictCode: '' })
      fieldList.push({ type: 'select', value: 'operationMode', text: '运营模式', dictCode: 'custoer_operationMode' })
      fieldList.push({ type: 'string', value: 'aaa', text: '标签', dictCode: '' })
      fieldList.push({ type: 'string', value: 'mediaPlacement', text: '投放媒体', dictCode: '' })
      this.superFieldList = fieldList
    },
    handleRebate({ id }) {
      this.$refs['rebateDrawer'].show(id)
    },
    handleConsume({ id }) {
      this.$refs['consumeDrawer'].show(id)
    },
    handleUpdateLog(record) {
      this.updateLogCustomerId = record.id
      this.updateLogModalVisible = true
    },
    handleUpdateLogCancel() {
      this.updateLogModalVisible = false
    },
    // 显示客户详情
    handleDetail(record) {
      this.$refs.customerDetailModal.show(record, this.userIdAndRealnameList);
    },
    // 刷新列表（从详情弹窗触发）
    handleRefresh() {
      this.loadData(1);
    },
    // 初始化渠道字典数据
    initChannelDictData() {
      // 优先从缓存中读取字典配置
      if (getDictItemsFromCache('channelSign_system')) {
        this.channelDictOptions = getDictItemsFromCache('channelSign_system');
        return;
      }

      // 根据字典Code, 初始化字典数组
      ajaxGetDictItems('channelSign_system', null).then((res) => {
        if (res.success) {
          this.channelDictOptions = res.result;
        }
      });
    },
    // 获取商务人员列表
    getBusinessPersonList() {
      queryDepartTreeList().then((res) => {
        if (res.success) {
          let treeData = [];
          for (let i = 0; i < res.result.length; i++) {
            let temp = res.result[i];
            treeData.push(temp);
          }

          // 商务部门字典ID
          const businessDictId = '1955203485702369281';

          // 获取商务部门ID列表
          httpAction('/sys/dictItem/list', {
            pageNo: 1,
            pageSize: 100,
            dictId: businessDictId,
            field: 'id,,itemText,itemValue,action'
          }, "GET").then((res) => {
            if (res.success) {
              const businessDeptIds = res.result.records.map(item => item.itemValue);

              // 查找部门树中的节点
              const foundNodes = this.findNodesByIds(treeData, businessDeptIds);

              // 获取商务人员数据
              httpAction('/sys/user/getUerByDepIds', {
                ids: foundNodes.join(',')
              }, 'post').then((res) => {
                if (res.success) {
                  this.swdictOptions = res.result.map(item => {
                    return {
                      text: item.realname,
                      value: item.id
                    };
                  });
                } else {
                  this.$message.warning(res.message);
                }
              });
            } else {
              this.$message.warning(res.message);
            }
          });
        }
      });
    },
    // 在树形数据中查找指定多个ID的对象及其所有子节点，只返回id数组
    findNodesByIds(treeData, targetIds) {
      const resultSet = new Set();
      const idSet = new Set(targetIds);

      const traverse = (nodes) => {
        if (!nodes || !Array.isArray(nodes)) return;

        for (const node of nodes) {
          if (idSet.has(node.id)) {
            resultSet.add(node.id);
            if (node.children && Array.isArray(node.children)) {
              addAllChildren(node.children, resultSet);
            }
          } else {
            if (node.children && Array.isArray(node.children)) {
              traverse(node.children);
            }
          }
        }
      };

      const addAllChildren = (children, resultSet) => {
        for (const child of children) {
          resultSet.add(child.id);
          if (child.children && Array.isArray(child.children)) {
            addAllChildren(child.children, resultSet);
          }
        }
      };

      traverse(treeData);
      return Array.from(resultSet);
    },
    // 获取渠道显示名称
    getChannelDisplayName(channelSign) {
      if (!channelSign) return '未知渠道';

      // 在字典选项中查找对应的文本
      const option = this.channelDictOptions.find(item =>
        item.value === channelSign ||
        item.value === channelSign.toString()
      );

      return option ? (option.text || option.label) : channelSign;
    },
    getStopDate(date) {
      if (!date) return '-';

      const targetDate = new Date(date);
      const today = new Date();

      // 计算天数差
      const timeDiff = today.getTime() - targetDate.getTime();
      const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

      // 如果小于30天（不包括30天），显示合作中
      if (daysDiff < 30) {
        return '合作中';
      } else {
        // 如果大于等于30天，显示停投和天数差距
        return `停投${daysDiff}天`;
      }
    },
    // 获取渠道状态汇总
    getChannelStatusSummary(channels) {
      if (!channels || !Array.isArray(channels)) {
        return <span style={{ color: '#69c0ff', fontWeight: 'bold' }}>待消耗</span>;
      }

      const today = new Date();
      let activeCount = 0; // 合作中的渠道数
      let stoppedCount = 0; // 停投的渠道数

      channels.forEach(channel => {
        if (channel.data) {
          const targetDate = new Date(channel.data);
          const timeDiff = today.getTime() - targetDate.getTime();
          const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

          if (daysDiff < 30) {
            activeCount++;
          } else {
            stoppedCount++;
          }
        }
      });

      // 根据状态返回汇总信息
      if (activeCount === 0 && stoppedCount > 0) {
        return <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>全部停投</span>;
      } else if (activeCount > 0 && stoppedCount > 0) {
        return <span style={{ color: '#faad14', fontWeight: 'bold' }}>部分停投</span>;
      } else if (activeCount > 0 && stoppedCount === 0) {
        return <span style={{ color: '#52c41a', fontWeight: 'bold' }}>合作中</span>;
      } else {
        return <span style={{ color: '#69c0ff', fontWeight: 'bold' }}>待消耗</span>;
      }
    },
    // 获取用户ID和真实姓名组合
    getUserIdAndRealnameCombination() {
      // console.log('开始请求用户ID和真实姓名组合数据...');
      httpAction('/sys/user/getUserIdAndRealnameCombination', {}, 'GET').then((res) => {
        // console.log('请求响应:', res);
        if (res.success) {
          // console.log('用户ID和真实姓名组合数据:', res.result);
          this.userIdAndRealnameList = res.result || [];
        } else {
          // console.log('请求失败:', res.message);
          this.$message.warning(res.message || '获取用户数据失败');
        }
      }).catch((error) => {
        console.error('获取用户ID和真实姓名组合失败:', error);
        this.$message.error('获取用户数据失败');
      });
    }
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less';

.table-page-search-wrapper {
  background: #fff;
  border-radius: 4px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.table-operator {
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.table-operator .ant-btn {
  margin-right: 0;
}

.ant-table-wrapper {
  background: #fff;
  padding: 24px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.ant-alert {
  border-radius: 4px;
  margin-bottom: 16px;
}

.ant-table-thead>tr>th {
  background: #fafafa;
  font-weight: 500;
}

.ant-table-tbody>tr:hover>td {
  background: #f5f5f5;
}

.ant-table-row-selected td {
  background: #e6f7ff !important;
}

.ant-form-item {
  margin-bottom: 16px;
}

.ant-input-affix-wrapper {
  border-radius: 4px;
}

.ant-btn {
  border-radius: 4px;
  height: 32px;
  padding: 0 16px;
  font-size: 14px;
}

.ant-btn-primary {
  background: #1890ff;
  border-color: #1890ff;
}

.ant-btn-primary:hover {
  background: #69c0ff;
  border-color: #69c0ff;
}

.ant-dropdown-menu {
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.ant-dropdown-menu-item {
  padding: 8px 16px;
}

.ant-dropdown-menu-item:hover {
  background: #f5f5f5;
}

/* 客户列表表格样式优化 */
.customer-table {

  /* 表格单元格样式 */
  .ant-table-tbody>tr>td {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* 客户主体列特殊处理 - 给予更多空间 */
  .ant-table-tbody>tr>td:nth-child(2) {
    max-width: 300px;
  }

  /* 商务列 */
  .ant-table-tbody>tr>td:nth-child(3) {
    max-width: 120px;
  }

  /* 运营方式列 */
  .ant-table-tbody>tr>td:nth-child(4) {
    max-width: 150px;
  }

  /* 已合作渠道列 */
  .ant-table-tbody>tr>td:nth-child(5) {
    max-width: 200px;
  }

  /* 合作状态列 */
  .ant-table-tbody>tr>td:nth-child(6) {
    max-width: 100px;
  }

  /* 操作列固定宽度 */
  .ant-table-tbody>tr>td:last-child {
    width: 200px !important;
    min-width: 200px;
    max-width: 200px;
  }

  /* 客户ID列 */
  .ant-table-tbody>tr>td:first-child {
    max-width: 80px;
  }
}

/* 响应式处理 */
@media (max-width: 1200px) {
  .customer-table .ant-table-tbody>tr>td:nth-child(2) {
    max-width: 250px;
  }

  .customer-table .ant-table-tbody>tr>td:nth-child(5) {
    max-width: 180px;
  }
}

@media (max-width: 992px) {
  .customer-table .ant-table-tbody>tr>td:nth-child(2) {
    max-width: 200px;
  }

  .customer-table .ant-table-tbody>tr>td:nth-child(5) {
    max-width: 150px;
  }
}

@media (max-width: 768px) {
  .table-page-search-wrapper {
    padding: 16px;
  }

  .ant-table-wrapper {
    padding: 16px;
  }

  .table-operator {
    flex-direction: column;
    align-items: stretch;
  }

  .table-operator .ant-btn {
    width: 100%;
    margin-bottom: 8px;
  }

  .customer-table .ant-table-tbody>tr>td:nth-child(2) {
    max-width: 150px;
  }

  .customer-table .ant-table-tbody>tr>td:nth-child(5) {
    max-width: 120px;
  }
}
</style>