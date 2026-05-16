import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, AuthState } from '@/types/auth';

// ─── Mock Data ────────────────────────────────────────────────────────────────
// Bypass credentials – no backend required
export const MOCK_CREDENTIALS = {
  email: 'admin@shieldnet.local',
  password: 'Admin1234',
};

export const MOCK_USER: UserProfile = {
  id: 'mock-user-001',
  fullName: 'Admin User',
  email: 'admin@shieldnet.local',
  createdAt: '2025-01-01T00:00:00.000Z',
};
// ─────────────────────────────────────────────────────────────────────────────

interface AuthStoreState extends AuthState {
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  register: (
    fullName: string,
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,

      setLoading: (isLoading) => set({ isLoading }),

      login: async (email, password) => {
        set({ isLoading: true });

        // Simulate network delay
        await new Promise((r) => setTimeout(r, 800));

        const normalizedEmail = email.trim().toLowerCase();

        if (
          normalizedEmail === MOCK_CREDENTIALS.email &&
          password === MOCK_CREDENTIALS.password
        ) {
          set({
            user: MOCK_USER,
            session: 'mock-session-token-' + Date.now(),
            isAuthenticated: true,
            isLoading: false,
          });
          return { error: null };
        }

        set({ isLoading: false });
        return { error: 'Invalid email or password. Use admin@shieldnet.local / Admin1234' };
      },

      register: async (fullName, email, password) => {
        set({ isLoading: true });

        // Simulate network delay
        await new Promise((r) => setTimeout(r, 1000));

        const newUser: UserProfile = {
          id: 'mock-user-' + Date.now(),
          fullName,
          email: email.trim().toLowerCase(),
          createdAt: new Date().toISOString(),
        };

        set({
          user: newUser,
          session: 'mock-session-token-' + Date.now(),
          isAuthenticated: true,
          isLoading: false,
        });

        return { error: null };
      },

      logout: () => {
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist auth state, not loading flag
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
