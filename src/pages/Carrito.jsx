import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useLocal } from '../context/LocalContext'
import { optimizeImage } from '../utils/image'
import styles from './Carrito.module.css'

export default function Carrito() {
  const { cart, remove, setQty, total } = useCart()
  const { config } = useLocal()

  const DESC_TRANSF = Number(config.descuentoTransferencia || 0)
  const totalTransf = DESC_TRANSF > 0 ? total * (1 - DESC_TRANSF / 100) : null

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
          <div key={`${i.id}-${i.variante_id || 'legacy'}-${i.talle || ''}-${i.color || ''}`} className={styles.item}>
            <img src={optimizeImage(i.imagen_url, 150)} alt={i.nombre} className={styles.img} />
            <div className={styles.detalle}>
              <p className={styles.nombre}>{i.nombre}</p>
              {i.talle && <p className={styles.talle}>Talle {i.talle}</p>}
              {i.color && <p className={styles.talle}>Color {i.color}</p>}
              <p className={styles.precio}>${Number(i.precio).toLocaleString('es-AR')}</p>
              <div className={styles.qty}>
                <button onClick={() => setQty(i.id, i.variante_id, i.talle, i.color, i.quantity - 1)} className={styles.qtyBtn}><Minus size={14} /></button>
                <span>{i.quantity}</span>
                <button onClick={() => setQty(i.id, i.variante_id, i.talle, i.color, i.quantity + 1)} className={styles.qtyBtn}><Plus size={14} /></button>
              </div>
            </div>
            <button onClick={() => remove(i.id, i.variante_id, i.talle, i.color)} className={styles.borrar}><Trash2 size={16} /></button>
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
        <Link to="/checkout" className={styles.pedir}>
          Continuar compra →
        </Link>
        <p className={styles.nota}>El pago se coordina en el próximo paso.</p>
      </div>
    </div>
  )
}