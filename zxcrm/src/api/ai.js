import { httpAction, getAction, postAction } from '@/api/manage'

const aiApi = {
    // 图生图生成
    generateImage: (params) => httpAction('/ai/image-to-image', params, 'post'),

    // 获取生成历史
    getHistory: (params) => getAction('/ai/history', params),

    // 删除历史记录
    deleteHistory: (id) => httpAction(`/ai/history/${id}`, {}, 'delete'),

    // 获取模型列表
    getModels: () => getAction('/ai/models'),

    // 获取生成状态
    getGenerationStatus: (taskId) => getAction(`/ai/status/${taskId}`),

    // 取消生成任务
    cancelGeneration: (taskId) => httpAction(`/ai/cancel/${taskId}`, {}, 'post'),

    // 下载生成的图片
    downloadImage: (imageId) => getAction(`/ai/download/${imageId}`),

    // 获取用户配额信息
    getQuota: () => getAction('/ai/quota'),

    // 获取预设参数模板
    getPresets: () => getAction('/ai/presets'),

    // 保存预设参数
    savePreset: (params) => httpAction('/ai/presets', params, 'post'),

    // 删除预设参数
    deletePreset: (presetId) => httpAction(`/ai/presets/${presetId}`, {}, 'delete')
}

export default aiApi 