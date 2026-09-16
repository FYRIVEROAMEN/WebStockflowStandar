import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase, LOCAL_ID } from '../services/supabaseClient'
import { urlMiTienda } from '../utils/tenantUrl'

export default function PostLoginRedirect() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user || !profile) return

    // Dueño de otra tienda → ascensor a SU casa
    if (profile.rol === 'owner' && Number(profile.local_id) !== Number(LOCAL_ID)) {
      supabase
        .from('dominios')
        .select('subdominio, dominio_propio')
        .eq('local_id', profile.local_id)
        .maybeSingle()
        .then(({ data }) => {
          const host = data?.dominio_propio || data?.subdominio
          if (host) window.location.assign(urlMiTienda(host))
        })
      return
    }

    // Owner de esta tienda o customer → entrada normal
    navigate('/', { replace: true })
  }, [user, profile])

  return null
}