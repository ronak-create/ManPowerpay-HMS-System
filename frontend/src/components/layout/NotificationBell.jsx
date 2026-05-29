import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, X, FileText, Briefcase, CheckCircle, XCircle, IndianRupee, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../../api/axios';
import useNotificationStore from '../../store/notificationStore';

const typeIcon = {
  leave_request:  <Briefcase size={14} className="text-amber-500" />,
  leave_approved: <CheckCircle size={14} className="text-green-500" />,
  leave_rejected: <XCircle size={14} className="text-red-500" />,
  payslip_ready:  <IndianRupee size={14} className="text-blue-500" />,
  advance_created:<IndianRupee size={14} className="text-purple-500" />,
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { notifications, unreadCount, setNotifications, markRead, markAllRead, setLoading } = useNotificationStore();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data.data.notifications, res.data.data.unreadCount);
    } catch {
      // silently fail — non-critical
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and every 60 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkRead = async (id) => {
    markRead(id);
    try { await api.patch(`/notifications/${id}/read`); } catch {}
  };

  const handleMarkAllRead = async () => {
    markAllRead();
    setOpen(false);
    try { await api.patch('/notifications/read-all'); } catch {}
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
        className="btn-icon text-gray-400 hover:text-gray-600 hover:bg-gray-100 relative"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-bold text-gray-800 text-sm">Notifications</span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <CheckCheck size={12} /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <Bell size={28} className="mb-2 text-gray-200" />
                <p className="text-xs font-medium">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkRead(n.id)}
                  className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                    n.isRead ? 'bg-white' : 'bg-blue-50/40 cursor-pointer hover:bg-blue-50/70'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {typeIcon[n.type] || <Bell size={14} className="text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold text-gray-800 ${!n.isRead ? 'font-bold' : ''}`}>{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!n.isRead && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
