<template>
  <view class="page" :style="{ paddingTop: navbarHeight + 'px' }">
    <!-- Navbar -->
    <view class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-content">
        <view class="navbar-left" @click.stop="handleBack">
          <text class="back-icon">‹</text>
        </view>
        <view class="navbar-title">{{ pageTitle }}</view>
        <view class="navbar-right"></view>
      </view>
    </view>

    <scroll-view class="content-scroll" scroll-y>
      <view class="group">
        <view v-for="(f, idx) in crud.fields" :key="f.prop">
          <view class="group-item">
            <text class="label">
              {{ f.label }}
              <text v-if="f.required" class="req">*</text>
            </text>

            <!-- input -->
            <input v-if="f.type === 'input'" class="value-input" v-model="formData[f.prop]"
              :placeholder="f.placeholder || `请输入${f.label}`" />

            <!-- textarea -->
            <textarea v-else-if="f.type === 'textarea'" class="value-textarea" v-model="formData[f.prop]"
              :placeholder="f.placeholder || `请输入${f.label}`" auto-height />

            <!-- picker -->
            <picker v-else-if="f.type === 'picker'" mode="selector" :range="f.options" range-key="text"
              @change="onPickerChange(f, $event)">
              <view class="value-picker">
                {{ getPickerText(f) }}
              </view>
            </picker>
          </view>

          <view class="divider" v-if="idx !== crud.fields.length - 1"></view>
        </view>
      </view>

      <view class="bottom-safe">
        <view class="bottom-actions">
          <button class="btn ios-primary" @click="handleSave">{{ crud.ui.saveText }}</button>
        </view>
      </view>
    </scroll-view>

    <view class="loading" v-if="loading">
      <text>{{ crud.ui.loadingText }}</text>
    </view>
  </view>
</template>

<script>
import { getProjectDetail } from '../../common/api/project'
import navbarMixin from '../mixins/navbarMixin'

/**
 * ======= 你复制“客户管理 form”只需要改这里 =======
 * - ui 文案
 * - api.detail / api.save（保存接口你填自己的）
 * - fields（字段配置）
 */
const crud = {
  ui: {
    titleAdd: '新增项目',
    titleEdit: '修改项目',
    saveText: '保存',
    loadingText: '加载中...'
  },

  api: {
    detail: getProjectDetail,
    // ⚠️ 这里不要我瞎猜你后端保存接口名
    // 你自己配置：save: (payload)=>request(...)
    save: null
  },

  idProp: 'id',

  // 字段配置（你随便增删改）
  fields: [
    { label: '项目名称', prop: 'proName', type: 'input', required: true },
    { label: '客户名称', prop: 'customerName', type: 'input' },

    {
      label: '运营方式',
      prop: 'operationType',
      type: 'picker',
      options: [
        { value: '', text: '请选择' },
        { value: '1', text: '自运营' },
        { value: '2', text: '走量' },
        { value: '3', text: '收量' }
      ]
    },
    {
      label: '合作方式',
      prop: 'collaborationMode',
      type: 'picker',
      options: [
        { value: '', text: '请选择' },
        { value: '0', text: '预付' },
        { value: '1', text: '垫付' },
        { value: '2', text: '服务费' }
      ]
    },

    { label: '备注', prop: 'remark', type: 'textarea' }
  ]
}

export default {
  mixins: [navbarMixin],
  data() {
    return {
      crud,
      mode: 'add',
      id: '',
      loading: false,
      formData: {}
    }
  },

  computed: {
    pageTitle() {
      return this.mode === 'edit' ? this.crud.ui.titleEdit : this.crud.ui.titleAdd
    }
  },

  onLoad(query) {
    console.log('form onLoad query:', query)
    this.mode = query.mode || 'add'
    this.id = query.id || ''
    console.log('form mode:', this.mode, 'id:', this.id)

    this.initForm()

    if (this.mode === 'edit') {
      if (!this.id) {
        console.warn('编辑模式但未提供id，返回上一页')
        uni.showToast({ title: '缺少项目ID', icon: 'none' })
        setTimeout(() => {
          this.handleBack()
        }, 1500)
        return
      }
      this.loadDetail()
    }
  },

  methods: {
    handleBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack({ delta: 1 })
      } else {
        uni.switchTab({ url: '/pages/modules/index' })
      }
    },

    initForm() {
      const obj = {}
      this.crud.fields.forEach(f => {
        obj[f.prop] = ''
      })
      this.formData = obj
    },

    async loadDetail() {
      this.loading = true
      try {
        const res = await this.crud.api.detail(this.id)
        console.log('loadDetail response:', res)
        if (res && res.success) {
          const data = res.result || {}
          console.log('loadDetail data:', data)
          console.log('formData keys:', Object.keys(this.formData))

          // 填充表单数据
          this.crud.fields.forEach(f => {
            const value = data[f.prop]
            // 将 undefined/null 转换为空字符串，其他值转换为字符串以保持一致
            this.$set(this.formData, f.prop, value !== undefined && value !== null ? String(value) : '')
          })

          console.log('formData after load:', this.formData)
        } else {
          uni.showToast({
            title: res?.message || '加载失败',
            icon: 'none'
          })
        }
      } catch (e) {
        console.error('loadDetail error:', e)
        uni.showToast({
          title: e.message || '加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    onPickerChange(field, e) {
      const idx = e.detail.value
      const opt = (field.options || [])[idx]
      this.formData[field.prop] = opt ? opt.value : ''
    },

    getPickerText(field) {
      const v = this.formData[field.prop]
      const opt = (field.options || []).find(x => String(x.value) === String(v))
      return opt ? opt.text : '请选择'
    },

    validate() {
      for (const f of this.crud.fields) {
        if (!f.required) continue
        const v = this.formData[f.prop]
        if (v === undefined || v === null || String(v).trim() === '') {
          uni.showToast({ title: `请填写${f.label}`, icon: 'none' })
          return false
        }
      }
      return true
    },

    async handleSave() {
      if (!this.validate()) return

      if (typeof this.crud.api.save !== 'function') {
        uni.showModal({
          title: '未配置保存接口',
          content: '请在 form.vue 顶部 crud.api.save 配置保存接口函数（复制复用时也只改配置即可）。',
          showCancel: false
        })
        return
      }

      const payload = {
        ...(this.mode === 'edit' ? { [this.crud.idProp]: this.id } : {}),
        ...this.formData
      }

      this.loading = true
      try {
        const res = await this.crud.api.save(payload)
        if (res && res.success === false) {
          uni.showToast({ title: res.message || '保存失败', icon: 'none' })
          return
        }
        uni.showToast({ title: '保存成功', icon: 'success' })
        setTimeout(() => uni.navigateBack({ delta: 1 }), 600)
      } catch (e) {
        uni.showToast({ title: e.message || '保存失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../common/styles/ios-common.scss';

.group {
  margin: 16rpx;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
}

.group-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
}

.label {
  font-size: 24rpx;
  color: #8e8e93;
  min-width: 160rpx;
}

.req {
  color: #ff3b30;
  margin-left: 6rpx;
}

.value-input {
  flex: 1;
  text-align: right;
  font-size: 26rpx;
  color: #1c1c1e;
}

.value-textarea {
  flex: 1;
  text-align: right;
  font-size: 26rpx;
  color: #1c1c1e;
  min-height: 80rpx;
}

.value-picker {
  flex: 1;
  text-align: right;
  font-size: 26rpx;
  color: #1c1c1e;
}

/* Divider */
.divider {
  height: 1rpx;
  background: rgba(0, 0, 0, .06);
  margin-left: 20rpx;
}

/* Bottom actions */
.bottom-safe {
  position: sticky;
  bottom: 0;
  background: #f2f2f7;
  padding-bottom: env(safe-area-inset-bottom);
}

.bottom-actions {
  display: flex;
  gap: 12rpx;
  padding: 12rpx 16rpx 16rpx;
}

.btn {
  flex: 1;
  height: 72rpx;
  border-radius: 18rpx;
  font-size: 26rpx;
}

.btn::after {
  border: none;
}

.btn.ios-primary {
  background: #ffffff;
  color: #0a84ff;
  box-shadow: 0 0 0 1rpx rgba(0, 0, 0, .06) inset;
}

/* Loading */
.loading {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}
</style>
