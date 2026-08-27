import { useEffect, useRef, useState } from 'react'
import { getConfigLocal, updateConfigLocal } from '../services/api'
import { useLocal } from '../context/LocalContext'
import { subirImagenOptimizada, subirBlob } from '../utils/upload'
import { logoOptimizado } from '../utils/image'
import EditorRecorte from '../components/EditorRecorte'
import PanelGuia from '../components/PanelGuia'
import SeccionAcordeon from '../components/SeccionAcordeon'
import { Upload, Trash2, Pencil } from 'lucide-react'
import styles from './ConfigPanel.module.css'

const SLIDE_VACIO = { id: null, imageUrl: '', titulo: '', subtitulo: '' }

export default function ConfigPanel() {
  const { refresh } = useLocal()
  const [nombreLocal, setNombreLocal] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [subiendoLogo, setSubiendoLogo] = useState(false)
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [direccion, setDireccion] = useState('')
  const [envioInfo, setEnvioInfo] = useState('')
  const [facebook, setFacebook] = useState('')
  const [instagram, setInstagram] = useState('')
  const [twitter, setTwitter] = useState('')
  const [youtube, setYoutube] = useState('')
  const [tiktok, setTiktok] = useState('')
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

  // 🎉 Botón "Listo"
  const [celebrando, setCelebrando] = useState(false)

  const completos = {
    1: !!(nombreLocal.trim() && logoUrl),
    2: whatsapp.replace(/\D/g, '').length >= 8,
    3: categoriasWeb.length > 0,
    4: heroSlides.length > 0
  }

  useEffect(() => {
    if (cargando) return
    const primerIncompleto = Object.entries(completos).find(([, ok]) => !ok)?.[0]
    setAbiertos(primerIncompleto ? { [primerIncompleto]: true } : {})
    // eslint-disable-next-line
  }, [cargando])

  const toggle = (n) => setAbiertos(a => ({ ...a, [n]: !a[n] }))
  const siguiente = (n) => setAbiertos(a => ({ ...a, [n]: false, [n + 1]: true }))

  useEffect(() => {
    getConfigLocal().then(({ data }) => {
      if (data) {
        setNombreLocal(data.nombre_local || '')
        setLogoUrl(data.logo_url || '')
        setWhatsapp(data.whatsapp || '')
        setEmail(data.email || '')
        setDireccion(data.direccion || '')
        setEnvioInfo(data.envio_info || '')
        setFacebook(data.facebook || '')
        setInstagram(data.instagram || '')
        setTwitter(data.twitter || '')
        setYoutube(data.youtube || '')
        setTiktok(data.tiktok || '')
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

  useEffect(() => {
    if (!listo.current) return
    setEstadoGuardado('guardando')
    const t = setTimeout(async () => {
      try {
        await updateConfigLocal({
          nombre_local: nombreLocal.trim() || null,
          logo_url: logoUrl || null,
          whatsapp: whatsapp.trim() || null,
          email: email.trim() || null,
          direccion: direccion.trim() || null,
          envio_info: envioInfo.trim() || null,
          facebook: facebook.trim() || null,
          instagram: instagram.trim() || null,
          twitter: twitter.trim() || null,
          youtube: youtube.trim() || null,
          tiktok: tiktok.trim() || null,
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
  }, [nombreLocal, logoUrl, whatsapp, email, direccion, envioInfo,
      facebook, instagram, twitter, youtube, tiktok,
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
        if (!slideForm.imageUrl || slideForm.imageUrl.startsWith('blob:')) return
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

  if (cargando) return <p className={styles.estadoTexto}>Cargando configuración...</p>

  return (
    <div>
      {/* 💾 Indicador de auto-guardado */}
      <div className={styles.estadoRow}>
        {estadoGuardado === 'guardando' && <span className={styles.estadoTexto}>Guardando…</span>}
        {estadoGuardado === 'ok' && <span className={styles.estadoOk}>✓ Guardado</span>}
      </div>

      <PanelGuia
        datos={{
          nombre: nombreLocal,
          logo: logoUrl,
          whatsapp,
          categorias: categoriasWeb.length,
          banners: heroSlides.length
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
        <div className={styles.card}>
          <label className={styles.label}>Nombre del local</label>
          <input
            className={styles.input}
            value={nombreLocal}
            onChange={e => setNombreLocal(e.target.value)}
            placeholder="Ej: Zen Store, Moon Importados..."
          />
          <p className={styles.hint}>Tu marca en el footer y en toda la tienda.</p>
        </div>

        <div className={styles.card}>
          <label className={styles.label}>Logo del local</label>
          <div className={styles.logoRow}>
            {logoUrl ? (
              <img src={logoOptimizado(logoUrl)} alt="logo" className={styles.logoImg} />
            ) : (
              <div className={styles.logoPh}>📦</div>
            )}
            <label className={`${styles.btn} ${styles.btnAuto}`}>
              {subiendoLogo ? 'Subiendo...' : 'Subir logo'}
              <input type="file" accept="image/*" hidden onChange={subirLogo} />
            </label>
            {logoUrl && (
              <button onClick={() => setLogoUrl('')} className={`${styles.btn} ${styles.btnAuto} ${styles.btnRojo}`}>Quitar</button>
            )}
          </div>
          <p className={styles.hint}>Recomendado: PNG cuadrado con fondo transparente.</p>
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
        <div className={styles.card}>
          <label className={styles.label}>💬 WhatsApp de pedidos</label>
          <input className={styles.input} value={whatsapp} onChange={e => setWhatsapp(e.target.value.replace(/\D/g, ''))} placeholder="Ej: 5491158471333" inputMode="numeric" />
          <p className={styles.hint}>Solo números con código de país. Activa el botón verde flotante y el link del footer.</p>
        </div>

        <div className={styles.card}>
          <label className={styles.label}>📍 Datos del footer</label>
          <label className={styles.labelMini}>Email de contacto</label>
          <input className={`${styles.input} ${styles.inputMb}`} value={email} onChange={e => setEmail(e.target.value)} placeholder="ventas@tulocal.com" />
          <label className={styles.labelMini}>Dirección</label>
          <input className={`${styles.input} ${styles.inputMb}`} value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="Av. Córdoba 2773" />
          <label className={styles.labelMini}>Info de envíos</label>
          <input className={styles.input} value={envioInfo} onChange={e => setEnvioInfo(e.target.value)} placeholder="Ej: Correo Argentino · Gratis desde $150.000" />
        </div>

        <div className={styles.card}>
          <label className={styles.label}>📱 Redes sociales (opcional)</label>
          <p className={styles.hintLista}>Usuario (ej: @tulocal) o URL completa. Aparecen como íconos en el footer.</p>
          <label className={styles.labelMini}>Facebook</label>
          <input className={`${styles.input} ${styles.inputMb}`} value={facebook} onChange={e => setFacebook(e.target.value)} placeholder="@tulocal" />
          <label className={styles.labelMini}>Instagram</label>
          <input className={`${styles.input} ${styles.inputMb}`} value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@tulocal" />
          <label className={styles.labelMini}>Twitter / X</label>
          <input className={`${styles.input} ${styles.inputMb}`} value={twitter} onChange={e => setTwitter(e.target.value)} placeholder="@tulocal" />
          <label className={styles.labelMini}>YouTube</label>
          <input className={`${styles.input} ${styles.inputMb}`} value={youtube} onChange={e => setYoutube(e.target.value)} placeholder="@tulocal" />
          <label className={styles.labelMini}>TikTok</label>
          <input className={styles.input} value={tiktok} onChange={e => setTiktok(e.target.value)} placeholder="@tulocal" />
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
        <div className={styles.card}>
          <label className={styles.label}>Categorías del catálogo</label>
          <p className={styles.hintChips}>
            Son las cards grandes de la home y el menú. Recomendado: 4 o 5.
            Ej: si vendés sahumerios → "Sahumerios", "Deco", "Regalos".
          </p>
          <div className={styles.chipsRow}>
            {categoriasWeb.map(c => (
              <span key={c} className={styles.chip}>
                {c}
                <button onClick={() => quitarCat(c)} className={styles.chipX}>×</button>
              </span>
            ))}
          </div>
          <div className={styles.catAddRow}>
            <input className={`${styles.input} ${styles.flex1}`} value={nuevoCat} onChange={e => setNuevoCat(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); agregarCat(); } }} placeholder="Agregar (ej: Mujer)" />
            <button onClick={agregarCat} className={`${styles.btn} ${styles.btnMas}`}>+</button>
          </div>
        </div>

        <div className={styles.card}>
          <label className={styles.label}>🎨 Foto de cada card</label>
          <p className={styles.hintBanner}>
            Cada categoría puede tener su foto con efecto al pasar el mouse.
            Sin foto, se muestra un degradado de color.
          </p>
          {categoriasWeb.length === 0 && <p className={styles.vacioTexto}>Agregá categorías arriba primero.</p>}
          {categoriasWeb.map(cat => (
            <div key={cat} className={`${styles.row} ${styles.rowFondo}`}>
              {secImages[cat] ? (
                <img src={secImages[cat]} alt="" className={styles.thumbImg} />
              ) : (
                <div className={styles.thumbPh}>🎨</div>
              )}
              <span className={styles.catNombre}>{cat}</span>
              <label className={`${styles.btn} ${styles.btnMini}`}>
                {secImages[cat] ? 'Cambiar' : 'Subir'}
                <input type="file" accept="image/*" hidden onChange={subirImgSec(cat)} />
              </label>
              {secImages[cat] && (
                <button onClick={() => quitarImgSec(cat)} className={`${styles.chipX} ${styles.chipXRojo}`}>×</button>
              )}
            </div>
          ))}
        </div>
      </SeccionAcordeon>

      {/* ---------- PASO 4 · BANNER DE LA HOME ---------- */}
      <SeccionAcordeon
        numero={4}
        titulo="Banner de la home"
        abierto={!!abiertos[4]}
        onToggle={() => toggle(4)}
        completo={completos[4]}
        preview={heroSlides.length ? `${heroSlides.length} slide${heroSlides.length > 1 ? 's' : ''}` : 'Sin banner'}
      >
        <div className={styles.card}>
          <label className={styles.label}>🖼️ Banner (hasta 3 slides)</label>
          <p className={styles.hintBanner}>
            La portada de tu tienda. Subí una foto, arrastrá para encuadrar,
            poné título y subtítulo. Sin banner, se muestra uno por defecto.
          </p>

          {heroSlides.map(sl => (
            <div key={sl.id} className={`${styles.row} ${styles.rowFondo}`}>
              {sl.imageUrl.startsWith('blob:') ? (
                <div className={styles.thumbPh}>🌆</div>
              ) : (
                <img src={sl.imageUrl} alt="" className={styles.thumbImg} />
              )}
              <div className={styles.slideInfo}>
                <p className={styles.slideTitulo}>{sl.titulo || 'Solo imagen'}</p>
                <p className={styles.slideSub}>{sl.subtitulo}</p>
              </div>
              <button onClick={() => editarSlide(sl)} className={`${styles.iconBtn} ${styles.iconBtnAzul}`} title="Editar"><Pencil size={15} /></button>
              <button onClick={() => quitarSlide(sl.id)} className={`${styles.iconBtn} ${styles.iconBtnRojo}`} title="Quitar"><Trash2 size={15} /></button>
            </div>
          ))}

          {(heroSlides.length < 3 || slideForm.id) && (
            <div className={styles.formSlide}>
              <div className={styles.slideThumbRow}>
                {slideForm.imageUrl && !slideForm.imageUrl.startsWith('blob:') ? (
                  <img src={slideForm.imageUrl} alt="" className={styles.thumbSlideImg} />
                ) : (
                  <div className={styles.thumbSlidePh}>🌆</div>
                )}
                <label className={`${styles.btn} ${styles.btnAuto}`}>
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

              <input className={`${styles.input} ${styles.inputSlide}`} value={slideForm.titulo} onChange={e => setSlideForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Título (opcional, ej: Nueva temporada)" />
              <input className={`${styles.input} ${styles.inputMb}`} value={slideForm.subtitulo} onChange={e => setSlideForm(f => ({ ...f, subtitulo: e.target.value }))} placeholder="Subtítulo (opcional)"/>
                            <button onClick={salvarSlide} disabled={!slideForm.imageUrl || slideForm.imageUrl.startsWith('blob:')} className={styles.btn}>
                {slideForm.id ? 'Actualizar slide' : '+ Agregar slide'}
              </button>
              {slideForm.id && (
                <button onClick={() => setSlideForm(SLIDE_VACIO)} className={styles.btnCancelar}>
                  Cancelar edición
                </button>
              )}
            </div>
          )}
        </div>
      </SeccionAcordeon>

      {/* 🎉 Botón de cierre emocional */}
      <button
        onClick={() => {
          setCelebrando(true)
          setTimeout(() => setCelebrando(false), 2500)
        }}
        className={`${styles.listoBtn} ${celebrando ? styles.listoBtnOk : ''}`}
      >
        {celebrando ? '✓ ¡Todo listo! Tu tienda está actualizada' : '🎉 Listo'}
      </button>
    </div>
  )
}