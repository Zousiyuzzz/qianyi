<template>
  <crud-list-page :crud="crud" :form-component="GenericFormDrawer" />
</template>

<script>
import CrudListPage from '../../components/CrudListPage.vue'
import GenericFormDrawer from '../../components/GenericFormDrawer.vue'
import { addAccount, getAccountList, updateAccount } from '../../common/api/account'

const crud = {
  ui: {
    pageTitle: '账户列表',
    search: { placeholder: '搜索账户名称', icon: '🔎', clearIcon: '×' },
    filter: { toggleIcon: '⏷', allText: '全部', clearAllText: '清除', tagCloseIcon: '×', resetText: '重置', confirmText: '确定' },
    list: {
      titleFallback: '未知账户',
      loadingMoreText: '加载中...',
      noMoreText: '没有更多了',
      emptyTitle: '暂无数据',
      emptySubWhenFiltered: '试试清除筛选条件后再看看',
      clearFilterBtnText: '清除筛选'
    },
    fab: { icon: '＋' },
    actionSheet: {
      items: [
        { key: 'detail', label: '查看详情' },
        { key: 'edit', label: '修改账户' }
      ]
    }
  },
  api: { list: getAccountList },
  routes: { detail: '/pages/account/detail' },
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
      key: 'accountType',
      label: '账户类型',
      queryProp: 'accountType',
      options: [
        { value: '', text: '全部' },
        { value: '1', text: '对公' },
        { value: '2', text: '对私' }
      ]
    }
  ],
  card: {
    idProp: 'id',
    titleProp: 'accountName',
    subtitleParts: [
      { prop: 'subjectName', fallback: '-' },
      { prop: 'accountType' }
    ],
    line1: { icon: '👤', prop: 'ownerName' },
    line2: { icon: '💰', leftProp: 'balance', sep: '·', rightPrefix: '授信', rightProp: 'credit' }
  },
  form: {
    primaryKey: 'id',
    api: { create: addAccount, update: updateAccount },
    fields: [
      { prop: 'accountName', label: '账户名称', required: true, placeholder: '请输入账户名称' },
      { prop: 'subjectName', label: '主体', placeholder: '请输入主体名称' },
      { prop: 'accountType', label: '账户类型', type: 'select', required: true, options: [
        { value: '1', text: '对公' },
        { value: '2', text: '对私' }
      ] },
      { prop: 'balance', label: '余额', type: 'number', placeholder: '请输入余额' },
      { prop: 'credit', label: '授信', type: 'number', placeholder: '请输入授信额度' },
      { prop: 'ownerName', label: '负责人', placeholder: '请输入负责人' }
    ]
  },
  actions: {
    add(ctx) { ctx.openDrawer() },
    edit(ctx, item) { ctx.openDrawer(item) },
    detail(ctx, item) {
      if (!item) return
      uni.navigateTo({ url: `${ctx.crud.routes.detail}?id=${item.id}` })
    }
  }
}

export default {
  components: { CrudListPage, GenericFormDrawer },
  data() {
    return { crud }
  }
}
</script>
