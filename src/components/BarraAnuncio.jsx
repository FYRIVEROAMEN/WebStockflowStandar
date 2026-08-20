import { useLocal } from '../context/LocalContext'
import styles from './BarraAnuncio.module.css'

export default function BarraAnuncio() {
  const { config } = useLocal()
  const texto = config.anuncio || ''

  if (!texto) return null

  return (
    <div className={styles.barra}>
      <div className={styles.track}>
        <span>{texto} &nbsp;•&nbsp; {texto} &nbsp;•&nbsp; {texto} &nbsp;•&nbsp; </span>
        <span>{texto} &nbsp;•&nbsp; {texto} &nbsp;•&nbsp; {texto} &nbsp;•&nbsp; </span>
      </div>
    </div>
  )
}