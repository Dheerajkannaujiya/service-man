import React, { useState, useEffect } from 'react';
import { AlertOctagon, CheckCircle2, ShieldAlert, Clock, User, Filter, RefreshCw } from 'lucide-react';
import api from '../../services/api';

export default function AdminComplaintsView() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [actionTaken, setActionTaken] = useState('warning_issued');
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/complaints');
      if (res.data.success) {
        setComplaints(res.data.complaints);
      }
    } catch (err) {
      console.warn('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedComplaint) return;
    setProcessing(true);

    try {
      const res = await api.put(`/admin/complaints/${selectedComplaint._id}/resolve`, {
        actionTaken,
        adminNotes,
        severity: selectedComplaint.severity
      });

      if (res.data.success) {
        alert(`Complaint resolved with action: ${actionTaken.replace(/_/g, ' ')}`);
        setSelectedComplaint(null);
        setAdminNotes('');
        loadComplaints();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Resolution failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert size={22} />
            </div>
            Customer Complaints &amp; Escalation Desk
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review service incidents, enforce SLAs, issue warnings, apply trust score penalties, or issue suspensions.
          </p>
        </div>

        <button
          onClick={loadComplaints}
          className="px-4 py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 self-start sm:self-auto transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh List
        </button>
      </div>

      {/* Complaints Feed Table */}
      <div className="glass-panel rounded-3xl border border-white/[0.08] shadow-2xl overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500">Checking escalation logs...</div>
        ) : complaints.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-400 space-y-2">
            <CheckCircle2 size={36} className="mx-auto text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
            <p className="font-bold text-white font-display text-base">Zero Unresolved Complaints!</p>
            <p className="text-slate-400 text-xs">All incidents across NCR have been investigated and closed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-mono tracking-wider text-slate-400 bg-slate-900/80 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Complainant</th>
                  <th className="py-3 px-4">Reported Provider</th>
                  <th className="py-3 px-4">Category &amp; Issue</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {complaints.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-bold text-white block font-display">{c.customerId?.name || 'Customer'}</span>
                      <span className="text-[11px] text-slate-400 block font-mono">{c.customerId?.phone || 'Contact on file'}</span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-bold text-cyan-300 block font-display">{c.providerId?.name || 'Assigned Provider'}</span>
                      <span className="text-[11px] text-slate-400 block font-mono">{c.providerId?.phone || 'NCR Area'}</span>
                    </td>

                    <td className="py-4 px-4 max-w-xs">
                      <span className="font-semibold text-white block">{c.reason}</span>
                      <span className="text-[11px] text-slate-400 line-clamp-1 italic">"{c.details}"</span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                          c.severity === 'critical'
                            ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                            : c.severity === 'high'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                        }`}
                      >
                        {c.severity}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                          c.status === 'resolved'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      {c.status === 'open' || c.status === 'investigating' ? (
                        <button
                          onClick={() => setSelectedComplaint(c)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 transition-all"
                        >
                          Resolve &amp; Penalize
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono">Case Closed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resolution & Penalty Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-[1200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/40 shadow-2xl max-w-lg w-full space-y-5 animate-in zoom-in-95 duration-150">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-cyan-400">
                Disciplinary Resolution
              </span>
              <h3 className="text-xl font-bold text-white font-display">
                Resolve Complaint #{selectedComplaint._id.slice(-6)}
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1 text-xs">
              <p className="text-slate-300">
                <strong className="text-white">Customer:</strong> {selectedComplaint.customerId?.name}
              </p>
              <p className="text-slate-300">
                <strong className="text-white">Provider:</strong> {selectedComplaint.providerId?.name}
              </p>
              <p className="text-slate-400 italic pt-1">"{selectedComplaint.details}"</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Enforcement Action
                </label>
                <select
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input bg-slate-900"
                >
                  <option value="warning_issued" className="bg-slate-900 text-white">Issue Official Written Warning</option>
                  <option value="trust_score_penalty" className="bg-slate-900 text-white">Deduct 15 Trust Score Points</option>
                  <option value="temporary_suspension_7d" className="bg-slate-900 text-white">7-Day Temporary Account Suspension</option>
                  <option value="permanent_ban" className="bg-slate-900 text-white">Permanent Platform Deactivation / Ban</option>
                  <option value="dismissed_false_claim" className="bg-slate-900 text-white">Dismiss as Inaccurate / False Claim</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Administrative Finding / Action Notes
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="State the rationale for the penalty or dismissal..."
                  className="w-full p-3 text-xs rounded-xl glass-input placeholder:text-slate-500"
                ></textarea>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={processing}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
              >
                Execute Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
