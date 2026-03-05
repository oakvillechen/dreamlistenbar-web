/**
 * 将 HTTP 图片 URL 转换为通过代理的 HTTPS URL
 * 解决 iOS Safari 混合内容问题
 */
export function proxyCoverUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (url.startsWith('https://')) return url;
  if (url.startsWith('http://')) {
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  }
  return url;
}

/**
 * 将 HTTP 音频 URL 转换为通过代理的 HTTPS URL
 */
export function proxyAudioUrl(url: string): string {
  if (url.startsWith('http://')) {
    return `/api/proxy-audio?url=${encodeURIComponent(url)}`;
  }
  return url;
}
