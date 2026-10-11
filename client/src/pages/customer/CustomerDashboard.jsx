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
  Plus
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import StatusBadge from '../../components/StatusBadge';
import TrustBadge from '../../components/TrustBadge';
import StarRating from '../../components/StarRating';
import MapTracker from '../../components/MapTracker';
import ChatDrawer from '../../components/ChatDrawer';

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
      if (res.data.success) {
        setServices(res.data.services);
        if (!selectedService && res.data.services.length > 0) {
          setSelectedService(res.data.services[0]);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch services');
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
        setMatchingAlert({
          message: 'AI GPS Matching Engine Active: Broadcasting to nearby verified providers...',
          matchedCount: res.data.matchedCount
        });
        setProblemDescription('');
        // Poll or wait for socket acceptance
        setTimeout(loadActiveBooking, 3000);
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
    Mechanic: <Wrench size={20} className="text-blue-600" />,
    Electrician: <Zap size={20} className="text-amber-500" />,
    Homemaker: <Sparkles size={20} className="text-purple-500" />,
    Doctor: <Stethoscope size={20} className="text-rose-500" />,
    Caretaker: <HeartHandshake size={20} className="text-emerald-500" />,
    Tutor: <GraduationCap size={20} className="text-cyan-500" />,
    Plumber: <Droplets size={20} className="text-sky-500" />,
    Painter: <Paintbrush size={20} className="text-indigo-500" />
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">
            Customer Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            Hello, {user?.name} 👋
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
            Need emergency assistance or home maintenance? Tap below to launch our instant GPS matching engine.
          </p>
        </div>

        <button
          onClick={() => setShowRequestModal(true)}
          className="px-6 py-3.5 rounded-2xl bg-white text-brand-600 font-bold text-xs sm:text-sm hover:bg-blue-50 shadow-lg shadow-black/10 transition-all flex items-center gap-2 shrink-0 hover:scale-105"
        >
          <Plus size={18} /> Request New Service
        </button>
      </div>

      {/* Matching Broadcast Alert Banner */}
      {matchingAlert && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <Radio size={16} className="text-blue-600 animate-spin" />
            <span>
              <strong>Matching in Progress:</strong> {matchingAlert.message} ({matchingAlert.matchedCount} providers alerted)
            </span>
          </div>
          <span className="text-[11px] font-bold text-blue-600">Waiting for acceptance...</span>
        </div>
      )}

      {/* ACTIVE BOOKING HERO CARD (If active booking exists) */}
      {activeBooking && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status={activeBooking.status} />
                <span className="text-xs font-bold text-slate-400">
                  #{activeBooking.bookingNumber}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {activeBooking.serviceId?.name || 'On-Demand Service'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeBooking.address}, {activeBooking.city}
              </p>
            </div>

            {/* OTP Badge for customer */}
            <div className="bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-2xl text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                Start Service OTP
              </span>
              <span className="text-2xl font-black text-amber-900 tracking-widest">
                {activeBooking.startOtp || '7294'}
              </span>
              <span className="text-[10px] text-amber-600 block">Share with pro to start</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Provider info & actions */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <img
                  src={activeBooking.providerId?.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80'}
                  alt={activeBooking.providerId?.name}
                  className="w-14 h-14 rounded-2xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-slate-900 truncate">
                      {activeBooking.providerId?.name || 'Assigned Professional'}
                    </h4>
                    {activeBooking.providerProfile?.hasTrustBadge && (
                      <TrustBadge size="sm" showLabel={false} />
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {activeBooking.serviceId?.category} Specialist
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating
                      rating={activeBooking.providerProfile?.rating || 4.9}
                      size={12}
                      showScore
                    />
                    <span className="text-[11px] text-emerald-600 font-semibold">
                      • {activeBooking.providerProfile?.trustScore || 92}% Trust Score
                    </span>
                  </div>
                </div>
              </div>

              {/* Price & Status */}
              <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-xs border border-slate-100">
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Total:</span>
                  <span className="font-bold text-slate-900 text-sm">₹{activeBooking.finalPrice || activeBooking.estimatedPrice}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Payment Status:</span>
                  <span className="font-semibold text-emerald-600 uppercase">
                    {activeBooking.paymentStatus} ({activeBooking.paymentMethod})
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setChatOpen(true)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageSquare size={15} /> Chat with Pro
                </button>

                <Link
                  to={`/customer/track/${activeBooking._id}`}
                  className="py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Navigation size={15} /> Full Tracking
                </Link>
              </div>

              {/* Review Prompt if Service Completed */}
              {activeBooking.status === 'SERVICE_COMPLETED' && (
                <button
                  onClick={() => setReviewModalOpen(true)}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
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
                height="280px"
              />
            </div>
          </div>
        </div>
      )}

      {/* Services Quick Launcher Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Explore Services</h2>
          <Link to="/services" className="text-xs font-semibold text-brand-600 hover:underline">
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
              className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-300 transition-all text-center flex flex-col items-center justify-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                {categoryIcons[s.category] || <Wrench size={20} className="text-blue-600" />}
              </div>
              <span className="text-[11px] font-bold text-slate-800 leading-tight">
                {s.category}
              </span>
              <span className="text-[10px] text-slate-400">From ₹{s.basePrice}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Nearby Verified Providers Map & List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <MapPin size={18} className="text-brand-600" /> Nearby Verified Professionals
            </h3>
            <p className="text-xs text-slate-500">Live GPS availability in {city}</p>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            {nearbyProviders.length} Online Now
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {nearbyProviders.slice(0, 3).map((p) => (
            <div key={p.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <img src={p.avatar} alt={p.name} className="w-12 h-12 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-xs text-slate-900 truncate">{p.name}</h4>
                  {p.hasTrustBadge && <TrustBadge size="sm" showLabel={false} />}
                </div>
                <p className="text-[11px] text-slate-500 truncate">{p.categories?.join(', ')}</p>
                <div className="flex items-center gap-2 mt-1">
                  <StarRating rating={p.rating} size={11} showScore />
                  <span className="text-[10px] text-emerald-600 font-bold">• {p.trustScore}% Trust</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SERVICE REQUEST MODAL */}
      {showRequestModal && selectedService && (
        <div className="fixed inset-0 z-[1100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-brand-600 text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-blue-100">
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Describe Your Problem / Requirement
                </label>
                <textarea
                  required
                  rows={3}
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="e.g. My car won't start, battery is dead on Sector 128 expressway..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Service Address</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Noida">Noida</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Gurugram">Gurugram</option>
                    <option value="Ghaziabad">Ghaziabad</option>
                    <option value="Faridabad">Faridabad</option>
                    <option value="Meerut">Meerut</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Urgency Level</label>
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
                          ? 'border-brand-500 bg-brand-50 text-brand-700 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50 text-xs'
                      }`}
                    >
                      <span className="block text-xs capitalize font-bold">{u.label}</span>
                      <span className="text-[10px] text-slate-400">{u.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500">Base Estimated Price:</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  ₹{urgency === 'emergency' ? Math.round(selectedService.basePrice * 1.5) : selectedService.basePrice}
                </span>
              </div>

              <button
                type="submit"
                disabled={submittingRequest}
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
        <div className="fixed inset-0 z-[1100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">Review Service</h3>
              <button onClick={() => setReviewModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="text-center space-y-2 py-2">
              <p className="text-xs text-slate-500">Rate your experience with {activeBooking.providerId?.name}:</p>
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
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs border border-emerald-200 text-center font-medium">
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
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                ></textarea>

                <div className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  🤖 <strong>AI Quality Shield:</strong> Reviews are automatically scanned for sentiment polarity and fraud patterns before updating the provider's verified reputation.
                </div>

                <button
                  type="submit"
                  disabled={submittingReview || !reviewComment.trim()}
                  className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 disabled:opacity-50"
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
