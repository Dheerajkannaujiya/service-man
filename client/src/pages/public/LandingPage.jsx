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
  Cpu
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
    Mechanic: <Wrench size={22} className="text-blue-600" />,
    Electrician: <Zap size={22} className="text-amber-500" />,
    Homemaker: <Sparkles size={22} className="text-purple-500" />,
    Doctor: <Stethoscope size={22} className="text-rose-500" />,
    Caretaker: <HeartHandshake size={22} className="text-emerald-500" />,
    Tutor: <GraduationCap size={22} className="text-cyan-500" />,
    Plumber: <Droplets size={22} className="text-sky-500" />,
    Painter: <Paintbrush size={22} className="text-indigo-500" />
  };

  const filteredServices = services.filter((s) => {
    const matchCategory = selectedCategory === 'All' || s.category === selectedCategory;
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-brand-50/60 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-brand-700 text-xs font-bold border border-blue-200">
                <Cpu size={14} className="text-brand-600 animate-pulse" />
                AI-Powered GPS Matching • Verified NCR Professionals
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                Expert Help At Your Doorstep,{' '}
                <span className="bg-gradient-to-r from-brand-600 to-blue-500 bg-clip-text text-transparent">
                  In 15 Minutes.
                </span>
              </h1>

              <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
                From emergency auto repairs and skilled electricians to trained caretakers and home cleaning. Every professional is 100% KYC background-verified, monitored by our AI Review Trust engine.
              </p>

              {/* Quick Search / CTA */}
              <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-200/80 flex flex-col sm:flex-row items-center gap-2 max-w-xl mx-auto lg:mx-0">
                <div className="flex items-center gap-2 px-3 flex-1 w-full">
                  <MapPin size={18} className="text-brand-600 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search mechanic, electrician, cleaner..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs sm:text-sm py-2 text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
                <button
                  onClick={() => {
                    switchRole('customer');
                    navigate('/customer/dashboard');
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 shrink-0"
                >
                  Book Instant Service <ArrowRight size={15} />
                </button>
              </div>

              {/* Instant Interactive Quick-Start Links */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span className="text-xs font-bold text-slate-700">Quick Test Flows:</span>
                <button
                  onClick={() => {
                    switchRole('customer');
                    navigate('/customer/track/mock_booking_001');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Customer Live GPS Track
                </button>

                <button
                  onClick={() => {
                    switchRole('provider');
                    navigate('/provider/dashboard');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Wrench size={13} className="text-amber-600" />
                  Provider Dispatch &amp; OTP Desk
                </button>

                <button
                  onClick={() => {
                    switchRole('admin');
                    navigate('/admin/dashboard');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <ShieldCheck size={13} className="text-purple-600" />
                  Admin KYC &amp; AI Radar
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  Govt. ID &amp; Criminal Check
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Clock size={16} className="text-blue-500" />
                  Average 15-min ETA
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Star size={16} className="text-amber-400 fill-amber-400" />
                  4.8/5 Rated Across 10k+ Jobs
                </div>
              </div>
            </div>

            {/* Right Card Mockup - Interactive Simulation Center */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      Live Dispatch Station
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    ACTIVE NOW
                  </span>
                </div>

                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/50 border border-slate-200">
                  <img
                    src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80"
                    alt="Vikram Singh"
                    className="w-13 h-13 rounded-2xl object-cover border-2 border-brand-500 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-extrabold text-sm text-slate-900 truncate">Vikram Singh</h4>
                      <TrustBadge size="sm" showLabel={false} />
                    </div>
                    <p className="text-xs text-slate-600 font-medium">Auto Mechanic Pro • 8 Yrs Exp</p>
                    <div className="flex items-center gap-2 mt-1">
                      <StarRating rating={4.9} size={12} showScore />
                      <span className="text-[11px] text-slate-400">• 62 Completed</span>
                    </div>
                  </div>
                </div>

                {/* Radar matching animation mock */}
                <div className="p-4 rounded-2xl bg-brand-50/80 border border-brand-200 text-xs space-y-2">
                  <div className="flex items-center justify-between text-brand-950 font-bold">
                    <span>GPS Proximity</span>
                    <span className="text-brand-600 font-extrabold">1.2 km away (Noida Sec 62)</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Estimated Arrival</span>
                    <span className="font-bold text-slate-900">8 mins</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>AI Review Trust Score</span>
                    <span className="font-bold text-emerald-600">98.4 / 100 (Top Tier)</span>
                  </div>
                </div>

                {/* 1-Click Interactive Buttons */}
                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => {
                      switchRole('customer');
                      navigate('/customer/track/mock_booking_001');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                    Launch Live GPS Moving Tracker →
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        switchRole('provider');
                        navigate('/provider/dashboard');
                      }}
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors text-center"
                    >
                      Provider Job View
                    </button>
                    <button
                      onClick={() => {
                        switchRole('admin');
                        navigate('/admin/dashboard');
                      }}
                      className="py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs border border-purple-200 transition-colors text-center"
                    >
                      Admin Dashboard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900">Featured Service Categories</h2>
          <p className="text-slate-500 text-xs sm:text-sm">
            Trained, verified and equipped professionals ready for instant dispatch across NCR cities.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {['All', 'Mechanic', 'Electrician', 'Homemaker', 'Doctor', 'Caretaker', 'Tutor', 'Plumber', 'Painter'].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
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
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              <div className="h-44 overflow-hidden relative">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-800 border border-slate-200 flex items-center gap-1">
                  {categoryIcons[service.category]}
                  <span>{service.category}</span>
                </div>
                {service.popular && (
                  <div className="absolute top-3 right-3 bg-amber-500 text-white px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide">
                    Popular
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-brand-600 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Starting from</span>
                    <span className="text-base font-extrabold text-slate-900">₹{service.basePrice}</span>
                  </div>

                  <button
                    onClick={() => {
                      switchRole('customer');
                      navigate(`/customer/dashboard?serviceId=${service._id}`);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white font-semibold text-xs transition-colors flex items-center gap-1"
                  >
                    Book Now <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Flow */}
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-brand-400 text-xs font-bold uppercase tracking-wider">
              Seamless 4-Step Journey
            </span>
            <h2 className="text-3xl font-extrabold">How ServiceMan Works</h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              From submission to verified professional arrival with automated quality control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Select & Locate',
                desc: 'Pick your required service and problem description. Your live GPS coordinates instantly map your location.'
              },
              {
                step: '02',
                title: 'AI Radar Matching',
                desc: 'Our engine computes match scores across distance, ratings, KYC status, and experience to alert top providers.'
              },
              {
                step: '03',
                title: 'Track & Verify',
                desc: 'Track technician vehicle movements live on the map. Verify service initiation with a secure 4-digit OTP.'
              },
              {
                step: '04',
                title: 'AI Review & Safety',
                desc: 'Submit ratings evaluated by our NLP fraud & sentiment analyzer, keeping our ecosystem trusted and safe.'
              }
            ].map((item, idx) => (
              <div key={idx} className="relative p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
                <span className="text-3xl font-black text-brand-500/80">{item.step}</span>
                <h3 className="font-bold text-base text-white">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety & Penalty Workflow Highlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-900/50 text-rose-300 text-xs font-bold border border-rose-700">
              <ShieldAlert size={14} /> Strict Quality Control Policy
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold">
              3-Tier Quality Enforcement &amp; Zero Tolerance
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              To protect both customers and professionals, ServiceMan enforces automated escalations: 
              <strong> 1st Issue = Official Warning</strong>, 
              <strong> 2nd Issue = 30-Day Suspension</strong>, and 
              <strong> 3rd Issue = Permanent National ID Blacklist</strong>.
            </p>
          </div>

          <Link
            to="/register?role=provider"
            className="px-6 py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand-500/30 transition-all shrink-0 text-center"
          >
            Apply as Verified Partner →
          </Link>
        </div>
      </section>
    </div>
  );
}
