export default function OfertaChip({ producto }) {
  if (!producto.web_destacado) return null
  const precioBase = Number(producto.precio || 0)
  const precioWeb = producto.web_precio != null ? Number(producto.web_precio) : null
  const hayBaja = precioWeb != null && precioWeb < precioBase
  const pct = hayBaja ? Math.round((1 - precioWeb / precioBase) * 100) : 0

  const base = { borderRadius: 9999, padding: '2px 8px', color: '#fff', fontWeight: 800, boxShadow: '0 2px 6px rgba(0,0,0,.25)', whiteSpace: 'nowrap' }
  return (
    <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, zIndex: 2 }}>
      {hayBaja && <span style={{ ...base, background: '#dc2626', fontSize: 11 }}>-{pct}%</span>}
      <span style={{ ...base, background: '#f59e0b', fontSize: 10 }}>
        🔥 {producto.web_oferta_motivo || 'Oferta'}
      </span>
    </div>
  )
}