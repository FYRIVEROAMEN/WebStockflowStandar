import { Routes, Route, useParams } from 'react-router-dom'
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

// Wrapper para resetear filtros al cambiar de categoría
function CategoriaConKey() {
  const { nombre } = useParams()
  return <Categoria key={nombre} />
}

function EnConstruccion() {
  return (
    <div style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--color-texto-suave)' }}>
      <p style={{ fontSize: '1.4rem', fontWeight: 700 }}>🚧 En construcción</p>
      <p style={{ marginTop: 8 }}>Esta sección llega en el próximo paso.</p>
    </div>
  )
}

export default function App() {
  return (
    <>
      <Navbar />
      <div className="app-shell">
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/buscar" element={<Buscar />} />
            <Route path="/categoria/:nombre" element={<CategoriaConKey />} />
            <Route path="/producto/:id" element={<Producto />} />
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<EnConstruccion />} />
            <Route path="/seccion/:nombre" element={<Seccion />} />
          </Routes>
        </main>
        <Footer />
        <FloatingWhatsApp />
      </div>
    </>
  )
}