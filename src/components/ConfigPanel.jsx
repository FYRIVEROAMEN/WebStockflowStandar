import { useEffect, useState } from 'react'
import { getConfigLocal, updateConfigLocal } from '../services/api'
import { useLocal } from '../context/LocalContext'
import { subirImagenOptimizada, subirBlob } from '../utils/upload'
import { logoOptimizado } from '../utils/image'
import EditorRecorte from '../components/EditorRecorte'
import { Save, Upload, Trash2, Pencil } from 'lucide-react'

const s = {
  card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginBottom: 16 },
  label: { display: 'block', fontSize: '.85rem', fontWeight: 700, marginBottom: 6, color: '#111827' },
  input: { width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: '.9rem', boxSizing: 'border-box' },
  btn: { width: '100%', padding: 12, border: 'none', borderRadius: 8, background: '#111827', color: '#fff', fontWeight: 700, fontSize: '.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  row: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 },
  chip: { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#111827', color: '#fff', fontSize: '.75rem', fontWeight: 700, padding: '5px 10px', borderRadius: 999 },
  chipX: { background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 0, fontSize: '.85rem' },
}

const SLIDE_VACIO = { id: null, imageUrl: '', titulo: '', subtitulo: '' }

export default function ConfigPanel() {
  const { refresh } = useLocal()
  const [logoUrl, setLogoUrl] = useState('')
  const [subiendoLogo, setSubiendoLogo] = useState(false)
  const [anuncio, setAnuncio] = useState('')
  const [activarDesc, setActivarDesc] = useState(false)
  const [pct, setPct] = useState(10)
  const [categoriasWeb, setCategoriasWeb] = useState([])
  const [nuevoCat, setNuevoCat] = useState('')
  const [heroSlides, setHeroSlides] = useState([])
  const [slideForm, setSlideForm] = useState(SLIDE_VACIO)
  const [archivoSlide, setArchivoSlide] = useState(null)
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
        setHeroSlides(data.hero_slides || [])
      }
    }).catch(() => {}).finally(() => setCargando(false))
  }, [])

  const subirLogo = async (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    setSubiendoLogo(true)
    try {
      const url = await subirImagenOptimizada(file, { maxDim: 200, calidad: 0.9 })
      if (url) setLogoUrl(url)
    } catch (err) {
      console.error('Error subiendo logo:', err)
      alert('Error al subir el logo. Intentá de nuevo.')
    }
    setSubiendoLogo(false)
  }

  // Ya no sube directo: guarda el archivo y abre el editor de recorte
  const subirSlideImg = (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    if (file) setArchivoSlide(file)
  }

  const salvarSlide = () => {
    if (!slideForm.imageUrl || !slideForm.titulo.trim()) return
    if (slideForm.id) {
      setHeroSlides(h => h.map(sl => (sl.id === slideForm.id ? { ...slideForm, titulo: slideForm.titulo.trim() } : sl)))
    } else if (heroSlides.length < 3) {
      setHeroSlides(h => [...h, { ...slideForm, id: Date.now(), titulo: slideForm.titulo.trim() }])
    }
    setSlideForm(SLIDE_VACIO)
  }

  const editarSlide = (sl) => setSlideForm({ ...sl })

  const quitarSlide = (id) => {
    setHeroSlides(h => h.filter(sl => sl.id !== id))
    if (slideForm.id === id) setSlideForm(SLIDE_VACIO)
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
      web_categorias: categoriasWeb,
      hero_slides: heroSlides
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
            <img src={logoOptimizado(logoUrl)} alt="logo" style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: 8, background: '#f3f4f6' }} />
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

      {/* ---------- 🖼️ BANNER DE LA HOME ---------- */}
      <div style={s.card}>
        <label style={s.label}>🖼️ Banner de la home (hasta 3 slides)</label>
        <p style={{ fontSize: '.72rem', color: '#6b7280', margin: '0 0 10px' }}>
          Subí tus propias imágenes con título y subtítulo. Si no cargás ninguna,
          se muestran los banners por defecto de la plataforma.
        </p>

        {heroSlides.map(sl => (
          <div key={sl.id} style={{ ...s.row, background: '#f9fafb', padding: 8, borderRadius: 8 }}>
            <img src={sl.imageUrl} alt="" style={{ width: 64, height: 40, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: '.85rem', fontWeight: 700, color: '#111827' }}>{sl.titulo}</p>
              <p style={{ margin: 0, fontSize: '.72rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sl.subtitulo}</p>
            </div>
            <button onClick={() => editarSlide(sl)} title="Editar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', display: 'flex', padding: 4 }}>
              <Pencil size={15} />
            </button>
            <button onClick={() => quitarSlide(sl.id)} title="Quitar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', display: 'flex', padding: 4 }}>
              <Trash2 size={15} />
            </button>
          </div>
        ))}

        {heroSlides.length < 3 && (
          <div style={{ border: '1.5px dashed #e5e7eb', borderRadius: 8, padding: 12, marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              {slideForm.imageUrl ? (
                <img src={slideForm.imageUrl} alt="" style={{ width: 64, height: 40, objectFit: 'cover', borderRadius: 6 }} />
              ) : (
                <div style={{ width: 64, height: 40, borderRadius: 6, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🌆</div>
              )}
              <label style={{ ...s.btn, width: 'auto', padding: '8px 12px', cursor: 'pointer', margin: 0 }}>
                <Upload size={14} /> {archivoSlide ? 'Cambiar imagen' : 'Subir imagen'}
                <input type="file" accept="image/*" hidden onChange={subirSlideImg} />
              </label>
            </div>

            {/* ✋ Editor de recorte estilo Facebook/LinkedIn */}
            {archivoSlide && (
              <EditorRecorte
                file={archivoSlide}
                onConfirm={async (blob) => {
                  try {
                    const url = await subirBlob(blob)
                    setSlideForm(f => ({ ...f, imageUrl: url }))
                    setArchivoSlide(null)
                  } catch (err) {
                    console.error('Error subiendo banner:', err)
                    alert('Error al subir la imagen. Intentá de nuevo.')
                  }
                }}
                onCancel={() => setArchivoSlide(null)}
              />
            )}

            <input
              style={{ ...s.input, marginBottom: 8, marginTop: 8 }}
              value={slideForm.titulo}
              onChange={e => setSlideForm(f => ({ ...f, titulo: e.target.value }))}
              placeholder="Título (ej: Nueva temporada)"
            />
            <input
              style={{ ...s.input, marginBottom: 10 }}
              value={slideForm.subtitulo}
              onChange={e => setSlideForm(f => ({ ...f, subtitulo: e.target.value }))}
              placeholder="Subtítulo (ej: Lo último ya llegó)"
            />
            <button
              onClick={salvarSlide}
              disabled={!slideForm.imageUrl || !slideForm.titulo.trim()}
              style={{ ...s.btn, opacity: !slideForm.imageUrl || !slideForm.titulo.trim() ? 0.5 : 1 }}
            >
              {slideForm.id ? 'Actualizar slide' : '+ Agregar slide'}
            </button>
          </div>
        )}
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