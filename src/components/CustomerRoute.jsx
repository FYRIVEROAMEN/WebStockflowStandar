import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Gate de compra / mi cuenta: cualquier usuario con sesión y profile
// (customer que compra, u owner que compra como persona)
export default function CustomerRoute({ children }) {
  const { user, profile, loading } = useAuth()

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (!profile) return <Navigate to="/" replace />

  return children
}