import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, MessageCircle } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useLocal } from '../context/LocalContext'
import { optimizeImage } from '../utils/image'
import styles from './Carrito.module.css'

export default function Carrito() {
  const { cart, remove, setQty, clear, total } = useCart()
  const { config } = useLocal()
  const phone = import.meta.env.VITE_WHATSAPP

  const DESC_TRANSF = Number(config.descuentoTransferencia || 0)
  const totalTransf = DESC_TRANSF > 0 ? total * (1 - DESC_TRANSF / 100) : null

  const enviarPedido = () => {
    const lineas = cart.map(i => {
      const variante = [i.talle && `Talle ${i.talle}`, i.color && i.color].filter(Boolean).join(' · ')
      return `• ${i.quantity}x ${i.nombre}${variante ? ` (${variante})` : ''} - $${(Number(i.precio) * i.quantity).toLocaleString('es-AR')}`
    })
    const mensaje = `Hola! Quiero hacer un pedido:\n${lineas.join('\n')}\nTotal: $${Number(total).toLocaleString('es-AR')}${totalTransf ? `\n💵 Con transferencia: $${Number(totalTransf).toLocaleString('es-AR')}` : ''}`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}`, '_blank')
    clear()
  }

  if (cart.length === 0) {
    return (
      <div className={styles.wrap}>
        <h2 className={styles.titulo}>Tu carrito</h2>
        <div className={styles.vacioBox}>
          <p className={styles.vacio}>🛒 Tu carrito está vacío</p>
          <Link to="/" className={styles.seguir}>Ver productos</Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <h2 className={styles.titulo}>Tu carrito</h2>
      <div className={styles.items}>
        {cart.map(i => (
          <div key={`${i.id}-${i.variante_id || 'legacy'}-${i.talle || ''}`} className={styles.item}>
            <img src={optimizeImage(i.imagen_url, 150)} alt={i.nombre} className={styles.img} />
            <div className={styles.detalle}>
              <p className={styles.nombre}>{i.nombre}</p>
              {i.talle && <p className={styles.talle}>Talle {i.talle}</p>}
              {i.color && <p className={styles.talle}>Color {i.color}</p>}
              <p className={styles.precio}>${Number(i.precio).toLocaleString('es-AR')}</p>
              <div className={styles.qty}>
                <button onClick={() => setQty(i.id, i.variante_id, i.quantity - 1)} className={styles.qtyBtn}><Minus size={14} /></button>
                <span>{i.quantity}</span>
                <button onClick={() => setQty(i.id, i.variante_id, i.quantity + 1)} className={styles.qtyBtn}><Plus size={14} /></button>
              </div>
            </div>
            <button onClick={() => remove(i.id, i.variante_id)} className={styles.borrar}><Trash2 size={16} /></button>
          </div>
        ))}
      </div>

      <div className={styles.resumen}>
        <div className={styles.totalLinea}>
          <span>Total</span>
          <strong>${Number(total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong>
        </div>
        {totalTransf && (
          <div className={styles.totalLinea}>
            <span className={styles.totalTransfLabel}>Con transferencia</span>
            <strong className={styles.totalTransf}>
              ${Number(totalTransf).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </strong>
          </div>
        )}
        <button className={styles.pedir} onClick={enviarPedido} disabled={!phone}>
          <MessageCircle size={18} /> Enviar pedido por WhatsApp
        </button>
        <p className={styles.nota}>El pago se coordina con el local, contra entrega o en el local.</p>
      </div>
    </div>
  )
}