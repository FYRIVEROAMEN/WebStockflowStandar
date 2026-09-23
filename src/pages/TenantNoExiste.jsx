import { Link } from 'react-router-dom'
import { Sparkles, Store, ArrowRight } from 'lucide-react'

export default function TenantNoExiste() {
  const portalUrl = 'https://stockshop.com.ar'
  const crearUrl = `${portalUrl}/crear-cuenta`

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)'
    }}>
      <div style={{
        maxWidth: 520,
        textAlign: 'center',
        background: '#fff',
        borderRadius: 20,
        padding: '40px 28px',
        boxShadow: '0 20px 60px rgba(8, 40, 91, 0.08)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          width: 72, height: 72, margin: '0 auto 20px',
          borderRadius: '50%', background: '#eff6ff',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Store size={36} color="#08285B" />
        </div>

        <h1 style={{
          fontSize: '1.75rem', fontWeight: 800,
          color: '#08285B', margin: '0 0 12px', lineHeight: 1.2
        }}>
          Esta tienda no existe <span style={{ opacity: 0.6 }}>(todavía 😉)</span>
        </h1>

        <p style={{
          color: '#6b7280', fontSize: '1rem',
          margin: '0 0 28px', lineHeight: 1.6
        }}>
          El link que tocaste no apunta a ninguna vidriera activa.
          <br />Pero podés crear <b>la tuya</b> en 2 minutos.
        </p>

        <a
          href={crearUrl}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#08285B', color: '#fff',
            fontWeight: 700, fontSize: '1rem',
            padding: '14px 28px', borderRadius: 12,
            textDecoration: 'none',
            boxShadow: '0 10px 30px rgba(8, 40, 91, 0.25)',
            transition: 'transform 0.15s',
            marginBottom: 12
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Sparkles size={18} />
          Crear mi tienda gratis
          <ArrowRight size={18} />
        </a>

        <div style={{ marginTop: 20 }}>
          <a
            href={portalUrl}
            style={{
              color: '#6b7280', fontSize: '.9rem',
              textDecoration: 'underline',
              textUnderlineOffset: 3
            }}
          >
            Conocer StockShop →
          </a>
        </div>

        <div style={{
          marginTop: 28, paddingTop: 20,
          borderTop: '1px solid #f3f4f6',
          color: '#9ca3af', fontSize: '.8rem'
        }}>
          ¿Creés que debería existir? Avisale al comercio.
        </div>
      </div>
    </div>
  )
}