<template>
  <view class="drawer-wrapper" :class="{ 'drawer-show': visible }" @click.stop="handleMaskClick"
    v-if="visible || showDrawer">
    <view class="drawer-content" :class="{ 'drawer-content-show': visible }" @click.stop>
      <!-- Header -->
      <view class="drawer-header">
        <text class="drawer-title">{{ isEdit ? '修改项目' : '新增项目' }}</text>
        <text class="drawer-close" @click.stop="handleClose">×</text>
      </view>

      <!-- Body -->
      <scroll-view class="drawer-body" scroll-y>
        <view class="form-group">
          <!-- 客户 -->
          <view class="form-item">
            <text class="form-label">
              客户
              <text class="req">*</text>
            </text>
            <view class="form-value" @click="openSelectDrawer('customer')">
              {{ getPickerText(customerOptions, formData.customerId) || '请选择客户' }}
            </view>
          </view>

          <!-- 项目名称 -->
          <view class="form-item">
            <text class="form-label">
              项目名称
              <text class="req">*</text>
            </text>
            <input class="form-input" v-model="formData.proName" placeholder="请输入项目名称" />
          </view>

          <!-- 渠道 -->
          <view class="form-item">
            <text class="form-label">
              渠道
              <text class="req">*</text>
            </text>
            <view class="form-value" @click="openSelectDrawer('channel')">
              {{ getPickerText(channelOptions, formData.businessId) || '请选择渠道' }}
            </view>
          </view>

          <!-- 合作方式 -->
          <view class="form-item">
            <text class="form-label">
              合作方式
              <text class="req">*</text>
            </text>
            <view class="form-value" @click="openSelectDrawer('collaborationMode')">
              {{ getPickerText(collaborationModeOptions, formData.collaborationMode) || '请选择合作方式' }}
            </view>
          </view>

          <!-- 结算方式（条件显示：合作方式为1时） -->
          <view class="form-item" v-if="showPaymentMethod">
            <text class="form-label">
              结算方式
              <text class="req">*</text>
            </text>
            <view class="form-value" @click="openSelectDrawer('paymentMethod')">
              {{ getPickerText(paymentMethodOptions, formData.paymentMethod) || '请选择结算方式' }}
            </view>
          </view>

          <!-- 运营方式 -->
          <view class="form-item">
            <text class="form-label">
              运营方式
              <text class="req">*</text>
            </text>
            <view class="form-value" @click="openSelectDrawer('operationType')">
              {{ getPickerText(operationTypeOptions, formData.operationType) || '请选择运营方式' }}
            </view>
          </view>

          <!-- AE -->
          <view class="form-item">
            <text class="form-label">
              AE
              <text class="req">*</text>
            </text>
            <view class="form-value" @click="openSelectDrawer('aePerson')">
              {{ getPickerText(userOptions, formData.aePerson) || '请选择AE' }}
            </view>
          </view>

          <!-- 运营 -->
          <view class="form-item">
            <text class="form-label">
              运营
            </text>
            <view class="form-value" @click="openSelectDrawer('operationPerson')">
              {{ getPickerText(userOptions, formData.operationPerson) || '请选择运营' }}
            </view>
          </view>

          <!-- 商务 -->
          <view class="form-item">
            <text class="form-label">
              商务
              <text class="req">*</text>
            </text>
            <view class="form-value" @click="openSelectDrawer('businessPerson')">
              {{ getPickerText(userOptions, formData.businessPerson) || '请选择商务' }}
            </view>
          </view>

          <!-- 应回款天数（条件显示：合作方式为1或2时） -->
          <view class="form-item" v-if="showRepayDay">
            <text class="form-label">
              应回款天数
              <text class="req">*</text>
            </text>
            <input class="form-input" type="number" v-model.number="formData.repayDay" placeholder="请输入应回款天数（≥31）" />
          </view>

          <!-- 备注 -->
          <view class="form-item">
            <text class="form-label">备注</text>
            <textarea class="form-textarea" v-model="formData.remark" placeholder="请输入备注" auto-height />
          </view>
        </view>
      </scroll-view>

      <!-- Footer -->
      <view class="drawer-footer">
        <button class="drawer-btn drawer-btn-cancel" @click="handleClose">取消</button>
        <button class="drawer-btn drawer-btn-confirm" @click="handleSubmit">保存</button>
      </view>
    </view>

    <!-- 选择抽屉 -->
    <select-drawer :visible="selectDrawerVisible" :title="selectDrawerTitle" :value="selectDrawerValue"
      :dict="selectDrawerDict" :dictOptions="selectDrawerOptions" :async="selectDrawerAsync" :searchable="true"
      @update:visible="selectDrawerVisible = $event" @change="handleSelectChange" @close="handleSelectClose" />
  </view>
</template>

<script>
import { getProjectDetail, addProject, updateProject } from '../../common/api/project'
import { getCustomerList } from '../../common/api/customer'
import { getChannelList } from '../../common/api/channel'
import { request } from '../../common/api/request'
import SelectDrawer from '../../components/SelectDrawer.vue'

// 获取用户列表
function getUserList(params) {
  return request({
    url: '/sys/user/list',
    method: 'GET',
    params
  })
}

// 获取部门树
function getDepartTreeList() {
  return request({
    url: '/sys/sysDepart/queryTreeList',
    method: 'GET'
  })
}

// 获取字典项列表
function getDictItemList(params) {
  return request({
    url: '/sys/dictItem/list',
    method: 'GET',
    params
  })
}

// 根据部门ID获取用户
function getUserByDepIds(ids) {
  return request({
    url: '/sys/user/getUerByDepIds',
    method: 'POST',
    data: { ids }
  })
}

export default {
  name: 'ProjectFormDrawer',
  components: {
    SelectDrawer
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    editData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      showDrawer: false,
      isEdit: false,
      loading: false,
      formData: {
        customerId: '',
        proName: '',
        businessId: '',
        collaborationMode: '',
        paymentMethod: '',
        operationType: '',
        aePerson: '',
        operationPerson: '',
        businessPerson: '',
        repayDay: null,
        remark: ''
      },
      // 选项数据
      customerOptions: [],
      channelOptions: [],
      collaborationModeOptions: [
        { value: '0', text: '预付' },
        { value: '1', text: '垫付' },
        { value: '2', text: '服务费' }
      ],
      paymentMethodOptions: [
        { value: '0', text: '充值结算' },
        { value: '1', text: '消耗结算' }
      ],
      operationTypeOptions: [
        { value: '1', text: '自运营' },
        { value: '2', text: '走量' },
        { value: '3', text: '收量' }
      ],
      aeOptions: [],
      operationPersonOptions: [],
      businessPersonOptions: [],
      userOptions: [], // 用户列表（AE、运营、商务共用）
      // 选择抽屉相关
      selectDrawerVisible: false,
      selectDrawerTitle: '',
      selectDrawerValue: null,
      selectDrawerDict: '',
      selectDrawerOptions: [],
      selectDrawerAsync: false,
      selectDrawerField: '' // 当前打开的选择字段
    }
  },
  computed: {
    showPaymentMethod() {
      return this.formData.collaborationMode === '1'
    },
    showRepayDay() {
      return this.formData.collaborationMode === '1' || this.formData.collaborationMode === '2'
    }
  },
  watch: {
    'formData.collaborationMode'(newVal) {
      // 合作方式改变时，如果不是垫付(1)，清除结算方式
      if (newVal !== '1') {
        this.formData.paymentMethod = ''
      }
      // 如果合作方式不是垫付(1)或服务费(2)，清除应回款天数
      if (newVal !== '1' && newVal !== '2') {
        this.formData.repayDay = null
      }
    },
    visible(newVal) {
      if (newVal) {
        this.showDrawer = true
        this.$nextTick(() => {
          this.loadOptions()
          if (this.editData && this.editData.id) {
            this.isEdit = true
            this.loadDetail()
          } else {
            this.isEdit = false
            this.resetForm()
          }
        })
      } else {
        setTimeout(() => {
          this.showDrawer = false
        }, 300)
      }
    },
    editData: {
      handler(newVal) {
        if (this.visible && newVal && newVal.id) {
          this.isEdit = true
          this.loadDetail()
        } else if (this.visible) {
          this.isEdit = false
          this.resetForm()
        }
      },
      immediate: false
    }
  },
  methods: {
    resetForm() {
      this.formData = {
        customerId: '',
        proName: '',
        businessId: '',
        collaborationMode: '',
        paymentMethod: '',
        operationType: '',
        aePerson: '',
        operationPerson: '',
        businessPerson: '',
        repayDay: null,
        remark: ''
      }
    },
    async loadOptions() {
      // 加载客户列表
      try {
        const customerRes = await getCustomerList({ pageNo: 1, pageSize: 3 })
        if (customerRes && customerRes.success) {
          const records = customerRes.result?.records || customerRes.result?.list || []
          this.customerOptions = records.map(item => ({
            value: item.id,
            text: item.customerName || '-'
          }))
          console.log('customerOptions:', JSON.stringify(this.customerOptions))
        }
      } catch (e) {
        console.error('加载客户列表失败:', e)
      }

      // 加载渠道列表
      try {
        const channelRes = await getChannelList({ pageNo: 1, pageSize: 1000 })
        if (channelRes && channelRes.success) {
          const records = channelRes.result?.records || channelRes.result?.list || []
          this.channelOptions = records.map(item => ({
            value: item.id,
            text: item.businessName || '-'
          }))
        }
      } catch (e) {
        console.error('加载渠道列表失败:', e)
      }

      // 注意：AE/运营/商务人员通过按部门加载，在打开选择抽屉时加载
    },

    // 在树形数据中查找指定多个ID的对象及其所有子节点，只返回id数组
    findNodesByIds(treeData, targetIds) {
      const resultSet = new Set()
      const idSet = new Set(targetIds)

      const traverse = (nodes) => {
        if (!nodes || !Array.isArray(nodes)) return

        for (const node of nodes) {
          if (idSet.has(node.id)) {
            resultSet.add(node.id)
            if (node.children && Array.isArray(node.children)) {
              addAllChildren(node.children, resultSet)
            }
          } else {
            if (node.children && Array.isArray(node.children)) {
              traverse(node.children)
            }
          }
        }
      }

      const addAllChildren = (children, resultSet) => {
        for (const child of children) {
          resultSet.add(child.id)
          if (child.children && Array.isArray(child.children)) {
            addAllChildren(child.children, resultSet)
          }
        }
      }

      traverse(treeData)
      return Array.from(resultSet)
    },

    async loadUsersByDepartment(type) {
      try {
        // 1. 获取部门树
        const departRes = await getDepartTreeList()
        if (!departRes || !departRes.success) {
          console.error('获取部门树失败')
          return
        }

        const treeData = departRes.result || []

        // 2. 根据类型获取字典ID
        let dictId = ''
        if (type === 'aePerson') {
          dictId = '1955216782652645378' // AE
        } else if (type === 'businessPerson') {
          dictId = '1955203485702369281' // 商务
        } else if (type === 'operationPerson') {
          dictId = '1955216725303926786' // 运营
        }

        // 3. 获取字典项（部门ID列表）
        const dictItemRes = await getDictItemList({
          pageNo: 1,
          pageSize: 100,
          dictId: dictId,
          field: 'id,,itemText,itemValue,action'
        })

        if (!dictItemRes || !dictItemRes.success) {
          console.error('获取字典项失败:', dictItemRes?.message)
          return
        }

        const deptIds = dictItemRes.result?.records?.map(item => item.itemValue) || []
        if (deptIds.length === 0) {
          console.warn(`未找到${type}的部门配置`)
          return
        }

        // 4. 在部门树中找到这些部门及其所有子部门
        const foundNodeIds = this.findNodesByIds(treeData, deptIds)

        if (foundNodeIds.length === 0) {
          console.warn(`未找到${type}的部门节点`)
          return
        }

        // 5. 根据部门ID获取用户
        const userRes = await getUserByDepIds(foundNodeIds.join(','))
        if (userRes && userRes.success) {
          const userList = (userRes.result || []).map(item => ({
            value: item.id,
            text: item.realname || item.username || '-'
          }))

          // 根据类型设置到对应的选项
          if (type === 'aePerson') {
            this.aeOptions = userList
          } else if (type === 'businessPerson') {
            this.businessPersonOptions = userList
          } else if (type === 'operationPerson') {
            this.operationPersonOptions = userList
          }

          console.log(`${type}用户列表:`, userList)
        } else {
          console.error(`获取${type}用户失败:`, userRes?.message)
        }
      } catch (e) {
        console.error(`加载${type}用户失败:`, e)
      }
    },
    async loadDetail() {
      if (!this.editData || !this.editData.id) return

      this.loading = true
      try {
        const res = await getProjectDetail(this.editData.id)
        if (res && res.success) {
          const data = res.result || {}
          this.formData = {
            customerId: data.customerId || '',
            proName: data.proName || '',
            businessId: data.businessId || '',
            collaborationMode: String(data.collaborationMode || ''),
            paymentMethod: String(data.paymentMethod || ''),
            operationType: String(data.operationType || ''),
            aePerson: data.aePerson || '',
            operationPerson: data.operationPerson || '',
            businessPerson: data.businessPerson || '',
            repayDay: data.repayDay || null,
            remark: data.remark || ''
          }
        } else {
          uni.showToast({ title: res?.message || '加载失败', icon: 'none' })
        }
      } catch (e) {
        console.error('加载详情失败:', e)
        uni.showToast({ title: e.message || '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    async openSelectDrawer(field) {
      this.selectDrawerField = field
      let title = ''
      let dict = ''
      let options = []
      let async = false
      let value = this.formData[field] || null

      switch (field) {
        case 'customer':
          title = '选择客户'
          // 使用列表接口加载，而不是字典接口
          if (this.customerOptions.length === 0) {
            try {
              const customerRes = await getCustomerList({ pageNo: 1, pageSize: 1000 })
              if (customerRes && customerRes.success) {
                const records = customerRes.result?.records || customerRes.result?.list || []
                this.customerOptions = records.map(item => ({
                  value: item.id,
                  text: item.customerName || '-'
                }))
              }
            } catch (e) {
              console.error('加载客户列表失败:', e)
            }
          }
          options = this.customerOptions
          async = false // 使用本地数据
          break
        case 'channel':
          title = '选择渠道'
          // 使用列表接口加载，而不是字典接口
          if (this.channelOptions.length === 0) {
            try {
              const channelRes = await getChannelList({ pageNo: 1, pageSize: 1000 })
              if (channelRes && channelRes.success) {
                const records = channelRes.result?.records || channelRes.result?.list || []
                this.channelOptions = records.map(item => ({
                  value: item.id,
                  text: item.businessName || '-'
                }))
              }
            } catch (e) {
              console.error('加载渠道列表失败:', e)
            }
          }
          options = this.channelOptions
          async = false // 使用本地数据
          break
        case 'collaborationMode':
          title = '选择合作方式'
          dict = 'projectt_hezuotype'
          async = false
          break
        case 'paymentMethod':
          title = '选择结算方式'
          dict = 'project_paymentMethod'
          async = false
          break
        case 'operationType':
          title = '选择运营方式'
          dict = 'project_operation_type'
          async = false
          break
        case 'aePerson':
          title = '选择AE'
          // 根据部门获取AE用户
          if (this.aeOptions.length === 0) {
            await this.loadUsersByDepartment('aePerson')
          }
          options = this.aeOptions
          async = false
          break
        case 'operationPerson':
          title = '选择运营'
          // 根据部门获取运营用户
          if (this.operationPersonOptions.length === 0) {
            await this.loadUsersByDepartment('operationPerson')
          }
          options = this.operationPersonOptions
          async = false
          break
        case 'businessPerson':
          title = '选择商务'
          // 根据部门获取商务用户
          if (this.businessPersonOptions.length === 0) {
            await this.loadUsersByDepartment('businessPerson')
          }
          options = this.businessPersonOptions
          async = false
          break
      }

      // 如果是本地选项（已经在上面的 switch 中设置好了），或者有预定义的本地选项
      if (!async && options.length === 0) {
        const localOptions = this.getLocalOptions(field)
        if (localOptions.length > 0) {
          options = localOptions
          dict = ''
        }
      }

      // 如果有 options，优先使用 options，否则使用 dict
      if (options.length > 0) {
        dict = ''
      }

      this.selectDrawerTitle = title
      this.selectDrawerDict = dict
      this.selectDrawerOptions = options
      this.selectDrawerAsync = async
      this.selectDrawerValue = value
      this.selectDrawerVisible = true
    },
    getLocalOptions(field) {
      switch (field) {
        case 'collaborationMode':
          return this.collaborationModeOptions
        case 'paymentMethod':
          return this.paymentMethodOptions
        case 'operationType':
          return this.operationTypeOptions
        default:
          return []
      }
    },
    handleSelectChange(value) {
      const field = this.selectDrawerField
      console.log('选择变化:', field, value)
      // 根据字段映射到 formData
      if (field === 'customer') {
        this.formData.customerId = value
      } else if (field === 'channel') {
        this.formData.businessId = value
      } else {
        this.formData[field] = value
      }
      console.log('更新后的formData:', this.formData)
    },
    handleSelectClose() {
      this.selectDrawerField = ''
    },
    getPickerText(options, value) {
      if (!value && value !== 0) return ''
      const opt = options.find(x => String(x.value) === String(value))
      return opt ? opt.text : ''
    },
    validate() {
      // 必填验证
      if (!this.formData.customerId) {
        uni.showToast({ title: '请选择客户', icon: 'none' })
        return false
      }
      if (!this.formData.proName || !this.formData.proName.trim()) {
        uni.showToast({ title: '请输入项目名称', icon: 'none' })
        return false
      }
      if (!this.formData.businessId) {
        uni.showToast({ title: '请选择渠道', icon: 'none' })
        return false
      }
      if (!this.formData.collaborationMode) {
        uni.showToast({ title: '请选择合作方式', icon: 'none' })
        return false
      }
      if (this.showPaymentMethod && !this.formData.paymentMethod) {
        uni.showToast({ title: '请选择结算方式', icon: 'none' })
        return false
      }
      if (!this.formData.operationType) {
        uni.showToast({ title: '请选择运营方式', icon: 'none' })
        return false
      }
      if (!this.formData.aePerson) {
        uni.showToast({ title: '请选择AE', icon: 'none' })
        return false
      }
      if (!this.formData.businessPerson) {
        uni.showToast({ title: '请选择商务', icon: 'none' })
        return false
      }
      if (this.showRepayDay && (!this.formData.repayDay || this.formData.repayDay < 31)) {
        uni.showToast({ title: '请输入应回款天数（≥31）', icon: 'none' })
        return false
      }
      return true
    },
    async handleSubmit() {
      console.log('开始保存，表单数据:', this.formData)
      if (!this.validate()) {
        console.log('验证失败')
        return
      }

      this.loading = true
      try {
        const payload = {
          ...this.formData,
          ...(this.isEdit && this.editData?.id ? { id: this.editData.id } : {})
        }

        // 合作方式不为1时，结算方式传99
        if (payload.collaborationMode !== '1') {
          payload.paymentMethod = '99'
        } else {
          // 合作方式为1时必须传结算方式
          if (!payload.paymentMethod) {
            uni.showToast({ title: '请选择结算方式', icon: 'none' })
            this.loading = false
            return
          }
        }

        // 合作方式不为1或2时，不传递应回款天数
        if (payload.collaborationMode !== '1' && payload.collaborationMode !== '2') {
          delete payload.repayDay
        }

        console.log('保存请求参数:', payload)
        console.log('是否编辑模式:', this.isEdit)

        let res
        if (this.isEdit) {
          res = await updateProject(payload)
        } else {
          res = await addProject(payload)
        }

        console.log('保存响应:', res)

        if (res && res.success) {
          uni.showToast({ title: res.message || '保存成功', icon: 'success' })
          this.$emit('success')
          this.handleClose()
        } else {
          uni.showToast({ title: res?.message || '保存失败', icon: 'none' })
        }
      } catch (e) {
        console.error('保存失败:', e)
        uni.showToast({ title: e.message || '保存失败', icon: 'none' })
      } finally {
        this.loading = false
      }
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
.drawer-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0);
  transition: background 0.3s;
  pointer-events: none;

  &.drawer-show {
    background: rgba(0, 0, 0, 0.5);
    pointer-events: auto;
  }
}

.drawer-content {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  transform: translateY(100%);
  transition: transform 0.3s;
  padding-left: 32rpx;
  padding-right: 32rpx;
  box-sizing: border-box;

  &.drawer-content-show {
    transform: translateY(0);
  }
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 0;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);
}

.drawer-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #1c1c1e;
}

.drawer-close {
  font-size: 56rpx;
  color: #8e8e93;
  line-height: 1;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 32rpx 0;
}

.form-group {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);

  &:last-child {
    border-bottom: none;
  }
}

.form-label {
  font-size: 28rpx;
  color: #8e8e93;
  min-width: 180rpx;
  flex-shrink: 0;
}

.req {
  color: #ff3b30;
  margin-left: 6rpx;
}

.form-value {
  flex: 1;
  text-align: right;
  font-size: 28rpx;
  color: #1c1c1e;
  min-height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.form-input {
  flex: 1;
  text-align: right;
  font-size: 28rpx;
  color: #1c1c1e;
}

.form-textarea {
  flex: 1;
  text-align: right;
  font-size: 28rpx;
  color: #1c1c1e;
  min-height: 120rpx;
  padding: 16rpx 0;
}

.drawer-footer {
  display: flex;
  gap: 24rpx;
  padding: 24rpx 0;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid rgba(0, 0, 0, 0.06);
  background: #fff;
}

.drawer-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 18rpx;
  font-size: 32rpx;
  border: none;

  &::after {
    border: none;
  }
}

.drawer-btn-cancel {
  background: #f2f2f7;
  color: #1c1c1e;
}

.drawer-btn-confirm {
  background: #0a84ff;
  color: #fff;
}
</style>
