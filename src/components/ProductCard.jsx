import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Check, Eye } from 'lucide-react'
import { optimizeImage } from '../utils/image'
import { useCart } from '../context/CartContext'
import { useLocal } from '../context/LocalContext'
import styles from './ProductCard.module.css'

const COLOR_HEX = {
  negro: '#111827', blanco: '#ffffff', gris: '#9ca3af', rojo: '#dc2626', azul: '#2563eb',
  verde: '#16a34a', bordo: '#7f1d1d', arena: '#d6c7a1', beige: '#e5d9b8', marron: '#7c4a21',
  cafe: '#6f4e37', chocolate: '#5d3a1a', natural: '#e8dcc8', rosa: '#f472b6', violeta: '#7c3aed',
  amarillo: '#facc15', naranja: '#fb923c', celeste: '#7dd3fc', militar: '#5b6b3f', topo: '#8b7d6b',
  camel: '#c19a6b', melange: '#b0b0b0'
}

export default function ProductCard({ producto }) {
  const navigate = useNavigate()
  const { add } = useCart()
  const { config } = useLocal()
  const [agregado, setAgregado] = useState(false)

  const variantes = producto.variantes || []
  const sinVariantes = variantes.length === 0
    const coloresMap = new Map()
  for (const v of variantes) {
    const raw = (v.color || '').trim()
    if (!raw) continue
    const key = raw.toLowerCase()
    if (!coloresMap.has(key)) coloresMap.set(key, raw)
  }
  const colores = [...coloresMap.values()]
  const agregaDirecto = sinVariantes || (variantes.length === 1 && variantes[0].stock > 0)

  // 💵 Lista arriba (normal) · transferencia abajo (más barato)
  const DESC_TRANSF = Number(config.descuentoTransferencia || 0)
  const precioLista = Number(producto.web_precio ?? producto.precio)
  const precioTransf = DESC_TRANSF > 0 ? precioLista * (1 - DESC_TRANSF / 100) : null

  const stockTotal = sinVariantes ? producto.stock : variantes.reduce((s, v) => s + v.stock, 0)
  const esNuevo = producto.web_aprobado_en &&
    (Date.now() - new Date(producto.web_aprobado_en).getTime()) < 14 * 24 * 3600 * 1000

  const irADetalle = () => navigate(`/producto/${producto.id}`)

  const handleAdd = (e) => {
    e.stopPropagation()
    add(producto, sinVariantes ? { talle: null, color: null, stock: producto.stock } : variantes[0])
    setAgregado(true)
    setTimeout(() => setAgregado(false), 1200)
  }

  return (
    <div className={styles.card} onClick={irADetalle} role="button" tabIndex={0}>
      <div className={styles.imgBox}>
        {producto.imagen_url ? (
          <img src={optimizeImage(producto.imagen_url, 600)} alt={producto.nombre} className={styles.img} loading="lazy" />
        ) : (
          <div className={styles.sinFoto}>🛍️</div>
        )}
        <div className={styles.badges}>
          {esNuevo && <span className={styles.badgeNuevo}>Nuevo</span>}
          {colores.length > 1 && <span className={styles.badgeColores}>{colores.length} colores</span>}
          {stockTotal <= 0 && <span className={styles.badgeAgotado}>Agotado</span>}
        </div>
      </div>

      <p className={styles.nombre}>{producto.nombre}</p>

      <p className={styles.precio}>${Number(precioLista).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
      {precioTransf && (
        <p className={styles.precioTransf}>
          💵 ${Number(precioTransf).toLocaleString('es-AR', { minimumFractionDigits: 2 })} con transferencia
        </p>
      )}

      {/* Dots INFORMATIVOS: muestran colores disponibles, no se clickean */}
      {colores.length > 0 && (
        <div className={styles.dots}>
          {colores.slice(0, 5).map(c => (
            <span
              key={c}
              className={styles.dot}
              title={c}
              style={{ background: COLOR_HEX[c.toLowerCase()] || '#9ca3af' }}
            />
          ))}
          {colores.length > 5 && <span className={styles.dotMas}>+{colores.length - 5}</span>}
        </div>
      )}

      <button
        className={styles.comprar}
        onClick={agregaDirecto ? handleAdd : (e) => { e.stopPropagation(); irADetalle(); }}
        disabled={stockTotal <= 0}
      >
        {stockTotal <= 0
          ? 'Agotado'
          : agregado
            ? <><Check size={14} /> ¡Listo!</>
            : agregaDirecto
              ? <><ShoppingCart size={14} /> Agregar</>
              : <><Eye size={14} /> Ver opciones</>}
      </button>
    </div>
  )
}