import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPublicadosWeb } from '../services/api'
import { useLocal } from '../context/LocalContext'
import BarraAnuncio from '../components/BarraAnuncio'
import BannerPromo from '../components/BannerPromo'
import ProductCard from '../components/ProductCard'
import styles from './Home.module.css'

export default function Home() {
  const { config } = useLocal()
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPublicadosWeb()
      .then(({ data }) => setProductos(data || []))
      .catch(err => console.error('Error cargando catálogo:', err))
      .finally(() => setLoading(false))
  }, [])

  // Secciones = web_categoria definidos por el dueño, en su orden
    const deps = config.categoriasWeb || []
  const secciones = deps
    .map(d => ({ nombre: d, items: productos.filter(p => (p.web_categoria || '') === d) }))
    .filter(s => s.items.length > 0)

  const sinDep = productos.filter(p => !p.web_categoria || !deps.includes(p.web_categoria))
  const destacados = productos.filter(p => p.web_destacado)

    const esDueno = sessionStorage.getItem('admin_ok') === '1'
  const tieneSecciones = (config.categoriasWeb || []).length > 0  // ✅ arreglado

  // 🌱 Estado vacío: sin productos publicados todavía
  if (!loading && productos.length === 0) {
    return (
      <div className={styles.home}>
        <BarraAnuncio />
        {esDueno ? (
          <div className={styles.onboarding}>
            <h2 className={styles.onbTitulo}>🚀 Tu vidriera está lista</h2>
            <p className={styles.onbSub}>Completá estos pasos para abrir al público:</p>

            <div className={styles.paso}>
              <span className={tieneSecciones ? styles.pasoOk : styles.pasoNum}>
                {tieneSecciones ? '✓' : '1'}
              </span>
              <div>
                <p className={styles.pasoTxt}>Creá tus secciones (Mujer, Hombre...)</p>
                <Link to="/admin" className={styles.pasoBtn}>Ir a Mi vidriera →</Link>
              </div>
            </div>

            <div className={styles.paso}>
              <span className={styles.pasoNum}>2</span>
              <div>
                <p className={styles.pasoTxt}>Aprobá tu primer producto</p>
                <Link to="/admin" className={styles.pasoBtn}>Ir a Pendientes →</Link>
              </div>
            </div>

            <div className={styles.paso}>
              <span className={styles.pasoNum}>3</span>
              <div>
                <p className={styles.pasoTxt}>Escribí tu anuncio del mes</p>
                <Link to="/admin" className={styles.pasoBtn}>Configurar →</Link>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.onboarding}>
            <p className={styles.onbEmoji}>🏗️</p>
            <h2 className={styles.onbTitulo}>Estamos preparando la vidriera</h2>
            <p className={styles.onbSub}>Muy pronto vas a poder ver nuestros productos acá.</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={styles.home}>
      <BarraAnuncio />
      <BannerPromo />

      {/* 3 cards de secciones (patrón SKM: NEW COLLECTION / FINAL SALE / CONJUNTOS) */}
      {!loading && secciones.length > 0 && (
        <div className={styles.promos}>
                    {secciones.slice(0, 4).map((sec, i) => (
            <Link
              key={sec.nombre}
              to={`/seccion/${encodeURIComponent(sec.nombre)}`}
                           className={`${styles.promo} ${styles['promo' + ((i % 4) + 1)]}`}
            >
              <p className={styles.promoTitulo}>{sec.nombre}</p>
              <p className={styles.promoSub}>
                {sec.items.length} {sec.items.length === 1 ? 'producto' : 'productos'}
              </p>
              <span className={styles.promoBtn}>Ver todo</span>
            </Link>
          ))}
        </div>
      )}

      {loading ? (
        <p className={styles.vacio}>Cargando catálogo...</p>
      ) : (
        <>
          {secciones.map(sec => (
            <section key={sec.nombre} className={styles.seccion}>
              <div className={styles.seccionHeader}>
                <h2 className={styles.titulo}>{sec.nombre}</h2>
                <Link to={`/seccion/${encodeURIComponent(sec.nombre)}`} className={styles.verMas}>
                  Ver todo →
                </Link>
              </div>
              <div className={sec.items.length < 3 ? styles.grilla : styles.carrusel}>
                {sec.items.slice(0, 10).map(p => (
                  <div key={p.id} className={sec.items.length < 3 ? '' : styles.carruselItem}>
                    <ProductCard producto={p} />
                  </div>
                ))}
              </div>
            </section>
          ))}

          {sinDep.length > 0 && (
            <section className={styles.seccion}>
              <h2 className={styles.titulo}>Otros</h2>
              <div className={styles.grilla}>
                {sinDep.map(p => <ProductCard key={p.id} producto={p} />)}
              </div>
            </section>
          )}

          {destacados.length > 0 && (
            <section className={styles.seccion}>
              <h2 className={styles.titulo}>⭐ Destacados</h2>
              <div className={styles.grilla}>
                {destacados.map(p => <ProductCard key={p.id} producto={p} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}