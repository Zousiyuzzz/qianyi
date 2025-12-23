import { getDictLabel, getDictLabelSync, getDictLabels, getDictLabelsSync } from './dictUtils'

/**
 * 字典工具函数使用示例
 */

// 示例1: 异步获取单个字典标签
async function example1() {
    // 获取性别字典的标签
    const genderLabel = await getDictLabel('sex', '1', '未知')
    // // console.log('性别标签:', genderLabel) // 输出: 性别标签: 男

    // 获取状态字典的标签
    const statusLabel = await getDictLabel('status', '0', '未知状态')
    // // console.log('状态标签:', statusLabel) // 输出: 状态标签: 禁用
}

// 示例2: 同步获取单个字典标签（仅从缓存获取）
function example2() {
    // 从缓存中获取性别字典的标签
    const genderLabel = getDictLabelSync('sex', '2', '未知')
    // // console.log('性别标签:', genderLabel) // 输出: 性别标签: 女

    // 从缓存中获取状态字典的标签
    const statusLabel = getDictLabelSync('status', '1', '未知状态')
    // // console.log('状态标签:', statusLabel) // 输出: 状态标签: 启用
}

// 示例3: 异步批量获取字典标签
async function example3() {
    const values = ['1', '2', '0']
    const labels = await getDictLabels('sex', values, '未知')
    // // console.log('性别标签数组:', labels) // 输出: 性别标签数组: ['男', '女', '未知']
}

// 示例4: 同步批量获取字典标签
function example4() {
    const values = ['0', '1', '2']
    const labels = getDictLabelsSync('status', values, '未知状态')
    // // console.log('状态标签数组:', labels) // 输出: 状态标签数组: ['禁用', '启用', '未知状态']
}

// 示例5: 在Vue组件中使用
export default {
    data() {
        return {
            userStatus: '1',
            userGender: '2'
        }
    },
    async mounted() {
        // 异步获取字典标签
        this.statusLabel = await getDictLabel('status', this.userStatus, '未知状态')
        this.genderLabel = await getDictLabel('sex', this.userGender, '未知')
    },
    computed: {
        // 同步获取字典标签（适用于已缓存的字典）
        statusText() {
            return getDictLabelSync('status', this.userStatus, '未知状态')
        },
        genderText() {
            return getDictLabelSync('sex', this.userGender, '未知')
        }
    }
}

// 示例6: 在表格列中使用
const tableColumns = [
    {
        title: '状态',
        dataIndex: 'status',
        customRender: (text) => {
            return getDictLabelSync('status', text, '未知状态')
        }
    },
    {
        title: '性别',
        dataIndex: 'gender',
        customRender: async (text) => {
            return await getDictLabel('sex', text, '未知')
        }
    }
]

// 示例7: 在过滤器中使用
export const dictFilter = {
    install(Vue) {
        Vue.filter('dict', (value, dictCode, placeholder = '') => {
            return getDictLabelSync(dictCode, value, placeholder)
        })
    }
}

// 在模板中使用过滤器
// <template>
//   <span>{{ userStatus | dict('status', '未知状态') }}</span>
//   <span>{{ userGender | dict('sex', '未知') }}</span>
// </template>

export {
    example1,
    example2,
    example3,
    example4,
    tableColumns,
    dictFilter
}
