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
  AlertOctagon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import NotificationDrawer from './NotificationDrawer';

export default function Navbar() {
  const { user, isAuthenticated, isCustomer, isProvider, isAdmin, logout } = useAuth();
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
      <nav className="sticky top-0 z-[100] bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand & City Selector */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                  <Wrench size={20} className="rotate-[-10deg]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-lg leading-tight tracking-tight text-slate-900 flex items-center gap-1">
                    Service<span className="text-brand-600">Man</span>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                    On-Demand Platform
                  </span>
                </div>
              </Link>

              {/* City Selector Pill */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors">
                <MapPin size={13} className="text-brand-600" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-transparent border-none outline-none cursor-pointer pr-1"
                >
                  <option value="Noida">Noida (NCR)</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Gurugram">Gurugram</option>
                  <option value="Ghaziabad">Ghaziabad</option>
                  <option value="Faridabad">Faridabad</option>
                  <option value="Meerut">Meerut</option>
                </select>
              </div>
            </div>

            {/* Middle: Navigation Links based on Role */}
            <div className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
              <Link to="/services" className="hover:text-brand-600 transition-colors">
                Services
              </Link>
              <Link to="/how-it-works" className="hover:text-brand-600 transition-colors">
                How It Works
              </Link>

              {isCustomer && (
                <>
                  <Link to="/customer/dashboard" className="text-brand-600 flex items-center gap-1">
                    <LayoutDashboard size={14} /> Customer Hub
                  </Link>
                  <Link to="/customer/bookings" className="hover:text-brand-600 flex items-center gap-1">
                    <Calendar size={14} /> My Bookings
                  </Link>
                </>
              )}

              {isProvider && (
                <>
                  <Link to="/provider/dashboard" className="text-brand-600 flex items-center gap-1">
                    <Briefcase size={14} /> Provider Hub
                  </Link>
                  <Link to="/provider/kyc" className="hover:text-brand-600 flex items-center gap-1">
                    <ShieldCheck size={14} /> KYC Verification
                  </Link>
                  <Link to="/provider/earnings" className="hover:text-brand-600 flex items-center gap-1">
                    <DollarSign size={14} /> Earnings
                  </Link>
                </>
              )}

              {isAdmin && (
                <>
                  <Link to="/admin/dashboard" className="text-brand-600 flex items-center gap-1">
                    <LayoutDashboard size={14} /> Admin HQ
                  </Link>
                  <Link to="/admin/kyc-desk" className="hover:text-brand-600 flex items-center gap-1">
                    <ShieldCheck size={14} /> KYC Queue
                  </Link>
                  <Link to="/admin/complaints" className="hover:text-brand-600 flex items-center gap-1">
                    <AlertOctagon size={14} /> Complaints &amp; Penalties
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
                    className="relative p-2 rounded-xl text-slate-600 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                    title="Notifications"
                  >
                    <Bell size={18} />
                    {unreadNotifications > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white animate-pulse"></span>
                    )}
                  </button>

                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <img
                        src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                        alt={user?.name}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                      />
                      <div className="hidden sm:flex flex-col text-left">
                        <span className="text-xs font-bold text-slate-800 leading-none truncate max-w-[120px]">
                          {user?.name}
                        </span>
                        <span className="text-[10px] uppercase font-semibold tracking-wider text-brand-600 mt-0.5">
                          {user?.role}
                        </span>
                      </div>
                      <ChevronDown size={13} className="text-slate-400" />
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-4 py-2 border-b border-slate-100">
                          <p className="text-xs font-bold text-slate-800">{user?.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                        </div>

                        {isCustomer && (
                          <Link
                            to="/customer/dashboard"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <LayoutDashboard size={14} /> Customer Hub
                          </Link>
                        )}

                        {isProvider && (
                          <Link
                            to="/provider/dashboard"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <Briefcase size={14} /> Provider Hub
                          </Link>
                        )}

                        {isAdmin && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <LayoutDashboard size={14} /> Admin HQ
                          </Link>
                        )}

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 border-t border-slate-100 transition-colors text-left"
                        >
                          <LogOut size={14} /> Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-brand-600 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    Join ServiceMan
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden px-4 pt-2 pb-4 space-y-2 border-t border-slate-100 bg-white">
            <Link
              to="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-xs font-semibold text-slate-700"
            >
              Services
            </Link>
            <Link
              to="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-xs font-semibold text-slate-700"
            >
              How It Works
            </Link>
            {isCustomer && (
              <Link
                to="/customer/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-xs font-semibold text-brand-600"
              >
                Customer Hub
              </Link>
            )}
            {isProvider && (
              <Link
                to="/provider/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-xs font-semibold text-brand-600"
              >
                Provider Hub
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-xs font-semibold text-brand-600"
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
