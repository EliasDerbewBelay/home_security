import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { authService } from '@/services/auth/authService'
import type { AuthState, LoginFormData, RegisterFormData } from '@/types/auth'

interface AuthStore extends AuthState {
  register: (data: RegisterFormData) => Promise<void>
  login: (data: LoginFormData) => Promise<void>
  logout: () => Promise<void>
  restoreSession: () => Promise<void>
  clearError: () => void
  error: string | null
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      register: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const user = await authService.register(data)
          set({ user, isAuthenticated: true, isLoading: false })
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'An unknown error occurred'
          set({ error: message, isLoading: false })
          throw err
        }
      },

      login: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const user = await authService.login(data)
          set({ user, isAuthenticated: true, isLoading: false })
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'An unknown error occurred'
          set({ error: message, isLoading: false })
          throw err
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await authService.logout()
          set({ user: null, session: null, isAuthenticated: false, isLoading: false })
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'An unknown error occurred'
          set({ error: message, isLoading: false })
        }
      },

      restoreSession: async () => {
        set({ isLoading: true })
        try {
          const user = await authService.getCurrentUser()
          set({ user, isAuthenticated: !!user, isLoading: false })
        } catch {
          set({ isAuthenticated: false, isLoading: false })
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
