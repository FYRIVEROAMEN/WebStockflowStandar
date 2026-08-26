import { useState } from 'react'
import { CheckCircle2, Circle, ChevronDown, PartyPopper } from 'lucide-react'

export default function PanelGuia({ datos }) {
  const pasos = [
    { ok: !!datos.logo, t: 'Subí tu logo', d: 'tu marca arriba' },
    { ok: !!datos.whatsapp, t: 'Cargá tu WhatsApp', d: 'pedidos a tu celu' },
    { ok: datos.categorias > 0, t: 'Creá tus categorías', d: 'ej: Mujer, Deco' },
    { ok: datos.banners > 0, t: 'Armá tu banner', d: 'la portada de tu home' },
    { ok: datos.fotosCards > 0, t: 'Fotos en las cards', d: 'cada sección con imagen' },
  ]
  const listos = pasos.filter(p => p.ok).length
  const completo = listos === pasos.length

  // 🧠 Auto-comportamiento:
  // - con pasos pendientes → expandido (guía activa)
  // - todo listo → colapsado a banner finito (estado de cuenta)
  // - el dueño puede expandir/colapsar tocando
  const [expandido, setExpandido] = useState(null)
  const abierto = expandido === null ? !completo : expandido

  // ✅ ESTADO DE CUENTA: todo listo y colapsado
  if (completo && !abierto) {
    return (
      <button
        onClick={() => setExpandido(true)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: 12,
          padding: '10px 14px',
          cursor: 'pointer',
          marginBottom: 16
        }}
      >
        <span style={{ fontWeight: 800, fontSize: '.85rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6 }}>
          <PartyPopper size={16} /> ¡Tu tienda está lista para vender!
        </span>
        <ChevronDown size={16} style={{ color: '#16a34a' }} />
      </button>
    )
  }

  // 📋 GUÍA ACTIVA (o expandida a pedido)
  return (
    <div style={{
      background: completo ? '#f0fdf4' : '#eff6ff',
      border: `1px solid ${completo ? '#bbf7d0' : '#bfdbfe'}`,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <p style={{ margin: '0 0 4px', fontWeight: 800, fontSize: '.95rem', color: '#111827' }}>
          {completo
            ? '🎉 ¡Tu tienda está lista para vender!'
            : `Configurá tu tienda en 5 minutos · ${listos} de ${pasos.length} listos`}
        </p>
        {completo && (
          <button
            onClick={() => setExpandido(false)}
            title="Achicar"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', display: 'flex', padding: 4 }}
          >
            <ChevronDown size={16} style={{ transform: 'rotate(180deg)' }} />
          </button>
        )}
      </div>

      <div style={{ height: 6, background: '#e5e7eb', borderRadius: 999, margin: '8px 0 12px', overflow: 'hidden' }}>
        <div style={{
          width: `${(listos / pasos.length) * 100}%`,
          height: '100%',
          background: completo ? '#16a34a' : '#2563eb',
          borderRadius: 999,
          transition: 'width .4s ease'
        }} />
      </div>

      {pasos.map(p => (
        <div key={p.t} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          {p.ok
            ? <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
            : <Circle size={16} style={{ color: '#9ca3af', flexShrink: 0 }} />}
          <span style={{ fontSize: '.85rem', fontWeight: 700, color: p.ok ? '#16a34a' : '#111827' }}>
            {p.t}
          </span>
          {!p.ok && <span style={{ fontSize: '.75rem', color: '#6b7280' }}>· {p.d}</span>}
        </div>
      ))}

      <p style={{ margin: '8px 0 0', fontSize: '.72rem', color: '#6b7280' }}>
        💡 Todo se guarda solo mientras escribís. Mirá el resultado en "Mi vidriera".
      </p>
    </div>
  )
}