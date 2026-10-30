import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Wrench, Lock, Mail, AlertCircle, ArrowRight, UserCheck, Shield, Sparkles, HeartPulse } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectAfterLogin = (role) => {
    if (location.state?.from) {
      navigate(location.state.from);
      return;
    }
    if (role === 'customer') navigate('/customer/dashboard');
    else if (role === 'provider') navigate('/provider/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
    else navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrPhone || !password) {
      setError('Please enter your email or phone and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await login(emailOrPhone, password);
      redirectAfterLogin(user.role);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Demo Login Helper
  const handleQuickLogin = async (email, pass) => {
    setEmailOrPhone(email);
    setPassword(pass);
    setLoading(true);
    setError('');
    try {
      const user = await login(email, pass);
      redirectAfterLogin(user.role);
    } catch (err) {
      console.warn('Instant demo login fallback');
      const role = email.includes('admin')
        ? 'admin'
        : email.includes('electrician') || email.includes('doctor') || email.includes('cleaner') || email.includes('provider')
        ? 'provider'
        : 'customer';
      const user = switchRole ? switchRole(role) : null;
      if (user) {
        redirectAfterLogin(user.role);
      } else {
        setError('Quick login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-slate-100 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="glow-spot-blue top-[10%] left-[20%]"></div>

      <div className="max-w-xl w-full space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Wrench size={20} />
            </div>
            <span className="font-extrabold text-2xl text-white font-['Outfit']">
              Service<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Man</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-white font-['Outfit']">Portal Authentication</h2>
          <p className="text-xs text-slate-400">Sign in to manage bookings, dispatches, and services.</p>
        </div>

        {/* 1-Click Demo Accounts Picker */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 shadow-xl space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-200">
            <span className="flex items-center gap-1.5 text-indigo-400">
              <Sparkles size={14} /> Instant Demo Sign-In
            </span>
            <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
              Zero Password Required
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('customer@serviceman.com', 'Password123!')}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-indigo-500/50 text-left transition-all flex flex-col justify-between"
            >
              <span className="font-bold text-white flex items-center gap-1">
                <UserCheck size={13} className="text-cyan-400" /> Customer
              </span>
              <span className="text-[10px] text-slate-400 mt-1">Rahul Sharma (Noida)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('provider@serviceman.com', 'Password123!')}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-emerald-500/50 text-left transition-all flex flex-col justify-between"
            >
              <span className="font-bold text-white flex items-center gap-1">
                <Wrench size={13} className="text-emerald-400" /> Mechanic Pro
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold mt-1">Vikram (Trusted 92%)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('electrician@serviceman.com', 'Password123!')}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-amber-500/50 text-left transition-all flex flex-col justify-between"
            >
              <span className="font-bold text-white flex items-center gap-1">
                <Wrench size={13} className="text-amber-400" /> Electrician Pro
              </span>
              <span className="text-[10px] text-amber-400 font-semibold mt-1">Amit (1 Warning)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('doctor@serviceman.com', 'Password123!')}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-rose-500/50 text-left transition-all flex flex-col justify-between"
            >
              <span className="font-bold text-white flex items-center gap-1">
                <HeartPulse size={13} className="text-rose-400" /> Doctor Pro
              </span>
              <span className="text-[10px] text-rose-400 font-semibold mt-1">Dr. Ananya (MBBS, MD)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('cleaner@serviceman.com', 'Password123!')}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-sky-500/50 text-left transition-all flex flex-col justify-between"
            >
              <span className="font-bold text-white flex items-center gap-1">
                <Sparkles size={13} className="text-sky-400" /> Cleaner Pro
              </span>
              <span className="text-[10px] text-sky-400 font-semibold mt-1">Pooja (KYC Desk)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin@serviceman.com', 'Admin123!')}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-purple-500/50 text-left transition-all flex flex-col justify-between"
            >
              <span className="font-bold flex items-center gap-1 text-purple-400">
                <Shield size={13} /> Administrator
              </span>
              <span className="text-[10px] text-slate-400 mt-1">Aditya (Full Control)</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-300 text-xs flex items-center gap-2 border border-rose-500/30">
                <AlertCircle size={15} className="shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address or Phone Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="customer@serviceman.com or phone"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl glass-input placeholder:text-slate-500"
                />
                <Mail size={15} className="absolute left-3 top-3 text-slate-500" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
                <Link to="/forgot-password" className="text-[11px] font-semibold text-indigo-400 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl glass-input placeholder:text-slate-500"
                />
                <Lock size={15} className="absolute left-3 top-3 text-slate-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 btn-shimmer"
            >
              {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={15} />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-indigo-400 hover:underline">
              Create an Account Free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
