// Estándar StockFlow: NUNCA usar imagen_url cruda en <img>
export const optimizeImage = (url, width = 600) => {
  if (!url) return ''
  if (!url.includes('/image/upload/')) return url
  if (/\/image\/upload\/w_\d+/.test(url)) return url // ya optimizada
  return url.replace('/image/upload/', `/image/upload/w_${width},f_auto,q_auto,dpr_auto/`)
}