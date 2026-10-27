import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wrench,
  MapPin,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
  Briefcase,
  LayoutDashboard,
  Calendar,
  DollarSign,
  AlertOctagon,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import NotificationDrawer from './NotificationDrawer';

export default function Navbar() {
  const { user, isAuthenticated, isCustomer, isProvider, isAdmin, logout, switchRole } = useAuth();
  const { unreadNotifications } = useSocket();
  const navigate = useNavigate();

  const [selectedCity, setSelectedCity] = useState('Noida');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="sticky top-0 z-[100] bg-[#0B0F19]/85 backdrop-blur-xl border-b border-slate-800/80 text-slate-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand & City Selector */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 group-hover:shadow-indigo-500/40 transition-all">
                  <Wrench size={20} className="rotate-[-10deg] group-hover:rotate-0 transition-transform" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-lg leading-tight tracking-tight text-white flex items-center gap-1 font-['Outfit']">
                    Service<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Man</span>
                  </span>
                  <span className="text-[9px] font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> On-Demand Network
                  </span>
                </div>
              </Link>

              {/* City Selector Pill */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-medium hover:border-slate-700 transition-colors">
                <MapPin size={13} className="text-indigo-400" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-transparent border-none outline-none cursor-pointer pr-1 text-slate-200 text-xs font-semibold"
                >
                  <option value="Noida" className="bg-slate-900 text-slate-200">Noida (NCR)</option>
                  <option value="Delhi" className="bg-slate-900 text-slate-200">Delhi</option>
                  <option value="Gurugram" className="bg-slate-900 text-slate-200">Gurugram</option>
                  <option value="Ghaziabad" className="bg-slate-900 text-slate-200">Ghaziabad</option>
                  <option value="Faridabad" className="bg-slate-900 text-slate-200">Faridabad</option>
                  <option value="Meerut" className="bg-slate-900 text-slate-200">Meerut</option>
                </select>
              </div>
            </div>

            {/* Middle: Navigation Links based on Role */}
            <div className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
              <Link to="/services" className="hover:text-indigo-400 transition-colors">
                Services Catalog
              </Link>
              <Link to="/how-it-works" className="hover:text-indigo-400 transition-colors">
                How It Works
              </Link>

              {isCustomer && (
                <>
                  <Link to="/customer/dashboard" className="text-indigo-400 flex items-center gap-1 hover:text-indigo-300 transition-colors">
                    <LayoutDashboard size={14} /> Customer Hub
                  </Link>
                  <Link to="/customer/bookings" className="hover:text-indigo-400 flex items-center gap-1 transition-colors">
                    <Calendar size={14} /> My Bookings
                  </Link>
                </>
              )}

              {isProvider && (
                <>
                  <Link to="/provider/dashboard" className="text-indigo-400 flex items-center gap-1 hover:text-indigo-300 transition-colors">
                    <Briefcase size={14} /> Provider Hub
                  </Link>
                  <Link to="/provider/kyc" className="hover:text-indigo-400 flex items-center gap-1 transition-colors">
                    <ShieldCheck size={14} /> KYC Desk
                  </Link>
                  <Link to="/provider/earnings" className="hover:text-indigo-400 flex items-center gap-1 transition-colors">
                    <DollarSign size={14} /> Earnings & Ledger
                  </Link>
                </>
              )}

              {isAdmin && (
                <>
                  <Link to="/admin/dashboard" className="text-indigo-400 flex items-center gap-1 hover:text-indigo-300 transition-colors">
                    <LayoutDashboard size={14} /> Admin HQ
                  </Link>
                  <Link to="/admin/kyc-desk" className="hover:text-indigo-400 flex items-center gap-1 transition-colors">
                    <ShieldCheck size={14} /> KYC Queue
                  </Link>
                  <Link to="/admin/complaints" className="hover:text-indigo-400 flex items-center gap-1 transition-colors">
                    <AlertOctagon size={14} /> Complaints
                  </Link>
                </>
              )}
            </div>

            {/* Right: Actions / Profile */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  {/* Notification Bell */}
                  <button
                    onClick={() => setShowNotifications(true)}
                    className="relative p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-800"
                    title="Notifications"
                  >
                    <Bell size={18} />
                    {unreadNotifications > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse"></span>
                    )}
                  </button>

                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800/60 border border-slate-800/60 hover:border-slate-700 transition-all"
                    >
                      <img
                        src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                        alt={user?.name}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-700 shadow-sm"
                      />
                      <div className="hidden sm:flex flex-col text-left">
                        <span className="text-xs font-bold text-slate-100 leading-none truncate max-w-[120px]">
                          {user?.name}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 mt-0.5">
                          {user?.role}
                        </span>
                      </div>
                      <ChevronDown size={13} className="text-slate-400" />
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-4 py-2.5 border-b border-slate-800">
                          <p className="text-xs font-bold text-white">{user?.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                        </div>

                        <div className="py-1">
                          {isCustomer && (
                            <Link
                              to="/customer/dashboard"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                            >
                              <LayoutDashboard size={14} className="text-indigo-400" /> Customer Hub
                            </Link>
                          )}

                          {isProvider && (
                            <Link
                              to="/provider/dashboard"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                            >
                              <Briefcase size={14} className="text-indigo-400" /> Provider Hub
                            </Link>
                          )}

                          {isAdmin && (
                            <Link
                              to="/admin/dashboard"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                            >
                              <LayoutDashboard size={14} className="text-indigo-400" /> Admin HQ
                            </Link>
                          )}
                        </div>

                        {/* 1-Click Role Switcher */}
                        <div className="px-3 py-2.5 bg-slate-950/60 border-t border-b border-slate-800/80 space-y-1.5">
                          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 tracking-wider">
                            <Sparkles size={11} className="text-indigo-400" /> Switch Role (1-Click)
                          </span>
                          <div className="grid grid-cols-3 gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                switchRole('customer');
                                setShowUserMenu(false);
                                navigate('/customer/dashboard');
                              }}
                              className={`py-1.5 text-[10px] rounded-lg font-bold transition-all ${
                                isCustomer
                                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                  : 'bg-slate-800 text-slate-300 border border-slate-700/60 hover:bg-slate-700'
                              }`}
                            >
                              Customer
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                switchRole('provider');
                                setShowUserMenu(false);
                                navigate('/provider/dashboard');
                              }}
                              className={`py-1.5 text-[10px] rounded-lg font-bold transition-all ${
                                isProvider
                                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                  : 'bg-slate-800 text-slate-300 border border-slate-700/60 hover:bg-slate-700'
                              }`}
                            >
                              Provider
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                switchRole('admin');
                                setShowUserMenu(false);
                                navigate('/admin/dashboard');
                              }}
                              className={`py-1.5 text-[10px] rounded-lg font-bold transition-all ${
                                isAdmin
                                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                  : 'bg-slate-800 text-slate-300 border border-slate-700/60 hover:bg-slate-700'
                              }`}
                            >
                              Admin
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                        >
                          <LogOut size={14} /> Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2.5">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
                  >
                    Get Started Free
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden px-4 pt-2 pb-5 space-y-2 border-t border-slate-800 bg-[#0B0F19]/95 backdrop-blur-xl">
            <Link
              to="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-xs font-semibold text-slate-300 hover:text-white"
            >
              Services Catalog
            </Link>
            <Link
              to="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-xs font-semibold text-slate-300 hover:text-white"
            >
              How It Works
            </Link>
            {isCustomer && (
              <Link
                to="/customer/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-xs font-bold text-indigo-400"
              >
                Customer Hub
              </Link>
            )}
            {isProvider && (
              <Link
                to="/provider/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-xs font-bold text-indigo-400"
              >
                Provider Hub
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-xs font-bold text-indigo-400"
              >
                Admin HQ
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* Slide-out Notification Drawer */}
      <NotificationDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
}
