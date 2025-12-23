<template>
    <div class="excel-parser">
        <a-card :bordered="false">
            <div class="table-page-search-wrapper">
                <a-form layout="inline">
                    <a-row :gutter="24">
                        <a-col :md="4" :sm="24">
                            <a-form-item label="上传类型">
                                <a-select v-model="uploadType" style="width: 150px" :loading="isParsingData"
                                    :disabled="isSubmitting">
                                    <a-select-option value="material">上传素材成本</a-select-option>
                                    <a-select-option value="personnel">上传人员成本</a-select-option>
                                </a-select>
                            </a-form-item>
                        </a-col>
                        <a-col :md="4" :sm="24">
                            <a-form-item label="所属月份">
                                <a-month-picker v-model="selectedMonth" format="YYYY-MM" style="width: 150px"
                                    :disabledDate="disabledDate" placeholder="请选择月份" :disabled="isSubmitting" />
                            </a-form-item>
                        </a-col>
                        <a-col :md="4" :sm="24">
                            <a-form-item label="Excel文件">
                                <a-upload name="file" :multiple="false" :showUploadList="false"
                                    @change="debouncedHandleUploadChange" :beforeUpload="() => false"
                                    :disabled="isSubmitting">
                                    <a-button type="primary" icon="upload" :loading="isUploading">选择文件</a-button>
                                </a-upload>
                            </a-form-item>
                        </a-col>
                        <a-col :md="6" :sm="24">
                            <a-form-item>
                                <a-button type="primary" @click="handleSubmit"
                                    :disabled="!isDataFullyLoaded || !parsedData.length || isSubmitting"
                                    :loading="isSubmitting">提交数据</a-button>
                                <a-button style="margin-left: 8px" type="danger" @click="handleClear"
                                    :disabled="!parsedData.length || isClearing || isSubmitting"
                                    :loading="isClearing">清除数据</a-button>
                            </a-form-item>
                        </a-col>
                        <a-col :md="6" :sm="24">
                            <a-form-item>
                                <a-input-search v-model="searchText" placeholder="输入关键字搜索" style="width: 300px"
                                    @change="handleSearch" allowClear :loading="isSearching" :disabled="isSubmitting">
                                    <a-button slot="enterButton" :loading="isSearching">
                                        搜索
                                    </a-button>
                                </a-input-search>
                            </a-form-item>
                        </a-col>
                    </a-row>
                </a-form>
            </div>

            <!-- 进度提示 -->
            <div v-if="isParsing || isLoading" class="progress-wrapper">
                <a-progress :percent="loadProgress" :status="loadProgress === 100 ? 'success' : 'active'" />
                <div class="progress-text">
                    <template v-if="isParsing">
                        正在解析数据: {{ parseProgress }}%
                    </template>
                    <template v-else>
                        正在加载数据: {{ parsedData.length }}/{{ totalDataCount }} 条
                        ({{ loadProgress }}%)
                    </template>
                </div>
            </div>

            <!-- 数据预览表格 -->
            <div v-if="parsedData.length > 0" class="preview-table">
                <a-table :columns="tableColumns" :dataSource="displayData" :scroll="{ x: 1500, y: 500 }" size="middle"
                    bordered :rowKey="(record, index) => record.key" :loading="isTableLoading || isSubmitting">
                </a-table>
            </div>

            <template v-if="serverDataTotal > 0">
                <div style="color: #faad14; margin-bottom: 8px;">
                    已存在 {{ serverDataTotal }} 条数据（如需覆盖请先清除后再上传）
                </div>
            </template>
        </a-card>
    </div>
</template>

<script>
import { postAction } from '@/api/manage'
import { getAction } from '@/api/manage'
import * as XLSX from 'xlsx'
import moment from 'moment'

export default {
    name: 'ExcelParser',
    data() {
        return {
            uploadType: 'material',
            selectedMonth: null,
            fileData: null,
            parsedData: [],
            dynamicColumns: [],
            loading: false,
            isParsing: false,
            parseProgress: 0,
            isLoading: false,
            allData: [],
            totalDataCount: 0,
            isDataFullyLoaded: false,
            loadProgress: 0,
            editingKey: '',
            chunkSize: 1000,
            processedChunks: 0,
            searchText: '',
            filteredData: [],
            tempData: {},
            isSubmitting: false,
            isClearing: false,
            isEditing: false,
            isParsingData: false,
            isUploading: false,
            isSearching: false,
            isTableLoading: false,
            currentWorker: null, // 跟踪当前 Web Worker
            uploadDebounceTimer: null, // 防抖定时器
            decimalFields: [
                '本月总消耗', '本月总成本',
                '本月实拍消耗', '本月实拍成本',
                '本月纯剪辑消耗', '本月纯剪辑成本',
                '本月修改消耗', '本月修改成本'
            ],
            fieldMappings: {
                material: {
                    '渠道': 'channelName',
                    '客户': 'customerName',
                    '系统标识': 'systemSign',
                    '本月总消耗': 'monthTotalConsume',
                    '本月总制作条数': 'monthMakeNumber',
                    '本月总成本': 'monthCost',
                    '本月总点位': 'monthPoint',
                    '本月实拍消耗': 'monthActualShootingConsume',
                    '本月实拍制作条数': 'monthActualMakeNumber',
                    '本月实拍成本': 'monthActualShootingCost',
                    '本月实拍点位': 'monthActualShootingPoint',
                    '本月纯剪辑消耗': 'monthPureClipConsume',
                    '本月纯剪辑制作条数': 'monthPureClipMakeNumber',
                    '本月纯剪辑成本': 'monthPureClipCost',
                    '本月纯剪辑点位': 'monthPureClipPoint',
                    '本月修改消耗': 'monthUpdateConsume',
                    '本月修改制作条数': 'monthUpdateMakeNumber',
                    '本月修改成本': 'monthUpdateCost',
                    '本月修改点位': 'monthUpdatePoint'
                },
                personnel: {
                    '姓名': 'userName',
                    '公司所属': 'companyAffiliation',
                    '职务': 'position',
                    '填表负责人': 'formFiller',
                    '工资': 'wages',
                    '头条-本地推': 'ttBdt',
                    '头条-品牌': 'ttPp',
                    '头条-星图': 'ttXt',
                    '头条-千川': 'ttQc',
                    '头条-AD': 'ttAd',
                    '快手-品牌': 'ksPp',
                    '快手-大健康': 'ksDjk',
                    '快手-聚星': 'ksJx',
                    '快手-金牛': 'ksJn',
                    '快手-KA': 'ksKa',
                    '广点通': 'gdt',
                    '小红书': 'xhs',
                    '超级汇川': 'cjhc'
                }
            },
            percentageFields: ['本月总点位', '本月实拍点位', '本月纯剪辑点位', '本月修改点位'],
            integerFields: {
                material: [
                    'monthMakeNumber',
                    'monthActualMakeNumber',
                    'monthPureClipMakeNumber',
                    'monthUpdateMakeNumber'
                ],
                personnel: []
            },
            requiredPersonnelFields: ['姓名', '公司所属', '职务'],
            pointFields: {
                'monthPoint': '本月总点位',
                'monthActualShootingPoint': '本月实拍点位',
                'monthPureClipPoint': '本月纯剪辑点位',
                'monthUpdatePoint': '本月修改点位'
            },
            serverData: [],
            isCheckingServerData: false,
            serverDataTotal: 0
        }
    },
    computed: {
        displayData() {
            return this.searchText ? this.filteredData : this.parsedData
        },
        tableColumns() {
            const currentFieldMapping = this.fieldMappings[this.uploadType]
            const columns = this.dynamicColumns
                .filter(col => currentFieldMapping[col.dataIndex])
                .map(col => ({
                    ...col,
                    customRender: (text, record) => {
                        if (record.key === this.editingKey) {
                            const value = this.tempData[col.dataIndex] !== undefined ? this.tempData[col.dataIndex] : text
                            if (this.uploadType === 'material' && this.percentageFields.includes(col.dataIndex)) {
                                return this.$createElement('a-input', {
                                    style: { margin: '-5px 0' },
                                    props: { value },
                                    on: {
                                        change: (e) => this.handleChange(e.target.value, col.dataIndex)
                                    },
                                    scopedSlots: {
                                        addonAfter: () => '%'
                                    },
                                    attrs: { disabled: this.isSubmitting }
                                })
                            }
                            return this.$createElement('a-input', {
                                style: { margin: '-5px 0' },
                                props: { value },
                                on: {
                                    change: (e) => this.handleChange(e.target.value, col.dataIndex)
                                },
                                attrs: { disabled: this.isSubmitting }
                            })
                        }
                        const mappedKey = currentFieldMapping[col.dataIndex]
                        if (this.uploadType === 'material' && this.percentageFields.includes(mappedKey)) {
                            if (text === '' || text === null || text === undefined) {
                                return '0%'
                            }
                            const value = parseFloat(text)
                            if (isNaN(value)) {
                                return '0%'
                            }
                            return `${value}%`
                        }
                        return text !== undefined && text !== null ? text.toString() : '0'
                    }
                }))
            columns.push({
                title: '操作',
                key: 'action',
                fixed: 'right',
                width: 150,
                align: 'center',
                customRender: (text, record) => {
                    if (record.key === this.editingKey) {
                        return this.$createElement('div', { class: 'action-buttons' }, [
                            this.$createElement('a-button', {
                                props: { type: 'link', size: 'small' },
                                on: { click: () => this.handleSaveAll() },
                                attrs: { disabled: this.isSubmitting }
                            }, '保存'),
                            this.$createElement('a-divider', { props: { type: 'vertical' } }),
                            this.$createElement('a-button', {
                                props: { type: 'link', size: 'small' },
                                on: { click: () => this.handleCancelEdit() },
                                attrs: { disabled: this.isSubmitting }
                            }, '取消')
                        ])
                    }
                    return this.$createElement('a-button', {
                        props: { type: 'link', size: 'small' },
                        on: { click: () => this.handleEdit(record) },
                        attrs: { disabled: this.isSubmitting }
                    }, '编辑')
                }
            })
            return columns
        }
    },
    watch: {
        uploadType: {
            handler(newType) {
                this.checkServerData();
                if (!this.isParsing && !this.isLoading) {
                    this.clearData()
                    if (this.fileData) {
                        this.handleParse(true)
                    }
                }
            },
            immediate: true
        },
        selectedMonth: {
            handler() {
                this.checkServerData();
            }
        }
    },
    created() {
        // 初始化防抖函数
        this.debouncedHandleUploadChange = this.debounce(this.handleUploadChange, 500)
    },
    beforeDestroy() {
        // 组件销毁时清理 Worker 和定时器
        this.terminateWorker()
        if (this.uploadDebounceTimer) {
            clearTimeout(this.uploadDebounceTimer)
        }
    },
    methods: {
        debounce(fn, delay) {
            return (...args) => {
                if (this.uploadDebounceTimer) {
                    clearTimeout(this.uploadDebounceTimer)
                }
                this.uploadDebounceTimer = setTimeout(() => {
                    fn.apply(this, args)
                }, delay)
            }
        },
        terminateWorker() {
            if (this.currentWorker) {
                this.currentWorker.terminate()
                this.currentWorker = null
            }
        },
        clearData() {
            this.terminateWorker()
            this.fileData = null
            this.parsedData = []
            this.allData = []
            this.dynamicColumns = []
            this.isDataFullyLoaded = false
            this.loadProgress = 0
            this.totalDataCount = 0
            this.searchText = ''
            this.filteredData = []
            this.editingKey = ''
            this.tempData = {}
            this.isUploading = false
            this.isParsingData = false
            this.isTableLoading = false
            this.isParsing = false
            this.parseProgress = 0
            this.isLoading = false
            this.processedChunks = 0
        },
        handleSearch(e) {
            if (this.isSearching || this.isSubmitting) return
            const value = e.target.value
            this.searchText = value
            if (!value) {
                this.filteredData = []
                return
            }
            if (this.searchTimer) {
                clearTimeout(this.searchTimer)
            }
            this.isSearching = true
            this.isTableLoading = true
            this.searchTimer = setTimeout(() => {
                this.filteredData = this.parsedData.filter(item => {
                    return Object.values(item).some(val =>
                        String(val).toLowerCase().includes(value.toLowerCase())
                    )
                })
                setTimeout(() => {
                    this.isSearching = false
                    this.isTableLoading = false
                }, 300)
            }, 300)
        },
        handleUploadChange(info) {
            const file = info.file
            if (!file || this.isUploading || this.isSubmitting) {
                return
            }
            this.isUploading = true
            this.isTableLoading = true
            this.clearData() // 重置状态以确保干净的开始
            if (file.name.endsWith('.xls')) {
                this.$message.warning('检测到 .xls 文件，建议使用 .xlsx 格式以确保兼容性')
            }
            const reader = new FileReader()
            reader.onload = (e) => {
                this.fileData = e.target.result
                this.handleParse(true)
            }
            reader.onerror = () => {
                this.$message.error(`${file.name} 读取失败`)
                this.clearData()
            }
            reader.readAsBinaryString(file)
        },
        async handleParse(isAutoParse = false) {
            if (this.isParsingData || this.isSubmitting) {
                return
            }
            if (!this.fileData || this.isParsing) {
                if (!this.fileData) {
                    this.$message.warning('请先选择Excel文件')
                }
                this.isUploading = false
                this.isTableLoading = false
                return
            }
            this.isParsingData = true
            this.isTableLoading = true
            this.isParsing = true
            this.parseProgress = 0
            this.allData = []
            this.parsedData = []
            this.dynamicColumns = []
            this.isDataFullyLoaded = false
            this.loadProgress = 0
            this.processedChunks = 0
            try {
                this.terminateWorker() // 终止旧 Worker
                this.currentWorker = new Worker(URL.createObjectURL(new Blob([`
                    importScripts('https://cdn.sheetjs.com/xlsx-0.19.3/package/dist/xlsx.full.min.js');
                    self.onmessage = function(e) {
                        const { data, fieldMapping, requiredFields, decimalFields, percentageFields } = e.data;
                        let workbook;
                        try {
                            workbook = XLSX.read(data, { 
                                type: 'binary',
                                codepage: 936,
                                cellDates: true,
                                cellNF: true,
                                cellText: false
                            });
                        } catch (err) {
                            self.postMessage({ error: '文件解析失败，可能文件格式不受支持或编码错误：' + err.message });
                            return;
                        }
                        const firstSheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[firstSheetName];
                        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:AZ10000');
                        let headerRow = -1;
                        let headers = [];
                        const normalizeString = (str) => {
                            if (typeof str !== 'string') return '';
                            return str.replace(/[\\s\\uFEFF\\u200B]+/g, '').toLowerCase();
                        };
                        for (let R = range.s.r; R <= Math.min(range.e.r, range.s.r + 9); ++R) {
                            const rowHeaders = [];
                            for (let C = range.s.c; C <= range.e.c; ++C) {
                                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                                const cell = worksheet[cellAddress];
                                rowHeaders.push(cell ? (cell.w || cell.v || '').toString().trim() : '');
                            }
                            if (requiredFields && requiredFields.length > 0) {
                                const hasRequiredFields = requiredFields.every(field => 
                                    rowHeaders.some(header => header && normalizeString(header) === normalizeString(field))
                                );
                                if (hasRequiredFields) {
                                    headers = rowHeaders;
                                    headerRow = R;
                                    break;
                                }
                            } else {
                                headers = rowHeaders;
                                headerRow = R;
                                break;
                            }
                        }
                        if (headerRow === -1) {
                            self.postMessage({ 
                                error: \`无法找到包含所有必需字段的表头行。必需字段：\${requiredFields ? requiredFields.join(', ') : '无'}\`
                            });
                            return;
                        }
                        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
                            header: headers,
                            range: headerRow + 1,
                            defval: '0',
                            raw: true
                        });
                        jsonData.forEach(row => {
                            Object.keys(row).forEach(key => {
                                if (row[key] === '' || row[key] === null || row[key] === undefined) {
                                    row[key] = '0';
                                } else if (key === '本月总点位' || key === '本月实拍点位' || key === '本月纯剪辑点位' || key === '本月修改点位') {
                                    let value = row[key];
                                    if (typeof value === 'string' && value.includes('%')) {
                                        value = value.replace('%', '').trim();
                                        const numValue = parseFloat(value);
                                        if (!isNaN(numValue)) {
                                            row[key] = numValue.toString();
                                        } else {
                                            row[key] = '0';
                                        }
                                    } else {
                                        const numValue = parseFloat(value);
                                        if (!isNaN(numValue)) {
                                            row[key] = (numValue * 100).toString();
                                        } else {
                                            row[key] = '0';
                                        }
                                    }
                                } else if (typeof row[key] === 'number' && decimalFields.includes(key)) {
                                    if (Number.isFinite(row[key]) && row[key] % 1 !== 0) {
                                        row[key] = parseFloat(row[key]).toFixed(2);
                                    } else {
                                        row[key] = row[key].toString();
                                    }
                                } else {
                                    row[key] = row[key].toString();
                                }
                            });
                        });
                        const chunkSize = 1000;
                        const chunks = [];
                        for (let i = 0; i < jsonData.length; i += chunkSize) {
                            chunks.push(jsonData.slice(i, i + chunkSize));
                        }
                        self.postMessage({ 
                            headers, 
                            chunks,
                            totalChunks: chunks.length,
                            numRows: jsonData.length,
                            headerRow
                        });
                    };
                `], { type: 'application/javascript' })))
                this.currentWorker.onmessage = (e) => {
                    const data = e.data;
                    if (data.error) {
                        this.$message.error(data.error)
                        this.clearData()
                        return
                    }
                    if (data.headers && data.chunks) {
                        const { headers, chunks, totalChunks, numRows, headerRow } = data
                        const currentFieldMapping = this.fieldMappings[this.uploadType]
                        const filteredHeaders = headers.filter(header => header && currentFieldMapping[header])
                        const unmappedHeaders = headers.filter(header => header && !currentFieldMapping[header])
                        if (unmappedHeaders.length > 0) {
                            this.$message.warning(`以下Excel列未匹配到预期字段，将被忽略：${unmappedHeaders.join(', ')}`)
                        }
                        if (this.uploadType === 'personnel' && !this.requiredPersonnelFields.every(field => filteredHeaders.includes(field))) {
                            this.$message.error(`缺少必需字段：${this.requiredPersonnelFields.filter(f => !filteredHeaders.includes(f)).join(', ')}`)
                            this.clearData()
                            return
                        }
                        this.dynamicColumns = filteredHeaders.map(header => ({
                            title: header,
                            dataIndex: header,
                            width: 150,
                            ellipsis: true
                        }))
                        this.totalDataCount = numRows
                        this.isParsing = false
                        this.parseProgress = 100
                        if (!isAutoParse) {
                            this.$message.success('数据解析成功，开始加载数据')
                        }
                        this.processChunks(chunks, totalChunks)
                        this.isUploading = false
                        this.isParsingData = false
                        this.isTableLoading = false
                    }
                }
                this.currentWorker.onerror = (error) => {
                    this.$message.error('数据解析失败：' + error.message)
                    this.clearData()
                }
                this.currentWorker.postMessage({
                    data: this.fileData,
                    fieldMapping: this.fieldMappings[this.uploadType],
                    requiredFields: this.uploadType === 'personnel' ? this.requiredPersonnelFields : Object.keys(this.fieldMappings[this.uploadType]),
                    decimalFields: this.decimalFields,
                    percentageFields: this.percentageFields
                })
            } catch (error) {
                this.clearData()
            }
        },
        processChunks(chunks, totalChunks) {
            this.isLoading = true
            this.isTableLoading = true
            let currentChunk = 0
            const processNextChunk = () => {
                if (currentChunk >= chunks.length) {
                    this.isLoading = false
                    this.isTableLoading = false
                    this.isDataFullyLoaded = true
                    this.parsedData = this.allData
                    this.$message.success(`数据加载完成，共 ${this.totalDataCount} 条`)
                    this.isUploading = false
                    this.terminateWorker()
                    return
                }
                const chunk = chunks[currentChunk]
                const chunkData = chunk.map((item, index) => ({
                    ...item,
                    key: `${this.allData.length + index}-${Date.now()}`
                }))
                this.allData = [...this.allData, ...chunkData]
                this.processedChunks++
                this.loadProgress = Math.floor((this.processedChunks / totalChunks) * 100)
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        currentChunk++
                        processNextChunk()
                    }, 0)
                })
            }
            processNextChunk()
        },
        handleEdit(record) {
            if (this.isEditing || this.isSubmitting) return
            if (this.editingKey) {
                this.handleSaveAll()
            }
            this.isEditing = true
            this.editingKey = record.key
            this.tempData = JSON.parse(JSON.stringify(record))
            if (this.uploadType === 'material') {
                Object.keys(this.tempData).forEach(key => {
                    if (this.percentageFields.includes(key)) {
                        const value = parseFloat(this.tempData[key])
                        if (!isNaN(value)) {
                            this.$set(this.tempData, key, value.toString())
                        }
                    }
                })
            }
            this.isEditing = false
        },
        handleChange(value, dataIndex) {
            if (!this.tempData) {
                this.tempData = {}
            }
            if (this.uploadType === 'material' && this.percentageFields.includes(dataIndex)) {
                const numValue = parseFloat(value.replace('%', ''))
                if (!isNaN(numValue)) {
                    this.$set(this.tempData, dataIndex, numValue.toString())
                } else {
                    this.$set(this.tempData, dataIndex, '0')
                }
            } else {
                this.$set(this.tempData, dataIndex, value)
            }
        },
        handleSaveAll() {
            if (this.isEditing || this.isSubmitting) return
            if (this.editingKey === '') {
                return
            }
            this.isEditing = true
            try {
                const target = this.parsedData.find(item => item.key === this.editingKey)
                if (target) {
                    Object.keys(this.tempData).forEach(key => {
                        if (key !== 'key') {
                            this.$set(target, key, this.tempData[key])
                        }
                    })
                    const allDataIndex = this.allData.findIndex(item => item.key === this.editingKey)
                    if (allDataIndex !== -1) {
                        Object.keys(this.tempData).forEach(key => {
                            if (key !== 'key') {
                                this.$set(this.allData[allDataIndex], key, this.tempData[key])
                            }
                        })
                    }
                    this.editingKey = ''
                    this.tempData = {}
                    this.$message.success('保存成功')
                } else {
                    this.$message.error('保存失败：未找到目标行')
                }
            } catch (error) {
                this.$message.error('保存失败，请重试')
            } finally {
                this.isEditing = false
            }
        },
        handleCancelEdit() {
            if (this.isSubmitting) return
            this.editingKey = ''
            this.tempData = {}
        },
        handleSubmit() {
            if (this.isSubmitting) return
            if (!this.isDataFullyLoaded) {
                this.$message.warning('请等待数据完全加载完成')
                return
            }
            if (!this.parsedData.length) {
                this.$message.warning('没有可提交的数据')
                return
            }
            if (!this.selectedMonth) {
                this.$message.warning('请选择所属月份')
                return
            }
            this.isSubmitting = true
            this.loading = true
            const submitData = this.allData.map(item => {
                const { editable, key, ...rest } = item
                const mappedData = {}
                Object.keys(rest).forEach(key => {
                    const mappedKey = this.fieldMappings[this.uploadType][key]
                    if (mappedKey) {
                        let value = rest[key]
                        if (key === '本月总点位' || key === '本月实拍点位' || key === '本月纯剪辑点位' || key === '本月修改点位') {
                            if (value === '' || value === null || value === undefined) {
                                mappedData[mappedKey] = 0
                            } else {
                                const numValue = parseFloat(value)
                                mappedData[mappedKey] = isNaN(numValue) ? 0 : numValue / 100
                            }
                        } else if (this.integerFields[this.uploadType].includes(mappedKey)) {
                            if (value === '' || value === null || value === undefined) {
                                mappedData[mappedKey] = 0
                            } else {
                                const numValue = parseInt(value)
                                mappedData[mappedKey] = isNaN(numValue) ? 0 : numValue
                            }
                        } else if (mappedKey === 'wages' || mappedKey.includes('consume') || mappedKey.includes('cost')) {
                            if (value === '' || value === null || value === undefined) {
                                mappedData[mappedKey] = 0
                            } else {
                                const numValue = parseFloat(value)
                                mappedData[mappedKey] = isNaN(numValue) ? 0 : numValue
                            }
                        } else {
                            if (value === '' || value === null || value === undefined) {
                                mappedData[mappedKey] = '0'
                            } else {
                                mappedData[mappedKey] = value
                            }
                        }
                    }
                })

                if (this.uploadType === 'material') {
                    const systemSign = rest['系统标识']
                    if (systemSign === '0' || !systemSign) {
                        mappedData['systemNum'] = 0
                    } else {
                        mappedData['systemNum'] = systemSign.split(',').filter(id => id.trim() !== '').length
                    }
                }

                return mappedData
            })
            const apiUrl = this.uploadType === 'material'
                ? '/materialCost/batchAdd'
                : '/usersCost/batchAdd'
            postAction(apiUrl, {
                [this.uploadType === 'material' ? 'materialCosts' : 'usersCosts']: submitData,
                dateDffilation: this.selectedMonth.format('YYYY-MM')
            }).then(res => {
                if (res.success) {
                    this.$message.success('数据提交成功')
                    this.$emit('submit-success')
                } else {
                    this.$message.error(res.message || '数据提交失败')
                }
            }).catch(error => {
                this.$message.error('提交失败：' + error.message)
            }).finally(() => {
                this.loading = false
                this.isSubmitting = false
            })
        },
        handleClear() {
            if (this.isClearing || this.isSubmitting) return
            this.$confirm({
                title: '确认清除',
                content: '确定要清除所有已加载的数据吗？',
                okText: '确定',
                okType: 'danger',
                cancelText: '取消',
                onOk: () => {
                    this.isClearing = true
                    this.loading = true
                    this.clearData()
                    this.selectedMonth = null
                    this.$message.success('数据已清除')
                    this.isClearing = false
                    this.loading = false
                    this.isSubmitting = false;
                    this.isUploading = false;
                }
            })
        },
        disabledDate(current) {
            return current && current > moment().endOf('month')
        },
        async checkServerData() {
            if (!this.selectedMonth) return;
            this.isCheckingServerData = true;
            this.isTableLoading = true;
            this.serverData = [];
            this.serverDataTotal = 0;
            let pageNo = 1, pageSize = 1000, total = 0, allData = [];
            const apiUrl = this.uploadType === 'material' ? '/materialCost/list' : '/usersCost/list';
            const params = {
                pageNo,
                pageSize
            };
            if (this.selectedMonth) {
                params.dateDffilation = this.selectedMonth.format ? this.selectedMonth.format('YYYY-MM') : this.selectedMonth;
            }
            try {
                while (true) {
                    params.pageNo = pageNo;
                    const res = await getAction(apiUrl, params);
                    if (res.success && res.result) {
                        let records = res.result.records || [];
                        let t = res.result.total || 0;
                        allData = allData.concat(records);
                        total = t;
                        if (allData.length >= total) break;
                        pageNo++;
                    } else {
                        break;
                    }
                }
                this.serverData = allData;
                this.serverDataTotal = total;
                if (total > 0) {
                    // 用 fieldMappings 的中文表头生成 dynamicColumns
                    const mapping = this.fieldMappings[this.uploadType];
                    this.dynamicColumns = Object.keys(mapping).map(header => ({
                        title: header,
                        dataIndex: header,
                        width: 150,
                        ellipsis: true
                    }));
                    // 还原 parsedData 为"中文表头"结构
                    this.parsedData = allData.map((item, idx) => {
                        const row = {};
                        Object.keys(mapping).forEach(header => {
                            row[header] = item[mapping[header]];
                        });
                        row.key = idx + '-' + Date.now();
                        return row;
                    });
                    this.allData = [...this.parsedData];
                    this.isDataFullyLoaded = true;
                    this.isSubmitting = false;
                    this.isUploading = false;
                } else {
                    this.parsedData = [];
                    this.allData = [];
                    this.isDataFullyLoaded = false;
                    this.dynamicColumns = [];
                    this.isSubmitting = false;
                    this.isUploading = false;
                }
                if (this.selectedMonth) {
                    if (total > 0) {
                        this.$message.info(`该类型和月份下已存在${total}条数据`);
                    } else {
                        this.$message.success('该类型和月份下暂无数据');
                    }
                }
            } catch (e) {
                this.$message.error('查询已有数据失败');
            } finally {
                this.isCheckingServerData = false;
                this.isTableLoading = false;
            }
        }
    }
}
</script>

<style lang="less" scoped>
.excel-parser {
    .preview-table {
        margin-top: 16px;
    }

    .ant-upload-list {
        margin-top: 8px;
    }

    .progress-wrapper {
        margin: 16px 0;

        .progress-text {
            margin-top: 8px;
            text-align: center;
        }
    }

    .editable-cell {
        padding: 5px 12px;
        cursor: pointer;

        &:hover {
            background: #f5f5f5;
        }
    }

    .ant-table-cell {
        padding: 4px !important;
    }

    .search-wrapper {
        margin: 16px 0;
        display: flex;
        align-items: center;

        .search-tip {
            margin-left: 16px;
            color: rgba(0, 0, 0, 0.45);
        }
    }

    .action-buttons {
        white-space: nowrap;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 120px;

        .ant-btn {
            padding: 0 8px;
        }

        .ant-divider {
            margin: 0 4px;
        }
    }
}
</style>