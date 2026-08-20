import { useEffect, useState } from 'react'
import { getConfigLocal, updateConfigLocal } from '../services/api'
import { useLocal } from '../context/LocalContext'
import { Save } from 'lucide-react'

const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

const s = {
  card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginBottom: 16 },
  label: { display: 'block', fontSize: '.85rem', fontWeight: 700, marginBottom: 6, color: '#111827' },
  input: { width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: '.9rem', boxSizing: 'border-box' },
  btn: { width: '100%', padding: 12, border: 'none', borderRadius: 8, background: '#111827', color: '#fff', fontWeight: 700, fontSize: '.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  row: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 },
  chip: { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#111827', color: '#fff', fontSize: '.75rem', fontWeight: 700, padding: '5px 10px', borderRadius: 999 },
  chipX: { background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 0, fontSize: '.85rem' },
}

export default function ConfigPanel() {
  const { refresh } = useLocal()
  const [logoUrl, setLogoUrl] = useState('')
  const [subiendoLogo, setSubiendoLogo] = useState(false)
  const [anuncio, setAnuncio] = useState('')
  const [activarDesc, setActivarDesc] = useState(false)
  const [pct, setPct] = useState(10)
  const [categoriasWeb, setCategoriasWeb] = useState([])
  const [nuevoCat, setNuevoCat] = useState('')
  const [guardado, setGuardado] = useState(false)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    getConfigLocal().then(({ data }) => {
      if (data) {
        setLogoUrl(data.logo_url || '')
        setAnuncio(data.anuncio || '')
        setActivarDesc(data.descuento_transferencia != null)
        setPct(Number(data.descuento_transferencia) || 10)
        setCategoriasWeb(data.web_categorias || [])
      }
    }).catch(() => {}).finally(() => setCargando(false))
  }, [])

  const subirLogo = async (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    setSubiendoLogo(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', PRESET)
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method: 'POST', body: fd })
      const data = await res.json()
      if (data.secure_url) setLogoUrl(data.secure_url)
    } catch (err) {
      console.error('Error subiendo logo:', err)
    }
    setSubiendoLogo(false)
  }

  const agregarCat = () => {
    const limpio = (nuevoCat || '').trim()
    if (!limpio) return
    if (categoriasWeb.some(c => c.toLowerCase() === limpio.toLowerCase())) return
    setCategoriasWeb([...categoriasWeb, limpio])
    setNuevoCat('')
  }

  const quitarCat = (c) => setCategoriasWeb(categoriasWeb.filter(x => x !== c))

  const guardar = async () => {
    await updateConfigLocal({
      logo_url: logoUrl || null,
      anuncio: anuncio.trim() || null,
      descuento_transferencia: activarDesc ? Number(pct) : null,
      web_categorias: categoriasWeb
    })
    await refresh()
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2000)
  }

  if (cargando) return <p style={{ fontSize: '.85rem', color: '#6b7280' }}>Cargando configuración...</p>

  return (
    <div>
      <div style={s.card}>
        <label style={s.label}>Logo del local</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {logoUrl ? (
                        <img src={logoUrl.replace('/upload/', '/upload/e_trim/')} alt="logo" style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: 8, background: '#f3f4f6' }} />
          ) : (
            <div style={{ width: 56, height: 56, borderRadius: 8, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📦</div>
          )}
          <label style={{ ...s.btn, width: 'auto', padding: '8px 14px', cursor: 'pointer', margin: 0 }}>
            {subiendoLogo ? 'Subiendo...' : 'Subir logo'}
            <input type="file" accept="image/*" hidden onChange={subirLogo} />
          </label>
          {logoUrl && (
            <button onClick={() => setLogoUrl('')} style={{ ...s.btn, width: 'auto', padding: '8px 12px', background: '#dc2626' }}>
              Quitar
            </button>
          )}
        </div>
        <p style={{ fontSize: '.72rem', color: '#6b7280', margin: '8px 0 0' }}>
          Se muestra en el navbar. Recomendado: PNG cuadrado con fondo transparente.
        </p>
      </div>

      <div style={s.card}>
        <label style={s.label}>Barra de anuncio (vacío = no se muestra)</label>
        <input
          style={s.input}
          value={anuncio}
          onChange={e => setAnuncio(e.target.value)}
          placeholder="Ej: 🚚 Envíos gratis superando $150.000"
        />
      </div>

      <div style={s.card}>
        <label style={s.row}>
          <input type="checkbox" checked={activarDesc} onChange={e => setActivarDesc(e.target.checked)} />
          <span style={{ fontSize: '.9rem', fontWeight: 700 }}>Activar descuento por transferencia</span>
        </label>
        {activarDesc && (
          <>
            <label style={s.label}>Porcentaje (%)</label>
            <input style={s.input} type="number" min="1" max="90" value={pct} onChange={e => setPct(e.target.value)} />
          </>
        )}
      </div>

      <div style={s.card}>
        <label style={s.label}>Categorías del Catálogo</label>
        <p style={{ fontSize: '.72rem', color: '#6b7280', margin: '0 0 8px' }}>
          Recomendado: hasta 4 o 5 categorías grandes (son las cards de la home).
          Para el resto usá las categorías libres al cargar productos: aparecen
          como filtros adentro de cada sección.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {categoriasWeb.map(c => (
            <span key={c} style={s.chip}>
              {c}
              <button onClick={() => quitarCat(c)} style={s.chipX}>×</button>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            style={{ ...s.input, flex: 1 }}
            value={nuevoCat}
            onChange={e => setNuevoCat(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); agregarCat(); } }}
            placeholder="Agregar (ej: Mujer, Hombre)"
          />
          <button onClick={agregarCat} style={{ ...s.btn, width: 'auto', padding: '10px 14px' }}>+</button>
        </div>
      </div>

      <button style={s.btn} onClick={guardar}>
        <Save size={16} /> {guardado ? '✓ Guardado' : 'Guardar cambios'}
      </button>
    </div>
  )
}