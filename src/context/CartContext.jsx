import { createContext, useContext, useState } from 'react'

const CartContext = createContext(null)

const keyOf = (i) => `${i.id}-${i.variante_id || 'legacy'}`

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [toast, setToast] = useState(null)

  const showToast = (nombre, detalle) => {
    setToast({ nombre, detalle, key: Date.now() })
    setTimeout(() => setToast(null), 2200)
  }

  const add = (producto, variante) => {
    const varianteId = variante?.id || null
    const talle = variante?.talle || null
    const color = variante?.color || null
    const precio = variante?.precio ?? producto.web_precio ?? producto.precio
    const stockMax = variante?.stock ?? producto.stock

    setCart(prev => {
      const key = `${producto.id}-${varianteId || 'legacy'}-${talle || ''}`
      const existing = prev.find(i => keyOf(i) + `-${i.talle || ''}` === key)
      if (existing) {
        if (existing.quantity + 1 > (stockMax ?? 999)) return prev
        return prev.map(i => (keyOf(i) + `-${i.talle || ''}` === key ? { ...i, quantity: i.quantity + 1 } : i))
      }
      return [...prev, {
        id: producto.id,
        nombre: producto.nombre,
        imagen_url: variante?.imagen_url || producto.imagen_url,
        precio,
        stock: stockMax,
        variante_id: varianteId,
        talle,
        color,
        quantity: 1
      }]
    })

    const detalle = [talle && `Talle ${talle}`, color].filter(Boolean).join(' · ')
    showToast(producto.nombre, detalle)
  }

  const setQty = (id, varianteId, qty) => {
    if (qty < 1) return remove(id, varianteId)
    setCart(prev => prev.map(i =>
      i.id === id && (i.variante_id || null) === (varianteId || null)
        ? { ...i, quantity: Math.min(qty, i.stock ?? qty) }
        : i
    ))
  }

  const remove = (id, varianteId) => {
    setCart(prev => prev.filter(i => !(i.id === id && (i.variante_id || null) === (varianteId || null))))
  }

  const clear = () => setCart([])

  const total = cart.reduce((s, i) => s + Number(i.precio) * i.quantity, 0)
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0)

  return (
    <CartContext.Provider value={{ cart, add, setQty, remove, clear, total, cartCount }}>
      {children}
      {toast && (
        <div className="cart-toast" key={toast.key} role="status">
          <span className="cart-toast-check">✓</span>
          <div style={{ minWidth: 0 }}>
            <p className="cart-toast-nombre">{toast.nombre}</p>
            {toast.detalle && <p className="cart-toast-detalle">{toast.detalle}</p>}
          </div>
        </div>
      )}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}