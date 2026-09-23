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
  const [cargando, setCargando] = useState(true)
  const [hostNoEncontrado, setHostNoEncontrado] = useState(false)

  const cargar = async () => {
    setCargando(true)
    try {
      const { data } = await getConfigLocal()
      if (data) {
        setConfig({
          ...data,
          nombreLocal: data.nombre_local || '',
          anuncio: data.anuncio || import.meta.env.VITE_ANUNCIO || '',
          descuentoTransferencia: Number(data.descuento_transferencia ?? 0),
          categoriasWeb: data.web_categorias || [],
          logoUrl: data.logo_url || ''
        })
        setHostNoEncontrado(false)
      } else {
        setHostNoEncontrado(true)
      }
    } catch (err) {
      // Si falla la config (404, RLS, etc.) → asumimos host desconocido
      console.error('Error cargando config del local:', err)
      setHostNoEncontrado(true)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  return (
    <LocalContext.Provider value={{ config, refresh: cargar, hostNoEncontrado, cargando }}>
      {children}
    </LocalContext.Provider>
  )
}

export function useLocal() {
  return useContext(LocalContext)
}