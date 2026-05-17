import { create } from 'zustand';
import { UserProfile, AuthState } from '@/types/auth';

interface AuthStoreState extends AuthState {
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  register: (
    fullName: string,
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  session: null,
  isLoading: true, // Start with loading to simulate auth state check
  isAuthenticated: false,

  setLoading: (isLoading) => set({ isLoading }),

  initialize: () => {
    // Simulate checking for an existing session
    console.log('AuthStore: Initializing Mock Auth...');
    setTimeout(() => {
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }, 500);
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      console.log('AuthStore: Attempting mock login for:', email);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Accept any email/password combination for testing
      const mockUser: UserProfile = {
        id: `mock-uid-${Math.random().toString(36).substring(7)}`,
        fullName: email.split('@')[0],
        email: email,
        createdAt: new Date().toISOString(),
      };

      set({
        user: mockUser,
        session: mockUser.id,
        isAuthenticated: true,
        isLoading: false,
      });

      return { error: null };
    } catch (error: any) {
      console.error('AuthStore: Mock login failure:', error);
      set({ isLoading: false });
      return { error: 'Failed to authenticate.' };
    }
  },

  register: async (fullName, email, password) => {
    set({ isLoading: true });
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockUser: UserProfile = {
        id: `mock-uid-${Math.random().toString(36).substring(7)}`,
        fullName: fullName,
        email: email,
        createdAt: new Date().toISOString(),
      };
      
      set({
        user: mockUser,
        session: mockUser.id,
        isAuthenticated: true,
        isLoading: false,
      });

      return { error: null };
    } catch (error: any) {
      console.error('Mock Register Error:', error);
      set({ isLoading: false });
      return { error: 'Failed to create mock account.' };
    }
  },

  logout: async () => {
    try {
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Mock Logout Error:', error);
    }
  },
}));
