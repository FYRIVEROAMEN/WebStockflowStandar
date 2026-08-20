import { useEffect, useRef, useState } from 'react'
import styles from './BannerPromo.module.css'

const BANNERS = [
  { titulo: 'Nueva temporada', sub: 'Lo último ya disponible en el local', clase: 'b1' },
  { titulo: '2x1 en accesorios', sub: 'Solo esta semana', clase: 'b2' },
  { titulo: 'Reservas por WhatsApp', sub: 'Te lo separamos en el día', clase: 'b3' }
]

export default function BannerPromo() {
  const trackRef = useRef(null)
  const [activo, setActivo] = useState(0)

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const onScroll = () => {
      const i = Math.round(el.scrollLeft / el.clientWidth)
      setActivo(Math.max(0, Math.min(BANNERS.length - 1, i)))
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

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
        {BANNERS.map(b => (
          <div key={b.titulo} className={`${styles.banner} ${styles[b.clase]}`}>
            <p className={styles.titulo}>{b.titulo}</p>
            <p className={styles.sub}>{b.sub}</p>
          </div>
        ))}
      </div>

      <button className={`${styles.flecha} ${styles.flechaDer}`} onClick={() => mover(1)} aria-label="Banner siguiente">
        ›
      </button>

      <div className={styles.dots}>
        {BANNERS.map((_, i) => (
          <span key={i} className={`${styles.dot} ${i === activo ? styles.dotActivo : ''}`} />
        ))}
      </div>
    </div>
  )
}