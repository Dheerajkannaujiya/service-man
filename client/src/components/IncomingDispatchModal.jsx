import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, MapPin, CheckCircle, XCircle, Zap, Radio, User, DollarSign } from 'lucide-react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';

export default function IncomingDispatchModal({ onAccepted = () => {} }) {
  const { incomingRequest, clearIncomingRequest } = useSocket();
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!incomingRequest) return;
    setSecondsLeft(incomingRequest.expiresInSeconds || 60);

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          clearIncomingRequest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [incomingRequest]);

  if (!incomingRequest) return null;

  const handleAccept = async () => {
    setAccepting(true);
    setError('');
    try {
      const res = await api.post(`/provider/requests/${incomingRequest.serviceRequestId}/accept`);
      if (res.data.success) {
        clearIncomingRequest();
        onAccepted(res.data.booking);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to accept request.');
    } finally {
      setAccepting(false);
    }
  };

  const handleReject = () => {
    clearIncomingRequest();
  };

  const progressPercent = (secondsLeft / (incomingRequest.expiresInSeconds || 60)) * 100;

  return (
    <div className="fixed inset-0 z-[1300] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="glass-panel rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-cyan-500/40 animate-in zoom-in-95 duration-200 relative text-slate-100">
        {/* Top Countdown Bar */}
        <div className="h-1.5 bg-slate-900 w-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-rose-500 transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(0,242,254,0.5)]"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-cyan-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Radio size={24} className="animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                AI Priority Dispatch
              </span>
              <h2 className="text-xl font-extrabold text-white font-display">
                New Customer Nearby!
              </h2>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-extrabold font-mono text-cyan-400 drop-shadow-[0_0_8px_rgba(0,242,254,0.4)]">
              {secondsLeft}s
            </div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Auto-Pass</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Customer & Location Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold">
                  <User size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">
                    {incomingRequest.customerName || 'Customer'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {incomingRequest.customerPhone || 'Contact protected until accepted'}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-[10px] font-bold text-indigo-300">
                {incomingRequest.urgency?.toUpperCase() || 'STANDARD'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <MapPin size={15} className="text-cyan-400 shrink-0" />
                <span className="truncate">{incomingRequest.address || 'Noida Sector 128, NCR'}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/80">
                <span>Distance from you:</span>
                <span className="font-mono font-bold text-cyan-400">
                  {incomingRequest.distanceKm ? `${Number(incomingRequest.distanceKm).toFixed(1)} km` : '1.8 km (5 mins)'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Issue Description</span>
              <p className="text-xs text-slate-300 italic">
                "{incomingRequest.problemDescription || 'Emergency on-site service requested'}"
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleReject}
              disabled={accepting}
              className="py-3 px-4 rounded-xl border border-slate-700 hover:bg-slate-800/80 text-slate-300 text-xs font-bold transition-all"
            >
              Pass (Decline)
            </button>
            <button
              onClick={handleAccept}
              disabled={accepting}
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-700 hover:from-cyan-400 hover:to-indigo-600 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <Zap size={15} />
              {accepting ? 'Accepting...' : 'Accept Job'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
