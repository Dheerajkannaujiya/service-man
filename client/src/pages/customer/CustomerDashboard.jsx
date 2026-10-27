import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Wrench,
  Zap,
  Sparkles,
  Stethoscope,
  HeartHandshake,
  GraduationCap,
  Droplets,
  Paintbrush,
  MapPin,
  Clock,
  ShieldCheck,
  Send,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Navigation,
  Star,
  ChevronRight,
  Phone,
  Radio,
  Plus,
  Crosshair,
  CreditCard
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import StatusBadge from '../../components/StatusBadge';
import TrustBadge from '../../components/TrustBadge';
import StarRating from '../../components/StarRating';
import MapTracker from '../../components/MapTracker';
import ChatDrawer from '../../components/ChatDrawer';
import { INITIAL_SERVICES } from '../../services/mockData';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [searchParams] = useSearchParams();

  const [activeBooking, setActiveBooking] = useState(null);
  const [services, setServices] = useState([]);
  const [nearbyProviders, setNearbyProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Request Service Modal state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [problemDescription, setProblemDescription] = useState('');
  const [address, setAddress] = useState(user?.address || 'Tower 4, Sector 128, Noida');
  const [city, setCity] = useState(user?.city || 'Noida');
  const [urgency, setUrgency] = useState('standard');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [matchingAlert, setMatchingAlert] = useState(null);
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Chat & Review state
  const [chatOpen, setChatOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');

  // Initial load
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Check URL params for direct booking trigger
  useEffect(() => {
    const sId = searchParams.get('serviceId');
    if (sId && services.length > 0) {
      const match = services.find((s) => s._id === sId);
      if (match) {
        setSelectedService(match);
        setShowRequestModal(true);
      }
    }
  }, [searchParams, services]);

  // Listen for real-time booking status changes via Socket
  useEffect(() => {
    if (!socket) return;

    const handleBookingUpdate = (data) => {
      console.log('[Customer Socket] Booking update:', data);
      loadActiveBooking();
    };

    const handleBookingAccepted = (booking) => {
      console.log('[Customer Socket] Request accepted by provider:', booking);
      setActiveBooking(booking);
      setMatchingAlert(null);
    };

    socket.on('booking:status_update', handleBookingUpdate);
    socket.on('booking:accepted', handleBookingAccepted);

    return () => {
      socket.off('booking:status_update', handleBookingUpdate);
      socket.off('booking:accepted', handleBookingAccepted);
    };
  }, [socket]);

  const loadDashboardData = async () => {
    setLoading(true);
    await Promise.all([loadActiveBooking(), loadServices(), loadNearbyProviders()]);
    setLoading(false);
  };

  const loadActiveBooking = async () => {
    try {
      const res = await api.get('/customer/active-booking');
      if (res.data.success && res.data.hasActiveBooking) {
        setActiveBooking(res.data.booking);
      } else {
        setActiveBooking(null);
      }
    } catch (err) {
      console.warn('Failed to load active booking');
    }
  };

  const loadServices = async () => {
    try {
      const res = await api.get('/customer/services');
      if (res.data.success && res.data.services?.length > 0) {
        setServices(res.data.services);
        if (!selectedService) {
          setSelectedService(res.data.services[0]);
        }
      } else {
        setServices(INITIAL_SERVICES);
        if (!selectedService) setSelectedService(INITIAL_SERVICES[0]);
      }
    } catch (err) {
      console.warn('Failed to fetch services, using verified catalog fallback');
      setServices(INITIAL_SERVICES);
      if (!selectedService) setSelectedService(INITIAL_SERVICES[0]);
    }
  };

  const loadNearbyProviders = async () => {
    try {
      const res = await api.get('/customer/nearby-providers');
      if (res.data.success) {
        setNearbyProviders(res.data.providers);
      }
    } catch (err) {
      console.warn('Failed to load nearby providers');
    }
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDetectingLocation(false);
        const { latitude, longitude } = pos.coords;
        setAddress(`GPS Pin (${latitude.toFixed(4)}, ${longitude.toFixed(4)}) - Auto Verified`);
      },
      (err) => {
        setDetectingLocation(false);
        setAddress('Sector 62 Tech Park, Noida, NCR');
      },
      { timeout: 6000 }
    );
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!selectedService || !problemDescription.trim()) return;

    setSubmittingRequest(true);
    try {
      const res = await api.post('/customer/request-service', {
        serviceId: selectedService._id,
        category: selectedService.category,
        problemDescription,
        address,
        city,
        urgency,
        coordinates: user?.location?.coordinates || [77.3736, 28.5204]
      });

      if (res.data.success) {
        setShowRequestModal(false);
        if (res.data.booking) {
          setActiveBooking(res.data.booking);
        }
        setMatchingAlert({
          message: 'AI GPS Matching Engine Active: Broadcasting to nearby verified providers...',
          matchedCount: res.data.matchedCount || 3
        });
        setProblemDescription('');
        setTimeout(loadActiveBooking, 1500);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!activeBooking) return;

    setSubmittingReview(true);
    setReviewSuccess('');
    try {
      const res = await api.post(`/reviews/booking/${activeBooking._id}`, {
        rating: reviewRating,
        comment: reviewComment
      });

      if (res.data.success) {
        setReviewSuccess(
          `Review submitted! AI Sentiment: ${res.data.analysis.sentimentLabel.toUpperCase()} (Trust impact: ${res.data.analysis.trustScoreDelta > 0 ? '+' : ''}${res.data.analysis.trustScoreDelta} pts)`
        );
        setTimeout(() => {
          setReviewModalOpen(false);
          setReviewComment('');
          loadActiveBooking();
        }, 2500);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const categoryIcons = {
    Mechanic: <Wrench size={18} className="text-indigo-400" />,
    Electrician: <Zap size={18} className="text-amber-400" />,
    Homemaker: <Sparkles size={18} className="text-purple-400" />,
    Doctor: <Stethoscope size={18} className="text-rose-400" />,
    Caretaker: <HeartHandshake size={18} className="text-emerald-400" />,
    Tutor: <GraduationCap size={18} className="text-cyan-400" />,
    Plumber: <Droplets size={18} className="text-sky-400" />,
    Painter: <Paintbrush size={18} className="text-pink-400" />
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-100">
      {/* Welcome Hero Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-800/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-2 text-center md:text-left relative z-10">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center justify-center md:justify-start gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Customer Mission Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Dispatch top-tier vetted technicians to your location with real-time GPS telemetry, Google Maps routing, and Razorpay protection.
          </p>
        </div>

        <button
          onClick={() => setShowRequestModal(true)}
          className="relative z-10 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2 shrink-0 hover:scale-105 btn-shimmer"
        >
          <Plus size={18} /> Request New Service
        </button>
      </div>

      {/* Matching Broadcast Alert Banner */}
      {matchingAlert && (
        <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 text-xs text-indigo-200 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <Radio size={16} className="text-cyan-400 animate-spin" />
            <span>
              <strong>Matching in Progress:</strong> {matchingAlert.message} ({matchingAlert.matchedCount} providers alerted)
            </span>
          </div>
          <span className="text-[11px] font-bold text-cyan-400">Waiting for acceptance...</span>
        </div>
      )}

      {/* ACTIVE BOOKING HERO CARD (If active booking exists) */}
      {activeBooking && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status={activeBooking.status} />
                <span className="text-xs font-mono font-bold text-slate-400">
                  #{activeBooking.bookingNumber}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white font-['Outfit']">
                {activeBooking.serviceId?.name || 'On-Demand Service'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeBooking.address}, {activeBooking.city}
              </p>
            </div>

            {/* OTP Badge for customer */}
            <div className="p-3 px-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                Start Service OTP
              </span>
              <span className="text-2xl font-black text-amber-300 font-mono tracking-widest">
                {activeBooking.startOtp || '7294'}
              </span>
              <span className="text-[10px] text-amber-400/80 block">Share with technician to start</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Provider info & actions */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <img
                  src={activeBooking.providerId?.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80'}
                  alt={activeBooking.providerId?.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500 shadow-md shadow-indigo-500/20"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-white truncate">
                      {activeBooking.providerId?.name || 'Assigned Professional'}
                    </h4>
                    {activeBooking.providerProfile?.hasTrustBadge && (
                      <TrustBadge size="sm" showLabel={false} />
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {activeBooking.serviceId?.category} Specialist
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating
                      rating={activeBooking.providerProfile?.rating || 4.9}
                      size={12}
                      showScore
                    />
                    <span className="text-[11px] text-emerald-400 font-semibold">
                      • {activeBooking.providerProfile?.trustScore || 92}% Trust Score
                    </span>
                  </div>
                </div>
              </div>

              {/* Price & Settlement Status */}
              <div className="bg-slate-900/80 p-4 rounded-2xl space-y-2 text-xs border border-slate-800">
                <div className="flex justify-between text-slate-400">
                  <span>Estimated Total:</span>
                  <span className="font-bold text-white text-sm">₹{activeBooking.finalPrice || activeBooking.estimatedPrice}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Settlement:</span>
                  <span className="font-semibold text-emerald-400 uppercase">
                    {activeBooking.paymentStatus} ({activeBooking.paymentMethod})
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setChatOpen(true)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                >
                  <MessageSquare size={15} /> Chat with Pro
                </button>

                <Link
                  to={`/customer/track/${activeBooking._id}`}
                  className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-indigo-600/30 btn-shimmer"
                >
                  <Navigation size={15} /> Full Live Tracker
                </Link>
              </div>

              {/* Review Prompt if Service Completed */}
              {activeBooking.status === 'SERVICE_COMPLETED' && (
                <button
                  onClick={() => setReviewModalOpen(true)}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all btn-shimmer"
                >
                  <Star size={15} className="fill-white" /> Rate &amp; Review Service (AI Analyzed)
                </button>
              )}
            </div>

            {/* Right: Embedded Live Map */}
            <div className="lg:col-span-7">
              <MapTracker
                customerCoords={[
                  activeBooking.customerLocation?.coordinates?.[1] || 28.5204,
                  activeBooking.customerLocation?.coordinates?.[0] || 77.3736
                ]}
                providerCoords={[
                  activeBooking.providerLiveLocation?.coordinates?.[1] || 28.5450,
                  activeBooking.providerLiveLocation?.coordinates?.[0] || 77.3450
                ]}
                customerName={user?.name}
                providerName={activeBooking.providerId?.name}
                height="300px"
              />
            </div>
          </div>
        </div>
      )}

      {/* Services Quick Launcher Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white font-['Outfit']">Service Directory</h2>
          <Link to="/services" className="text-xs font-semibold text-indigo-400 hover:underline">
            View All Services →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {services.map((s) => (
            <button
              key={s._id}
              onClick={() => {
                setSelectedService(s);
                setShowRequestModal(true);
              }}
              className="p-3.5 glass-card rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-all text-center flex flex-col items-center justify-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                {categoryIcons[s.category] || <Wrench size={18} className="text-indigo-400" />}
              </div>
              <span className="text-[11px] font-bold text-slate-200 leading-tight">
                {s.category}
              </span>
              <span className="text-[10px] text-slate-400">From ₹{s.basePrice}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Nearby Verified Providers Map & List */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2 font-['Outfit']">
              <MapPin size={18} className="text-indigo-400" /> Active GPS Telemetry Radar
            </h3>
            <p className="text-xs text-slate-400">Transmitting live in {city} Region</p>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {nearbyProviders.length} Verified Pros Online
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {nearbyProviders.slice(0, 3).map((p) => (
            <div key={p.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
              <img src={p.avatar} alt={p.name} className="w-12 h-12 rounded-xl object-cover border border-slate-700" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-xs text-white truncate">{p.name}</h4>
                  {p.hasTrustBadge && <TrustBadge size="sm" showLabel={false} />}
                </div>
                <p className="text-[11px] text-slate-400 truncate">{p.categories?.join(', ')}</p>
                <div className="flex items-center gap-2 mt-1">
                  <StarRating rating={p.rating} size={11} showScore />
                  <span className="text-[10px] text-emerald-400 font-bold">• {p.trustScore}% Trust</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SERVICE REQUEST MODAL */}
      {showRequestModal && selectedService && (
        <div className="fixed inset-0 z-[1100] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-700 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-gradient-to-r from-indigo-700 to-indigo-600 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-200">
                  Request Service
                </span>
                <h3 className="font-bold text-base">{selectedService.name}</h3>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Describe Your Problem / Service Requirement
                </label>
                <textarea
                  required
                  rows={3}
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="e.g. Need immediate battery jump-start assistance on Sector 128 expressway..."
                  className="w-full p-3 text-xs rounded-xl glass-input placeholder:text-slate-500"
                ></textarea>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">Service Address &amp; Location</label>
                  <button
                    type="button"
                    onClick={handleDetectGPS}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    <Crosshair size={12} className={detectingLocation ? 'animate-spin' : ''} />
                    {detectingLocation ? 'Locating...' : 'Detect My GPS'}
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl glass-input bg-slate-900"
                  >
                    <option value="Noida" className="bg-slate-900 text-white">Noida</option>
                    <option value="Delhi" className="bg-slate-900 text-white">Delhi</option>
                    <option value="Gurugram" className="bg-slate-900 text-white">Gurugram</option>
                    <option value="Ghaziabad" className="bg-slate-900 text-white">Ghaziabad</option>
                    <option value="Faridabad" className="bg-slate-900 text-white">Faridabad</option>
                    <option value="Meerut" className="bg-slate-900 text-white">Meerut</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method</label>
                  <div className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                    <CreditCard size={14} className="text-cyan-400" />
                    <span>Razorpay Escrow</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Urgency Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'standard', label: 'Standard', desc: 'Normal dispatch' },
                    { id: 'urgent', label: 'Urgent', desc: 'Within 30 mins' },
                    { id: 'emergency', label: 'Emergency', desc: 'Immediate GPS alert' }
                  ].map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setUrgency(u.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        urgency === u.id
                          ? 'border-indigo-500 bg-indigo-500/20 text-white font-bold'
                          : 'border-slate-800 text-slate-400 hover:bg-slate-800 text-xs'
                      }`}
                    >
                      <span className="block text-xs capitalize font-bold">{u.label}</span>
                      <span className="text-[10px] text-slate-400">{u.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Estimated Base Price:</span>
                <span className="font-extrabold text-white text-sm">
                  ₹{urgency === 'emergency' ? Math.round(selectedService.basePrice * 1.5) : selectedService.basePrice}
                </span>
              </div>

              <button
                type="submit"
                disabled={submittingRequest}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 btn-shimmer"
              >
                <Send size={15} />
                {submittingRequest ? 'Broadcasting to Providers...' : 'Confirm & Find Nearby Pros'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* RATE & REVIEW MODAL */}
      {reviewModalOpen && activeBooking && (
        <div className="fixed inset-0 z-[1100] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white">Review Service</h3>
              <button onClick={() => setReviewModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="text-center space-y-2 py-2">
              <p className="text-xs text-slate-400">Rate your experience with {activeBooking.providerId?.name}:</p>
              <div className="flex justify-center">
                <StarRating
                  rating={reviewRating}
                  size={32}
                  interactive
                  onRatingChange={setReviewRating}
                />
              </div>
            </div>

            {reviewSuccess ? (
              <div className="p-3 bg-emerald-500/10 text-emerald-300 rounded-xl text-xs border border-emerald-500/30 text-center font-medium">
                {reviewSuccess}
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-3">
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Write honest feedback. Our AI analyzes tone, punctuality, and professionalism..."
                  className="w-full p-3 text-xs rounded-xl glass-input placeholder:text-slate-500"
                ></textarea>

                <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  🤖 <strong>AI Quality Shield:</strong> Reviews are automatically scanned for sentiment polarity and fraud patterns before updating the provider's verified reputation.
                </div>

                <button
                  type="submit"
                  disabled={submittingReview || !reviewComment.trim()}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 disabled:opacity-50 btn-shimmer"
                >
                  {submittingReview ? 'Analyzing Review with NLP...' : 'Submit Verified Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Chat Drawer */}
      {activeBooking && (
        <ChatDrawer
          bookingId={activeBooking._id}
          recipientName={activeBooking.providerId?.name}
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  );
}
