import { buildAuthedWebUrl, DEFAULT_ROUTE } from './config'
import { rememberWebRoute } from './auth'

export function openWebView (path, title = '') {
  const target = path || DEFAULT_ROUTE
  rememberWebRoute(target)
  const url = buildAuthedWebUrl(target)
  const query = [`url=${encodeURIComponent(url)}`]
  if (title) {
    query.push(`title=${encodeURIComponent(title)}`)
  }
  uni.navigateTo({ url: `/pages/webview/index?${query.join('&')}` })
}
