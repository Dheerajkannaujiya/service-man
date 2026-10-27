import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wrench,
  Zap,
  Sparkles,
  Stethoscope,
  HeartHandshake,
  GraduationCap,
  Droplets,
  Paintbrush,
  ShieldCheck,
  MapPin,
  Clock,
  Star,
  CheckCircle,
  ArrowRight,
  ChevronRight,
  ShieldAlert,
  Cpu,
  Layers,
  CreditCard,
  Navigation,
  Activity
} from 'lucide-react';
import api from '../../services/api';
import TrustBadge from '../../components/TrustBadge';
import StarRating from '../../components/StarRating';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_SERVICES } from '../../services/mockData';

export default function LandingPage() {
  const navigate = useNavigate();
  const { switchRole, user } = useAuth();
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/customer/services');
        if (res.data.success && res.data.services?.length > 0) {
          setServices(res.data.services);
        } else {
          setServices(INITIAL_SERVICES);
        }
      } catch (err) {
        console.warn('Failed to fetch services, using default catalog');
        setServices(INITIAL_SERVICES);
      }
    };
    fetchServices();
  }, []);

  const categoryIcons = {
    Mechanic: <Wrench size={20} className="text-indigo-400" />,
    Electrician: <Zap size={20} className="text-amber-400" />,
    Homemaker: <Sparkles size={20} className="text-purple-400" />,
    Doctor: <Stethoscope size={20} className="text-rose-400" />,
    Caretaker: <HeartHandshake size={20} className="text-emerald-400" />,
    Tutor: <GraduationCap size={20} className="text-cyan-400" />,
    Plumber: <Droplets size={20} className="text-sky-400" />,
    Painter: <Paintbrush size={20} className="text-pink-400" />
  };

  const filteredServices = services.filter((s) => {
    const matchCategory = selectedCategory === 'All' || s.category === selectedCategory;
    const matchSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-24 pb-24 text-slate-100 overflow-hidden relative">
      {/* Background Radial Glow Lights */}
      <div className="glow-spot-blue top-[-100px] left-[-150px]"></div>
      <div className="glow-spot-teal top-[20%] right-[-100px]"></div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-bold border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
                <Cpu size={14} className="text-cyan-400 animate-pulse" />
                <span>Next-Gen On-Demand Telemetry • NCR Service Grid</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] font-['Outfit']">
                On-Demand Services,{' '}
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Dispatched in 15 Minutes.
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
                Connecting homes and enterprises with top-tier vetted mechanics, certified electricians, trained homemakers, and doctors. Powered by live GPS tracking, Razorpay secure escrow, and AI fraud protection.
              </p>

              {/* Quick Search / CTA */}
              <div className="glass-card p-2 rounded-2xl flex flex-col sm:flex-row items-center gap-2 max-w-xl mx-auto lg:mx-0">
                <div className="flex items-center gap-2.5 px-3 flex-1 w-full">
                  <MapPin size={18} className="text-indigo-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search mechanic, electrician, cleaner..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs sm:text-sm py-2 bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
                  />
                </div>
                <button
                  onClick={() => {
                    switchRole('customer');
                    navigate('/customer/dashboard');
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 shrink-0 btn-shimmer"
                >
                  Book Instant Dispatch <ArrowRight size={15} />
                </button>
              </div>

              {/* Instant Interactive Quick-Start Links for Testing */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span className="text-xs font-bold text-slate-400">1-Click Test Flows:</span>
                <button
                  onClick={() => {
                    switchRole('customer');
                    navigate('/customer/track/mock_booking_001');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Live GPS Tracking View
                </button>

                <button
                  onClick={() => {
                    switchRole('provider');
                    navigate('/provider/dashboard');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Wrench size={13} className="text-amber-400" />
                  Provider Dispatch &amp; OTP
                </button>

                <button
                  onClick={() => {
                    switchRole('admin');
                    navigate('/admin/dashboard');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <ShieldCheck size={13} className="text-purple-400" />
                  Admin HQ &amp; AI Radar
                </button>
              </div>

              {/* Trust Badges Bar */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  100% Aadhaar &amp; Police Verified
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Clock size={16} className="text-indigo-400" />
                  Under 15-Min Guaranteed ETA
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <CreditCard size={16} className="text-cyan-400" />
                  Razorpay Escrow Protected
                </div>
              </div>
            </div>

            {/* Right Card Mockup - Interactive Station */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md glass-card rounded-3xl p-6 shadow-2xl border border-slate-700/70 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
                    <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                      Live Telemetry Terminal
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    GPS CONNECTED
                  </span>
                </div>

                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700">
                  <img
                    src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80"
                    alt="Vikram Singh"
                    className="w-13 h-13 rounded-2xl object-cover border-2 border-indigo-500 shadow-md shadow-indigo-500/20"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-extrabold text-sm text-white truncate">Vikram Singh</h4>
                      <TrustBadge size="sm" showLabel={false} />
                    </div>
                    <p className="text-xs text-slate-300 font-medium">Auto Mechanic Specialist • 8 Yrs Exp</p>
                    <div className="flex items-center gap-2 mt-1">
                      <StarRating rating={4.9} size={12} showScore />
                      <span className="text-[11px] text-slate-400">• 62 Dispatches Done</span>
                    </div>
                  </div>
                </div>

                {/* Radar matching stats mock */}
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 text-xs space-y-2.5">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-300">Live GPS Proximity</span>
                    <span className="text-cyan-400 font-bold">1.2 km away (Noida Sec 62)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Estimated Travel Time</span>
                    <span className="font-bold text-slate-100">8 mins (Traffic Clear)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">AI Trust Polarity Score</span>
                    <span className="font-bold text-emerald-400">+0.94 (Highest Trust Tier)</span>
                  </div>
                </div>

                {/* Interactive Action Buttons */}
                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => {
                      switchRole('customer');
                      navigate('/customer/track/mock_booking_001');
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 btn-shimmer"
                  >
                    <Navigation size={14} className="text-white" />
                    Open Live GPS Tracking Map →
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        switchRole('provider');
                        navigate('/provider/dashboard');
                      }}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors text-center border border-slate-700"
                    >
                      Provider Console
                    </button>
                    <button
                      onClick={() => {
                        switchRole('admin');
                        navigate('/admin/dashboard');
                      }}
                      className="py-2 px-3 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 font-bold text-xs border border-purple-800/50 transition-colors text-center"
                    >
                      Admin Analytics
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold border border-indigo-500/20">
            <Sparkles size={13} className="text-indigo-400" />
            Verified Professional Services
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">
            Ready For Instant Doorstep Dispatch
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Certified trade technicians equipped with complete toolkits and diagnostic hardware across NCR.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {['All', 'Mechanic', 'Electrician', 'Homemaker', 'Doctor', 'Caretaker', 'Tutor', 'Plumber', 'Painter'].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service._id}
              className="glass-card rounded-2xl overflow-hidden flex flex-col group border border-slate-800 hover:border-indigo-500/50"
            >
              <div className="h-44 overflow-hidden relative">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-xl text-[11px] font-bold text-white border border-slate-700 flex items-center gap-1.5 shadow-md">
                  {categoryIcons[service.category]}
                  <span>{service.category}</span>
                </div>
                {service.popular && (
                  <div className="absolute top-3 right-3 bg-amber-500/90 text-slate-950 px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide shadow-md">
                    Popular
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-white group-hover:text-indigo-400 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="pt-4 mt-5 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-medium">Starting from</span>
                    <span className="text-lg font-black text-white">₹{service.basePrice}</span>
                  </div>

                  <button
                    onClick={() => {
                      switchRole('customer');
                      navigate(`/customer/dashboard?serviceId=${service._id}`);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 hover:border-indigo-500 font-bold text-xs transition-all flex items-center gap-1 shadow-sm"
                  >
                    Book Now <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4-Step How It Works Flow */}
      <section className="relative z-10 py-16 bg-slate-950/80 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-indigo-400 text-xs font-bold uppercase tracking-wider">
              Autonomous Workflow
            </span>
            <h2 className="text-3xl font-extrabold text-white font-['Outfit']">How ServiceMan Works</h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              From geolocation request to verified technician arrival and automated review verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Select & Geocode',
                desc: 'Select your trade category and describe your issue. Google Maps / GPS automatically locks your exact doorstep pin.'
              },
              {
                step: '02',
                title: 'AI Radar Dispatch',
                desc: 'Our real-time algorithm ranks candidate providers by proximity, trust score, ratings, and sends countdown dispatches.'
              },
              {
                step: '03',
                title: 'Live Telemetry & OTP',
                desc: 'Track the incoming technician vehicle live on the map. Verify job commencement with a secret 4-digit customer OTP.'
              },
              {
                step: '04',
                title: 'Razorpay & AI Review',
                desc: 'Settle via Razorpay test/live gateway. Submit reviews analyzed by our NLP sentiment and fraud detection engine.'
              }
            ].map((item, idx) => (
              <div key={idx} className="relative p-6 rounded-2xl glass-card border border-slate-800 space-y-3">
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-400">
                  {item.step}
                </span>
                <h3 className="font-bold text-base text-white">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety & Quality Control Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-800/50 text-white shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 text-xs font-bold border border-rose-500/30">
              <ShieldAlert size={14} className="text-rose-400" /> 3-Tier Escalation Framework
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-['Outfit']">
              Zero-Tolerance Quality &amp; Trust Assurance
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every professional maintains a live Trust Score (0-100%). Minor infractions yield formal warnings; repeat complaints trigger a 30-day suspension; confirmed fraud or misconduct triggers an immutable identity blacklist across our network.
            </p>
          </div>

          <Link
            to="/register?role=provider"
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 transition-all shrink-0 text-center btn-shimmer"
          >
            Join As Certified Partner →
          </Link>
        </div>
      </section>
    </div>
  );
}
