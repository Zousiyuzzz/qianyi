<template>
  <crud-list-page :crud="crud" :form-component="GenericFormDrawer" />
</template>

<script>
import CrudListPage from '../../components/CrudListPage.vue'
import GenericFormDrawer from '../../components/GenericFormDrawer.vue'
import { addAgentConsume, getAgentConsumeList, updateAgentConsume } from '../../common/api/account'

const crud = {
  ui: {
    pageTitle: '账户消耗明细',
    search: { placeholder: '搜索账户或项目', icon: '🔎', clearIcon: '×' },
    filter: { toggleIcon: '⏷', allText: '全部', clearAllText: '清除', tagCloseIcon: '×', resetText: '重置', confirmText: '确定' },
    list: {
      titleFallback: '未命名记录',
      loadingMoreText: '加载中...',
      noMoreText: '没有更多了',
      emptyTitle: '暂无数据',
      emptySubWhenFiltered: '试试清除筛选条件后再看看',
      clearFilterBtnText: '清除筛选'
    },
    fab: { icon: '＋' },
    actionSheet: { items: [{ key: 'edit', label: '编辑记录' }] }
  },
  api: { list: getAgentConsumeList },
  search: { keywordProp: 'keyword' },
  sort: {
    defaultField: 'consumeTime',
    defaultOrder: 'desc',
    paramColumn: 'column',
    paramOrder: 'order',
    items: [
      { field: 'consumeTime', label: '消耗时间' },
      { field: 'updateTime', label: '更新时间' }
    ]
  },
  filters: [],
  card: {
    idProp: 'id',
    titleProp: 'accountName',
    subtitleParts: [
      { prop: 'proName', fallback: '-' }
    ],
    line1: { icon: '📉', prop: 'consumeAmount' },
    line2: { icon: '⏱️', leftProp: 'consumeTime', sep: '·', rightPrefix: '更新于', rightProp: 'updateTime', rightFormatter: 'relativeTime' }
  },
  form: {
    primaryKey: 'id',
    api: { create: addAgentConsume, update: updateAgentConsume },
    fields: [
      { prop: 'accountName', label: '账户名称', required: true, placeholder: '请输入账户名称' },
      { prop: 'proName', label: '项目名称', placeholder: '请输入项目名称' },
      { prop: 'consumeAmount', label: '消耗金额', type: 'number', required: true, placeholder: '请输入消耗金额' },
      { prop: 'consumeTime', label: '消耗时间', placeholder: '请输入消耗时间' },
      { prop: 'remark', label: '备注', type: 'textarea', placeholder: '请输入备注' }
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
