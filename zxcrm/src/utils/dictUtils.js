import { ajaxGetDictItems, getDictItemsFromCache } from '@/api/api'

/**
 * 根据字典代码和值获取对应的标签文本
 * @param {string} dictCode - 字典代码
 * @param {string|number} value - 字典值
 * @param {string} placeholder - 当找不到对应值时的占位符，默认为空字符串
 * @returns {Promise<string>} 返回对应的标签文本
 */
export async function getDictLabel(dictCode, value, placeholder = '') {
    if (!dictCode) {
        console.warn('字典代码不能为空')
        return placeholder
    }

    if (value === null || value === undefined || value === '') {
        return placeholder
    }

    try {
        // 优先从缓存中读取字典配置
        let dictOptions = getDictItemsFromCache(dictCode)

        // 如果缓存中没有，则从服务器获取
        if (!dictOptions) {
            const res = await ajaxGetDictItems(dictCode, null)
            if (res.success) {
                dictOptions = res.result
            } else {
                console.warn(`获取字典数据失败: ${dictCode}`)
                return placeholder
            }
        }

        // 在字典选项中查找对应的文本
        const option = dictOptions.find(item =>
            item.value === value ||
            item.value === value.toString()
        )

        return option ? (option.text || option.label) : value
    } catch (error) {
        console.error('获取字典标签失败:', error)
        return placeholder
    }
}

/**
 * 根据字典代码和值获取对应的标签文本（同步版本，仅从缓存获取）
 * @param {string} dictCode - 字典代码
 * @param {string|number} value - 字典值
 * @param {string} placeholder - 当找不到对应值时的占位符，默认为空字符串
 * @returns {string} 返回对应的标签文本
 */
export function getDictLabelSync(dictCode, value, placeholder = '') {
    if (!dictCode) {
        console.warn('字典代码不能为空')
        return placeholder
    }

    if (value === null || value === undefined || value === '') {
        return placeholder
    }

    try {
        // 从缓存中读取字典配置
        const dictOptions = getDictItemsFromCache(dictCode)

        if (!dictOptions) {
            return placeholder
        }

        // 在字典选项中查找对应的文本
        const option = dictOptions.find(item =>
            item.value === value ||
            item.value === value.toString()
        )

        return option ? (option.text || option.label) : value
    } catch (error) {
        console.error('获取字典标签失败:', error)
        return placeholder
    }
}

/**
 * 批量获取字典标签
 * @param {string} dictCode - 字典代码
 * @param {Array} values - 字典值数组
 * @param {string} placeholder - 当找不到对应值时的占位符，默认为空字符串
 * @returns {Promise<Array>} 返回对应的标签文本数组
 */
export async function getDictLabels(dictCode, values, placeholder = '') {
    if (!Array.isArray(values)) {
        return []
    }

    const labels = []
    for (const value of values) {
        const label = await getDictLabel(dictCode, value, placeholder)
        labels.push(label)
    }

    return labels
}

/**
 * 批量获取字典标签（同步版本，仅从缓存获取）
 * @param {string} dictCode - 字典代码
 * @param {Array} values - 字典值数组
 * @param {string} placeholder - 当找不到对应值时的占位符，默认为空字符串
 * @returns {Array} 返回对应的标签文本数组
 */
export function getDictLabelsSync(dictCode, values, placeholder = '') {
    if (!Array.isArray(values)) {
        return []
    }

    return values.map(value => getDictLabelSync(dictCode, value, placeholder))
}
