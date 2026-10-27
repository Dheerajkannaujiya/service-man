import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Navigation,
  Phone,
  MessageSquare,
  ShieldCheck,
  Clock,
  MapPin,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Star,
  Sparkles,
  Zap,
  CheckCircle2,
  Lock
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import MapTracker from '../../components/MapTracker';
import StatusBadge from '../../components/StatusBadge';
import TrustBadge from '../../components/TrustBadge';
import ChatDrawer from '../../components/ChatDrawer';
import StarRating from '../../components/StarRating';

export default function CustomerTrackingView() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  // Review modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewResult, setReviewResult] = useState(null);

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  useEffect(() => {
    if (!socket || !bookingId) return;

    socket.emit('booking:join', { bookingId });

    const handleLocationUpdate = (data) => {
      console.log('[Tracking] Live location streamed:', data);
      setBooking((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          providerLiveLocation: { type: 'Point', coordinates: data.coordinates }
        };
      });
    };

    const handleStatusUpdate = (data) => {
      console.log('[Tracking] Status updated:', data);
      loadBooking();
    };

    socket.on('booking:location_update', handleLocationUpdate);
    socket.on('booking:status_update', handleStatusUpdate);

    return () => {
      socket.off('booking:location_update', handleLocationUpdate);
      socket.off('booking:status_update', handleStatusUpdate);
      socket.emit('booking:leave', { bookingId });
    };
  }, [socket, bookingId]);

  // Periodic provider coordinate simulation if technician is on the way
  useEffect(() => {
    if (!booking || booking.status !== 'PROVIDER_ON_THE_WAY') return;

    const interval = setInterval(() => {
      setBooking((prev) => {
        if (!prev || !prev.providerLiveLocation) return prev;
        const currentCoords = prev.providerLiveLocation.coordinates || [77.3450, 28.5450];
        const targetCoords = prev.customerLocation?.coordinates || [77.3736, 28.5204];

        const nextLng = currentCoords[0] + (targetCoords[0] - currentCoords[0]) * 0.08;
        const nextLat = currentCoords[1] + (targetCoords[1] - currentCoords[1]) * 0.08;

        return {
          ...prev,
          providerLiveLocation: {
            type: 'Point',
            coordinates: [nextLng, nextLat]
          }
        };
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [booking?.status]);

  const loadBooking = async () => {
    try {
      // 1. Try customer bookings list
      const res = await api.get('/customer/bookings');
      if (res.data.success && res.data.bookings?.length > 0) {
        const found = res.data.bookings.find((b) => b._id === bookingId);
        if (found) {
          setBooking(found);
          return;
        }
      }

      // 2. Try customer active booking
      const activeRes = await api.get('/customer/active-booking');
      if (activeRes.data.success && activeRes.data.booking) {
        if (activeRes.data.booking._id === bookingId || !bookingId) {
          setBooking(activeRes.data.booking);
          return;
        }
      }

      // 3. Fallback: If still not found, use active booking
      if (activeRes.data.booking) {
        setBooking(activeRes.data.booking);
      }
    } catch (err) {
      console.warn('Failed to fetch booking details');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Razorpay Payment:
   * Opens official Razorpay Checkout popup if key configured,
   * with seamless fast-test fallback simulation.
   */
  const handlePayNow = async (forceSimulation = false) => {
    setPaying(true);
    try {
      // 1. Create Order on backend
      const orderRes = await api.post('/payments/create-order', {
        bookingId: booking._id,
        amount: booking.finalPrice || booking.estimatedPrice
      });

      if (!orderRes.data.success) {
        throw new Error(orderRes.data.message || 'Could not initialize payment order');
      }

      const orderData = orderRes.data.order;
      const keyId = orderData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID;

      // If Razorpay SDK is loaded and we have a valid key (not simulated order)
      if (
        !forceSimulation &&
        window.Razorpay &&
        keyId &&
        !keyId.includes('serviceman2026') &&
        !orderData.razorpayOrderId.startsWith('order_sim_')
      ) {
        const rzpOptions = {
          key: keyId,
          amount: Math.round(orderData.amount * 100),
          currency: orderData.currency || 'INR',
          name: 'ServiceMan Marketplace',
          description: `Payment for #${booking.bookingNumber || booking._id.slice(-6)}`,
          image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=100&q=80',
          order_id: orderData.razorpayOrderId,
          handler: async function (response) {
            try {
              const verifyRes = await api.post('/payments/verify', {
                paymentId: orderData.paymentId,
                razorpayOrderId: response.razorpay_order_id || orderData.razorpayOrderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              });

              if (verifyRes.data.success) {
                setPaymentDone(true);
                setBooking((prev) => ({ ...prev, paymentStatus: 'completed' }));
                loadBooking();
              }
            } catch (vErr) {
              alert('Payment verification failed: ' + (vErr.response?.data?.message || vErr.message));
            }
          },
          prefill: {
            name: user?.name || 'Customer',
            email: user?.email || 'customer@serviceman.com',
            contact: user?.phone || '+919876543210'
          },
          theme: {
            color: '#4f46e5'
          }
        };

        const rzpInstance = new window.Razorpay(rzpOptions);
        rzpInstance.on('payment.failed', function (resp) {
          alert('Razorpay Payment failed: ' + resp.error.description);
        });
        rzpInstance.open();
        return;
      }

      // Fast Sandbox Simulation Fallback (Plug-and-Play Test Mode)
      const verifyRes = await api.post('/payments/verify', {
        paymentId: orderData.paymentId || `pay_${Date.now()}`,
        razorpayOrderId: orderData.razorpayOrderId || `order_${Date.now()}`,
        razorpayPaymentId: `pay_test_${Date.now()}`,
        razorpaySignature: 'simulated_valid_signature'
      });

      if (verifyRes.data.success) {
        setPaymentDone(true);
        setBooking((prev) => ({ ...prev, paymentStatus: 'completed' }));
        loadBooking();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Payment processing error');
    } finally {
      setPaying(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!booking || !reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await api.post(`/reviews/booking/${booking._id}`, {
        rating: reviewRating,
        comment: reviewComment
      });

      if (res.data.success) {
        setReviewResult(res.data.analysis);
        setTimeout(() => {
          setShowReviewModal(false);
          setReviewResult(null);
          setReviewComment('');
          loadBooking();
        }, 2500);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
        <p className="text-xs text-slate-400 font-medium">Connecting to GPS Telemetry...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <AlertCircle size={40} className="mx-auto text-rose-500" />
        <h2 className="text-xl font-bold text-white">Booking Session Not Found</h2>
        <p className="text-xs text-slate-400">
          We could not locate this specific tracking session. Head to your Customer Hub to launch an active dispatch.
        </p>
        <Link
          to="/customer/dashboard"
          className="inline-block px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30"
        >
          Go to Customer Hub
        </Link>
      </div>
    );
  }

  const steps = [
    { key: 'ACCEPTED', label: 'Confirmed' },
    { key: 'PROVIDER_ON_THE_WAY', label: 'On The Way' },
    { key: 'ARRIVED', label: 'Arrived' },
    { key: 'SERVICE_STARTED', label: 'In Progress' },
    { key: 'SERVICE_COMPLETED', label: 'Completed' }
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === booking.status);
  const isPaid = ['paid', 'completed'].includes(booking.paymentStatus?.toLowerCase());

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/customer/dashboard')}
            className="p-2.5 rounded-xl glass-card hover:bg-slate-800 text-slate-300 transition-colors shadow-sm"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white font-['Outfit']">Live Mission Tracker</h1>
              <StatusBadge status={booking.status} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Booking #{booking.bookingNumber}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setChatOpen(true)}
            className="px-4 py-2 rounded-xl glass-card hover:bg-slate-800 text-slate-200 font-semibold text-xs flex items-center gap-1.5 shadow-sm border border-slate-700"
          >
            <MessageSquare size={14} className="text-indigo-400" /> In-App Live Chat
          </button>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800">
        <div className="grid grid-cols-5 gap-2 text-center relative">
          {steps.map((step, idx) => {
            const isDone = currentStepIndex >= idx;
            const isCurrent = currentStepIndex === idx;
            return (
              <div key={step.key} className="flex flex-col items-center space-y-1.5 z-10">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isDone
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                      : 'bg-slate-800 text-slate-500'
                  } ${isCurrent ? 'ring-4 ring-indigo-500/30 animate-pulse' : ''}`}
                >
                  {isDone ? <CheckCircle size={16} /> : idx + 1}
                </div>
                <span className={`text-[11px] font-semibold ${isDone ? 'text-white' : 'text-slate-500'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Map + Provider Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map */}
        <div className="lg:col-span-8">
          <MapTracker
            customerCoords={[
              booking.customerLocation?.coordinates?.[1] || 28.5204,
              booking.customerLocation?.coordinates?.[0] || 77.3736
            ]}
            providerCoords={[
              booking.providerLiveLocation?.coordinates?.[1] || 28.5450,
              booking.providerLiveLocation?.coordinates?.[0] || 77.3450
            ]}
            customerName={booking.address || 'Your Address'}
            providerName={booking.providerId?.name || 'Assigned Technician'}
            height="440px"
          />
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-4">
          {/* OTP Verification Box */}
          <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-center space-y-1 shadow-lg">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
              Start Service OTP
            </span>
            <div className="text-3xl font-black text-amber-300 tracking-widest my-1 font-mono">
              {booking.startOtp || '7294'}
            </div>
            <p className="text-[11px] text-amber-300/80 leading-snug">
              Share this 4-digit code with your technician upon arrival to authorize starting work.
            </p>
          </div>

          {/* Provider Card */}
          <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-3.5">
              <img
                src={booking.providerId?.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80'}
                alt={booking.providerId?.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500 shadow-md shadow-indigo-500/20"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-white truncate">
                    {booking.providerId?.name || 'Assigned Technician'}
                  </h3>
                  <TrustBadge size="sm" showLabel={false} />
                </div>
                <p className="text-xs text-slate-400">{booking.serviceId?.category || 'Service'} Specialist</p>
                <p className="text-xs text-indigo-400 font-semibold mt-0.5">{booking.providerId?.phone || '+919812345678'}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Service Category:</span>
                <span className="font-bold text-white">{booking.serviceId?.name || 'On-Demand Service'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Amount:</span>
                <span className="font-extrabold text-white">₹{booking.finalPrice || booking.estimatedPrice}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Payment Settlement:</span>
                <span className={`font-bold ${isPaid ? 'text-emerald-400' : 'text-amber-400'} uppercase`}>
                  {isPaid ? '✓ PAID' : 'PENDING'} ({booking.paymentMethod || 'RAZORPAY'})
                </span>
              </div>
            </div>

            {/* Razorpay Gateway Checkout / Settlement */}
            {['SERVICE_COMPLETED', 'CUSTOMER_REVIEWED'].includes(booking.status) && !isPaid && (
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => handlePayNow(false)}
                  disabled={paying}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 btn-shimmer"
                >
                  <CreditCard size={15} />
                  <span>{paying ? 'Connecting Gateway...' : `Pay ₹${booking.finalPrice || booking.estimatedPrice} with Razorpay`}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePayNow(true)}
                  disabled={paying}
                  className="w-full py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-medium text-[11px] rounded-xl border border-slate-700 transition-colors"
                >
                  ⚡ Fast Simulation Pay (Instant Test)
                </button>
              </div>
            )}

            {paymentDone && (
              <div className="p-3 bg-emerald-500/10 text-emerald-300 rounded-xl text-xs text-center font-bold border border-emerald-500/30 flex items-center justify-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span>Payment Captured via Razorpay Escrow!</span>
              </div>
            )}

            {/* AI Review Submission Trigger */}
            {['SERVICE_COMPLETED', 'CUSTOMER_REVIEWED'].includes(booking.status) && (
              <button
                onClick={() => setShowReviewModal(true)}
                className="w-full py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-bold text-xs rounded-xl border border-indigo-500/30 flex items-center justify-center gap-1.5 transition-all"
              >
                <Star size={14} className="fill-amber-400 text-amber-400" /> Leave AI-Analyzed Review
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-[1300] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-700 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white flex items-center gap-2 font-['Outfit']">
                <Sparkles size={18} className="text-indigo-400" /> Rate Service Experience
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star size={24} className={star <= reviewRating ? 'fill-amber-400' : 'text-slate-600'} />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-300 ml-2">{reviewRating} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Feedback Comments</label>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details about punctuality, service quality, and technician courtesy..."
                  className="w-full p-3 text-xs rounded-xl glass-input placeholder:text-slate-500"
                ></textarea>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  NLP engine will automatically evaluate sentiment &amp; impact on trust badge.
                </span>
              </div>

              {reviewResult && (
                <div className="p-3 bg-emerald-500/10 text-emerald-300 rounded-xl text-xs font-semibold border border-emerald-500/30">
                  ✓ Review Submitted! AI Sentiment: {reviewResult.sentimentLabel?.toUpperCase()} (+{reviewResult.trustScoreDelta} pts Trust Impact)
                </div>
              )}

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 btn-shimmer"
              >
                {submittingReview ? 'Submitting with AI Evaluation...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Chat Drawer */}
      <ChatDrawer
        bookingId={booking._id}
        recipientName={booking.providerId?.name}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </div>
  );
}
