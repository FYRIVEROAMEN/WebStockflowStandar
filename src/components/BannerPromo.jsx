import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getConfigLocal } from '../services/api'
import { optimizeImage } from '../utils/image'
import styles from './BannerPromo.module.css'

const BANNERS = [
  { titulo: 'Nueva temporada', sub: 'Lo último ya disponible en el local', clase: 'b1' },
  { titulo: '2x1 en accesorios', sub: 'Solo esta semana', clase: 'b2' },
  { titulo: 'Reservas por WhatsApp', sub: 'Te lo separamos en el día', clase: 'b3' }
]

export default function BannerPromo() {
  const navigate = useNavigate()
  const trackRef = useRef(null)
  const [activo, setActivo] = useState(0)
  const [propios, setPropios] = useState([])

  useEffect(() => {
    getConfigLocal()
      .then(({ data }) => setPropios(data?.hero_slides || []))
      .catch(() => {})
  }, [])

  const items = propios.length > 0 ? propios : BANNERS
  const esDefault = propios.length === 0

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const onScroll = () => {
      const i = Math.round(el.scrollLeft / el.clientWidth)
      setActivo(Math.max(0, Math.min(items.length - 1, i)))
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [items.length])

  const mover = (dir) => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <div className={styles.wrap}>
      <button className={`${styles.flecha} ${styles.flechaIzq}`} onClick={() => mover(-1)} aria-label="Banner anterior">
        ‹
      </button>

      <div className={styles.track} ref={trackRef}>
        {items.map((b, i) => (
          <div key={b.id || i} className={`${styles.banner} ${b.clase ? styles[b.clase] : ''}`}>
            {b.imageUrl && (
              <>
                <img src={optimizeImage(b.imageUrl, 1200)} alt="" className={styles.bannerImg} />
                <div className={styles.bannerOverlay} />
              </>
            )}
            <p className={styles.titulo}>{b.titulo}</p>
            <p className={styles.sub}>{b.sub || b.subtitulo}</p>

            {/* ✚ CTA DENTRO del primer slide default:
                queda clavado sobre el banner en CUALQUIER dispositivo */}
            {esDefault && i === 0 && (
              <button
                className={styles.cta}
                onClick={() => navigate('/admin?tab=config')}
              >
                <span className={styles.ctaTitulo}>✚ Tu banner personalizable</span>
                <span className={styles.ctaSub}>Hasta 3 slides con tus fotos y textos · tocá para crearlo</span>
              </button>
            )}
          </div>
        ))}
      </div>

      <button className={`${styles.flecha} ${styles.flechaDer}`} onClick={() => mover(1)} aria-label="Banner siguiente">
        ›
      </button>

      <div className={styles.dots}>
        {items.map((_, i) => (
          <span key={i} className={`${styles.dot} ${i === activo ? styles.dotActivo : ''}`} />
        ))}
      </div>
    </div>
  )
}