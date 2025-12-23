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
                    <div style="border: 1px solid #d9d9d9; border-radius: 4px; padding: 10px; background: #fafafa; height:auto"">
                                                <a-table v-if="compareData.afterTable.length > 0" ref="afterTable"
                        :columns="jsonTableColumns"
                        :dataSource="compareData.afterTable" :pagination="false" size="small" bordered
                        :row-class-name="getAfterRowClassName">
                        <template slot="keyColumn" slot-scope="text">
                            <span :style="{ color: getFieldColor(text, 'after') }">{{ getFieldDisplayName(text)
                            }}</span>
                        </template>
                        <template slot="valueColumn" slot-scope="text, record">
                            <span :style="{ color: getFieldColor(record.key, 'after') }">{{ formatValue(text) }}</span>
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
    name: 'UpdateLogModal',
    mixins: [JeecgListMixin],
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        projectId: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            description: '项目修改记录',
            // 表头
            columns: [
                {
                    title: '修改人',
                    align: "center",
                    dataIndex: 'createBy',
                    width: 150
                },
                {
                    title: '修改时间',
                    align: "center",
                    dataIndex: 'createTime',
                    width: 150
                },
                {
                    title: '修改前数据',
                    align: "center",
                    dataIndex: 'updateFrontJson',
                    width: 200,
                    customRender: function (text) {
                        if (!text) return '';
                        return text.length > 30 ? text.substring(0, 30) + '...' : text;
                    }
                },
                {
                    title: '修改后数据',
                    align: "center",
                    dataIndex: 'updateAfterJson',
                    width: 200,
                    customRender: function (text) {
                        if (!text) return '';
                        return text.length > 30 ? text.substring(0, 30) + '...' : text;
                    }
                },
                {
                    title: '操作',
                    align: "center",
                    dataIndex: 'action',
                    width: 120,
                    scopedSlots: { customRender: 'action' }
                }
            ],
            url: {
                list: "/projectManageUpdateLog/list"
            },
            queryParam: {
                projectId: '',
                dateRange: [],
                column: 'createTime',
                order: 'desc'
            },
            // 数据对比相关
            compareVisible: false,
            compareData: {
                before: '',
                after: '',
                beforeTable: [],
                afterTable: []
            },
            // JSON表格列配置
            jsonTableColumns: [
                {
                    title: '字段名',
                    dataIndex: 'key',
                    key: 'key',
                    width: 150,
                    align: "center",
                    ellipsis: true,
                    scopedSlots: { customRender: 'keyColumn' }
                },
                {
                    title: '字段内容',
                    dataIndex: 'value',
                    key: 'value',
                    align: "center",
                    ellipsis: true,
                    scopedSlots: { customRender: 'valueColumn' }
                }
            ],
            // 滚动联动控制
            isScrolling: false
        }
    },
    watch: {
        visible(val) {
            if (val && this.projectId) {
                this.queryParam.projectId = this.projectId
                this.loadData()
            }
        },
        projectId(val) {
            if (val) {
                this.queryParam.projectId = val
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
                projectId: this.projectId,
                dateRange: []
            }
            this.loadData(1)
        },
        loadData(arg) {
            if (!this.url.list) {
                this.$message.error("请设置url.list属性!")
                return
            }
            //加载数据 若传入参数1则加载第一页的内容
            if (arg === 1) {
                this.ipagination.current = 1
            }
            var params = this.getQueryParams()//查询条件
            this.loading = true
            this.$http.get(this.url.list, { params: params }).then((res) => {
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
            if (this.queryParam.dateRange && this.queryParam.dateRange.length === 2) {
                param.startDate = formatDate(this.queryParam.dateRange[0], 'YYYY-MM-DD')
                param.endDate = formatDate(this.queryParam.dateRange[1], 'YYYY-MM-DD')
            }
            delete param.dateRange
            return param
        },
        // 显示数据对比弹窗
        showDataCompare(record) {
            this.compareData.before = record.updateFrontJson || ''
            this.compareData.after = record.updateAfterJson || ''
            // 将JSON转换为表格数据
            this.compareData.beforeTable = this.jsonToTableData(record.updateFrontJson)
            this.compareData.afterTable = this.jsonToTableData(record.updateAfterJson)
            this.compareVisible = true
        },
        // 关闭数据对比弹窗
        handleCompareCancel() {
            this.compareVisible = false
            this.compareData = {
                before: '',
                after: '',
                beforeTable: [],
                afterTable: []
            }
        },
        // 格式化JSON数据
        formatJson(jsonString) {
            if (!jsonString) return '无数据'
            try {
                const obj = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString
                return JSON.stringify(obj, null, 2)
            } catch (error) {
                return jsonString
            }
        },
        // 将JSON转换为表格数据
        jsonToTableData(jsonString) {
            // 预定义的所有字段列表
            const allFields = [
                'proName', 'proAbbr', 'uniqueId', 'aePerson_dictText', 'salesPersonId_dictText',
                'operationPerson_dictText', 'businessPerson_dictText',
                'collaborationMode_dictText', 'paymentMethod_dictText',
                'beginDate', 'endDate', 'productName_dictText', 'rebate', 'customerId', 'customerName',
                'businessName', 'businessSign', 'productIds_dictText', 'cooperationStatus_dictText'
            ]

            const tableData = []

            let obj = {}
            if (jsonString) {
                try {
                    obj = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString
                } catch (error) {
                    // 解析失败，所有字段值为空
                }
            }

            allFields.forEach(field => {
                tableData.push({
                    key: field,
                    value: obj[field] !== undefined ? obj[field] : null
                })
            })
            return tableData
        },
        // 获取字段显示名称
        getFieldDisplayName(key) {
            const translateObj = {
                proName: '项目名称',
                proAbbr: '项目简称',
                uniqueId: '唯一标识',
                aePerson_dictText: 'AE负责人',
                salesPersonId_dictText: '销售负责人',
                operationPerson_dictText: '运营人员',
                businessPerson_dictText: '商务人员',
                collaborationMode_dictText: '合作模式',
                paymentMethod_dictText: '付款方式',
                beginDate: '开始日期',
                endDate: '结束日期',
                productName_dictText: '产品名称',
                rebate: '返点',
                customerId: '客户ID',
                customerName: '客户名称',
                businessName: '业务名称',
                businessSign: '业务标识',
                productIds_dictText: '产品ID列表',
                cooperationStatus_dictText: '合作状态'
            }
            return translateObj[key] || key;
        },
        // 格式化值显示
        formatValue(value) {
            if (value === null || value === undefined) return ''
            if (typeof value === 'object') return JSON.stringify(value)
            return String(value)
        },
        // 获取字段颜色（用于高亮）
        getFieldColor(key, side) {
            if (!this.compareData.beforeTable.length || !this.compareData.afterTable.length) {
                return '#333'
            }

            // 找到对应的数据
            const beforeRecord = this.compareData.beforeTable.find(item => item.key === key)
            const afterRecord = this.compareData.afterTable.find(item => item.key === key)

            // 如果字段只存在于一侧，说明是新增或删除的字段
            if (!beforeRecord && afterRecord) {
                return side === 'after' ? '#52c41a' : '#333' // 绿色表示新增
            }
            if (beforeRecord && !afterRecord) {
                return side === 'before' ? '#ff4d4f' : '#333' // 红色表示删除
            }

            // 如果字段存在于两侧，比较值是否相同
            if (beforeRecord && afterRecord) {
                const beforeValue = this.formatValue(beforeRecord.value)
                const afterValue = this.formatValue(afterRecord.value)

                if (beforeValue !== afterValue) {
                    return side === 'before' ? '#ff4d4f' : '#52c41a' // 红色表示修改前，绿色表示修改后
                }
            }

            return '#333' // 默认颜色
        },
        // 获取左侧表格行样式
        getBeforeRowClassName(record) {
            const key = record.key
            const beforeRecord = this.compareData.beforeTable.find(item => item.key === key)
            const afterRecord = this.compareData.afterTable.find(item => item.key === key)

            if (!beforeRecord && afterRecord) {
                return 'row-deleted' // 删除的字段
            }
            if (beforeRecord && afterRecord) {
                const beforeValue = this.formatValue(beforeRecord.value)
                const afterValue = this.formatValue(afterRecord.value)
                if (beforeValue !== afterValue) {
                    return 'row-modified' // 修改的字段
                }
            }
            return ''
        },
        // 获取右侧表格行样式
        getAfterRowClassName(record) {
            const key = record.key
            const beforeRecord = this.compareData.beforeTable.find(item => item.key === key)
            const afterRecord = this.compareData.afterTable.find(item => item.key === key)

            if (beforeRecord && !afterRecord) {
                return 'row-deleted' // 删除的字段
            }
            if (beforeRecord && afterRecord) {
                const beforeValue = this.formatValue(beforeRecord.value)
                const afterValue = this.formatValue(afterRecord.value)
                if (beforeValue !== afterValue) {
                    return 'row-modified' // 修改的字段
                }
            }
            return ''
        }
    }
}
</script>

<style scoped>
@import '~@assets/less/common.less';

/* 数据对比表格高亮样式 */
.row-modified {
    background-color: #fff7e6 !important;
}

.row-deleted {
    background-color: #fff2f0 !important;
}

/* 确保高亮样式优先级 */
.ant-table-tbody>tr.row-modified>td {
    background-color: #fff7e6 !important;
}

.ant-table-tbody>tr.row-deleted>td {
    background-color: #fff2f0 !important;
}

/* 悬停效果 */
.ant-table-tbody>tr.row-modified:hover>td {
    background-color: #ffe7ba !important;
}

.ant-table-tbody>tr.row-deleted:hover>td {
    background-color: #ffccc7 !important;
}
</style>