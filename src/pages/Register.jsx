import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import styles from './Login.module.css'

export default function Register() {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [loading, setLoading] = useState(false)
  const { register, loginConGoogle } = useAuth()
  const navigate = useNavigate()

  const crear = async () => {
    if (!nombre.trim()) return toast.error('Poné tu nombre')
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error('Email inválido')
    if (password.length < 6) return toast.error('Mínimo 6 caracteres')
    if (password !== confirmar) return toast.error('Las contraseñas no coinciden')
    setLoading(true)
    try {
      const data = await register(email, password, nombre.trim(), telefono.trim())
      if (data.session) {
        toast.success('¡Cuenta creada! Bienvenido')
        navigate('/')
      } else {
        toast.success('Te enviamos un mail para confirmar tu cuenta')
        navigate('/login')
      }
    } catch (err) {
      toast.error(err.message)
    }
    setLoading(false)
  }

  const entrarConGoogle = async () => {
    setLoading(true)
    try {
      await loginConGoogle()
    } catch (err) {
      toast.error(err.message)
      setLoading(false)
    }
  }

  return (
    <div className={styles.gate}>
      <h2 className={styles.gateTitulo}>🛍️ Crear mi cuenta</h2>
      <p className={styles.gateSub}>Comprá más rápido y seguí tus pedidos.</p>
      <input className={styles.gateInput} placeholder="Nombre y apellido"
        value={nombre} onChange={e => setNombre(e.target.value)} />
      <input className={styles.gateInput} placeholder="WhatsApp (opcional)"
        value={telefono} onChange={e => setTelefono(e.target.value)} />
      <input className={styles.gateInput} type="email" placeholder="Email"
        value={email} onChange={e => setEmail(e.target.value)} />
      <input className={styles.gateInput} type="password" placeholder="Contraseña"
        value={password} onChange={e => setPassword(e.target.value)} />
      <input className={styles.gateInput} type="password" placeholder="Repetir contraseña"
        value={confirmar} onChange={e => setConfirmar(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && crear()} />
      <button className={styles.gateBtn} onClick={crear} disabled={loading}>
        {loading ? 'Creando...' : 'Crear cuenta'}
      </button>

      <div className={styles.divisor}><span>o</span></div>

      <button className={styles.gateBtnGoogle} onClick={entrarConGoogle} disabled={loading}>
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        Continuar con Google
      </button>

      <p className={styles.gateSub} style={{ marginTop: 12 }}>
        ¿Ya tenés cuenta? <Link to="/login">Ingresá</Link>
      </p>
    </div>
  )
}