import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCheck, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';

export default function NotificationDrawer({ isOpen, onClose }) {
  const { setUnreadNotifications } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadNotifications(res.data.unreadCount);
      }
    } catch (err) {
      console.warn('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadNotifications(0);
    } catch (err) {
      console.warn('Failed to mark all as read');
    }
  };

  const getIcon = (type) => {
    if (type.includes('warning') || type.includes('suspension') || type.includes('ban')) {
      return <AlertTriangle size={16} className="text-rose-600" />;
    }
    if (type.includes('kyc') || type.includes('verified')) {
      return <ShieldCheck size={16} className="text-emerald-600" />;
    }
    return <CheckCircle2 size={16} className="text-blue-600" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-[1200] w-full sm:w-96 bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-brand-400" />
          <h3 className="font-semibold text-sm">Notifications Center</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            title="Mark all as read"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <CheckCheck size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">No notifications yet.</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`p-3 rounded-xl border text-xs transition-all ${
                n.isRead
                  ? 'bg-white border-slate-200 text-slate-700'
                  : 'bg-blue-50/70 border-blue-200 text-slate-900 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5">{getIcon(n.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-semibold text-slate-900">{n.title}</h4>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                    )}
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1.5 block">
                    {new Date(n.createdAt).toLocaleDateString()} at{' '}
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
