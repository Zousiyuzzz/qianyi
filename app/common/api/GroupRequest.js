/**
 * 将一个请求分组，默认缓存半分钟
 * @param getPromise 传入一个可以获取到Promise对象的方法
 * @param groupId 分组ID，如果不传或者为空则不分组
 * @param expire 过期时间，默认 半分钟
 */
export function httpGroupRequest(getPromise, groupId, expire = 1000 * 30) {
  if (groupId == null || groupId === '') {
    return getPromise()
  }
  const cacheKey = `group-cache-${groupId}`
  const cached = uni.getStorageSync(cacheKey)
  if (cached) {
    return Promise.resolve(cached)
  }

  return getPromise().then(res => {
    uni.setStorageSync(cacheKey, res)
    setTimeout(() => {
      uni.removeStorageSync(cacheKey)
    }, expire)
    return Promise.resolve(res)
  })
}
