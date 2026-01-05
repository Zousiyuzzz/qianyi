<template>
  <view class="drawer-wrapper" :class="{ 'drawer-show': visible }" @click.stop="handleMaskClick" v-if="visible || showDrawer">
    <view class="drawer-content" :class="{ 'drawer-content-show': visible }" @click.stop>
      <view class="drawer-header">
        <text class="drawer-title">{{ isEdit ? (titleEdit || '编辑') : (titleAdd || '新增') }}</text>
        <text class="drawer-close" @click.stop="handleClose">×</text>
      </view>

      <scroll-view class="drawer-body" scroll-y>
        <view class="form-group">
          <view class="form-item" v-for="field in fields" :key="field.prop">
            <text class="form-label">
              {{ field.label }}
              <text v-if="field.required" class="req">*</text>
            </text>

            <view v-if="field.type === 'select'" class="form-value" @click="openPicker(field)">
              {{ getOptionText(field, formData[field.prop]) || field.placeholder || '请选择' }}
            </view>

            <input v-else-if="field.type === 'number'" class="form-input" type="number" v-model.number="formData[field.prop]"
              :placeholder="field.placeholder || '请输入'" />

            <textarea v-else-if="field.type === 'textarea'" class="form-textarea" v-model="formData[field.prop]"
              auto-height :placeholder="field.placeholder || '请输入'" />

            <input v-else class="form-input" v-model="formData[field.prop]" :placeholder="field.placeholder || '请输入'" />
          </view>
        </view>
      </scroll-view>

      <view class="drawer-footer">
        <button class="drawer-btn drawer-btn-cancel" @click="handleClose">取消</button>
        <button class="drawer-btn drawer-btn-confirm" @click="handleSubmit">保存</button>
      </view>
    </view>

    <picker mode="selector" :range="currentPickerOptions" range-key="text" @change="handlePickerChange"
      v-if="pickerVisible"></picker>
  </view>
</template>

<script>
export default {
  props: {
    visible: Boolean,
    titleAdd: String,
    titleEdit: String,
    fields: { type: Array, default: () => [] },
    api: { type: Object, default: () => ({}) },
    editData: { type: Object, default: null },
    primaryKey: { type: String, default: 'id' }
  },
  emits: ['update:visible', 'success', 'close'],
  data() {
    return {
      formData: {},
      showDrawer: false,
      pickerVisible: false,
      currentPickerField: null,
      currentPickerOptions: []
    }
  },
  computed: {
    isEdit() {
      return !!(this.editData && this.editData[this.primaryKey])
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.showDrawer = true
        this.initForm()
      } else {
        setTimeout(() => {
          this.showDrawer = false
        }, 240)
      }
    },
    editData: {
      handler() {
        if (this.visible) this.initForm()
      },
      deep: true
    }
  },
  methods: {
    initForm() {
      const base = {}
      this.fields.forEach(f => {
        base[f.prop] = this.editData && this.editData[f.prop] !== undefined ? this.editData[f.prop] : (f.default ?? '')
      })
      this.formData = base
    },
    handleMaskClick() {
      this.handleClose()
    },
    handleClose() {
      this.$emit('update:visible', false)
      this.$emit('close')
    },
    getOptionText(field, value) {
      const opts = field.options || []
      const found = opts.find(o => o.value === value)
      return found ? found.text : ''
    },
    openPicker(field) {
      if (!field.options || !field.options.length) return
      this.currentPickerField = field
      this.currentPickerOptions = field.options
      this.pickerVisible = true
    },
    handlePickerChange(e) {
      const idx = e.detail.value
      const opt = this.currentPickerOptions[idx]
      if (this.currentPickerField && opt) {
        this.formData[this.currentPickerField.prop] = opt.value
      }
      this.pickerVisible = false
      this.currentPickerField = null
    },
    validate() {
      for (const field of this.fields) {
        if (field.required && (this.formData[field.prop] === '' || this.formData[field.prop] === undefined || this.formData[field.prop] === null)) {
          uni.showToast({ title: `${field.label}必填`, icon: 'none' })
          return false
        }
      }
      return true
    },
    async handleSubmit() {
      if (!this.validate()) return

      const payload = { ...this.formData }
      const api = this.api || {}
      const fn = this.isEdit ? api.update : api.create
      if (!fn) {
        uni.showToast({ title: '未配置提交接口', icon: 'none' })
        return
      }

      try {
        await fn(payload)
        uni.showToast({ title: '保存成功', icon: 'success' })
        this.$emit('success')
        this.handleClose()
      } catch (error) {
        uni.showToast({ title: error.message || '保存失败', icon: 'none' })
      }
    }
  }
}
</script>

<style scoped lang="scss">
.drawer-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, .35);
  display: flex;
  justify-content: flex-end;
  z-index: 1200;
  opacity: 0;
  transition: opacity .24s ease;
}

.drawer-show {
  opacity: 1;
}

.drawer-content {
  width: 82vw;
  max-width: 640rpx;
  height: 100%;
  background: #fff;
  transform: translateX(100%);
  transition: transform .24s ease;
  display: flex;
  flex-direction: column;
}

.drawer-content-show {
  transform: translateX(0);
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx 10rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, .06);
}

.drawer-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1c1c1e;
}

.drawer-close {
  font-size: 36rpx;
  color: #8e8e93;
  padding: 8rpx;
}

.drawer-body {
  flex: 1;
  padding: 16rpx 24rpx 120rpx;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.form-label {
  font-size: 26rpx;
  color: #3a3a3c;
}

.req {
  color: #ff3b30;
  margin-left: 8rpx;
}

.form-input,
.form-value,
.form-textarea {
  background: #f5f5f7;
  border-radius: 14rpx;
  padding: 18rpx 20rpx;
  font-size: 26rpx;
  color: #1c1c1e;
}

.form-value {
  min-height: 72rpx;
  display: flex;
  align-items: center;
}

.form-textarea {
  min-height: 140rpx;
}

.drawer-footer {
  display: flex;
  gap: 12rpx;
  padding: 16rpx 24rpx 24rpx;
  border-top: 1rpx solid rgba(0, 0, 0, .06);
}

.drawer-btn {
  flex: 1;
  height: 72rpx;
  border-radius: 999px;
  font-size: 26rpx;
  border: none;
}

.drawer-btn-cancel {
  background: #ededf0;
  color: #3a3a3c;
}

.drawer-btn-confirm {
  background: #0a84ff;
  color: #fff;
}

.drawer-btn::after {
  border: none;
}
</style>
