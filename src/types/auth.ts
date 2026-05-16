export interface RegisterFormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

export interface LoginFormData {
  email: string
  password: string
}

export interface UserProfile {
  id: string
  fullName: string
  email: string
  createdAt: string
}

export interface AuthState {
  user: UserProfile | null
  session: string | null
  isLoading: boolean
  isAuthenticated: boolean
}
