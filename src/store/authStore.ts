import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

interface UserProfile {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isBiometricEnrolled: boolean;
  setAuth: (token: string, user: UserProfile) => void;
  logout: () => void;
  setBiometricEnrolled: (enrolled: boolean) => void;
}

// Secure storage adapter for Zustand
const secureStorage: StateStorage = {
  getItem: (name: string) => SecureStore.getItemAsync(name),
  setItem: (name: string, value: string) => SecureStore.setItemAsync(name, value),
  removeItem: (name: string) => SecureStore.deleteItemAsync(name),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isBiometricEnrolled: false,

      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
      setBiometricEnrolled: (isBiometricEnrolled) => set({ isBiometricEnrolled }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);
