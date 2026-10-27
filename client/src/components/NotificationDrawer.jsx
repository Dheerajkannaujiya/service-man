import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCheck, AlertTriangle, ShieldCheck, CheckCircle2, Radio } from 'lucide-react';
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
      return <AlertTriangle size={16} className="text-rose-400" />;
    }
    if (type.includes('kyc') || type.includes('verified')) {
      return <ShieldCheck size={16} className="text-emerald-400" />;
    }
    return <CheckCircle2 size={16} className="text-cyan-400" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-[1200] w-full sm:w-96 bg-dark-card/95 backdrop-blur-2xl shadow-2xl flex flex-col border-l border-white/[0.08] animate-in slide-in-from-right duration-300 text-slate-100">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Bell size={16} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white font-display">Notifications Center</h3>
            <span className="text-[10px] text-slate-400 font-mono">Live System Alerts</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      {/* Sub-header Actions */}
      <div className="px-4 py-2.5 bg-dark-base/60 border-b border-white/[0.05] flex items-center justify-between text-xs">
        <span className="text-slate-400 text-[11px]">
          {notifications.filter((n) => !n.isRead).length} Unread
        </span>
        <button
          onClick={handleMarkAllRead}
          className="text-cyan-400 hover:text-cyan-300 font-semibold text-[11px] flex items-center gap-1 transition-colors"
        >
          <CheckCheck size={14} /> Mark all read
        </button>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-dark-base/40">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs space-y-2">
            <Bell size={24} className="mx-auto text-slate-700" />
            <p className="font-bold text-slate-400">No New Notifications</p>
            <p className="text-[11px] text-slate-500">You are completely up to date.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`p-3.5 rounded-2xl border transition-all text-xs space-y-1.5 ${
                n.isRead
                  ? 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                  : 'bg-slate-900/90 border-cyan-500/30 text-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getIcon(n.type)}
                  <h4 className="font-bold text-xs text-white truncate max-w-[200px]">{n.title}</h4>
                </div>
                {!n.isRead && <span className="w-2 h-2 rounded-full bg-cyan-400"></span>}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{n.message}</p>
              <span className="text-[9px] text-slate-500 block font-mono">
                {new Date(n.createdAt).toLocaleDateString()} at{' '}
                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
