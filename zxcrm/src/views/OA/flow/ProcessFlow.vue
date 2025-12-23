<template>
  <div class="process-flow-container">
    <div class="process-flow" v-if="parsedNodes && parsedNodes.length > 0">
      <div v-for="(node, index) in parsedNodes" :key="node.node_id || index" class="process-node">
        <div class="node-content" :class="{ 'current-node': node.isCurrent }">
          <div class="node-icon">
            <a-icon v-if="node.node_key === 'start'" type="play-circle" />
            <a-icon v-else-if="node.node_key === 'end'" type="check-circle" />
            <a-icon v-else-if="node.node_key === 'cc'" type="file-text" />
            <a-icon v-else type="user" />
          </div>
          <div class="node-info">
            <div class="node-name">
              {{ (node.node_name == '结束' ? '审批完成' : node.node_name) || '-' }}
              <a-tag v-if="node.isCurrent" color="blue" style="margin-left: 8px;">当前</a-tag>
            </div>
            <div class="node-users" v-if="node.user_ids">
              {{ getUserNames(node.user_ids) }}
            </div>
            <div class="node-status" v-if="node.status">
              <a-tag :color="getNodeStatusColor(node.status)">
                {{ getNodeStatusText(node.status) }}
              </a-tag>
            </div>
          </div>
        </div>
        <div v-if="index < parsedNodes.length - 1" class="node-arrow">
          <a-icon type="arrow-right" />
        </div>
      </div>
    </div>
    <!-- 如果没有解析后的节点，显示节点人员配置数据 -->
    <div class="process-flow" v-else-if="nodePersonConfigs && nodePersonConfigs.length > 0">
      <div v-for="(config, index) in nodePersonConfigs" :key="config.id || index" class="process-node">
        <div class="node-content" :class="{ 'current-node': isCurrentNode(config.nodeId) }">
          <div class="node-icon">
            <a-icon type="user" />
          </div>
          <div class="node-info">
            <div class="node-name">
              {{ config.nodeName || '-' }}
              <a-tag v-if="isCurrentNode(config.nodeId)" color="blue" style="margin-left: 8px;">当前</a-tag>
            </div>
            <div class="node-users" v-if="config.assigneeName">
              {{ config.assigneeName }}
            </div>
            <div class="node-status" v-if="config.status">
              <a-tag :color="getNodeStatusColor(config.status)">
                {{ getNodeStatusText(config.status) }}
              </a-tag>
            </div>
          </div>
        </div>
        <div v-if="index < nodePersonConfigs.length - 1" class="node-arrow">
          <a-icon type="arrow-right" />
        </div>
      </div>
    </div>
    <!-- 如果没有节点人员配置，显示原有的流程节点 -->
    <div class="process-flow" v-else-if="processNodes && processNodes.length > 0">
      <div v-for="(node, index) in processNodes" :key="index" class="process-node">
        <div class="node-content" :class="{ 'active': node.isActive, 'completed': node.isCompleted }">
          <div class="node-icon">
            <a-icon v-if="node.node_key === 'start'" type="play-circle" />
            <a-icon v-else-if="node.node_key === 'end'" type="check-circle" />
            <a-icon v-else-if="node.node_key === 'cc'" type="file-text" />
            <a-icon v-else type="user" />
          </div>
          <div class="node-info">
            <div class="node-name">{{ node.node_name || '-' }}</div>
            <div class="node-users" v-if="node.user_ids">
              {{ getAssigneeNames(node) }}
            </div>
          </div>
        </div>
        <div v-if="index < processNodes.length - 1" class="node-arrow">
          <a-icon type="arrow-right" />
        </div>
      </div>
    </div>
    <a-empty v-else description="暂无流程信息" />
  </div>
</template>

<script>
export default {
  name: 'ProcessFlow',
  props: {
    // 解析后的流程节点数据
    parsedNodes: {
      type: Array,
      default: () => []
    },
    // 节点人员配置数据
    nodePersonConfigs: {
      type: Array,
      default: () => []
    },
    // 原有的流程节点数据
    processNodes: {
      type: Array,
      default: () => []
    },
    // 用户ID到用户名的映射
    userMap: {
      type: Object,
      default: () => ({})
    },
    // 当前节点ID（用于判断是否为当前节点）
    currentNodeId: {
      type: [String, Number],
      default: null
    }
  },
  methods: {
    // 根据用户ID获取用户名
    getUserNames(userIds) {
      if (!userIds) return '-'
      const ids = typeof userIds === 'string' ? userIds.split(',').map(id => id.trim()) : [userIds]
      const names = ids.map(id => {
        return this.userMap[id] || id
      }).filter(name => name)
      return names.length > 0 ? names.join('、') : '-'
    },
    // 获取审批人名称（兼容旧格式）
    getAssigneeNames(node) {
      if (!node || !node.user_ids) return '-'
      return this.getUserNames(node.user_ids)
    },
    // 判断是否为当前节点
    isCurrentNode(nodeId) {
      if (!nodeId || !this.currentNodeId) return false
      return String(nodeId) === String(this.currentNodeId)
    },
    // 获取节点状态颜色
    getNodeStatusColor(status) {
      const colorMap = {
        '0': 'default',
        '1': 'processing',
        '2': 'success',
        '3': 'error',
        '4': 'warning'
      }
      return colorMap[status] || 'default'
    },
    // 获取节点状态文本
    getNodeStatusText(status) {
      const textMap = {
        '0': '待审批',
        '1': '审批中',
        '2': '已通过',
        '3': '已驳回',
        '4': '已撤回'
      }
      return textMap[status] || '未知'
    }
  }
}
</script>

<style scoped lang="less">
.process-flow-container {
  .process-flow {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .process-node {
      display: flex;
      align-items: center;
      gap: 12px;

      .node-content {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: #f5f5f5;
        border-radius: 4px;
        flex: 1;
        transition: all 0.3s;

        &.current-node {
          background: #e6f7ff;
          border: 1px solid #91d5ff;
        }

        &.active {
          background: #e6f7ff;
          border: 1px solid #91d5ff;
        }

        &.completed {
          background: #f6ffed;
          border: 1px solid #b7eb8f;
        }

        .node-icon {
          font-size: 24px;
          color: #1890ff;
        }

        .node-info {
          flex: 1;

          .node-name {
            font-size: 14px;
            font-weight: 500;
            color: #333;
            margin-bottom: 4px;
          }

          .node-users {
            font-size: 12px;
            color: #666;
          }

          .node-status {
            margin-top: 4px;
          }
        }
      }

      .node-arrow {
        font-size: 16px;
        color: #d9d9d9;
      }
    }
  }
}
</style>

