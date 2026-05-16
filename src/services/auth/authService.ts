import { supabase } from '../supabase/supabaseClient'
import type { RegisterFormData, LoginFormData, UserProfile } from '@/types/auth'

export const authService = {

  async register(data: RegisterFormData): Promise<UserProfile> {
    // 1. Sign up with Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    })

    if (signUpError) throw new Error(signUpError.message)
    if (!authData.user) throw new Error('Registration failed. Please try again.')

    // 2. Insert profile with full name
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: data.fullName,
        email: data.email,
      })

    if (profileError) throw new Error(profileError.message)

    return {
      id: authData.user.id,
      fullName: data.fullName,
      email: data.email,
      createdAt: authData.user.created_at,
    }
  },

  async login(data: LoginFormData): Promise<UserProfile> {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) throw new Error(error.message)
    if (!authData.user) throw new Error('Login failed. Please try again.')

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError) throw new Error(profileError.message)

    return {
      id: profile.id,
      fullName: profile.full_name,
      email: profile.email,
      createdAt: profile.created_at,
    }
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(error.message)
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw new Error(error.message)
    return data.session
  },

  async getCurrentUser(): Promise<UserProfile | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) return null

    return {
      id: profile.id,
      fullName: profile.full_name,
      email: profile.email,
      createdAt: profile.created_at,
    }
  },
}
