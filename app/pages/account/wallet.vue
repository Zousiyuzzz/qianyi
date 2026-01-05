<template>
  <crud-list-page :crud="crud" :form-component="GenericFormDrawer" />
</template>

<script>
import CrudListPage from '../../components/CrudListPage.vue'
import GenericFormDrawer from '../../components/GenericFormDrawer.vue'
import { addSharedWallet, getSharedWalletList, updateSharedWallet } from '../../common/api/account'

const crud = {
  ui: {
    pageTitle: '共享钱包',
    search: { placeholder: '搜索钱包名称或ID', icon: '🔎', clearIcon: '×' },
    filter: { toggleIcon: '⏷', allText: '全部', clearAllText: '清除', tagCloseIcon: '×', resetText: '重置', confirmText: '确定' },
    list: {
      titleFallback: '未命名钱包',
      loadingMoreText: '加载中...',
      noMoreText: '没有更多了',
      emptyTitle: '暂无数据',
      emptySubWhenFiltered: '试试清除筛选条件后再看看',
      clearFilterBtnText: '清除筛选'
    },
    fab: { icon: '＋' },
    actionSheet: { items: [{ key: 'edit', label: '编辑钱包' }] }
  },
  api: { list: getSharedWalletList },
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
    titleProp: 'walletName',
    subtitleParts: [
      { prop: 'walletId', fallback: '-' },
      { prop: 'collaborationMode_dictText' }
    ],
    line1: { icon: '📁', prop: 'proName' },
    line2: { icon: '💳', leftProp: 'walletType', sep: '·', rightPrefix: '更新于', rightProp: 'updateTime', rightFormatter: 'relativeTime' }
  },
  form: {
    primaryKey: 'id',
    api: { create: addSharedWallet, update: updateSharedWallet },
    fields: [
      { prop: 'walletName', label: '钱包名称', required: true, placeholder: '请输入钱包名称' },
      { prop: 'walletId', label: '钱包ID', placeholder: '请输入钱包ID' },
      { prop: 'walletType', label: '钱包类型', placeholder: '请输入类型' },
      { prop: 'proName', label: '项目', placeholder: '请输入项目名称' },
      { prop: 'collaborationMode', label: '合作方式', type: 'select', options: [
        { value: '0', text: '预付' },
        { value: '1', text: '垫付' },
        { value: '2', text: '服务费' }
      ] },
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
