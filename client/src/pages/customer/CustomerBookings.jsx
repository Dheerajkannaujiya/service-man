import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, Star, ArrowLeft, Receipt, MessageSquare, CreditCard } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import StarRating from '../../components/StarRating';
import ChatDrawer from '../../components/ChatDrawer';
import { processRazorpayPayment } from '../../services/razorpayService';

export default function CustomerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  // Receipt Modal
  const [receiptBooking, setReceiptBooking] = useState(null);

  // Review Modal
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewResult, setReviewResult] = useState(null);

  const { user } = useAuth();
  const [payingBookingId, setPayingBookingId] = useState(null);

  const handlePayBooking = async (b) => {
    setPayingBookingId(b._id);
    try {
      await processRazorpayPayment({
        booking: b,
        user,
        onSuccess: () => {
          alert(`Payment for #${b.bookingNumber} captured successfully via Razorpay!`);
          fetchBookings();
        },
        onError: (err) => {
          if (!err.message?.includes('closed by user') && !err.message?.includes('closed')) {
            alert('Razorpay Payment Error: ' + err.message);
          }
        }
      });
    } catch (err) {
      alert(err.message || 'Payment processing error');
    } finally {
      setPayingBookingId(null);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customer/bookings');
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      console.warn('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'ALL') return true;
    if (filter === 'ACTIVE') {
      return ['REQUESTED', 'MATCHING', 'ACCEPTED', 'PROVIDER_ON_THE_WAY', 'ARRIVED', 'SERVICE_STARTED'].includes(b.status);
    }
    if (filter === 'COMPLETED') {
      return ['SERVICE_COMPLETED', 'CUSTOMER_REVIEWED', 'CLOSED'].includes(b.status);
    }
    if (filter === 'CANCELLED') {
      return b.status.includes('CANCELLED');
    }
    return true;
  });

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewBooking || !reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await api.post(`/reviews/booking/${reviewBooking._id}`, {
        rating: reviewRating,
        comment: reviewComment
      });

      if (res.data.success) {
        setReviewResult(res.data.analysis);
        setTimeout(() => {
          setReviewBooking(null);
          setReviewResult(null);
          setReviewComment('');
          fetchBookings();
        }, 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-['Outfit']">Service History &amp; Bookings</h1>
          <p className="text-xs text-slate-400">Track current jobs, download receipts, and review past service history.</p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 p-1 rounded-2xl text-xs">
          {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filter === f
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading bookings...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-800 space-y-3">
          <Calendar size={36} className="mx-auto text-slate-600" />
          <h3 className="font-bold text-sm text-white">No Bookings Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You don't have any bookings in this category. Browse our service directory to schedule your first visit.
          </p>
          <Link
            to="/customer/dashboard"
            className="inline-flex px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 mt-2 btn-shimmer"
          >
            Explore Services
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b._id}
              className="glass-card rounded-3xl p-6 border border-slate-800 hover:border-indigo-500/40 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <StatusBadge status={b.status} />
                  <span className="text-xs font-mono font-bold text-slate-400">#{b.bookingNumber}</span>
                  <span className="text-xs text-slate-500">• {new Date(b.createdAt).toLocaleDateString()}</span>
                </div>
                <span className="text-sm font-black text-white">
                  ₹{b.finalPrice || b.estimatedPrice}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-white font-['Outfit']">{b.serviceId?.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-1">{b.problemDescription}</p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                    <MapPin size={13} className="text-indigo-400 shrink-0" />
                    <span>{b.address}, {b.city}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={b.providerId?.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80'}
                    alt={b.providerId?.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                  />
                  <div className="text-left text-xs">
                    <span className="font-bold text-white block">{b.providerId?.name || 'Assigned Pro'}</span>
                    <span className="text-[11px] text-slate-400 block">{b.providerId?.phone}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setChatBooking(b)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1 border border-slate-700"
                  >
                    <MessageSquare size={13} /> Chat
                  </button>

                  <button
                    onClick={() => setReceiptBooking(b)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1 border border-slate-700"
                  >
                    <Receipt size={13} /> Invoice
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {!['paid', 'completed'].includes(b.paymentStatus?.toLowerCase()) && (
                    <button
                      onClick={() => handlePayBooking(b)}
                      disabled={payingBookingId === b._id}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 btn-shimmer disabled:opacity-50"
                    >
                      <CreditCard size={13} />
                      {payingBookingId === b._id ? 'Processing...' : `Pay ₹${b.finalPrice || b.estimatedPrice}`}
                    </button>
                  )}

                  {['SERVICE_COMPLETED', 'CUSTOMER_REVIEWED', 'CLOSED'].includes(b.status) && (
                    <button
                      onClick={() => setReviewBooking(b)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1"
                    >
                      <Star size={13} className="fill-amber-400 text-amber-400" />
                      {b.customerReview ? 'View Review' : 'Rate & Review'}
                    </button>
                  )}

                  {['REQUESTED', 'ACCEPTED', 'PROVIDER_ON_THE_WAY', 'ARRIVED', 'SERVICE_STARTED'].includes(b.status) && (
                    <Link
                      to={`/customer/track/${b._id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold shadow-lg shadow-indigo-600/30 btn-shimmer"
                    >
                      Live Tracking →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RECEIPT MODAL */}
      {receiptBooking && (
        <div className="fixed inset-0 z-[1100] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white flex items-center gap-1.5 font-['Outfit']">
                <Receipt size={16} className="text-indigo-400" /> Service Invoice &amp; Settlement Receipt
              </h3>
              <button onClick={() => setReceiptBooking(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Invoice Number:</span>
                <span className="font-mono font-bold text-white">INV-{receiptBooking.bookingNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Service Category:</span>
                <span className="font-bold text-white">{receiptBooking.serviceId?.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Technician:</span>
                <span className="font-bold text-white">{receiptBooking.providerId?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Gateway:</span>
                <span className="font-bold text-cyan-400 uppercase">{receiptBooking.paymentMethod || 'RAZORPAY'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Status:</span>
                <span className="font-bold text-emerald-400 uppercase">{receiptBooking.paymentStatus}</span>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-xl space-y-1.5 border border-slate-800 mt-2">
                <div className="flex justify-between font-bold text-white text-sm">
                  <span>Total Amount Paid:</span>
                  <span className="text-emerald-400">₹{receiptBooking.finalPrice || receiptBooking.estimatedPrice}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setReceiptBooking(null)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/25 btn-shimmer"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}

      {/* RATE & REVIEW MODAL */}
      {reviewBooking && (
        <div className="fixed inset-0 z-[1100] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-700 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-base text-white font-['Outfit']">Review {reviewBooking.providerId?.name}</h3>
              <button onClick={() => setReviewBooking(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {reviewResult ? (
              <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                  <CheckCircle size={16} className="text-emerald-400" />
                  Review Analyzed &amp; Approved!
                </div>
                <p className="text-slate-300">
                  Sentiment: <strong>{reviewResult.sentimentLabel?.toUpperCase()}</strong> (Polarity score: {reviewResult.sentimentScore})
                </p>
                <p className="text-emerald-400">
                  Reputation impact: <strong>{reviewResult.trustScoreDelta > 0 ? `+${reviewResult.trustScoreDelta}` : reviewResult.trustScoreDelta} pts</strong> on technician's trust score.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="text-center space-y-2">
                  <p className="text-xs text-slate-400">How would you rate the technician's work?</p>
                  <div className="flex justify-center">
                    <StarRating
                      rating={reviewRating}
                      size={28}
                      interactive
                      onRatingChange={setReviewRating}
                    />
                  </div>
                </div>

                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share feedback on technician's speed, courtesy, cleanliness..."
                  className="w-full p-3 text-xs rounded-xl glass-input placeholder:text-slate-500"
                ></textarea>

                <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  🛡️ AI Review Analyzer prevents fake reviews and abusive comments automatically.
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 disabled:opacity-50 btn-shimmer"
                >
                  {submittingReview ? 'Running AI Analyzer...' : 'Submit Verified Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Direct Chat Drawer */}
      {chatBooking && (
        <ChatDrawer
          bookingId={chatBooking._id}
          recipientName={chatBooking.providerId?.name}
          isOpen={!!chatBooking}
          onClose={() => setChatBooking(null)}
        />
      )}
    </div>
  );
}
