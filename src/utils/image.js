// Servir siempre la versión liviana según provider
export function optimizeImage(url, width = 800) {
  if (!url) return url
  if (url.includes('res.cloudinary.com')) {
    if (/\/upload\/(q_|f_|w_|c_|e_trim)/.test(url)) return url // ya transformada
    return url.replace('/upload/', `/upload/q_auto,f_auto,c_limit,w_${width}/`)
  }
  return url // S3 u otros: tal cual (ya nació comprimida)
}

// Logo con recorte automático de bordes + liviano
export function logoOptimizado(url) {
  if (!url) return url
  if (url.includes('res.cloudinary.com') && !url.includes('e_trim')) {
    return url.replace('/upload/', '/upload/e_trim,q_auto,f_auto/')
  }
  return url
}