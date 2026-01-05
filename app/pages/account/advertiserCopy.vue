<template>
  <crud-list-page :crud="crud" :form-component="GenericFormDrawer" />
</template>

<script>
import CrudListPage from '../../components/CrudListPage.vue'
import GenericFormDrawer from '../../components/GenericFormDrawer.vue'
import { addAdvertiserCopy, getAdvertiserCopyList, updateAdvertiserCopy } from '../../common/api/account'

const crud = {
  ui: {
    pageTitle: '广告主ID复制',
    search: { placeholder: '搜索广告主或ID', icon: '🔎', clearIcon: '×' },
    filter: { toggleIcon: '⏷', allText: '全部', clearAllText: '清除', tagCloseIcon: '×', resetText: '重置', confirmText: '确定' },
    list: {
      titleFallback: '未命名任务',
      loadingMoreText: '加载中...',
      noMoreText: '没有更多了',
      emptyTitle: '暂无数据',
      emptySubWhenFiltered: '试试清除筛选条件后再看看',
      clearFilterBtnText: '清除筛选'
    },
    fab: { icon: '＋' },
    actionSheet: { items: [{ key: 'edit', label: '编辑记录' }] }
  },
  api: { list: getAdvertiserCopyList },
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
    titleProp: 'advertiserName',
    subtitleParts: [
      { prop: 'advertiserId', fallback: '-' },
      { prop: 'status_dictText', fallback: '待处理' }
    ],
    line1: { icon: '🧾', prop: 'remark' },
    line2: { icon: '⏱️', leftProp: 'createTime', sep: '·', rightPrefix: '更新于', rightProp: 'updateTime', rightFormatter: 'relativeTime' }
  },
  form: {
    primaryKey: 'id',
    api: { create: addAdvertiserCopy, update: updateAdvertiserCopy },
    fields: [
      { prop: 'advertiserName', label: '广告主名称', required: true, placeholder: '请输入广告主名称' },
      { prop: 'advertiserId', label: '广告主ID', placeholder: '请输入广告主ID' },
      { prop: 'targetAccount', label: '目标账户', placeholder: '请输入目标账户' },
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
