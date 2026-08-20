import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getPublicadosWeb } from '../services/api'
import ProductCard from '../components/ProductCard'
import styles from './Categoria.module.css'

export default function Categoria() {
  const { nombre } = useParams()
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [talle, setTalle] = useState('')
  const [color, setColor] = useState('')

  useEffect(() => {
    const cargar = async () => {
      setLoading(true)
      try {
        const { data } = await getPublicadosWeb()
        setProductos((data || []).filter(p => (p.categoria || '').toLowerCase() === (nombre || '').toLowerCase()))
      } catch (err) {
        console.error('Error cargando categoría:', err)
      }
      setLoading(false)
    }
    cargar()
  }, [nombre])

  // ✅ Talles y colores ahora vienen de las variantes si las tiene
  const getVariantes = (p) => p.variantes || []

  const talles = [...new Set(productos.flatMap(p => {
    const vars = getVariantes(p)
    if (vars.length > 0) return vars.map(v => v.talle).filter(Boolean)
    return (p.talle || '').split(/[\s,]+/).filter(Boolean)
  }))]

  const colores = [...new Set(productos.flatMap(p => {
    const vars = getVariantes(p)
    if (vars.length > 0) return vars.map(v => v.color).filter(Boolean)
    return [(p.color || '').trim()].filter(Boolean)
  }))]

  const filtrados = productos.filter(p => {
    const vars = getVariantes(p)
    if (!talle && !color) return true

    if (vars.length > 0) {
      return vars.some(v =>
        (!talle || v.talle === talle) &&
        (!color || v.color === color)
      )
    }
    return (!talle || (p.talle || '').includes(talle)) &&
           (!color || (p.color || '').trim() === color)
  })

  return (
    <div className={styles.wrap}>
      <h2 className={styles.titulo}>{nombre}</h2>

      {(talles.length > 0 || colores.length > 0) && (
        <div className={styles.filtros}>
          {talles.map(t => (
            <button key={t} className={`${styles.chip} ${talle === t ? styles.chipActivo : ''}`} onClick={() => setTalle(talle === t ? '' : t)}>
              {t}
            </button>
          ))}
          {colores.map(c => (
            <button key={c} className={`${styles.chip} ${color === c ? styles.chipActivo : ''}`} onClick={() => setColor(color === c ? '' : c)}>
              {c}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className={styles.vacio}>Cargando...</p>
      ) : filtrados.length === 0 ? (
        <p className={styles.vacio}>No hay productos publicados en esta categoría todavía.</p>
      ) : (
        <div className={styles.grilla}>
          {filtrados.map(p => <ProductCard key={p.id} producto={p} />)}
        </div>
      )}
    </div>
  )
}