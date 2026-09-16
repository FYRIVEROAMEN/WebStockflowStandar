import { createClient } from '@supabase/supabase-js'

// ÚNICO cliente de toda la web: auth y queries comparten token
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// 🏢 MULTITENANT: nace null → resolveLocalId() decide en el arranque
export let LOCAL_ID = null

export async function resolveLocalId() {
  if (LOCAL_ID) return LOCAL_ID

  const params = new URLSearchParams(window.location.search)

  // 1) Override manual de prueba: ?local=N
  const forzado = Number(params.get('local'))
  if (forzado) {
    LOCAL_ID = forzado
    console.log('[M2] local forzado por ?local =', LOCAL_ID)
    return LOCAL_ID
  }

  // 2) Dominio a resolver: el simulado (?dominio=) o el hostname real
  const dominioTest = params.get('dominio')
  const host = dominioTest || window.location.hostname

  // 3) Dev SIN simulación: localhost → local del .env
  if (!dominioTest && (host === 'localhost' || host === '127.0.0.1')) {
    LOCAL_ID = Number(import.meta.env.VITE_LOCAL_ID || 1)
    console.log('[M2] local por .env (dev) =', LOCAL_ID)
    return LOCAL_ID
  }

  // 4) Dominio real o simulado: la DB dice qué local es
  const { data } = await supabase.rpc('local_id_por_dominio', { p_host: host })
  LOCAL_ID = data || Number(import.meta.env.VITE_LOCAL_ID || 1)
  console.log('[M2] local resuelto por dominio =', LOCAL_ID, '(host:', host, ')')
  return LOCAL_ID
}