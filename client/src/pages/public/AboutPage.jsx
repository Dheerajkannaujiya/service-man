import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Target,
  Cpu,
  MapPin,
  Lock,
  Zap,
  Sparkles,
  Users,
  CheckCircle2,
  ArrowRight,
  Radio,
  Clock
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 text-slate-100 relative overflow-hidden bg-tech-grid">
      {/* Ambient Glow Atmosphere */}
      <div className="glow-spot-blue top-[10%] left-[5%]"></div>
      <div className="glow-spot-cyan bottom-[15%] right-[5%]"></div>

      <div className="max-w-6xl mx-auto space-y-16 relative z-10">
        {/* Top Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-wider uppercase backdrop-blur-md">
            <Radio size={14} className="animate-pulse" />
            <span>Next-Gen Service Infrastructure</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white font-display tracking-tight leading-tight">
            Engineering Trust Into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">
              Every Doorstep Visit.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            ServiceMan eliminates guesswork in hiring local professionals across NCR. We engineer high-precision GPS telemetry, distributed AI dispatch matching, and cryptographic OTP escrow verification.
          </p>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: '< 15 Mins', label: 'Average Dispatch Time', glow: 'text-cyan-400' },
            { value: '100% KYC', label: 'Aadhaar & Police Vetted', glow: 'text-emerald-400' },
            { value: '4.89 / 5.0', label: 'Verified Satisfaction Index', glow: 'text-amber-400' },
            { value: '8 Cities', label: 'Real-time NCR Grid Active', glow: 'text-indigo-400' }
          ].map((stat, idx) => (
            <div
              key={idx}
              className="glass-card p-6 rounded-3xl border border-white/[0.08] text-center space-y-1.5"
            >
              <div className={`text-2xl sm:text-3xl font-extrabold font-mono ${stat.glow}`}>
                {stat.value}
              </div>
              <p className="text-xs text-slate-400 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-8 rounded-3xl border border-white/[0.08] space-y-4 hover:border-cyan-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <Target size={24} />
            </div>
            <h3 className="text-xl font-bold text-white font-display">Our Mission &amp; Standard</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              We replace unreliable phone directories with automated instant dispatches. Skilled mechanics, electricians, home cleaners, tutors, and caregivers get transparent earnings with direct bank deposits, while customers enjoy guaranteed pricing and 15-minute arrival.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-cyan-400 font-semibold">
              <CheckCircle2 size={16} /> Zero Bidding Fees • Fair 15% Platform Take
            </div>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-white/[0.08] space-y-4 hover:border-emerald-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold text-white font-display">Zero-Compromise Security</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Every service provider undergoes government identity verification, certification auditing, and police background checks before receiving a single customer job. Every rating is audited by an AI sentiment filter to eliminate fake reviews.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-emerald-400 font-semibold">
              <CheckCircle2 size={16} /> 4-Digit Customer Start OTP Protection
            </div>
          </div>
        </div>

        {/* The Tech Stack Architecture */}
        <div className="glass-card p-8 sm:p-10 rounded-3xl border border-white/[0.08] space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-mono">
              Engineering Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
              Built on Modern Infrastructure
            </h2>
            <p className="text-xs text-slate-400">
              High-concurrency Node.js, WebSockets, OpenStreetMap &amp; Google Maps telemetry, and Razorpay Escrow.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <MapPin size={18} /> GPS Radar Engine
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Captures high-precision browser telemetry and computes haversine distance matrices for provider proximity routing.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <Cpu size={18} /> AI Dispatch Ranking
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dynamic algorithm scoring Distance (40%), Trust Score (25%), Rating (20%), and Historical Response Speed (15%).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Lock size={18} /> Razorpay Escrow
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero advance leakage. Customer funds are held securely in escrow until job completion is verified by both parties.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Launchpad */}
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-cyan-500/30 text-center space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-transparent pointer-events-none"></div>
          <div className="relative z-10 space-y-3 max-w-xl mx-auto">
            <h2 className="text-3xl font-extrabold text-white font-display">
              Ready to Experience the Difference?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Join NCR's fastest-growing on-demand network as a customer or register as a certified service partner today.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/register"
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all inline-flex items-center gap-2"
              >
                Create Account <ArrowRight size={16} />
              </Link>
              <Link
                to="/services"
                className="px-6 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold text-xs border border-slate-700 transition-all"
              >
                Explore Services
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
