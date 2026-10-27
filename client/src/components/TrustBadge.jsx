import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function TrustBadge({ size = 'md', showLabel = true }) {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-xs sm:text-sm px-3.5 py-1.5'
  };

  const iconSizes = {
    sm: 11,
    md: 13,
    lg: 16
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 backdrop-blur-md shadow-[0_0_12px_rgba(16,185,129,0.15)] hover:border-emerald-400/60 hover:bg-emerald-500/15 transition-all cursor-help ${sizeClasses[size]}`}
      title="Verified & Trusted Professional: Government Identity & Background Verified + High Customer Satisfaction Score (>80%)"
    >
      <ShieldCheck size={iconSizes[size]} className="text-emerald-400 shrink-0" />
      {showLabel && <span className="tracking-tight">Verified &amp; Trusted</span>}
    </span>
  );
}
