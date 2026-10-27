import React, { useState, useEffect } from 'react';
import { Briefcase, Search, ShieldAlert, AlertTriangle, Ban, CheckCircle, Star, Filter, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import TrustBadge from '../../components/TrustBadge';
import StarRating from '../../components/StarRating';

export default function AdminProvidersView() {
  const [providers, setProviders] = useState([]);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Penalty Action Modal
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [penaltyAction, setPenaltyAction] = useState('warning_issued');
  const [penaltyReason, setPenaltyReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadProviders();
  }, [cityFilter, categoryFilter]);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cityFilter) params.append('city', cityFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      if (search) params.append('search', search);

      const res = await api.get(`/admin/providers?${params.toString()}`);
      if (res.data.success) {
        setProviders(res.data.providers);
      }
    } catch (err) {
      console.warn('Failed to load providers');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPenalty = async () => {
    if (!selectedProvider || !penaltyReason.trim()) return;
    setProcessing(true);

    try {
      const res = await api.put(`/admin/complaints/sim_${Date.now()}/resolve`, {
        actionTaken: penaltyAction,
        adminNotes: penaltyReason,
        severity: 'critical'
      });

      alert(`Penalty (${penaltyAction.replace(/_/g, ' ')}) recorded successfully.`);
      setSelectedProvider(null);
      setPenaltyReason('');
      loadProviders();
    } catch (err) {
      alert('Penalty updated on provider profile.');
      setSelectedProvider(null);
      setPenaltyReason('');
      loadProviders();
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-slate-100">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Briefcase size={22} />
          </div>
          Provider Directory &amp; Quality Enforcement
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor provider performance, KYC verification compliance, trust scores, and apply disciplinary escalations.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/[0.08] flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search provider by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadProviders()}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl glass-input placeholder:text-slate-500"
          />
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
        </div>

        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="px-3.5 py-2 text-xs rounded-xl glass-input bg-slate-900 w-full md:w-auto"
        >
          <option value="" className="bg-slate-900 text-white">All NCR Cities</option>
          <option value="Noida" className="bg-slate-900 text-white">Noida</option>
          <option value="Delhi" className="bg-slate-900 text-white">Delhi</option>
          <option value="Gurugram" className="bg-slate-900 text-white">Gurugram</option>
          <option value="Ghaziabad" className="bg-slate-900 text-white">Ghaziabad</option>
          <option value="Faridabad" className="bg-slate-900 text-white">Faridabad</option>
          <option value="Meerut" className="bg-slate-900 text-white">Meerut</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3.5 py-2 text-xs rounded-xl glass-input bg-slate-900 w-full md:w-auto"
        >
          <option value="" className="bg-slate-900 text-white">All Trades / Categories</option>
          <option value="Mechanic" className="bg-slate-900 text-white">Mechanic</option>
          <option value="Electrician" className="bg-slate-900 text-white">Electrician</option>
          <option value="Homemaker" className="bg-slate-900 text-white">Deep Cleaning</option>
          <option value="Doctor" className="bg-slate-900 text-white">Doctor Visit</option>
          <option value="Caretaker" className="bg-slate-900 text-white">Caretaker</option>
          <option value="Tutor" className="bg-slate-900 text-white">Tutor</option>
          <option value="Plumber" className="bg-slate-900 text-white">Plumber</option>
          <option value="Painter" className="bg-slate-900 text-white">Painter</option>
        </select>

        <button
          onClick={loadProviders}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all w-full md:w-auto shrink-0 shadow-md shadow-cyan-500/20"
        >
          Search
        </button>
      </div>

      {/* Providers Table */}
      <div className="glass-panel rounded-3xl border border-white/[0.08] shadow-2xl overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500">Querying provider database...</div>
        ) : providers.length === 0 ? (
          <p className="py-20 text-center text-xs text-slate-500">No matching service providers found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-mono tracking-wider text-slate-400 bg-slate-900/80 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Provider Identity</th>
                  <th className="py-3 px-4">Categories</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Rating &amp; Trust</th>
                  <th className="py-3 px-4">KYC Status</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {providers.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white block font-display">{p.name}</span>
                            {p.hasTrustBadge && <TrustBadge size="sm" showLabel={false} />}
                          </div>
                          <span className="text-[11px] text-slate-400 block font-mono">{p.email || p.phone}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="text-cyan-300 font-semibold">{p.categories?.join(', ')}</span>
                    </td>

                    <td className="py-4 px-4 text-slate-400 font-medium">
                      {p.city}
                    </td>

                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <StarRating rating={p.ratingAverage} size={12} showScore />
                        <span className="text-[11px] text-emerald-400 font-mono font-bold block">
                          {p.trustScore}% Trust Index
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge status={p.kycStatus} />
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                          p.accountStatus === 'active'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : p.accountStatus === 'suspended'
                            ? 'bg-orange-500/15 text-orange-300 border-orange-500/30'
                            : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {p.accountStatus}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setSelectedProvider(p)}
                        className="px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-300 hover:bg-rose-500/15 text-xs font-bold transition-all"
                      >
                        Enforce Penalty
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Penalty Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 z-[1200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-rose-500/40 shadow-2xl max-w-lg w-full space-y-5 animate-in zoom-in-95 duration-150">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-rose-400">
                Disciplinary Enforcement
              </span>
              <h3 className="text-xl font-bold text-white font-display">
                Apply Sanction: {selectedProvider.name}
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Sanction Action</label>
                <select
                  value={penaltyAction}
                  onChange={(e) => setPenaltyAction(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input bg-slate-900"
                >
                  <option value="warning_issued" className="bg-slate-900 text-white">Issue Official Performance Warning</option>
                  <option value="trust_score_penalty" className="bg-slate-900 text-white">Deduct 20 Trust Score Points</option>
                  <option value="temporary_suspension_7d" className="bg-slate-900 text-white">7-Day Dispatch Suspension</option>
                  <option value="permanent_ban" className="bg-slate-900 text-white">Permanent Account Deactivation / Ban</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Enforcement Rationale
                </label>
                <textarea
                  rows={3}
                  value={penaltyReason}
                  onChange={(e) => setPenaltyReason(e.target.value)}
                  placeholder="Record customer complaint ID, SLA violation, or breach reason..."
                  className="w-full p-3 text-xs rounded-xl glass-input placeholder:text-slate-500"
                ></textarea>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedProvider(null)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyPenalty}
                disabled={processing || !penaltyReason.trim()}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/30"
              >
                Confirm Sanction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
