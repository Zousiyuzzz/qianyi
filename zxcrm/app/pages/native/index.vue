<template>
  <scroll-view scroll-y class="page" @scrolltolower="loadMore">
    <view class="app-header">
      <view class="title">原生业务示例</view>
      <view class="subtitle">基于 uni.request 封装的登录、菜单、列表、表单、上传流程演示。</view>
    </view>

    <view class="section">
      <view class="section-title">1. 登录与会话</view>
      <view class="card">
        <view class="form-item">
          <text class="label">账号</text>
          <input v-model="loginForm.username" placeholder="请输入账号" />
        </view>
        <view class="form-item">
          <text class="label">密码</text>
          <input v-model="loginForm.password" placeholder="请输入密码" password />
        </view>
        <view class="actions">
          <button class="btn" type="primary" :loading="loginLoading" @click="handleLogin">登录</button>
          <button class="btn ghost" :disabled="!sessionToken" @click="handleLogout">退出</button>
        </view>
        <view class="meta">当前Token：{{ sessionToken || '未登录' }}</view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">2. 菜单与审批入口</view>
      <view class="card">
        <view class="actions">
          <button class="btn" type="primary" :loading="menuLoading" @click="loadMenus">登录后拉取菜单</button>
        </view>
        <view v-if="menus.length" class="list">
          <view v-for="item in menus" :key="item.id" class="list-item">
            <text class="name">{{ getMenuTitle(item) }}</text>
            <text class="path">{{ item.path }}</text>
          </view>
        </view>
        <view v-else class="empty">暂无数据，先登录再刷新。</view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">3. 长列表（分页 + 节流）</view>
      <view class="card">
        <view class="actions">
          <button class="btn" :loading="listLoading" @click="refreshList">重新加载</button>
        </view>
        <view v-for="item in contentList" :key="item.id || item.title" class="list-item">
          <text class="name">{{ item.title || '内容标题' }}</text>
          <text class="path">{{ item.summary || item.createTime || '...' }}</text>
        </view>
        <view class="meta">第 {{ pagination.pageNo }} 页 · {{ contentList.length }} 条</view>
        <view class="empty" v-if="finished">没有更多了</view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">4. 表单提交 / CRUD</view>
      <view class="card">
        <view class="form-item">
          <text class="label">名称</text>
          <input v-model="formModel.title" placeholder="请输入内容标题" />
        </view>
        <view class="form-item">
          <text class="label">描述</text>
          <input v-model="formModel.summary" placeholder="请输入摘要" />
        </view>
        <view class="actions">
          <button class="btn" type="primary" :loading="formLoading" @click="submitForm">提交</button>
        </view>
        <view class="meta">最近提交：{{ lastSubmit || '暂无' }}</view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">5. 文件上传 / 下载</view>
      <view class="card">
        <view class="actions">
          <button class="btn" :loading="uploadLoading" @click="chooseAndUpload">选择并上传</button>
          <button class="btn ghost" :loading="downloadLoading" @click="downloadTemplate">下载示例</button>
        </view>
        <view class="meta">上传结果：{{ uploadResult || '等待上传' }}</view>
      </view>
    </view>
  </scroll-view>
</template>

<script>
import { login, logout } from '../../common/api/login'
import { queryPermissionsByUser, content } from '../../common/api/system'
import { uploadAction, downloadFile } from '../../common/api/manage'
import { API_ENV } from '../../common/config'

export default {
  data () {
    return {
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      loginLoading: false,
      sessionToken: '',
      menus: [],
      menuLoading: false,
      contentList: [],
      pagination: {
        pageNo: 1,
        pageSize: 10
      },
      listLoading: false,
      finished: false,
      formModel: {
        title: '移动端示例',
        summary: '和 Web 端保持一致的表单提交流程'
      },
      formLoading: false,
      lastSubmit: '',
      uploadLoading: false,
      downloadLoading: false,
      uploadResult: ''
    }
  },
  methods: {
    handleLogin () {
      this.loginLoading = true
      login({ ...this.loginForm }).then((res) => {
        this.sessionToken = res?.result?.token || ''
        uni.showToast({ title: '登录成功', icon: 'success' })
      }).finally(() => {
        this.loginLoading = false
      })
    },
    handleLogout () {
      this.loginLoading = true
      logout(this.sessionToken).then(() => {
        this.sessionToken = ''
        this.menus = []
        uni.showToast({ title: '已退出', icon: 'none' })
      }).finally(() => {
        this.loginLoading = false
      })
    },
    loadMenus () {
      this.menuLoading = true
      queryPermissionsByUser().then(res => {
        this.menus = res?.result || []
      }).finally(() => {
        this.menuLoading = false
      })
    },
    getMenuTitle (item) {
      if (!item) return ''
      return (item.meta && item.meta.title) || item.title || ''
    },
    refreshList () {
      this.pagination.pageNo = 1
      this.finished = false
      this.contentList = []
      this.loadMore(true)
    },
    loadMore (force) {
      if (this.finished || this.listLoading) return
      this.listLoading = true
      const params = { pageNo: this.pagination.pageNo, pageSize: this.pagination.pageSize }
      content.list(params).then(res => {
        const records = res?.result?.records || res?.result || []
        if (force) {
          this.contentList = records
        } else {
          this.contentList = this.contentList.concat(records)
        }
        if (!records.length || records.length < this.pagination.pageSize) {
          this.finished = true
        } else {
          this.pagination.pageNo += 1
        }
      }).finally(() => {
        this.listLoading = false
      })
    },
    submitForm () {
      if (!this.formModel.title) {
        uni.showToast({ title: '请输入名称', icon: 'none' })
        return
      }
      this.formLoading = true
      content.create({ ...this.formModel }).then(() => {
        this.lastSubmit = `${this.formModel.title} · ${new Date().toLocaleTimeString()}`
        uni.showToast({ title: '已提交', icon: 'success' })
      }).finally(() => {
        this.formLoading = false
      })
    },
    chooseAndUpload () {
      uni.chooseImage({
        count: 1,
        success: (chooseRes) => {
          const filePath = chooseRes.tempFilePaths[0]
          this.uploadLoading = true
          uploadAction('/sys/common/upload', { filePath, formData: { biz: 'demo' } }).then(res => {
            this.uploadResult = res?.message || '上传成功'
          }).finally(() => {
            this.uploadLoading = false
          })
        }
      })
    },
    downloadTemplate () {
      this.downloadLoading = true
      downloadFile(`${API_ENV.baseURL}/sys/common/download/template`, 'template.xlsx').then(() => {
        uni.showToast({ title: '已下载至本地', icon: 'none' })
      }).finally(() => {
        this.downloadLoading = false
      })
    }
  },
  onReachBottom () {
    this.loadMore()
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding-bottom: 40rpx;
}
.section {
  padding: 24rpx 28rpx 0;
}
.section-title {
  font-size: 32rpx;
  font-weight: 700;
  margin-bottom: 12rpx;
}
.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx 16rpx;
  box-shadow: 0 12rpx 32rpx rgba(23, 71, 141, 0.12);
}
.form-item {
  display: flex;
  align-items: center;
  padding: 12rpx 0;
}
.label {
  width: 160rpx;
  color: #4b5563;
  font-size: 26rpx;
}
input {
  flex: 1;
  background: #f8fafc;
  border-radius: 12rpx;
  padding: 16rpx 18rpx;
}
.actions {
  display: flex;
  gap: 16rpx;
  margin: 12rpx 0;
}
.btn {
  flex: 1;
  background: linear-gradient(135deg, #2e87ff 0%, #4ca1ff 40%, #7ecbff 100%);
  color: #fff;
  border: none;
  border-radius: 12rpx;
  line-height: 88rpx;
  height: 88rpx;
  font-size: 28rpx;
}
.btn.ghost {
  background: #e5edff;
  color: #1f3a8a;
}
.list-item {
  padding: 12rpx 0;
  border-bottom: 1rpx solid #f1f5f9;
}
.name {
  display: block;
  font-weight: 600;
  color: #0f172a;
}
.path {
  font-size: 24rpx;
  color: #6b7280;
}
.meta {
  margin-top: 8rpx;
  color: #6b7280;
  font-size: 24rpx;
}
.empty {
  text-align: center;
  color: #94a3b8;
  padding: 12rpx 0;
}
</style>
