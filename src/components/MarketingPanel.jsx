import { useEffect, useRef, useState } from 'react'
import { getConfigLocal, updateConfigLocal } from '../services/api'
import { Megaphone, Share2, Music2, Percent, Newspaper } from 'lucide-react'

const s = {
  card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginBottom: 16 },
  label: { display: 'block', fontSize: '.85rem', fontWeight: 700, marginBottom: 6, color: '#111827' },
  input: { width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: '.9rem', boxSizing: 'border-box' },
  hint: { fontSize: '.72rem', color: '#6b7280', margin: '8px 0 0' },
}

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

  if (cargando) return <p style={{ fontSize: '.85rem', color: '#6b7280' }}>Cargando...</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', minHeight: 20, marginBottom: 6 }}>
        {estado === 'guardando' && <span style={{ fontSize: '.72rem', color: '#6b7280' }}>Guardando…</span>}
        {estado === 'ok' && <span style={{ fontSize: '.72rem', color: '#16a34a', fontWeight: 700 }}>✓ Guardado</span>}
      </div>

      {/* 📢 BARRA DE ANUNCIO (la cinta que se mueve arriba de todo) */}
      <div style={s.card}>
        <label style={{ ...s.label, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Newspaper size={14} style={{ color: '#f59e0b' }} /> Barra de anuncio
        </label>
        <input
          style={s.input}
          value={anuncio}
          onChange={e => setAnuncio(e.target.value)}
          placeholder="Ej: 🚚 Envíos gratis superando $150.000"
        />
        <p style={s.hint}>
          Aparece como cinta que se mueve arriba de todo tu tienda.
          Vacío = no se muestra. Ideal para la promo del mes.
        </p>
      </div>

      {/* 💸 DESCUENTOS */}
      <div style={s.card}>
        <label style={{ ...s.label, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Percent size={14} style={{ color: '#16a34a' }} /> Descuento por transferencia
        </label>
        <p style={{ ...s.hint, marginTop: 0, marginBottom: 10 }}>
          Mostrá un precio más bajo si te pagan por transferencia (te ahorra comisiones).
        </p>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, cursor: 'pointer' }}>
          <input type="checkbox" checked={activarDesc} onChange={e => setActivarDesc(e.target.checked)} style={{ width: 18, height: 18 }} />
          <span style={{ fontSize: '.9rem', fontWeight: 700 }}>Activar</span>
        </label>
        {activarDesc && (
          <>
            <label style={s.label}>Porcentaje (%)</label>
            <input style={s.input} type="number" min="1" max="90" value={pct} onChange={e => setPct(e.target.value)} />
          </>
        )}
      </div>

      {/* 📣 PIXELES */}
      <div style={{ ...s.card, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
        <p style={{ margin: 0, fontSize: '.85rem', fontWeight: 800, color: '#111827', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Megaphone size={16} /> Hacé publicidad y medí TUS campañas
        </p>
        <p style={{ ...s.hint, marginTop: 6 }}>
          Pegá acá tu ID de píxel y tu tienda va a empezar a medir las campañas
          que hagas en Meta o TikTok. Sin píxel = sin scripts extra (tu web sigue rápida).
        </p>
      </div>

      <div style={s.card}>
        <label style={{ ...s.label, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Share2 size={14} style={{ color: '#1877f2' }} /> Meta Pixel (Facebook / Instagram Ads)
        </label>
        <input
          style={s.input}
          value={pixelMeta}
          onChange={e => setPixelMeta(e.target.value.replace(/\D/g, ''))}
          placeholder="Ej: 123456789012345"
          inputMode="numeric"
        />
        <p style={s.hint}>
          Lo encontrás en Meta Events Manager → "Conectar datos" → tu píxel.
          Son 15-16 números.
        </p>
      </div>

      <div style={s.card}>
        <label style={{ ...s.label, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Music2 size={14} style={{ color: '#111' }} /> TikTok Pixel
        </label>
        <input
          style={s.input}
          value={pixelTiktok}
          onChange={e => setPixelTiktok(e.target.value.trim())}
          placeholder="Ej: C1A2B3C4D5E6F7G8H9I0"
        />
        <p style={s.hint}>
          Lo encontrás en TikTok Ads Manager → Eventos → píxeles.
        </p>
      </div>
    </div>
  )
}