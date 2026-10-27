import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Wrench,
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  Briefcase,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  CreditCard,
  Navigation,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState(searchParams.get('role') === 'provider' ? 'provider' : 'customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [city, setCity] = useState('Noida');
  const [address, setAddress] = useState('');

  // Provider specific fields
  const [selectedCategory, setSelectedCategory] = useState('Mechanic');
  const [experienceYears, setExperienceYears] = useState(3);
  const [hourlyRate, setHourlyRate] = useState(299);
  const [serviceRadiusKm, setServiceRadiusKm] = useState(20);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculatePasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 25;
    if (pass.length >= 8) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9!@#$%^&*]/.test(pass)) score += 25;
    return score;
  };

  const passwordStrength = calculatePasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      name,
      email,
      phone,
      password,
      role,
      city,
      address,
      ...(role === 'provider' && {
        categories: [selectedCategory],
        experienceYears: Number(experienceYears),
        hourlyRate: Number(hourlyRate),
        serviceRadiusKm: Number(serviceRadiusKm)
      })
    };

    try {
      const user = await register(payload);
      if (user.role === 'customer') navigate('/customer/dashboard');
      else if (user.role === 'provider') navigate('/provider/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'Mechanic', label: 'Auto Mechanic', icon: '🔧' },
    { id: 'Electrician', label: 'Electrician', icon: '⚡' },
    { id: 'Homemaker', label: 'Deep Cleaning', icon: '✨' },
    { id: 'Doctor', label: 'Doctor Visit', icon: '🩺' },
    { id: 'Caretaker', label: 'Elder Caretaker', icon: '🤝' },
    { id: 'Tutor', label: 'Academic Tutor', icon: '🎓' },
    { id: 'Plumber', label: 'Plumbing', icon: '💧' },
    { id: 'Painter', label: 'Painting', icon: '🎨' }
  ];

  return (
    <div className="min-h-[92vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-slate-100 relative overflow-hidden bg-tech-grid">
      {/* Signature Ambient Cyber Glow Lights */}
      <div className="glow-spot-blue top-[5%] left-[5%]"></div>
      <div className="glow-spot-cyan bottom-[10%] right-[5%]"></div>

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Column: Brand & Value Proposition Showcase */}
        <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
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

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display leading-tight">
              {role === 'customer' ? (
                <>
                  Doorstep Services,{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
                    Dispatched in 15 Mins.
                  </span>
                </>
              ) : (
                <>
                  Earn On Your Terms with{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                    85% Net Payouts.
                  </span>
                </>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {role === 'customer'
                ? 'Join thousands of NCR households getting verified roadside mechanics, licensed electricians, and home cleaners with live GPS tracking.'
                : 'Turn your trade skill into a high-income verified career. Zero bidding fees, instant dispatch radar, and same-day direct bank transfers.'}
            </p>
          </div>

          {/* Dynamic Value Points Cards */}
          <div className="space-y-2.5 pt-2">
            {role === 'customer' ? (
              <>
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20">
                    <Navigation size={16} />
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-bold text-white font-display">Live GPS Moving Telemetry</p>
                    <p className="text-slate-400 text-[11px]">Watch your technician vehicle arrival on Google Maps in real-time.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                    <CreditCard size={16} />
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-bold text-white font-display">Razorpay Escrow Security</p>
                    <p className="text-slate-400 text-[11px]">Funds are released only after you verify work with your 4-digit start OTP.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                    <ShieldCheck size={16} />
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-bold text-white font-display">100% KYC &amp; Police Background Vetted</p>
                    <p className="text-slate-400 text-[11px]">Strict 3-tier quality control with zero tolerance policy.</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                    <Zap size={16} />
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-bold text-white font-display">Keep 85% of Every Rupee</p>
                    <p className="text-slate-400 text-[11px]">Only 15% flat platform fee — the lowest take-rate in the industry.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20">
                    <Clock size={16} />
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-bold text-white font-display">Instant AI Dispatches (No Bidding)</p>
                    <p className="text-slate-400 text-[11px]">Jobs are routed straight to your mobile device based on your proximity.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                    <Sparkles size={16} />
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-bold text-white font-display">Verified &amp; Trusted Partner Badge</p>
                    <p className="text-slate-400 text-[11px]">High trust scores unlock top job priority and premium hourly rates.</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Registration Terminal */}
        <div className="lg:col-span-7">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/90 shadow-2xl relative space-y-5">
            {/* Role Switcher Cards */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`p-3.5 rounded-2xl text-left transition-all border ${
                  role === 'customer'
                    ? 'bg-gradient-to-br from-indigo-900/40 to-cyan-950/40 border-cyan-400/80 ring-2 ring-cyan-400/20 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg">🏠</span>
                  {role === 'customer' && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>}
                </div>
                <p className={`text-xs font-bold font-display ${role === 'customer' ? 'text-white' : 'text-slate-300'}`}>
                  Customer Account
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Book doorstep services</p>
              </button>

              <button
                type="button"
                onClick={() => setRole('provider')}
                className={`p-3.5 rounded-2xl text-left transition-all border ${
                  role === 'provider'
                    ? 'bg-gradient-to-br from-indigo-900/40 to-emerald-950/40 border-emerald-400/80 ring-2 ring-emerald-400/20 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg">⚡</span>
                  {role === 'provider' && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>}
                </div>
                <p className={`text-xs font-bold font-display ${role === 'provider' ? 'text-white' : 'text-slate-300'}`}>
                  Service Partner
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Earn with your skills</p>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 text-rose-300 text-xs flex items-center gap-2.5 border border-rose-500/30">
                  <AlertCircle size={16} className="shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Legal Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl glass-input placeholder:text-slate-500"
                  />
                  <User size={15} className="absolute left-3 top-3 text-slate-500" />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl glass-input placeholder:text-slate-500"
                    />
                    <Mail size={15} className="absolute left-3 top-3 text-slate-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number (SMS &amp; OTP)</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+919876543210"
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl glass-input placeholder:text-slate-500 font-mono"
                    />
                    <Phone size={15} className="absolute left-3 top-3 text-slate-500" />
                  </div>
                </div>
              </div>

              {/* City & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Service City / Region</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input bg-slate-900"
                  >
                    <option value="Noida" className="bg-slate-900 text-white">Noida (NCR)</option>
                    <option value="Delhi" className="bg-slate-900 text-white">Delhi (Central &amp; South)</option>
                    <option value="Gurugram" className="bg-slate-900 text-white">Gurugram (Cyber City)</option>
                    <option value="Ghaziabad" className="bg-slate-900 text-white">Ghaziabad (Indirapuram)</option>
                    <option value="Faridabad" className="bg-slate-900 text-white">Faridabad</option>
                    <option value="Meerut" className="bg-slate-900 text-white">Meerut &amp; NCR Outer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full pl-9 pr-9 py-2.5 text-xs rounded-xl glass-input placeholder:text-slate-500"
                    />
                    <Lock size={15} className="absolute left-3 top-3 text-slate-500" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password strength meter */}
              {password && (
                <div className="space-y-1">
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        passwordStrength <= 25
                          ? 'w-1/4 bg-rose-500'
                          : passwordStrength <= 50
                          ? 'w-2/4 bg-amber-500'
                          : passwordStrength <= 75
                          ? 'w-3/4 bg-indigo-500'
                          : 'w-full bg-emerald-400'
                      }`}
                    ></div>
                  </div>
                  <span className="text-[10px] text-slate-400 block text-right font-medium">
                    {passwordStrength <= 25
                      ? 'Weak Password'
                      : passwordStrength <= 50
                      ? 'Moderate'
                      : passwordStrength <= 75
                      ? 'Good Security'
                      : 'Strong Password'}
                  </span>
                </div>
              )}

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {role === 'customer' ? 'Doorstep Address' : 'Base Workshop / Home Address'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Tower/Flat, Street, Sector, City"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl glass-input placeholder:text-slate-500"
                  />
                  <MapPin size={15} className="absolute left-3 top-3 text-slate-500" />
                </div>
              </div>

              {/* Provider Specific Trade Configuration */}
              {role === 'provider' && (
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block font-display">
                    Trade Specialization &amp; Payout Settings
                  </span>

                  {/* Visual Category Selector Chips */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-2">Select Primary Trade</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {categories.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedCategory(c.id)}
                          className={`p-2 rounded-xl text-xs font-medium text-left flex items-center gap-1.5 transition-all border ${
                            selectedCategory === c.id
                              ? 'bg-emerald-500/20 border-emerald-400 text-white font-bold shadow-sm'
                              : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span>{c.icon}</span>
                          <span className="truncate">{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Experience (Years)</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl glass-input"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Hourly Rate (₹)</label>
                      <input
                        type="number"
                        min="100"
                        step="50"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl glass-input font-bold text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Service Radius (km)</label>
                      <input
                        type="number"
                        min="5"
                        max="100"
                        value={serviceRadiusKm}
                        onChange={(e) => setServiceRadiusKm(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl glass-input"
                      />
                    </div>
                  </div>

                  {/* Net Earnings Dynamic Preview */}
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between">
                    <span className="text-slate-300">Net Take-Home Hourly:</span>
                    <span className="font-extrabold text-emerald-400 text-sm font-mono">
                      ₹{Math.round(hourlyRate * 0.85)}/hr (85% Net)
                    </span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-cyan-500 to-indigo-600 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 btn-shimmer font-display"
              >
                {loading ? 'Creating Your Account...' : role === 'customer' ? 'Complete Registration & Explore Services' : 'Submit Application as Certified Partner'}
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-slate-400 border-t border-slate-800">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-cyan-400 hover:underline">
                Sign In to Your Portal →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
