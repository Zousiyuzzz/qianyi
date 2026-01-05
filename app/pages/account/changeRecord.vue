<template>
  <crud-list-page :crud="crud" :form-component="GenericFormDrawer" />
</template>

<script>
import CrudListPage from '../../components/CrudListPage.vue'
import GenericFormDrawer from '../../components/GenericFormDrawer.vue'
import { addAccountChangeRecord, getAccountChangeRecordList, updateAccountChangeRecord } from '../../common/api/account'

const crud = {
  ui: {
    pageTitle: '账户绑定变动记录',
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
  api: { list: getAccountChangeRecordList },
  search: { keywordProp: 'keyword' },
  sort: {
    defaultField: 'createTime',
    defaultOrder: 'desc',
    paramColumn: 'column',
    paramOrder: 'order',
    items: [
      { field: 'createTime', label: '创建时间' },
      { field: 'updateTime', label: '更新时间' }
    ]
  },
  filters: [],
  card: {
    idProp: 'id',
    titleProp: 'accountName',
    subtitleParts: [
      { prop: 'proName', fallback: '-' },
      { prop: 'changeType_dictText', fallback: '变更' }
    ],
    line1: { icon: '🔗', prop: 'remark' },
    line2: { icon: '⏱️', leftProp: 'createTime', sep: '·', rightPrefix: '更新于', rightProp: 'updateTime', rightFormatter: 'relativeTime' }
  },
  form: {
    primaryKey: 'id',
    api: { create: addAccountChangeRecord, update: updateAccountChangeRecord },
    fields: [
      { prop: 'accountName', label: '账户名称', required: true, placeholder: '请输入账户名称' },
      { prop: 'proName', label: '项目名称', placeholder: '请输入项目名称' },
      { prop: 'changeType', label: '变动类型', placeholder: '请输入变动类型' },
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
