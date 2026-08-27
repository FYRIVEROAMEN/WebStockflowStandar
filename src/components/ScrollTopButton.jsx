import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import styles from './ScrollTopButton.module.css'

export default function ScrollTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      // Aparece después de 400px (aprox 1 viewport mobile)
      setVisible(window.scrollY > 400)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const subir = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      onClick={subir}
      className={`${styles.fab} ${visible ? styles.fabVisible : ''}`}
      aria-label="Volver arriba"
      title="Volver arriba"
    >
      <ArrowUp size={22} />
    </button>
  )
}