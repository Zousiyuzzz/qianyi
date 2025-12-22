import { httpAction, getAction } from './manage'

const aiApi = {
  generateImage: (params) => httpAction('/ai/image-to-image', params, 'POST'),
  getHistory: (params) => getAction('/ai/history', params),
  deleteHistory: (id) => httpAction(`/ai/history/${id}`, {}, 'DELETE'),
  getModels: () => getAction('/ai/models'),
  getGenerationStatus: (taskId) => getAction(`/ai/status/${taskId}`),
  cancelGeneration: (taskId) => httpAction(`/ai/cancel/${taskId}`, {}, 'POST'),
  downloadImage: (imageId) => getAction(`/ai/download/${imageId}`),
  getQuota: () => getAction('/ai/quota'),
  getPresets: () => getAction('/ai/presets'),
  savePreset: (params) => httpAction('/ai/presets', params, 'POST'),
  deletePreset: (presetId) => httpAction(`/ai/presets/${presetId}`, {}, 'DELETE')
}

export default aiApi
