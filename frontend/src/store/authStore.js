import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { applyBranding, resetBranding } from '../utils/branding';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      company: null, // tenant branding: { id, name, logoPath, brandColor }
      authReady: false,
      login: (user, token, company = null) => {
        localStorage.setItem('token', token);
        applyBranding(company);
        set({ user, token, company, authReady: true });
      },
      setCompany: (company) => {
        applyBranding(company);
        set({ company });
      },
      logout: () => {
        localStorage.removeItem('token');
        resetBranding();
        set({ user: null, token: null, company: null, authReady: true });
      },
      setAuthReady: () => set({ authReady: true }),
    }),
    {
      name: 'auth-store',
      partialize: (s) => ({ user: s.user, token: s.token, company: s.company }),
      // Re-apply the persisted tenant color as soon as the store rehydrates,
      // so a hard refresh doesn't flash the default theme.
      onRehydrateStorage: () => (state) => {
        if (state?.company) applyBranding(state.company);
      },
    }
  )
);

export default useAuthStore;
