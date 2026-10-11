import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Power,
  ShieldCheck,
  Star,
  DollarSign,
  CheckCircle,
  MapPin,
  Clock,
  Phone,
  MessageSquare,
  Navigation,
  KeyRound,
  AlertCircle,
  Radio
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import StatusBadge from '../../components/StatusBadge';
import TrustBadge from '../../components/TrustBadge';
import StarRating from '../../components/StarRating';
import MapTracker from '../../components/MapTracker';
import ChatDrawer from '../../components/ChatDrawer';
import IncomingDispatchModal from '../../components/IncomingDispatchModal';

export default function ProviderDashboard() {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [providerProfile, setProviderProfile] = useState(null);
  const [activeBooking, setActiveBooking] = useState(null);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stepper state
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Chat
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    loadProviderData();
  }, []);

  // Listen for socket events
  useEffect(() => {
    if (!socket) return;

    const handleBookingUpdate = (data) => {
      console.log('[Provider Socket] Booking update received:', data);
      loadActiveBooking();
    };

    socket.on('booking:status_update', handleBookingUpdate);

    return () => {
      socket.off('booking:status_update', handleBookingUpdate);
    };
  }, [socket]);

  // Periodic simulated GPS location update to active booking room
  useEffect(() => {
    if (!activeBooking || !socket) return;

    const interval = setInterval(() => {
      // Simulate minor coordinate drift as provider moves towards customer
      const currentLat = activeBooking.providerLiveLocation?.coordinates?.[1] || 28.5450;
      const currentLng = activeBooking.providerLiveLocation?.coordinates?.[0] || 77.3450;
      const custLat = activeBooking.customerLocation?.coordinates?.[1] || 28.5204;
      const custLng = activeBooking.customerLocation?.coordinates?.[0] || 77.3736;

      const nextLat = currentLat + (custLat - currentLat) * 0.05;
      const nextLng = currentLng + (custLng - currentLng) * 0.05;

      socket.emit('provider:location', {
        bookingId: activeBooking._id,
        coordinates: [nextLng, nextLat]
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [activeBooking, socket]);

  const loadProviderData = async () => {
    setLoading(true);
    await Promise.all([loadProfile(), loadActiveBooking(), loadIncomingRequests()]);
    setLoading(false);
  };

  const loadProfile = async () => {
    try {
      const res = await api.get('/provider/profile');
      if (res.data.success) {
        setProviderProfile(res.data.provider);
      }
    } catch (err) {
      console.warn('Failed to load provider profile');
    }
  };

  const loadActiveBooking = async () => {
    try {
      const res = await api.get('/provider/active-booking');
      if (res.data.success && res.data.hasActiveBooking) {
        setActiveBooking(res.data.booking);
      } else {
        setActiveBooking(null);
      }
    } catch (err) {
      console.warn('Failed to load active booking');
    }
  };

  const loadIncomingRequests = async () => {
    try {
      const res = await api.get('/provider/requests');
      if (res.data.success) {
        setIncomingRequests(res.data.requests);
      }
    } catch (err) {
      console.warn('Failed to load incoming requests');
    }
  };

  const handleToggleOnline = async () => {
    if (!providerProfile) return;
    try {
      const res = await api.put('/provider/availability', {
        isOnline: !providerProfile.isOnline
      });
      if (res.data.success) {
        setProviderProfile((prev) => ({ ...prev, isOnline: res.data.isOnline }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const res = await api.post(`/provider/requests/${requestId}/accept`);
      if (res.data.success) {
        setActiveBooking(res.data.booking);
        loadIncomingRequests();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleUpdateStatus = async (nextStatus) => {
    if (!activeBooking) return;
    setUpdatingStatus(true);
    setOtpError('');

    const payload = { status: nextStatus };
    if (nextStatus === 'SERVICE_STARTED') {
      if (!otpInput) {
        setOtpError('Please ask customer for their 4-digit start OTP');
        setUpdatingStatus(false);
        return;
      }
      payload.startOtp = otpInput.trim();
    }

    try {
      const res = await api.put(`/provider/bookings/${activeBooking._id}/status`, payload);
      if (res.data.success) {
        setActiveBooking(res.data.booking);
        setOtpInput('');
        if (nextStatus === 'SERVICE_COMPLETED') {
          loadProfile(); // refresh earnings
        }
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Status transition failed');
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner with Online/Offline Toggle */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center md:text-left">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80'}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20"
          />
          <div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <h1 className="text-2xl font-extrabold">{user?.name}</h1>
              {providerProfile?.hasTrustBadge && <TrustBadge size="sm" />}
            </div>
            <p className="text-xs text-slate-400">
              {providerProfile?.categories?.join(', ')} • {providerProfile?.qualification}
            </p>
          </div>
        </div>

        {/* Online/Offline Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleToggleOnline}
            className={`px-6 py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center gap-2.5 transition-all shadow-lg ${
              providerProfile?.isOnline
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <Power size={18} className={providerProfile?.isOnline ? 'animate-pulse' : ''} />
            {providerProfile?.isOnline ? 'You Are ONLINE & Dispatchable' : 'You Are OFFLINE'}
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Earnings</span>
          <div className="text-2xl font-extrabold text-slate-900">
            ₹{providerProfile?.totalEarnings || 0}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block">
            ₹{providerProfile?.pendingPayout || 0} pending payout
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rating Score</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {providerProfile?.ratingAverage || 5.0}
            </span>
            <StarRating rating={providerProfile?.ratingAverage || 5} size={14} />
          </div>
          <span className="text-[11px] text-slate-500 block">
            From {providerProfile?.ratingCount || 0} verified reviews
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Trust Score</span>
          <div className="text-2xl font-extrabold text-emerald-600">
            {providerProfile?.trustScore || 75}%
          </div>
          <span className="text-[11px] text-slate-500 block">
            {providerProfile?.hasTrustBadge ? '✓ Verified & Trusted Badge Active' : 'Need 80%+ for Badge'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">KYC Status</span>
          <div>
            <StatusBadge status={providerProfile?.kycStatus || 'pending'} />
          </div>
          <Link to="/provider/kyc" className="text-[11px] font-bold text-brand-600 hover:underline block pt-1">
            View / Upload Documents →
          </Link>
        </div>
      </div>

      {/* ACTIVE JOB STEPPER BANNER (If job accepted) */}
      {activeBooking ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-brand-500 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                  Active Service In Progress
                </span>
                <StatusBadge status={activeBooking.status} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {activeBooking.serviceId?.name} – #{activeBooking.bookingNumber}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Customer: <strong>{activeBooking.customerId?.name}</strong> • Phone: {activeBooking.customerId?.phone}
              </p>
            </div>

            <button
              onClick={() => setChatOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare size={15} /> Chat with Customer
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Step Controls */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Destination:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[200px]">
                    {activeBooking.address}, {activeBooking.city}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Problem Reported:</span>
                  <span className="font-semibold text-slate-800 italic">
                    "{activeBooking.problemDescription}"
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Job Fee:</span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    ₹{activeBooking.finalPrice || activeBooking.estimatedPrice}
                  </span>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="space-y-3">
                {activeBooking.status === 'ACCEPTED' && (
                  <button
                    onClick={() => handleUpdateStatus('PROVIDER_ON_THE_WAY')}
                    disabled={updatingStatus}
                    className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
                  >
                    <Navigation size={16} /> Mark: I am On The Way
                  </button>
                )}

                {activeBooking.status === 'PROVIDER_ON_THE_WAY' && (
                  <button
                    onClick={() => handleUpdateStatus('ARRIVED')}
                    disabled={updatingStatus}
                    className="w-full py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
                  >
                    <MapPin size={16} /> Mark: Arrived at Customer Location
                  </button>
                )}

                {activeBooking.status === 'ARRIVED' && (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
                    <label className="block text-xs font-bold text-amber-900">
                      Enter Customer's 4-Digit Start OTP:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={4}
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        placeholder="e.g. 7294"
                        className="flex-1 px-3 py-2 text-center tracking-widest font-black text-lg rounded-xl border border-amber-300 bg-white"
                      />
                      <button
                        onClick={() => handleUpdateStatus('SERVICE_STARTED')}
                        disabled={updatingStatus || otpInput.length < 4}
                        className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs disabled:opacity-50"
                      >
                        Verify &amp; Start
                      </button>
                    </div>
                    {otpError && <p className="text-xs text-rose-600 font-semibold">{otpError}</p>}
                  </div>
                )}

                {activeBooking.status === 'SERVICE_STARTED' && (
                  <button
                    onClick={() => handleUpdateStatus('SERVICE_COMPLETED')}
                    disabled={updatingStatus}
                    className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    <CheckCircle size={18} /> Complete Job &amp; Collect Payment
                  </button>
                )}

                {activeBooking.status === 'SERVICE_COMPLETED' && (
                  <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs font-bold text-center">
                    ✓ Job Completed! Waiting for customer review and payment settlement.
                  </div>
                )}
              </div>
            </div>

            {/* Map */}
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
                customerName={activeBooking.customerId?.name}
                providerName="Your Live Location"
                height="280px"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Incoming Job Requests Queue */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Radio size={18} className="text-brand-600" /> Incoming Service Requests
              </h3>
              <p className="text-xs text-slate-500">Live matching alerts within your service radius</p>
            </div>
            <button
              onClick={loadIncomingRequests}
              className="text-xs font-semibold text-brand-600 hover:underline"
            >
              Refresh Queue
            </button>
          </div>

          {incomingRequests.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <Clock size={28} className="mx-auto text-slate-300" />
              <p className="font-medium text-slate-600">No active job requests in your radius.</p>
              <p className="text-slate-400">Keep your toggle ONLINE to receive automated AI dispatches.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incomingRequests.map((req) => (
                <div
                  key={req._id}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand-300 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{req.category}</span>
                    <span className="text-xs font-bold text-emerald-600">₹{req.serviceId?.basePrice}</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">"{req.problemDescription}"</p>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin size={12} className="text-slate-400" /> {req.address}, {req.city}
                  </div>

                  <button
                    onClick={() => handleAcceptRequest(req._id)}
                    className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
                  >
                    Accept Job Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Real-Time Incoming Dispatch Modal Popup */}
      <IncomingDispatchModal onAccepted={(booking) => setActiveBooking(booking)} />

      {/* Chat Drawer */}
      {activeBooking && (
        <ChatDrawer
          bookingId={activeBooking._id}
          recipientName={activeBooking.customerId?.name}
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  );
}
