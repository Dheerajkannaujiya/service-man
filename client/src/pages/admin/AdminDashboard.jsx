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
  Clock
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
    { label: 'Total Customers', value: stats?.totalCustomers || 0, icon: <Users size={20} className="text-blue-600" /> },
    { label: 'Total Providers', value: stats?.totalProviders || 0, icon: <Briefcase size={20} className="text-indigo-600" /> },
    { label: 'Verified Providers', value: stats?.verifiedProviders || 0, icon: <ShieldCheck size={20} className="text-emerald-600" /> },
    { label: 'Pending KYC Review', value: stats?.pendingKyc || 0, icon: <Clock size={20} className="text-amber-600" />, alert: stats?.pendingKyc > 0 },
    { label: 'Active Bookings', value: stats?.activeBookings || 0, icon: <Calendar size={20} className="text-purple-600" /> },
    { label: 'Completed Jobs', value: stats?.completedBookings || 0, icon: <CheckCircle2 size={20} className="text-teal-600" /> },
    { label: 'Platform Revenue', value: `₹${stats?.platformRevenue || 0}`, icon: <DollarSign size={20} className="text-emerald-600" /> },
    { label: 'Open Complaints', value: stats?.openComplaints || 0, icon: <AlertOctagon size={20} className="text-rose-600" />, alert: stats?.openComplaints > 0 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Executive Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <Shield size={20} className="text-brand-400" />
            <span className="text-xs uppercase font-bold text-brand-400 tracking-wider">
              Executive Administration &amp; Control
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">ServiceMan System Control Center</h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Real-time platform telemetry across NCR cities. Oversee KYC verification, complaints resolution, AI review fraud monitoring, and provider penalties.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/kyc-desk"
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <ShieldCheck size={14} /> KYC Verification Desk
          </Link>
          <Link
            to="/admin/analytics"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5"
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
            className={`p-5 rounded-3xl bg-white border shadow-sm space-y-1 ${
              k.alert ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">{k.label}</span>
              <div className="p-2 rounded-xl bg-slate-50">{k.icon}</div>
            </div>
            <div className="text-2xl font-black text-slate-900">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Desk Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/admin/providers"
          className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm hover:border-brand-400 hover:shadow-md transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            <Briefcase size={20} />
          </div>
          <h3 className="font-bold text-sm text-slate-900 group-hover:text-brand-600 transition-colors">
            Provider Management &amp; Bans
          </h3>
          <p className="text-xs text-slate-500">
            Inspect trust scores, issue warnings, 30-day suspensions, and permanent ID blacklists.
          </p>
        </Link>

        <Link
          to="/admin/complaints"
          className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm hover:border-brand-400 hover:shadow-md transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
            <AlertOctagon size={20} />
          </div>
          <h3 className="font-bold text-sm text-slate-900 group-hover:text-brand-600 transition-colors">
            Complaints &amp; Quality Disputes
          </h3>
          <p className="text-xs text-slate-500">
            Resolve verified customer disputes with automated 3-tier penalty workflow escalations.
          </p>
        </Link>

        <Link
          to="/admin/ai-reviews"
          className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm hover:border-brand-400 hover:shadow-md transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
            <Sparkles size={20} />
          </div>
          <h3 className="font-bold text-sm text-slate-900 group-hover:text-brand-600 transition-colors">
            AI Review &amp; Fraud Monitor
          </h3>
          <p className="text-xs text-slate-500">
            Inspect NLP sentiment polarity, spam triggers, repeated review clusters, and abusive alerts.
          </p>
        </Link>
      </div>

      {/* Live System Activity Feed */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Calendar size={18} className="text-brand-600" /> Live In-Progress Bookings
          </h3>
          <Link to="/admin/audit-logs" className="text-xs font-semibold text-brand-600 hover:underline">
            View Audit Logs →
          </Link>
        </div>

        {activeBookings.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No active bookings currently dispatched.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Booking #</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Provider</th>
                  <th className="py-2.5 px-3">Service</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">City</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {activeBookings.map((b) => (
                  <tr key={b._id}>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{b.bookingNumber}</td>
                    <td className="py-3 px-3">{b.customerId?.name}</td>
                    <td className="py-3 px-3 font-semibold">{b.providerId?.name}</td>
                    <td className="py-3 px-3">{b.serviceId?.name}</td>
                    <td className="py-3 px-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="py-3 px-3 text-slate-500">{b.city}</td>
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
