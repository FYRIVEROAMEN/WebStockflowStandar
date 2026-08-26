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

// Wrapper para resetear filtros al cambiar de categoría
function CategoriaConKey() {
  const { nombre } = useParams()
  return <Categoria key={nombre} />
}

export default function App() {
  const { pathname } = useLocation()
  
  // Zona pública: todo visible
  // Zona admin (/admin y sub-rutas futuras): solo lo esencial
  const esAdmin = pathname.startsWith('/admin')

  return (
    <>
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
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/*" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        {/* Footer y botón flotante solo en zona pública */}
        {!esAdmin && <Footer />}
        {!esAdmin && <FloatingWhatsApp />}
        {!esAdmin && <PixelManager />}
      </div>
    </>
  )
}