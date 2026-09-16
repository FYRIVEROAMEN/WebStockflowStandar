import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, LogOut, Store, ExternalLink } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase, LOCAL_ID } from '../services/supabaseClient'
import { getCountPendientesWeb } from '../services/api'
import { urlMiTienda } from '../utils/tenantUrl'
import styles from './UserMenu.module.css'

export default function UserMenu() {
  const { user, profile, loading, logout } = useAuth()
  const [abierto, setAbierto] = useState(false)
  const [pendientes, setPendientes] = useState(0)
  const [miDominio, setMiDominio] = useState(null)
  const navigate = useNavigate()

  const esOwner = profile?.rol === 'owner'
  const esOwnerDeEsteLocal = esOwner && Number(profile?.local_id) === Number(LOCAL_ID)

  useEffect(() => {
    if (esOwnerDeEsteLocal) {
      getCountPendientesWeb()
        .then(({ data }) => setPendientes(data || 0))
        .catch(() => {})
    }
  }, [esOwnerDeEsteLocal])

  // Mi dirección web (para "Ir a mi tienda" desde cualquier parte)
  useEffect(() => {
    if (esOwner && profile?.local_id) {
      supabase
        .from('dominios')
        .select('subdominio, dominio_propio')
        .eq('local_id', profile.local_id)
        .maybeSingle()
        .then(({ data }) => setMiDominio(data?.dominio_propio || data?.subdominio || null))
        .catch(() => {})
    }
  }, [esOwner, profile?.local_id])

  const salir = async () => {
    setAbierto(false)
    await logout()
    navigate('/')
  }

  if (loading) return null

  // Sin sesión → botón de ingreso
  if (!user) {
    return (
      <Link to="/login" className={styles.boton}>
        <User size={16} /> Ingresar
      </Link>
    )
  }

  const inicial = (profile?.nombre || user.email || '?').charAt(0).toUpperCase()

  return (
    <div className={styles.wrap}>
      <button className={styles.boton} onClick={() => setAbierto(a => !a)}>
        <span className={styles.avatar}>{inicial}</span>
        <span className={styles.nombre}>{profile?.nombre || 'Mi cuenta'}</span>
      </button>

      {abierto && (
        <div className={styles.menu}>
          <p className={styles.mail}>{user.email}</p>

          {esOwnerDeEsteLocal && (
            <Link to="/admin" className={styles.item} onClick={() => setAbierto(false)}>
              <Store size={15} /> Mi panel
              {pendientes > 0 && <span className={styles.badge}>{pendientes}</span>}
            </Link>
          )}

          {esOwner && !esOwnerDeEsteLocal && miDominio && (
            <a href={urlMiTienda(miDominio)} className={styles.item} onClick={() => setAbierto(false)}>
              <ExternalLink size={15} /> Ir a mi tienda
            </a>
          )}

          <Link to="/mi-cuenta" className={styles.item} onClick={() => setAbierto(false)}>
            <User size={15} /> Mi cuenta
          </Link>

          <button className={`${styles.item} ${styles.salir}`} onClick={salir}>
            <LogOut size={15} /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}