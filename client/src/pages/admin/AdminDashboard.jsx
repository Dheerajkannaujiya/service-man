import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Users,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  DollarSign,
  AlertOctagon,
  Sparkles,
  BarChart3,
  FileText,
  Clock,
  Radio,
  ExternalLink
} from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [activeBookings, setActiveBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/bookings?status=PROVIDER_ON_THE_WAY')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (bookingsRes.data.success) setActiveBookings(bookingsRes.data.bookings.slice(0, 5));
    } catch (err) {
      console.warn('Failed to load admin dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const kpis = [
    { label: 'Total Customers', value: stats?.totalCustomers || 0, icon: <Users size={18} className="text-cyan-400" /> },
    { label: 'Total Providers', value: stats?.totalProviders || 0, icon: <Briefcase size={18} className="text-indigo-400" /> },
    { label: 'Verified Partners', value: stats?.verifiedProviders || 0, icon: <ShieldCheck size={18} className="text-emerald-400" /> },
    { label: 'Pending KYC Review', value: stats?.pendingKyc || 0, icon: <Clock size={18} className="text-amber-400" />, alert: stats?.pendingKyc > 0 },
    { label: 'Active Dispatches', value: stats?.activeBookings || 0, icon: <Calendar size={18} className="text-purple-400" /> },
    { label: 'Completed Jobs', value: stats?.completedBookings || 0, icon: <CheckCircle2 size={18} className="text-teal-400" /> },
    { label: 'Platform Revenue', value: `₹${stats?.platformRevenue || 0}`, icon: <DollarSign size={18} className="text-emerald-400" /> },
    { label: 'Open Complaints', value: stats?.openComplaints || 0, icon: <AlertOctagon size={18} className="text-rose-400" />, alert: stats?.openComplaints > 0 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-100">
      {/* Executive Header */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
        <div className="space-y-2 text-center md:text-left relative z-10">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <Shield size={18} className="text-indigo-400" />
            <span className="text-xs uppercase font-bold text-indigo-400 tracking-wider">
              Executive HQ &amp; Security Administration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">System Control Center</h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Real-time platform telemetry across NCR cities. Oversee KYC verification, complaints resolution, AI review fraud monitoring, and provider penalties.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 relative z-10">
          <Link
            to="/admin/kyc-desk"
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-1.5 btn-shimmer"
          >
            <ShieldCheck size={14} /> KYC Verification Desk
          </Link>
          <Link
            to="/admin/analytics"
            className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5"
          >
            <BarChart3 size={14} /> Analytics &amp; Reports
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <div
            key={i}
            className={`p-5 rounded-3xl glass-card border space-y-1 ${
              k.alert ? 'border-amber-500/50 ring-2 ring-amber-500/20' : 'border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">{k.label}</span>
              <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60">{k.icon}</div>
            </div>
            <div className="text-2xl font-black text-white">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Desk Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/admin/providers"
          className="p-5 glass-card rounded-3xl border border-slate-800 hover:border-indigo-500/50 transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/20 group-hover:scale-105 transition-transform">
            <Briefcase size={20} />
          </div>
          <h3 className="font-bold text-sm text-white group-hover:text-indigo-400 transition-colors font-['Outfit']">
            Provider Management &amp; Sanctions
          </h3>
          <p className="text-xs text-slate-400">
            Inspect trust scores, issue warnings, 30-day suspensions, and permanent ID blacklists.
          </p>
        </Link>

        <Link
          to="/admin/complaints"
          className="p-5 glass-card rounded-3xl border border-slate-800 hover:border-rose-500/50 transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold border border-rose-500/20 group-hover:scale-105 transition-transform">
            <AlertOctagon size={20} />
          </div>
          <h3 className="font-bold text-sm text-white group-hover:text-rose-400 transition-colors font-['Outfit']">
            Complaints &amp; Quality Disputes
          </h3>
          <p className="text-xs text-slate-400">
            Resolve verified customer disputes with automated 3-tier penalty workflow escalations.
          </p>
        </Link>

        <Link
          to="/admin/ai-reviews"
          className="p-5 glass-card rounded-3xl border border-slate-800 hover:border-purple-500/50 transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold border border-purple-500/20 group-hover:scale-105 transition-transform">
            <Sparkles size={20} />
          </div>
          <h3 className="font-bold text-sm text-white group-hover:text-purple-400 transition-colors font-['Outfit']">
            AI Review &amp; Fraud Monitor
          </h3>
          <p className="text-xs text-slate-400">
            Inspect NLP sentiment polarity, spam triggers, repeated review clusters, and abusive alerts.
          </p>
        </Link>
      </div>

      {/* Live System Activity Feed */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-white flex items-center gap-2 font-['Outfit']">
            <Calendar size={18} className="text-indigo-400" /> Live In-Progress Dispatches
          </h3>
          <Link to="/admin/audit-logs" className="text-xs font-semibold text-indigo-400 hover:underline">
            View Audit Logs →
          </Link>
        </div>

        {activeBookings.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No active bookings currently dispatched.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-900/60 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Booking #</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Provider</th>
                  <th className="py-2.5 px-3">Service</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">City</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {activeBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-white">{b.bookingNumber}</td>
                    <td className="py-3 px-3">{b.customerId?.name}</td>
                    <td className="py-3 px-3 font-semibold text-white">{b.providerId?.name}</td>
                    <td className="py-3 px-3">{b.serviceId?.name}</td>
                    <td className="py-3 px-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="py-3 px-3 text-slate-400">{b.city}</td>
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
