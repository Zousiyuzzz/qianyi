<template>
    <div style="background-color: #fff;">
        <!-- <a-input placeholder="请输入广告主ID" v-model="queryParam.accountId" />
        {{ queryParam.accountId }}
        {{ JSON.stringify(queryParam.accountId) }} -->
        <a-tabs default-active-key="KS" v-model="activeParentTab" @change="handleParentTabChange" tabPosition="top">
            <a-tab-pane key="KS" tab="快手" :disabled="loading">
                <a-tabs default-active-key="KS-CLYQ" v-model="activeChildTab.KS" @change="handleChildTabChange">
                    <a-tab-pane key="KS-CLYQ" tab="磁力引擎" :disabled="loading">
                        <!-- 磁力引擎 -->
                    </a-tab-pane>
                    <a-tab-pane key="KS-CLJN" tab="磁力金牛" :disabled="loading">
                        <!-- 磁力金牛 -->
                    </a-tab-pane>
                    <a-tab-pane key="KS-DJK" tab="大健康" :disabled="loading">
                        <!-- 大健康 -->
                    </a-tab-pane>
                    <a-tab-pane key="KS-CLJX" tab="磁力聚星" :disabled="loading">
                        <!-- 磁力聚星 -->
                    </a-tab-pane>
                </a-tabs>
            </a-tab-pane>
            <a-tab-pane key="DY" tab="巨量" :disabled="loading">
                <a-tabs default-active-key="DY-JLGG" v-model="activeChildTab.JL" @change="handleChildTabChange">
                    <a-tab-pane key="DY-JLGG" tab="巨量广告" :disabled="loading" :loading="loading">
                        <!-- 巨量广告 -->
                    </a-tab-pane>
                    <a-tab-pane key="DY-JLQC" tab="巨量千川" :disabled="loading">
                        <!-- 巨量前川 -->
                    </a-tab-pane>
                    <a-tab-pane key="DY-JLBDT" tab="巨量本地推" :disabled="loading">
                        <!-- 巨量本地推 -->
                    </a-tab-pane>
                    <a-tab-pane key="DY-JLXT" tab="巨量星图" :disabled="loading">
                        <!-- 巨量星图 -->
                    </a-tab-pane>
                </a-tabs>
            </a-tab-pane>
            <a-tab-pane key="TX" tab="腾讯" :disabled="loading">
                <a-tabs default-active-key="TX-GDT" v-model="activeChildTab.TX" @change="handleChildTabChange">
                    <a-tab-pane key="TX-GDT" tab="广点通" :disabled="loading">
                        <!-- 广点通 -->
                    </a-tab-pane>
                </a-tabs>
            </a-tab-pane>
            <a-tab-pane key="XHS" tab="小红书" :disabled="loading">
                <a-tabs default-active-key="XHS" v-model="activeChildTab.XHS" @change="handleChildTabChange">
                    <a-tab-pane key="XHS" tab="小红书" :disabled="loading">
                    </a-tab-pane>
                </a-tabs>
            </a-tab-pane>
            <!-- <a-tab-pane key="CJHC" tab="超级汇川" :disabled="loading">
                <a-tabs default-active-key="CJHC" v-model="activeChildTab.CJHC" @change="handleChildTabChange">
                    <a-tab-pane key="CJHC" tab="超级汇川" :disabled="loading">
                    </a-tab-pane>
                </a-tabs>
            </a-tab-pane>
            <a-tab-pane key="BLBL" tab="哔哩哔哩" :disabled="loading">
                <a-tabs default-active-key="BLBL" v-model="activeChildTab.BLBL" @change="handleChildTabChange">
                    <a-tab-pane key="BLBL" tab="哔哩哔哩" :disabled="loading">
                    </a-tab-pane>
                </a-tabs>
            </a-tab-pane> -->
            <a-tab-pane key="FMT" tab="泛媒体" :disabled="loading">
            </a-tab-pane>
        </a-tabs>

        <a-card :bordered="false">
            <!-- 查询区域 -->
            <div class="table-page-search-wrapper">
                <a-form layout="inline" @keyup.enter.native="searchQuery">
                    <a-row :gutter="24">
                        <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <a-form-item label="广告主ID">
                                <a-input placeholder="请输入广告主ID" v-model="queryParam.accountId">
                                    <a-tooltip slot="suffix">
                                        <a-icon type="heat-map" class="super-search-icon" ref="super-search-icon"
                                            @click="setSuperParams" />
                                    </a-tooltip>
                                </a-input>
                            </a-form-item>
                        </a-col>
                        <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <a-form-item label="项目">
                                <JSearchSelectTag placeholder="请选择项目" v-model="queryParam.proId"
                                    dict="tab_projectManage,pro_name,id,del_flag = '0'" async allowClear />
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
                            <a-form-item label="代理商">
                                <JSearchSelectTag placeholder="请选择代理商" v-model="queryParam.dailimc"
                                    :dict="getAgentDictConfig()" async allowClear />
                            </a-form-item>
                        </a-col>
                        <template v-if="toggleSearchStatus">
                            <a-col :xl="6" :lg="7" :md="8" :sm="24">
                                <a-form-item label="账户主体">
                                    <a-input placeholder="请输入账户主体" v-model="queryParam.corporationName"></a-input>
                                </a-form-item>
                            </a-col>
                            <a-col :xl="6" :lg="7" :md="8" :sm="24">
                                <a-form-item label="商务">
                                    <JSearchSelectTag placeholder="请选择商务名称" v-model="queryParam.businessPerson"
                                        :dictOptions="swdictOptions" :allowClear="false">
                                    </JSearchSelectTag>
                                </a-form-item>
                            </a-col>
                            <a-col :xl="6" :lg="7" :md="8" :sm="24">
                                <a-form-item label="账户创建时间">
                                    <a-range-picker v-model="createTime" format="YYYY-MM-DD"
                                        value-format="YYYY-MM-DD" />
                                </a-form-item>
                            </a-col>
                            <a-col :xl="6" :lg="7" :md="8" :sm="24">
                                <a-form-item label="项目绑定时间">
                                    <a-range-picker v-model="bindingTime" format="YYYY-MM-DD"
                                        value-format="YYYY-MM-DD" />
                                </a-form-item>
                            </a-col>
                            <a-col :xl="6" :lg="7" :md="8" :sm="24">
                                <a-form-item label="是否绑定项目">
                                    <a-select v-model="queryParam.isBinding" placeholder="请选择是否绑定项目">
                                        <a-select-option value="">请选择</a-select-option>
                                        <a-select-option :value="1">未绑定</a-select-option>
                                        <a-select-option :value="0">已绑定</a-select-option>
                                    </a-select>
                                </a-form-item>
                            </a-col>
                            <a-col :xl="6" :lg="7" :md="8" :sm="24">
                                <a-form-item label="是否绑定返点政策模板">
                                    <a-select v-model="queryParam.isRebate" placeholder="请选择是否绑定返点政策模板">
                                        <a-select-option value="">请选择</a-select-option>
                                        <a-select-option :value="1">未绑定</a-select-option>
                                        <a-select-option :value="0">已绑定</a-select-option>
                                    </a-select>
                                </a-form-item>
                            </a-col>


                            <a-col :xl="6" :lg="7" :md="8" :sm="24">
                                <a-form-item label="账户类型">
                                    <a-input placeholder="请输入账户类型" v-model="queryParam.ucType"></a-input>
                                </a-form-item>
                            </a-col>
                            <!-- <a-col :xl="6" :lg="7" :md="8" :sm="24">
                                <a-form-item label="付款类型">
                                    <a-input placeholder="请输入付款类型" v-model="queryParam.paymentType"></a-input>
                                </a-form-item>
                            </a-col>
                            <a-col :xl="6" :lg="7" :md="8" :sm="24">
                                <a-form-item label="账户昵称">
                                    <a-input placeholder="请输入账户昵称" v-model="queryParam.accountName"></a-input>
                                </a-form-item>
                            </a-col>
                            <a-col :xl="6" :lg="7" :md="8" :sm="24">
                                <a-form-item label="产品名称">
                                    <a-input placeholder="请输入产品名称" v-model="queryParam.productName"></a-input>
                                </a-form-item>
                            </a-col>
                            <a-col :xl="6" :lg="7" :md="8" :sm="24">
                                <a-form-item label="一级行业">
                                    <a-input placeholder="请输入一级行业" v-model="queryParam.industry"></a-input>
                                </a-form-item>
                            </a-col>
                            <a-col :xl="6" :lg="7" :md="8" :sm="24">
                                <a-form-item label="二级行业">
                                    <a-input placeholder="请输入二级行业" v-model="queryParam.secondIndustry"></a-input>
                                </a-form-item>
                            </a-col> -->

                            <a-col :xl="6" :lg="7" :md="8" :sm="24">
                                <a-form-item label="渠道名称">
                                    <a-input placeholder="请输入渠道名称" v-model="queryParam.channelName"></a-input>
                                </a-form-item>
                            </a-col>
                        </template>
                        <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
                                <!-- <a-button type="primary" @click="showAddModal"
                                    v-if="queryParam.channelSign == 'DY-JLGG'" icon="plus">复制ID</a-button> -->
                                <a-button type="primary" @click="searchQuery" icon="search"
                                    style="margin-left: 8px">查询</a-button>
                                <a-button type="primary" @click="searchReset" icon="reload"
                                    style="margin-left: 8px">重置</a-button>
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
                <a-button type="primary" icon="plus" @click="addAcount(queryParam.channelSign)">添加账户</a-button>
                <a-button type="primary" icon="download" @click="selectExportFileds">导出</a-button>
                <!-- <a-button type="primary" icon="download" @click="exportAllExcel"
                    style="margin-left: 8px">全量下载</a-button> -->
                <!-- <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader"
                    :action="importExcelUrl" @change="handleImportExcel">
                    <a-button type="primary" icon="import">导入</a-button>
                </a-upload> -->
                <!-- 高级查询区域 -->
                <j-super-query :fieldList="superFieldList" ref="superQueryModal"
                    @handleSuperQuery="handleSuperQuery"></j-super-query>
                <a-button type="primary" icon="retweet" @click="updateAccounts">主体更新ID绑定</a-button>
                <a-button type="primary" icon="sync" @click="updateDYAccount" :loading="updateDYAccountLoading"
                    v-if="queryParam.channelSign === 'DY-JLQC'" style="margin-left: 8px">更新巨量ID</a-button>
                <a-button type="primary" icon="reload" @click="updateDYAccountByEmpty"
                    :loading="updateDYAccountByEmptyLoading" v-if="queryParam.channelSign === 'DY-JLQC'"
                    style="margin-left: 8px">更新空主体ID信息</a-button>
                <a-dropdown v-if="selectedRowKeys.length > 0">
                    <a-menu slot="overlay">
                        <a-menu-item key="1" @click="batchBindingProject(queryParam.channelSign)"><a-icon
                                type="api" />批量绑定项目</a-menu-item>
                        <a-menu-item key="2" @click="batchChangeProjectBinding(queryParam.channelSign)"><a-icon
                                type="edit" />更改项目绑定</a-menu-item>
                        <!-- <a-menu-item key="1" @click="batchBindingjjfl(queryParam.channelSign)"><a-icon
                                type="api" />批量绑定竞价分类</a-menu-item> -->
                        <a-menu-item key="3" @click="handleUpdateProductName()" v-if="activeParentTab === 'TX'"><a-icon
                                type="api" />批量更新产品名称</a-menu-item>
                        <!-- <a-menu-item key="4" @click="batchBindingBora(queryParam.channelSign)"
                            v-if="queryParam.channelSign === 'DY-JLGG' && userInfo().username === 'admin'"><a-icon
                                type="user" />博拉不参与统计绑定</a-menu-item> -->
                        <!-- <a-menu-item key="1" @click="handleBingding(queryParam.channelSign)"><a-icon
                                type="block" />批量绑定返点政策模板</a-menu-item> -->
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

                <a-table ref="table" size="middle" :scroll="{ x: true }" bordered rowKey="id" :columns="filteredColumns"
                    :dataSource="dataSource" :pagination="ipagination" :loading="loading"
                    :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
                    class="j-table-force-nowrap" @change="handleTableChange">

                    <template slot="htmlSlot" slot-scope="text, record" v-if="getShow(record)">
                        <div v-html="text"></div>
                    </template>
                    <!-- <template slot="imgSlot" slot-scope="text,record">
                        <span v-if="!text" style="font-size: 12px;font-style: italic;">无图片</span>
                        <img v-else :src="getImgView(text)" :preview="record.id" height="25px" alt=""
                            style="max-width:80px;font-size: 12px;font-style: italic;" />
                    </template> -->
                    <!-- <template slot="fileSlot" slot-scope="text">
                        <span v-if="!text" style="font-size: 12px;font-style: italic;">无文件</span>
                        <a-button v-else :ghost="true" type="primary" icon="download" size="small"
                            @click="downloadFile(text)">
                            下载
                        </a-button>
                    </template> -->

                    <!-- <span slot="action" slot-scope="text, record">
                        <a @click="handleDetail(record)">详情</a>
                    </span> -->

                </a-table>
            </div>

            <tab-accountinfo-modal ref="modalForm" @ok="modalFormOk"></tab-accountinfo-modal>
            <binding-dia ref="BindingDia" @ok="modalFormOk"></binding-dia>
            <binding-dia-change ref="BindingDiaChange" @ok="modalFormOk"></binding-dia-change>
            <binding-temp ref="BindingTemp" @ok="modalFormOk"></binding-temp>
            <binding-diajjfl ref="BindingDiajjfl" @ok="modalFormOk"></binding-diajjfl>
            <binding-bora ref="BindingBora" @ok="modalFormOk"></binding-bora>
            <super-search ref="SuperSearch" @ok="superSearchOk"></super-search>
            <addAcountIds ref="AddAcountIds" @ok="modalFormOk"></addAcountIds>

            <!-- 导出进度弹窗 -->
            <a-modal :visible="exportVisible" title="导出进度" :footer="null" :maskClosable="false" :keyboard="false">
                <div style="margin: 12px 0;">
                    <a-progress :percent="exportProgress" status="active" />
                    <div style="margin-top: 8px; color: rgba(0,0,0,.65);">正在导出，请勿关闭窗口...</div>
                </div>
            </a-modal>

            <!-- 更新产品名称弹窗 -->
            <a-modal :visible="updateProductModalVisible" title="批量更新产品名称" @ok="handleUpdateProductOk"
                @cancel="handleUpdateProductCancel" :confirm-loading="updateProductModalLoading" width="500px">
                <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
                    <a-form-item label="产品名称" required>
                        <a-input v-model="updateProductForm.productName" placeholder="请输入产品名称" :maxLength="100"
                            show-count />
                    </a-form-item>
                    <a-form-item label="选中记录">
                        <span style="color: #666;">已选择 {{ selectedRowKeys.length }} 条记录</span>
                    </a-form-item>
                </a-form>
            </a-modal>

            <!-- 新增账户弹窗 -->
            <a-modal :visible="addModalVisible" title="新增账户" @ok="handleAddOk" @cancel="handleAddCancel"
                :confirm-loading="addModalLoading" width="40%">
                <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
                    <a-form-item label="任务名称" required>
                        <a-input v-model="addForm.batchName" placeholder="请输入任务名称（用于标识复制任务）" />
                    </a-form-item>
                    <a-form-item label="被复制广告主账户ID" required>
                        <a-input v-model="addForm.advertiserId" placeholder="请输入被复制广告主账户ID" />
                    </a-form-item>
                    <a-form-item label="复制数量" required>
                        <a-input-number v-model="addForm.quantity" :min="1" :max="100" :step="1" style="width: 100%"
                            placeholder="请输入复制数量（1-100）" />
                    </a-form-item>
                    <a-form-item label="广告主账户名称" required>
                        <a-input v-model="addForm.advertiserName" placeholder="请输入广告主账户名称（不能包含特殊字符）" />
                    </a-form-item>
                    <a-form-item label="复制标签">
                        <a-radio-group v-model="addForm.copyTag" button-style="solid">
                            <a-radio-button :value="true">复制</a-radio-button>
                            <a-radio-button :value="false">不复制</a-radio-button>
                        </a-radio-group>
                    </a-form-item>
                    <a-form-item label="报备类型">
                        <a-radio-group v-model="addForm.reportType" button-style="solid">
                            <a-radio-button value="EMPTY">不报备</a-radio-button>
                            <a-radio-button value="SELF_OPERATION">走量报备</a-radio-button>
                            <a-radio-button value="SELF_OPERATION">自运营报备</a-radio-button>
                            <a-radio-button value="DESCEND_REPORT">收量报备</a-radio-button>
                        </a-radio-group>
                    </a-form-item>
                    <a-form-item label="复制投放资质">
                        <a-radio-group v-model="addForm.copyDelivery" button-style="solid">
                            <a-radio-button :value="true">复制</a-radio-button>
                            <a-radio-button :value="false">不复制</a-radio-button>
                        </a-radio-group>
                    </a-form-item>
                </a-form>
            </a-modal>
        </a-card>
    </div>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { filterObj } from '@/utils/util'
import TabAccountinfoModal from './modules/TabAccountinfoModal'
import bindingDia from './bindingDia.vue'
import bindingDiaChange from './bindingDiaChange.vue'
import bindingTemp from './bindingTemp.vue'
import bindingDiajjfl from './bindingDiajjfl.vue'
import bindingBora from './bindingBora.vue'
import superSearch from './components/superSearch.vue'
import { advertiserCopy } from '@/api/api'
import { mapGetters } from 'vuex'
import addAcountIds from './addAcountIds.vue'
import { postAction, httpAction, getAction, downFile } from '@/api/manage'
import { queryDepartTreeList } from '@/api/api'
import * as XLSX from 'xlsx'

export default {
    name: 'TabAccountinfoList',
    mixins: [JeecgListMixin, mixinDevice],
    components: {
        TabAccountinfoModal,
        bindingDia,
        bindingDiaChange,
        bindingTemp,
        bindingDiajjfl,
        bindingBora,
        superSearch,
        addAcountIds
    },
    data() {
        return {
            dailimc: '',//代理商名称
            createTime: [],
            bindingTime: [],
            datalist: [''],
            queryParam: {
                channelSign: 'KS-CLYQ',
                dailimc: '', // 代理商id
                agent_id: '', // 其他渠道的代理商id
                dy_advertiser_id: '' // 巨量这个大类的代理商id
            },
            activeParentTab: 'KS',
            activeChildTab: {
                JL: 'DY-JLGG',
                TX: 'TX-GDT',
                KS: 'KS-CLYQ',
                CJHC: 'CJHC',
                XHS: 'XHS',
                BLBL: 'BLBL',
                FMT: 'CJHC'
            },
            description: '广告主信息 管理页面',
            // 新增账户相关数据
            addModalVisible: false,
            addModalLoading: false,
            addForm: {
                batchName: '',
                agentId: '',
                advertiserId: '',
                quantity: 1,
                advertiserName: '',
                copyTag: false,
                reportType: 'EMPTY',
                copyDelivery: false
            },
            // 更新产品名称弹窗相关数据
            updateProductModalVisible: false,
            updateProductModalLoading: false,
            updateProductForm: {
                productName: ''
            },
            columns: [
                {
                    title: '广告主ID',
                    align: "center",
                    dataIndex: 'accountId',
                    query: ["KS", "DY", "TX", "XHS", "CJHC", "BLBL", "FMT"]
                },
                // {
                //     title: '账户昵称',
                //     align: "center",
                //     dataIndex: 'accountName',
                //     query: ["KS", "DY", "XHS", "CJHC", "BLBL"]
                // },
                // {
                //     title: '渠道名称',
                //     align: "center",
                //     dataIndex: 'channelName',
                //     query: ["KS", "DY", "TX"]
                // },
                // {
                //     title: '账户主体',
                //     align: "center",
                //     dataIndex: 'corporation_name',
                //     query: ["KS", "DY", "TX", "XHS", "CJHC", "BLBL"]
                // },
                {
                    title: '代理商ID',
                    align: "center",
                    dataIndex: 'agentId',
                    query: ["TX", "XHS", "CJHC", "BLBL", "FMT"]
                },
                {
                    title: '代理商',
                    align: "center",
                    dataIndex: 'agentId_advertiser_name',
                    query: ["FMT"]
                },
                {
                    title: '账户主体',
                    align: "center",
                    dataIndex: 'corporationName',
                    query: ["KS", "DY", "TX", "XHS", "CJHC", "BLBL", "FMT"]
                },
                {
                    title: '一级行业',
                    align: "center",
                    dataIndex: 'industry',
                    query: ["KS", "DY", "TX", "XHS", "CJHC", "BLBL", "FMT"]
                },
                // {
                //     title: '二级行业',
                //     align: "center",
                //     dataIndex: 'secondIndustry',
                //     query: ["KS", "DY", "TX", "XHS", "CJHC", "BLBL"]
                // },
                {
                    title: '创建账号时间',
                    align: "center",
                    dataIndex: 'createDate',
                    query: ["KS", "DY", "XHS", "CJHC", "BLBL", "FMT"]
                },
                {
                    title: '媒体产品名称',
                    align: "center",
                    dataIndex: 'productName',
                    query: ["KS", "TX", "XHS", "CJHC", "BLBL", "FMT"]
                },
                {
                    title: '返点政策模板',
                    align: "center",
                    query: ["KS", "TX", "DY", "XHS", "CJHC", "BLBL", "FMT"],
                    dataIndex: 'rebateTeptId',
                    customRender: function (t, r) {
                        return r.rebateTeptName
                    },
                },
                {
                    title: '项目名称',
                    align: "center",
                    dataIndex: 'proId_pro_name',
                    query: ["KS", "DY", "TX", "XHS", "CJHC", "BLBL", "FMT"]
                },
                {
                    title: '合作方式',
                    align: "center",
                    dataIndex: 'proId_collaboration_mode',
                    customRender: (text) => {
                        if (text) {
                            let arr = ['预付', '垫付', '服务费']
                            return arr[Number(text)] || text
                        } else {
                            return ''
                        }
                    },
                    query: ["KS", "DY", "TX", "XHS", "CJHC", "BLBL", "FMT"]
                },
                {
                    title: '商务',
                    align: "center",
                    dataIndex: 'proId_business_person',
                    customRender: (text, record) => {
                        return this.getUserRealnameById(text);
                    },
                    query: ["KS", "DY", "TX", "XHS", "CJHC", "BLBL", "FMT"]
                },
                // {
                //     title: '客户系统状态',
                //     align: "center",
                //     dataIndex: 'txSystemStatus',
                //     query: ["TX", "XHS", "CJHC", "BLBL"]
                // },
                {
                    title: '项目绑定时间',
                    align: "center",
                    dataIndex: 'bindingTime',
                    query: ["KS", "DY", "TX", "XHS", "CJHC", "BLBL", "FMT"]
                },
            ],
            url: {
                list: {
                    url: "/accountinfo/list",
                    method: "post"
                },
                // list: "/accountinfo/list",
                delete: "/accountinfo/delete",
                deleteBatch: "/accountinfo/deleteBatch",
                exportXlsUrl: "/accountinfo/exportXls",
                importExcelUrl: "accountinfo/importExcel",

            },
            dictOptions: {},
            superFieldList: [],
            // 添加状态管理
            currentParentTab: 'DY',
            currentChildTab: 'DY-JLGG',
            isRequesting: false,
            // 导出进度相关
            exportVisible: false,
            exportProgress: 0,
            // 商务字典选项
            swdictOptions: [],
            // 用户ID和真实姓名组合数据
            userIdAndRealnameList: [],
            // 更新巨量ID按钮加载状态
            updateDYAccountLoading: false,
            // 更新空主体ID信息按钮加载状态
            updateDYAccountByEmptyLoading: false,
        }
    },
    created() {
        // // console.log('页面created生命周期开始执行');
        this.getSuperFieldList();
        this.getBusinessPersonList();
        this.getUserIdAndRealnameCombination();
    },
    computed: {
        importExcelUrl: function () {
            return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
        },
        filteredColumns() {
            return this.columns.filter(column => {
                if (!column.query) return true;
                return column.query.includes(this.activeParentTab);
            });
        }
    },
    watch: {
        createTime(newVal) {
            this.queryParam.createDateJoint = newVal.join(',')
        },
        bindingTime(newVal) {
            this.queryParam.bindingTimeJoint = newVal.join(',')
        }
    },
    methods: {
        ...mapGetters(["userInfo"]),
        updateAccounts() {
            this.$message.info('正在更新，请稍等...');
            getAction('/accountinfo/updateProBySubject').then(res => {
                if (res && res.success) {
                    this.$message.success('更新完成');
                    this.searchQuery();
                } else {
                    this.$message.error(res.message || '更新失败');
                }
            })
        },
        updateDYAccount() {
            this.updateDYAccountLoading = true;
            this.$message.info('正在更新巨量ID，请稍等...');
            postAction('/accountinfo/updateDYAccount', {}).then(res => {
                if (res && res.success) {
                    this.$message.success(res.message || '更新完成');
                    this.searchQuery();
                } else {
                    this.$message.error(res.message || '更新失败');
                }
            }).catch(err => {
                this.$message.error('更新失败：' + (err.message || '未知错误'));
            }).finally(() => {
                this.updateDYAccountLoading = false;
            });
        },
        updateDYAccountByEmpty() {
            this.updateDYAccountByEmptyLoading = true;
            this.$message.info('正在更新空主体ID信息，请稍等...');
            postAction('/accountinfo/updateDYAccountByEmpty', {}).then(res => {
                if (res && res.success) {
                    this.$message.success(res.message || '更新完成');
                    this.searchQuery();
                } else {
                    this.$message.error(res.message || '更新失败');
                }
            }).catch(err => {
                this.$message.error('更新失败：' + (err.message || '未知错误'));
            }).finally(() => {
                this.updateDYAccountByEmptyLoading = false;
            });
        },
        setSuperParams() {
            this.$refs['SuperSearch'].showModal()
        },
        handleExportXls(fileName) {
            if (!fileName || typeof fileName != "string") {
                fileName = "导出文件"
            }
            let param = this.getQueryParams();
            if (this.selectedRowKeys && this.selectedRowKeys.length > 0) {
                param['selections'] = this.selectedRowKeys.join(",")
            }
            // // console.log("导出参数", param)
            downFile(this.url.exportXlsUrl, param, 'post').then((data) => {
                if (!data) {
                    this.$message.warning("文件下载失败")
                    return
                }
                if (typeof window.navigator.msSaveBlob !== 'undefined') {
                    window.navigator.msSaveBlob(new Blob([data], { type: 'application/vnd.ms-excel' }), fileName + '.xls')
                } else {
                    let url = window.URL.createObjectURL(new Blob([data], { type: 'application/vnd.ms-excel' }))
                    let link = document.createElement('a')
                    link.style.display = 'none'
                    link.href = url
                    link.setAttribute('download', fileName + '.xls')
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link); //下载完成移除元素
                    window.URL.revokeObjectURL(url); //释放掉blob对象
                }
            })
        },
        selectExportFileds() {
            this.handleExportXls('广告主信息')
            // this.$refs['AddAcountIds'].showModal(this.queryParam.channelSign);
        },
        async exportAllExcel() {
            if (!this.queryParam.channelSign) {
                this.$message.error('请先选择渠道');
                return;
            }
            if (this.isRequesting) return;
            this.isRequesting = true;
            this.exportVisible = true;
            this.exportProgress = 0;

            const pageSize = 1000;
            let pageNo = 1;
            let total = 0;
            let fetched = 0;
            const allRows = [];

            const baseParams = {
                channelSign: this.queryParam.channelSign,
                column: 'createTime',
                order: 'desc'
            };

            try {
                // 先拉第一页，拿到 total
                const firstRes = await postAction(this.url.list.url, { ...baseParams, pageNo, pageSize });
                if (!(firstRes && firstRes.success)) {
                    throw new Error((firstRes && firstRes.message) || '请求失败');
                }
                const firstList = firstRes.result && firstRes.result.records ? firstRes.result.records : (firstRes.result || []);
                total = (firstRes.result && typeof firstRes.result.total === 'number') ? firstRes.result.total : firstList.length;

                const mapRow = (item) => ({
                    '广告主ID': item.accountId,
                    '账户昵称': item.accountName,
                    '代理商ID': item.agentId,
                    '账户主体': item.corporationName,
                    '一级行业': item.industry,
                    '二级行业': item.secondIndustry,
                    '创建账号时间': item.createDate,
                    '媒体产品名称': item.productName,
                    '返点政策模板': item.rebateTeptName,
                    '项目名称': item.proName,
                    '合作方式': (function (text) { if (text === 0 || text === '0') return '预付'; if (text === 1 || text === '1') return '垫付'; if (text === 2 || text === '2') return '服务费'; return text || ''; })(item.collaborationMode),
                    '项目绑定时间': item.bindingTime,
                });

                allRows.push(...firstList.map(mapRow));
                fetched = allRows.length;
                this.exportProgress = total ? Math.min(100, Math.floor(fetched / total * 100)) : 100;

                // 继续分页
                while (firstList.length === pageSize) {
                    pageNo += 1;
                    const res = await postAction(this.url.list.url, { ...baseParams, pageNo, pageSize });
                    if (!(res && res.success)) {
                        throw new Error((res && res.message) || '请求失败');
                    }
                    const list = res.result && res.result.records ? res.result.records : (res.result || []);
                    if (!list.length) break;
                    allRows.push(...list.map(mapRow));
                    fetched = allRows.length;
                    // 更新进度（若 total 不可用则估算）
                    if (!total && list.length < pageSize) {
                        total = (pageNo - 1) * pageSize + list.length;
                    }
                    this.exportProgress = total ? Math.min(100, Math.floor(fetched / total * 100)) : (pageNo * 100);
                    if (list.length < pageSize) break;
                }

                // 生成工作簿
                const ws = XLSX.utils.json_to_sheet(allRows);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, '广告主信息');
                const fileName = `广告主信息-全量-${this.queryParam.channelSign}.xlsx`;
                XLSX.writeFile(wb, fileName);
                this.exportProgress = 100;
                this.$message.success(`导出完成，共 ${allRows.length} 条`);
            } catch (e) {
                this.$message.error(`导出失败：${e.message || e}`);
            } finally {
                setTimeout(() => { this.exportVisible = false; }, 600);
                this.isRequesting = false;
            }
        },
        superSearchOk(superQueryParams, superQueryMatchType) {
            // 检查是否有有效的查询参数（过滤掉空字符串）
            // const validParams = superQueryParams.filter(param => param.val && param.val.trim() !== '');
            // const hasValidParams = validParams.length > 0;

            if (superQueryParams && superQueryParams.length > 0) {
                if (this.$refs['super-search-icon'] && this.$refs['super-search-icon'].$el) {
                    this.$refs['super-search-icon'].$el.style.color = '#1890ff'
                }
            } else {
                if (this.$refs['super-search-icon'] && this.$refs['super-search-icon'].$el) {
                    this.$refs['super-search-icon'].$el.style.color = 'rgba(0,0,0,.45)'
                }
            }
            // 只传递有效的参数给 handleSuperQuery
            // this.handleSuperQuery(validParams, superQueryMatchType)
            this.handleSuperQuerytwo(superQueryParams)
        },
        searchReset() {
            // 保留 channelSign 参数
            const channelSign = this.queryParam.channelSign;
            this.queryParam = {
                channelSign,
                dailimc: '', // 代理商id
                agent_id: '', // 其他渠道的代理商id
                dy_advertiser_id: '' // 巨量这个大类的代理商id
            };
            // 重置图标颜色
            if (this.$refs['super-search-icon'] && this.$refs['super-search-icon'].$el) {
                this.$refs['super-search-icon'].$el.style.color = 'rgba(0,0,0,.45)'
            }
            // 重置超级查询参数
            this.superQueryParams = ''
            this.superQueryFlag = false
            // 清除 superSearch 组件中的 lastDataList 数据
            if (this.$refs['SuperSearch']) {
                this.$refs['SuperSearch'].clearLastDataList()
            }
            this.loadData(1);
        },
        getShow(list) {
            // // console.log(list)
            let target = this.activeParentTab
        },
        getQueryField() {
            var str = "id,";
            if (this.activeParentTab == '') { }
            this.columns.forEach((value) => {
                let list = value.query || []
                let target = this.activeParentTab
                if (list.includes(target)) {
                    str += "," + value.dataIndex;
                }
            });
            return str;
        },
        // 重写 getQueryParams 方法，在查询时转换 dailimc 到对应的字段
        getQueryParams() {
            // 根据渠道类型转换 dailimc 到对应的字段
            // if (this.queryParam.dailimc) {
            //     if (this.activeParentTab == 'DY') {
            //         // 巨量大类使用 dyAdvertiserId
            //         this.queryParam.dyAdvertiserId = this.queryParam.dailimc;
            //         // 删除其他渠道的字段
            //         delete this.queryParam.agentId;
            //     } else {
            //         // 其他渠道使用 agent_id
            //         this.queryParam.agentId = this.queryParam.dailimc;
            //         // 删除巨量的字段
            //         delete this.queryParam.dyAdvertiserId;
            //     }
            // } else {
            //     // 如果 dailimc 为空，删除这两个字段
            //     delete this.queryParam.agentId;
            //     delete this.queryParam.dyAdvertiserId;
            // }
            this.queryParam.advertiserId = this.queryParam.dailimc;

            // 调用父类的 getQueryParams 方法
            let sqp = {}
            if (this.superQueryParams) {
                sqp['superQueryParams'] = encodeURI(this.superQueryParams)
                sqp['superQueryMatchType'] = this.superQueryMatchType
            }
            // 如果传了渠道（channelSign），就不传排序参数
            let isorterToMerge = {};
            if (!this.queryParam.channelSign || this.queryParam.channelSign.trim() === '') {
                isorterToMerge = this.isorter;
            }
            var param = Object.assign(sqp, this.queryParam, isorterToMerge, this.filters,);

            // 如果传了渠道（channelSign），删除排序参数
            if (this.queryParam.channelSign && this.queryParam.channelSign.trim() !== '') {
                delete param.column;
                delete param.order;
            }

            // 删除 dailimc，它只用于逻辑计算，不传参
            delete param.dailimc;

            // 处理 isLike 配置项
            if (this.columns && Array.isArray(this.columns)) {
                this.columns.forEach(column => {
                    if (column.isLike && param[column.dataIndex]) {
                        let val = param[column.dataIndex];
                        // 如果字段配置了 isLike 为 true，且参数值不为空，则在前后加上 *
                        if (!val.startsWith('*')) val = '*' + val;
                        if (!val.endsWith('*')) val = val + '*';
                        param[column.dataIndex] = val;
                    }
                })
            }

            param.field = this.getQueryField();
            param.pageNo = this.ipagination.current;
            param.pageSize = this.ipagination.pageSize;
            return filterObj(param);
        },
        handleBingding(channelSign) {
            if (this.selectedRowKeys.length <= 0) {
                this.$message.warning('请选择一条记录！');
                return false;
            } else {
                const selectedRows = this.dataSource.filter(item => this.selectedRowKeys.includes(item.id));
                this.$refs['BindingTemp'].showModal(selectedRows, channelSign, null);
            }
        },
        handleUpdateProductName() {
            if (this.selectedRowKeys.length <= 0) {
                this.$message.warning('请选择一条记录！');
                return false;
            } else {
                // 重置表单
                this.updateProductForm.productName = '';
                // 显示弹窗
                this.updateProductModalVisible = true;
            }
        },
        //批量绑定项目
        batchBindingProject(channelSign) {
            if (this.selectedRowKeys.length <= 0) {
                this.$message.warning('请选择一条记录！');
                return false;
            } else {
                const selectedRows = this.dataSource.filter(item => this.selectedRowKeys.includes(item.id));

                // 检查是否所有选中数据的proId都为空（首次绑定）
                const hasProId = selectedRows.every(item => !item.proId || item.proId === null || item.proId === '');
                if (!hasProId) {
                    this.$message.warning('批量绑定项目只能选择未绑定项目的记录！请检查选中的数据。');
                    return false;
                }

                // // console.log(selectedRows)
                this.$refs['BindingDia'].showModal(selectedRows, channelSign);
                // this.$refs['BindingDia'].showModal([...this.selectedRowKeys])
            }
        },
        //更改项目绑定
        batchChangeProjectBinding(channelSign) {
            if (this.selectedRowKeys.length <= 0) {
                this.$message.warning('请选择一条记录！');
                return false;
            } else {
                const selectedRows = this.dataSource.filter(item => this.selectedRowKeys.includes(item.id));
                console.log(selectedRows, 'selectedRows:')
                // 检查是否所有选中数据的proId都存在（已绑定项目）
                const allHaveProId = selectedRows.every(item => item.proId && item.proId != null && item.proId != '');
                console.log(allHaveProId, 'allHaveProId:')
                if (!allHaveProId) {
                    this.$message.warning('更改项目绑定只能选择已绑定项目的记录！请检查选中的数据。');
                    return false;
                }

                // 获取最早的绑定时间，用于限制用户选择的日期
                const bindingTimes = selectedRows
                    .map(item => item.bindingTime)
                    .filter(time => time && time !== null && time !== '')
                    .sort();

                const earliestBindingTime = bindingTimes.length > 0 ? bindingTimes[0] : null;

                // // console.log(selectedRows, 'earliestBindingTime:', earliestBindingTime)
                this.$refs['BindingDiaChange'].showModal(selectedRows, channelSign, earliestBindingTime);
            }
        },
        addAcount(channelSign) {
            // // console.log(this.$refs['AddAcountIds'])
            this.$refs['AddAcountIds'].showModal(channelSign);
        },
        batchBindingjjfl(channelSign) {
            if (this.selectedRowKeys.length <= 0) {
                this.$message.warning('请选择一条记录！');
                return false;
            } else {
                const selectedRows = this.dataSource.filter(item => this.selectedRowKeys.includes(item.id));
                this.$refs['BindingDiajjfl'].showModal(selectedRows, channelSign);
                // this.$refs['BindingDia'].showModal([...this.selectedRowKeys])
            }
        },
        // 父级tab切换
        handleParentTabChange(activeKey) {
            this.activeParentTab = activeKey;
            // 如果当前是泛媒体，直接设置参数并返回
            if (activeKey === 'FMT') {
                this.queryParam.channelSign = 'CJHC,BLBL,WYMS'
                // 切换tab时清空代理商选项
                this.queryParam.dailimc = '';
                this.searchQuery()
                return
            }
            // 获取当前父tab下的子tab activeKey
            let childTabKey;
            if (activeKey === 'KS') {
                childTabKey = this.activeChildTab.KS;
            } else if (activeKey === 'DY') {
                childTabKey = this.activeChildTab.JL;
            } else if (activeKey === 'TX') {
                childTabKey = this.activeChildTab.TX;
            } else if (activeKey === 'XHS') {
                childTabKey = this.activeChildTab.XHS;
            } else if (activeKey === 'CJHC') {
                childTabKey = this.activeChildTab.CJHC;
            } else if (activeKey === 'BLBL') {
                childTabKey = this.activeChildTab.BLBL;
            }
            // this.fetchData(activeKey, childTabKey);
            this.queryParam.channelSign = childTabKey
            // 切换tab时清空代理商选项
            this.queryParam.dailimc = '';
            this.searchQuery()
        },
        // 子级tab切换
        handleChildTabChange(activeKey) {
            // 根据当前父tab更新对应的子tab activeKey
            if (this.activeParentTab === 'KS') {
                this.activeChildTab.KS = activeKey;
            } else if (this.activeParentTab === 'DY') {
                this.activeChildTab.JL = activeKey;
            } else if (this.activeParentTab === 'TX') {
                this.activeChildTab.TX = activeKey;
            } else if (this.activeParentTab === 'XHS') {
                this.activeChildTab.XHS = activeKey;
            } else if (this.activeParentTab === 'CJHC') {
                this.activeChildTab.CJHC = activeKey;
            } else if (this.activeParentTab === 'BLBL') {
                this.activeChildTab.BLBL = activeKey;
            }
            // this.fetchData(this.activeParentTab, activeKey);
            this.queryParam.channelSign = activeKey
            // 切换tab时清空代理商选项
            this.queryParam.dailimc = '';
            this.searchQuery()
        },
        initDictConfig() {
        },
        getSuperFieldList() {
            let fieldList = [];
            // fieldList.push({ type: 'string', value: 'accountId', text: '广告主ID', dictCode: '' })
            fieldList.push({ type: 'string', value: 'accountName', text: '账户昵称', dictCode: '' })
            fieldList.push({ type: 'string', value: 'productName', text: '产品名称', dictCode: '' })
            fieldList.push({ type: 'string', value: 'industry', text: '一级行业', dictCode: '' })
            fieldList.push({ type: 'string', value: 'secondIndustry', text: '二级行业', dictCode: '' })
            fieldList.push({ type: 'string', value: 'corporationName', text: '账户主体', dictCode: '' })
            fieldList.push({ type: 'string', value: 'copyAccount', text: '是否为复制账户', dictCode: '' })
            fieldList.push({ type: 'string', value: 'channelName', text: '渠道名称', dictCode: '' })
            this.superFieldList = fieldList
        },
        // 新增账户相关方法
        showAddModal() {
            this.addForm = {
                batchName: '',
                agentId: '',
                advertiserId: '',
                quantity: 1,
                advertiserName: '',
                copyTag: false,
                reportType: 'EMPTY',
                copyDelivery: false
            };
            this.addModalVisible = true;
        },
        handleAddOk() {
            const {
                batchName,
                agentId,
                advertiserId,
                quantity,
                advertiserName
            } = this.addForm;
            if (!batchName || !batchName.trim()) {
                this.$message.error('批次名称必填');
                return;
            }
            if (!advertiserId || !advertiserId.toString().trim()) {
                this.$message.error('被复制广告主账户ID必填');
                return;
            }
            // if (!quantity || isNaN(quantity) || quantity < 1 || quantity > 100 || !Number.isInteger(Number(quantity))) {
            //     this.$message.error('复制数量必须为1-100之间的整数');
            //     return;
            // }
            if (!advertiserName || !advertiserName.trim()) {
                this.$message.error('广告主账户名称必填');
                return;
            }
            // if (/[^\w\u4e00-\u9fa5]/.test(advertiserName)) {
            //     this.$message.error('广告主账户名称不能包含特殊字符');
            //     return;
            // }
            if (/\n/.test(advertiserName)) {
                this.$message.error('广告主账户名称不能包含换行符');
                return;
            }
            this.addModalLoading = true;
            advertiserCopy(this.addForm)
                .then(res => {
                    if (res && res.success) {
                        this.$message.success(res.message || '新增成功');
                        this.addModalVisible = false;
                        this.searchQuery(); // 刷新列表
                    } else {
                        this.$message.error((res && res.message) || '新增失败');
                    }
                })
                .catch(() => {
                    this.$message.error('新增失败');
                })
                .finally(() => {
                    this.addModalLoading = false;
                });
        },
        handleAddCancel() {
            this.addModalVisible = false;
        },
        // 更新产品名称弹窗确认
        handleUpdateProductOk() {
            if (!this.updateProductForm.productName || !this.updateProductForm.productName.trim()) {
                this.$message.error('请输入产品名称！');
                return;
            }

            this.updateProductModalLoading = true;

            // 将选中数据的id按逗号分隔组成字符串
            const selectedIds = this.selectedRowKeys.join(',');
            const productName = this.updateProductForm.productName.trim();

            const formData = new FormData();
            formData.append('id', selectedIds);
            formData.append('productName', productName);

            postAction('/accountinfo/updateProductName', formData).then(res => {
                if (res.success) {
                    this.$message.success('修改成功');
                    this.searchQuery(); // 刷新列表
                    this.updateProductModalVisible = false;
                } else {
                    this.$message.error(res.message || '修改失败');
                }
            }).catch(err => {
                this.$message.error(`修改失败：${err.message}`);
            }).finally(() => {
                this.updateProductModalLoading = false;
            });
        },
        // 更新产品名称弹窗取消
        handleUpdateProductCancel() {
            this.updateProductModalVisible = false;
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
        // 获取用户ID和真实姓名组合
        getUserIdAndRealnameCombination() {
            // // console.log('开始请求用户ID和真实姓名组合数据...');
            httpAction('/sys/user/getUserIdAndRealnameCombination', {}, 'GET').then((res) => {
                // // console.log('请求响应:', res);
                if (res.success) {
                    // // console.log('用户ID和真实姓名组合数据:', res.result);
                    this.userIdAndRealnameList = res.result || [];
                } else {
                    // // console.log('请求失败:', res.message);
                    this.$message.warning(res.message || '获取用户数据失败');
                }
            }).catch((error) => {
                console.error('获取用户ID和真实姓名组合失败:', error);
                this.$message.error('获取用户数据失败');
            });
        },
        // 根据用户ID获取真实姓名
        getUserRealnameById(userId) {
            if (!userId || !this.userIdAndRealnameList.length) {
                return userId || '-';
            }
            const user = this.userIdAndRealnameList.find(item => item.id === userId);
            return user ? user.realname : userId;
        },
        //博拉不参与统计绑定
        batchBindingBora(channelSign) {
            if (this.selectedRowKeys.length <= 0) {
                this.$message.warning('请选择一条记录！');
                return false;
            } else {
                const selectedRows = this.dataSource.filter(item => this.selectedRowKeys.includes(item.id));

                // // console.log('博拉绑定选中的记录:', selectedRows)
                this.$refs['BindingBora'].showModal(selectedRows, channelSign);
            }
        },
        // 获取代理商字典配置
        getAgentDictConfig() {
            // 如果是泛媒体，使用 IN 查询
            if (this.queryParam.channelSign === 'CJHC,BLBL,WYMS') {
                return `tab_advertiser_info,advertiser_name,advertiser_id,del_flag = '0'`
            }
            // 其他情况使用等号查询
            return `tab_advertiser_info,advertiser_name,advertiser_id,del_flag = '0' and channel_sign = '${this.queryParam.channelSign}'`
        }
    },

}
</script>

<style scoped>
@import '~@assets/less/common.less';

.super-search-icon {
    color: rgba(0, 0, 0, .45);
}


/* 让禁用的tab看起来和正常状态一样 */
:deep(.ant-tabs-tab.ant-tabs-tab-disabled) {
    color: rgba(0, 0, 0, 0.65) !important;
    cursor: pointer !important;
}

:deep(.ant-tabs-tab.ant-tabs-tab-disabled:hover) {
    color: #1890ff !important;
}

:deep(.ant-tabs-tab.ant-tabs-tab-disabled.ant-tabs-tab-active) {
    color: #1890ff !important;
}
</style>