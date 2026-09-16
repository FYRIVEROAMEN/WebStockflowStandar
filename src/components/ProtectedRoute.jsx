import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LOCAL_ID } from '../services/supabaseClient'

export default function ProtectedRoute({ children }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Verificando sesión...</div>
  if (!user) return <Navigate to="/login" replace />
  if (!profile || profile.rol !== 'owner') return <Navigate to="/" replace />

  // 🏢 MULTITENANT
  if (Number(profile.local_id) !== Number(LOCAL_ID)) {
    return <Navigate to="/" replace />
  }

  if (!profile.locales?.web_activa) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Tu web no está activada aún. Activala desde la gestión.</div>
  }

  return children
}