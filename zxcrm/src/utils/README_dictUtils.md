# 字典工具函数使用说明

基于 `JDictNameDisplay.vue` 组件逻辑创建的字典工具函数，用于根据字典代码和值获取对应的标签文本。

## 功能特性

- ✅ 支持异步和同步两种方式获取字典标签
- ✅ 优先从缓存获取，提高性能
- ✅ 支持批量处理
- ✅ 完善的错误处理和日志记录
- ✅ 支持自定义占位符
- ✅ 支持字符串和数字类型的值

## 函数列表

### 1. getDictLabel(dictCode, value, placeholder)

**异步获取单个字典标签**

- **参数:**
  - `dictCode` (string): 字典代码
  - `value` (string|number): 字典值
  - `placeholder` (string, 可选): 占位符，默认为空字符串

- **返回值:** Promise<string>

- **使用示例:**
```javascript
import { getDictLabel } from '@/utils/dictUtils'

// 获取性别字典的标签
const genderLabel = await getDictLabel('sex', '1', '未知')
// // console.log(genderLabel) // 输出: 男

// 获取状态字典的标签
const statusLabel = await getDictLabel('status', '0', '未知状态')
// // console.log(statusLabel) // 输出: 禁用
```

### 2. getDictLabelSync(dictCode, value, placeholder)

**同步获取单个字典标签（仅从缓存获取）**

- **参数:**
  - `dictCode` (string): 字典代码
  - `value` (string|number): 字典值
  - `placeholder` (string, 可选): 占位符，默认为空字符串

- **返回值:** string

- **使用示例:**
```javascript
import { getDictLabelSync } from '@/utils/dictUtils'

// 从缓存中获取性别字典的标签
const genderLabel = getDictLabelSync('sex', '2', '未知')
// // console.log(genderLabel) // 输出: 女

// 从缓存中获取状态字典的标签
const statusLabel = getDictLabelSync('status', '1', '未知状态')
// // console.log(statusLabel) // 输出: 启用
```

### 3. getDictLabels(dictCode, values, placeholder)

**异步批量获取字典标签**

- **参数:**
  - `dictCode` (string): 字典代码
  - `values` (Array): 字典值数组
  - `placeholder` (string, 可选): 占位符，默认为空字符串

- **返回值:** Promise<Array>

- **使用示例:**
```javascript
import { getDictLabels } from '@/utils/dictUtils'

const values = ['1', '2', '0']
const labels = await getDictLabels('sex', values, '未知')
// // console.log(labels) // 输出: ['男', '女', '未知']
```

### 4. getDictLabelsSync(dictCode, values, placeholder)

**同步批量获取字典标签（仅从缓存获取）**

- **参数:**
  - `dictCode` (string): 字典代码
  - `values` (Array): 字典值数组
  - `placeholder` (string, 可选): 占位符，默认为空字符串

- **返回值:** Array

- **使用示例:**
```javascript
import { getDictLabelsSync } from '@/utils/dictUtils'

const values = ['0', '1', '2']
const labels = getDictLabelsSync('status', values, '未知状态')
// // console.log(labels) // 输出: ['禁用', '启用', '未知状态']
```

## 在Vue组件中使用

### 在data和computed中使用

```javascript
import { getDictLabel, getDictLabelSync } from '@/utils/dictUtils'

export default {
  data() {
    return {
      userStatus: '1',
      userGender: '2',
      statusLabel: '',
      genderLabel: ''
    }
  },
  async mounted() {
    // 异步获取字典标签
    this.statusLabel = await getDictLabel('status', this.userStatus, '未知状态')
    this.genderLabel = await getDictLabel('sex', this.userGender, '未知')
  },
  computed: {
    // 同步获取字典标签（适用于已缓存的字典）
    statusText() {
      return getDictLabelSync('status', this.userStatus, '未知状态')
    },
    genderText() {
      return getDictLabelSync('sex', this.userGender, '未知')
    }
  }
}
```

### 在表格列中使用

```javascript
import { getDictLabel, getDictLabelSync } from '@/utils/dictUtils'

const tableColumns = [
  {
    title: '状态',
    dataIndex: 'status',
    customRender: (text) => {
      return getDictLabelSync('status', text, '未知状态')
    }
  },
  {
    title: '性别',
    dataIndex: 'gender',
    customRender: async (text) => {
      return await getDictLabel('sex', text, '未知')
    }
  }
]
```

### 使用Vue过滤器

```javascript
// main.js
import { dictFilter } from '@/utils/dictUtilsExample'
Vue.use(dictFilter)

// 在模板中使用
<template>
  <span>{{ userStatus | dict('status', '未知状态') }}</span>
  <span>{{ userGender | dict('sex', '未知') }}</span>
</template>
```

## 注意事项

1. **缓存机制**: 同步函数 `getDictLabelSync` 和 `getDictLabelsSync` 只能从缓存中获取数据，如果字典数据还未加载到缓存中，将返回占位符。

2. **异步函数**: `getDictLabel` 和 `getDictLabels` 会优先从缓存获取，如果缓存中没有数据，会自动从服务器获取。

3. **错误处理**: 所有函数都包含完善的错误处理，当出现异常时会返回占位符并在控制台输出错误信息。

4. **性能优化**: 建议在应用启动时预加载常用的字典数据到缓存中，然后使用同步函数获取标签，这样可以提高性能。

5. **类型兼容**: 函数支持字符串和数字类型的值，会自动进行类型转换匹配。

## 与现有代码的兼容性

这些函数基于现有的 `JDictNameDisplay.vue` 组件逻辑创建，与现有的字典系统完全兼容，可以直接替换现有的字典标签获取逻辑。
