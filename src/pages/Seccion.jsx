import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { getPublicadosWeb } from '../services/api'
import ProductCard from '../components/ProductCard'
import styles from './Seccion.module.css'

export default function Seccion() {
  const { nombre } = useParams()
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [catSel, setCatSel] = useState('')

  useEffect(() => {
    setCatSel('')
    getPublicadosWeb()
      .then(({ data }) => setProductos(data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [nombre])

    const deSeccion = productos.filter(p => (p.web_categoria || '') === nombre)

  const catsMap = new Map()
  for (const p of deSeccion) {
    const raw = (p.categoria || '').trim()
    if (!raw) continue
    const key = raw.toLowerCase()
    if (!catsMap.has(key)) catsMap.set(key, { nombre: raw, count: 0 })
    catsMap.get(key).count++
  }
  const cats = [...catsMap.values()]

  const visibles = catSel
    ? deSeccion.filter(p => (p.categoria || '').toLowerCase() === catSel.toLowerCase())
    : deSeccion

  return (
    <div className={styles.wrap}>
      <Link to="/" className={styles.volver}><ChevronLeft size={18} /> Volver</Link>
      <h2 className={styles.titulo}>{nombre}</h2>

      <div className={styles.layoutSec}>
        {cats.length > 0 && (
          <aside className={styles.sidebar}>
            <p className={styles.sidebarTitulo}>Categorías</p>
            <div className={styles.chips}>
              <button className={`${styles.chip} ${!catSel ? styles.chipActivo : ''}`} onClick={() => setCatSel('')}>
                Todo
              </button>
              {cats.map(c => (
                <button
                  key={c.nombre}
                  className={`${styles.chip} ${catSel === c.nombre ? styles.chipActivo : ''}`}
                  onClick={() => setCatSel(catSel === c.nombre ? '' : c.nombre)}
                >
                  {c.nombre} ({c.count})
                </button>
              ))}
            </div>
          </aside>
        )}

        <div className={styles.contenido}>
          {loading ? (
            <p className={styles.vacio}>Cargando...</p>
          ) : visibles.length === 0 ? (
            <p className={styles.vacio}>No hay productos en esta sección todavía.</p>
          ) : (
            <div className={styles.grilla}>
              {visibles.map(p => <ProductCard key={p.id} producto={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}