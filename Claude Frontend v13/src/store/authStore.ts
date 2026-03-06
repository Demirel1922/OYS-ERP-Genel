import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Session } from '@/types';
import { apiFetch } from '@/lib/api';

interface AuthState {
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasModuleAccess: (moduleId: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      isAuthenticated: false,
      loading: false,

      login: async (username: string, password: string) => {
        set({ loading: true });
        try {
          const user = await apiFetch<User>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
          });
          const session: Session = {
            user,
            token: 'session-' + Date.now(),
            allowedModules: user.isAdmin ? [] : user.modules,
          };
          set({ session, isAuthenticated: true, loading: false });
          return true;
        } catch {
          set({ loading: false });
          return false;
        }
      },

      logout: () => {
        set({ session: null, isAuthenticated: false });
      },

      hasModuleAccess: (moduleId: string) => {
        const { session } = get();
        if (!session) return false;
        if (session.user.isAdmin) return true;
        return session.user.modules.includes(moduleId);
      },
    }),
    { name: 'oys-auth-store' }
  )
);
