import React, { useState, useEffect } from 'react';
import { DollarSign, Wallet, ArrowUpRight, CheckCircle2, Clock, Landmark } from 'lucide-react';
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <Wallet size={26} className="text-brand-600" /> Earnings &amp; Payouts Ledger
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor your gross earnings, platform commission (15%), and pending bank transfers.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Total Earned</span>
          <div className="text-3xl font-extrabold text-slate-900">
            ₹{earningsData?.totalEarnings || 0}
          </div>
          <span className="text-[11px] text-slate-500">Across {earningsData?.completedJobs || 0} completed services</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Payout</span>
          <div className="text-3xl font-extrabold text-emerald-600">
            ₹{earningsData?.pendingPayout || 0}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">Scheduled for weekly auto-transfer</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Platform Commission</span>
          <div className="text-3xl font-extrabold text-slate-900">15%</div>
          <span className="text-[11px] text-slate-500">85% directly credited to your wallet</span>
        </div>
      </div>

      {/* Linked Bank Details */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Landmark size={18} className="text-brand-600" /> Registered Payout Account (Razorpay Route)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div>
            <span className="text-slate-400 block">Beneficiary Name:</span>
            <span className="font-bold text-slate-800">{profile?.bankDetails?.accountHolderName || profile?.user?.name || 'Vikram Singh'}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Bank &amp; Account Number:</span>
            <span className="font-bold text-slate-800">{profile?.bankDetails?.bankName || 'HDFC Bank'} •••• 7890</span>
          </div>
          <div>
            <span className="text-slate-400 block">UPI ID:</span>
            <span className="font-bold text-slate-800">{profile?.bankDetails?.upiId || 'vikram.singh@okhdfcbank'}</span>
          </div>
        </div>
      </div>

      {/* Recent Payout Transactions Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900">Recent Completed Payouts</h3>

        {!earningsData?.recentPayments || earningsData.recentPayments.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No payment transactions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Transaction ID</th>
                  <th className="py-2.5 px-3">Gross</th>
                  <th className="py-2.5 px-3">Platform Fee (15%)</th>
                  <th className="py-2.5 px-3">Net Credited</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {earningsData.recentPayments.map((p) => (
                  <tr key={p._id}>
                    <td className="py-3 px-3 font-mono">{p.razorpayPaymentId || p._id}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">₹{p.amount}</td>
                    <td className="py-3 px-3 text-slate-400">₹{p.platformFee}</td>
                    <td className="py-3 px-3 font-bold text-emerald-600">₹{p.providerEarnings}</td>
                    <td className="py-3 px-3 text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {p.status.toUpperCase()}
                      </span>
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
