import { MessageCircle } from 'lucide-react'
import styles from './FloatingWhatsApp.module.css'

export default function FloatingWhatsApp() {
  const phone = import.meta.env.VITE_WHATSAPP
  if (!phone) return null
  return (
    <a
      href={`https://wa.me/${phone}?text=${encodeURIComponent('Hola! Vi el catálogo y tengo una consulta.')}`}
      target="_blank"
      rel="noreferrer"
      className={styles.boton}
      title="Chateá por WhatsApp"
    >
      <MessageCircle size={26} />
    </a>
  )
}