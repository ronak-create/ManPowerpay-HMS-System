import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      authReady: false,
      login: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token, authReady: true });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, authReady: true });
      },
      setAuthReady: () => set({ authReady: true }),
    }),
    {
      name: 'auth-store',
      partialize: (s) => ({ user: s.user, token: s.token }),
    }
  )
);

export default useAuthStore;