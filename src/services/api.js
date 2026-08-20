import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
const LOCAL_ID = import.meta.env.VITE_LOCAL_ID || 1

// ---------- CATÁLOGO PÚBLICO ----------
export const getPublicadosWeb = async () => {
  const { data, error } = await supabase
    .from('productos')
    .select('*, variantes(id, talle, color, stock, precio, imagen_url)')
    .eq('local_id', LOCAL_ID)
    .eq('web_estado', 'publicado')
    .eq('activo', true)
    .order('web_aprobado_en', { ascending: false })
  if (error) throw error
  return { data }
}

export const getProductoWeb = async (id) => {
  const { data, error } = await supabase
    .from('productos')
    .select('*, variantes(id, talle, color, stock, precio, imagen_url)')
    .eq('id', id)
    .eq('local_id', LOCAL_ID)
    .single()
  if (error) throw error
  return { data }
}

export const getCategoriasWeb = async () => {
  const { data, error } = await supabase
    .from('productos')
    .select('categoria')
    .eq('local_id', LOCAL_ID)
    .eq('web_estado', 'publicado')
    .eq('activo', true)
  if (error) throw error
  const map = new Map()
  for (const p of data || []) {
    const raw = (p.categoria || '').trim()
    if (!raw) continue
    const key = raw.toLowerCase()
    if (map.has(key)) map.get(key).count++
    else map.set(key, { nombre: raw, count: 1 })
  }
  return { data: [...map.values()] }
}

// ---------- VARIANTES ----------
export const getVariantesWeb = async (productoId) => {
  const { data, error } = await supabase
    .from('variantes')
    .select('id, talle, color, stock, precio, imagen_url')
    .eq('producto_id', productoId)
    .eq('activo', true)
    .order('color', { ascending: true })
    .order('talle', { ascending: true })
  if (error) throw error
  return { data }
}

// ---------- PANEL ADMIN (aprobación) ----------
export const getPendientesWeb = async () => {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('local_id', LOCAL_ID)
    .eq('web_estado', 'pendiente')
    .order('web_enviado_en', { ascending: true })
  if (error) throw error
  return { data }
}

export const aprobarProductoWeb = async (productoId, { descripcion, fotos, destacado, precioWeb, webCategoria }) => {
  const { data, error } = await supabase
    .from('productos')
    .update({
      web_estado: 'publicado',
      web_categoria: webCategoria || null,
      web_descripcion: descripcion || null,
      web_fotos: fotos || [],
      web_destacado: destacado || false,
      web_precio: precioWeb ?? null,
      web_nota_rechazo: null,
      web_aprobado_en: new Date().toISOString()
    })
    .eq('id', productoId)
    .eq('local_id', LOCAL_ID)
  if (error) throw error
  return { data }
}

export const rechazarProductoWeb = async (productoId, nota) => {
  const { data, error } = await supabase
    .from('productos')
    .update({ web_estado: 'rechazado', web_nota_rechazo: nota })
    .eq('id', productoId)
    .eq('local_id', LOCAL_ID)
  if (error) throw error
  return { data }
}

export const quitarDeWeb = async (productoId) => {
  const { data, error } = await supabase
    .from('productos')
    .update({ web_estado: 'no_enviado', web_destacado: false })
    .eq('id', productoId)
    .eq('local_id', LOCAL_ID)
  if (error) throw error
  return { data }
}

// ---------- CONFIG DEL LOCAL (feature flags) ----------
export const getConfigLocal = async () => {
  const { data, error } = await supabase
    .from('locales')
    .select('config')
    .eq('id', LOCAL_ID)
    .single()
  if (error) throw error
  return { data: data.config || {} }
}

export const updateConfigLocal = async (patch) => {
  const { data: current, error: errRead } = await supabase
    .from('locales').select('config').eq('id', LOCAL_ID).single()
  if (errRead) throw errRead
  const nueva = { ...(current?.config || {}), ...patch }
  const { data, error } = await supabase
    .from('locales').update({ config: nueva }).eq('id', LOCAL_ID)
  if (error) throw error
  return { data }
}