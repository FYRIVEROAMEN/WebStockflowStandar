const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

import imageCompression from 'browser-image-compression'

// Productos y logo: compresión simple
export async function subirImagenOptimizada(file, { maxDim = 1200, calidad = 0.8 } = {}) {
  const blob = await imageCompression(file, {
    maxWidthOrHeight: maxDim,
    initialQuality: calidad,
    fileType: 'image/webp',
    useWebWorker: true
  })
  return subirBlob(blob)
}

// Sube un blob ya procesado (el editor de recorte lo usa)
export async function subirBlob(blob, nombre = 'imagen.webp') {
  const fd = new FormData()
  fd.append('file', blob, nombre)
  fd.append('upload_preset', PRESET)
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method: 'POST', body: fd })
  const data = await res.json()
  if (!data.secure_url) throw new Error('Error subiendo imagen')
  return data.secure_url
}