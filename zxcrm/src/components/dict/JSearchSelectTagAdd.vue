<template>

  <a-select v-if="async" showSearch labelInValue :disabled="disabled" :getPopupContainer="getParentContainer"
    @search="handleSearch" :placeholder="placeholder" v-model="selectedAsyncValue" style="width: 100%"
    :filterOption="false" @change="handleAsyncChange" allowClear :notFoundContent="loading ? undefined : null"
    :mode="mode" :allowClear="allowClear" :dropdownRender="dropdownRenderAsync">
    <a-spin v-if="loading" slot="notFoundContent" size="small" />
    <a-select-option v-for="d in options" :key="d.value" :value="d.value">{{ d.text }}</a-select-option>
  </a-select>

  <a-select v-else :getPopupContainer="getParentContainer" showSearch :disabled="disabled" :placeholder="placeholder"
    optionFilterProp="children" style="width: 100%" @change="handleChange" :filterOption="filterOption"
    v-model="selectedValue" allowClear :notFoundContent="loading ? undefined : null" :mode="mode"
    :allowClear="allowClear" @search="handleSearch" :dropdownRender="dropdownRender">
    <a-spin v-if="loading" slot="notFoundContent" size="small" />
    <a-select-option v-for="d in options" :key="d.value" :value="d.value">{{ d.text }}</a-select-option>
  </a-select>

</template>

<script>
import { ajaxGetDictItems, getDictItemsFromCache } from '@/api/api'
import debounce from 'lodash/debounce';
import { getAction } from '../../api/manage'

export default {
  name: 'JSearchSelectTag',
  props: {
    disabled: Boolean,
    value: {
      type: [String, Number, Array],
      default: null
    },
    dictOptions: Array,
    async: Boolean,
    placeholder: {
      type: String,
      default: "请选择",
      required: false
    },
    dict: {
      type: String,
      default: '',
      required: false
    },
    popContainer: {
      type: String,
      default: '',
      required: false
    },
    pageSize: {
      type: Number,
      default: 10,
      required: false
    },
    getPopupContainer: {
      type: Function,
      default: null
    },
    mode: {
      type: String,
      default: '',
    },
    allowClear: {
      type: Boolean,
      default: true
    },
    notFoundText: {
      type: String,
      default: '点击新增',
      required: false
    },
    showNotFoundAdd: {
      type: Boolean,
      default: true,
      required: false
    },
    onRefresh: {
      type: Function,
      default: null,
      required: false
    },
  },
  data() {
    this.loadData = debounce(this.loadData, 800);//消抖
    this.lastLoad = 0;
    return {
      loading: false,
      selectedValue: undefined,
      selectedAsyncValue: undefined,
      options: [],
      searchKeyword: '', // 保存当前搜索关键词
    }
  },
  created() {
    this.initDictData();
  },
  watch: {
    "value": {
      immediate: true,
      handler(val) {
        // 处理 null、undefined、空字符串等情况
        if (val === null || val === undefined || val === '') {
          this.selectedValue = this.mode === 'multiple' ? [] : undefined
          this.selectedAsyncValue = this.mode === 'multiple' ? [] : undefined
        } else if (val == 0) {
          // 值为 0 时也需要初始化
          this.initSelectValue()
        } else {
          this.initSelectValue()
        }
      }
    },
    "dict": {
      handler() {
        this.initDictData()
      }
    },
    'dictOptions': {
      deep: true,
      handler(val) {
        if (val && val.length > 0) {
          this.options = [...val]
        }
      }
    }
  },
  methods: {
    initSelectValue() {
      if (this.async) {
        if (!this.selectedAsyncValue || !this.selectedAsyncValue.key || this.selectedAsyncValue.key != this.value) {
          //update-begin-author:taoyan date:20220112 for: 方法initSelectValue 根据下拉框实际值查询下拉框的显示的文本 因后台接口只处理3个参数，所以将过滤条件去掉
          // TODO 隐患 查询效率问题 还是应该在后台作筛选
          let itemDictStr = this.dict
          let arr = itemDictStr.split(',')
          if (arr && arr.length == 4) {
            // 删除最后一个元素
            arr.pop();
            itemDictStr = arr.join(',')
          }
          //update-end-author:taoyan date:20220112 for: 方法initSelectValue 根据下拉框实际值查询下拉框的显示的文本 因后台接口只处理3个参数，所以将过滤条件去掉
          getAction(`/sys/dict/loadDictItem/${itemDictStr}`, { key: this.value }).then(res => {
            if (res.success) {
              //update-begin---author:wangshuai ---date:20221115  for：[issues/4213]JSearchSelectTag改造支持多选------------
              //判断是否多选
              if (this.mode === 'multiple') {
                if (res.result && res.result.length > 0) {
                  let itemArray = [];
                  let valueArray = this.value.split(",")
                  for (let i = 0; i < res.result.length; i++) {
                    itemArray.push({
                      key: valueArray[i],
                      label: res.result[i]
                    })
                  }
                  this.selectedAsyncValue = itemArray
                } else {
                  this.selectedAsyncValue = []
                  this.selectedValue = []
                }
              } else {
                let obj = {
                  key: this.value,
                  label: res.result
                }
                this.selectedAsyncValue = { ...obj }
              }
              //update-end---author:wangshuai ---date:20221115  for：[issues/4213]JSearchSelectTag改造支持多选--------------
            }
          })
        }
      } else {
        //update-begin---author:wangshuai ---date:20221115  for：[issues/4213]JSearchSelectTag改造支持多选------------
        //判断是否为多选
        if (this.mode === 'multiple') {
          if (this.value) {
            this.selectedValue = Array.isArray(this.value) ? this.value : this.value.split(",");
          } else {
            this.selectedValue = []
          }
        } else {
          this.selectedValue = this.value !== null && this.value !== undefined ? this.value.toString() : ''
        }
        //update-end---author:wangshuai ---date:20221115  for：[issues/4213]JSearchSelectTag改造支持多选------------
      }
    },
    loadData(value) {
      return new Promise((resolve, reject) => {
        this.lastLoad += 1
        const currentLoad = this.lastLoad
        this.options = []
        this.loading = true
        // 字典code格式：table,text,code
        getAction(`/sys/dict/loadDict/${this.dict}`, { keyword: value, pageSize: this.pageSize }).then(res => {
          this.loading = false
          if (res.success) {
            if (currentLoad != this.lastLoad) {
              resolve()
              return
            }
            this.options = res.result
            resolve(res.result)
          } else {
            this.$message.warning(res.message)
            resolve()
          }
        }).catch(err => {
          this.loading = false
          reject(err)
        })
      })
    },
    handleSearch(value) {
      this.searchKeyword = value || ''
      this.loadData(value)
    },
    // 自定义下拉菜单渲染（异步模式）
    dropdownRenderAsync(menu) {
      const h = this.$createElement
      // 始终显示新增选项（只要不在加载中且 showNotFoundAdd 为 true）
      const showAddOption = this.showNotFoundAdd && !this.loading

      return h('div', [
        menu,
        showAddOption ? h('div', {
          style: {
            padding: '8px',
            textAlign: 'center',
            borderTop: '1px solid #e8e8e8',
            cursor: 'pointer',
            color: '#1890ff'
          },
          on: {
            click: this.handleAddClick
          }
        }, this.notFoundText) : null
      ])
    },
    // 自定义下拉菜单渲染（同步模式）
    dropdownRender(menu) {
      const h = this.$createElement
      // 始终显示新增选项（只要不在加载中且 showNotFoundAdd 为 true）
      const showAddOption = this.showNotFoundAdd && !this.loading

      return h('div', [
        menu,
        showAddOption ? h('div', {
          style: {
            padding: '8px',
            textAlign: 'center',
            borderTop: '1px solid #e8e8e8',
            cursor: 'pointer',
            color: '#1890ff'
          },
          on: {
            click: this.handleAddClick
          }
        }, this.notFoundText) : null
      ])
    },
    // 获取过滤后的选项（同步模式）
    getFilteredOptions() {
      if (!this.searchKeyword) {
        return this.options
      }
      const keyword = this.searchKeyword.toLowerCase()
      return this.options.filter(option => {
        const text = (option.text || '').toLowerCase()
        return text.indexOf(keyword) >= 0
      })
    },
    // 处理新增点击事件
    handleAddClick(e) {
      e.stopPropagation()
      e.preventDefault()
      // 触发新增事件，传递搜索关键词
      this.$emit('onAdd', this.searchKeyword)
      // 如果有刷新回调，调用它
      if (this.onRefresh && typeof this.onRefresh === 'function') {
        this.onRefresh(this.searchKeyword)
      }
    },
    // 刷新数据方法（供外部调用）
    refreshData() {
      return new Promise((resolve) => {
        console.log('refreshData 开始刷新，dict:', this.dict)
        // 清空当前选项和搜索关键词
        this.$set(this, 'options', [])
        this.searchKeyword = ''
        // 重新初始化数据
        if (this.async) {
          // 异步模式：直接调用原始 loadData 方法（不使用 debounce），确保立即刷新
          this.lastLoad += 1
          const currentLoad = this.lastLoad
          this.loading = true
          console.log('refreshData 开始加载数据，currentLoad:', currentLoad)
          getAction(`/sys/dict/loadDict/${this.dict}`, { keyword: '', pageSize: this.pageSize }).then(res => {
            this.loading = false
            console.log('refreshData 数据加载完成，res:', res)
            if (res.success) {
              if (currentLoad != this.lastLoad) {
                console.log('refreshData 请求已被新请求覆盖，currentLoad:', currentLoad, 'lastLoad:', this.lastLoad)
                resolve()
                return
              }
              // 使用 $set 确保响应式更新
              this.$set(this, 'options', res.result || [])
              console.log('refreshData 更新 options，数量:', this.options.length)
              // 强制更新视图
              this.$forceUpdate()
            } else {
              this.$message.warning(res.message)
            }
            resolve()
          }).catch((err) => {
            this.loading = false
            console.error('refreshData 加载失败:', err)
            resolve()
          })
        } else {
          // 同步模式：调用原有的初始化方法
          this.initDictData()
          // 同步模式没有异步操作，直接 resolve
          this.$nextTick(() => {
            resolve()
          })
        }
      })
    },
    initDictData() {
      if (!this.async) {
        //如果字典项集合有数据
        if (this.dictOptions && this.dictOptions.length > 0) {
          this.options = [...this.dictOptions]
        } else {
          //根据字典Code, 初始化字典数组
          let dictStr = ''
          if (this.dict) {
            let arr = this.dict.split(',')
            if (arr[0].indexOf('where') > 0) {
              let tbInfo = arr[0].split('where')
              dictStr = tbInfo[0].trim() + ',' + arr[1] + ',' + arr[2] + ',' + encodeURIComponent(tbInfo[1])
            } else {
              dictStr = this.dict
            }
            if (this.dict.indexOf(",") == -1) {
              //优先从缓存中读取字典配置
              if (getDictItemsFromCache(this.dictCode)) {
                this.options = getDictItemsFromCache(this.dictCode);
                return
              }
            }
            ajaxGetDictItems(dictStr, null).then((res) => {
              if (res.success) {
                this.options = res.result;
              }
            })
          }
        }
      } else {
        if (!this.dict) {
          console.error('搜索组件未配置字典项')
        } else {
          //异步一开始也加载一点数据
          this.loading = true
          getAction(`/sys/dict/loadDict/${this.dict}`, { pageSize: this.pageSize, keyword: '' }).then(res => {
            this.loading = false
            if (res.success) {
              this.options = res.result
            } else {
              this.$message.warning(res.message)
            }
          })
        }
      }
    },
    filterOption(input, option) {
      return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
    },
    handleChange(selectedValue) {
      this.selectedValue = selectedValue
      this.callback()
    },
    handleAsyncChange(selectedObj) {
      //update-begin-author:scott date:20201222 for:【搜索】搜索查询组件，删除条件，默认下拉还是上次的缓存数据，不好 JT-191
      if (selectedObj) {
        this.selectedAsyncValue = selectedObj
        //update-begin---author:wangshuai ---date:20221115  for：[issues/4213]JSearchSelectTag改造支持多选------------
        if (this.mode === 'multiple') {
          let keyArray = []
          for (let i = 0; i < selectedObj.length; i++) {
            keyArray.push(selectedObj[i].key)
          }
          this.selectedValue = keyArray
        } else {
          this.selectedValue = selectedObj.key
        }
        //update-end---author:wangshuai ---date:20221115  for：[issues/4213]JSearchSelectTag改造支持多选------------
      } else {
        this.selectedAsyncValue = null
        this.selectedValue = null
        this.options = null
        this.loadData("")
      }
      this.callback()
      //update-end-author:scott date:20201222 for:【搜索】搜索查询组件，删除条件，默认下拉还是上次的缓存数据，不好 JT-191
    },
    callback() {
      //update-begin---author:wangshuai ---date:20221115  for：[issues/4213]JSearchSelectTag改造支持多选------------
      if (this.mode === 'multiple') {
        this.$emit('change', this.selectedValue.join(","));
      } else {
        this.$emit('change', this.selectedValue);
      }
      //update-end---author:wangshuai ---date:20221115  for：[issues/4213]JSearchSelectTag改造支持多选------------
    },
    setCurrentDictOptions(dictOptions) {
      this.options = dictOptions
    },
    getCurrentDictOptions() {
      return this.options
    },
    getParentContainer(node) {
      if (typeof this.getPopupContainer === 'function') {
        return this.getPopupContainer(node)
      } else if (!this.popContainer) {
        return node.parentNode
      } else {
        return document.querySelector(this.popContainer)
      }
    },

  },
  model: {
    prop: 'value',
    event: 'change'
  }
}
</script>

<style scoped></style>