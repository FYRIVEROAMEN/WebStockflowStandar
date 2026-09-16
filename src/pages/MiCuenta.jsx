import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getMisPedidos } from '../services/api'
import toast from 'react-hot-toast'
import styles from './MiCuenta.module.css'

const ESTADOS = {
  recibido:    { txt: '🕐 Recibido', cls: 'badgeRecibido' },
  confirmado:  { txt: '✔ Confirmado', cls: 'badgeConfirmado' },
  enviado:     { txt: '🚚 En camino', cls: 'badgeEnviado' },
  entregado:   { txt: '📦 Entregado', cls: 'badgeEntregado' },
  cancelado:   { txt: '❌ Cancelado', cls: 'badgeCancelado' }
}

export default function MiCuenta() {
  const { user, profile, updateProfile } = useAuth()
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [direccion, setDireccion] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [pedidos, setPedidos] = useState([])
  const [cargandoPedidos, setCargandoPedidos] = useState(true)

   useEffect(() => {
    if (profile) {
      setNombre(profile.nombre || '')
      setTelefono(profile.telefono || '')
      // 🛡️ Fix del [object Object]: solo acepta strings
      setDireccion(typeof profile.direccion === 'string' ? profile.direccion : '')
    }
  }, [profile])
  
  useEffect(() => {
    getMisPedidos()
      .then(({ data }) => setPedidos(data || []))
      .catch(() => {})
      .finally(() => setCargandoPedidos(false))
  }, [])

  const guardar = async () => {
    if (!nombre.trim()) return toast.error('Poné tu nombre')
    setGuardando(true)
    try {
      await updateProfile({
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        direccion: direccion.trim()
      })
      toast.success('Datos guardados ✔')
    } catch (err) {
      toast.error(err.message)
    }
    setGuardando(false)
  }

  return (
    <div className={styles.wrap}>
      <h1 className={styles.titulo}>👤 Mi cuenta</h1>

      <section className={styles.card}>
        <h2 className={styles.cardTitulo}>Mis datos</h2>
        <label className={styles.label}>Email</label>
        <input className={styles.input} value={user?.email || ''} disabled />
        <label className={styles.label}>Nombre y apellido</label>
        <input className={styles.input} value={nombre} onChange={e => setNombre(e.target.value)} />
        <label className={styles.label}>WhatsApp</label>
        <input className={styles.input} value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="11 2345 6789" />
        <label className={styles.label}>Dirección de envío</label>
        <input className={styles.input} value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="Calle, número, ciudad" />
        <button className={styles.boton} onClick={guardar} disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitulo}>Mis pedidos</h2>
        {cargandoPedidos ? (
          <p className={styles.vacio}>Cargando...</p>
        ) : pedidos.length === 0 ? (
          <p className={styles.vacio}>🛍️ Todavía no hiciste pedidos.</p>
        ) : (
          pedidos.map(p => {
            const est = ESTADOS[p.estado] || ESTADOS.recibido
            return (
              <div key={p.id} className={styles.pedido}>
                <div className={styles.pedidoHeader}>
                  <span className={styles.pedidoId}>Pedido #{p.id}</span>
                  <span className={styles[est.cls]}>{est.txt}</span>
                </div>
                <p className={styles.pedidoFecha}>
                  {new Date(p.creado_en).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
                <ul className={styles.pedidoItems}>
                  {(p.items || []).map(i => (
                    <li key={i.id}>
                      {i.cantidad}x {i.nombre_snapshot}
                      {i.talle ? ` · Talle ${i.talle}` : ''}
                      {i.color ? ` · ${i.color}` : ''}
                      {' '}- ${(Number(i.precio_unitario) * i.cantidad).toLocaleString('es-AR')}
                    </li>
                  ))}
                </ul>
                <div className={styles.pedidoTotal}>
                  Total: <strong>${Number(p.total).toLocaleString('es-AR')}</strong>
                </div>
                <p className={styles.pedidoDireccion}>📍 {p.direccion_envio}</p>
              </div>
            )
          })
        )}
      </section>
    </div>
  )
}