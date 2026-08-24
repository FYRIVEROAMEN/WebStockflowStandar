import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, ShoppingCart, Package, X, User, Search } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { getCategoriasWeb } from '../services/api'
import { useLocal } from '../context/LocalContext'
import styles from './Navbar.module.css'


export default function Navbar() {
  const { cartCount } = useCart()
  const { config } = useLocal()
  const [menuOpen, setMenuOpen] = useState(false)
  const [categorias, setCategorias] = useState([])
  const [compacto, setCompacto] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const navigate = useNavigate()
  const nombreLocal = import.meta.env.VITE_NOMBRE_LOCAL || 'StockFlow'

  const buscar = (e) => {
    e.preventDefault()
    if (busqueda.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(busqueda.trim())}`)
      setBusqueda('')
      setMenuOpen(false)
    }
  }

  useEffect(() => {
    getCategoriasWeb().then(({ data }) => setCategorias(data || [])).catch(() => {})
  }, [])

    useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      // Histéresis: activa > 60, desactiva < 20 → nunca oscila en el borde
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
          <Link to="/admin" className={styles.admBtn} title="Administrador">
            <User size={16} />
            <span>admin</span>
          </Link>
        </div>

        <nav className={styles.navDesktop}>
          <Link to="/" className={styles.navDesktopLink}>Inicio</Link>
          {(config.categoriasWeb || []).map(d => (
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
            {categorias.map(cat => (
              <Link
                key={cat.nombre}
                to={`/categoria/${encodeURIComponent(cat.nombre)}`}
                className={styles.drawerLink}
                onClick={() => setMenuOpen(false)}
              >
                {cat.nombre}
              </Link>
            ))}
            <p className={styles.drawerSub}>Cuenta</p>
            <Link to="/admin" className={styles.drawerLink} onClick={() => setMenuOpen(false)}>🔐 Admin</Link>
          </nav>
        </>
      )}
    </>
  )
}