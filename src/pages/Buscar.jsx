import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { buscarProductosWeb } from '../services/api'
import ProductCard from '../components/ProductCard'
import styles from './Buscar.module.css'

export default function Buscar() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!query) {
      setProductos([])
      setLoading(false)
      return
    }
    setLoading(true)
    buscarProductosWeb(query)
      .then(({ data }) => setProductos(data || []))
      .catch(err => console.error('Error buscando:', err))
      .finally(() => setLoading(false))
  }, [query])

  return (
    <div className={styles.buscar}>
      <div className={styles.header}>
        <h1 className={styles.titulo}>
          {query ? `Resultados para "${query}"` : 'Buscar productos'}
        </h1>
        {!loading && productos.length > 0 && (
          <p className={styles.sub}>{productos.length} producto{productos.length === 1 ? '' : 's'}</p>
        )}
      </div>

      {loading ? (
        <p className={styles.vacio}>Buscando...</p>
      ) : productos.length === 0 ? (
        query ? (
          <div className={styles.sinResultados}>
            <p className={styles.sinEmoji}>🔍</p>
            <p className={styles.sinTitulo}>No encontramos resultados</p>
            <p className={styles.sinSub}>Probá con otras palabras o revisá las categorías.</p>
            <Link to="/" className={styles.volver}>← Volver al inicio</Link>
          </div>
        ) : (
          <p className={styles.vacio}>Escribí arriba para buscar productos.</p>
        )
      ) : (
        <div className={styles.grilla}>
          {productos.map(p => (
            <ProductCard key={p.id} producto={p} />
          ))}
        </div>
      )}
    </div>
  )
}