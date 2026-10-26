import { useEffect, useState } from 'react'
import { Check, X, Upload, Trash2, ArrowLeft, Pencil, Save, Store, Palette, Megaphone, Search, DollarSign, SlidersHorizontal, FolderInput, Flame } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getPendientesWeb, getPublicadosWeb,
  aprobarProductoWeb, rechazarProductoWeb, quitarDeWeb,
  aprobarMasivoWeb, editarPublicadoWeb,
  setOfertaMasivoWeb, quitarOfertaMasivoWeb
} from '../services/api'
import { optimizeImage } from '../utils/image'
import { useLocal } from '../context/LocalContext'
import ConfigPanel from '../components/ConfigPanel'
import MarketingPanel from '../components/MarketingPanel'
import styles from './Admin.module.css'
import { useSearchParams } from 'react-router-dom'

const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

// precio psicológico: $1.000 → $999
const psico = (n) => (n <= 0 ? n : Math.ceil(n / 10) * 10 - 1)

// atajos de promo
const ATAJOS = [
  { label: '-10%', modo: 'bajaPct', val: 10 },
  { label: '-20%', modo: 'bajaPct', val: 20 },
  { label: '-30%', modo: 'bajaPct', val: 30 },
  { label: '-$1.000', modo: 'bajaMonto', val: 1000 },
  { label: '-$5.000', modo: 'bajaMonto', val: 5000 }
]

// 🔥 motivos de oferta (los chips que ve el cliente)
const MOTIVOS_OFERTA = ['Liquidación', 'Único talle', 'Falla imperceptible', 'Oferta del mes']

export default function Admin() {
  const { config } = useLocal()

  // 🔒 URL sync: las tabs viven en la URL (anti-remount)
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [vista, setVista] = useState(
    ['config', 'marketing'].includes(tabParam) ? tabParam : 'productos'
  )
  const [subtab, setSubtab] = useState(
    tabParam === 'pendientes' ? 'entrantes' : tabParam === 'publicados' ? 'publicados' : 'todos'
  )

  // helper: cambia vista + URL en un solo paso
  const irA = (v) => {
    setVista(v)
    const p = new URLSearchParams(searchParams)
    if (v === 'productos') p.delete('tab')
    else p.set('tab', v)
    setSearchParams(p, { replace: true })
  }

  const [pendientes, setPendientes] = useState([])
  const [publicados, setPublicados] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ descripcion: '', precioWeb: '', destacado: false, fotos: [], webCategoria: '', ofertaMotivo: '' })
  const [subiendo, setSubiendo] = useState(false)
  const [quitando, setQuitando] = useState(null)
  const [rechazando, setRechazando] = useState(null)
  const [notaRechazo, setNotaRechazo] = useState('')
  const [filtroCat, setFiltroCat] = useState('')
  const [seleccion, setSeleccion] = useState([])
  const [catDestino, setCatDestino] = useState('')
  const [descMasiva, setDescMasiva] = useState('')
  const [aprobandoMasivo, setAprobandoMasivo] = useState(false)
  const [quitandoMasivo, setQuitandoMasivo] = useState(false)
  const [confirmandoQuitarMasivo, setConfirmandoQuitarMasivo] = useState(false)
  const [operandoMasivo, setOperandoMasivo] = useState(false)

  // 💰 modal de precio masivo (4 modos + atajos)
  const [modalPrecio, setModalPrecio] = useState(false)
  const [modoPrecio, setModoPrecio] = useState('bajaMonto')
  const [pctPrecio, setPctPrecio] = useState(10)
  const [montoPrecio, setMontoPrecio] = useState(5000)

  // 🔥 modal de oferta masiva
  const [modalOferta, setModalOferta] = useState(false)
  const [ofertaMotivo, setOfertaMotivo] = useState('Liquidación')
  const [ofertaTexto, setOfertaTexto] = useState('')
  const [ofertaPrecio, setOfertaPrecio] = useState('')
  const [operandoOferta, setOperandoOferta] = useState(false)

  // 📱 bottom sheet de acciones (mobile)
  const [sheetAbierto, setSheetAbierto] = useState(false)

  const cargar = async () => {
    setLoading(true)
    try {
      const [p, g] = await Promise.all([getPendientesWeb(), getPublicadosWeb()])
      setPendientes(p.data || [])
      setPublicados(g.data || [])
    } catch (err) {
      console.error('Error cargando admin:', err)
    }
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])
  useEffect(() => { setSeleccion([]) }, [subtab, vista])

  // ── lista unificada con estado + sort por destacados ──
  const conEstado = [
    ...publicados.map(p => ({ ...p, _estado: 'publicado' })),
    ...pendientes.map(p => ({ ...p, _estado: 'entrante' }))
  ].sort((a, b) => (b.web_destacado ? 1 : 0) - (a.web_destacado ? 1 : 0))

  const listaBase =
    subtab === 'publicados' ? conEstado.filter(p => p._estado === 'publicado') :
    subtab === 'entrantes' ? conEstado.filter(p => p._estado === 'entrante') :
    conEstado

  const catsLibres = [...new Set(pendientes.map(p => (p.categoria || '').trim()).filter(Boolean))]
  const listaCat =
    subtab === 'entrantes' && filtroCat
      ? listaBase.filter(p => (p.categoria || '').toLowerCase() === filtroCat.toLowerCase())
      : listaBase

  const lista = busqueda.trim()
    ? listaCat.filter(p => (p.nombre || '').toLowerCase().includes(busqueda.trim().toLowerCase()))
    : listaCat

  // ── selección ──
  const toggleSel = (id) => setSeleccion(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  const toggleTodos = () => {
    const ids = lista.map(p => p.id)
    const todosSel = ids.length > 0 && ids.every(id => seleccion.includes(id))
    if (todosSel) setSeleccion(seleccion.filter(id => !ids.includes(id)))
    else setSeleccion([...new Set([...seleccion, ...ids])])
  }

  const selItems = conEstado.filter(p => seleccion.includes(p.id))
  const selEntrantes = selItems.filter(p => p._estado === 'entrante')
  const selPublicados = selItems.filter(p => p._estado === 'publicado')

  // ── lógica de precio masivo ──
  const precioActual = (p) => (p.web_precio != null ? Number(p.web_precio) : Number(p.precio || 0))

  const calcPrecio = (base) => {
    if (modoPrecio === 'sube') return Math.round(base * (1 + (Number(pctPrecio) || 0) / 100))
    if (modoPrecio === 'bajaPct') return Math.round(base * (1 - (Number(pctPrecio) || 0) / 100))
    if (modoPrecio === 'bajaMonto') return Math.max(0, base - (Number(montoPrecio) || 0))
    return psico(base)
  }

  const previewPrecio = selPublicados.slice(0, 5).map(p => ({
    nombre: p.nombre,
    antes: precioActual(p),
    despues: calcPrecio(precioActual(p))
  }))

  const totalAntes = selPublicados.reduce((s, p) => s + precioActual(p), 0)
  const totalDespues = selPublicados.reduce((s, p) => s + calcPrecio(precioActual(p)), 0)
  const diffTotal = totalDespues - totalAntes

  const todosDestacados = selPublicados.length > 0 && selPublicados.every(p => p.web_destacado)

  const aplicarPrecioMasivo = async () => {
    setOperandoMasivo(true)
    try {
      await Promise.all(selPublicados.map(p =>
        editarPublicadoWeb(p.id, { precioWeb: calcPrecio(precioActual(p)) })
      ))
      toast.success(`Precio actualizado en ${selPublicados.length} productos`)
      setModalPrecio(false)
      setSeleccion([])
      cargar()
    } catch (err) { toast.error('Error de precio masivo: ' + err.message) }
    setOperandoMasivo(false)
  }

  // 🔥 OFERTAS: poner la gorra en lote
  const ponerOfertaMasivo = async () => {
    setOperandoOferta(true)
    try {
      await setOfertaMasivoWeb(selPublicados.map(p => p.id), {
        motivo: ofertaTexto.trim() || ofertaMotivo,
        precioWeb: ofertaPrecio === '' ? undefined : Number(ofertaPrecio)
      })
      toast.success(`🔥 ${selPublicados.length} productos en la shelf de Ofertas`)
      setModalOferta(false)
      setOfertaTexto('')
      setOfertaPrecio('')
      setSeleccion([])
      cargar()
    } catch (err) { toast.error('Error al poner en oferta: ' + err.message) }
    setOperandoOferta(false)
  }

  const quitarOfertaMasivo = async () => {
    setOperandoMasivo(true)
    try {
      await quitarOfertaMasivoWeb(selPublicados.map(p => p.id))
      toast.success(`Se quitó la oferta de ${selPublicados.length} productos`)
      setSeleccion([])
      cargar()
    } catch (err) { toast.error('Error al quitar oferta: ' + err.message) }
    setOperandoMasivo(false)
  }

  const cambiarCatMasiva = async (cat) => {
    if (!cat) return
    setOperandoMasivo(true)
    try {
      await Promise.all(selPublicados.map(p => editarPublicadoWeb(p.id, { webCategoria: cat })))
      toast.success(`${selPublicados.length} productos movidos a ${cat}`)
      setSeleccion([])
      cargar()
    } catch (err) { toast.error('Error de categoría: ' + err.message) }
    setOperandoMasivo(false)
  }

  const aprobarMasivo = async () => {
    if (!catDestino) return toast('Elegí a qué categoría mandarlos', { icon: '⚠️' })
    setAprobandoMasivo(true)
    try {
      await aprobarMasivoWeb(selEntrantes.map(p => p.id), { webCategoria: catDestino, descripcion: descMasiva })
      toast.success(`${selEntrantes.length} productos publicados en ${catDestino}`)
      setSeleccion([])
      setCatDestino('')
      setDescMasiva('')
      cargar()
    } catch (err) { toast.error('Error en aprobación masiva: ' + err.message) }
    setAprobandoMasivo(false)
  }

  const quitarMasivo = async () => {
    setQuitandoMasivo(true)
    try {
      await Promise.all(selPublicados.map(p => quitarDeWeb(p.id)))
      toast.success(`${selPublicados.length} productos quitados de la web`)
      setSeleccion([])
      setConfirmandoQuitarMasivo(false)
      cargar()
    } catch (err) { toast.error('Error al quitar masivo: ' + err.message) }
    setQuitandoMasivo(false)
  }

  // ── fotos / edición individual ──
  const subirFoto = async (file) => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', PRESET)
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method: 'POST', body: fd })
      const data = await res.json()
      return data.secure_url
    } catch (err) {
      console.error('Error subiendo foto:', err)
      return null
    }
  }

  const handleFile = async (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    if (form.fotos.length >= 3) return toast('Máximo 3 fotos extra', { icon: '⚠️' })
    setSubiendo(true)
    const url = await subirFoto(file)
    if (url) setForm(f => ({ ...f, fotos: [...f.fotos, url] }))
    setSubiendo(false)
  }

  const abrirEdicion = (p) => {
    setEditando(p)
    setForm({
      descripcion: p.web_descripcion || '',
      precioWeb: p.web_precio != null ? String(p.web_precio) : '',
      destacado: p.web_destacado || false,
      fotos: p.web_fotos || [],
      webCategoria: p.web_categoria || '',
      ofertaMotivo: p.web_oferta_motivo || ''
    })
  }

  const aprobar = async () => {
    if (!form.webCategoria) { toast('Elegí una categoría para publicar', { icon: '⚠️' }); return }
    try {
      await aprobarProductoWeb(editando.id, {
        descripcion: form.descripcion, fotos: form.fotos,
        destacado: form.destacado,
        precioWeb: form.precioWeb === '' ? null : Number(form.precioWeb),
        webCategoria: form.webCategoria,
        ofertaMotivo: form.destacado ? (form.ofertaMotivo || null) : null
      })
      setEditando(null)
      cargar()
      toast.success('¡Publicado!')
    } catch (err) { toast.error('Error al aprobar: ' + err.message) }
  }

  const guardarEdicion = async () => {
    if (!form.webCategoria) { toast('Elegí una categoría para publicar', { icon: '⚠️' }); return }
    try {
      await editarPublicadoWeb(editando.id, {
        descripcion: form.descripcion, fotos: form.fotos,
        destacado: form.destacado,
        precioWeb: form.precioWeb === '' ? null : Number(form.precioWeb),
        webCategoria: form.webCategoria,
        ofertaMotivo: form.destacado ? (form.ofertaMotivo || null) : null
      })
      setEditando(null)
      cargar()
      toast.success('Cambios guardados')
    } catch (err) { toast.error('Error al guardar: ' + err.message) }
  }

  const confirmarRechazo = async () => {
    if (!notaRechazo.trim()) return toast('Escribí el motivo del rechazo', { icon: '⚠️' })
    try {
      await rechazarProductoWeb(rechazando.id, notaRechazo.trim())
      setRechazando(null)
      setNotaRechazo('')
      cargar()
      toast.success('Rechazo enviado al local')
    } catch (err) { toast.error('Error al rechazar: ' + err.message) }
  }

  const confirmarQuitar = async () => {
    try {
      await quitarDeWeb(quitando.id)
      setQuitando(null)
      cargar()
      toast.success('Producto quitado de la web')
    } catch (err) { toast.error('Error al quitar: ' + err.message) }
  }

  // ── tabs principales (3) con URL sync ──
  const renderTabs = () => (
    <div className={styles.tabsGrid}>
      <button className={`${styles.tab} ${vista === 'productos' ? styles.tabActiva : ''}`} onClick={() => irA('productos')}>
        <Store size={15} /> Administrar productos
        {pendientes.length > 0 && <span className={styles.tabBadge}>{pendientes.length}</span>}
      </button>
      <button className={`${styles.tab} ${vista === 'config' ? styles.tabActiva : ''}`} onClick={() => irA('config')}>
        <Palette size={15} /> Mi tienda
      </button>
      <button className={`${styles.tab} ${vista === 'marketing' ? styles.tabActiva : ''}`} onClick={() => irA('marketing')}>
        <Megaphone size={15} /> Marketing
      </button>
    </div>
  )

  // ── vista de edición individual ──
  if (editando) {
    const esEdicion = editando._estado === 'publicado' || editando.web_estado === 'publicado'
    return (
      <div className={styles.wrap}>
        <button className={styles.volver} onClick={() => setEditando(null)}>
          <ArrowLeft size={16} /> Volver
        </button>
        <h2 className={styles.titulo}>{esEdicion ? 'Editar' : 'Aprobar'}: {editando.nombre}</h2>

        <div className={styles.fotoPrincipal}>
          <img src={optimizeImage(editando.imagen_url, 600)} alt={editando.nombre} />
        </div>

        <label className={styles.label}>Sección de la Tienda (obligatoria) *</label>
        {(config.categoriasWeb || []).length > 0 ? (
          <select className={styles.input} value={form.webCategoria} onChange={e => setForm({ ...form, webCategoria: e.target.value })}>
            <option value="">Elegí dónde va...</option>
            {(config.categoriasWeb || []).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        ) : (
          <p className={styles.errorTexto}>
            No hay secciones creadas. Crealas en 🎨 Mi Tienda → "Categorías del Catálogo".
          </p>
        )}

        <label className={styles.label}>Descripción para la web</label>
        <textarea
          className={styles.textarea} rows={4} value={form.descripcion}
          onChange={e => setForm({ ...form, descripcion: e.target.value })}
          placeholder="Contale al cliente lo lindo de este producto..."
        />

        <div className={styles.fila}>
          <div className={styles.mitad}>
            <label className={styles.label}>Precio web (opcional)</label>
            <input className={styles.input} type="number" value={form.precioWeb}
              onChange={e => setForm({ ...form, precioWeb: e.target.value })}
              placeholder={`Usar $${Number(editando.precio).toLocaleString('es-AR')}`}
            />
          </div>
          <div className={styles.mitad}>
            <label className={styles.check}>
              <input type="checkbox" checked={form.destacado} onChange={e => setForm({ ...form, destacado: e.target.checked, ofertaMotivo: e.target.checked ? form.ofertaMotivo : '' })} />
              🔥 En oferta (shelf + chips en la vidriera)
            </label>
          </div>
        </div>

        {form.destacado && (
          <>
            <label className={styles.label}>Motivo de la oferta</label>
            <select className={styles.input} value={form.ofertaMotivo} onChange={e => setForm({ ...form, ofertaMotivo: e.target.value })}>
              <option value="">Sin motivo (solo gorra)</option>
              {MOTIVOS_OFERTA.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </>
        )}

        <label className={styles.label}>Fotos extra (máx. 3)</label>
        <div className={styles.fotosRow}>
          {form.fotos.map((f, i) => (
            <div key={i} className={styles.fotoExtra}>
              <img src={optimizeImage(f, 150)} alt={`extra ${i + 1}`} />
              <button className={styles.fotoBorrar}
                onClick={() => setForm(f2 => ({ ...f2, fotos: f2.fotos.filter((_, j) => j !== i) }))}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          {form.fotos.length < 3 && (
            <label className={styles.fotoAdd}>
              <Upload size={18} />
              {subiendo ? 'Subiendo...' : 'Agregar'}
              <input type="file" accept="image/*" hidden onChange={handleFile} />
            </label>
          )}
        </div>

        {esEdicion ? (
          <button className={styles.aprobarBtn} onClick={guardarEdicion}>
            <Save size={18} /> Guardar cambios
          </button>
        ) : (
          <button className={styles.aprobarBtn} onClick={aprobar}>
            <Check size={18} /> Aprobar y publicar
          </button>
        )}
      </div>
    )
  }

  if (vista === 'marketing') {
    return (
      <div className={styles.wrap}>
        <h2 className={styles.titulo}>Panel del dueño</h2>
        {renderTabs()}
        <div className={styles.contenidoTab}><MarketingPanel /></div>
      </div>
    )
  }

  if (vista === 'config') {
    return (
      <div className={styles.wrap}>
        <h2 className={styles.titulo}>Panel del dueño</h2>
        {renderTabs()}
        <div className={styles.contenidoTab}><ConfigPanel /></div>
      </div>
    )
  }

  // ── VISTA PRODUCTOS UNIFICADA ──
  return (
    <div className={`${styles.wrap} ${seleccion.length > 0 ? styles.wrapConBarra : ''}`}>
      <h2 className={styles.titulo}>Panel del dueño</h2>
      {renderTabs()}

      {/* segmented: Todos / Publicados / Entrantes */}
      <div className={styles.segmented}>
        <button className={`${styles.segBtn} ${subtab === 'todos' ? styles.segBtnActivo : ''}`} onClick={() => setSubtab('todos')}>
          Todos ({conEstado.length})
        </button>
        <button className={`${styles.segBtn} ${subtab === 'publicados' ? styles.segBtnActivo : ''}`} onClick={() => setSubtab('publicados')}>
          Publicados ({publicados.length})
        </button>
        <button className={`${styles.segBtn} ${subtab === 'entrantes' ? styles.segBtnActivo : ''}`} onClick={() => setSubtab('entrantes')}>
          Entrantes ({pendientes.length})
          {pendientes.length > 0 && <span className={styles.segBadge}>{pendientes.length}</span>}
        </button>
      </div>

      {/* toolbar: búsqueda + filtro categoría + marcar todos */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre..."
          />
        </div>
        {subtab === 'entrantes' && catsLibres.length > 0 && (
          <select className={`${styles.input} ${styles.toolbarSelect}`} value={filtroCat}
            onChange={e => { setFiltroCat(e.target.value); setSeleccion([]) }}>
            <option value="">Todas las categorías ({pendientes.length})</option>
            {catsLibres.map(c => {
              const n = pendientes.filter(p => (p.categoria || '').toLowerCase() === c.toLowerCase()).length
              return <option key={c} value={c}>{c} ({n})</option>
            })}
          </select>
        )}
        {lista.length > 0 && (
          <button onClick={toggleTodos} className={styles.btnSecundario}>
            {lista.every(p => seleccion.includes(p.id)) ? 'Desmarcar todos' : 'Marcar todos'}
          </button>
        )}
      </div>

      {loading ? (
        <p className={styles.vacio}>Cargando...</p>
      ) : lista.length === 0 ? (
        <p className={styles.vacio}>
          {busqueda ? `Sin resultados para "${busqueda}"` :
           subtab === 'entrantes' ? 'No hay productos esperando aprobación 🎉' :
           subtab === 'publicados' ? 'Todavía no publicaste nada.' :
           'No hay productos todavía.'}
        </p>
      ) : (
        <div className={styles.lista}>
          {lista.map(p => {
            const estaSel = seleccion.includes(p.id)
            return (
              <div key={`${p._estado}-${p.id}`} className={`${styles.item} ${estaSel ? styles.itemSel : ''}`}>
                <label className={styles.checkItem}>
                  <input type="checkbox" checked={estaSel} onChange={() => toggleSel(p.id)} />
                </label>
                <img src={optimizeImage(p.imagen_url, 150)} alt={p.nombre} className={styles.itemImg} />
                <div className={styles.itemInfo}>
                  <p className={styles.itemNombre}>
                    {p.nombre}
                    {p.web_destacado && <Flame size={12} className={styles.starChip} fill="currentColor" />}
                  </p>
                  <p className={styles.itemMeta}>{p.categoria} · ${Number(p.precio).toLocaleString('es-AR')} · stock {p.stock}</p>
                  <span className={`${styles.estadoChip} ${p._estado === 'publicado' ? styles.chipVerde : styles.chipAmbar}`}>
                    {p._estado === 'publicado' ? 'Publicado' : 'Entrante'}
                    {p._estado === 'publicado' && p.web_categoria ? ` · ${p.web_categoria}` : ''}
                    {p.web_destacado && p.web_oferta_motivo ? ` · 🔥 ${p.web_oferta_motivo}` : ''}
                  </span>
                </div>
                <div className={styles.itemAcciones}>
                  {p._estado === 'entrante' ? (
                    <>
                      <button className={styles.btnAprobar} onClick={() => abrirEdicion(p)} title="Aprobar y enriquecer"><Check size={16} /></button>
                      <button className={styles.btnRechazar} onClick={() => { setRechazando(p); setNotaRechazo('') }} title="Rechazar con nota"><X size={16} /></button>
                    </>
                  ) : (
                    <>
                      <button className={styles.btnAprobar} onClick={() => abrirEdicion(p)} title="Editar"><Pencil size={16} /></button>
                      <button className={styles.btnQuitar} onClick={() => setQuitando(p)} title="Quitar de la web"><X size={16} /></button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── BARRA MASIVA v4: contador + Acciones (mobile) / inline (desktop) ── */}
      {seleccion.length > 0 && (
        <div className={styles.barraMasiva}>
          <div className={styles.barraTop}>
            <span className={styles.barraContador}>
              {seleccion.length} seleccionado{seleccion.length === 1 ? '' : 's'}
            </span>
            <div className={styles.barraTopDer}>
              <button onClick={() => setSeleccion([])} className={styles.btnLimpiar}>Limpiar</button>
              <button onClick={() => setSheetAbierto(true)} className={styles.btnAcciones}>
                <SlidersHorizontal size={16} /> Acciones
              </button>
            </div>
          </div>

          {/* inline: SOLO desktop */}
          <div className={styles.barraAccionesDesktop}>
            {selEntrantes.length > 0 && (
              <>
                <select className={`${styles.input} ${styles.barraSelect}`} value={catDestino}
                  onChange={e => setCatDestino(e.target.value)}>
                  <option value="">Mandar a...</option>
                  {(config.categoriasWeb || []).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button onClick={aprobarMasivo} disabled={aprobandoMasivo} className={styles.btnVerde}>
                  <Check size={16} /> Publicar {selEntrantes.length}
                </button>
              </>
            )}
            {selPublicados.length > 0 && (
              <>
                <button onClick={() => setModalPrecio(true)} className={styles.btnBulk}>
                  <DollarSign size={14} /> Cambiar precio
                </button>
                {todosDestacados ? (
                  <button onClick={quitarOfertaMasivo} disabled={operandoMasivo} className={styles.btnBulk}>
                    <Flame size={14} /> Quitar oferta
                  </button>
                ) : (
                  <button onClick={() => setModalOferta(true)} className={styles.btnBulk}>
                    <Flame size={14} /> Poner en oferta
                  </button>
                )}
                <select className={`${styles.input} ${styles.barraSelect}`} value=""
                  onChange={e => cambiarCatMasiva(e.target.value)}>
                  <option value="">Mover a sección...</option>
                  {(config.categoriasWeb || []).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button onClick={() => setConfirmandoQuitarMasivo(true)} className={styles.btnRojoMasivo}>
                  <Trash2 size={16} /> Quitar de la web
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── BOTTOM SHEET DE ACCIONES (mobile) ── */}
      {sheetAbierto && (
        <div className={styles.sheetOverlay} onClick={() => setSheetAbierto(false)}>
          <div className={styles.sheet} onClick={e => e.stopPropagation()}>
            <div className={styles.sheetManija} />
            <p className={styles.sheetTitulo}>
              {seleccion.length} seleccionado{seleccion.length === 1 ? '' : 's'}
            </p>

            {selEntrantes.length > 0 && (
              <div className={styles.sheetRow}>
                <select className={`${styles.input} ${styles.sheetSelect}`} value={catDestino}
                  onChange={e => setCatDestino(e.target.value)}>
                  <option value="">Mandar a...</option>
                  {(config.categoriasWeb || []).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button onClick={() => { aprobarMasivo(); setSheetAbierto(false) }}
                  disabled={aprobandoMasivo} className={styles.btnVerde}>
                  <Check size={16} /> Publicar {selEntrantes.length}
                </button>
              </div>
            )}

            {selPublicados.length > 0 && (
              <>
                <button className={styles.sheetItem} onClick={() => { setSheetAbierto(false); setModalPrecio(true) }}>
                  <DollarSign size={18} />
                  <div>
                    <p>Cambiar precio</p>
                    <span>Monto fijo, % o psicológico, con preview</span>
                  </div>
                </button>
                {todosDestacados ? (
                  <button className={styles.sheetItem} onClick={() => { quitarOfertaMasivo(); setSheetAbierto(false) }}>
                    <Flame size={18} />
                    <div>
                      <p>Quitar oferta</p>
                      <span>Saca la gorra 🔥 y los chips de la vidriera</span>
                    </div>
                  </button>
                ) : (
                  <button className={styles.sheetItem} onClick={() => { setSheetAbierto(false); setModalOferta(true) }}>
                    <Flame size={18} />
                    <div>
                      <p>Poner en oferta</p>
                      <span>Va a la shelf 🔥 Ofertas con su motivo</span>
                    </div>
                  </button>
                )}
                <div className={styles.sheetItem}>
                  <FolderInput size={18} />
                  <div className={styles.sheetItemTexto}>
                    <p>Mover a sección</p>
                    <select className={`${styles.input} ${styles.sheetSelect}`} value=""
                      onChange={e => { cambiarCatMasiva(e.target.value); setSheetAbierto(false) }}>
                      <option value="">Elegí sección...</option>
                      {(config.categoriasWeb || []).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className={styles.sheetDivider} />
                <button className={`${styles.sheetItem} ${styles.sheetItemRojo}`}
                  onClick={() => { setSheetAbierto(false); setConfirmandoQuitarMasivo(true) }}>
                  <Trash2 size={18} />
                  <div>
                    <p>Quitar de la web</p>
                    <span>Deja de verse en tu tienda (podés reenviarlo después)</span>
                  </div>
                </button>
              </>
            )}

            <button className={styles.sheetCancel} onClick={() => setSheetAbierto(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* ── MODAL DE PRECIO MASIVO (4 modos + atajos + preview con total) ── */}
      {modalPrecio && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <p className={styles.modalTexto}>Cambiar precio de {selPublicados.length} producto{selPublicados.length === 1 ? '' : 's'}</p>
            <p className={styles.modalSub}>Elegí la regla y mirá el preview antes de aplicar.</p>

            <div className={styles.precioModos}>
              <label className={styles.radioRow}>
                <input type="radio" checked={modoPrecio === 'bajaMonto'} onChange={() => setModoPrecio('bajaMonto')} />
                <span className={styles.radioLabel}>Bajar</span>
                <span className={styles.pesoSigno}>$</span>
                <input type="number" min="0" className={styles.montoInput} value={montoPrecio}
                  onChange={e => setMontoPrecio(e.target.value)} disabled={modoPrecio !== 'bajaMonto'}
                  placeholder="Ej: 5.000" />
                <span className={styles.radioLabel}>por producto</span>
              </label>
              <label className={styles.radioRow}>
                <input type="radio" checked={modoPrecio === 'bajaPct'} onChange={() => setModoPrecio('bajaPct')} />
                <span className={styles.radioLabel}>Bajar</span>
                <input type="number" min="1" max="90" className={styles.pctInput} value={pctPrecio}
                  onChange={e => setPctPrecio(e.target.value)} disabled={modoPrecio !== 'bajaPct'} />
                <span className={styles.radioLabel}>% por producto</span>
              </label>
              <label className={styles.radioRow}>
                <input type="radio" checked={modoPrecio === 'sube'} onChange={() => setModoPrecio('sube')} />
                <span className={styles.radioLabel}>Subir</span>
                <input type="number" min="1" max="500" className={styles.pctInput} value={pctPrecio}
                  onChange={e => setPctPrecio(e.target.value)} disabled={modoPrecio !== 'sube'} />
                <span className={styles.radioLabel}>% por producto</span>
              </label>
              <label className={styles.radioRow}>
                <input type="radio" checked={modoPrecio === 'psico'} onChange={() => setModoPrecio('psico')} />
                <span className={styles.radioLabel}>Redondear a precio psicológico (termina en 9)</span>
              </label>
            </div>

            <div className={styles.chipsAtajos}>
              {ATAJOS.map(a => {
                const activo = modoPrecio === a.modo &&
                  ((a.modo === 'bajaPct' && Number(pctPrecio) === a.val) ||
                   (a.modo === 'bajaMonto' && Number(montoPrecio) === a.val))
                return (
                  <button key={a.label} type="button"
                    className={`${styles.chipAtajo} ${activo ? styles.chipAtajoActivo : ''}`}
                    onClick={() => {
                      setModoPrecio(a.modo)
                      if (a.modo === 'bajaPct') setPctPrecio(a.val)
                      else setMontoPrecio(a.val)
                    }}>
                    {a.label}
                  </button>
                )
              })}
            </div>

            <div className={styles.previewPrecio}>
              {previewPrecio.map((row, i) => {
                const diff = row.despues - row.antes
                return (
                  <div key={i} className={styles.previewRow}>
                    <span className={styles.previewNombre}>{row.nombre}</span>
                    <span className={styles.previewAntes}>${row.antes.toLocaleString('es-AR')}</span>
                    <span className={styles.previewFlecha}>→</span>
                    <span className={styles.previewDespues}>${row.despues.toLocaleString('es-AR')}</span>
                    <span className={`${styles.previewDiff} ${diff === 0 ? styles.diffNeutro : diff > 0 ? styles.diffUp : styles.diffDown}`}>
                      {diff === 0 ? '=' : `${diff > 0 ? '+' : ''}${diff.toLocaleString('es-AR')}`}
                    </span>
                  </div>
                )
              })}
              {selPublicados.length > 5 && (
                <p className={styles.previewMas}>...y {selPublicados.length - 5} más</p>
              )}
              <div className={styles.previewTotal}>
                <span>Total</span>
                <span className={styles.previewAntes}>${totalAntes.toLocaleString('es-AR')}</span>
                <span className={styles.previewFlecha}>→</span>
                <span className={styles.previewDespues}>${totalDespues.toLocaleString('es-AR')}</span>
                <span className={`${styles.previewDiff} ${diffTotal === 0 ? styles.diffNeutro : diffTotal > 0 ? styles.diffUp : styles.diffDown}`}>
                  {diffTotal === 0 ? '=' : `${diffTotal > 0 ? '+' : ''}${diffTotal.toLocaleString('es-AR')}`}
                </span>
              </div>
            </div>

            <div className={styles.modalBtns}>
              <button className={styles.modalCancel} onClick={() => setModalPrecio(false)}>Cancelar</button>
              <button className={styles.btnVerde} onClick={aplicarPrecioMasivo}
                disabled={operandoMasivo || diffTotal === 0}>
                {operandoMasivo ? 'Aplicando...' : diffTotal === 0 ? 'Sin cambios' : `Aplicar a ${selPublicados.length}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL DE OFERTA MASIVA (gorra con motivo + precio opcional) ── */}
      {modalOferta && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <p className={styles.modalTexto}>🔥 Poner en oferta {selPublicados.length} producto{selPublicados.length === 1 ? '' : 's'}</p>
            <p className={styles.modalSub}>Elegí el motivo (es el chip que ve el cliente):</p>
            <div className={styles.chipsAtajos}>
              {MOTIVOS_OFERTA.map(m => (
                <button key={m} type="button"
                  className={`${styles.chipAtajo} ${ofertaMotivo === m && !ofertaTexto ? styles.chipAtajoActivo : ''}`}
                  onClick={() => { setOfertaMotivo(m); setOfertaTexto('') }}>
                  {m}
                </button>
              ))}
            </div>
            <input className={styles.input} value={ofertaTexto} onChange={e => setOfertaTexto(e.target.value)}
              placeholder="Motivo propio (opcional, pisa los chips)" />
            <label className={styles.label}>Precio de oferta (opcional)</label>
            <input className={styles.input} type="number" value={ofertaPrecio} onChange={e => setOfertaPrecio(e.target.value)}
              placeholder="Si lo bajás, se muestra el lista tachado" />
            <p className={styles.modalSub}>Sin precio nuevo: entra a la shelf solo con el motivo.</p>
            <div className={styles.modalBtns}>
              <button className={styles.modalCancel} onClick={() => setModalOferta(false)}>Cancelar</button>
              <button className={styles.btnVerde} onClick={ponerOfertaMasivo} disabled={operandoOferta}>
                {operandoOferta ? 'Aplicando...' : 'Poner en oferta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── modales de confirmación ── */}
      {quitando && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <p className={styles.modalTexto}>¿Quitar "{quitando.nombre}" de la web?</p>
            <p className={styles.modalSub}>Podés volver a enviarlo desde la gestión.</p>
            <div className={styles.modalBtns}>
              <button className={styles.modalCancel} onClick={() => setQuitando(null)}>Cancelar</button>
              <button className={styles.modalDanger} onClick={confirmarQuitar}>Sí, quitar</button>
            </div>
          </div>
        </div>
      )}

      {rechazando && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <p className={styles.modalTexto}>Motivo del rechazo</p>
            <p className={styles.modalSub}>El local lo verá en la gestión</p>
            <input className={styles.input} value={notaRechazo} onChange={e => setNotaRechazo(e.target.value)}
              placeholder="Ej: foto borrosa, sin precio..." autoFocus />
            <div className={styles.modalBtns}>
              <button className={styles.modalCancel} onClick={() => setRechazando(null)}>Cancelar</button>
              <button className={styles.modalDanger} onClick={confirmarRechazo}>Rechazar</button>
            </div>
          </div>
        </div>
      )}

      {confirmandoQuitarMasivo && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <p className={styles.modalTexto}>¿Quitar {selPublicados.length} productos de la web?</p>
            <p className={styles.modalSub}>Podés volver a enviarlos desde la gestión.</p>
            <div className={styles.modalBtns}>
              <button className={styles.modalCancel} onClick={() => setConfirmandoQuitarMasivo(false)}>Cancelar</button>
              <button className={styles.modalDanger} onClick={quitarMasivo} disabled={quitandoMasivo}>
                {quitandoMasivo ? 'Quitando...' : 'Sí, quitar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}