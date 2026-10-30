import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  Smartphone,
  CreditCard,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import api from '../services/api';

/**
 * Razorpay Checkout Gateway Modal
 * Provides interactive QR Code, UPI apps (GPay, PhonePe, Paytm), and Card options.
 */
export default function RazorpayModal({
  isOpen,
  onClose,
  booking,
  orderData,
  user,
  onSuccess
}) {
  const [activeTab, setActiveTab] = useState('qr'); // 'qr' | 'upi' | 'card' | 'netbanking'
  const [upiId, setUpiId] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(600); // 10 min countdown
  const [errorMsg, setErrorMsg] = useState('');

  const amount = Number(booking?.finalPrice || booking?.estimatedPrice || orderData?.amount || 349);
  const bookingNumber = booking?.bookingNumber || (booking?._id ? `#${booking._id.slice(-6)}` : '#SM-2026');
  const dummyVpa = `serviceman.${bookingNumber.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}@razorpay`;

  // Countdown timer for QR code expiry
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(dummyVpa);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Finalize and verify payment via backend
   */
  const handleCompletePayment = async (methodName = 'UPI QR') => {
    setProcessing(true);
    setErrorMsg('');
    try {
      const paymentId = orderData?.paymentId || `pay_rzp_${Date.now()}`;
      const razorpayOrderId = orderData?.razorpayOrderId || `order_${Date.now()}`;
      const razorpayPaymentId = `pay_${methodName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;

      const verifyRes = await api.post('/payments/verify', {
        paymentId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature: 'simulated_valid_signature'
      });

      if (verifyRes.data?.success) {
        if (onSuccess) {
          onSuccess(verifyRes.data);
        }
        onClose();
      } else {
        throw new Error(verifyRes.data?.message || 'Payment verification failed');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Payment failed. Please retry.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#0c1222] border border-slate-700/80 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        {/* Gateway Header */}
        <div className="bg-gradient-to-r from-[#0a1733] via-[#0f234f] to-[#0a1733] px-5 py-4 border-b border-slate-800 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-blue-500/20">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base font-['Outfit'] tracking-tight">Razorpay</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
                  Test Gateway
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                ServiceMan Escrow Checkout • <span className="font-mono text-cyan-400">{bookingNumber}</span>
              </p>
            </div>
          </div>

          <div className="text-right pr-6">
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Amount to Pay</span>
            <span className="text-xl font-black text-emerald-400 font-mono">₹{amount}</span>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Payment Tabs Navigation */}
        <div className="grid grid-cols-3 bg-slate-900/90 border-b border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('qr')}
            className={`py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'qr'
                ? 'border-indigo-500 text-white bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode size={15} className="text-cyan-400" />
            <span>Scan QR Code</span>
          </button>

          <button
            onClick={() => setActiveTab('upi')}
            className={`py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'upi'
                ? 'border-indigo-500 text-white bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone size={15} className="text-emerald-400" />
            <span>UPI Apps / ID</span>
          </button>

          <button
            onClick={() => setActiveTab('card')}
            className={`py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'card'
                ? 'border-indigo-500 text-white bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard size={15} className="text-amber-400" />
            <span>Card / Bank</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: SCAN QR CODE */}
          {activeTab === 'qr' && (
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Clock size={13} className="text-amber-400" />
                <span>QR valid for: <span className="font-mono text-amber-300 font-bold">{formattedTime}</span></span>
              </div>

              {/* Dynamic Simulated High-Res UPI QR Code */}
              <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-indigo-500/40 relative group">
                <svg
                  className="w-48 h-48 sm:w-52 sm:h-52"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Outer QR Frame */}
                  <rect width="100" height="100" fill="white" />
                  {/* Corner Position Markers */}
                  <rect x="5" y="5" width="26" height="26" fill="black" />
                  <rect x="9" y="9" width="18" height="18" fill="white" />
                  <rect x="13" y="13" width="10" height="10" fill="black" />

                  <rect x="69" y="5" width="26" height="26" fill="black" />
                  <rect x="73" y="9" width="18" height="18" fill="white" />
                  <rect x="77" y="13" width="10" height="10" fill="black" />

                  <rect x="5" y="69" width="26" height="26" fill="black" />
                  <rect x="9" y="73" width="18" height="18" fill="white" />
                  <rect x="13" y="77" width="10" height="10" fill="black" />

                  {/* QR Data Pattern Matrix */}
                  <rect x="36" y="8" width="5" height="5" fill="black" />
                  <rect x="46" y="8" width="8" height="5" fill="black" />
                  <rect x="58" y="8" width="6" height="5" fill="black" />
                  <rect x="36" y="18" width="12" height="5" fill="black" />
                  <rect x="52" y="18" width="10" height="5" fill="black" />

                  <rect x="8" y="36" width="5" height="10" fill="black" />
                  <rect x="18" y="36" width="6" height="5" fill="black" />
                  <rect x="28" y="36" width="14" height="6" fill="black" />
                  <rect x="46" y="36" width="8" height="8" fill="black" />
                  <rect x="60" y="36" width="12" height="5" fill="black" />
                  <rect x="78" y="36" width="14" height="6" fill="black" />

                  <rect x="8" y="50" width="8" height="5" fill="black" />
                  <rect x="22" y="48" width="8" height="8" fill="black" />
                  <rect x="36" y="50" width="8" height="6" fill="black" />
                  <rect x="50" y="48" width="14" height="8" fill="black" />
                  <rect x="70" y="50" width="8" height="5" fill="black" />
                  <rect x="84" y="48" width="8" height="8" fill="black" />

                  <rect x="36" y="66" width="6" height="10" fill="black" />
                  <rect x="46" y="68" width="12" height="6" fill="black" />
                  <rect x="62" y="66" width="10" height="8" fill="black" />

                  <rect x="36" y="82" width="14" height="8" fill="black" />
                  <rect x="56" y="80" width="8" height="12" fill="black" />
                  <rect x="70" y="82" width="12" height="8" fill="black" />
                  <rect x="86" y="82" width="6" height="10" fill="black" />

                  {/* Center Razorpay Badge */}
                  <rect x="40" y="40" width="20" height="20" rx="4" fill="#0C2340" />
                  <text x="50" y="53" fill="white" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                    ₹
                  </text>
                </svg>
              </div>

              {/* UPI Logos supported */}
              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
                <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-slate-300 font-bold">
                  GPay
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-indigo-400 font-bold">
                  PhonePe
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-cyan-400 font-bold">
                  Paytm
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-orange-400 font-bold">
                  BHIM
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-emerald-400 font-bold">
                  Cred
                </span>
              </div>

              <div className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs">
                <div className="text-left truncate max-w-[260px]">
                  <span className="text-[10px] text-slate-400 block font-medium">UPI VPA</span>
                  <span className="font-mono text-cyan-300 font-semibold">{dummyVpa}</span>
                </div>
                <button
                  onClick={handleCopyVpa}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-colors"
                >
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <button
                onClick={() => handleCompletePayment('UPI QR Scan')}
                disabled={processing}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all btn-shimmer disabled:opacity-50"
              >
                <CheckCircle2 size={16} />
                <span>{processing ? 'Verifying with Bank...' : `I have Scanned & Paid ₹${amount}`}</span>
              </button>
            </div>
          )}

          {/* TAB 2: UPI APPS & ID */}
          {activeTab === 'upi' && (
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-2">Select Preferred UPI App</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'gpay', name: 'Google Pay', handle: '@okhdfcbank', color: 'text-blue-400' },
                    { id: 'phonepe', name: 'PhonePe', handle: '@ybl', color: 'text-purple-400' },
                    { id: 'paytm', name: 'Paytm UPI', handle: '@paytm', color: 'text-cyan-400' },
                    { id: 'bhim', name: 'BHIM UPI', handle: '@upi', color: 'text-amber-400' }
                  ].map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => {
                        setSelectedUpiApp(app.id);
                        setUpiId(`${user?.phone || '9876543210'}${app.handle}`);
                      }}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        selectedUpiApp === app.id
                          ? 'border-indigo-500 bg-indigo-500/10 text-white'
                          : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <span className={`font-bold block ${app.color}`}>{app.name}</span>
                        <span className="text-[10px] text-slate-400">{app.handle}</span>
                      </div>
                      <ArrowRight size={13} className="text-slate-500" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Or Enter Any Virtual Payment Address (VPA)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. yourname@okhdfcbank"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <button
                    onClick={() => setUpiId(`${user?.phone || '9876543210'}@paytm`)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-bold border border-slate-700"
                  >
                    Auto Fill
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-[11px] text-slate-400 space-y-1">
                <p className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <ShieldCheck size={14} className="text-emerald-400" /> Escrow Payment Protection
                </p>
                <p>A payment collect notification of ₹{amount} will be dispatched to your UPI app for authorization.</p>
              </div>

              <button
                onClick={() => handleCompletePayment(`UPI (${upiId || selectedUpiApp})`)}
                disabled={processing}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all btn-shimmer disabled:opacity-50"
              >
                <span>{processing ? 'Requesting UPI Authorization...' : `Pay ₹${amount} with UPI`}</span>
              </button>
            </div>
          )}

          {/* TAB 3: CARD & NETBANKING */}
          {activeTab === 'card' && (
            <div className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Card Number (Sandbox Test Card)</label>
                <input
                  type="text"
                  readOnly
                  value="4111 •••• •••• 1111 (Visa Sandbox)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Valid Thru</label>
                  <input
                    type="text"
                    readOnly
                    value="12 / 28"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">CVV</label>
                  <input
                    type="password"
                    readOnly
                    value="123"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Cardholder Name</label>
                <input
                  type="text"
                  readOnly
                  value={user?.name || 'Rahul Sharma'}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 font-semibold"
                />
              </div>

              <button
                onClick={() => handleCompletePayment('Card')}
                disabled={processing}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all btn-shimmer disabled:opacity-50"
              >
                <span>{processing ? 'Processing Card Payment...' : `Pay ₹${amount} with Card`}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="bg-slate-900/90 px-5 py-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>256-Bit SSL Encrypted Escrow</span>
          </div>
          <span className="font-semibold text-slate-300">Razorpay Secured</span>
        </div>
      </div>
    </div>
  );
}
