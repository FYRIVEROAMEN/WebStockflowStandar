import { useEffect } from 'react'
import { useLocal } from '../context/LocalContext'

const OG_DEFAULT = 'https://res.cloudinary.com/dyourcloud/image/upload/v1/stockflow-default.jpg'

const setAttr = (selector, attr, value) => {
  if (!value) return
  const el = document.querySelector(selector)
  if (el) el.setAttribute(attr, value)
}

export default function MetaTags() {
  const { config } = useLocal()

  useEffect(() => {
    const nombre = config?.nombreLocal || 'StockFlow'
    const titulo = `${nombre} — Tienda online`
    const descripcion =
      config?.og_description ||
      `Productos de ${nombre} con atención personalizada por WhatsApp.`
    const imagen = config?.og_image || config?.logoUrl || OG_DEFAULT
    const favicon = config?.favicon_url || config?.logoUrl || '/favicon.svg'

    document.title = titulo
    setAttr('meta[name="description"]', 'content', descripcion)
    setAttr('meta[property="og:title"]', 'content', titulo)
    setAttr('meta[property="og:description"]', 'content', descripcion)
    setAttr('meta[property="og:image"]', 'content', imagen)
    setAttr('meta[property="og:site_name"]', 'content', nombre)
    setAttr('meta[property="og:url"]', 'content', window.location.origin)
    setAttr('meta[name="twitter:title"]', 'content', titulo)
    setAttr('meta[name="twitter:description"]', 'content', descripcion)
    setAttr('meta[name="twitter:image"]', 'content', imagen)
    setAttr('link[rel="icon"]', 'href', favicon)
    setAttr('link[rel="apple-touch-icon"]', 'href', favicon)
  }, [config])

  return null
}