import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, ShoppingCart, Package, X, Search } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useLocal } from '../context/LocalContext'
import { getCountPendientesWeb } from '../services/api'
import styles from './Navbar.module.css'
import UserMenu from './UserMenu'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { cartCount } = useCart()
  const { config } = useLocal()
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [compacto, setCompacto] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [pendientes, setPendientes] = useState(0)
  const navigate = useNavigate()
  const nombreLocal = config?.nombreLocal || import.meta.env.VITE_NOMBRE_LOCAL || 'StockFlow'

  // 🔑 ÚNICA fuente de verdad para navegación
  const categorias = config.categoriasWeb || []

  const buscar = (e) => {
    e.preventDefault()
    if (busqueda.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(busqueda.trim())}`)
      setBusqueda('')
      setMenuOpen(false)
    }
  }

  // Badge de pendientes: se actualiza al cargar y al cambiar de ruta
  // (así después de aprobar en el admin, el número baja al volver)
  useEffect(() => {
    let vivo = true
    getCountPendientesWeb()
      .then(({ data }) => { if (vivo) setPendientes(data) })
      .catch(() => {})
    return () => { vivo = false }
  }, [pathname])

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setCompacto(prev => (y > 60 ? true : y < 20 ? false : prev))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header className={`${styles.navbar} ${compacto ? styles.navbarCompacto : ''}`}>
        <button className={styles.hamburguesa} onClick={() => setMenuOpen(true)} title="Menú">
          <Menu size={22} />
        </button>

        <Link to="/" className={styles.logo}>
          {config.logoUrl ? (
            <img
              src={config.logoUrl.replace('/upload/', '/upload/e_trim/')}
              alt={nombreLocal}
              className={styles.logoImg}
            />
          ) : (
            <>
              <span className={styles.logoIcon}><Package size={18} /></span>
              <span className={styles.logoText}>{nombreLocal}</span>
            </>
          )}
        </Link>

        {/* 🔍 Buscador desktop */}
        <form onSubmit={buscar} className={styles.buscarForm}>
          <input
            type="text"
            className={styles.buscarInput}
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar productos..."
          />
          <button type="submit" className={styles.buscarBtn} title="Buscar">
            <Search size={16} />
          </button>
        </form>

        <div className={styles.actions}>
          <Link to="/carrito" className={styles.cartBtn}>
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span key={cartCount} className={`${styles.cartBadge} nav-cart-pop`}>
                {cartCount}
              </span>
            )}
          </Link>
          <UserMenu />
        </div>

        <nav className={styles.navDesktop}>
          <Link to="/" className={styles.navDesktopLink}>Inicio</Link>
          {categorias.map(d => (
            <Link key={d} to={`/seccion/${encodeURIComponent(d)}`} className={styles.navDesktopLink}>
              {d}
            </Link>
          ))}
        </nav>
      </header>

      {menuOpen && (
        <>
          <div className={styles.overlay} onClick={() => setMenuOpen(false)} />
          <nav className={styles.drawer}>
            <div className={styles.drawerHeader}>
              <span className={styles.drawerTitle}>Menú</span>
              <button onClick={() => setMenuOpen(false)} className={styles.cerrar}><X size={20} /></button>
            </div>

            {/* 🔍 Buscador mobile */}
            <form onSubmit={buscar} style={{ position: 'relative', marginBottom: 12 }}>
              <input
                type="text"
                className={styles.buscarInput}
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar productos..."
              />
              <button type="submit" className={styles.buscarBtn} title="Buscar">
                <Search size={16} />
              </button>
            </form>

            <Link to="/" className={styles.drawerLink} onClick={() => setMenuOpen(false)}>Inicio</Link>
            <p className={styles.drawerSub}>Categorías</p>
            {categorias.map(c => (
              <Link
                key={c}
                to={`/seccion/${encodeURIComponent(c)}`}
                className={styles.drawerLink}
                onClick={() => setMenuOpen(false)}
              >
                {c}
              </Link>
            ))}
            <p className={styles.drawerSub}>Cuenta</p>
            <Link to="/admin" className={styles.drawerLink} onClick={() => setMenuOpen(false)}>
              🔐 Admin
              {pendientes > 0 && <span className={styles.drawerBadge}>{pendientes} por aprobar</span>}
            </Link>
            {user && (
              <button
                className={styles.drawerLink}
                style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                onClick={() => { setMenuOpen(false); logout() }}
              >
                🚪 Cerrar sesión
              </button>
            )}
          </nav>
        </>
      )}
    </>
  )
}