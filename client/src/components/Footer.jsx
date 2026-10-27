import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ShieldCheck, Heart, Phone, Mail, MapPin, CreditCard, Navigation } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#070A11] text-slate-400 pt-16 pb-10 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          {/* Col 1: Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-600/30">
                <Wrench size={19} />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight font-['Outfit']">
                Service<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Man</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Your autonomous on-demand service ecosystem connecting households and commercial businesses with background-verified trade professionals across NCR. Powered by AI radar matching, live GPS telemetry, and Razorpay secure escrow.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                <ShieldCheck size={14} /> 100% KYC Verified
              </div>
              <div className="flex items-center gap-1.5 text-cyan-400 font-semibold bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-xl">
                <CreditCard size={14} /> Razorpay Test &amp; Live
              </div>
              <div className="flex items-center gap-1.5 text-indigo-400 font-semibold bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-xl">
                <Navigation size={14} /> Google Maps &amp; GPS
              </div>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Core Trades</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/services?category=Mechanic" className="hover:text-indigo-400 transition-colors">Auto Breakdown &amp; Mechanic</Link></li>
              <li><Link to="/services?category=Electrician" className="hover:text-indigo-400 transition-colors">Certified Electrician</Link></li>
              <li><Link to="/services?category=Homemaker" className="hover:text-indigo-400 transition-colors">Deep Cleaning &amp; Housekeeping</Link></li>
              <li><Link to="/services?category=Plumber" className="hover:text-indigo-400 transition-colors">Plumbing &amp; Leak Sealing</Link></li>
              <li><Link to="/services?category=Doctor" className="hover:text-indigo-400 transition-colors">Doctor Doorstep Consultation</Link></li>
              <li><Link to="/services?category=Painter" className="hover:text-indigo-400 transition-colors">Waterproofing &amp; Paint</Link></li>
            </ul>
          </div>

          {/* Col 3: NCR Coverage */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Service Cities</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><span className="hover:text-slate-200 cursor-default">Noida (Sector 18 to 150)</span></li>
              <li><span className="hover:text-slate-200 cursor-default">Delhi (Central, South &amp; East)</span></li>
              <li><span className="hover:text-slate-200 cursor-default">Gurugram (Cyber City &amp; Golf Course)</span></li>
              <li><span className="hover:text-slate-200 cursor-default">Ghaziabad (Indirapuram &amp; Vaishali)</span></li>
              <li><span className="hover:text-slate-200 cursor-default">Faridabad &amp; Greater Noida</span></li>
              <li><span className="hover:text-slate-200 cursor-default">Meerut &amp; NCR Outer</span></li>
            </ul>
          </div>

          {/* Col 4: Platform & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Ecosystem</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/about" className="hover:text-indigo-400 transition-colors">About ServiceMan</Link></li>
              <li><Link to="/how-it-works" className="hover:text-indigo-400 transition-colors">AI Telemetry &amp; Matching</Link></li>
              <li><Link to="/register?role=provider" className="hover:text-indigo-400 transition-colors">Become a Partner</Link></li>
              <li><span className="text-slate-500">Quality Escalation Policy</span></li>
              <li><span className="text-slate-500">Zero-Tolerance Blacklist</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ServiceMan Technologies. All rights reserved.</p>
          <div className="flex items-center gap-1">
            Engineered with <Heart size={13} className="text-indigo-400 fill-indigo-400 mx-1" /> for High-Performance On-Demand Services
          </div>
        </div>
      </div>
    </footer>
  );
}
