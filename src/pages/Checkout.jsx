import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useLocal } from '../context/LocalContext'
import { crearPedido } from '../services/api'
import toast from 'react-hot-toast'
import styles from './Checkout.module.css'

export default function Checkout() {
  const { cart, total, clear } = useCart()
  const { user, profile } = useAuth()
  const { config } = useLocal()
  const navigate = useNavigate()

  const [direccion, setDireccion] = useState('')
  const [telefono, setTelefono] = useState('')
  const [nota, setNota] = useState('')
  const [procesando, setProcesando] = useState(false)

  const DESC_TRANSF = Number(config.descuentoTransferencia || 0)
  const totalTransf = DESC_TRANSF > 0 ? total * (1 - DESC_TRANSF / 100) : null

  useEffect(() => {
    if (profile) {
      setDireccion(profile.direccion || '')
      setTelefono(profile.telefono || '')
    }
  }, [profile])

  if (!user) return <div className={styles.wrap}>Iniciá sesión para continuar</div>
  if (cart.length === 0) {
    return (
      <div className={styles.wrap}>
        <p>Tu carrito está vacío</p>
        <Link to="/">Ver productos</Link>
      </div>
    )
  }

  const confirmar = async () => {
    if (!direccion.trim()) return toast.error('Completá la dirección de envío')
    if (!telefono.trim()) return toast.error('Completá tu WhatsApp')
    setProcesando(true)
    try {
      const items = cart.map(i => ({
        producto_id: i.id,
        variante_id: i.variante_id,
        nombre: i.nombre,
        talle: i.talle,
        color: i.color,
        precio: i.precio,
        cantidad: i.quantity
      }))
            const { data: pedidoId } = await crearPedido({
        direccion: direccion.trim(),
        telefono: telefono.trim(),
        nota: nota.trim(),
        items
      })
      // 🎉 Resumen para la pantalla de éxito (capturado ANTES de vaciar el carrito)
      const resumen = {
        pedidoId,
        items: cart.map(i => ({ cantidad: i.quantity, nombre: i.nombre, talle: i.talle, color: i.color, precio: i.precio })),
        total,
        totalTransf,
        direccion: direccion.trim()
      }
      localStorage.setItem('ss_ultimo_pedido', JSON.stringify(resumen))
      clear()
      navigate('/pedido-exitoso', { state: resumen })
    } catch (err) {
      toast.error(err.message || 'Error al crear el pedido')
    }
    setProcesando(false)
  }

  return (
    <div className={styles.wrap}>
      <h1 className={styles.titulo}>Finalizar compra</h1>

      <section className={styles.card}>
        <h2 className={styles.cardTitulo}>📦 Resumen</h2>
        {cart.map(i => (
          <div key={`${i.id}-${i.variante_id}-${i.talle}-${i.color}`} className={styles.linea}>
            <span>{i.quantity}x {i.nombre}</span>
            <span>${(Number(i.precio) * i.quantity).toLocaleString('es-AR')}</span>
          </div>
        ))}
        <div className={styles.totalLinea}>
          <span>Total</span>
          <strong>${Number(total).toLocaleString('es-AR')}</strong>
        </div>
        {totalTransf && (
          <div className={styles.totalLinea}>
            <span>Con transferencia</span>
            <strong>${Number(totalTransf).toLocaleString('es-AR')}</strong>
          </div>
        )}
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitulo}>🚚 Envío</h2>
        <label className={styles.label}>Dirección de entrega</label>
        <input
          className={styles.input}
          value={direccion}
          onChange={e => setDireccion(e.target.value)}
          placeholder="Calle, número, ciudad"
        />
        <label className={styles.label}>WhatsApp de contacto</label>
        <input
          className={styles.input}
          value={telefono}
          onChange={e => setTelefono(e.target.value)}
          placeholder="11 2345 6789"
        />
        <label className={styles.label}>Nota para el local (opcional)</label>
        <textarea
          className={styles.input}
          value={nota}
          onChange={e => setNota(e.target.value)}
          placeholder="Ej: tocar timbre, dejar en portería..."
          rows={2}
        />
      </section>

      <button
        className={styles.boton}
        onClick={confirmar}
        disabled={procesando}
      >
        {procesando ? 'Confirmando...' : `Confirmar pedido · $${Number(total).toLocaleString('es-AR')}`}
      </button>
    </div>
  )
}