import React from 'react';
import { ShieldCheck, Users, Target, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-brand-600 font-bold text-xs uppercase tracking-wider">About ServiceMan</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Reinventing Local Services Through Trust &amp; Intelligence
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          Founded to eliminate guesswork in hiring local professionals across NCR. We combine identity verification, GPS dispatch, and machine learning quality controls.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            <Target size={20} />
          </div>
          <h3 className="font-bold text-base text-slate-900">Our Mission</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Deliver dependable, fair-priced home and emergency support in under 20 minutes while empowering skilled mechanics, electricians, cleaners, and caregivers with transparent earnings.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck size={20} />
          </div>
          <h3 className="font-bold text-base text-slate-900">Verified &amp; Trusted Standard</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every technician must pass strict Aadhaar identity verification, address checks, and certification auditing before their first job. Our AI analyzer ensures ratings remain authentic.
          </p>
        </div>
      </div>
    </div>
  );
}
