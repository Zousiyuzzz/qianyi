// 操作类型配置
export const operationTypes = [
  {
    value: 'payment',
    label: '制单'
  }
  // 可以在这里添加更多操作类型
  // {
  //   value: 'refund',
  //   label: '退款'
  // },
  // {
  //   value: 'approve',
  //   label: '审批'
  // }
]

// 操作类型映射表（用于显示）
export const operationTypeMap = {
  'payment': '制单'
  // 可以在这里添加更多映射
  // 'refund': '退款',
  // 'approve': '审批'
}

// 根据值获取标签
export function getOperationTypeLabel(value) {
  return operationTypeMap[value] || value || '-'
}

