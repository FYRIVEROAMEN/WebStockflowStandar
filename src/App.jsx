import { Routes, Route, useParams, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import FloatingWhatsApp from './components/FloatingWhatsApp'
import Home from './pages/Home'
import Categoria from './pages/Categoria'
import Producto from './pages/Producto'
import Carrito from './pages/Carrito'
import Admin from './pages/Admin'
import Seccion from './pages/Seccion'
import Buscar from './pages/Buscar'
import ScrollToTop from './components/ScrollToTop'
import NotFound from './pages/NotFound'
import PixelManager from './components/PixelManager'
import ScrollTopButton from './components/ScrollTopButton'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import CrearTienda from './pages/CrearTienda'
import CustomerRoute from './components/CustomerRoute'
import MiCuenta from './pages/MiCuenta'
import Checkout from './pages/Checkout'
import PedidoExito from './pages/PedidoExito'
import TenantNoExiste from './pages/TenantNoExiste'
import { useLocal } from './context/LocalContext'

// Wrapper para resetear filtros al cambiar de categoría
function CategoriaConKey() {
  const { nombre } = useParams()
  return <Categoria key={nombre} />
}

export default function App() {
  const { pathname } = useLocation()
  const { hostNoEncontrado, cargando } = useLocal()

  // Zona pública: todo visible
  // Zona admin (/admin y sub-rutas futuras): solo lo esencial
  const esAdmin = pathname.startsWith('/admin')

  // 🎯 Si el host no tiene tenant, mostrar página de captura
  if (hostNoEncontrado) {
    return (
      <AuthProvider>
        <TenantNoExiste />
      </AuthProvider>
    )
  }

  // Mientras carga la config, mostrar esqueleto mínimo
  if (cargando) {
    return (
      <AuthProvider>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#9ca3af' }}>Cargando tienda...</div>
        </div>
      </AuthProvider>
    )
  }

  return (
    <AuthProvider>
      <ScrollToTop />
      <Navbar />
      <div className="app-shell">
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/buscar" element={<Buscar />} />
            <Route path="/categoria/:nombre" element={<CategoriaConKey />} />
            <Route path="/seccion/:nombre" element={<Seccion />} />
            <Route path="/producto/:id" element={<Producto />} />
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/login" element={<Login />} />
             <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            <Route path="/admin/*" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
            <Route path="/crear-tienda" element={<CrearTienda />} />
            <Route path="/mi-cuenta" element={<CustomerRoute><MiCuenta /></CustomerRoute>} />
            <Route path="/checkout" element={<CustomerRoute><Checkout /></CustomerRoute>} />
            <Route path="/pedido-exitoso" element={<PedidoExito />} />
          </Routes>
        </main>
        {/* Footer y botón flotante solo en zona pública */}
        {!esAdmin && <Footer />}
        {!esAdmin && <FloatingWhatsApp />}
        {!esAdmin && <PixelManager />}
        {!esAdmin && <ScrollTopButton />}
      </div>
    </AuthProvider>
  )
}