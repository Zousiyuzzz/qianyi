import { getAction } from '@/api/manage'

const aiImageGenerationApi = {
    // 获取AI图片生成历史列表
    getList: (params) => getAction('/AiImageGeneration/list', params),
    // 获取子表详情
    getDetails: (aiImageGenerationId) => getAction('/AiImageGenerationDetails/listNotPage', { aiImageGenerationId })
}

export default aiImageGenerationApi 