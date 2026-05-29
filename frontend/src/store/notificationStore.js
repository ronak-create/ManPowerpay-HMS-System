import { create } from 'zustand';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  setNotifications: (notifications, unreadCount) => set({ notifications, unreadCount }),
  setLoading: (loading) => set({ loading }),

  markRead: (id) => set(state => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n),
    unreadCount: Math.max(0, state.unreadCount - (state.notifications.find(n => n.id === id && !n.isRead) ? 1 : 0))
  })),

  markAllRead: () => set(state => ({
    notifications: state.notifications.map(n => ({ ...n, isRead: true })),
    unreadCount: 0
  })),
}));

export default useNotificationStore;
