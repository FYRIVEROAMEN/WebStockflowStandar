import { useEffect, useRef, useState } from 'react'
import { getConfigLocal, updateConfigLocal } from '../services/api'
import { useLocal } from '../context/LocalContext'
import { subirImagenOptimizada, subirBlob } from '../utils/upload'
import { logoOptimizado } from '../utils/image'
import EditorRecorte from '../components/EditorRecorte'
import PanelGuia from '../components/PanelGuia'
import SeccionAcordeon from '../components/SeccionAcordeon'
import { Upload, Trash2, Pencil } from 'lucide-react'

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
  const [nombreLocal, setNombreLocal] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [subiendoLogo, setSubiendoLogo] = useState(false)
  const [anuncio, setAnuncio] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [direccion, setDireccion] = useState('')
  const [envioInfo, setEnvioInfo] = useState('')
  const [facebook, setFacebook] = useState('')
  const [instagram, setInstagram] = useState('')
  const [twitter, setTwitter] = useState('')
  const [youtube, setYoutube] = useState('')
  const [tiktok, setTiktok] = useState('')
  const [activarDesc, setActivarDesc] = useState(false)
  const [pct, setPct] = useState(10)
  const [categoriasWeb, setCategoriasWeb] = useState([])
  const [nuevoCat, setNuevoCat] = useState('')
  const [heroSlides, setHeroSlides] = useState([])
  const [secImages, setSecImages] = useState({})
  const [slideForm, setSlideForm] = useState(SLIDE_VACIO)
  const [archivoSlide, setArchivoSlide] = useState(null)
  const [cargando, setCargando] = useState(true)

  // 💾 Auto-guardado
  const [estadoGuardado, setEstadoGuardado] = useState('idle')
  const listo = useRef(false)

  // 🪗 Acordeón
  const [abiertos, setAbiertos] = useState({})

  // 🎉 Botón "Listo" (cierre emocional)
  const [celebrando, setCelebrando] = useState(false)

  // 🎯 Qué pasos están completos (para badges y auto-apertura)
  const completos = {
    1: !!(nombreLocal.trim() && logoUrl),
    2: whatsapp.replace(/\D/g, '').length >= 8,
    3: categoriasWeb.length > 0,
    4: heroSlides.length > 0,
    5: activarDesc
  }

  // 🎯 AUTO-APERTURA: al entrar, abre el primer paso incompleto
  useEffect(() => {
    if (cargando) return
    const primerIncompleto = Object.entries(completos).find(([, ok]) => !ok)?.[0]
    setAbiertos(primerIncompleto ? { [primerIncompleto]: true } : {})
    // eslint-disable-next-line
  }, [cargando])

  const toggle = (n) => {
    setAbiertos(a => ({ ...a, [n]: !a[n] }))
  }

  // Avance manual: el salto lo decide el dueño, nunca el sistema
  const siguiente = (n) => {
    setAbiertos(a => ({ ...a, [n]: false, [n + 1]: true }))
  }

  useEffect(() => {
    getConfigLocal().then(({ data }) => {
      if (data) {
        setNombreLocal(data.nombre_local || '')
        setLogoUrl(data.logo_url || '')
        setAnuncio(data.anuncio || '')
        setWhatsapp(data.whatsapp || '')
        setEmail(data.email || '')
        setDireccion(data.direccion || '')
        setEnvioInfo(data.envio_info || '')
        setFacebook(data.facebook || '')
        setInstagram(data.instagram || '')
        setTwitter(data.twitter || '')
        setYoutube(data.youtube || '')
        setTiktok(data.tiktok || '')
        setActivarDesc(data.descuento_transferencia != null)
        setPct(Number(data.descuento_transferencia) || 10)
        setCategoriasWeb(data.web_categorias || [])
        setHeroSlides(data.hero_slides || [])
        setSecImages(data.sec_images || {})
      }
    }).catch(() => {}).finally(() => setCargando(false))
  }, [])

  useEffect(() => {
    if (!cargando) {
      const t = setTimeout(() => { listo.current = true }, 150)
      return () => clearTimeout(t)
    }
  }, [cargando])

  // 💾 AUTO-GUARDADO: cualquier cambio → guarda a los 800ms
  useEffect(() => {
    if (!listo.current) return
    setEstadoGuardado('guardando')
    const t = setTimeout(async () => {
      try {
        await updateConfigLocal({
          nombre_local: nombreLocal.trim() || null,
          logo_url: logoUrl || null,
          anuncio: anuncio.trim() || null,
          whatsapp: whatsapp.trim() || null,
          email: email.trim() || null,
          direccion: direccion.trim() || null,
          envio_info: envioInfo.trim() || null,
          facebook: facebook.trim() || null,
          instagram: instagram.trim() || null,
          twitter: twitter.trim() || null,
          youtube: youtube.trim() || null,
          tiktok: tiktok.trim() || null,
          descuento_transferencia: activarDesc ? Number(pct) : null,
          web_categorias: categoriasWeb,
          hero_slides: heroSlides,
          sec_images: secImages
        })
        await refresh()
        setEstadoGuardado('ok')
      } catch (err) {
        console.error('Error guardando:', err)
        setEstadoGuardado('idle')
      }
    }, 800)
    return () => clearTimeout(t)
  }, [nombreLocal, logoUrl, anuncio, whatsapp, email, direccion, envioInfo,
      facebook, instagram, twitter, youtube, tiktok, activarDesc, pct,
      categoriasWeb, heroSlides, secImages, refresh])

  const subirLogo = async (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    setSubiendoLogo(true)
    try {
      const url = await subirImagenOptimizada(file, { maxDim: 200, calidad: 0.9 })
      if (url) setLogoUrl(url)
    } catch (err) { alert('Error al subir el logo.') }
    setSubiendoLogo(false)
  }

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

  const quitarCat = (c) => {
    setCategoriasWeb(cs => cs.filter(x => x !== c))
    setSecImages(m => {
      const copia = { ...m }
      delete copia[c]
      return copia
    })
  }

  const subirImgSec = (cat) => async (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    try {
      const url = await subirImagenOptimizada(file, { maxDim: 900, calidad: 0.85 })
      setSecImages(m => ({ ...m, [cat]: url }))
    } catch (err) { alert('Error al subir la imagen.') }
  }

  const quitarImgSec = (cat) => setSecImages(m => {
    const copia = { ...m }
    delete copia[cat]
    return copia
  })

  if (cargando) return <p style={{ fontSize: '.85rem', color: '#6b7280' }}>Cargando configuración...</p>

  return (
    <div>
      {/* 💾 Indicador de auto-guardado */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', minHeight: 20, marginBottom: 6 }}>
        {estadoGuardado === 'guardando' && (
          <span style={{ fontSize: '.72rem', color: '#6b7280' }}>Guardando…</span>
        )}
        {estadoGuardado === 'ok' && (
          <span style={{ fontSize: '.72rem', color: '#16a34a', fontWeight: 700 }}>✓ Guardado</span>
        )}
      </div>

      {/* 🧭 Guía de progreso */}
      <PanelGuia
        datos={{
          logo: logoUrl,
          whatsapp,
          categorias: categoriasWeb.length,
          banners: heroSlides.length,
          fotosCards: categoriasWeb.filter(c => secImages[c]).length
        }}
      />

      {/* ---------- PASO 1 · TU IDENTIDAD ---------- */}
      <SeccionAcordeon
        numero={1}
        titulo="Tu identidad"
        abierto={!!abiertos[1]}
        onToggle={() => toggle(1)}
        completo={completos[1]}
        preview={completos[1] ? `${nombreLocal || ''} · Logo ✓` : 'Sin nombre ni logo'}
        onSiguiente={() => siguiente(1)}
      >
        <div style={s.card}>
          <label style={s.label}>Nombre del local</label>
          <input
            style={s.input}
            value={nombreLocal}
            onChange={e => setNombreLocal(e.target.value)}
            placeholder="Ej: Zen Store, Moon Importados..."
          />
          <p style={{ fontSize: '.72rem', color: '#6b7280', margin: '8px 0 0' }}>
            Tu marca en el footer y en toda la tienda.
          </p>
        </div>

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
              <button onClick={() => setLogoUrl('')} style={{ ...s.btn, width: 'auto', padding: '8px 12px', background: '#dc2626' }}>Quitar</button>
            )}
          </div>
          <p style={{ fontSize: '.72rem', color: '#6b7280', margin: '8px 0 0' }}>
            Recomendado: PNG cuadrado con fondo transparente.
          </p>
        </div>

        <div style={s.card}>
          <label style={s.label}>Barra de anuncio (opcional)</label>
          <input style={s.input} value={anuncio} onChange={e => setAnuncio(e.target.value)} placeholder="Ej: 🚚 Envíos gratis superando $150.000" />
          <p style={{ fontSize: '.72rem', color: '#6b7280', margin: '8px 0 0' }}>
            Aparece como cinta que se mueve arriba de todo. Vacío = no se muestra.
          </p>
        </div>
      </SeccionAcordeon>

      {/* ---------- PASO 2 · CONTACTO ---------- */}
      <SeccionAcordeon
        numero={2}
        titulo="Contacto y redes"
        abierto={!!abiertos[2]}
        onToggle={() => toggle(2)}
        completo={completos[2]}
        preview={whatsapp ? `WhatsApp: +${whatsapp}` : 'Sin WhatsApp'}
        onSiguiente={() => siguiente(2)}
      >
        <div style={s.card}>
          <label style={s.label}>💬 WhatsApp de pedidos</label>
          <input style={s.input} value={whatsapp} onChange={e => setWhatsapp(e.target.value.replace(/\D/g, ''))} placeholder="Ej: 5491158471333" inputMode="numeric" />
          <p style={{ fontSize: '.72rem', color: '#6b7280', margin: '8px 0 0' }}>
            Solo números con código de país. Activa el botón verde flotante y el link del footer.
          </p>
        </div>

        <div style={s.card}>
          <label style={s.label}>📍 Datos del footer</label>
          <label style={{ ...s.label, fontSize: '.8rem', marginBottom: 4 }}>Email de contacto</label>
          <input style={{ ...s.input, marginBottom: 10 }} value={email} onChange={e => setEmail(e.target.value)} placeholder="ventas@tulocal.com" />
          <label style={{ ...s.label, fontSize: '.8rem', marginBottom: 4 }}>Dirección</label>
          <input style={{ ...s.input, marginBottom: 10 }} value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="Av. Córdoba 2773" />
          <label style={{ ...s.label, fontSize: '.8rem', marginBottom: 4 }}>Info de envíos</label>
          <input style={s.input} value={envioInfo} onChange={e => setEnvioInfo(e.target.value)} placeholder="Ej: Correo Argentino · Gratis desde $150.000" />
        </div>

        <div style={s.card}>
          <label style={s.label}>📱 Redes sociales (opcional)</label>
          <p style={{ fontSize: '.72rem', color: '#6b7280', margin: '0 0 12px' }}>
            Usuario (ej: @tulocal) o URL completa. Aparecen como íconos en el footer.
          </p>
          <label style={{ ...s.label, fontSize: '.8rem', marginBottom: 4 }}>Facebook</label>
          <input style={{ ...s.input, marginBottom: 10 }} value={facebook} onChange={e => setFacebook(e.target.value)} placeholder="@tulocal" />
          <label style={{ ...s.label, fontSize: '.8rem', marginBottom: 4 }}>Instagram</label>
          <input style={{ ...s.input, marginBottom: 10 }} value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@tulocal" />
          <label style={{ ...s.label, fontSize: '.8rem', marginBottom: 4 }}>Twitter / X</label>
          <input style={{ ...s.input, marginBottom: 10 }} value={twitter} onChange={e => setTwitter(e.target.value)} placeholder="@tulocal" />
          <label style={{ ...s.label, fontSize: '.8rem', marginBottom: 4 }}>YouTube</label>
          <input style={{ ...s.input, marginBottom: 10 }} value={youtube} onChange={e => setYoutube(e.target.value)} placeholder="@tulocal" />
          <label style={{ ...s.label, fontSize: '.8rem', marginBottom: 4 }}>TikTok</label>
          <input style={s.input} value={tiktok} onChange={e => setTiktok(e.target.value)} placeholder="@tulocal" />
        </div>
      </SeccionAcordeon>

      {/* ---------- PASO 3 · TU CATÁLOGO ---------- */}
      <SeccionAcordeon
        numero={3}
        titulo="Tu catálogo"
        abierto={!!abiertos[3]}
        onToggle={() => toggle(3)}
        completo={completos[3]}
        preview={categoriasWeb.length ? `${categoriasWeb.length} categorías` : 'Sin categorías'}
        onSiguiente={() => siguiente(3)}
      >
        <div style={s.card}>
          <label style={s.label}>Categorías del catálogo</label>
          <p style={{ fontSize: '.72rem', color: '#6b7280', margin: '0 0 8px' }}>
            Son las cards grandes de la home y el menú. Recomendado: 4 o 5.
            Ej: si vendés sahumerios → "Sahumerios", "Deco", "Regalos".
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
            <input style={{ ...s.input, flex: 1 }} value={nuevoCat} onChange={e => setNuevoCat(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); agregarCat(); } }} placeholder="Agregar (ej: Mujer)" />
            <button onClick={agregarCat} style={{ ...s.btn, width: 'auto', padding: '10px 14px' }}>+</button>
          </div>
        </div>

        <div style={s.card}>
          <label style={s.label}>🎨 Foto de cada card</label>
          <p style={{ fontSize: '.72rem', color: '#6b7280', margin: '0 0 10px' }}>
            Cada categoría puede tener su foto con efecto al pasar el mouse.
            Sin foto, se muestra un degradado de color.
          </p>
          {categoriasWeb.length === 0 && <p style={{ fontSize: '.8rem', color: '#6b7280' }}>Agregá categorías arriba primero.</p>}
          {categoriasWeb.map(cat => (
            <div key={cat} style={{ ...s.row, background: '#f9fafb', padding: 8, borderRadius: 8 }}>
              {secImages[cat] ? (
                <img src={secImages[cat]} alt="" style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
              ) : (
                <div style={{ width: 56, height: 40, borderRadius: 6, background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>🎨</div>
              )}
              <span style={{ flex: 1, minWidth: 0, fontSize: '.85rem', fontWeight: 700, color: '#111827' }}>{cat}</span>
              <label style={{ ...s.btn, width: 'auto', padding: '6px 10px', cursor: 'pointer', margin: 0, fontSize: '.72rem' }}>
                {secImages[cat] ? 'Cambiar' : 'Subir'}
                <input type="file" accept="image/*" hidden onChange={subirImgSec(cat)} />
              </label>
              {secImages[cat] && (
                <button onClick={() => quitarImgSec(cat)} style={{ ...s.chipX, color: '#dc2626', fontSize: '1rem' }}>×</button>
              )}
            </div>
          ))}
        </div>
      </SeccionAcordeon>

      {/* ---------- PASO 4 · TU VIDRIERA ---------- */}
      <SeccionAcordeon
        numero={4}
        titulo="Banner de la home"
        abierto={!!abiertos[4]}
        onToggle={() => toggle(4)}
        completo={completos[4]}
        preview={heroSlides.length ? `${heroSlides.length} slide${heroSlides.length > 1 ? 's' : ''}` : 'Sin banner'}
        onSiguiente={() => siguiente(4)}
      >
        <div style={s.card}>
          <label style={s.label}>🖼️ Banner (hasta 3 slides)</label>
          <p style={{ fontSize: '.72rem', color: '#6b7280', margin: '0 0 10px' }}>
            La portada de tu tienda. Subí una foto, arrastrá para encuadrar,
            poné título y subtítulo. Sin banner, se muestra uno por defecto.
          </p>

          {heroSlides.map(sl => (
            <div key={sl.id} style={{ ...s.row, background: '#f9fafb', padding: 8, borderRadius: 8 }}>
              <img src={sl.imageUrl} alt="" style={{ width: 64, height: 40, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '.85rem', fontWeight: 700, color: '#111827' }}>{sl.titulo}</p>
                <p style={{ margin: 0, fontSize: '.72rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sl.subtitulo}</p>
              </div>
              <button onClick={() => editarSlide(sl)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', display: 'flex', padding: 4 }}><Pencil size={15} /></button>
              <button onClick={() => quitarSlide(sl.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', display: 'flex', padding: 4 }}><Trash2 size={15} /></button>
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

              {archivoSlide && (
                <EditorRecorte
                  file={archivoSlide}
                  onConfirm={async (blob) => {
                    try {
                      const url = await subirBlob(blob)
                      setSlideForm(f => ({ ...f, imageUrl: url }))
                      setArchivoSlide(null)
                    } catch (err) { alert('Error al subir.') }
                  }}
                  onCancel={() => setArchivoSlide(null)}
                />
              )}

              <input style={{ ...s.input, marginBottom: 8, marginTop: 8 }} value={slideForm.titulo} onChange={e => setSlideForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Título (ej: Nueva temporada)" />
              <input style={{ ...s.input, marginBottom: 10 }} value={slideForm.subtitulo} onChange={e => setSlideForm(f => ({ ...f, subtitulo: e.target.value }))} placeholder="Subtítulo (ej: Lo último ya llegó)" />
              <button onClick={salvarSlide} disabled={!slideForm.imageUrl || !slideForm.titulo.trim()} style={{ ...s.btn, opacity: !slideForm.imageUrl || !slideForm.titulo.trim() ? 0.5 : 1 }}>
                {slideForm.id ? 'Actualizar slide' : '+ Agregar slide'}
              </button>
            </div>
          )}
        </div>
      </SeccionAcordeon>

      {/* ---------- PASO 5 · VENTAS ---------- */}
      <SeccionAcordeon
        numero={5}
        titulo="Estrategia de ventas"
        abierto={!!abiertos[5]}
        onToggle={() => toggle(5)}
        completo={completos[5]}
        preview={activarDesc ? `Descuento ${pct}%` : 'Sin descuento'}
      >
        <div style={s.card}>
          <label style={s.row}>
            <input type="checkbox" checked={activarDesc} onChange={e => setActivarDesc(e.target.checked)} />
            <span style={{ fontSize: '.9rem', fontWeight: 700 }}>Descuento por transferencia</span>
          </label>
          <p style={{ fontSize: '.72rem', color: '#6b7280', margin: '0 0 8px' }}>
            Mostrá un precio más bajo si te pagan por transferencia (te ahorra comisiones).
          </p>
          {activarDesc && (
            <>
              <label style={s.label}>Porcentaje (%)</label>
              <input style={s.input} type="number" min="1" max="90" value={pct} onChange={e => setPct(e.target.value)} />
            </>
          )}
        </div>
      </SeccionAcordeon>

      {/* 🎉 Botón de cierre emocional: el auto-guardado ya hizo todo,
          pero el dueño siente el "terminé y quedó guardado" */}
      <button
        onClick={() => {
          setCelebrando(true)
          setTimeout(() => setCelebrando(false), 2500)
        }}
        style={{
          width: '100%',
          padding: 14,
          border: 'none',
          borderRadius: 12,
          background: celebrando ? '#16a34a' : '#111827',
          color: '#fff',
          fontWeight: 800,
          fontSize: '1rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginTop: 8,
          transition: 'background .3s ease, box-shadow .3s ease',
          boxShadow: celebrando ? '0 4px 14px rgba(22, 163, 74, .4)' : 'none'
        }}
      >
        {celebrando ? '✓ ¡Todo listo! Tu tienda está actualizada' : '🎉 Listo'}
      </button>
    </div>
  )
}