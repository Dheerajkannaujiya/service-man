import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Cpu,
  ShieldCheck,
  Zap,
  Star,
  ShieldAlert,
  ArrowRight,
  Radio,
  Lock,
  CreditCard,
  KeyRound,
  CheckCircle2
} from 'lucide-react';

export default function HowItWorksPage() {
  const phases = [
    {
      phase: 'Phase 01',
      title: 'GPS Geolocation & Proximity Grid Query',
      icon: <MapPin size={28} className="text-cyan-400" />,
      accent: 'border-cyan-500/30 text-cyan-400',
      badgeBg: 'bg-cyan-500/10',
      description:
        'When you select a service category and describe your issue, high-precision HTML5 geolocation captures your exact coordinates. ServiceMan queries our active geospatial index across Noida, Delhi, Gurugram, Ghaziabad, Faridabad, and Meerut, instantly filtering verified providers currently on-shift within your radius.',
      highlight: 'Sub-second haversine distance filtering'
    },
    {
      phase: 'Phase 02',
      title: 'AI Multi-Factor Dispatch & Mutex Concurrency Lock',
      icon: <Cpu size={28} className="text-indigo-400" />,
      accent: 'border-indigo-500/30 text-indigo-400',
      badgeBg: 'bg-indigo-500/10',
      description:
        'Our ranking engine calculates an affinity score for each nearby technician based on Distance (40%), Trust Score (25%), Rating Average (20%), and Historical Response Speed (15%). When a provider taps Accept, a distributed mutex lock guarantees zero double-bookings.',
      formula: 'Score = 0.40(Dist) + 0.25(Trust) + 0.20(Rating) + 0.15(Speed)',
      highlight: 'Zero bidding wars, instant algorithmic routing'
    },
    {
      phase: 'Phase 03',
      title: 'Live Telemetry Radar & Turn-by-Turn Navigation',
      icon: <Zap size={28} className="text-purple-400" />,
      accent: 'border-purple-500/30 text-purple-400',
      badgeBg: 'bg-purple-500/10',
      description:
        'Watch your technician’s vehicle approach in real time on our dual-engine interactive map (OpenStreetMap & Google Maps Embed). Built-in WebSocket channels broadcast live GPS coordinate updates every 10 seconds, and one-tap in-app chat lets you communicate instantly.',
      highlight: 'Live moving vehicle telemetry & turn-by-turn routing'
    },
    {
      phase: 'Phase 04',
      title: '4-Digit Start OTP & Physical Verification',
      icon: <KeyRound size={28} className="text-amber-400" />,
      accent: 'border-amber-500/30 text-amber-400',
      badgeBg: 'bg-amber-500/10',
      description:
        'When the professional arrives at your location, work cannot start until you share the unique 4-digit security OTP generated inside your tracking portal. The provider inputs the OTP into their mobile dashboard to officially initiate the service timestamp.',
      highlight: 'Guaranteed customer presence and verified physical arrival'
    },
    {
      phase: 'Phase 05',
      title: 'Escrow Settlement & AI Review Sentiment Engine',
      icon: <ShieldCheck size={28} className="text-emerald-400" />,
      accent: 'border-emerald-500/30 text-emerald-400',
      badgeBg: 'bg-emerald-500/10',
      description:
        'Once work is complete, funds are seamlessly settled via Razorpay Escrow. Your review is processed through our natural language processing (NLP) sentiment engine to update the provider’s Trust Score index (+5 to -15 pts) and prevent fraudulent ratings.',
      highlight: 'Automated 15% platform split and transparent bank payouts'
    }
  ];

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 text-slate-100 relative overflow-hidden bg-tech-grid">
      {/* Signature Ambient Cyber Glow */}
      <div className="glow-spot-blue top-[10%] left-[5%]"></div>
      <div className="glow-spot-cyan bottom-[15%] right-[5%]"></div>

      <div className="max-w-5xl mx-auto space-y-16 relative z-10">
        {/* Title Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-wider uppercase backdrop-blur-md">
            <Radio size={14} className="animate-pulse" />
            <span>Architecture &amp; Quality Workflow</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-display tracking-tight leading-tight">
            How ServiceMan Operates
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            A high-reliability on-demand service ecosystem driven by GPS proximity, distributed AI dispatch ranking, and strict multi-tier quality control.
          </p>
        </div>

        {/* 5 Phased Architecture Cards */}
        <div className="space-y-6">
          {phases.map((item, index) => (
            <div
              key={index}
              className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.08] hover:border-white/20 transition-all space-y-4 relative overflow-hidden group"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${item.badgeBg} flex items-center justify-center border ${item.accent} shrink-0 group-hover:scale-105 transition-transform`}>
                    {item.icon}
                  </div>
                  <div>
                    <span className={`text-[11px] font-mono font-bold uppercase tracking-widest ${item.accent}`}>
                      {item.phase}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-white font-display">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <span className="text-[11px] px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-medium">
                  {item.highlight}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pl-0 sm:pl-[72px]">
                {item.description}
              </p>

              {item.formula && (
                <div className="sm:ml-[72px] p-3 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-[11px] text-indigo-300">
                  <span className="text-slate-500">Algorithm: </span>
                  {item.formula}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA Action Bar */}
        <div className="glass-card p-8 rounded-3xl border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white font-display">
              Ready to request a verified professional?
            </h3>
            <p className="text-xs text-slate-400">
              Mechanics, Electricians, Deep Cleaners, Doctors, and Caretakers ready across NCR.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/services"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all inline-flex items-center gap-2"
            >
              Book Service Now <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
