import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.nombre}>{import.meta.env.VITE_NOMBRE_LOCAL || 'StockFlow'}</p>
      <p className={styles.linea}>Pedidos por WhatsApp · +{import.meta.env.VITE_WHATSAPP || '549...'}</p>
      <p className={styles.copy}>Hecho con StockFlow · {new Date().getFullYear()}</p>
    </footer>
  )
}