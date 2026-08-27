import { useEffect, useRef, useState } from 'react'
import { getConfigLocal, updateConfigLocal } from '../services/api'
import { Megaphone, Share2, Music2, Percent, Newspaper } from 'lucide-react'
import styles from './MarketingPanel.module.css'

export default function MarketingPanel() {
  const [anuncio, setAnuncio] = useState('')
  const [activarDesc, setActivarDesc] = useState(false)
  const [pct, setPct] = useState(10)
  const [pixelMeta, setPixelMeta] = useState('')
  const [pixelTiktok, setPixelTiktok] = useState('')
  const [cargando, setCargando] = useState(true)
  const [estado, setEstado] = useState('idle')
  const listo = useRef(false)

  useEffect(() => {
    getConfigLocal().then(({ data }) => {
      if (data) {
        setAnuncio(data.anuncio || '')
        setActivarDesc(data.descuento_transferencia != null)
        setPct(Number(data.descuento_transferencia) || 10)
        setPixelMeta(data.pixel_meta || '')
        setPixelTiktok(data.pixel_tiktok || '')
      }
    }).catch(() => {}).finally(() => setCargando(false))
  }, [])

  useEffect(() => {
    if (!cargando) {
      const t = setTimeout(() => { listo.current = true }, 150)
      return () => clearTimeout(t)
    }
  }, [cargando])

  useEffect(() => {
    if (!listo.current) return
    setEstado('guardando')
    const t = setTimeout(async () => {
      try {
        await updateConfigLocal({
          anuncio: anuncio.trim() || null,
          descuento_transferencia: activarDesc ? Number(pct) : null,
          pixel_meta: pixelMeta.trim() || null,
          pixel_tiktok: pixelTiktok.trim() || null
        })
        setEstado('ok')
      } catch (err) {
        console.error('Error guardando marketing:', err)
        setEstado('idle')
      }
    }, 800)
    return () => clearTimeout(t)
  }, [anuncio, activarDesc, pct, pixelMeta, pixelTiktok])

  if (cargando) return <p className={styles.estadoTexto}>Cargando...</p>

  return (
    <div>
      <div className={styles.estadoRow}>
        {estado === 'guardando' && <span className={styles.estadoTexto}>Guardando…</span>}
        {estado === 'ok' && <span className={styles.estadoOk}>✓ Guardado</span>}
      </div>

      {/* 📢 BARRA DE ANUNCIO */}
      <div className={styles.card}>
        <label className={`${styles.label} ${styles.labelIcon}`}>
          <Newspaper size={14} style={{ color: '#f59e0b' }} /> Barra de anuncio
        </label>
        <input
          className={styles.input}
          value={anuncio}
          onChange={e => setAnuncio(e.target.value)}
          placeholder="Ej: 🚚 Envíos gratis superando $150.000"
        />
        <p className={styles.hint}>
          Aparece como cinta que se mueve arriba de todo tu tienda.
          Vacío = no se muestra. Ideal para la promo del mes.
        </p>
      </div>

      {/* 💸 DESCUENTOS */}
      <div className={styles.card}>
        <label className={`${styles.label} ${styles.labelIcon}`}>
          <Percent size={14} style={{ color: '#16a34a' }} /> Descuento por transferencia
        </label>
        <p className={`${styles.hint} ${styles.hintMb}`}>
          Mostrá un precio más bajo si te pagan por transferencia (te ahorra comisiones).
        </p>
        <label className={styles.checkRow}>
          <input type="checkbox" className={styles.checkInput} checked={activarDesc} onChange={e => setActivarDesc(e.target.checked)} />
          <span className={styles.checkTexto}>Activar</span>
        </label>
        {activarDesc && (
          <>
            <label className={styles.label}>Porcentaje (%)</label>
            <input className={styles.input} type="number" min="1" max="90" value={pct} onChange={e => setPct(e.target.value)} />
          </>
        )}
      </div>

      {/* 📣 PIXELES */}
      <div className={`${styles.card} ${styles.cardInfo}`}>
        <p className={styles.tituloInfo}>
          <Megaphone size={16} /> Hacé publicidad y medí TUS campañas
        </p>
        <p className={`${styles.hint} ${styles.hintMt}`}>
          Pegá acá tu ID de píxel y tu tienda va a empezar a medir las campañas
          que hagas en Meta o TikTok. Sin píxel = sin scripts extra (tu web sigue rápida).
        </p>
      </div>

      <div className={styles.card}>
        <label className={`${styles.label} ${styles.labelIcon}`}>
          <Share2 size={14} style={{ color: '#1877f2' }} /> Meta Pixel (Facebook / Instagram Ads)
        </label>
        <input
          className={styles.input}
          value={pixelMeta}
          onChange={e => setPixelMeta(e.target.value.replace(/\D/g, ''))}
          placeholder="Ej: 123456789012345"
          inputMode="numeric"
        />
        <p className={styles.hint}>
          Lo encontrás en Meta Events Manager → "Conectar datos" → tu píxel.
          Son 15-16 números.
        </p>
      </div>

      <div className={styles.card}>
        <label className={`${styles.label} ${styles.labelIcon}`}>
          <Music2 size={14} style={{ color: '#111' }} /> TikTok Pixel
        </label>
        <input
          className={styles.input}
          value={pixelTiktok}
          onChange={e => setPixelTiktok(e.target.value.trim())}
          placeholder="Ej: C1A2B3C4D5E6F7G8H9I0"
        />
        <p className={styles.hint}>
          Lo encontrás en TikTok Ads Manager → Eventos → píxeles.
        </p>
      </div>
    </div>
  )
}