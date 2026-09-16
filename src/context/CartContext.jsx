import { createContext, useContext, useState, useEffect } from 'react'
import { LOCAL_ID } from '../services/supabaseClient'

const CartContext = createContext(null)

// 🏢 Key scopleada por tenant: cada local tiene SU carrito
const storageKey = () => `sf_cart_${LOCAL_ID || 'anon'}`

const keyOf = (i) => `${i.id}-${i.variante_id || 'legacy'}-${i.talle || ''}-${i.color || ''}`

const loadCart = () => {
  try {
    const raw = localStorage.getItem(storageKey())
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

const saveCart = (cart) => {
  try { localStorage.setItem(storageKey(), JSON.stringify(cart)) } catch {}
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => loadCart())
  const [toast, setToast] = useState(null)

  //  Persistencia: cada cambio va a localStorage
  useEffect(() => { saveCart(cart) }, [cart])

  //  Si cambia el tenant (dev con ?dominio=), recargar el carrito del nuevo
  useEffect(() => {
    setCart(loadCart())
  }, [LOCAL_ID])

  const showToast = (nombre, detalle) => {
    setToast({ nombre, detalle, key: Date.now() })
    setTimeout(() => setToast(null), 2200)
  }

  const add = (producto, variante) => {
    const varianteId = variante?.id || null
    const talle = variante?.talle || null
    const color = variante?.color || null
    const precio = variante?.precio ?? producto.web_precio ?? producto.precio
    const stockMax = variante?.stock ?? producto.stock ?? 999

    setCart(prev => {
      const key = keyOf({ id: producto.id, variante_id: varianteId, talle, color })
      const existing = prev.find(i => keyOf(i) === key)
      if (existing) {
        if (existing.quantity + 1 > stockMax) return prev
        return prev.map(i => (keyOf(i) === key ? { ...i, quantity: i.quantity + 1 } : i))
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

    const detalle = [talle && `Talle ${talle}`, color && `Color ${color}`].filter(Boolean).join(' · ')
    showToast(producto.nombre, detalle)
  }

  const setQty = (id, varianteId, talle, color, qty) => {
    if (qty < 1) return remove(id, varianteId, talle, color)
    setCart(prev => prev.map(i =>
      keyOf(i) === keyOf({ id, variante_id: varianteId, talle, color })
        ? { ...i, quantity: Math.min(qty, i.stock ?? qty) }
        : i
    ))
  }

  const remove = (id, varianteId, talle, color) => {
    setCart(prev => prev.filter(i =>
      keyOf(i) !== keyOf({ id, variante_id: varianteId, talle, color })
    ))
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