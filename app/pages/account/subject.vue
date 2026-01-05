<template>
  <crud-list-page :crud="crud" :form-component="GenericFormDrawer" />
</template>

<script>
import CrudListPage from '../../components/CrudListPage.vue'
import GenericFormDrawer from '../../components/GenericFormDrawer.vue'
import { addAccountSubject, getAccountSubjectList, updateAccountSubject } from '../../common/api/account'

const crud = {
  ui: {
    pageTitle: '账户主体',
    search: { placeholder: '搜索主体名称', icon: '🔎', clearIcon: '×' },
    filter: { toggleIcon: '⏷', allText: '全部', clearAllText: '清除', tagCloseIcon: '×', resetText: '重置', confirmText: '确定' },
    list: {
      titleFallback: '未命名主体',
      loadingMoreText: '加载中...',
      noMoreText: '没有更多了',
      emptyTitle: '暂无数据',
      emptySubWhenFiltered: '试试清除筛选条件后再看看',
      clearFilterBtnText: '清除筛选'
    },
    fab: { icon: '＋' },
    actionSheet: { items: [{ key: 'edit', label: '编辑主体' }] }
  },
  api: { list: getAccountSubjectList },
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
  filters: [
    {
      key: 'collaborationMode',
      label: '合作方式',
      queryProp: 'collaborationMode',
      options: [
        { value: '', text: '全部' },
        { value: '0', text: '预付' },
        { value: '1', text: '垫付' },
        { value: '2', text: '服务费' }
      ]
    }
  ],
  card: {
    idProp: 'id',
    titleProp: 'subjectName',
    subtitleParts: [
      { prop: 'channelName', fallback: '-' },
      { prop: 'collaborationMode_dictText' }
    ],
    line1: { icon: '📌', prop: 'proName' },
    line2: { icon: '📄', leftProp: 'rebateTeptName', sep: '·', rightPrefix: '更新于', rightProp: 'updateTime', rightFormatter: 'relativeTime' }
  },
  form: {
    primaryKey: 'id',
    api: { create: addAccountSubject, update: updateAccountSubject },
    fields: [
      { prop: 'subjectName', label: '主体名称', required: true, placeholder: '请输入主体名称' },
      { prop: 'channelName', label: '渠道', placeholder: '请输入渠道' },
      { prop: 'channelPlatform', label: '渠道平台', placeholder: '请输入渠道平台' },
      { prop: 'collaborationMode', label: '合作方式', type: 'select', options: [
        { value: '0', text: '预付' },
        { value: '1', text: '垫付' },
        { value: '2', text: '服务费' }
      ] },
      { prop: 'proName', label: '项目', placeholder: '请输入项目名称' },
      { prop: 'rebateTeptName', label: '返点模板', placeholder: '请输入返点模板' }
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
