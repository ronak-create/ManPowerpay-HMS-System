// authStore.js
const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      authReady: false,          // ← add this
      login: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
      },
      setAuthReady: () => set({ authReady: true }),  // ← add this
    }),
    { name: 'auth-store', partialize: (s) => ({ user: s.user, token: s.token }) }
  )
);