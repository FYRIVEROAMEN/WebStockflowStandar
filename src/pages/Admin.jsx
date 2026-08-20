import { useEffect, useState } from 'react'
import { Check, X, Upload, Trash2, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getPendientesWeb, getPublicadosWeb,
  aprobarProductoWeb, rechazarProductoWeb, quitarDeWeb
} from '../services/api'
import { optimizeImage } from '../utils/image'
import { useLocal } from '../context/LocalContext'
import ConfigPanel from '../components/ConfigPanel'
import styles from './Admin.module.css'

const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export default function Admin() {
  const { config } = useLocal()
  const [autorizado, setAutorizado] = useState(sessionStorage.getItem('admin_ok') === '1')
  const [codigo, setCodigo] = useState('')
  const [tab, setTab] = useState('pendientes')
  const [pendientes, setPendientes] = useState([])
  const [publicados, setPublicados] = useState([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(null)
const [form, setForm] = useState({ descripcion: '', precioWeb: '', destacado: false, fotos: [], webCategoria: '' })
  const [subiendo, setSubiendo] = useState(false)
  const [quitando, setQuitando] = useState(null)
  const [rechazando, setRechazando] = useState(null)
  const [notaRechazo, setNotaRechazo] = useState('')

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

  useEffect(() => {
    if (autorizado) cargar()
  }, [autorizado])

  const entrar = () => {
    if (codigo === (import.meta.env.VITE_ADMIN_CODE || 'stockflow2026')) {
      sessionStorage.setItem('admin_ok', '1')
      setAutorizado(true)
    } else {
      toast.error('Código incorrecto')
    }
  }

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
      webCategoria: p.web_categoria || ''
    })
  }

  const aprobar = async () => {
        if (!form.webCategoria) {
      toast('Elegí una categoría para publicar', { icon: '⚠️' })
      return
    }
    try {
      await aprobarProductoWeb(editando.id, {
        descripcion: form.descripcion,
        fotos: form.fotos,
        destacado: form.destacado,
        precioWeb: form.precioWeb === '' ? null : Number(form.precioWeb),
        webCategoria: form.webCategoria
      })
      setEditando(null)
      cargar()
      toast.success('¡Publicado!')
    } catch (err) {
      toast.error('Error al aprobar: ' + err.message)
    }
  }

  const confirmarRechazo = async () => {
    if (!notaRechazo.trim()) return toast('Escribí el motivo del rechazo', { icon: '⚠️' })
    try {
      await rechazarProductoWeb(rechazando.id, notaRechazo.trim())
      setRechazando(null)
      setNotaRechazo('')
      cargar()
      toast.success('Rechazo enviado al local')
    } catch (err) {
      toast.error('Error al rechazar: ' + err.message)
    }
  }

  const confirmarQuitar = async () => {
    try {
      await quitarDeWeb(quitando.id)
      setQuitando(null)
      cargar()
      toast.success('Producto quitado de la web')
    } catch (err) {
      toast.error('Error al quitar: ' + err.message)
    }
  }

  if (!autorizado) {
    return (
      <div className={styles.gate}>
        <h2 className={styles.gateTitulo}>🔐 Panel del dueño</h2>
        <input
          type="password"
          className={styles.gateInput}
          placeholder="Código de acceso"
          value={codigo}
          onChange={e => setCodigo(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && entrar()}
        />
        <button className={styles.gateBtn} onClick={entrar}>Entrar</button>
      </div>
    )
  }

  if (editando) {
    return (
      <div className={styles.wrap}>
        <button className={styles.volver} onClick={() => setEditando(null)}><ArrowLeft size={16} /> Volver</button>
        <h2 className={styles.titulo}>Aprobar: {editando.nombre}</h2>

        <div className={styles.fotoPrincipal}>
          <img src={optimizeImage(editando.imagen_url, 600)} alt={editando.nombre} />
        </div>

        <label className={styles.label}>Sección de la vidriera (obligatoria) *</label>
         {(config.categoriasWeb || []).length > 0 ? (
          <select
            className={styles.input}
            value={form.webCategoria}
            onChange={e => setForm({ ...form, webCategoria: e.target.value })}
          >
            <option value="">Elegí dónde va...</option>
            {(config.categoriasWeb || []).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        ) : (
          <p style={{ fontSize: '.75rem', color: '#dc2626' }}>
            No hay secciones creadas. Crealas en ⚙️ Mi vidriera → "Secciones de la vidriera".
          </p>
        )}

        <label className={styles.label}>Descripción para la web</label>
        <textarea
          className={styles.textarea}
          rows={4}
          value={form.descripcion}
          onChange={e => setForm({ ...form, descripcion: e.target.value })}
          placeholder="Contale al cliente lo lindo de este producto..."
        />

        <div className={styles.fila}>
          <div className={styles.mitad}>
            <label className={styles.label}>Precio web (opcional)</label>
            <input
              className={styles.input}
              type="number"
              value={form.precioWeb}
              onChange={e => setForm({ ...form, precioWeb: e.target.value })}
              placeholder={`Usar $${Number(editando.precio).toLocaleString('es-AR')}`}
            />
          </div>
          <div className={styles.mitad}>
            <label className={styles.check}>
              <input type="checkbox" checked={form.destacado} onChange={e => setForm({ ...form, destacado: e.target.checked })} />
              ⭐ Destacado en la home
            </label>
          </div>
        </div>

        <label className={styles.label}>Fotos extra (máx. 3)</label>
        <div className={styles.fotosRow}>
          {form.fotos.map((f, i) => (
            <div key={i} className={styles.fotoExtra}>
              <img src={optimizeImage(f, 150)} alt={`extra ${i + 1}`} />
              <button
                className={styles.fotoBorrar}
                onClick={() => setForm(f2 => ({ ...f2, fotos: f2.fotos.filter((_, j) => j !== i) }))}
              >
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

        <button className={styles.aprobarBtn} onClick={aprobar}><Check size={18} /> Aprobar y publicar</button>
      </div>
    )
  }

  if (tab === 'config') {
    return (
      <div className={styles.wrap}>
        <h2 className={styles.titulo}>Panel del dueño</h2>
        <div className={styles.tabs}>
          <button className={styles.tab} onClick={() => setTab('pendientes')}>
            Pendientes ({pendientes.length})
          </button>
          <button className={styles.tab} onClick={() => setTab('publicados')}>
            Publicados ({publicados.length})
          </button>
          <button className={`${styles.tab} ${styles.tabActiva}`} onClick={() => setTab('config')}>
            ⚙️ Mi vidriera
          </button>
        </div>
        <div style={{ marginTop: 16 }}>
          <ConfigPanel />
        </div>
      </div>
    )
  }

  const lista = tab === 'pendientes' ? pendientes : publicados

  return (
    <div className={styles.wrap}>
      <h2 className={styles.titulo}>Panel del dueño</h2>
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'pendientes' ? styles.tabActiva : ''}`} onClick={() => setTab('pendientes')}>
          Pendientes ({pendientes.length})
        </button>
        <button className={`${styles.tab} ${tab === 'publicados' ? styles.tabActiva : ''}`} onClick={() => setTab('publicados')}>
          Publicados ({publicados.length})
        </button>
        <button className={`${styles.tab} ${tab === 'config' ? styles.tabActiva : ''}`} onClick={() => setTab('config')}>
          ⚙️ Mi vidriera
        </button>
      </div>

      {loading ? (
        <p className={styles.vacio}>Cargando...</p>
      ) : lista.length === 0 ? (
        <p className={styles.vacio}>
          {tab === 'pendientes' ? 'No hay productos esperando aprobación 🎉' : 'Todavía no publicaste nada.'}
        </p>
      ) : (
        <div className={styles.lista}>
          {lista.map(p => (
            <div key={p.id} className={styles.item}>
              <img src={optimizeImage(p.imagen_url, 150)} alt={p.nombre} className={styles.itemImg} />
              <div className={styles.itemInfo}>
                <p className={styles.itemNombre}>{p.nombre}</p>
                <p className={styles.itemMeta}>{p.categoria} · ${Number(p.precio).toLocaleString('es-AR')} · stock {p.stock}</p>
                {tab === 'pendientes' && p.web_enviado_en && (
                  <p className={styles.itemMeta}>Enviado: {new Date(p.web_enviado_en).toLocaleDateString('es-AR')}</p>
                )}
              </div>
              <div className={styles.itemAcciones}>
                {tab === 'pendientes' ? (
                  <>
                    <button className={styles.btnAprobar} onClick={() => abrirEdicion(p)} title="Aprobar y enriquecer"><Check size={16} /></button>
                    <button className={styles.btnRechazar} onClick={() => { setRechazando(p); setNotaRechazo('') }} title="Rechazar con nota"><X size={16} /></button>
                  </>
                ) : (
                  <button className={styles.btnQuitar} onClick={() => setQuitando(p)} title="Quitar de la web"><X size={16} /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de quitar */}
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

      {/* Modal de rechazo */}
      {rechazando && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <p className={styles.modalTexto}>Motivo del rechazo</p>
            <p className={styles.modalSub}>El local lo verá en la gestión</p>
            <input
              className={styles.input}
              value={notaRechazo}
              onChange={e => setNotaRechazo(e.target.value)}
              placeholder="Ej: foto borrosa, sin precio..."
              autoFocus
            />
            <div className={styles.modalBtns}>
              <button className={styles.modalCancel} onClick={() => setRechazando(null)}>Cancelar</button>
              <button className={styles.modalDanger} onClick={confirmarRechazo}>Rechazar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}