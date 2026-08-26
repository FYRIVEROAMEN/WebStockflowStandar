import { ChevronDown, Check, ArrowRight } from 'lucide-react'

const s = {
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 16px',
    background: '#f9fafb',
    border: '1.5px solid #e5e7eb',
    borderRadius: 12,
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'background .2s ease'
  },
  headerActivo: {
    background: '#eff6ff',
    borderColor: '#93c5fd'
  },
  titulo: {
    flex: 1,
    fontSize: '.92rem',
    fontWeight: 800,
    color: '#111827',
    margin: 0
  },
  preview: {
    fontSize: '.75rem',
    color: '#6b7280',
    fontWeight: 500
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: '.7rem',
    fontWeight: 700,
    color: '#16a34a',
    background: '#dcfce7',
    padding: '3px 8px',
    borderRadius: 999
  },
  paso: {
    fontSize: '.7rem',
    fontWeight: 800,
    color: '#2563eb',
    background: '#dbeafe',
    padding: '3px 8px',
    borderRadius: 999
  },
  contenido: {
    maxHeight: 0,
    overflow: 'hidden',
    transition: 'max-height .35s ease, padding .35s ease',
    padding: '0 4px'
  },
  contenidoAbierto: {
    maxHeight: '2500px',
    padding: '16px 4px 4px'
  },
  chevron: {
    transition: 'transform .3s ease',
    color: '#6b7280',
    flexShrink: 0
  },
  siguiente: {
    width: '100%',
    marginTop: 4,
    padding: 12,
    border: 'none',
    borderRadius: 8,
    background: '#2563eb',
    color: '#fff',
    fontWeight: 700,
    fontSize: '.85rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  }
}

export default function SeccionAcordeon({ numero, titulo, abierto, onToggle, preview, completo, onSiguiente, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        onClick={onToggle}
        style={{ ...s.header, ...(abierto ? s.headerActivo : {}) }}
      >
        <span style={s.paso}>Paso {numero}</span>
        <p style={s.titulo}>{titulo}</p>
        {completo && !abierto && (
          <span style={s.badge}><Check size={12} /> listo</span>
        )}
        {!completo && preview && (
          <span style={s.preview}>{preview}</span>
        )}
        <ChevronDown
          size={18}
          style={{
            ...s.chevron,
            transform: abierto ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        />
      </div>
      <div style={{ ...s.contenido, ...(abierto ? s.contenidoAbierto : {}) }}>
        {children}
        {onSiguiente && (
          <button onClick={onSiguiente} style={s.siguiente}>
            Siguiente <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  )
}