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
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import MapTracker from '../../components/MapTracker';
import StatusBadge from '../../components/StatusBadge';
import TrustBadge from '../../components/TrustBadge';
import ChatDrawer from '../../components/ChatDrawer';

export default function CustomerTrackingView() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

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

  const loadBooking = async () => {
    try {
      const res = await api.get(`/customer/bookings`);
      if (res.data.success) {
        const found = res.data.bookings.find((b) => b._id === bookingId);
        if (found) setBooking(found);
      }
    } catch (err) {
      console.warn('Failed to fetch booking details');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async () => {
    setPaying(true);
    try {
      // 1. Create order
      const orderRes = await api.post('/payments/create-order', {
        bookingId: booking._id,
        amount: booking.finalPrice || booking.estimatedPrice
      });

      if (orderRes.data.success) {
        // 2. Simulate Razorpay payment confirmation
        const verifyRes = await api.post('/payments/verify', {
          paymentId: orderRes.data.order.paymentId,
          razorpayOrderId: orderRes.data.order.razorpayOrderId,
          razorpayPaymentId: `pay_${Date.now()}`,
          razorpaySignature: 'simulated_valid_signature'
        });

        if (verifyRes.data.success) {
          setPaymentDone(true);
          loadBooking();
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Payment simulation failed');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <AlertCircle size={36} className="mx-auto text-rose-500" />
        <h2 className="text-xl font-bold text-slate-900">Booking Not Found</h2>
        <Link to="/customer/dashboard" className="inline-block px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold">
          Back to Dashboard
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/customer/dashboard')}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900">Live Service Tracker</h1>
              <StatusBadge status={booking.status} />
            </div>
            <p className="text-xs text-slate-500">Booking #{booking.bookingNumber}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setChatOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <MessageSquare size={14} /> In-App Chat
          </button>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-5 gap-2 text-center relative">
          {steps.map((step, idx) => {
            const isDone = currentStepIndex >= idx;
            const isCurrent = currentStepIndex === idx;
            return (
              <div key={step.key} className="flex flex-col items-center space-y-1.5 z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isDone
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30'
                      : 'bg-slate-100 text-slate-400'
                  } ${isCurrent ? 'ring-4 ring-brand-100' : ''}`}
                >
                  {isDone ? <CheckCircle size={15} /> : idx + 1}
                </div>
                <span className={`text-[11px] font-semibold ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>
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
            customerName="Your Address"
            providerName={booking.providerId?.name}
            height="420px"
          />
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-4">
          {/* OTP Verification Box */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-3xl border border-amber-200 shadow-sm text-center space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
              Start Service OTP
            </span>
            <div className="text-3xl font-black text-amber-900 tracking-widest my-1">
              {booking.startOtp || '7294'}
            </div>
            <p className="text-[11px] text-amber-700 leading-snug">
              Share this 4-digit code with your technician upon arrival to authorize starting work.
            </p>
          </div>

          {/* Provider Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3.5">
              <img
                src={booking.providerId?.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80'}
                alt={booking.providerId?.name}
                className="w-14 h-14 rounded-2xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-slate-900 truncate">
                    {booking.providerId?.name || 'Technician'}
                  </h3>
                  <TrustBadge size="sm" showLabel={false} />
                </div>
                <p className="text-xs text-slate-500">{booking.serviceId?.category} Specialist</p>
                <p className="text-xs text-brand-600 font-semibold mt-0.5">{booking.providerId?.phone}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Service:</span>
                <span className="font-bold text-slate-900">{booking.serviceId?.name}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Amount:</span>
                <span className="font-extrabold text-slate-900">₹{booking.finalPrice || booking.estimatedPrice}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment:</span>
                <span className={`font-bold ${booking.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'} uppercase`}>
                  {booking.paymentStatus}
                </span>
              </div>
            </div>

            {/* Payment Button if Completed and Unpaid */}
            {['SERVICE_COMPLETED', 'CUSTOMER_REVIEWED'].includes(booking.status) && booking.paymentStatus !== 'paid' && (
              <button
                onClick={handlePayNow}
                disabled={paying}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                <CreditCard size={15} /> {paying ? 'Processing Payment...' : `Pay ₹${booking.finalPrice || booking.estimatedPrice} Online`}
              </button>
            )}

            {paymentDone && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs text-center font-bold border border-emerald-200">
                ✓ Payment Captured via Razorpay!
              </div>
            )}
          </div>
        </div>
      </div>

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
