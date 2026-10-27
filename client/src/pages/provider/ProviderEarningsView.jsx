import React, { useState, useEffect } from 'react';
import { DollarSign, Wallet, ArrowUpRight, CheckCircle2, Clock, Landmark, Zap, ShieldCheck } from 'lucide-react';
import api from '../../services/api';

export default function ProviderEarningsView() {
  const [earningsData, setEarningsData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [earnRes, profRes] = await Promise.all([
        api.get('/provider/earnings'),
        api.get('/provider/profile')
      ]);

      if (earnRes.data.success) setEarningsData(earnRes.data);
      if (profRes.data.success) setProfile(profRes.data.provider);
    } catch (err) {
      console.warn('Failed to load earnings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-slate-100">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Wallet size={22} />
          </div>
          Earnings &amp; Payouts Ledger
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor your gross service revenue, platform commission (15%), and pending bank account settlements.
        </p>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-6 rounded-3xl border border-white/[0.08] shadow-sm space-y-2">
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">
            Gross Revenue Earned
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
            ₹{earningsData?.totalEarnings || 0}
          </div>
          <span className="text-[11px] text-slate-400 block">
            Across {earningsData?.completedJobs || 0} completed doorstep dispatches
          </span>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)] space-y-2">
          <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Net Available Payout
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">
            ₹{earningsData?.pendingPayout || 0}
          </div>
          <span className="text-[11px] text-emerald-400/90 font-medium block">
            85% Net Take-Home (Direct Bank Transfer)
          </span>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 shadow-sm space-y-2">
          <span className="text-[11px] font-mono font-bold text-indigo-400 uppercase tracking-widest">
            Platform Split (15%)
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold text-indigo-300 font-mono">
            ₹{earningsData?.platformFee || 0}
          </div>
          <span className="text-[11px] text-slate-400 block">
            Covers AI matching, Google Maps GPS, &amp; Razorpay escrow
          </span>
        </div>
      </div>

      {/* Bank Account Verification & Transfer Notice */}
      <div className="glass-card p-6 rounded-3xl border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
            <Landmark size={20} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white font-display">Linked Bank Account for Payouts</h4>
            <p className="text-xs text-slate-400">
              State Bank of India • Account ending in •••• 4910 (Auto-Disbursement Active)
            </p>
          </div>
        </div>
        <span className="px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 self-start sm:self-center">
          <CheckCircle2 size={14} /> Direct NEFT Active
        </span>
      </div>

      {/* Recent Dispatches Breakdown */}
      <div className="glass-panel rounded-3xl p-6 border border-white/[0.08] shadow-sm space-y-4">
        <h3 className="font-bold text-base text-white font-display flex items-center gap-2">
          <Clock size={18} className="text-cyan-400" /> Recent Settled Dispatches
        </h3>

        {!earningsData?.recentJobs || earningsData.recentJobs.length === 0 ? (
          <p className="text-xs text-slate-500 py-8 text-center">
            No completed dispatches settled yet. Accept incoming requests on your dashboard to start earning.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-slate-900/60 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Gross Total</th>
                  <th className="py-3 px-4">Platform Fee (15%)</th>
                  <th className="py-3 px-4 text-right">Net Earned (85%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {earningsData.recentJobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">{job.serviceName || 'On-Demand Service'}</td>
                    <td className="py-3 px-4 text-slate-400">{job.customerName || 'Verified User'}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-200">₹{job.totalAmount}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">₹{job.totalAmount * 0.15}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400 text-right">
                      +₹{job.totalAmount * 0.85}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
