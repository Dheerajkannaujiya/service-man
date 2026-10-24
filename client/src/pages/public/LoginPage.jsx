import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Wrench, Lock, Mail, AlertCircle, ArrowRight, UserCheck, Shield, Sparkles } from 'lucide-react';
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
        : email.includes('electrician')
        ? 'electrician'
        : email.includes('provider')
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
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Wrench size={20} />
            </div>
            <span className="font-extrabold text-2xl text-slate-900">
              Service<span className="text-brand-600">Man</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-xs text-slate-500">Sign in to manage bookings, dispatches, and services.</p>
        </div>

        {/* 1-Click Demo Accounts Picker */}
        <div className="bg-gradient-to-br from-brand-50 to-blue-50/50 p-4 rounded-2xl border border-brand-200/80 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-brand-900">
            <span className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-brand-600" /> Instant Demo Sign-In
            </span>
            <span className="text-[10px] text-brand-700 bg-white/80 px-2 py-0.5 rounded-md border border-brand-200">
              One-Click
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('customer@serviceman.com', 'Password123!')}
              className="p-2.5 rounded-xl bg-white hover:bg-brand-50 text-slate-800 border border-slate-200 text-left transition-all hover:border-brand-300 flex flex-col justify-between"
            >
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <UserCheck size={13} className="text-blue-600" /> Customer
              </span>
              <span className="text-[10px] text-slate-500 mt-1">Rahul Sharma (Noida)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('provider@serviceman.com', 'Password123!')}
              className="p-2.5 rounded-xl bg-white hover:bg-brand-50 text-slate-800 border border-slate-200 text-left transition-all hover:border-brand-300 flex flex-col justify-between"
            >
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <Wrench size={13} className="text-emerald-600" /> Mechanic Pro
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1">Verified &amp; Trusted</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('electrician@serviceman.com', 'Password123!')}
              className="p-2.5 rounded-xl bg-white hover:bg-brand-50 text-slate-800 border border-slate-200 text-left transition-all hover:border-brand-300 flex flex-col justify-between"
            >
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <Wrench size={13} className="text-amber-600" /> Electrician Pro
              </span>
              <span className="text-[10px] text-amber-600 font-semibold mt-1">1 Past Warning</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin@serviceman.com', 'Admin123!')}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-left transition-all flex flex-col justify-between"
            >
              <span className="font-bold flex items-center gap-1 text-slate-100">
                <Shield size={13} className="text-brand-400" /> Administrator
              </span>
              <span className="text-[10px] text-slate-300 mt-1">Full System Control</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2 border border-rose-200">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address or Phone Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="name@example.com or +919876543210"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
                <Mail size={15} className="absolute left-3 top-3 text-slate-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-[11px] font-semibold text-brand-600 hover:underline">
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
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
                <Lock size={15} className="absolute left-3 top-3 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={15} />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:underline">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
