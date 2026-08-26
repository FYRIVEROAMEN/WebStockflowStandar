import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { getPublicadosWeb } from '../services/api'
import ProductCard from '../components/ProductCard'
import styles from './Seccion.module.css'

// Normaliza: minúsculas + sin tildes + sin espacios
const norm = (s) => (s || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

// Genera todas las formas posibles de un nombre:
// tal cual, sin s, sin es, con s, con es
// → "mujer" y "mujeres" comparten la clave "mujer"
// → "hombre" y "hombres" comparten la clave "hombre"
const clavesDe = (s) => {
  const base = norm(s)
  const set = new Set([base])
  if (base.endsWith('s')) set.add(base.slice(0, -1))
  if (base.endsWith('es')) set.add(base.slice(0, -2))
  set.add(base + 's')
  set.add(base + 'es')
  return set
}

const coincide = (a, b) => {
  const ka = clavesDe(a)
  const kb = clavesDe(b)
  for (const x of ka) if (kb.has(x)) return true
  return false
}

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

  // Matching tolerante por sección (web_categoria)
  const porWebCat = productos.filter(p => coincide(p.web_categoria, nombre))
  // Si la sección no existe tal cual, fallback a la categoría libre de gestión
  const deSeccion = porWebCat.length > 0
    ? porWebCat
    : productos.filter(p => coincide(p.categoria, nombre))

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