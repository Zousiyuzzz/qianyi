<template>
  <div class="rank">
    <h4 class="title">{{ title }}</h4>
    <div class="list-container" :style="{ height: height ? `${height}px` : 'auto' }">
      <a-spin :spinning="loading">
        <div v-if="!list || list.length === 0" class="no-data">
          <a-empty description="暂无数据" />
        </div>
        <transition-group v-else name="list" tag="ul" class="list">
          <li :key="item.name" v-for="(item, index) in list" class="list-item"
            :style="{ animationDelay: `${index * 0.1}s` }">
            <span :class="['rank-number', index < 5 ? `active${index}` : '']">{{ index + 1 }}</span>
            <span class="name" :title="item.name">{{ item.name }}</span>
            <span class="value">¥{{ formatNumber(item.total) }}</span>
          </li>
        </transition-group>
      </a-spin>
    </div>
  </div>
</template>

<script>
export default {
  name: "RankList",
  // ['title', 'list']
  props: {
    title: {
      type: String,
      default: ''
    },
    list: {
      type: Array,
      default: () => []
    },
    height: {
      type: Number,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    formatNumber(num) {
      if (!num) return '0.00';
      return Number(num).toFixed(2);
    }
  }
}
</script>

<style lang="less" scoped>
.rank {
  padding: 0 32px 32px 72px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  min-height: 620px;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
  }

  .title {
    font-size: 1.05rem;
    font-weight: bold;
    color: rgba(0, 0, 0, 0.85);
    margin: 16px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
  }

  .list-container {
    position: relative;
    overflow: hidden;
    border-radius: 4px;
  }

  .no-data {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
  }

  .list {
    margin: 0;
    padding: 0;
    list-style: none;

    .list-item {
      display: flex;
      align-items: center;
      margin: 12px 0;
      padding: 8px 12px;
      border-radius: 4px;
      transition: all 0.3s ease;
      animation: slideDown 0.5s ease forwards;
      opacity: 0;
      transform: translateY(-20px);

      &:hover {
        background-color: #f5f5f5;
      }

      .rank-number {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        line-height: 24px;
        text-align: center;
        border-radius: 50%;
        font-size: 12px;
        font-weight: 600;
        margin-right: 16px;
        background-color: #535c68;
        color: #fff;
        transition: all 0.3s ease;

        &.active0 {
          background-color: #eb4d4b;
          transform: scale(1.1);
        }

        &.active1 {
          background-color: #f0932b;
          transform: scale(1.05);
        }

        &.active2 {
          background-color: #ff7f50;
        }

        &.active3 {
          background-color: #eccc68;
        }

        &.active4 {
          background-color: #f6e58d;
        }
      }

      .name {
        flex: 1;
        color: rgba(0, 0, 0, 0.85);
        font-size: 14px;
        margin-right: 16px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .value {
        flex-shrink: 0;
        color: #1890ff;
        font-size: 14px;
        font-weight: 500;
      }
    }
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter,
.list-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.mobile .rank {
  padding: 0 32px 32px 32px;
}
</style>