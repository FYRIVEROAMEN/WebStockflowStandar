import { Link } from 'react-router-dom'
import { useLocal } from '../context/LocalContext'
import { Mail, MapPin, Phone, Truck } from 'lucide-react'
import styles from './Footer.module.css'

const PATHS = {
  whatsapp:
    'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z',
  facebook:
    'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  instagram:
    'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z',
  twitter:
    'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z',
  youtube:
    'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  tiktok:
    'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z'
}

function IconoRed({ nombre }) {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden="true">
      <path d={PATHS[nombre]} />
    </svg>
  )
}

const urlDe = {
  facebook: (v) => (v.startsWith('http') ? v : `https://facebook.com/${v.replace('@', '')}`),
  instagram: (v) => (v.startsWith('http') ? v : `https://instagram.com/${v.replace('@', '')}`),
  twitter: (v) => (v.startsWith('http') ? v : `https://x.com/${v.replace('@', '')}`),
  youtube: (v) => (v.startsWith('http') ? v : `https://youtube.com/@${v.replace('@', '')}`),
  tiktok: (v) => (v.startsWith('http') ? v : `https://tiktok.com/@${v.replace('@', '')}`)
}

export default function Footer() {
  const { config } = useLocal()
  const wa = (config?.whatsapp || '').replace(/\D/g, '')
  const email = (config?.email || '').trim()
  const direccion = (config?.direccion || '').trim()
  const envio = (config?.envio_info || '').trim()
  const categorias = config?.categoriasWeb || []
   const nombreLocal = config?.nombreLocal || import.meta.env.VITE_NOMBRE_LOCAL || 'StockFlow'

  const redes = []
  if (wa) redes.push({ key: 'whatsapp', href: `https://wa.me/${wa}`, esWhatsapp: true })
  ;['facebook', 'instagram', 'twitter', 'youtube', 'tiktok'].forEach(key => {
    const v = (config?.[key] || '').trim()
    if (v) redes.push({ key, href: urlDe[key](v), esWhatsapp: false })
  })

  return (
    <footer className={styles.footer}>
      <p className={styles.nombre}>{nombreLocal}</p>

      {categorias.length > 0 && (
        <div className={styles.bloque}>
          <p className={styles.titulo}>NAVEGACIÓN</p>
          <div className={styles.navLinks}>
            {categorias.map(c => (
              <Link key={c} to={`/seccion/${encodeURIComponent(c)}`} className={styles.navLink}>
                {c}
              </Link>
            ))}
          </div>
        </div>
      )}

      {(wa || email || direccion) && (
        <div className={styles.bloque}>
          <p className={styles.titulo}>CONTACTO</p>
          {wa && (
            <a className={styles.item} href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">
              <Phone size={14} /> +{wa}
            </a>
          )}
          {email && (
            <a className={styles.item} href={`mailto:${email}`}>
              <Mail size={14} /> {email}
            </a>
          )}
          {direccion && (
            <p className={styles.item}>
              <MapPin size={14} /> {direccion}
            </p>
          )}
        </div>
      )}

      {envio && (
        <div className={styles.bloque}>
          <p className={styles.titulo}>ENVIOS</p>
          <p className={styles.item}>
            <Truck size={14} /> {envio}
          </p>
        </div>
      )}

      {redes.length > 0 && (
        <div className={styles.bloque}>
          <p className={styles.titulo}>REDES SOCIALES</p>
          <div className={styles.redes}>
            {redes.map(r => (
              <a
                key={r.key}
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                className={r.esWhatsapp ? styles.redIconWa : styles.redIcon}
                aria-label={r.key}
              >
                <IconoRed nombre={r.key} />
              </a>
            ))}
          </div>
        </div>
      )}

      <p className={styles.copy}>© {new Date().getFullYear()} {nombreLocal} · Hecho con StockFlow</p>
    </footer>
  )
}