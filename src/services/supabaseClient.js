import { createClient } from '@supabase/supabase-js'

// ÚNICO cliente de toda la web: auth y queries comparten token
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export const LOCAL_ID = import.meta.env.VITE_LOCAL_ID || 1