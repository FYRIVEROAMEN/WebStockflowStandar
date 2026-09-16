import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, LOCAL_ID } from '../services/supabaseClient'

const AuthContext = createContext(null)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async (u) => {
    if (!u) return setProfile(null)
    
    // 1) Intentar cargar el profile normalmente
    let { data } = await supabase
      .from('profiles')
      .select('*, locales(nombre, web_activa)')
      .eq('id', u.id)
      .single()

    // 2) Parche OAuth: si entró por Google (u otro OAuth)
    //    y no tiene profile, crearlo al vuelo como customer
    if (!data && u.app_metadata?.provider && u.app_metadata.provider !== 'email') {
      await supabase.rpc('registrar_customer_oauth', { p_local_id: LOCAL_ID })
      const retry = await supabase
        .from('profiles')
        .select('*, locales(nombre, web_activa)')
        .eq('id', u.id)
        .single()
      data = retry.data
    }

    setProfile(data || null)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      loadProfile(session?.user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      loadProfile(session?.user)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const register = async (email, password, nombre, telefono) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { rol: 'customer', local_id: LOCAL_ID, nombre, telefono }
      }
    })
    if (error) throw error
    return data
  }

  const loginConGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/login' }
    })
    if (error) throw error
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const updateProfile = async (patch) => {
    if (!user) throw new Error('Sin sesión activa')
    const { data, error } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', user.id)
      .select('*, locales(nombre, web_activa)')
      .single()
    if (error) throw error
    setProfile(data)
    return data
  }

  const refreshProfile = async () => {
    if (!user) return
    await loadProfile(user)
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      login, 
      logout, 
      register, 
      loginConGoogle,
      updateProfile,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}