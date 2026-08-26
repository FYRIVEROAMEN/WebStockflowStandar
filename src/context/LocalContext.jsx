import { createContext, useContext, useEffect, useState } from 'react'
import { getConfigLocal } from '../services/api'

const LocalContext = createContext(null)

export function LocalProvider({ children }) {
  const [config, setConfig] = useState({
    anuncio: '',
    descuentoTransferencia: 0,
    categoriasWeb: [],
    logoUrl: ''
  })

  const cargar = async () => {
    try {
      const { data } = await getConfigLocal()
      if (data) {
        setConfig({
          ...data,   // ← 🔑 TODO el jsonb crudo pasa: whatsapp, facebook,
                     //    hero_slides, sec_images y CUALQUIER key futura,
                     //    sin tocar este archivo nunca más
          // Alias camelCase para el código ya escrito (retrocompatibilidad)
          nombreLocal: data.nombre_local || '',
          anuncio: data.anuncio || import.meta.env.VITE_ANUNCIO || '',
          descuentoTransferencia: Number(data.descuento_transferencia ?? 0),
          categoriasWeb: data.web_categorias || [],
          logoUrl: data.logo_url || ''
        })
      }
    } catch (err) {
      console.error('Error cargando config del local:', err)
    }
  }

  useEffect(() => { cargar() }, [])

  return (
    <LocalContext.Provider value={{ config, refresh: cargar }}>
      {children}
    </LocalContext.Provider>
  )
}

export function useLocal() {
  return useContext(LocalContext)
}