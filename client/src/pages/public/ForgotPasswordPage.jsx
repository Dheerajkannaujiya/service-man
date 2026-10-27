import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Mail, ArrowLeft, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-slate-100 relative overflow-hidden bg-tech-grid">
      {/* Signature Ambient Cyber Glow */}
      <div className="glow-spot-blue top-[15%] left-[10%]"></div>
      <div className="glow-spot-cyan bottom-[20%] right-[10%]"></div>

      <div className="max-w-md w-full space-y-6 relative z-10">
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/20 group-hover:scale-105 transition-all">
              <Wrench size={22} className="rotate-[-10deg] group-hover:rotate-0 transition-transform" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-2xl text-white font-display tracking-tight">
                Service<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Man</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Tier-1 On-Demand Network
              </span>
            </div>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Reset Password
          </h2>
          <p className="text-xs text-slate-400">
            Enter your registered email address to receive an account recovery link.
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/90 shadow-2xl space-y-5">
          {submitted ? (
            <div className="text-center space-y-4 py-4 animate-in fade-in duration-200">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/20">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="font-bold text-sm text-white font-display">Reset Link Dispatched</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                If an account exists for <strong className="text-cyan-400">{email}</strong>, a secure one-time password reset link has been dispatched to your inbox.
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Registered Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl glass-input placeholder:text-slate-500"
                  />
                  <Mail size={15} className="absolute left-3 top-3 text-slate-400" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02]"
              >
                Send Password Reset Link
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
