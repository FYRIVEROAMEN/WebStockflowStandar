import { ChevronDown, Check, ArrowRight } from 'lucide-react'
import styles from './SeccionAcordeon.module.css'

export default function SeccionAcordeon({ numero, titulo, abierto, onToggle, preview, completo, onSiguiente, children }) {
  return (
    <div className={styles.wrap}>
      <div
        onClick={onToggle}
        className={`${styles.header} ${abierto ? styles.headerActivo : ''}`}
      >
        <span className={styles.paso}>Paso {numero}</span>
        <p className={styles.titulo}>{titulo}</p>
        {completo && !abierto && (
          <span className={styles.badge}><Check size={12} /> listo</span>
        )}
        {!completo && preview && (
          <span className={styles.preview}>{preview}</span>
        )}
        <ChevronDown
          size={18}
          className={`${styles.chevron} ${abierto ? styles.chevronAbierto : ''}`}
        />
      </div>
      <div className={`${styles.contenido} ${abierto ? styles.contenidoAbierto : ''}`}>
        {children}
        {onSiguiente && (
          <button onClick={onSiguiente} className={styles.siguiente}>
            Siguiente <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  )
}