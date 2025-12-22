import { getAction } from './manage'

const aiImageGenerationApi = {
  getList: (params) => getAction('/AiImageGeneration/list', params),
  getDetails: (aiImageGenerationId) => getAction('/AiImageGenerationDetails/listNotPage', { aiImageGenerationId })
}

export default aiImageGenerationApi
