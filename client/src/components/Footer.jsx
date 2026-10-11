import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ShieldCheck, Heart, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Col 1: Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold">
                <Wrench size={18} />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                Service<span className="text-brand-500">Man</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Your one-stop on-demand service platform connecting households and enterprises with vetted, background-verified professionals across NCR. AI-driven matching and live GPS tracking ensure dependable support every time.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-800/40 px-3 py-2 rounded-xl w-fit">
              <ShieldCheck size={16} /> 100% KYC Verified Service Professionals
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Popular Services</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/services?category=Mechanic" className="hover:text-white transition-colors">Auto Mechanic Support</Link></li>
              <li><Link to="/services?category=Electrician" className="hover:text-white transition-colors">Electrical Repairs</Link></li>
              <li><Link to="/services?category=Homemaker" className="hover:text-white transition-colors">Home Deep Cleaning</Link></li>
              <li><Link to="/services?category=Plumber" className="hover:text-white transition-colors">Plumbing &amp; Leakage</Link></li>
              <li><Link to="/services?category=Doctor" className="hover:text-white transition-colors">Home Health Visit</Link></li>
              <li><Link to="/services?category=Painter" className="hover:text-white transition-colors">Waterproofing &amp; Paint</Link></li>
            </ul>
          </div>

          {/* Col 3: NCR Coverage */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Service Cities</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><span className="hover:text-white cursor-default">Noida (Sec 18 to 150)</span></li>
              <li><span className="hover:text-white cursor-default">Delhi (Central &amp; South)</span></li>
              <li><span className="hover:text-white cursor-default">Gurugram (Cyber City &amp; Golf Course)</span></li>
              <li><span className="hover:text-white cursor-default">Ghaziabad (Indirapuram &amp; Vaishali)</span></li>
              <li><span className="hover:text-white cursor-default">Faridabad &amp; Greater Noida</span></li>
              <li><span className="hover:text-white cursor-default">Meerut &amp; NCR Outer</span></li>
            </ul>
          </div>

          {/* Col 4: Platform & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Company &amp; Trust</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/about" className="hover:text-white transition-colors">About ServiceMan</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">How GPS Matching Works</Link></li>
              <li><Link to="/register?role=provider" className="hover:text-white transition-colors">Join as a Professional</Link></li>
              <li><span className="text-slate-500">Quality &amp; Safety Penalties</span></li>
              <li><span className="text-slate-500">Razorpay Secure Escrow</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ServiceMan Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-1">
            Built with <Heart size={13} className="text-rose-500 fill-rose-500 mx-1" /> for Quality On-Demand Services
          </div>
        </div>
      </div>
    </footer>
  );
}
