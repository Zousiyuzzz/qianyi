# ApprovalForm 审批表单系统说明

## 📋 整体架构

整个审批表单系统采用**配置驱动**的架构，核心逻辑与业务代码分离，便于扩展和维护。

```
ApprovalForm.vue (主组件)
├── formConfig.js (表单配置中心)
├── modules/
│   ├── dataLoader.js (数据加载模块)
│   ├── processParser.js (流程解析模块)
│   └── dataParser.js (数据解析模块)
└── 各业务表单组件 (ProjectRefundForm, ProjectTempCreditForm 等)
```

## 🔄 核心流程

### 1. 初始化流程

```
用户打开审批表单
  ↓
ApprovalForm.vue created()
  ↓
初始化三个模块：
- dataLoader: 负责加载用户、部门、角色等基础数据
- processParser: 负责解析审批流程配置
- dataParser: 负责解析和转换表单数据
  ↓
根据 businessType 显示对应的表单组件
```

### 2. 提交流程

```
用户点击提交
  ↓
submitForm() → 验证表单 → 加载流程配置 → 显示预览
  ↓
用户确认提交
  ↓
confirmSubmitInternal()
  ↓
1. 根据 businessType 获取 formConfig
2. 调用 getFormDataSafely() 获取表单数据
   - 如果有 ref，调用 formConfig.submitDataParser()
   - 如果无 ref（预览模式），使用 this.model
  ↓
3. 调用 dataParser.buildSubmitData() 合并流程数据
4. 根据 submitType 选择提交方式（JSON/FormData）
5. 调用对应的 API 提交
```

### 3. 数据流转

```
表单组件 (v-model="model")
  ↓
watch model → $emit('input', newVal)
  ↓
ApprovalForm.model 更新
  ↓
提交时 → getFormDataSafely() → formConfig.submitDataParser()
  ↓
转换为 API 需要的格式
  ↓
合并流程数据 → 提交
```

## 📝 如何新增一个审批表单

### 步骤 1: 创建表单组件

在 `src/views/OA/components/` 目录下创建新的表单组件，例如：`NewForm.vue`

**组件要求：**
1. 必须实现 `validate()` 方法（返回 Promise，resolve 时返回表单数据）
2. 使用 `v-model` 双向绑定数据
3. 支持 `disabled` prop

**示例：**

```vue
<template>
  <div class="new-form">
    <a-form-model ref="form" :model="model" :rules="rules">
      <a-form-model-item label="字段1" prop="field1">
        <a-input v-model="model.field1" />
      </a-form-model-item>
      <!-- 其他字段 -->
    </a-form-model>
  </div>
</template>

<script>
export default {
  name: 'NewForm',
  props: {
    value: {
      type: Object,
      default: () => ({})
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      model: {
        field1: '',
        field2: null
      },
      rules: {
        field1: [{ required: true, message: '请输入字段1' }]
      }
    }
  },
  watch: {
    value: {
      immediate: true,
      deep: true,
      handler(newVal) {
        if (newVal && Object.keys(newVal).length > 0) {
          this.model = { ...this.model, ...newVal }
        }
      }
    },
    model: {
      deep: true,
      handler(newVal) {
        this.$emit('input', { ...newVal })
      }
    }
  },
  methods: {
    validate() {
      return new Promise((resolve, reject) => {
        this.$refs.form.validate((valid) => {
          if (valid) {
            resolve(this.model) // 返回表单数据
          } else {
            reject(new Error('表单验证失败'))
          }
        })
      })
    },
    resetFields() {
      this.$refs.form.resetFields()
      this.model = { field1: '', field2: null }
    }
  }
}
</script>
```

### 步骤 2: 在 formConfig.js 中添加配置

打开 `src/views/OA/components/ApprovalForm/formConfig.js`，在 `formConfigs` 对象中添加新配置：

```javascript
import NewForm from '../NewForm'  // 导入新组件

export const formConfigs = {
  // ... 现有配置 ...

  // 新表单类型
  newFormType: {
    // 1. 业务类型标识（必须唯一）
    businessType: 'newFormType',
    
    // 2. 表单组件的 ref 名称（用于在模板中引用）
    refName: 'newForm',
    
    // 3. 表单组件（如果表单在 ApprovalForm 中直接实现，设为 null）
    component: NewForm,
    
    // 4. API 配置
    api: {
      add: '/api/newForm/add',        // 新增接口
      edit: '/api/newForm/edit',      // 编辑接口
      queryById: '/api/newForm/queryById'  // 查询接口
    },
    
    // 5. 提交数据解析函数（将表单数据转换为 API 需要的格式）
    submitDataParser: async function(formRef, context) {
      // formRef: 表单组件的引用
      // context: ApprovalForm 的 this 上下文
      
      // 调用表单的 validate() 方法获取数据
      const submitData = await formRef.validate()
      
      // 转换为 API 需要的格式（只返回需要的字段）
      return {
        field1: submitData.field1 || '',
        field2: submitData.field2 || null,
        id: submitData.id || null  // 保留 id 用于判断新增/编辑
      }
    },
    
    // 6. 预览数据获取函数（可选，默认使用 context.model）
    previewDataGetter: function(context) {
      return context.model
    },
    
    // 7. 提交方式：'json' 或 'formData'
    submitType: 'json'  // 或者 'formData'（如果包含文件上传）
  }
}
```

### 步骤 3: 在 ApprovalForm.vue 中注册组件

在 `ApprovalForm.vue` 的 `<script>` 部分：

```javascript
import NewForm from './NewForm'  // 导入组件

export default {
  components: {
    // ... 现有组件 ...
    NewForm  // 注册组件
  }
}
```

### 步骤 4: 在模板中添加表单组件

在 `ApprovalForm.vue` 的 `<template>` 部分，找到表单区域：

```vue
<!-- 表单区域 -->
<div v-if="!isPreviewMode">
  <!-- 合同审批表单 -->
  <j-form-container v-if="isContractApproval" ...>
    ...
  </j-form-container>

  <!-- 项目退款审批表单 -->
  <project-refund-form 
    v-else-if="isProjectRefundApproval" 
    ref="projectRefundForm" 
    v-model="model"
    :disabled="formDisabled" />

  <!-- 临时授信审批表单 -->
  <project-temp-credit-form 
    v-else-if="isProjectTempCreditApproval" 
    ref="projectTempCreditForm" 
    v-model="model"
    :disabled="formDisabled" />

  <!-- ✨ 新增的表单组件 -->
  <new-form 
    v-else-if="isNewFormType" 
    ref="newForm" 
    v-model="model"
    :disabled="formDisabled" />
</div>
```

**注意：** `ref` 的值必须与 `formConfig` 中的 `refName` 一致！

### 步骤 5: 添加 computed 属性（用于模板判断）

在 `ApprovalForm.vue` 的 `computed` 中添加：

```javascript
computed: {
  // ... 现有 computed ...
  
  isNewFormType() {
    const businessType = this.model.businessType || this.businessType || ''
    return businessType === 'newFormType'
  }
}
```

### 步骤 6: 添加预览显示（可选）

如果需要预览模式，在预览区域添加：

```vue
<!-- 预览模式：表单只读显示 -->
<div v-if="isPreviewMode" class="preview-mode">
  <!-- ... 其他预览 ... -->
  
  <!-- 新表单预览 -->
  <div v-else-if="isNewFormType" class="form-preview-section">
    <h3 class="section-title">表单信息</h3>
    <div class="form-info">
      <div class="form-item">
        <div class="form-label">字段1：</div>
        <div class="form-value">{{ model.field1 || '-' }}</div>
      </div>
      <!-- 其他字段 -->
    </div>
  </div>
</div>
```

### 步骤 7: 初始化模型数据（可选）

如果需要在 `add()` 方法中初始化特定字段，在 `ApprovalForm.vue` 的 `add()` 方法中添加：

```javascript
add(businessType) {
  this.model = Object.assign({}, this.defaultModel)
  this.model.businessType = businessType || this.businessType || ''
  
  // 如果是新表单类型，初始化相关字段
  if (this.model.businessType === 'newFormType') {
    this.model = {
      ...this.model,
      field1: '',
      field2: null
      // ... 其他字段
    }
  }
  
  // ... 其他逻辑
}
```

## 📌 重要说明

### 1. businessType 的作用

`businessType` 是整个系统的核心标识符：
- 用于匹配表单配置
- 用于显示对应的表单组件
- 用于加载对应的流程配置

### 2. 数据格式要求

**表单组件返回的数据：**
- 必须包含 `id` 字段（如果有，用于判断新增/编辑）
- 字段名使用驼峰命名
- 数据类型符合后端要求

**submitDataParser 返回的数据：**
- 只包含 API 需要的字段
- 字段名与后端接口一致
- 必须包含 `id` 字段（如果有）

### 3. 提交方式选择

- **JSON (`submitType: 'json'`)**: 
  - 使用 `postAction` 提交
  - 适用于纯数据提交
  - 数据会自动序列化为 JSON

- **FormData (`submitType: 'formData'`)**:
  - 使用 `httpAction` 提交
  - 适用于包含文件上传的场景
  - 需要手动构建 FormData

### 4. 预览模式

预览模式下，表单组件不会渲染（`v-if="!isPreviewMode"`），所以：
- `getFormDataSafely()` 方法会使用 `this.model` 中的数据
- 数据应该在进入预览前已经通过验证和同步

## 🔍 调试技巧

1. **查看表单配置是否正确加载：**
   ```javascript
   console.log(getFormConfig('newFormType'))
   ```

2. **查看提交的数据：**
   在 `confirmSubmitInternal()` 中添加：
   ```javascript
   console.log('提交数据:', submitData)
   console.log('最终请求数据:', requestData)
   ```

3. **查看流程解析结果：**
   ```javascript
   console.log('解析后的节点:', this.parsedNodes)
   ```

## ✅ 检查清单

新增表单后，检查以下事项：

- [ ] formConfig.js 中添加了配置
- [ ] 组件已导入并注册
- [ ] 模板中添加了组件标签（ref 名称正确）
- [ ] 添加了对应的 computed 属性
- [ ] submitDataParser 返回的数据格式正确
- [ ] API 接口路径正确
- [ ] 预览显示正常（如果实现）
- [ ] 测试新增和编辑功能

## 📚 示例参考

可以参考现有的实现：
- **项目退款**: `projectRefund` 配置
- **临时授信**: `projectTempCredit` 配置
- **合同审批**: `contract` 配置（特殊，表单直接在 ApprovalForm 中）

