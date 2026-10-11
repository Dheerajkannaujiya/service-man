import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, MapPin, PieChart, Users, ShieldCheck } from 'lucide-react';
import api from '../../services/api';

export default function AdminAnalyticsView() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/analytics');
      if (res.data.success) {
        setAnalytics(res.data.analytics);
      }
    } catch (err) {
      console.warn('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <BarChart3 size={26} className="text-brand-600" /> Executive Analytics &amp; Demographics
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          City coverage, category demand, trust score distributions, and platform volume trends across NCR.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading analytics graphs...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Users & Providers by City */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <MapPin size={18} className="text-brand-600" /> Platform Density by NCR City
            </h3>
            <div className="space-y-3">
              {analytics?.usersByCity?.map((c) => (
                <div key={c._id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{c._id}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-blue-600 font-semibold">{c.customers} Customers</span>
                    <span className="text-emerald-600 font-semibold">{c.providers} Providers</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Bookings by Category */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-600" /> Service Demand &amp; Gross Value
            </h3>
            <div className="space-y-3">
              {analytics?.bookingsByCategory?.map((b) => (
                <div key={b._id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{b._id}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-600">{b.count} Bookings</span>
                    <span className="text-slate-900 font-extrabold">₹{b.revenue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Trust Score Distribution */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <ShieldCheck size={18} className="text-purple-600" /> Provider Trust Score Distribution
            </h3>
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex justify-between text-xs text-emerald-900 font-semibold">
                <span>Tier A: 85% – 100% (Verified &amp; Trusted Badge Eligible)</span>
                <span className="font-black">Top 65%</span>
              </div>
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 flex justify-between text-xs text-blue-900 font-semibold">
                <span>Tier B: 70% – 84% (Good Standing)</span>
                <span className="font-black">25%</span>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex justify-between text-xs text-amber-900 font-semibold">
                <span>Tier C: 50% – 69% (Under Quality Observation)</span>
                <span className="font-black">8%</span>
              </div>
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex justify-between text-xs text-rose-900 font-semibold">
                <span>Tier D: &lt; 50% (Disciplinary / Suspended)</span>
                <span className="font-black">2%</span>
              </div>
            </div>
          </div>

          {/* Card 4: Safety & Disciplinary Metrics */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <PieChart size={18} className="text-rose-600" /> Quality Escalations Summary
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block mb-1">Warnings Issued</span>
                <span className="text-2xl font-black text-amber-600">1</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block mb-1">30-Day Suspensions</span>
                <span className="text-2xl font-black text-orange-600">0</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block mb-1">Permanent Bans</span>
                <span className="text-2xl font-black text-rose-600">0</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
