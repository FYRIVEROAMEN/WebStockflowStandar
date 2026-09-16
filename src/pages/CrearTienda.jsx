import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { urlMiTienda } from '../utils/tenantUrl'
import toast from 'react-hot-toast'
import styles from './CrearTienda.module.css'

export default function CrearTienda() {
  const { user, profile, loading, refreshProfile } = useAuth()
  const [nombre, setNombre] = useState('')
  const [creando, setCreando] = useState(false)
  const [creada, setCreada] = useState(null)
  const [miDominio, setMiDominio] = useState(null)

  useEffect(() => {
    if (profile?.rol === 'owner' && profile?.local_id) {
      supabase
        .from('dominios')
        .select('subdominio, dominio_propio')
        .eq('local_id', profile.local_id)
        .maybeSingle()
        .then(({ data }) => setMiDominio(data?.dominio_propio || data?.subdominio || null))
        .catch(() => {})
    }
  }, [profile])

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />

  // 🛑 Freno: el que ya es dueño no crea otra tienda desde acá
  if (profile?.rol === 'owner' && !creada) {
    return (
      <div className={styles.wrap}>
        <div className={styles.card}>
          <h1 className={styles.titulo}>🏪 Ya tenés tu tienda</h1>
          <p className={styles.texto}>
            Tu vidriera ya está creada. Gestioná productos, stock y
            configuración desde tu panel.
          </p>
          <a
            className={styles.boton}
            href={miDominio ? urlMiTienda(miDominio) : (import.meta.env.VITE_GESTION_URL || 'http://localhost:5173')}
          >
            🏪 Ir a mi tienda
          </a>
        </div>
      </div>
    )
  }

  const crear = async () => {
    if (!nombre.trim()) return toast.error('Ponle un nombre a tu tienda')
    setCreando(true)
    try {
      const { data, error } = await supabase.rpc('crear_tienda', { p_nombre: nombre.trim() })
      if (error) throw error
      const { data: dom } = await supabase
        .from('dominios').select('subdominio').eq('local_id', data).single()
      setCreada({ localId: data, subdominio: dom?.subdominio })
      await refreshProfile()
      toast.success('¡Tienda creada! 🎉')
    } catch (err) {
      toast.error(err.message)
    }
    setCreando(false)
  }

  if (creada) {
    return (
      <div className={styles.wrap}>
        <div className={styles.card}>
          <h1 className={styles.titulo}>🎉 ¡Tu tienda está lista!</h1>
          <p className={styles.texto}>
            Tu dirección web será:<br />
            <b className={styles.url}>{creada.subdominio}</b>
          </p>
          <p className={styles.textoChico}>
            (se activa al público cuando conectemos el wildcard DNS · M4)
          </p>
          <a className={styles.boton} href={import.meta.env.VITE_GESTION_URL || 'http://localhost:5173'}>
            Ir al panel de gestión
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h1 className={styles.titulo}>🏢 Creá tu tienda</h1>
        <p className={styles.texto}>
          Hola {profile?.nombre || ''}, en 30 segundos tenés tu vidriera propia.
        </p>
        <input
          className={styles.input}
          placeholder="Nombre de tu tienda (ej: Yamil Store)"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && crear()}
        />
        <button className={styles.boton} onClick={crear} disabled={creando}>
          {creando ? 'Creando...' : 'Crear mi tienda'}
        </button>
      </div>
    </div>
  )
}