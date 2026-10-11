import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, MapPin, CheckCircle, XCircle, Zap } from 'lucide-react';
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
    <div className="fixed inset-0 z-[1300] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Top Countdown Bar */}
        <div className="h-2 bg-slate-100 w-full overflow-hidden">
          <div
            className="h-full bg-brand-500 transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              <Zap size={13} className="fill-amber-500 text-amber-500" />
              Incoming Job Dispatch
            </span>
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Clock size={13} /> {secondsLeft}s
            </span>
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-1">
            {incomingRequest.category} – {incomingRequest.subService || 'On-Demand Service'}
          </h3>
          <p className="text-xs text-slate-500 mb-4 line-clamp-2">
            "{incomingRequest.problemDescription}"
          </p>

          {/* Details Card */}
          <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5 text-xs text-slate-700 border border-slate-100 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1">
                <MapPin size={13} className="text-blue-600" /> Location
              </span>
              <span className="font-semibold text-slate-900 text-right truncate max-w-[200px]">
                {incomingRequest.address}, {incomingRequest.city}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Estimated Distance</span>
              <span className="font-bold text-slate-900">{incomingRequest.distanceKm || '4.2'} km</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Estimated Arrival (ETA)</span>
              <span className="font-bold text-slate-900">~{incomingRequest.etaMinutes || '15'} mins</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="text-slate-500">AI Match Score</span>
              <span className="font-bold text-emerald-600 text-sm">
                {incomingRequest.matchScore || '95'}% Match
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2 border border-rose-200">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleReject}
              disabled={accepting}
              className="py-3 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <XCircle size={15} /> Decline
            </button>
            <button
              onClick={handleAccept}
              disabled={accepting}
              className="py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/20 transition-colors disabled:opacity-50"
            >
              <CheckCircle size={15} /> {accepting ? 'Accepting...' : 'Accept Job'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
