import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useLocal } from '../context/LocalContext'
import toast from 'react-hot-toast'
import styles from './Checkout.module.css'

const codigoDe = (id) => `#SS-${String(id).padStart(4, '0')}`

export default function PedidoExito() {
  const location = useLocation()
  const { config } = useLocal()
  const [copiado, setCopiado] = useState(false)

  const resumen = location.state || JSON.parse(localStorage.getItem('ss_ultimo_pedido') || 'null')

  // Sin datos (entró directo o limpió storage): a Mi cuenta
  if (!resumen || !resumen.pedidoId) return <Navigate to="/mi-cuenta" replace />

  const codigo = codigoDe(resumen.pedidoId)

  const copiarCodigo = async () => {
    try {
      await navigator.clipboard.writeText(codigo)
      setCopiado(true)
      toast.success('Código copiado')
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      toast.error('No se pudo copiar')
    }
  }

  const tel = (config?.whatsapp || '').replace(/\D/g, '')
  const wa = tel ? (tel.startsWith('54') ? tel : `549${tel}`) : null
  const msgWa = encodeURIComponent(`Hola! Te escribo por mi pedido ${codigo} de la tienda online. ¡Gracias!`)

  return (
    <div className={styles.wrap}>
      <div style={{ textAlign: 'center', margin: '24px 0' }}>
        <div style={{ fontSize: 56 }}></div>
        <h1 className={styles.titulo}>¡Gracias por tu compra!</h1>
        <p style={{ color: '#6b7280' }}>Tu pedido ya le llegó al comercio.</p>
        <button
          onClick={copiarCodigo}
          title="Copiar código"
          style={{ margin: '12px auto', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, border: '2px dashed #2563eb', background: '#eff6ff', color: '#1d4ed8', fontWeight: 800, fontSize: 20, cursor: 'pointer' }}
        >
          {codigo} <span style={{ fontSize: 12 }}>{copiado ? '✅ copiado' : '📋 copiar'}</span>
        </button>
      </div>

      <section className={styles.card}>
        <h2 className={styles.cardTitulo}>📦 Resumen</h2>
        {(resumen.items || []).map((i, idx) => (
          <div key={idx} className={styles.linea}>
            <span>{i.cantidad}x {i.nombre}{i.talle ? ` · Talle ${i.talle}` : ''}{i.color ? ` · ${i.color}` : ''}</span>
            <span>${(Number(i.precio) * i.cantidad).toLocaleString('es-AR')}</span>
          </div>
        ))}
        <div className={styles.totalLinea}>
          <span>Total</span>
          <strong>${Number(resumen.total).toLocaleString('es-AR')}</strong>
        </div>
        {resumen.totalTransf && (
          <div className={styles.totalLinea}>
            <span>Con transferencia</span>
            <strong>${Number(resumen.totalTransf).toLocaleString('es-AR')}</strong>
          </div>
        )}
        {resumen.direccion && (
          <p style={{ marginTop: 8, color: '#6b7280', fontSize: 14 }}>🚚 {resumen.direccion}</p>
        )}
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitulo}>⏳ Qué sigue</h2>
        <ol style={{ margin: 0, paddingLeft: 20, color: '#374151', lineHeight: 1.9 }}>
          <li><b>Recibido</b> ✔ — el comercio ya fue notificado</li>
          <li><b>Confirmación</b> — te escriben para coordinar el pago</li>
          <li><b>Envío o retiro</b> — según lo que acuerden</li>
          <li><b>Entregado</b> — ¡a disfrutar!</li>
        </ol>
      </section>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', margin: '16px 0' }}>
        {wa && (
          <a className={styles.boton} style={{ textDecoration: 'none', background: '#25D366' }}
             href={`https://wa.me/${wa}?text=${msgWa}`} target="_blank" rel="noreferrer">
            Escribir al comercio
          </a>
        )}
        <Link className={styles.boton} style={{ textDecoration: 'none' }} to="/mi-cuenta">Ver mis pedidos</Link>
        <Link className={styles.boton} style={{ textDecoration: 'none', background: '#6b7280' }} to="/">Seguir comprando</Link>
      </div>
    </div>
  )
}