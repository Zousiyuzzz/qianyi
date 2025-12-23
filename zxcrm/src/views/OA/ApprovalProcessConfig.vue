<template>
  <div class="approval-process-config">
    <a-card :bordered="false">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-left">
          <a-button type="primary" icon="plus" @click="handleAdd">新建流程</a-button>
          <a-button icon="reload" @click="handleRefresh" style="margin-left: 8px">刷新</a-button>
        </div>
        <div class="header-right">
          <a-input-search v-model="searchText" placeholder="搜索流程名称" style="width: 300px" @search="handleSearch"
            allowClear />
        </div>
      </div>

      <!-- 流程列表 -->
      <a-table :columns="columns" :dataSource="dataSource" :pagination="pagination" :loading="loading" rowKey="id"
        @change="handleTableChange">
        <template slot="isActive" slot-scope="text">
          <a-badge :status="text === '1' ? 'success' : 'default'" :text="text === '1' ? '启用' : '停用'" />
        </template>
        <template slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>
          <a-divider type="vertical" />
          <a @click="handleDelete(record)">删除</a>
          <a-divider type="vertical" />
          <a @click="handleCopy(record)">复制</a>
        </template>
      </a-table>
    </a-card>

    <!-- 流程配置弹窗 -->
    <a-modal :title="modalTitle" :visible="modalVisible" :width="1800" :maskClosable="false" :confirmLoading="saving"
      @ok="handleSave" @cancel="handleCancel" :okText="'保存'" :cancelText="'取消'"
      :bodyStyle="{ padding: '0', height: '700px' }" :style="{ top: '50px' }" wrapClassName="process-config-modal"
      @after-visible-change="handleModalVisibleChange">
      <!-- 顶部表单区域 -->
      <div class="modal-form-header">
        <a-form :form="form" layout="inline" class="header-form">
          <a-form-item label="流程名称">
            <a-input v-decorator="['processName', { rules: [{ required: true, message: '请输入流程名称' }] }]"
              placeholder="请输入流程名称" style="width: 200px" />
          </a-form-item>
          <a-form-item label="业务类型">
            <a-input v-decorator="['businessType', { rules: [{ required: true, message: '请输入业务类型' }] }]"
              placeholder="请输入业务类型标识" style="width: 200px" />
          </a-form-item>
          <a-form-item label="是否启用">
            <a-radio-group v-decorator="['isActive', { initialValue: '1' }]">
              <a-radio value="1">启用</a-radio>
              <a-radio value="0">停用</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-form>
      </div>

      <!-- 主体内容区域 -->
      <div class="process-config-body">
        <!-- 左侧：节点类型列表 -->
        <div class="config-left-panel">
          <div class="node-type-list">
            <div v-for="nodeType in nodeTypes" :key="nodeType.type" class="node-type-item" :style="{
              borderLeftColor: nodeType.color,
              backgroundColor: nodeType.color + '15'
            }" :draggable="true" @dragstart="handleDragStart($event, nodeType)" @dragend="handleDragEnd"
              :title="nodeType.label">
              {{ nodeType.label }}
            </div>
          </div>
        </div>

        <!-- 中间：流程图画布 -->
        <div class="config-center-panel">
          <div id="flow-container" class="flow-container" @drop="handleDrop" @dragover.prevent></div>
        </div>

        <!-- 右侧：节点配置抽屉 -->
        <a-drawer title="节点配置" placement="right" :closable="true" :visible="drawerVisible" :width="800"
          @close="handleDrawerClose" :getContainer="false" wrapClassName="node-config-drawer">
          <div v-if="selectedNode" class="node-config-content">
            <div class="drawer-header">
              <span class="drawer-title">节点：{{ selectedNode.label || selectedNode.id }}</span>
            </div>
            <!-- 审批节点配置 -->
            <template v-if="selectedNode.type === 'approval'">
              <NodeApprovalConfig :node="selectedNode" :userList="userList" :deptTree="deptTree" :roleList="roleList"
                @update="handleNodeUpdate" />
            </template>
            <!-- 条件节点配置 -->
            <template v-else-if="selectedNode.type === 'condition'">
              <NodeConditionConfig :node="selectedNode" :allNodes="allNodes" :businessType="currentBusinessType"
                @update="handleNodeUpdate" />
            </template>
            <!-- 抄送节点配置 -->
            <template v-else-if="selectedNode.type === 'copy'">
              <NodeApprovalConfig :node="selectedNode" :userList="userList" :deptTree="deptTree" :roleList="roleList"
                @update="handleNodeUpdate" />
            </template>
            <!-- 操作节点配置 -->
            <template v-else-if="selectedNode.type === 'operation'">
              <NodeOperationConfig :node="selectedNode" @update="handleNodeUpdate" />
            </template>
            <!-- 其他节点配置 -->
            <template v-else>
              <a-form :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
                <a-form-item label="节点名称">
                  <a-input v-model="selectedNode.label" placeholder="请输入节点名称" @change="handleNodeUpdate" />
                </a-form-item>
              </a-form>
            </template>
          </div>
          <div v-else class="node-config-empty">
            <a-empty description="请点击画布上的节点进行配置" />
          </div>
        </a-drawer>
      </div>
    </a-modal>

    <!-- 右键菜单 -->
    <div v-if="contextMenuVisible" class="context-menu" :style="{ left: contextMenuX + 'px', top: contextMenuY + 'px' }"
      @click.stop>
      <a-menu @click="handleContextMenuClick">
        <a-menu-item key="delete">
          <a-icon type="delete" /> 删除
        </a-menu-item>
      </a-menu>
    </div>
  </div>
</template>

<script>
import { Graph, Shape } from '@antv/x6'
import { getApprovalProcessConfigList, addApprovalProcessConfig, editApprovalProcessConfig, deleteApprovalProcessConfig, getUserListNotPage, queryDepartTreeList } from '@/api/api'
import NodeApprovalConfig from './components/NodeApprovalConfig.vue'
import NodeConditionConfig from './components/NodeConditionConfig.vue'
import NodeOperationConfig from './components/NodeOperationConfig.vue'
import { getOperationTypeLabel as getOperationTypeLabelFunc } from './config/operationTypes'

export default {
  name: 'ApprovalProcessConfig',
  components: {
    NodeApprovalConfig,
    NodeConditionConfig,
    NodeOperationConfig
  },
  data() {
    return {
      loading: false,
      saving: false,
      searchText: '',
      modalVisible: false,
      modalTitle: '新建流程配置',
      drawerVisible: false, // 抽屉显示状态
      editRecord: null, // 编辑时的记录数据
      contextMenuVisible: false, // 右键菜单显示状态
      contextMenuX: 0, // 右键菜单X坐标
      contextMenuY: 0, // 右键菜单Y坐标
      contextMenuTarget: null, // 右键菜单目标元素
      form: this.$form.createForm(this),
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0
      },
      columns: [
        {
          title: '流程名称',
          dataIndex: 'processName',
          key: 'processName'
        },
        {
          title: '业务类型',
          dataIndex: 'businessType',
          key: 'businessType'
        },
        {
          title: '是否启用',
          dataIndex: 'isActive',
          key: 'isActive',
          scopedSlots: { customRender: 'isActive' }
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          key: 'createTime'
        },
        {
          title: '操作',
          key: 'action',
          scopedSlots: { customRender: 'action' }
        }
      ],
      dataSource: [],
      graph: null,
      selectedNode: null,
      allNodes: [],
      userList: [],
      deptTree: [],
      roleList: [],
      currentNodeId: null,
      draggingNodeType: null,
      nodeTypes: [
        {
          type: 'start',
          label: '开始',
          icon: 'play-circle',
          color: '#52c41a'
        },
        {
          type: 'approval',
          label: '审批',
          icon: 'user',
          color: '#1890ff'
        },
        {
          type: 'condition',
          label: '条件',
          icon: 'branches',
          color: '#faad14'
        },
        {
          type: 'copy',
          label: '抄送',
          icon: 'copy',
          color: '#722ed1'
        },
        {
          type: 'operation',
          label: '操作节点',
          icon: 'tool',
          color: '#13c2c2'
        },
        {
          type: 'end',
          label: '结束',
          icon: 'stop',
          color: '#ff4d4f'
        }
      ]
    }
  },
  computed: {
    // 获取当前业务类型
    currentBusinessType() {
      return this.form.getFieldValue('businessType') || ''
    }
  },
  mounted() {
    this.loadData()
    this.loadConfigData()
  },
  beforeDestroy() {
    // 移除全局键盘事件监听
    if (this._keydownHandler) {
      document.removeEventListener('keydown', this._keydownHandler)
    }

    if (this.graph) {
      this.graph.dispose()
    }
  },
  methods: {
    // 加载流程列表
    async loadData() {
      this.loading = true
      try {
        const params = {
          pageNo: this.pagination.current,
          pageSize: this.pagination.pageSize
        }
        if (this.searchText) {
          params.processName = this.searchText
        }
        const res = await getApprovalProcessConfigList(params)
        if (res.success) {
          this.dataSource = res.result.records || []
          this.pagination.total = res.result.total || 0
        }
      } catch (error) {
        this.$message.error('加载数据失败')
      } finally {
        this.loading = false
      }
    },

    // 加载配置数据（用户、部门、角色）
    async loadConfigData() {
      try {
        const [usersRes, deptsRes] = await Promise.all([
          getUserListNotPage(),
          queryDepartTreeList()
        ])

        if (usersRes && usersRes.success) {
          // 新接口返回的用户对象包含 departs 和 roles 数组
          const allUsers = usersRes.result || []

          // 对用户列表进行去重（根据用户ID）
          const userMap = new Map()
          allUsers.forEach(user => {
            if (user.id && !userMap.has(user.id)) {
              userMap.set(user.id, user)
            }
          })
          this.userList = Array.from(userMap.values())

          // 从用户列表中提取所有角色（去重）
          const roleMap = new Map()
          this.userList.forEach(user => {
            if (user.roles && Array.isArray(user.roles)) {
              user.roles.forEach(role => {
                if (!roleMap.has(role.id)) {
                  roleMap.set(role.id, role)
                }
              })
            }
          })
          this.roleList = Array.from(roleMap.values())
        }

        if (deptsRes && deptsRes.success) {
          this.deptTree = deptsRes.result || []
        }
      } catch (error) {
        console.error('加载配置数据失败:', error)
        // 即使失败也不影响使用，角色信息可以从用户列表中获取
      }
    },

    // 初始化流程图
    initGraph() {
      const container = document.getElementById('flow-container')
      if (!container) {
        console.error('画布容器不存在')
        return
      }

      // 如果已经初始化，先销毁
      if (this.graph) {
        this.graph.dispose()
      }

      // 确保容器有尺寸
      const width = container.offsetWidth || 800
      const height = container.offsetHeight || 600

      this.graph = new Graph({
        container: container,
        width: width,
        height: height,
        grid: {
          visible: true,
          type: 'dot',
          args: {
            color: '#e0e0e0',
            thickness: 1
          }
        },
        panning: {
          enabled: true,
          eventTypes: ['leftMouseDown']
        },
        mousewheel: {
          enabled: true,
          zoomAtMousePosition: true,
          modifiers: ['ctrl'],
          minScale: 0.5,
          maxScale: 1
        },
        connecting: {
          router: {
            name: 'manhattan',
            args: {
              padding: 1
            }
          },
          connector: {
            name: 'rounded',
            args: {
              radius: 8
            }
          },
          anchor: 'center',
          connectionPoint: 'anchor',
          allowBlank: false,
          allowLoop: false,
          allowNode: false,
          allowEdge: false,
          snap: {
            radius: 20
          },
          validateConnection: ({ sourceView, targetView, sourceMagnet, targetMagnet }) => {
            console.log('=== validateConnection 被调用 ===')
            console.log('sourceView:', sourceView)
            console.log('targetView:', targetView)

            // 不允许节点自己连接自己
            if (sourceView === targetView) {
              console.log('自己连接自己，返回 false')
              return false
            }

            // 检查源节点和目标节点，只要有一个是条件节点就验证
            let sourceData = null
            let targetData = null

            if (sourceView && sourceView.cell) {
              sourceData = sourceView.cell.getData()
              console.log('源节点数据:', sourceData)
              console.log('源节点类型:', sourceData ? sourceData.type : '无')
            }

            if (targetView && targetView.cell) {
              targetData = targetView.cell.getData()
              console.log('目标节点数据:', targetData)
              console.log('目标节点类型:', targetData ? targetData.type : '无')
            }

            // 使用箭头函数外的 this
            const self = this

            // 如果源节点是条件节点，验证配置
            if (sourceData && sourceData.type === 'condition') {
              console.log('源节点是条件节点，开始验证配置')
              const validationResult = self.validateConditionNode(sourceData)
              console.log('源节点验证结果:', validationResult)

              if (!validationResult.valid) {
                console.log('❌ 源节点验证失败，阻止连线创建')
                self.$message.error(validationResult.message)
                return false // 阻止连线创建
              }
              console.log('✅ 源节点验证通过')
            }

            // 如果目标节点是条件节点，验证配置
            if (targetData && targetData.type === 'condition') {
              console.log('目标节点是条件节点，开始验证配置')
              const validationResult = self.validateConditionNode(targetData)
              console.log('目标节点验证结果:', validationResult)

              if (!validationResult.valid) {
                console.log('❌ 目标节点验证失败，阻止连线创建')
                self.$message.error(validationResult.message)
                return false // 阻止连线创建
              }
              console.log('✅ 目标节点验证通过')
            }

            console.log('验证通过，返回 true')
            return true
          },
          createEdge() {
            return new Shape.Edge({
              attrs: {
                line: {
                  stroke: '#A2B1C3',
                  strokeWidth: 2,
                  targetMarker: {
                    name: 'classic',
                    size: 8
                  }
                }
              },
              zIndex: 0
            })
          },
          validateConnection({ sourceMagnet, targetMagnet }) {
            // 必须从连接点开始，连接到连接点
            return !!sourceMagnet && !!targetMagnet
          }
        },
        highlighting: {
          magnetAdsorbed: {
            name: 'stroke',
            args: {
              attrs: {
                fill: '#fff',
                stroke: '#31d0c6',
                strokeWidth: 4
              }
            }
          }
        },
        resizing: false,
        rotating: false,
        selecting: {
          enabled: true,
          rubberband: true,
          showNodeSelectionBox: true
        },
        background: {
          color: '#fafafa'
        },
        // 启用节点拖拽
        translating: {
          restrict: false
        }
      })

      // 注意：缩放操作需要在节点渲染完成后执行
      // 这里先不设置，等节点加载完成后再统一调用 zoomToFit

      // 监听连线创建
      this.graph.on('edge:connected', ({ edge, isNew }) => {
        console.log('=== edge:connected 事件触发 ===')
        console.log('isNew:', isNew)

        const source = edge.getSourceCell()
        const target = edge.getTargetCell()
        console.log('source:', source)
        console.log('target:', target)

        if (source && target) {
          const sourceData = source.getData()
          const targetData = target.getData()
          console.log('sourceData:', sourceData)
          console.log('sourceData.type:', sourceData ? sourceData.type : '无')
          console.log('targetData:', targetData)
          console.log('targetData.type:', targetData ? targetData.type : '无')

          // 如果源节点是条件节点，需要验证配置并选择分支名称
          if (sourceData && sourceData.type === 'condition' && isNew) {
            console.log('✅ 源节点是条件节点，开始验证')
            // 验证条件节点是否配置完整
            const validationResult = this.validateConditionNode(sourceData)
            console.log('edge:connected 源节点验证结果:', validationResult)

            if (!validationResult.valid) {
              console.log('❌ edge:connected 源节点验证失败，删除连线')
              this.$message.error(validationResult.message)
              // 删除这条连线
              setTimeout(() => {
                this.graph.removeEdge(edge)
              }, 100)
              return
            }

            console.log('✅ edge:connected 源节点验证通过，选择分支')
            this.selectBranchForEdge(edge, sourceData)
            return // 等待用户选择分支后再继续
          }

          // 如果目标节点是条件节点，也需要验证配置（但不需要选择分支）
          if (targetData && targetData.type === 'condition' && isNew) {
            console.log('✅ 目标节点是条件节点，开始验证')
            const validationResult = this.validateConditionNode(targetData)
            console.log('edge:connected 目标节点验证结果:', validationResult)

            if (!validationResult.valid) {
              console.log('❌ edge:connected 目标节点验证失败，删除连线')
              this.$message.error(validationResult.message)
              // 删除这条连线
              setTimeout(() => {
                this.graph.removeEdge(edge)
              }, 100)
              return
            }

            console.log('✅ edge:connected 目标节点验证通过')
          }

          // 更新源节点的 nextNodes
          if (sourceData && targetData) {
            if (!sourceData.nextNodes) {
              sourceData.nextNodes = []
            }
            if (!sourceData.nextNodes.includes(targetData.id)) {
              sourceData.nextNodes.push(targetData.id)
              source.setData(sourceData)
            }
          }

          // 更新目标节点的 prevNodes
          if (targetData && sourceData) {
            if (!targetData.prevNodes) {
              targetData.prevNodes = []
            }
            if (!targetData.prevNodes.includes(sourceData.id)) {
              targetData.prevNodes.push(sourceData.id)
              target.setData(targetData)
            }
          }

          // 保存连线数据到 edge
          const edgeData = edge.getData() || {}
          edge.setData({
            sourceId: sourceData.id,
            targetId: targetData.id,
            branchName: edgeData.branchName || null
          })
        }
      })

      // 监听连线删除
      this.graph.on('edge:removed', ({ edge }) => {
        const edgeData = edge.getData()
        if (edgeData) {
          const sourceNode = this.graph.getCellById(edgeData.sourceId)
          const targetNode = this.graph.getCellById(edgeData.targetId)

          if (sourceNode) {
            const sourceData = sourceNode.getData()
            if (sourceData) {
              sourceData.nextNodes = sourceData.nextNodes.filter(id => id !== edgeData.targetId)
              sourceNode.setData(sourceData)
            }
          }

          if (targetNode) {
            const targetData = targetNode.getData()
            if (targetData) {
              targetData.prevNodes = targetData.prevNodes.filter(id => id !== edgeData.sourceId)
              targetNode.setData(targetData)
            }
          }
        }
      })

      // 监听节点选择（点击节点编辑）
      this.graph.on('node:click', ({ node, e }) => {
        e.stopPropagation()
        // 获取最新的节点数据
        const nodeData = { ...node.getData() }
        // 更新位置信息
        const position = node.position()
        nodeData.position = { x: position.x, y: position.y }
        this.selectedNode = nodeData
        this.drawerVisible = true // 打开抽屉

        // 更新 allNodes 引用
        const index = this.allNodes.findIndex(n => {
          const data = n.getData ? n.getData() : n
          return data.id === nodeData.id
        })
        if (index === -1) {
          this.allNodes.push(node)
        } else {
          this.allNodes[index] = node
        }
      })

      // 监听连线点击（编辑连线的分支名称）
      this.graph.on('edge:click', ({ edge, e }) => {
        e.stopPropagation()
        const source = edge.getSourceCell()
        if (source) {
          const sourceData = source.getData()
          // 如果源节点是条件节点，可以编辑分支名称
          if (sourceData.type === 'condition') {
            this.selectBranchForEdge(edge, sourceData)
          }
        }
      })

      // 点击画布空白处取消选择
      this.graph.on('blank:click', () => {
        this.selectedNode = null
      })

      // 监听节点变化
      this.graph.on('node:change:data', ({ node }) => {
        const nodeData = node.getData()
        if (this.selectedNode && this.selectedNode.id === node.id) {
          this.selectedNode = nodeData
        }
        // 更新节点显示文本
        this.updateNodeLabel(node, nodeData)
      })

      // 监听节点位置变化（拖拽后更新位置）
      this.graph.on('node:change:position', ({ node }) => {
        const nodeData = node.getData()
        if (nodeData) {
          const position = node.position()
          nodeData.position = { x: position.x, y: position.y }
          node.setData(nodeData)

          // 同步到 selectedNode
          if (this.selectedNode && this.selectedNode.id === nodeData.id) {
            this.selectedNode.position = nodeData.position
          }
        }
      })

      // 鼠标悬停时显示连接点
      this.graph.on('node:mouseenter', ({ node }) => {
        const ports = node.getPorts()
        if (ports && ports.length > 0) {
          ports.forEach(port => {
            node.portProp(port.id, 'attrs/circle/visibility', 'visible')
          })
        }
      })

      // 鼠标离开时隐藏连接点
      this.graph.on('node:mouseleave', ({ node }) => {
        const ports = node.getPorts()
        if (ports && ports.length > 0) {
          ports.forEach(port => {
            node.portProp(port.id, 'attrs/circle/visibility', 'hidden')
          })
        }
      })

      // 连接点鼠标悬停时高亮
      this.graph.on('node:port:mouseenter', ({ node, port }) => {
        if (port && port.id) {
          node.portProp(port.id, 'attrs/circle/fill', '#5F95FF')
        }
      })

      // 连接点鼠标离开时恢复
      this.graph.on('node:port:mouseleave', ({ node, port }) => {
        if (port && port.id) {
          node.portProp(port.id, 'attrs/circle/fill', '#fff')
        }
      })

      // 监听连线点击（用于选中和编辑）
      this.graph.on('edge:click', ({ edge, e }) => {
        e.stopPropagation()
        // 选中连线
        this.graph.select(edge)

        // 如果源节点是条件节点，可以编辑分支名称
        const source = edge.getSourceCell()
        if (source) {
          const sourceData = source.getData()
          if (sourceData.type === 'condition') {
            this.selectBranchForEdge(edge, sourceData)
          }
        }
      })

      // 监听连线右键菜单
      this.graph.on('edge:contextmenu', ({ edge, e }) => {
        e.preventDefault()
        e.stopPropagation()

        // 选中连线
        this.graph.select(edge)

        // 显示右键菜单
        this.showContextMenu(e, edge)
      })

      // 监听节点右键菜单
      this.graph.on('node:contextmenu', ({ node, e }) => {
        e.preventDefault()
        e.stopPropagation()

        const nodeData = node.getData()
        // 不允许删除开始和结束节点
        if (nodeData && (nodeData.type === 'start' || nodeData.type === 'end')) {
          return
        }

        // 选中节点
        this.graph.select(node)

        // 显示右键菜单
        this.showContextMenu(e, node)
      })

      // 监听画布空白处右键，隐藏菜单
      this.graph.on('blank:contextmenu', ({ e }) => {
        e.preventDefault()
        this.hideContextMenu()
      })

      // 监听画布点击，隐藏菜单
      this.graph.on('blank:click', () => {
        this.hideContextMenu()
      })

      // 监听连线右键菜单
      this.graph.on('edge:contextmenu', ({ edge, e }) => {
        e.preventDefault()
        e.stopPropagation()

        // 选中连线
        this.graph.select(edge)

        // 显示右键菜单
        this.showContextMenu(e, edge)
      })

      // 监听节点右键菜单
      this.graph.on('node:contextmenu', ({ node, e }) => {
        e.preventDefault()
        e.stopPropagation()

        const nodeData = node.getData()
        // 不允许删除开始和结束节点
        if (nodeData && (nodeData.type === 'start' || nodeData.type === 'end')) {
          return
        }

        // 选中节点
        this.graph.select(node)

        // 显示右键菜单
        this.showContextMenu(e, node)
      })

      // 监听画布空白处右键，隐藏菜单
      this.graph.on('blank:contextmenu', ({ e }) => {
        e.preventDefault()
        this.hideContextMenu()
      })

      // 监听画布点击，隐藏菜单
      this.graph.on('blank:click', () => {
        this.hideContextMenu()
      })

      // 键盘删除事件
      this.graph.on('node:keydown', ({ e }) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault()
          const selectedCells = this.graph.getSelectedCells()
          if (selectedCells.length > 0) {
            this.handleDeleteSelectedCells(selectedCells)
          }
        }
      })

      // 全局键盘事件（用于删除选中的节点或连线）
      const handleKeyDown = (e) => {
        // 只在弹窗打开时生效
        if (!this.modalVisible) return

        // 如果焦点在输入框等表单元素上，不处理删除
        const target = e.target
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return
        }

        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault()
          const selectedCells = this.graph.getSelectedCells()
          if (selectedCells.length > 0) {
            this.handleDeleteSelectedCells(selectedCells)
          }
        }
      }

      // 绑定全局键盘事件
      document.addEventListener('keydown', handleKeyDown)

      // 保存事件处理器，用于清理
      this._keydownHandler = handleKeyDown
    },

    // 拖拽开始
    handleDragStart(event, nodeType) {
      this.draggingNodeType = nodeType
      event.dataTransfer.effectAllowed = 'copy'
      // 设置拖拽数据
      event.dataTransfer.setData('text/plain', nodeType.type)
    },

    // 拖拽结束
    handleDragEnd() {
      this.draggingNodeType = null
    },

    // 拖拽放置
    handleDrop(event) {
      event.preventDefault()
      event.stopPropagation()

      if (!this.graph) {
        this.initGraph()
      }

      const nodeType = this.draggingNodeType
      if (!nodeType) {
        // 尝试从 dataTransfer 获取
        const type = event.dataTransfer.getData('text/plain')
        if (type) {
          const found = this.nodeTypes.find(nt => nt.type === type)
          if (found) {
            this.draggingNodeType = found
          }
        }
      }

      if (!this.draggingNodeType) return

      // 获取画布容器
      const container = document.getElementById('flow-container')
      if (!container) return

      // 获取画布在页面中的位置
      const containerRect = container.getBoundingClientRect()

      // 获取画布的 SVG 元素
      const svgElement = container.querySelector('svg')
      if (!svgElement) return

      // 获取鼠标在容器中的相对位置
      const clientX = event.clientX
      const clientY = event.clientY

      // 转换为画布坐标（考虑画布的缩放和平移）
      const point = this.graph.clientToLocal(clientX, clientY)

      // 调整坐标，减去节点宽度和高度的一半，让节点中心在鼠标位置
      const nodeWidth = 120
      const nodeHeight = 50
      const adjustedX = point.x - nodeWidth / 2
      const adjustedY = point.y - nodeHeight / 2

      // 创建节点
      const nodeConfig = this.createNodeConfig(this.draggingNodeType.type, adjustedX, adjustedY)
      const node = this.graph.addNode(nodeConfig)
      this.allNodes.push(node)

      // 初始化节点标签
      this.updateNodeLabel(node, node.getData())

      // 监听节点数据变化
      node.on('change:data', ({ current }) => {
        if (this.selectedNode && this.selectedNode.id === current.id) {
          this.selectedNode = current
        }
        // 更新节点标签
        this.updateNodeLabel(node, current)
      })

      this.draggingNodeType = null
    },

    // 添加节点（保留此方法，用于其他场景）
    addNode(type, x, y) {
      if (!this.graph) {
        this.initGraph()
      }

      const position = x !== undefined && y !== undefined
        ? { x, y }
        : { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 }

      const nodeConfig = this.createNodeConfig(type, position.x, position.y)
      const node = this.graph.addNode(nodeConfig)
      this.allNodes.push(node)
      this.selectedNode = node.getData()

      // 初始化节点标签
      this.updateNodeLabel(node, node.getData())

      // 监听节点数据变化，同步到 selectedNode
      node.on('change:data', ({ current }) => {
        if (this.selectedNode && this.selectedNode.id === current.id) {
          this.selectedNode = current
        }
        // 更新节点标签
        this.updateNodeLabel(node, current)
      })
    },

    // 创建节点配置
    createNodeConfig(type, x, y) {
      const nodeId = `${type}_${Date.now()}`

      const typeConfigs = {
        start: {
          shape: 'rect',
          label: '开始',
          width: 90,
          height: 36,
          fill: '#52c41a',
          stroke: '#389e0d',
          textColor: '#fff'
        },
        approval: {
          shape: 'rect',
          label: '审批',
          width: 90,
          height: 36,
          fill: '#1890ff',
          stroke: '#096dd9',
          textColor: '#fff'
        },
        condition: {
          shape: 'rect',
          label: '条件',
          width: 90,
          height: 36,
          fill: '#faad14',
          stroke: '#d48806',
          textColor: '#fff'
        },
        copy: {
          shape: 'rect',
          label: '抄送',
          width: 90,
          height: 36,
          fill: '#722ed1',
          stroke: '#531dab',
          textColor: '#fff'
        },
        operation: {
          shape: 'rect',
          label: '操作节点',
          width: 90,
          height: 36,
          fill: '#13c2c2',
          stroke: '#08979c',
          textColor: '#fff'
        },
        end: {
          shape: 'rect',
          label: '结束',
          width: 90,
          height: 36,
          fill: '#ff4d4f',
          stroke: '#cf1322',
          textColor: '#fff'
        }
      }

      const config = typeConfigs[type] || typeConfigs.approval

      return {
        id: nodeId,
        shape: config.shape,
        x: x || (100 + Math.random() * 200),
        y: y || (100 + Math.random() * 200),
        width: config.width,
        height: config.height,
        label: config.label,
        attrs: {
          body: {
            stroke: config.stroke,
            strokeWidth: 2,
            fill: config.fill,
            rx: 6,
            ry: 6
          },
          text: {
            text: config.label,
            fontSize: 12,
            fill: config.textColor,
            fontWeight: 'bold'
          }
        },
        data: {
          id: nodeId,
          type: type,
          label: config.label,
          position: { x: x || (100 + Math.random() * 200), y: y || (100 + Math.random() * 200) },
          approvers: type === 'approval' ? {
            type: 'fixed_user',
            value: [],
            ruleType: 'all'
          } : null,
          copyUsers: type === 'copy' ? {
            type: 'fixed_user',
            value: []
          } : null,
          operation: type === 'operation' ? {
            operation_type: 'payment' // 默认设置为 payment（制单）
          } : null,
          condition: type === 'condition' ? {
            type: 'form_field',
            rules: [],
            logic: 'AND',
            branches: [
              { condition: true, nextNodeId: '', label: '满足条件' },
              { condition: false, nextNodeId: '', label: '不满足条件' }
            ]
          } : null,
          nextNodes: [],
          prevNodes: []
        },
        ports: {
          groups: {
            top: {
              position: 'top',
              attrs: {
                circle: {
                  r: 6,
                  magnet: true,
                  stroke: '#5F95FF',
                  strokeWidth: 2,
                  fill: '#fff',
                  cursor: 'pointer',
                  visibility: 'hidden'
                }
              }
            },
            right: {
              position: 'right',
              attrs: {
                circle: {
                  r: 6,
                  magnet: true,
                  stroke: '#5F95FF',
                  strokeWidth: 2,
                  fill: '#fff',
                  cursor: 'pointer',
                  visibility: 'hidden'
                }
              }
            },
            bottom: {
              position: 'bottom',
              attrs: {
                circle: {
                  r: 6,
                  magnet: true,
                  stroke: '#5F95FF',
                  strokeWidth: 2,
                  fill: '#fff',
                  cursor: 'pointer',
                  visibility: 'hidden'
                }
              }
            },
            left: {
              position: 'left',
              attrs: {
                circle: {
                  r: 6,
                  magnet: true,
                  stroke: '#5F95FF',
                  strokeWidth: 2,
                  fill: '#fff',
                  cursor: 'pointer',
                  visibility: 'hidden'
                }
              }
            }
          },
          items: [
            { group: 'top', id: 'port-top' },
            { group: 'right', id: 'port-right' },
            { group: 'bottom', id: 'port-bottom' },
            { group: 'left', id: 'port-left' }
          ]
        }
      }
    },

    // 新建流程
    handleAdd() {
      this.modalTitle = '新建流程配置'
      this.currentNodeId = null
      this.selectedNode = null
      this.allNodes = []
      this.form.resetFields()
      this.modalVisible = true
      this.$nextTick(() => {
        // 延迟一下确保 DOM 渲染完成
        setTimeout(() => {
          this.initGraph()
          // 默认创建开始和结束节点
          this.createDefaultNodes()
        }, 100)
      })
    },

    // 创建默认节点（开始和结束）
    createDefaultNodes() {
      if (!this.graph) return

      // 获取画布中心位置
      const container = document.getElementById('flow-container')
      if (!container) return

      const centerX = (container.offsetWidth || 800) / 2
      const startY = 100
      const endY = 500

      // 创建开始节点（居中上方）
      const startConfig = this.createNodeConfig('start', centerX - 45, startY)
      const startNode = this.graph.addNode(startConfig)
      this.allNodes.push(startNode)
      this.updateNodeLabel(startNode, startNode.getData())

      // 创建结束节点（居中下方）
      const endConfig = this.createNodeConfig('end', centerX - 45, endY)
      const endNode = this.graph.addNode(endConfig)
      this.allNodes.push(endNode)
      this.updateNodeLabel(endNode, endNode.getData())

      // 监听节点数据变化
      startNode.on('change:data', ({ current }) => {
        if (this.selectedNode && this.selectedNode.id === current.id) {
          this.selectedNode = current
        }
        this.updateNodeLabel(startNode, current)
      })

      endNode.on('change:data', ({ current }) => {
        if (this.selectedNode && this.selectedNode.id === current.id) {
          this.selectedNode = current
        }
      })

      // 节点渲染完成后，自动适配缩放
      this.$nextTick(() => {
        this.graph.zoomToFit({
          padding: 40,
          minScale: 0.5,
          maxScale: 0.85
        })
      })
    },

    // 编辑流程
    handleEdit(record) {
      // console.log('handleEdit 被调用，record:', record)
      this.modalTitle = '编辑流程配置'
      this.currentNodeId = record.id
      this.selectedNode = null
      this.allNodes = []
      this.drawerVisible = false

      // 保存编辑记录
      this.editRecord = record
      // console.log('editRecord 已设置:', this.editRecord)

      // 先打开弹窗
      this.modalVisible = true

      // 直接在这里处理，不依赖 after-visible-change 事件
      this.$nextTick(() => {
        // console.log('弹窗已打开，开始处理编辑流程')

        // 等待表单字段渲染完成后再设置值
        setTimeout(() => {
          // console.log('设置表单值')
          // 设置表单值
          this.form.setFieldsValue({
            processName: record.processName,
            businessType: record.businessType,
            isActive: record.isActive
          })

          // 延迟一下确保 DOM 渲染完成
          setTimeout(() => {
            // console.log('初始化画布')
            // 初始化画布（如果已存在则先销毁）
            if (this.graph) {
              this.graph.dispose()
              this.graph = null
            }
            this.initGraph()

            // 等待画布初始化完成后再加载节点
            setTimeout(() => {
              // console.log('开始加载节点，nodes:', record.nodes)
              // 加载并渲染已有节点
              if (record.nodes && record.nodes.trim()) {
                try {
                  const nodesConfig = JSON.parse(record.nodes)
                  // console.log('解析节点配置成功:', nodesConfig)
                  if (nodesConfig && Array.isArray(nodesConfig) && nodesConfig.length > 0) {
                    // console.log('调用 loadNodesFromConfig，节点数量:', nodesConfig.length)
                    this.loadNodesFromConfig(nodesConfig)
                  } else {
                    console.warn('节点配置为空，创建默认节点')
                    this.createDefaultNodes()
                  }
                } catch (e) {
                  console.error('解析节点配置失败:', e, record.nodes)
                  this.createDefaultNodes()
                }
              } else {
                console.warn('没有节点配置，创建默认节点')
                this.createDefaultNodes()
              }
            }, 200)
          }, 150)
        }, 100)
      })
    },

    // 弹窗显示状态变化（保留用于新建流程）
    handleModalVisibleChange(visible) {
      console.log('handleModalVisibleChange 被调用，visible:', visible)

      if (!visible) {
        // 弹窗关闭时清空编辑记录
        console.log('弹窗关闭，清空 editRecord')
        this.editRecord = null
      }
    },

    // 从配置加载节点
    loadNodesFromConfig(nodesConfig) {
      if (!nodesConfig || !Array.isArray(nodesConfig)) {
        console.warn('loadNodesFromConfig: 节点配置无效', nodesConfig)
        return
      }

      if (!this.graph) {
        console.error('loadNodesFromConfig: 画布未初始化')
        return
      }

      // console.log('开始加载节点配置，节点数量:', nodesConfig.length)

      // 清空现有节点
      this.graph.clearCells()
      this.allNodes = []

      // 创建节点映射
      const nodeMap = new Map()

      // 第一步：创建所有节点
      nodesConfig.forEach((nodeConfig, index) => {
        // 如果是操作节点，确保 operation_type 有值
        if (nodeConfig.type === 'operation' && nodeConfig.operation) {
          if (!nodeConfig.operation.operation_type || nodeConfig.operation.operation_type === '') {
            nodeConfig.operation.operation_type = 'payment'
          }
        }
        
        const nodeColor = this.getNodeColor(nodeConfig.type)
        const nodeX = (nodeConfig.position && nodeConfig.position.x) || 100
        const nodeY = (nodeConfig.position && nodeConfig.position.y) || 100

        // console.log(`创建节点 ${index + 1}/${nodesConfig.length}:`, {
        //   id: nodeConfig.id,
        //   type: nodeConfig.type,
        //   label: nodeConfig.label,
        //   position: { x: nodeX, y: nodeY }
        // })

        const node = this.graph.addNode({
          id: nodeConfig.id,
          shape: 'rect',
          x: nodeX,
          y: nodeY,
          width: 90,
          height: 36,
          label: nodeConfig.label || nodeConfig.type,
          attrs: {
            body: {
              stroke: nodeColor.stroke,
              fill: nodeColor.fill,
              rx: 4,
              ry: 4
            },
            text: {
              text: nodeConfig.label || nodeConfig.type,
              fontSize: 12,
              fill: '#fff',
              fontWeight: 'bold'
            }
          },
          data: nodeConfig,
          ports: {
            groups: {
              top: {
                position: 'top',
                attrs: {
                  circle: {
                    r: 6,
                    magnet: true,
                    stroke: '#5F95FF',
                    strokeWidth: 2,
                    fill: '#fff',
                    cursor: 'pointer',
                    visibility: 'hidden'
                  }
                }
              },
              right: {
                position: 'right',
                attrs: {
                  circle: {
                    r: 6,
                    magnet: true,
                    stroke: '#5F95FF',
                    strokeWidth: 2,
                    fill: '#fff',
                    cursor: 'pointer',
                    visibility: 'hidden'
                  }
                }
              },
              bottom: {
                position: 'bottom',
                attrs: {
                  circle: {
                    r: 6,
                    magnet: true,
                    stroke: '#5F95FF',
                    strokeWidth: 2,
                    fill: '#fff',
                    cursor: 'pointer',
                    visibility: 'hidden'
                  }
                }
              },
              left: {
                position: 'left',
                attrs: {
                  circle: {
                    r: 6,
                    magnet: true,
                    stroke: '#5F95FF',
                    strokeWidth: 2,
                    fill: '#fff',
                    cursor: 'pointer',
                    visibility: 'hidden'
                  }
                }
              }
            },
            items: [
              { group: 'top', id: 'port-top' },
              { group: 'right', id: 'port-right' },
              { group: 'bottom', id: 'port-bottom' },
              { group: 'left', id: 'port-left' }
            ]
          }
        })

        nodeMap.set(nodeConfig.id, node)
        this.allNodes.push(node)

        // 初始化节点标签
        this.updateNodeLabel(node, nodeConfig)

        // 监听节点数据变化
        node.on('change:data', ({ current }) => {
          if (this.selectedNode && this.selectedNode.id === current.id) {
            this.selectedNode = current
          }
          // 更新节点标签
          this.updateNodeLabel(node, current)
        })
      })

      // 第二步：创建连线
      nodesConfig.forEach(nodeConfig => {
        const sourceNode = nodeMap.get(nodeConfig.id)
        if (!sourceNode) return

        // 处理 nextNodes
        if (nodeConfig.nextNodes && Array.isArray(nodeConfig.nextNodes)) {
          nodeConfig.nextNodes.forEach(targetId => {
            const targetNode = nodeMap.get(targetId)
            if (targetNode) {
              console.log(`创建连线: ${nodeConfig.id} -> ${targetId}`)

              // 获取连线的分支名称（如果是条件节点的连线）
              const branchName = nodeConfig.edges && nodeConfig.edges[targetId]
                ? nodeConfig.edges[targetId].branchName
                : null

              const edge = this.graph.addEdge({
                source: { cell: sourceNode.id, port: 'port-bottom' },
                target: { cell: targetNode.id, port: 'port-top' },
                attrs: {
                  line: {
                    stroke: branchName ? '#1890ff' : '#A2B1C3',
                    strokeWidth: 2,
                    targetMarker: {
                      name: 'classic',
                      size: 8
                    }
                  }
                },
                zIndex: 0,
                data: {
                  sourceId: sourceNode.id,
                  targetId: targetNode.id,
                  branchName: branchName
                }
              })

              // 如果有分支名称，设置连线标签
              if (branchName) {
                edge.setLabels([{
                  position: 0.5,
                  attrs: {
                    text: {
                      text: branchName,
                      fill: '#1890ff',
                      fontSize: 12
                    }
                  }
                }])
              }
            } else {
              console.warn(`目标节点不存在: ${targetId}`)
            }
          })
        }

        // 条件节点的连线不再自动创建，由用户手动创建连线并选择分支名称
        // 旧数据格式的迁移已在 nextNodes 处理中完成
      })

      // 节点加载完成后，自动适配缩放
      this.$nextTick(() => {
        if (this.graph) {
          // console.log('节点加载完成，执行 zoomToFit，节点数量:', this.allNodes.length, '画布节点数:', this.graph.getNodes().length)
          this.graph.zoomToFit({
            padding: 40,
            minScale: 0.5,
            maxScale: 0.85
          })
        } else {
          console.error('zoomToFit: 画布未初始化')
        }
      })
    },

    // 获取节点颜色配置
    getNodeColor(type) {
      const colorMap = {
        start: { fill: '#52c41a', stroke: '#389e0d' },
        approval: { fill: '#1890ff', stroke: '#096dd9' },
        condition: { fill: '#faad14', stroke: '#d48806' },
        copy: { fill: '#722ed1', stroke: '#531dab' },
        operation: { fill: '#13c2c2', stroke: '#08979c' },
        end: { fill: '#ff4d4f', stroke: '#cf1322' }
      }
      return colorMap[type] || colorMap.approval
    },
    // 获取操作类型标签
    getOperationTypeLabel(operationType) {
      if (!operationType) return '-'
      const operationTypeMap = {
        'payment': '制单'
      }
      return operationTypeMap[operationType] || operationType
    },

    // 保存流程
    async handleSave() {
      try {
        await this.form.validateFields()

        // 获取所有节点和连线
        const nodes = this.graph.getNodes()
        const edges = this.graph.getEdges()

        if (nodes.length === 0) {
          this.$message.warning('请至少添加一个节点')
          return
        }

        // 转换为后端格式
        const nodesConfig = this.convertToBackendFormat(nodes, edges)

        // 验证配置
        const errors = this.validateProcessConfig(nodesConfig)
        if (errors.length > 0) {
          this.$message.error(errors[0])
          return
        }

        this.saving = true
        const formData = this.form.getFieldsValue()
        const submitData = {
          ...formData,
          nodes: JSON.stringify(nodesConfig)
        }

        if (this.currentNodeId) {
          submitData.id = this.currentNodeId
          await editApprovalProcessConfig(submitData)
        } else {
          await addApprovalProcessConfig(submitData)
        }

        this.$message.success('保存成功')
        this.handleCancel()
        this.loadData()
      } catch (error) {
        if (error.errorFields) {
          return
        }
        this.$message.error(error.message || '保存失败')
      } finally {
        this.saving = false
      }
    },

    // 转换为后端格式
    convertToBackendFormat(nodes, edges) {
      const nodesConfig = []
      const nodeMap = new Map()

      nodes.forEach(node => {
        const data = node.getData()
        const nodeConfig = {
          id: data.id,
          type: data.type,
          label: data.label,
          position: { x: node.position().x, y: node.position().y }
        }

        if (data.type === 'approval' && data.approvers) {
          nodeConfig.approvers = data.approvers
        }

        if (data.type === 'copy' && data.copyUsers) {
          nodeConfig.copyUsers = data.copyUsers
        }

        if (data.type === 'condition' && data.condition) {
          nodeConfig.condition = data.condition
        }

        if (data.type === 'operation' && data.operation) {
          nodeConfig.operation = data.operation
          // 确保 operation_type 有值，如果为空则设置为默认值 'payment'
          if (!nodeConfig.operation.operation_type || nodeConfig.operation.operation_type === '') {
            nodeConfig.operation.operation_type = 'payment'
          }
        }

        nodeMap.set(data.id, nodeConfig)
        nodesConfig.push(nodeConfig)
      })

      // 处理连线关系
      edges.forEach(edge => {
        const sourceId = edge.getSourceCellId()
        const targetId = edge.getTargetCellId()
        const sourceNode = nodeMap.get(sourceId)
        const targetNode = nodeMap.get(targetId)

        if (sourceNode && targetNode) {
          if (!sourceNode.nextNodes) sourceNode.nextNodes = []
          if (!targetNode.prevNodes) targetNode.prevNodes = []

          sourceNode.nextNodes.push(targetId)
          targetNode.prevNodes.push(sourceId)

          // 如果是条件节点的连线，保存分支名称到节点配置的 edges 映射中
          const edgeData = edge.getData()
          if (sourceNode.type === 'condition' && edgeData && edgeData.branchName) {
            // 在节点配置中添加 edges 映射，保存分支名称
            if (!sourceNode.edges) {
              sourceNode.edges = {}
            }
            sourceNode.edges[targetId] = {
              branchName: edgeData.branchName
            }
          }
        }
      })

      return nodesConfig
    },

    // 验证流程配置
    validateProcessConfig(nodesConfig) {
      const errors = []

      // 检查是否有开始和结束节点
      const hasStart = nodesConfig.some(n => n.type === 'start')
      const hasEnd = nodesConfig.some(n => n.type === 'end')

      if (!hasStart) errors.push('流程必须包含开始节点')
      if (!hasEnd) errors.push('流程必须包含结束节点')

      // 检查条件节点
      nodesConfig.forEach(node => {
        if (node.type === 'condition') {
          if (!node.condition || !node.condition.branches || node.condition.branches.length === 0) {
            errors.push(`节点"${node.label}"必须至少设置一个条件分支`)
          } else {
            // 检查分支名称是否为空
            const emptyBranches = node.condition.branches.filter(b => !b.name || !b.name.trim())
            if (emptyBranches.length > 0) {
              errors.push(`节点"${node.label}"的分支名称不能为空`)
            }
          }
        }
      })

      return errors
    },

    // 取消
    handleCancel() {
      this.modalVisible = false
      this.drawerVisible = false
      this.selectedNode = null
      this.editRecord = null
      if (this.graph) {
        this.graph.dispose()
        this.graph = null
      }
      this.allNodes = []
    },

    // 关闭抽屉
    handleDrawerClose() {
      this.drawerVisible = false
      this.selectedNode = null
    },

    // 验证条件节点配置是否完整
    validateConditionNode(nodeData) {
      console.log('=== validateConditionNode 开始验证 ===')
      // console.log('节点数据:', JSON.stringify(nodeData, null, 2))

      if (!nodeData.condition) {
        console.log('❌ 没有 condition 配置')
        return { valid: false, message: '条件节点未配置条件信息' }
      }

      if (!nodeData.condition.branches || nodeData.condition.branches.length === 0) {
        console.log('❌ 没有 branches 配置')
        return { valid: false, message: '条件节点还没有配置分支，请先配置分支' }
      }

      console.log('分支数量:', nodeData.condition.branches.length)

      // 检查每个分支是否配置完整
      for (let i = 0; i < nodeData.condition.branches.length; i++) {
        const branch = nodeData.condition.branches[i]
        // console.log(`检查分支 ${i + 1}:`, JSON.stringify(branch, null, 2))

        // 检查分支名称
        if (!branch.name || branch.name.trim() === '') {
          console.log(`❌ 分支 ${i + 1} 名称为空`)
          return { valid: false, message: `分支 ${i + 1} 的名称不能为空，请先配置分支名称` }
        }

        // 检查分支规则
        if (!branch.rules || branch.rules.length === 0) {
          console.log(`❌ 分支"${branch.name}"没有规则`)
          return { valid: false, message: `分支"${branch.name}"还没有配置条件规则，请先配置规则` }
        }

        // console.log(`分支"${branch.name}"规则数量:`, branch.rules.length)

        // 检查每个规则是否完整
        for (let j = 0; j < branch.rules.length; j++) {
          const rule = branch.rules[j]
          // console.log(`  规则 ${j + 1}:`, JSON.stringify(rule, null, 2))

          if (!rule.field || !rule.operator || rule.value === undefined || rule.value === null || rule.value === '') {
            console.log(`❌ 分支"${branch.name}"规则 ${j + 1} 不完整`)
            return { valid: false, message: `分支"${branch.name}"的第 ${j + 1} 条规则配置不完整，请填写字段、操作符和值` }
          }
        }
      }

      console.log('✅ 所有验证通过')
      return { valid: true }
    },

    // 更新节点显示标签
    updateNodeLabel(node, nodeData) {
      if (!node || !nodeData) return

      let displayText = ''

      // 根据节点类型生成显示文本
      if (nodeData.type === 'approval' && nodeData.approvers) {
        const approvers = nodeData.approvers
        if (approvers.type === 'fixed_user' && approvers.value && approvers.value.length > 0) {
          // 显示审批人姓名
          const userNames = approvers.value
            .map(userId => {
              const user = this.userList.find(u => u.id === userId)
              return user ? user.realname : userId
            })
            .filter(Boolean)
          if (userNames.length > 0) {
            displayText = userNames.length > 2
              ? `${userNames.slice(0, 2).join('、')}等${userNames.length}人`
              : userNames.join('、')
          } else {
            displayText = nodeData.label || '审批'
          }
        } else if (approvers.type === 'fixed_dept' && approvers.value && approvers.value.length > 0) {
          // 显示部门名称
          const deptNames = approvers.value
            .map(deptId => {
              const dept = this.findDeptById(this.deptTree, deptId)
              return dept ? dept.departName : deptId
            })
            .filter(Boolean)
          if (deptNames.length > 0) {
            displayText = deptNames.length > 2
              ? `${deptNames.slice(0, 2).join('、')}等${deptNames.length}个部门`
              : deptNames.join('、')
          } else {
            displayText = nodeData.label || '审批'
          }
        } else if (approvers.type === 'fixed_role' && approvers.value && approvers.value.length > 0) {
          // 显示角色名称
          const roleNames = approvers.value
            .map(roleId => {
              const role = this.roleList.find(r => r.id === roleId)
              return role ? role.roleName : roleId
            })
            .filter(Boolean)
          if (roleNames.length > 0) {
            displayText = roleNames.length > 2
              ? `${roleNames.slice(0, 2).join('、')}等${roleNames.length}个角色`
              : roleNames.join('、')
          } else {
            displayText = nodeData.label || '审批'
          }
        } else if (approvers.type === 'dynamic_leader' && approvers.level) {
          displayText = `上级${approvers.level}级`
        } else {
          // 如果没有配置审批人，显示节点名称或默认文本
          displayText = nodeData.label || '审批'
        }
      } else if (nodeData.type === 'condition') {
        // 条件节点显示"条件"，分支名称显示在连线上
        displayText = nodeData.label || '条件'
      } else if (nodeData.type === 'copy' && nodeData.copyUsers) {
        const copyUsers = nodeData.copyUsers
        if (copyUsers.type === 'fixed_user' && copyUsers.value && copyUsers.value.length > 0) {
          // 显示抄送人姓名
          const userNames = copyUsers.value
            .map(userId => {
              const user = this.userList.find(u => u.id === userId)
              return user ? user.realname : userId
            })
            .filter(Boolean)
          if (userNames.length > 0) {
            displayText = userNames.length > 2
              ? `${userNames.slice(0, 2).join('、')}等${userNames.length}人`
              : userNames.join('、')
          } else {
            displayText = nodeData.label || '抄送'
          }
        } else if (copyUsers.type === 'fixed_dept' && copyUsers.value && copyUsers.value.length > 0) {
          // 显示部门名称
          const deptNames = copyUsers.value
            .map(deptId => {
              const dept = this.findDeptById(this.deptTree, deptId)
              return dept ? dept.departName : deptId
            })
            .filter(Boolean)
          if (deptNames.length > 0) {
            displayText = deptNames.length > 2
              ? `${deptNames.slice(0, 2).join('、')}等${deptNames.length}个部门`
              : deptNames.join('、')
          } else {
            displayText = nodeData.label || '抄送'
          }
        } else if (copyUsers.type === 'fixed_role' && copyUsers.value && copyUsers.value.length > 0) {
          // 显示角色名称
          const roleNames = copyUsers.value
            .map(roleId => {
              const role = this.roleList.find(r => r.id === roleId)
              return role ? role.roleName : roleId
            })
            .filter(Boolean)
          if (roleNames.length > 0) {
            displayText = roleNames.length > 2
              ? `${roleNames.slice(0, 2).join('、')}等${roleNames.length}个角色`
              : roleNames.join('、')
          } else {
            displayText = nodeData.label || '抄送'
          }
        } else {
          displayText = nodeData.label || '抄送'
        }
      } else if (nodeData.type === 'operation' && nodeData.operation) {
        // 操作节点：显示操作类型标签
        const operationType = nodeData.operation.operation_type
        if (operationType) {
          const typeLabel = this.getOperationTypeLabel(operationType)
          displayText = typeLabel || nodeData.label || '操作节点'
        } else {
          displayText = nodeData.label || '操作节点'
        }
      } else if (nodeData.type === 'start') {
        displayText = '开始'
      } else if (nodeData.type === 'end') {
        displayText = '结束'
      } else {
        // 默认使用节点名称或类型
        displayText = nodeData.label || nodeData.type || ''
      }

      // 确保 displayText 不为空
      if (!displayText || displayText.trim() === '') {
        displayText = nodeData.type || '节点'
      }

      // 根据文本长度动态调整节点宽度
      const textLength = displayText.length
      let nodeWidth = 90 // 默认宽度
      let fontSize = 12 // 默认字体大小

      // 根据文本长度调整宽度（中文字符按2个字符宽度计算）
      if (textLength > 6) {
        // 估算文本宽度：中文字符约12px，英文字符约6px，加上边距
        const estimatedWidth = textLength * 12 + 20
        nodeWidth = Math.max(90, Math.min(estimatedWidth, 250)) // 最小90，最大250
        fontSize = textLength > 20 ? 11 : 12 // 文本太长时稍微缩小字体
      }

      // 更新节点大小和标签
      node.resize(nodeWidth, 36)
      node.setAttrs({
        text: {
          text: displayText,
          fontSize: fontSize,
          textAnchor: 'middle', // 文本居中
          textVerticalAnchor: 'middle' // 垂直居中
        }
      })
      node.setLabel(displayText)

      // 强制刷新节点视图，确保标签立即显示
      if (node.view) {
        node.view.update()
      }
    },

    // 在部门树中查找指定ID的部门
    findDeptById(tree, id) {
      if (!tree || !Array.isArray(tree)) return null
      for (const node of tree) {
        if (node.id === id) {
          return node
        }
        if (node.children && node.children.length > 0) {
          const found = this.findDeptById(node.children, id)
          if (found) return found
        }
      }
      return null
    },

    // 为连线选择条件分支名称
    selectBranchForEdge(edge, sourceNodeData) {
      // 再次验证（双重保险）
      const validationResult = this.validateConditionNode(sourceNodeData)
      if (!validationResult.valid) {
        this.$message.error(validationResult.message)
        // 如果是在创建连线时，删除这条连线
        if (edge) {
          setTimeout(() => {
            this.graph.removeEdge(edge)
          }, 100)
        }
        return
      }
      if (!sourceNodeData.condition || !sourceNodeData.condition.branches || sourceNodeData.condition.branches.length === 0) {
        this.$message.warning('条件节点还没有配置分支，请先配置分支')
        // 如果是在创建连线时，删除这条连线
        if (edge) {
          this.graph.removeEdge(edge)
        }
        return
      }

      const branchNames = sourceNodeData.condition.branches.map(b => b.name).filter(Boolean)
      if (branchNames.length === 0) {
        this.$message.warning('条件节点的分支名称不能为空，请先配置分支名称')
        // 如果是在创建连线时，删除这条连线
        if (edge) {
          this.graph.removeEdge(edge)
        }
        return
      }

      // 获取当前连线的分支名称
      const edgeData = edge.getData() || {}
      const currentBranchName = edgeData.branchName || branchNames[0]

      // 使用对象来存储选中的分支，确保引用正确
      const selectedBranchRef = { value: currentBranchName }

      // 检查该分支是否已经有连线了
      const source = edge.getSourceCell()
      const existingEdges = this.graph.getEdges().filter(e => {
        const eSource = e.getSourceCell()
        return eSource && eSource.id === source.id && e.id !== edge.id
      })

      // 获取已有连线的分支名称（排除当前连线）
      const usedBranchNames = existingEdges
        .map(e => {
          const eData = e.getData() || {}
          return eData.branchName
        })
        .filter(Boolean)

      console.log('=== selectBranchForEdge 调试信息 ===')
      console.log('当前连线ID:', edge.id)
      console.log('源节点ID:', source.id)
      console.log('已有连线数量:', existingEdges.length)
      console.log('已有连线的分支名称:', usedBranchNames)
      console.log('所有分支名称:', branchNames)
      console.log('当前连线的分支名称:', currentBranchName)

      // 使用 Modal.confirm 选择分支名称
      const modal = this.$confirm({
        title: '选择条件分支',
        width: 600,
        content: h => {
          // 创建一个 Vue 组件来管理选择状态
          const selectComponent = {
            data() {
              return {
                selectedValue: currentBranchName
              }
            },
            render() {
              return h('div', [
                h('p', { style: 'margin-bottom: 12px; color: #666;' }, '请选择该连线对应的条件分支：'),
                h('a-select', {
                  props: {
                    value: this.selectedValue,
                    placeholder: '请选择分支名称',
                    style: 'width: 100%;'
                  },
                  on: {
                    change: (value) => {
                      this.selectedValue = value
                      selectedBranchRef.value = value
                      console.log('用户选择的分支:', value, 'selectedBranchRef.value:', selectedBranchRef.value)
                    }
                  }
                }, branchNames.map((name, index) => {
                  // 只有在该分支已经被其他连线使用，且不是当前连线的分支时，才禁用
                  const isUsed = usedBranchNames.includes(name) && name !== currentBranchName
                  console.log(`分支 "${name}" (索引 ${index}): isUsed=${isUsed}, usedBranchNames.includes=${usedBranchNames.includes(name)}, currentBranchName="${currentBranchName}"`)

                  // 确保 disabled 是布尔值
                  const disabled = !!isUsed

                  return h('a-select-option', {
                    props: {
                      value: name,
                      key: `branch-${index}-${name}`,
                      disabled: disabled
                    }
                  }, [
                    h('span', name),
                    disabled ? h('span', { style: 'color: #ff4d4f; margin-left: 8px;' }, '(已有连线)') : null
                  ])
                })),
                h('div', {
                  style: 'margin-top: 12px; padding: 8px; background: #fff7e6; border: 1px solid #ffd591; border-radius: 4px; color: #666; font-size: 12px;'
                }, '提示：每个条件分支只能连接一条线，已使用的分支会显示为禁用状态')
              ])
            }
          }

          return h(selectComponent)
        },
        onOk: () => {
          const branchName = selectedBranchRef.value || currentBranchName || branchNames[0]
          console.log('onOk 回调执行，selectedBranchRef.value:', selectedBranchRef.value, 'branchName:', branchName)

          const branch = sourceNodeData.condition.branches.find(b => b.name === branchName)

          if (!branch) {
            this.$message.error('选择的分支不存在')
            return Promise.reject()
          }

          // 检查该分支是否已经被其他连线使用（排除当前连线）
          if (usedBranchNames.includes(branchName) && branchName !== currentBranchName) {
            this.$message.error(`分支"${branchName}"已经被其他连线使用，每个分支只能连接一条线`)
            return Promise.reject()
          }

          // 更新连线数据
          const source = edge.getSourceCell()
          const target = edge.getTargetCell()
          if (!source || !target) {
            this.$message.error('连线数据异常')
            return Promise.reject()
          }

          const sourceData = source.getData()
          const targetData = target.getData()

          // 更新源节点的 nextNodes
          if (sourceData && targetData) {
            if (!sourceData.nextNodes) {
              sourceData.nextNodes = []
            }
            if (!sourceData.nextNodes.includes(targetData.id)) {
              sourceData.nextNodes.push(targetData.id)
              source.setData(sourceData)
            }
          }

          // 更新目标节点的 prevNodes
          if (targetData && sourceData) {
            if (!targetData.prevNodes) {
              targetData.prevNodes = []
            }
            if (!targetData.prevNodes.includes(sourceData.id)) {
              targetData.prevNodes.push(sourceData.id)
              target.setData(targetData)
            }
          }

          // 更新连线数据和样式
          edge.setData({
            sourceId: sourceData.id,
            targetId: targetData.id,
            branchName: branchName
          })

          // 更新连线标签和颜色
          edge.setLabels([{
            position: 0.5,
            attrs: {
              text: {
                text: branchName,
                fill: '#1890ff',
                fontSize: 12
              }
            }
          }])

          edge.setAttrs({
            line: {
              stroke: '#1890ff',
              strokeWidth: 2
            }
          })

          // 强制刷新连线视图，确保标签立即显示
          if (edge.view) {
            edge.view.update()
          }

          this.$message.success('分支名称已设置')
        },
        onCancel: () => {
          // 如果取消选择，删除连线（仅在新建连线时）
          if (edge) {
            const edgeData = edge.getData() || {}
            if (!edgeData.branchName) {
              this.graph.removeEdge(edge)
            }
          }
        }
      })
    },

    // 显示右键菜单
    showContextMenu(e, target) {
      this.contextMenuVisible = true
      this.contextMenuX = e.clientX
      this.contextMenuY = e.clientY
      this.contextMenuTarget = target
    },

    // 隐藏右键菜单
    hideContextMenu() {
      this.contextMenuVisible = false
      this.contextMenuTarget = null
    },

    // 处理右键菜单点击
    handleContextMenuClick({ key }) {
      if (!this.contextMenuTarget) return

      if (key === 'delete') {
        // 删除选中的元素
        const cells = [this.contextMenuTarget]
        this.handleDeleteSelectedCells(cells)
      }

      this.hideContextMenu()
    },

    // 删除选中的节点或连线
    handleDeleteSelectedCells(cells) {
      console.log('=== handleDeleteSelectedCells 被调用 ===')
      console.log('cells 数量:', cells.length)
      // console.log('选中的 cells:', cells)

      if (!cells || cells.length === 0) {
        // console.log('没有选中的 cells，返回')
        return
      }

      // 检查是否包含开始或结束节点
      const hasStartOrEnd = cells.some(cell => {
        if (!cell.isNode()) return false
        const data = cell.getData ? cell.getData() : {}
        return data.type === 'start' || data.type === 'end'
      })

      if (hasStartOrEnd) {
        // console.log('包含开始或结束节点，不允许删除')
        this.$message.warning('不能删除"开始"或"结束"节点')
        return
      }

      // 确认删除
      this.$confirm({
        title: '确认删除',
        content: `确定要删除选中的 ${cells.length} 个节点/连线吗？`,
        onOk: () => {
          console.log('确认删除，开始处理')
          cells.forEach(cell => {
            if (cell.isNode()) {
              // 删除节点
              const nodeData = cell.getData()
              if (nodeData) {
                // 从 allNodes 中移除
                const index = this.allNodes.findIndex(n => {
                  const data = n.getData ? n.getData() : n
                  return data.id === nodeData.id
                })
                if (index !== -1) {
                  this.allNodes.splice(index, 1)
                }

                // 删除节点相关的所有连线
                const edges = this.graph.getEdges()
                edges.forEach(edge => {
                  const source = edge.getSourceCell()
                  const target = edge.getTargetCell()
                  if ((source && source.id === cell.id) || (target && target.id === cell.id)) {
                    this.graph.removeEdge(edge)
                  }
                })
              }
            } else if (cell.isEdge()) {
              // 删除连线 - 只更新节点数据，不单独删除，统一在最后删除
              const edge = cell
              const source = edge.getSourceCell()
              const target = edge.getTargetCell()

              if (source) {
                const sourceData = source.getData()
                if (sourceData && sourceData.nextNodes) {
                  const targetId = target ? target.id : null
                  sourceData.nextNodes = sourceData.nextNodes.filter(id => id !== targetId)
                  source.setData(sourceData)
                }
              }

              if (target) {
                const targetData = target.getData()
                if (targetData && targetData.prevNodes) {
                  const sourceId = source ? source.id : null
                  targetData.prevNodes = targetData.prevNodes.filter(id => id !== sourceId)
                  target.setData(targetData)
                }
              }
            }
          })

          // 从画布中删除（统一删除节点和连线）
          // 使用 removeCells 统一删除，更可靠
          console.log('准备删除的连线数量:', cells.filter(c => c.isEdge()).length)
          console.log('准备删除的节点数量:', cells.filter(c => c.isNode()).length)

          try {
            // 直接使用 removeCells 删除所有选中的元素
            this.graph.removeCells(cells)
            console.log('✅ 删除成功')
          } catch (e) {
            console.error('❌ 删除失败:', e)
            // 如果 removeCells 失败，尝试逐个删除
            cells.forEach((cell, index) => {
              try {
                if (cell.isEdge()) {
                  this.graph.removeEdge(cell)
                  console.log(`✅ 连线 ${index + 1} 删除成功`)
                } else if (cell.isNode()) {
                  this.graph.removeNode(cell)
                  console.log(`✅ 节点 ${index + 1} 删除成功`)
                }
              } catch (err) {
                console.error(`❌ 删除失败 ${index + 1}:`, err)
              }
            })
          }

          // 在删除之前先获取节点ID（删除后无法再获取）
          const deletedNodeIds = cells.filter(c => c.isNode()).map(c => {
            try {
              const data = c.getData ? c.getData() : null
              return data && data.id ? data.id : null
            } catch (e) {
              console.warn('获取节点数据失败:', e)
              return null
            }
          }).filter(id => id !== null)

          // 清空选中状态
          this.graph.cleanSelection()
          console.log('删除操作完成')

          // 如果删除的是当前选中的节点，清空选中状态
          if (this.selectedNode && deletedNodeIds.includes(this.selectedNode.id)) {
            this.selectedNode = null
            this.drawerVisible = false
          }

          this.$message.success('删除成功')
        }
      })
    },

    // 删除
    async handleDelete(record) {
      this.$confirm({
        title: '确认删除',
        content: `确定要删除流程"${record.processName}"吗？`,
        onOk: async () => {
          try {
            await deleteApprovalProcessConfig({ id: record.id })
            this.$message.success('删除成功')
            this.loadData()
          } catch (error) {
            this.$message.error('删除失败')
          }
        }
      })
    },

    // 复制
    handleCopy(record) {
      try {
        // 复制流程基本信息
        const copiedRecord = {
          processName: record.processName ? `${record.processName}（副本）` : '流程配置（副本）',
          businessType: record.businessType || '',
          isActive: record.isActive || '0',
          nodes: ''
        }

        // 复制节点配置并重新生成节点ID
        if (record.nodes && record.nodes.trim()) {
          try {
            const originalNodes = JSON.parse(record.nodes)
            if (Array.isArray(originalNodes) && originalNodes.length > 0) {
              // 第一步：创建所有旧ID到新ID的映射（先遍历一遍，生成所有新ID）
              const idMap = new Map()
              let idCounter = 0
              originalNodes.forEach(node => {
                // 使用计数器确保ID唯一性
                const timestamp = Date.now()
                const randomStr = Math.random().toString(36).substr(2, 9)
                const newNodeId = `${node.type || 'node'}_${timestamp}_${idCounter}_${randomStr}`
                idMap.set(node.id, newNodeId)
                idCounter++
              })

              // 第二步：复制节点配置并更新所有引用
              const newNodes = originalNodes.map(node => {
                const newNodeId = idMap.get(node.id)

                // 深拷贝节点配置
                const newNode = JSON.parse(JSON.stringify(node))
                newNode.id = newNodeId

                // 更新 nextNodes 中的节点ID引用
                if (newNode.nextNodes && Array.isArray(newNode.nextNodes)) {
                  newNode.nextNodes = newNode.nextNodes.map(oldId => {
                    return idMap.get(oldId) || oldId
                  }).filter(newId => newId) // 过滤掉无效的ID
                }

                // 更新 edges 中的节点ID引用
                if (newNode.edges && typeof newNode.edges === 'object') {
                  const newEdges = {}
                  Object.keys(newNode.edges).forEach(oldTargetId => {
                    const newTargetId = idMap.get(oldTargetId)
                    if (newTargetId) {
                      newEdges[newTargetId] = newNode.edges[oldTargetId]
                    }
                  })
                  newNode.edges = newEdges
                }

                // 更新条件节点的分支中的 nextNodeId
                if (newNode.condition && newNode.condition.branches && Array.isArray(newNode.condition.branches)) {
                  newNode.condition.branches = newNode.condition.branches.map(branch => {
                    if (branch.nextNodeId) {
                      const newNextNodeId = idMap.get(branch.nextNodeId)
                      if (newNextNodeId) {
                        return {
                          ...branch,
                          nextNodeId: newNextNodeId
                        }
                      }
                    }
                    return branch
                  })
                }

                return newNode
              })

              // 将新节点配置转换为JSON字符串
              copiedRecord.nodes = JSON.stringify(newNodes)
            } else {
              // 如果节点配置为空，使用空字符串
              copiedRecord.nodes = ''
            }
          } catch (e) {
            console.error('解析节点配置失败:', e)
            this.$message.error('复制失败：节点配置解析错误')
            return
          }
        } else {
          copiedRecord.nodes = ''
        }

        // 打开编辑弹窗，使用复制的数据
        this.modalTitle = '复制流程配置'
        this.currentNodeId = null // 新建流程，没有ID
        this.selectedNode = null
        this.allNodes = []
        this.drawerVisible = false
        this.editRecord = null // 清空编辑记录，因为是新建

        // 先打开弹窗
        this.modalVisible = true

        // 等待弹窗打开后设置表单值和加载节点
        this.$nextTick(() => {
          setTimeout(() => {
            // 设置表单值
            this.form.setFieldsValue({
              processName: copiedRecord.processName,
              businessType: copiedRecord.businessType,
              isActive: copiedRecord.isActive
            })

            // 延迟一下确保 DOM 渲染完成
            setTimeout(() => {
              // 初始化画布（如果已存在则先销毁）
              if (this.graph) {
                this.graph.dispose()
                this.graph = null
              }
              this.initGraph()

              // 等待画布初始化完成后再加载节点
              setTimeout(() => {
                // 加载复制的节点配置
                if (copiedRecord.nodes && copiedRecord.nodes.trim()) {
                  try {
                    const nodesConfig = JSON.parse(copiedRecord.nodes)
                    if (nodesConfig && Array.isArray(nodesConfig) && nodesConfig.length > 0) {
                      this.loadNodesFromConfig(nodesConfig)
                    } else {
                      this.createDefaultNodes()
                    }
                  } catch (e) {
                    console.error('加载复制的节点配置失败:', e)
                    this.createDefaultNodes()
                  }
                } else {
                  this.createDefaultNodes()
                }
              }, 200)
            }, 150)
          }, 100)
        })

        this.$message.success('流程配置已复制，请检查并保存')
      } catch (error) {
        console.error('复制流程配置失败:', error)
        this.$message.error('复制失败：' + (error.message || '未知错误'))
      }
    },

    // 搜索
    handleSearch() {
      this.pagination.current = 1
      this.loadData()
    },

    // 刷新
    handleRefresh() {
      this.loadData()
    },

    // 表格变化
    handleTableChange(pagination) {
      this.pagination.current = pagination.current
      this.loadData()
    },

    // 节点更新
    handleNodeUpdate() {
      if (this.selectedNode) {
        // 找到对应的节点并更新数据
        const node = this.graph.getCellById(this.selectedNode.id)
        if (node) {
          node.setData(this.selectedNode)
          // 更新节点标签显示
          this.updateNodeLabel(node, this.selectedNode)
        }
      }
    }
  }
}
</script>

<style scoped lang="less">
.approval-process-config {
  .context-menu {
    position: fixed;
    z-index: 9999;
    background: #fff;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    min-width: 120px;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  // 弹窗顶部表单
  .modal-form-header {
    padding: 16px 20px;
    border-bottom: 1px solid #e8e8e8;
    background: #fff;

    .header-form {
      margin: 0;

      .ant-form-item {
        margin-bottom: 0;
        margin-right: 24px;
      }
    }
  }

  // 主体内容区域
  .process-config-body {
    display: flex;
    height: 800px;
    background: #f5f5f5;
    overflow: hidden;
  }

  // 左侧节点类型列表
  .config-left-panel {
    width: 200px;
    border-right: 1px solid #d9d9d9;
    background: #f5f5f5;
    padding: 8px;
    overflow-y: auto;
    overflow-x: hidden;
    flex-shrink: 0;

    .node-type-list {
      .node-type-item {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10px 8px;
        border: 1px solid transparent;
        border-left: 3px solid;
        border-radius: 0;
        cursor: move;
        transition: all 0.15s;
        background: transparent;
        width: 100%;
        box-sizing: border-box;
        margin-bottom: 2px;
        font-size: 13px;
        color: #262626;
        text-align: center;
        min-height: 36px;
        user-select: none;

        &:last-child {
          margin-bottom: 0;
        }

        &:hover {
          background: #e6f7ff;
          border-color: #91d5ff;
        }

        &:active {
          cursor: grabbing;
          background: #bae7ff;
        }
      }
    }
  }

  // 中间画布区域
  .config-center-panel {
    flex: 1;
    border: none;
    overflow: hidden;
    position: relative;
    background: #fafafa;

    .flow-container {
      width: 100%;
      height: 100%;
      background: #fafafa;
      position: relative;
    }
  }

  // 抽屉样式
  :deep(.node-config-drawer) {
    .ant-drawer-body {
      padding: 16px;
    }

    .node-config-content {
      .drawer-header {
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid #e8e8e8;

        .drawer-title {
          font-size: 16px;
          font-weight: 500;
          color: #262626;
        }
      }
    }

    .node-config-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 300px;
    }
  }
}
</style>

<style lang="less">
// 弹窗全局样式（因为 Modal 内容渲染到 body 下）
.process-config-modal {
  .ant-modal-body {
    padding: 0 !important;
  }

  .ant-modal {
    top: 50px !important;
  }

  .modal-form-header {
    padding: 16px 20px;
    border-bottom: 1px solid #e8e8e8;
    background: #fff;

    .header-form {
      margin: 0;

      .ant-form-item {
        margin-bottom: 0;
        margin-right: 24px;
      }
    }
  }

  .process-config-body {
    display: flex;
    height: 700px;
    background: #f5f5f5;
    overflow: hidden;
  }

  .config-left-panel {
    width: 200px;
    border-right: 1px solid #d9d9d9;
    background: #f5f5f5;
    padding: 8px;
    overflow-y: auto;
    overflow-x: hidden;
    flex-shrink: 0;

    .node-type-list {
      .node-type-item {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10px 8px;
        border: 1px solid transparent;
        border-left: 3px solid;
        border-radius: 2px;
        cursor: move;
        transition: all 0.15s;
        width: 100%;
        box-sizing: border-box;
        margin-bottom: 4px;
        font-size: 13px;
        color: #262626;
        text-align: center;
        min-height: 36px;
        user-select: none;
        font-weight: 500;

        &:last-child {
          margin-bottom: 0;
        }

        &:hover {
          opacity: 0.9;
          transform: translateX(2px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        &:active {
          cursor: grabbing;
          transform: translateX(1px);
        }
      }
    }
  }

  .config-center-panel {
    flex: 1;
    border: none;
    overflow: hidden;
    position: relative;
    background: #fafafa;

    .flow-container {
      width: 100%;
      height: 100%;
      background: #fafafa;
      position: relative;
    }
  }

  .config-right-panel {
    width: 450px;
    border-left: 1px solid #d9d9d9;
    background: #fff;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;

    .node-config-panel {
      background: #fff;
      height: 100%;
      display: flex;
      flex-direction: column;

      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 12px;
        border-bottom: 1px solid #d9d9d9;
        background: #fafafa;
        flex-shrink: 0;

        .panel-title {
          font-weight: 500;
          font-size: 13px;
          color: #262626;
        }

        .close-icon {
          color: #8c8c8c;
          font-size: 12px;
          cursor: pointer;

          &:hover {
            color: #262626;
          }
        }
      }

      .panel-content {
        padding: 12px;
        flex: 1;
        overflow-y: auto;
      }
    }

    .node-config-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      background: #fafafa;
      color: #8c8c8c;
      font-size: 12px;
    }
  }
}
</style>
