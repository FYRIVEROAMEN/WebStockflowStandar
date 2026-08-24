import { useEffect, useRef, useState } from 'react'
import { Check, X } from 'lucide-react'

const RATIO = 16 / 9
const OUT_W = 1600

export default function EditorRecorte({ file, onConfirm, onCancel }) {
  const [url, setUrl] = useState('')
  const [img, setImg] = useState(null)
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 })
  const [subiendo, setSubiendo] = useState(false)
  const boxRef = useRef(null)
  const drag = useRef(null)

  useEffect(() => {
    const u = URL.createObjectURL(file)
    setUrl(u)
    const i = new Image()
    i.onload = () => setImg(i)
    i.src = u
    return () => URL.revokeObjectURL(u)
  }, [file])

  const onDown = (e) => {
    e.preventDefault()
    drag.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onMove = (e) => {
    if (!drag.current || !boxRef.current) return
    const r = boxRef.current.getBoundingClientRect()
    const dx = (e.clientX - drag.current.x) / r.width
    const dy = (e.clientY - drag.current.y) / r.height
    setPos({
      x: Math.min(1, Math.max(0, drag.current.px - dx)),
      y: Math.min(1, Math.max(0, drag.current.py - dy))
    })
  }

  const onUp = () => { drag.current = null }

  const confirmar = async () => {
    if (!img) return
    setSubiendo(true)
    try {
      const w = img.naturalWidth
      const h = img.naturalHeight
      let sw, sh
      if (w / h > RATIO) { sh = h; sw = h * RATIO } else { sw = w; sh = w / RATIO }
      const sx = pos.x * (w - sw)
      const sy = pos.y * (h - sh)
      const canvas = document.createElement('canvas')
      canvas.width = OUT_W
      canvas.height = Math.round(OUT_W / RATIO)
      canvas.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
      const blob = await new Promise(res => canvas.toBlob(res, 'image/webp', 0.85))
      await onConfirm(blob)
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <div style={{ marginTop: 10 }}>
      <div
        ref={boxRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        style={{
          aspectRatio: '16 / 9', borderRadius: 8, overflow: 'hidden',
          cursor: 'grab', touchAction: 'none', position: 'relative', background: '#111'
        }}
      >
        {url && (
          <img
            src={url}
            alt=""
            draggable={false}
            style={{
              width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              objectPosition: `${pos.x * 100}% ${pos.y * 100}%`,
              pointerEvents: 'none'
            }}
          />
        )}
        <span style={{
          position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,.6)', color: '#fff', fontSize: '.68rem', fontWeight: 700,
          padding: '3px 10px', borderRadius: 999, pointerEvents: 'none', whiteSpace: 'nowrap'
        }}>
          ✋ Arrastrá para encuadrar
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button
          onClick={confirmar}
          disabled={subiendo || !img}
          style={{
            flex: 1, padding: 10, border: 'none', borderRadius: 8, background: '#16a34a',
            color: '#fff', fontWeight: 700, fontSize: '.8rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            opacity: !img ? .5 : 1
          }}
        >
          <Check size={14} /> {subiendo ? 'Subiendo...' : 'Usar esta foto'}
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: '10px 14px', border: 'none', borderRadius: 8, background: '#e5e7eb',
            color: '#111827', fontWeight: 700, fontSize: '.8rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6
          }}
        >
          <X size={14} /> Cancelar
        </button>
      </div>
    </div>
  )
}