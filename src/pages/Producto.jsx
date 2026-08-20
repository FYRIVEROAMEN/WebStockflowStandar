import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, ShoppingCart, Check } from 'lucide-react'
import { getProductoWeb } from '../services/api'
import { optimizeImage } from '../utils/image'
import { useCart } from '../context/CartContext'
import styles from './Producto.module.css'

export default function Producto() {
  const { id } = useParams()
  const { add } = useCart()
  const [producto, setProducto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fotoActual, setFotoActual] = useState(0)
  const [talleSel, setTalleSel] = useState('')
  const [colorSel, setColorSel] = useState('')
  const [agregado, setAgregado] = useState(false)

  useEffect(() => {
    setTalleSel('')
    setColorSel('')
    setFotoActual(0)
    const cargar = async () => {
      setLoading(true)
      try {
        const { data } = await getProductoWeb(id)
        setProducto(data)
      } catch (err) {
        console.error('Error cargando producto:', err)
      }
      setLoading(false)
    }
    cargar()
  }, [id])

  if (loading) return <p className={styles.estado}>Cargando...</p>
  if (!producto) return <p className={styles.estado}>Producto no disponible.</p>

  const variantes = producto.variantes || []
  const tieneVariantes = variantes.length > 0
  const talles = [...new Set(variantes.map(v => v.talle).filter(Boolean))]
  
  // ✅ FIX: agrupación case-insensitive de colores por talle
  const coloresMap = new Map()
  for (const v of variantes.filter(v => v.talle === talleSel)) {
    const raw = (v.color || '').trim()
    if (!raw) continue
    const key = raw.toLowerCase()
    if (!coloresMap.has(key)) coloresMap.set(key, raw)
  }
  const coloresDeTalle = [...coloresMap.values()]
  
  // ✅ FIX: comparación case-insensitive al encontrar la variante
  const varianteSel = variantes.find(v =>
    v.talle === talleSel && (v.color || '').toLowerCase() === colorSel.toLowerCase()
  )
  
  const tallesLegacy = (producto.talle || '').split(/[\s,]+/).filter(Boolean)

  const precio = varianteSel?.precio ?? producto.web_precio ?? producto.precio
  const fotos = [producto.imagen_url, ...(producto.web_fotos || [])].filter(Boolean)
  const stockTotal = tieneVariantes ? variantes.reduce((s, v) => s + v.stock, 0) : producto.stock
  const puedeComprar = tieneVariantes ? !!varianteSel && varianteSel.stock > 0 : stockTotal > 0
  const stockMostrado = tieneVariantes ? (varianteSel ? varianteSel.stock : stockTotal) : producto.stock

  const handleAdd = () => {
    if (tieneVariantes) {
      if (!varianteSel) return
      add(producto, varianteSel)
    } else {
      add(producto, { talle: talleSel || null, color: producto.color || null, stock: producto.stock })
    }
    setAgregado(true)
    setTimeout(() => setAgregado(false), 1500)
  }

  return (
    <div className={styles.wrap}>
      <Link to="/" className={styles.volver}><ChevronLeft size={18} /> Volver</Link>

      <div className={styles.layout}>
        <div>
          <div className={styles.fotoBox}>
            {fotos.length > 0 ? (
              <img src={optimizeImage(fotos[fotoActual], 1200)} alt={producto.nombre} className={styles.foto} />
            ) : (
              <div className={styles.sinFoto}>🛍️</div>
            )}
          </div>

          {fotos.length > 1 && (
            <div className={styles.thumbs}>
              {fotos.map((f, i) => (
                <button
                  key={i}
                  className={`${styles.thumb} ${i === fotoActual ? styles.thumbActiva : ''}`}
                  onClick={() => setFotoActual(i)}
                >
                  <img src={optimizeImage(f, 150)} alt={`${producto.nombre} ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.info}>
          <p className={styles.categoria}>{producto.categoria}</p>
          <h2 className={styles.nombre}>{producto.nombre}</h2>
          <p className={styles.precio}>${Number(precio).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>

          {producto.web_descripcion && <p className={styles.descripcion}>{producto.web_descripcion}</p>}

          {tieneVariantes ? (
            <>
              {talles.length > 0 && (
                <div className={styles.bloque}>
                  <p className={styles.bloqueTitulo}>Talle</p>
                  <div className={styles.talles}>
                    {talles.map(t => {
                      const stockT = variantes.filter(v => v.talle === t).reduce((s, v) => s + v.stock, 0)
                      return (
                        <button
                          key={t}
                          disabled={stockT <= 0}
                          className={`${styles.chip} ${talleSel === t ? styles.chipActivo : ''} ${stockT <= 0 ? styles.chipAgotado : ''}`}
                          onClick={() => { setTalleSel(talleSel === t ? '' : t); setColorSel('') }}
                        >
                          {t}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {talleSel && coloresDeTalle.length > 0 && (
                <div className={styles.bloque}>
                  <p className={styles.bloqueTitulo}>Color</p>
                  <div className={styles.talles}>
                    {coloresDeTalle.map(c => {
                      // ✅ FIX: comparación case-insensitive
                      const v = variantes.find(x => x.talle === talleSel && (x.color || '').toLowerCase() === c.toLowerCase())
                      const agotado = !v || v.stock <= 0
                      return (
                        <button
                          key={c}
                          disabled={agotado}
                          className={`${styles.chip} ${colorSel === c ? styles.chipActivo : ''} ${agotado ? styles.chipAgotado : ''}`}
                          onClick={() => setColorSel(colorSel === c ? '' : c)}
                        >
                          {c}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {tallesLegacy.length > 0 && (
                <div className={styles.bloque}>
                  <p className={styles.bloqueTitulo}>Talle</p>
                  <div className={styles.talles}>
                    {tallesLegacy.map(t => (
                      <button
                        key={t}
                        className={`${styles.chip} ${talleSel === t ? styles.chipActivo : ''}`}
                        onClick={() => setTalleSel(talleSel === t ? '' : t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {producto.color && <p className={styles.color}>Color: <strong>{producto.color}</strong></p>}
            </>
          )}

          <button className={styles.comprar} onClick={handleAdd} disabled={!puedeComprar}>
            {stockTotal <= 0
              ? 'Agotado'
              : agregado
                ? <><Check size={18} /> Agregado</>
                : <><ShoppingCart size={18} /> Agregar al carrito</>}
          </button>
          <p className={styles.stockTxt}>
            {varianteSel ? `${varianteSel.stock} unidades en ${talleSel} · ${colorSel}` : `${stockMostrado} unidades disponibles`}
          </p>
        </div>
      </div>
    </div>
  )
}