<template>
    <a-modal title="修改记录" :visible="visible" :width="1200" @cancel="handleCancel" :footer="null">
        <div>
            <!-- 查询区域 -->
            <div class="table-page-search-wrapper">
                <a-form layout="inline" @keyup.enter.native="searchQuery">
                    <a-row :gutter="24">
                        <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <a-form-item label="修改人">
                                <JSearchSelectTag placeholder="请输入修改人" v-model:value="queryParam.createBy"
                                    dict="sys_user,realname,username,del_flag = '0'" async>
                                </JSearchSelectTag>
                            </a-form-item>
                        </a-col>
                        <a-col :xl="6" :lg="7" :md="8" :sm="24">
                            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
                                <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
                                <a-button type="primary" @click="searchReset" icon="reload"
                                    style="margin-left: 8px">重置</a-button>
                            </span>
                        </a-col>
                    </a-row>
                </a-form>
            </div>
            <!-- 表格区域 -->
            <a-table ref="table" size="middle" :scroll="{ x: true }" bordered rowKey="id" :columns="columns"
                :dataSource="dataSource" :pagination="ipagination" :loading="loading" @change="handleTableChange"
                class="j-table-force-nowrap">
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
                    <a-button v-else :ghost="true" type="primary" icon="download" size="small"
                        @click="downloadFile(text)">
                        下载
                    </a-button>
                </template>
                <template slot="action" slot-scope="text, record">
                    <a-button type="primary" size="small" @click="showDataCompare(record)">
                        数据对比
                    </a-button>
                </template>
            </a-table>
        </div>
        <!-- 数据对比弹窗 -->
        <a-modal title="数据对比" :visible="compareVisible" :width="1400" @cancel="handleCompareCancel" :footer="null"
            :destroyOnClose="true">
            <div style="display: flex; gap: 20px;height: 400px;overflow-y: auto;">
                <!-- 修改前数据 -->
                <div style="flex: 1;">
                    <h4 style="margin-bottom: 10px; color: #ff4d4f;">修改前数据</h4>
                    <div
                        style="border: 1px solid #d9d9d9; border-radius: 4px; padding: 10px; background: #fafafa; height:auto">
                        <a-table v-if="compareData.beforeTable.length > 0" ref="beforeTable" :columns="jsonTableColumns"
                            :dataSource="compareData.beforeTable" :pagination="false" size="small" bordered
                            :row-class-name="getBeforeRowClassName">
                            <template slot="keyColumn" slot-scope="text">
                                <span :style="{ color: getFieldColor(text, 'before') }">{{ getFieldDisplayName(text)
                                }}</span>
                            </template>
                            <template slot="valueColumn" slot-scope="text, record">
                                <span :style="{ color: getFieldColor(record.key, 'before') }">{{ formatValue(text)
                                }}</span>
                            </template>
                        </a-table>
                        <div v-else style="text-align: center; color: #999; padding: 20px;">
                            无数据
                        </div>
                    </div>
                </div>
                <!-- 修改后数据 -->
                <div style="flex: 1;">
                    <h4 style="margin-bottom: 10px; color: #52c41a;">修改后数据</h4>
                    <div
                        style="border: 1px solid #d9d9d9; border-radius: 4px; padding: 10px; background: #fafafa; height:auto">
                        <a-table v-if="compareData.afterTable.length > 0" ref="afterTable" :columns="jsonTableColumns"
                            :dataSource="compareData.afterTable" :pagination="false" size="small" bordered
                            :row-class-name="getAfterRowClassName">
                            <template slot="keyColumn" slot-scope="text">
                                <span :style="{ color: getFieldColor(text, 'after') }">{{ getFieldDisplayName(text)
                                }}</span>
                            </template>
                            <template slot="valueColumn" slot-scope="text, record">
                                <span :style="{ color: getFieldColor(record.key, 'after') }">{{ formatValue(text)
                                }}</span>
                            </template>
                        </a-table>
                        <div v-else style="text-align: center; color: #999; padding: 20px;">
                            无数据
                        </div>
                    </div>
                </div>
            </div>
        </a-modal>
    </a-modal>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { formatDate } from '@/utils/date'

export default {
    name: 'CustomerUpdateLogModal',
    mixins: [JeecgListMixin],
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        customerId: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            description: '客户修改记录',
            columns: [
                { title: '修改人', align: 'center', dataIndex: 'createBy', width: 150 },
                { title: '修改时间', align: 'center', dataIndex: 'createTime', width: 150 },
                { title: '修改前数据', align: 'center', dataIndex: 'updateFrontJson', width: 200, customRender: text => text ? (text.length > 30 ? text.substring(0, 30) + '...' : text) : '' },
                { title: '修改后数据', align: 'center', dataIndex: 'updateAfterJson', width: 200, customRender: text => text ? (text.length > 30 ? text.substring(0, 30) + '...' : text) : '' },
                { title: '操作', align: 'center', dataIndex: 'action', width: 120, scopedSlots: { customRender: 'action' } }
            ],
            url: {
                list: '/customerManageUpdateLog/list' // 需后端提供客户修改记录接口
            },
            queryParam: {
                customerId: '',
                createBy: '',
                column: 'createTime',
                order: 'desc'
            },
            compareVisible: false,
            compareData: {
                before: '',
                after: '',
                beforeTable: [],
                afterTable: []
            },
            jsonTableColumns: [
                { title: '字段名', dataIndex: 'key', key: 'key', width: 150, align: 'center', ellipsis: true, scopedSlots: { customRender: 'keyColumn' } },
                { title: '字段内容', dataIndex: 'value', key: 'value', align: 'center', ellipsis: true, scopedSlots: { customRender: 'valueColumn' } }
            ],
            isScrolling: false
        }
    },
    watch: {
        visible(val) {
            if (val && this.customerId) {
                this.queryParam.customerId = this.customerId
                this.loadData()
            }
        },
        customerId(val) {
            if (val) {
                this.queryParam.customerId = val
            }
        }
    },
    methods: {
        handleCancel() {
            this.$emit('cancel')
        },
        searchQuery() {
            this.loadData(1)
        },
        searchReset() {
            this.queryParam = {
                customerId: this.customerId,
                createBy: ''
            }
            this.loadData(1)
        },
        loadData(arg) {
            if (!this.url.list) {
                this.$message.error('请设置url.list属性!')
                return
            }
            if (arg === 1) {
                this.ipagination.current = 1
            }
            var params = this.getQueryParams()
            this.loading = true
            this.$http.get(this.url.list, { params: params }).then(res => {
                if (res.success) {
                    this.dataSource = res.result.records
                    this.ipagination.total = res.result.total
                }
                if (res.code === 510) {
                    this.$message.warning(res.message)
                }
                this.loading = false
            })
        },
        getQueryParams() {
            let param = Object.assign({}, this.queryParam)
            delete param.dateRange
            return param
        },
        showDataCompare(record) {
            this.compareData.before = record.updateFrontJson || ''
            this.compareData.after = record.updateAfterJson || ''
            this.compareData.beforeTable = this.jsonToTableData(record.updateFrontJson)
            this.compareData.afterTable = this.jsonToTableData(record.updateAfterJson)
            this.compareVisible = true
        },
        handleCompareCancel() {
            this.compareVisible = false
            this.compareData = {
                before: '',
                after: '',
                beforeTable: [],
                afterTable: []
            }
        },
        formatJson(jsonString) {
            if (!jsonString) return '无数据'
            try {
                const obj = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString
                return JSON.stringify(obj, null, 2)
            } catch (error) {
                return jsonString
            }
        },
        jsonToTableData(jsonString) {
            // 适配客户管理的字段
            const allFields = [
                'customerName', 'customerState_dictText', 'salesPerson_dictText', 'aePerson_dictText',
                'isGratuity_dictText', 'attribute_dictText', 'operationMode_dictText', 'industry', 'products',
                'intervalDays', 'sustomerUnique', 'labels', 'mediaPlacement'
            ]
            const tableData = []
            let obj = {}
            if (jsonString) {
                try {
                    obj = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString
                } catch (error) { }
            }
            allFields.forEach(field => {
                tableData.push({
                    key: field,
                    value: obj[field] !== undefined ? obj[field] : null
                })
            })
            return tableData
        },
        getFieldDisplayName(key) {
            const translateObj = {
                customerName: '客户名称',
                customerState_dictText: '合作状态',
                salesPerson_dictText: '销售',
                aePerson_dictText: 'AE',
                isGratuity_dictText: '是否服务费',
                attribute_dictText: '客户属性',
                operationMode_dictText: '运营模式',
                industry: '客户初始行业',
                products: '客户产品',
                intervalDays: '客户回款间隔天数',
                sustomerUnique: '客户标识',
                labels: '标签',
                mediaPlacement: '投放媒体'
            }
            return translateObj[key] || key
        },
        formatValue(value) {
            if (value === null || value === undefined) return ''
            if (typeof value === 'object') return JSON.stringify(value)
            return String(value)
        },
        getFieldColor(key, side) {
            if (!this.compareData.beforeTable.length || !this.compareData.afterTable.length) {
                return '#333'
            }
            const beforeRecord = this.compareData.beforeTable.find(item => item.key === key)
            const afterRecord = this.compareData.afterTable.find(item => item.key === key)
            if (!beforeRecord && afterRecord) {
                return side === 'after' ? '#52c41a' : '#333'
            }
            if (beforeRecord && !afterRecord) {
                return side === 'before' ? '#ff4d4f' : '#333'
            }
            if (beforeRecord && afterRecord) {
                const beforeValue = this.formatValue(beforeRecord.value)
                const afterValue = this.formatValue(afterRecord.value)
                if (beforeValue !== afterValue) {
                    return side === 'before' ? '#ff4d4f' : '#52c41a'
                }
            }
            return '#333'
        },
        getBeforeRowClassName(record) {
            const key = record.key
            const beforeRecord = this.compareData.beforeTable.find(item => item.key === key)
            const afterRecord = this.compareData.afterTable.find(item => item.key === key)
            if (!beforeRecord && afterRecord) {
                return 'row-deleted'
            }
            if (beforeRecord && afterRecord) {
                const beforeValue = this.formatValue(beforeRecord.value)
                const afterValue = this.formatValue(afterRecord.value)
                if (beforeValue !== afterValue) {
                    return 'row-modified'
                }
            }
            return ''
        },
        getAfterRowClassName(record) {
            const key = record.key
            const beforeRecord = this.compareData.beforeTable.find(item => item.key === key)
            const afterRecord = this.compareData.afterTable.find(item => item.key === key)
            if (beforeRecord && !afterRecord) {
                return 'row-deleted'
            }
            if (beforeRecord && afterRecord) {
                const beforeValue = this.formatValue(beforeRecord.value)
                const afterValue = this.formatValue(afterRecord.value)
                if (beforeValue !== afterValue) {
                    return 'row-modified'
                }
            }
            return ''
        }
    }
}
</script>

<style scoped>
@import '~@assets/less/common.less';

.row-modified {
    background-color: #fff7e6 !important;
}

.row-deleted {
    background-color: #fff2f0 !important;
}

.ant-table-tbody>tr.row-modified>td {
    background-color: #fff7e6 !important;
}

.ant-table-tbody>tr.row-deleted>td {
    background-color: #fff2f0 !important;
}

.ant-table-tbody>tr.row-modified:hover>td {
    background-color: #ffe7ba !important;
}
</style>