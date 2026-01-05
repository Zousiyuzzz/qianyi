<template>
  <crud-list-page :crud="crud" :form-component="GenericFormDrawer" />
</template>

<script>
import CrudListPage from '../../components/CrudListPage.vue'
import GenericFormDrawer from '../../components/GenericFormDrawer.vue'
import { addSecondaryAgent, getSecondaryAgentList, updateSecondaryAgent } from '../../common/api/account'

const crud = {
  ui: {
    pageTitle: '子端口',
    search: { placeholder: '搜索子端口名称', icon: '🔎', clearIcon: '×' },
    filter: { toggleIcon: '⏷', allText: '全部', clearAllText: '清除', tagCloseIcon: '×', resetText: '重置', confirmText: '确定' },
    list: {
      titleFallback: '未命名端口',
      loadingMoreText: '加载中...',
      noMoreText: '没有更多了',
      emptyTitle: '暂无数据',
      emptySubWhenFiltered: '试试清除筛选条件后再看看',
      clearFilterBtnText: '清除筛选'
    },
    fab: { icon: '＋' },
    actionSheet: { items: [{ key: 'edit', label: '编辑端口' }] }
  },
  api: { list: getSecondaryAgentList },
  search: { keywordProp: 'keyword' },
  sort: {
    defaultField: 'updateTime',
    defaultOrder: 'desc',
    paramColumn: 'column',
    paramOrder: 'order',
    items: [
      { field: 'updateTime', label: '更新时间' },
      { field: 'createTime', label: '创建时间' }
    ]
  },
  filters: [
    {
      key: 'status',
      label: '状态',
      queryProp: 'status',
      options: [
        { value: '', text: '全部' },
        { value: '1', text: '启用' },
        { value: '0', text: '停用' }
      ]
    }
  ],
  card: {
    idProp: 'id',
    titleProp: 'portName',
    subtitleParts: [
      { prop: 'status_dictText', fallback: '未配置' }
    ],
    line1: { icon: '🛰️', prop: 'portCode' },
    line2: { icon: '🧭', leftProp: 'businessName', sep: '·', rightPrefix: '更新于', rightProp: 'updateTime', rightFormatter: 'relativeTime' }
  },
  form: {
    primaryKey: 'id',
    api: { create: addSecondaryAgent, update: updateSecondaryAgent },
    fields: [
      { prop: 'portName', label: '端口名称', required: true, placeholder: '请输入端口名称' },
      { prop: 'portCode', label: '端口编码', placeholder: '请输入端口编码' },
      { prop: 'businessName', label: '渠道', placeholder: '请输入渠道' },
      { prop: 'status', label: '状态', type: 'select', options: [
        { value: '1', text: '启用' },
        { value: '0', text: '停用' }
      ] }
    ]
  },
  actions: {
    add(ctx) { ctx.openDrawer() },
    edit(ctx, item) { ctx.openDrawer(item) }
  }
}

export default {
  components: { CrudListPage, GenericFormDrawer },
  data() {
    return { crud }
  }
}
</script>
