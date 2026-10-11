import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function TrustBadge({ size = 'md', showLabel = true }) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 18
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-sm ${sizeClasses[size]} hover:bg-emerald-100 transition-colors cursor-help`}
      title="Verified & Trusted Professional: Government Identity & Background Verified + High Customer Satisfaction Score (>80%)"
    >
      <ShieldCheck size={iconSizes[size]} className="text-emerald-600 fill-emerald-100" />
      {showLabel && <span>Verified &amp; Trusted</span>}
    </span>
  );
}
