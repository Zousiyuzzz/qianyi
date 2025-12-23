<template>
    <div style="background-color: #fff;">
        <a-tabs default-active-key="KS" v-model="activeParentTab" @change="handleParentTabChange" tabPosition="top">
            <a-tab-pane key="KS" tab="快手" :disabled="loading">
                <!-- 快手 -->
            </a-tab-pane>
            <a-tab-pane key="DY" tab="巨量" :disabled="loading">
                <!-- 巨量 -->
            </a-tab-pane>
            <a-tab-pane key="GDT" tab="腾讯" :disabled="loading">
                <!-- 腾讯 -->
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
                            <a-form-item label="渠道名称">
                                <a-input placeholder="请输入渠道名称" v-model="queryParam.channelName"></a-input>
                            </a-form-item>
                        </a-col>
                        <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <a-form-item label="消耗日期">
                                <!-- <a-date-picker v-model="queryParam.dateTime" placeholder="请选择消耗日期" format="YYYY-MM-DD"
                                    value-format="YYYY-MM-DD" style="width: 100%" /> -->
                                <a-range-picker v-model:value="dateTime" format="YYYY-MM-DD"
                                    value-format="YYYY-MM-DD" />
                            </a-form-item>
                        </a-col>
                        <template v-if="toggleSearchStatus">

                            <a-col :xl="6" :lg="7" :md="8" :sm="24">
                                <a-form-item label="一级行业">
                                    <a-input placeholder="请输入一级行业" v-model="queryParam.industry"></a-input>
                                </a-form-item>
                            </a-col>
                            <a-col :xl="6" :lg="7" :md="8" :sm="24">
                                <a-form-item label="二级行业">
                                    <a-input placeholder="请输入二级行业" v-model="queryParam.secondIndustry"></a-input>
                                </a-form-item>
                            </a-col>
                            <a-col :xl="6" :lg="7" :md="8" :sm="24">
                                <a-form-item label="数据日期">
                                    <a-date-picker v-model="queryParam.dateTime" placeholder="请选择数据日期"
                                        style="width: 100%" />
                                </a-form-item>
                            </a-col>
                            <a-col :xl="6" :lg="7" :md="8" :sm="24">
                                <a-form-item label="产品名称">
                                    <a-input placeholder="请输入产品名称" v-model="queryParam.productName"></a-input>
                                </a-form-item>
                            </a-col>
                            <a-col :xl="6" :lg="7" :md="8" :sm="24">
                                <a-form-item label="客户ID">
                                    <a-input placeholder="请输入客户ID" v-model="queryParam.customerId"></a-input>
                                </a-form-item>
                            </a-col>
                        </template>
                        <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
                                <a-button type="primary" @click="searchQuery" icon="search"
                                    style="margin-left: 8px">查询</a-button>
                                <a-button type="primary" @click="searchReset" icon="reload"
                                    style="margin-left: 8px">重置</a-button>
                                <a-button type="primary" icon="download" @click="selectExportFileds"
                                    style="margin-left: 8px">导出</a-button>
                                <!-- <a @click="handleToggleSearch" style="margin-left: 8px">
                                    {{ toggleSearchStatus ? '收起' : '展开' }}
                                    <a-icon :type="toggleSearchStatus ? 'up' : 'down'" />
                                </a> -->
                            </span>
                        </a-col>
                    </a-row>
                </a-form>
            </div>
            <!-- 查询区域-END -->

            <!-- 操作按钮区域 -->
            <div class="table-operator">
                <!-- 高级查询区域 -->
                <!-- <j-super-query :fieldList="superFieldList" ref="superQueryModal"
                    @handleSuperQuery="handleSuperQuery"></j-super-query> -->
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

                </a-table>
            </div>
        </a-card>
    </div>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { getAction } from '@/api/manage'
import * as XLSX from 'xlsx'
import moment from 'moment'

export default {
    name: 'ConsumeList',
    mixins: [JeecgListMixin, mixinDevice],
    data() {
        return {
            queryParam: {
                channelPlatform: 'KS'
            },
            activeParentTab: 'KS',
            description: '消耗数据管理页面',
            // 通用字段配置
            commonColumns: [
                {
                    title: '广告主ID',
                    align: "center",
                    dataIndex: 'accountId',
                    customRender: (text) => {
                        // 检查text是否有效
                        if (!text || text === 'null' || text === 'undefined') {
                            return '';
                        }

                        // 使用正则表达式只保留数字
                        const numbers = text.match(/\d+/g);
                        return numbers ? numbers.join('') : '';
                    }
                },
                {
                    title: '总消耗（元）',
                    align: "center",
                    dataIndex: 'totalChargedInYuan'
                },

            ],
            endColums: [
                {
                    title: '消耗日期',
                    align: "center",
                    dataIndex: 'dateTime'
                },
                {
                    title: '渠道名称',
                    align: "center",
                    dataIndex: 'channelName'
                },
                {
                    title: '项目名称',
                    align: "center",
                    dataIndex: 'proId_pro_name'
                },
                {
                    title: '项目ID',
                    align: "center",
                    dataIndex: 'proId_unique_id'
                },
                {
                    title: '合作方式',
                    align: "center",
                    dataIndex: 'proId_collaboration_mode',
                    customRender: (text) => {
                        const type = {
                            0: '预付',
                            1: "垫付",
                            2: "服务费"
                        }
                        return text ? type[Number(text)] : ''
                    }
                },
                {
                    title: '商务',
                    align: "center",
                    dataIndex: 'proId_business_person',
                    customRender: (text) => {
                        // console.log(this.userdata)
                        // console.log(text)
                        // 检查text是否有效
                        if (!text || text === 'null' || text === 'undefined') {
                            return '';
                        }
                        // 检查userdata是否存在且包含对应的映射
                        return this.userdata && this.userdata[text] ? this.userdata[text] : text;
                    }
                },
                {
                    title: '运营',
                    align: "center",
                    dataIndex: 'proId_operation_person',
                    customRender: (text) => {
                        // console.log(this.userdata)
                        // console.log(text)
                        // 检查text是否有效
                        if (!text || text === 'null' || text === 'undefined') {
                            return '';
                        }
                        // 检查userdata是否存在且包含对应的映射
                        return this.userdata && this.userdata[text] ? this.userdata[text] : text;
                    }
                },

            ],
            dyColumns: [
                {
                    title: '授信消耗',
                    align: "center",
                    dataIndex: 'dyCreditCost'
                },
                {
                    title: '赠款消耗',
                    align: "center",
                    dataIndex: 'dyGrantCost'
                },
                {
                    title: '非赠款消耗',
                    align: "center",
                    dataIndex: 'dyNoGrantCost'
                },
                {
                    title: '预付消耗',
                    align: "center",
                    dataIndex: 'dyPrepayCost'
                },
                {
                    title: '共享授信消耗',
                    align: "center",
                    dataIndex: 'dySswCreditCost'
                },
                {
                    title: '共享预付消耗',
                    align: "center",
                    dataIndex: 'dySswPrepayCost'
                },
                {
                    title: '共享钱包消耗',
                    align: "center",
                    dataIndex: 'dySubSharedWalletCost'
                },
            ],
            txColumns: [
                {
                    title: '非预授权消耗',
                    align: "center",
                    dataIndex: 'txAcctOutPay'
                },
                {
                    title: '预授权消耗',
                    align: "center",
                    dataIndex: 'txPreauthOutPay'
                },
                {
                    title: '共享钱包消耗',
                    align: "center",
                    dataIndex: 'txShareOutPay'
                },
            ],
            ksColumns: [
                {
                    title: '现金消耗（元）',
                    align: "center",
                    dataIndex: 'realChargedInYuan'
                },
                {
                    title: '信用消耗（元）',
                    align: "center",
                    dataIndex: 'creditRealChargedInYuan'
                },
                {
                    title: '返点消耗（元）',
                    align: "center",
                    dataIndex: 'totalRebateYuan'
                },
                {
                    title: '框返消耗（元）',
                    align: "center",
                    dataIndex: 'contractRebateYuan'
                },
                {
                    title: '激励消耗（元）',
                    align: "center",
                    dataIndex: 'directRebateYuan'
                },

            ],
            url: {
                list: "/agentdata/list",
                delete: "/agentdata/delete",
                deleteBatch: "/agentdata/deleteBatch",
                exportXlsUrl: "/agentdata/exportXls",
                importExcelUrl: "agentdata/importExcel",
            },
            dictOptions: {},
            superFieldList: [],
            userdata: null,
            dateTime: [],
            exportLoading: false
        }
    },
    created() {
        this.getSuperFieldList();
        this.getUserList();
    },
    watch: {
        dateTime(newVal) {
            this.queryParam.dateTimeJoint = newVal.join(',')
        }
    },
    computed: {
        importExcelUrl: function () {
            return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
        },
        filteredColumns() {
            // 根据当前平台返回对应的列配置
            let platformColumns = [];
            if (this.activeParentTab === 'DY') {
                platformColumns = [...this.commonColumns, ...this.dyColumns, ...this.endColums];
            } else if (this.activeParentTab === 'GDT') {
                platformColumns = [...this.commonColumns, ...this.txColumns, ...this.endColums];
            } else if (this.activeParentTab === 'KS') {
                platformColumns = [...this.commonColumns, ...this.ksColumns, ...this.endColums];
            }

            return platformColumns;
        }
    },
    methods: {
        getUserList() {
            getAction("sys/user/queryUserKey").then(res => {
                if (res.success) {
                    this.userdata = res.result
                }
            })
        },
        setSuperParams() {
            this.$refs['superQueryModal'].showModal()
        },
        selectExportFileds() {
            // 校验消耗日期
            if (!this.dateTime || !Array.isArray(this.dateTime) || this.dateTime.length !== 2) {
                this.$message.warning('请选择消耗日期')
                return
            }

            const [startDate, endDate] = this.dateTime
            if (!startDate || !endDate) {
                this.$message.warning('请选择完整的消耗日期范围')
                return
            }

            // 计算日期差（天数）
            const start = moment(startDate)
            const end = moment(endDate)
            const daysDiff = end.diff(start, 'days')

            // 校验日期间隔不能超过31天
            if (daysDiff > 31) {
                this.$message.warning('消耗日期范围不能超过31天，请重新选择日期范围')
                return
            }

            // 校验通过，执行导出
            this.handleExportXls('消耗数据')
        },
        superSearchOk(superQueryParams, superQueryMatchType) {
            if (superQueryParams && superQueryParams.length > 0) {
                if (this.$refs['super-search-icon'] && this.$refs['super-search-icon'].$el) {
                    this.$refs['super-search-icon'].$el.style.color = '#1890ff'
                }
            } else {
                if (this.$refs['super-search-icon'] && this.$refs['super-search-icon'].$el) {
                    this.$refs['super-search-icon'].$el.style.color = 'rgba(0,0,0,.45)'
                }
            }
            this.handleSuperQuerytwo(superQueryParams)
        },
        searchReset() {
            const channelPlatform = this.queryParam.channelPlatform;
            this.queryParam = { channelPlatform };
            if (this.$refs['super-search-icon'] && this.$refs['super-search-icon'].$el) {
                this.$refs['super-search-icon'].$el.style.color = 'rgba(0,0,0,.45)'
            }
            this.superQueryParams = ''
            this.superQueryFlag = false
            if (this.$refs['superQueryModal']) {
                this.$refs['superQueryModal'].clearLastDataList()
            }
            this.loadData(1);
        },
        getShow(list) {
            // console.log(list)
            let target = this.activeParentTab
        },
        getQueryField() {
            var str = "id,";

            // 根据当前平台获取对应的列配置
            let platformColumns = [];
            if (this.activeParentTab === 'DY') {
                platformColumns = [...this.commonColumns, ...this.dyColumns, ...this.endColums];
            } else if (this.activeParentTab === 'GDT') {
                platformColumns = [...this.commonColumns, ...this.txColumns, ...this.endColums];
            } else if (this.activeParentTab === 'KS') {
                platformColumns = [...this.commonColumns, ...this.ksColumns, ...this.endColums];
            }

            // 构建查询字段字符串
            platformColumns.forEach((column) => {
                str += "," + column.dataIndex;
            });

            return str;
        },
        // 父级tab切换
        handleParentTabChange(activeKey) {
            this.activeParentTab = activeKey;
            this.queryParam.channelPlatform = activeKey
            this.searchQuery()
        },
        initDictConfig() {
        },
        getSuperFieldList() {
            let fieldList = [];
            fieldList.push({ type: 'string', value: 'accountId', text: '广告主ID', dictCode: '' })
            fieldList.push({ type: 'string', value: 'accountName', text: '广告主名称', dictCode: '' })
            fieldList.push({ type: 'string', value: 'corporationName', text: '企业名称', dictCode: '' })
            fieldList.push({ type: 'string', value: 'channelName', text: '渠道名称', dictCode: '' })
            fieldList.push({ type: 'string', value: 'proName', text: '项目名称', dictCode: '' })
            fieldList.push({ type: 'string', value: 'productName', text: '产品名称', dictCode: '' })
            fieldList.push({ type: 'string', value: 'industry', text: '一级行业', dictCode: '' })
            fieldList.push({ type: 'string', value: 'secondIndustry', text: '二级行业', dictCode: '' })
            fieldList.push({ type: 'string', value: 'customerId', text: '客户ID', dictCode: '' })
            fieldList.push({ type: 'string', value: 'dateTime', text: '数据日期', dictCode: '' })
            this.superFieldList = fieldList
        },
        // 处理单条数据，转换为Excel行数据
        processRowData(item, columns) {
            return columns.map(col => {
                let value = item[col.dataIndex]

                // 处理 customRender 中的格式化逻辑
                if (col.customRender && typeof col.customRender === 'function') {
                    try {
                        const rendered = col.customRender(value, item)
                        // 如果返回字符串或数字，直接使用
                        if (typeof rendered === 'string' || typeof rendered === 'number') {
                            value = rendered
                        } else if (rendered && rendered.props && rendered.props.children) {
                            // 如果是JSX元素，尝试提取文本
                            const children = rendered.props.children
                            if (Array.isArray(children)) {
                                value = children.filter(c => typeof c === 'string').join('')
                            } else if (typeof children === 'string') {
                                value = children
                            }
                        }
                    } catch (e) {
                        // 如果提取失败，使用原值
                        console.warn('处理列数据失败:', col.dataIndex, e)
                    }
                }

                // 处理特殊字段
                if (col.dataIndex === 'accountId') {
                    // 广告主ID：只保留数字
                    if (value && typeof value === 'string') {
                        const numbers = value.match(/\d+/g)
                        value = numbers ? numbers.join('') : ''
                    }
                } else if (col.dataIndex === 'proId_collaboration_mode') {
                    // 合作方式：转换为文本
                    const type = {
                        0: '预付',
                        1: '垫付',
                        2: '服务费'
                    }
                    value = value !== null && value !== undefined ? type[Number(value)] : ''
                } else if (col.dataIndex === 'proId_business_person' || col.dataIndex === 'proId_operation_person') {
                    // 商务/运营：使用userdata映射
                    if (value && this.userdata && this.userdata[value]) {
                        value = this.userdata[value]
                    }
                }

                return value !== null && value !== undefined ? value : ''
            })
        },
        // 前端导出Excel（分页获取所有数据）
        async handleFrontendExport() {
            this.exportLoading = true
            try {
                // 获取当前标签页对应的列配置
                const columns = this.filteredColumns
                const headers = columns.map(col => col.title)

                // 获取查询参数
                const baseParams = this.getQueryParams()
                const pageSize = 2000 // 每页2000条
                let pageNo = 1
                let allData = []
                let total = 0
                let hasMore = true

                // 显示提示信息
                this.$message.info('开始导出数据，请稍候...')

                // 循环分页获取所有数据
                while (hasMore) {
                    const params = {
                        ...baseParams,
                        pageNo: pageNo,
                        pageSize: pageSize
                    }

                    const response = await getAction(this.url.list, params)

                    if (!response || !response.success) {
                        throw new Error((response && response.message) || '获取数据失败')
                    }

                    // 处理返回数据
                    let list = []
                    if (Array.isArray(response.result)) {
                        list = response.result
                    } else if (response.result && Array.isArray(response.result.records)) {
                        list = response.result.records
                        if (response.result.total) {
                            total = response.result.total
                        }
                    } else if (response.result && Array.isArray(response.result.list)) {
                        list = response.result.list
                        if (response.result.total) {
                            total = response.result.total
                        }
                    }

                    if (list.length === 0) {
                        hasMore = false
                        break
                    }

                    // 处理数据并添加到总数据中
                    const processedData = list.map(item => this.processRowData(item, columns))
                    allData.push(...processedData)

                    // 判断是否还有更多数据
                    if (list.length < pageSize) {
                        hasMore = false
                    } else {
                        pageNo++
                        // 如果已知总数，判断是否已获取完
                        if (total > 0 && allData.length >= total) {
                            hasMore = false
                        }
                    }

                    // 显示进度
                    if (total > 0) {
                        const progress = Math.min(100, Math.floor((allData.length / total) * 100))
                        console.log(`导出进度: ${progress}% (${allData.length}/${total})`)
                    } else {
                        console.log(`已获取 ${allData.length} 条数据，继续获取...`)
                    }
                }

                if (allData.length === 0) {
                    this.$message.warning('没有数据可导出')
                    return
                }

                // 创建工作簿
                const wb = XLSX.utils.book_new()

                // 将表头和数据合并
                const worksheetData = [headers, ...allData]

                // 创建工作表
                const ws = XLSX.utils.aoa_to_sheet(worksheetData)

                // 设置列宽
                const colWidths = columns.map(col => {
                    // 根据列标题长度和内容类型设置合适的宽度
                    let width = Math.max(col.title.length * 2, 10)
                    if (col.dataIndex.includes('Name')) {
                        width = 20
                    } else if (col.dataIndex.includes('Id')) {
                        width = 15
                    } else if (col.dataIndex.includes('Date') || col.dataIndex.includes('Time')) {
                        width = 15
                    }
                    return { wch: width }
                })
                ws['!cols'] = colWidths

                // 添加工作表到工作簿
                const platformName = this.activeParentTab === 'KS' ? '快手' : (this.activeParentTab === 'DY' ? '巨量' : '腾讯')
                XLSX.utils.book_append_sheet(wb, ws, '消耗数据')

                // 生成文件名
                const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
                const fileName = `消耗数据_${platformName}_${timestamp}.xlsx`

                // 导出文件
                XLSX.writeFile(wb, fileName)

                this.$message.success(`成功导出 ${allData.length} 条数据`)
            } catch (error) {
                console.error('前端导出失败:', error)
                this.$message.error(`导出失败：${error.message || '请重试'}`)
            } finally {
                this.exportLoading = false
            }
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
