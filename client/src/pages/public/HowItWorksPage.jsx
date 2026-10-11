import React from 'react';
import { MapPin, Cpu, ShieldCheck, Zap, Star, ShieldAlert } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Title */}
      <div className="text-center space-y-3">
        <span className="text-brand-600 font-bold text-xs uppercase tracking-wider">
          Architecture &amp; Quality Workflow
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          How ServiceMan Operates
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          A high-reliability on-demand service ecosystem driven by GPS proximity, AI dispatch ranking, and strict quality control.
        </p>
      </div>

      {/* 5 Pillars */}
      <div className="space-y-12">
        {/* Step 1 */}
        <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-2xl shrink-0">
            <MapPin size={32} />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-bold text-brand-600 uppercase">Phase 1</span>
            <h3 className="text-lg font-bold text-slate-900">GPS Geolocation &amp; Service Request</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When a customer selects a service and reports their issue, their browser GPS coordinates are captured using high-precision HTML5 Geolocation. The system verifies city jurisdiction across Noida, Delhi, Gurugram, Ghaziabad, Faridabad, or Meerut and queries candidates within the provider's configured service radius.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-2xl shrink-0">
            <Cpu size={32} />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-bold text-brand-600 uppercase">Phase 2</span>
            <h3 className="text-lg font-bold text-slate-900">AI Matching Algorithm &amp; Concurrency Lock</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our multi-factor algorithm scores verified online providers:
              <br />
              <code className="bg-slate-100 px-2 py-1 rounded text-slate-800 text-[11px] mt-1 block">
                Match Score = Distance (40%) + Trust Score (25%) + Customer Rating (20%) + Experience (10%) + Response Rate (5%)
              </code>
              When a provider taps Accept, a Redis distributed mutex lock guarantees that no two providers can accept the same job simultaneously.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-2xl shrink-0">
            <Zap size={32} />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-bold text-brand-600 uppercase">Phase 3</span>
            <h3 className="text-lg font-bold text-slate-900">Live GPS Tracking &amp; OTP Verification</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time WebSocket telemetry streams the technician's live coordinates directly onto the customer's interactive Leaflet map. To protect customers against false arrivals or early closures, the professional must verify a unique 4-digit OTP provided by the customer before work can begin.
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-2xl shrink-0">
            <Star size={32} />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-bold text-brand-600 uppercase">Phase 4</span>
            <h3 className="text-lg font-bold text-slate-900">AI / NLP Review Analysis &amp; Reputation Calculation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every written review is evaluated by our integrated NLP sentiment analyzer. The system checks polarity, abusive language, spam patterns, and rating divergence. Trust scores are dynamically calibrated, awarding providers with high ratings the "Verified &amp; Trusted" badge.
            </p>
          </div>
        </div>

        {/* Step 5 */}
        <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-2xl shrink-0">
            <ShieldAlert size={32} />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-bold text-rose-600 uppercase">Phase 5</span>
            <h3 className="text-lg font-bold text-slate-900">Quality Control &amp; 3-Tier Penalty Escalation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Any verified serious violation triggers automated graduated penalties:
              <br />
              • <strong>1st Violation:</strong> Official Warning on record.
              <br />
              • <strong>2nd Violation:</strong> 30-Day Temporary Suspension (account disabled from matching).
              <br />
              • <strong>3rd Violation:</strong> Permanent Ban with identity hash blacklist blocking future registration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
