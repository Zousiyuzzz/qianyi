<template>
  <view class="card" :style="cardStyle" @click="$emit('click')">
    <view class="title">{{ title }}</view>
    <view class="desc">{{ desc }}</view>
    <view class="tag" v-if="tag">{{ tag }}</view>
  </view>
</template>

<script>
export default {
  name: 'ModuleCard',
  props: {
    title: String,
    desc: String,
    tag: String,
    gradient: {
      type: String,
      default: ''
    }
  },
  computed: {
    cardStyle () {
      return this.gradient
        ? `background-image:${this.gradient}`
        : ''
    }
  }
}
</script>

<style scoped>
.card {
  position: relative;
  padding: 16rpx 20rpx;
  border-radius: 16rpx;
  background: #ffffff;
  box-shadow: 0 12rpx 28rpx rgba(32, 82, 149, 0.12);
  margin-bottom: 20rpx;
  color: #0f172a;
}
.title {
  font-size: 30rpx;
  font-weight: 600;
  margin-bottom: 10rpx;
}
.desc {
  font-size: 24rpx;
  color: #475569;
  line-height: 1.5;
}
.tag {
  position: absolute;
  top: 12rpx;
  right: 14rpx;
  padding: 6rpx 12rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.28);
  color: #0f172a;
  font-size: 22rpx;
}
</style>
