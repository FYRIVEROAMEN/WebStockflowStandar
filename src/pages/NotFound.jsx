import { Link } from 'react-router-dom'
import { PackageSearch } from 'lucide-react'

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 16px' }}>
      <PackageSearch size={56} style={{ color: '#9ca3af', margin: '0 auto 16px', display: 'block' }} />
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>
        Página no encontrada
      </h1>
      <p style={{ color: '#6b7280', fontSize: '.9rem', margin: '0 0 24px' }}>
        El link que tocaste no existe o el producto ya no está disponible.
      </p>
      <Link
        to="/"
        style={{
          display: 'inline-block', background: '#111827', color: '#fff',
          fontWeight: 700, fontSize: '.85rem', padding: '12px 24px',
          borderRadius: 8, textDecoration: 'none'
        }}
      >
        ← Volver al inicio
      </Link>
    </div>
  )
}