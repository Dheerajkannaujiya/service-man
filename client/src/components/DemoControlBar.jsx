import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  User,
  Wrench,
  Zap,
  ShieldCheck,
  Compass,
  RotateCcw,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { resetMockStore } from '../services/mockService';

export default function DemoControlBar() {
  const { user, switchRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [minimized, setMinimized] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSwitch = (roleKey, targetPath) => {
    const newUser = switchRole(roleKey);
    showToast(`Switched to ${newUser.name} (${newUser.role.toUpperCase()})`);
    if (targetPath) {
      navigate(targetPath);
    }
  };

  const handleReset = () => {
    resetMockStore();
    showToast('Demo store refreshed to initial state!');
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-[9999] bg-slate-900/95 text-white px-4 py-3 rounded-2xl shadow-2xl border border-brand-500/40 flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Control Bar Container */}
      <aside aria-label="Demo Role Switcher" className="sticky top-0 z-[110] bg-slate-950 text-slate-100 border-b border-slate-800 shadow-xl transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Left: Engine Status Badge */}
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs tracking-wide bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                  ServiceMan Pro v2.0
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950/80 text-blue-300 border border-blue-800/60">
                  Interactive Flow Engine
                </span>
              </div>

              {/* Port & Active Route Indicator */}
              <span className="hidden lg:inline-flex items-center gap-1 text-[11px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                Port: <strong className="text-emerald-400">{window.location.port || '5173'}</strong> | {location.pathname}
              </span>
            </div>

            {/* Center: Instant 1-Click Role Switchers */}
            {!minimized && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] font-medium text-slate-400 hidden xl:inline">Switch Role:</span>

                {/* Customer Button */}
                <button
                  onClick={() => handleSwitch('customer', '/customer/dashboard')}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 text-[11px] ${
                    user?.role === 'customer'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400 font-bold'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                  }`}
                  title="Switch to Customer: Rahul Sharma"
                >
                  <User size={13} className="text-blue-400" />
                  <span>Customer (Rahul)</span>
                </button>

                {/* Provider Mechanic Button */}
                <button
                  onClick={() => handleSwitch('provider', '/provider/dashboard')}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 text-[11px] ${
                    user?.role === 'provider' && user?.name?.includes('Vikram')
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-400 font-bold'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                  }`}
                  title="Switch to Provider: Vikram Singh (Mechanic)"
                >
                  <Wrench size={13} className="text-amber-400" />
                  <span>Mechanic (Vikram)</span>
                </button>

                {/* Provider Electrician Button */}
                <button
                  onClick={() => handleSwitch('electrician', '/provider/dashboard')}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 text-[11px] ${
                    user?.role === 'provider' && user?.name?.includes('Amit')
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-400 font-bold'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                  }`}
                  title="Switch to Provider: Amit Kumar (Electrician)"
                >
                  <Zap size={13} className="text-yellow-400" />
                  <span>Electrician (Amit)</span>
                </button>

                {/* Admin Button */}
                <button
                  onClick={() => handleSwitch('admin', '/admin/dashboard')}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 text-[11px] ${
                    user?.role === 'admin'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 ring-2 ring-purple-400 font-bold'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                  }`}
                  title="Switch to Admin: Priya Patel"
                >
                  <ShieldCheck size={13} className="text-purple-400" />
                  <span>Admin HQ (Priya)</span>
                </button>
              </div>
            )}

            {/* Right: Flow Shortcuts & Reset */}
            <div className="flex items-center gap-2">
              {!minimized && (
                <>
                  {/* Live GPS Tracker Shortcut */}
                  <button
                    onClick={() => {
                      switchRole('customer');
                      navigate('/customer/track/mock_booking_001');
                      showToast('Opening Live GPS Tracking Simulation');
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[11px] font-bold shadow-sm shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
                  >
                    <Compass size={13} className="animate-spin-slow" />
                    <span className="hidden sm:inline">Live GPS Flow</span>
                  </button>

                  {/* Reset Mock Data */}
                  <button
                    onClick={handleReset}
                    className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
                    title="Reset Mock Database"
                  >
                    <RotateCcw size={13} />
                  </button>
                </>
              )}

              {/* Minimize/Expand Toggle */}
              <button
                onClick={() => setMinimized(!minimized)}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
                title={minimized ? 'Expand Demo Bar' : 'Minimize Demo Bar'}
              >
                {minimized ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
