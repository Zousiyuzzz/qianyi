<template>
    <view class="select-drawer-wrapper" :class="{ 'select-drawer-show': visible && showDrawer }"
        @click.stop="handleMaskClick" v-if="visible || showDrawer">
        <view class="select-drawer-content" :class="{ 'select-drawer-content-show': visible && showDrawer }"
            @click.stop>
            <!-- Header -->
            <view class="select-drawer-header">
                <text class="select-drawer-title">{{ title || '请选择' }}</text>
                <text class="select-drawer-close" @click.stop="handleClose">×</text>
            </view>

            <!-- Search -->
            <view class="select-drawer-search" v-if="searchable">
                <view class="search-input-wrapper">
                    <text class="search-icon">🔎</text>
                    <input class="search-input" v-model="searchKeyword" :placeholder="searchPlaceholder || '搜索'"
                        @input="handleSearch" @confirm="handleSearch" confirm-type="search" />
                    <text class="search-clear" v-if="searchKeyword" @click.stop="clearSearch">×</text>
                </view>
            </view>

            <!-- List -->
            <scroll-view class="select-drawer-body" scroll-y @scrolltolower="loadMore" lower-threshold="100"
                enable-back-to-top="false" enable-flex="false">
                <!-- Loading -->
                <view class="select-loading" v-if="loading && dataList.length === 0">
                    <text>加载中...</text>
                </view>

                <!-- List Items -->
                <view class="select-item" v-for="(item, index) in dataList" :key="getItemKey(item, index)"
                    @click.stop="handleSelect(item)" :class="{ 'select-item-selected': isSelected(item) }">
                    <text class="select-item-text">{{ getItemText(item) }}</text>
                    <text class="select-item-check" v-if="isSelected(item)">✓</text>
                </view>

                <!-- Load More -->
                <view class="select-load-more" v-if="loading && dataList.length > 0">
                    <text>加载中...</text>
                </view>
                <view class="select-no-more" v-if="!hasMore && dataList.length > 0">
                    <text>没有更多了</text>
                </view>

                <!-- Empty -->
                <view class="select-empty" v-if="!loading && dataList.length === 0">
                    <text>暂无数据</text>
                </view>
            </scroll-view>
        </view>
    </view>
</template>

<script>
import { request } from '../common/api/request'

export default {
    name: 'SelectDrawer',
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: '请选择'
        },
        // 当前选中的值
        value: {
            type: [String, Number],
            default: null
        },
        // 字典配置（类似 JSearchSelectTag 的 dict）
        // 格式: "table,text,code" 或 "dictCode"
        dict: {
            type: String,
            default: ''
        },
        // 字典项选项（类似 dictOptions）
        dictOptions: {
            type: Array,
            default: () => []
        },
        // 是否异步加载（类似 JSearchSelectTag 的 async）
        async: {
            type: Boolean,
            default: false
        },
        // 占位符
        placeholder: {
            type: String,
            default: '请选择'
        },
        // 是否可搜索
        searchable: {
            type: Boolean,
            default: true
        },
        // 搜索占位符
        searchPlaceholder: {
            type: String,
            default: '搜索'
        },
        // 每页大小
        pageSize: {
            type: Number,
            default: 20
        },
        // 是否禁用
        disabled: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            showDrawer: false,
            loading: false,
            hasMore: true,
            pageNo: 1,
            searchKeyword: '',
            dataList: [],
            allDataList: [], // 用于本地搜索
            lastLoad: 0, // 用于异步加载防抖
            searchTimer: null // 搜索防抖定时器
        }
    },
    watch: {
        visible(newVal) {
            if (newVal) {
                this.showDrawer = true
                // 确保元素渲染后再触发动画
                this.$nextTick(() => {
                    // 先渲染元素，再触发动画
                    setTimeout(() => {
                        this.init()
                    }, 10)
                })
            } else {
                // 关闭时重置状态
                this.loading = false
                clearTimeout(this.searchTimer)
                this.searchKeyword = ''
                // 先触发关闭动画，再移除元素
                setTimeout(() => {
                    this.showDrawer = false
                    this.dataList = []
                    this.allDataList = []
                }, 300)
            }
        },
        dictOptions: {
            handler(newVal) {
                if (newVal && newVal.length > 0 && !this.async) {
                    this.initLocalData()
                }
            },
            deep: true,
            immediate: true
        },
        dict: {
            handler() {
                if (this.visible) {
                    this.initDictData()
                }
            },
            immediate: false
        }
    },
    methods: {
        init() {
            this.searchKeyword = ''
            this.pageNo = 1
            this.hasMore = true
            this.dataList = []
            this.allDataList = []
            this.initDictData()
        },
        async initDictData() {
            // 优先使用传入的 dictOptions
            if (this.dictOptions && this.dictOptions.length > 0) {
                this.initLocalData()
                return
            }

            // 如果有 dict 配置，才调用接口
            if (this.dict && this.dict.trim()) {
                if (this.async) {
                    // 异步加载
                    await this.loadAsyncData()
                } else {
                    // 同步加载字典
                    await this.loadDictItems()
                }
            }
        },
        initLocalData() {
            this.allDataList = this.dictOptions.map(item => ({
                value: item.value || item.key,
                text: item.text || item.label
            }))
            this.dataList = this.allDataList.slice(0, this.pageSize)
            this.hasMore = this.allDataList.length > this.pageSize
        },
        async loadDictItems() {
            // 如果抽屉已关闭，不加载数据
            if (!this.visible || !this.showDrawer) {
                return
            }

            // 加载字典项（非异步）
            try {
                this.loading = true
                const res = await request({
                    url: `/sys/dict/getDictItems/${this.dict}`,
                    method: 'GET',
                    hideLoading: true // 抽屉内部加载，不需要全局 loading
                })

                // 再次检查抽屉是否关闭
                if (!this.visible || !this.showDrawer) {
                    return
                }

                if (res && res.success) {
                    const items = res.result || []
                    this.allDataList = items.map(item => ({
                        value: item.value || item.itemValue,
                        text: item.text || item.itemText
                    }))
                    this.dataList = this.allDataList.slice(0, this.pageSize)
                    this.hasMore = this.allDataList.length > this.pageSize
                }
            } catch (e) {
                console.error('加载字典失败:', e)
            } finally {
                if (this.visible && this.showDrawer) {
                    this.loading = false
                } else {
                    this.loading = false
                    uni.hideLoading()
                }
            }
        },
        async loadAsyncData(keyword = '') {
            // 如果抽屉已关闭，不加载数据
            if (!this.visible || !this.showDrawer) {
                return
            }

            // 异步加载数据（类似 JSearchSelectTag）
            this.lastLoad += 1
            const currentLoad = this.lastLoad

            this.loading = true
            try {
                // dict 格式: "table,text,code,where条件" 或 "table,text,code"
                // 直接使用原始格式，不需要转换
                const dictStr = this.dict
                console.log('开始加载异步数据，dict:', dictStr, 'keyword:', keyword)

                const res = await request({
                    url: `/sys/dict/loadDict/${dictStr}`,
                    method: 'GET',
                    params: {
                        keyword: keyword || '',
                        pageSize: this.pageSize
                    },
                    skipErrorToast: true, // 暂时不显示错误，避免频繁提示
                    hideLoading: true // 抽屉内部加载，不需要全局 loading
                })

                // 再次检查抽屉是否关闭
                if (!this.visible || !this.showDrawer || currentLoad !== this.lastLoad) {
                    console.log('请求已过期或抽屉已关闭，忽略结果')
                    return // 防止异步请求乱序或抽屉已关闭
                }

                console.log('异步数据加载结果:', res)

                if (res && res.success) {
                    let items = res.result || []
                    console.log('原始数据项:', items)

                    // 如果 result 是对象且有 records 或 list 字段，则提取数组
                    if (items && typeof items === 'object' && !Array.isArray(items)) {
                        items = items.records || items.list || []
                    }

                    console.log('解析后的数据项:', items)

                    // 根据字典配置的字段名提取 value 和 text
                    // dict 格式: "table,textField,valueField,where条件" 或 "table,textField,valueField"
                    const dictParts = this.dict.split(',')
                    let textField = dictParts.length > 1 ? dictParts[1].trim() : 'text'
                    let valueField = dictParts.length > 2 ? dictParts[2].trim() : 'value'

                    // 处理 where 条件，如果 valueField 包含 where 或 =，说明第三个参数是 where 条件
                    if (valueField.includes('where') || valueField.includes('=')) {
                        // 说明只有 table,textField 两个参数，valueField 实际上是 where 条件
                        valueField = 'id' // 默认使用 id 作为 value
                    }

                    // 将下划线命名转换为驼峰命名进行匹配
                    // 例如: customer_name -> customerName
                    const toCamelCase = (str) => {
                        return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
                    }

                    const camelTextField = toCamelCase(textField)
                    const camelValueField = toCamelCase(valueField)

                    console.log('字段映射 - textField:', textField, 'valueField:', valueField)
                    console.log('驼峰转换 - camelTextField:', camelTextField, 'camelValueField:', camelValueField)

                    this.dataList = items.map(item => {
                        // 尝试多种可能的字段名（下划线和驼峰）
                        let value = item[valueField] || item[camelValueField] || item.value || item.id || item.key || ''
                        let text = item[textField] || item[camelTextField] || item.text || item.label || item.name || ''

                        // 如果还是找不到，尝试从原始字段中查找
                        if (!value) {
                            value = item.id || item.key || ''
                        }
                        if (!text) {
                            // 尝试常见的文本字段
                            text = item.customerName || item.businessName || item.realname || item.name || ''
                        }

                        console.log('映射项:', {
                            value,
                            text,
                            originalItem: item,
                            triedFields: {
                                value: [valueField, camelValueField, 'value', 'id', 'key'],
                                text: [textField, camelTextField, 'text', 'label', 'name']
                            }
                        })

                        return {
                            value: String(value || ''),
                            text: String(text || '')
                        }
                    }).filter(item => item.value && item.text) // 过滤掉空值

                    console.log('最终数据列表:', this.dataList)
                    // 异步模式不分页，每次搜索重新加载
                    this.hasMore = false
                } else {
                    console.error('加载失败:', res?.message)
                    // 只在明确失败时提示
                    // uni.showToast({ title: res?.message || '加载失败', icon: 'none' })
                }
            } catch (e) {
                console.error('加载数据异常:', e)
                // uni.showToast({ title: e.message || '加载失败', icon: 'none' })
            } finally {
                // 再次检查抽屉是否关闭
                if (this.visible && this.showDrawer) {
                    this.loading = false
                } else {
                    this.loading = false
                    // 确保隐藏全局 loading（如果之前显示了）
                    uni.hideLoading()
                }
            }
        },
        loadMore() {
            if (this.async) {
                // 异步模式不支持分页加载
                return
            }

            // 本地分页加载
            if (this.hasMore && !this.loading) {
                this.loading = true
                setTimeout(() => {
                    const start = this.pageNo * this.pageSize
                    const end = start + this.pageSize
                    const newData = this.allDataList.slice(start, end)
                    this.dataList = [...this.dataList, ...newData]
                    this.hasMore = end < this.allDataList.length
                    this.pageNo++
                    this.loading = false
                }, 300)
            }
        },
        handleSearch() {
            // 延迟执行，避免频繁请求
            clearTimeout(this.searchTimer)
            this.searchTimer = setTimeout(() => {
                if (this.async) {
                    // 异步搜索
                    this.loadAsyncData(this.searchKeyword.trim())
                } else {
                    // 本地搜索
                    this.pageNo = 1
                    const keyword = this.searchKeyword.trim().toLowerCase()
                    if (!keyword) {
                        if (this.dictOptions && this.dictOptions.length > 0) {
                            this.allDataList = this.dictOptions.map(item => ({
                                value: item.value || item.key,
                                text: item.text || item.label
                            }))
                        } else {
                            // 重新加载字典
                            this.loadDictItems().then(() => {
                                this.allDataList = this.dataList
                                this.dataList = this.allDataList.slice(0, this.pageSize)
                                this.hasMore = this.allDataList.length > this.pageSize
                            })
                        }
                    } else {
                        const source = this.dictOptions && this.dictOptions.length > 0
                            ? this.dictOptions
                            : this.allDataList.map(item => ({ value: item.value, text: item.text, key: item.value, label: item.text }))

                        this.allDataList = source.filter(item => {
                            const text = (item.text || item.label || '').toLowerCase()
                            return text.includes(keyword)
                        }).map(item => ({
                            value: item.value || item.key,
                            text: item.text || item.label
                        }))
                    }
                    this.dataList = this.allDataList.slice(0, this.pageSize)
                    this.hasMore = this.allDataList.length > this.pageSize
                }
            }, 300)
        },
        clearSearch() {
            this.searchKeyword = ''
            clearTimeout(this.searchTimer)
            if (this.async) {
                this.loadAsyncData('')
            } else {
                this.pageNo = 1
                if (this.dictOptions && this.dictOptions.length > 0) {
                    this.allDataList = this.dictOptions.map(item => ({
                        value: item.value || item.key,
                        text: item.text || item.label
                    }))
                } else {
                    this.allDataList = [...this.dataList]
                }
                this.dataList = this.allDataList.slice(0, this.pageSize)
                this.hasMore = this.allDataList.length > this.pageSize
            }
        },
        getItemKey(item, index) {
            if (item && item.value) {
                return item.value
            }
            return index
        },
        getItemText(item) {
            if (!item) return ''
            return item.text || ''
        },
        isSelected(item) {
            if (!item) return false
            return String(item.value) === String(this.value)
        },
        handleSelect(item) {
            console.log('SelectDrawer 选择项:', item)
            if (!item || item.value === undefined) {
                console.error('选择项无效:', item)
                return
            }
            const value = item.value
            console.log('SelectDrawer 发送 change 事件，值:', value)
            this.$emit('change', value)
            this.$emit('input', value)
            this.handleClose()
        },
        handleClose() {
            this.$emit('update:visible', false)
            this.$emit('close')
        },
        handleMaskClick() {
            this.handleClose()
        }
    }
}
</script>

<style scoped lang="scss">
.select-drawer-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10001;
    background: rgba(0, 0, 0, 0);
    transition: background 0.3s;
    pointer-events: none;

    &.select-drawer-show {
        background: rgba(0, 0, 0, 0.5);
        pointer-events: auto;
    }
}

.select-drawer-content {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background: #fff;
    border-radius: 32rpx 32rpx 0 0;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    transform: translateY(100%);
    transition: transform 0.3s;
    padding-left: 32rpx;
    padding-right: 32rpx;
    box-sizing: border-box;

    &.select-drawer-content-show {
        transform: translateY(0);
    }
}

.select-drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32rpx 0;
    border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);
}

.select-drawer-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #1c1c1e;
}

.select-drawer-close {
    font-size: 56rpx;
    color: #8e8e93;
    line-height: 1;
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.select-drawer-search {
    padding: 24rpx 0;
    border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);
}

.search-input-wrapper {
    display: flex;
    align-items: center;
    background: #ededf0;
    border-radius: 999px;
    height: 72rpx;
    padding: 0 18rpx;
}

.search-icon {
    font-size: 28rpx;
    color: #8e8e93;
    margin-right: 8rpx;
}

.search-input {
    flex: 1;
    font-size: 28rpx;
    color: #1c1c1e;
}

.search-clear {
    font-size: 34rpx;
    color: #8e8e93;
    padding: 0 6rpx;
}

.select-drawer-body {
    flex: 1;
    overflow-y: auto;
    padding: 0;
}

.select-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28rpx 0;
    border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);
    transition: background 0.2s;
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;

    &:active {
        background: #f5f5f5;
    }

    &:last-child {
        border-bottom: none;
    }
}

.select-item-selected {
    color: #0a84ff;

    .select-item-text {
        color: #0a84ff;
        font-weight: 500;
    }
}

.select-item-text {
    flex: 1;
    font-size: 30rpx;
    color: #1c1c1e;
}

.select-item-check {
    font-size: 32rpx;
    color: #0a84ff;
    margin-left: 16rpx;
}

.select-loading,
.select-load-more,
.select-no-more,
.select-empty {
    text-align: center;
    padding: 40rpx 0;
    color: #8e8e93;
    font-size: 26rpx;
}
</style>
