<template>
  <view class="page">
    <view class="toolbar">
      <view class="title">{{ title }}</view>
      <view class="subtitle">如需切换功能，请使用底部 Tab 或返回上一页。</view>
    </view>
    <web-view :src="decodedUrl"></web-view>
  </view>
</template>

<script>
export default {
  data () {
    return {
      url: '',
      title: 'H5 功能'
    }
  },
  computed: {
    decodedUrl () {
      return decodeURIComponent(this.url || '')
    }
  },
  onLoad (query) {
    this.url = query.url || ''
    this.title = query.title || 'H5 功能'
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
}
.toolbar {
  padding: 24rpx 28rpx 12rpx;
  background: #f6f8fb;
}
.title {
  font-size: 32rpx;
  font-weight: 700;
}
.subtitle {
  font-size: 24rpx;
  color: #475569;
}
</style>
