import React from 'react';

export default function StatusBadge({ status }) {
  const configs = {
    // Booking statuses
    REQUESTED: { label: 'Requested', bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/30', dot: 'bg-amber-400' },
    MATCHING: { label: 'AI Radar Matching', bg: 'bg-cyan-500/10', text: 'text-cyan-300', border: 'border-cyan-500/30', dot: 'bg-cyan-400 animate-pulse' },
    PROVIDER_NOTIFIED: { label: 'Pro Notified', bg: 'bg-indigo-500/10', text: 'text-indigo-300', border: 'border-indigo-500/30', dot: 'bg-indigo-400' },
    ACCEPTED: { label: 'Pro Confirmed', bg: 'bg-teal-500/10', text: 'text-teal-300', border: 'border-teal-500/30', dot: 'bg-teal-400' },
    PROVIDER_ON_THE_WAY: { label: 'Dispatched En Route', bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-500/40', dot: 'bg-purple-400 animate-pulse' },
    ARRIVED: { label: 'Arrived at Site', bg: 'bg-cyan-500/15', text: 'text-cyan-300', border: 'border-cyan-400/40', dot: 'bg-cyan-400' },
    SERVICE_STARTED: { label: 'In Progress (OTP Verified)', bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-400/40', dot: 'bg-blue-400 animate-pulse' },
    SERVICE_COMPLETED: { label: 'Work Completed', bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-400/40', dot: 'bg-emerald-400' },
    CUSTOMER_REVIEWED: { label: 'Reviewed & Settled', bg: 'bg-emerald-500/20', text: 'text-emerald-200', border: 'border-emerald-400/50', dot: 'bg-emerald-300' },
    CLOSED: { label: 'Archived', bg: 'bg-slate-800/60', text: 'text-slate-400', border: 'border-slate-700/60', dot: 'bg-slate-500' },
    CANCELLED_BY_CUSTOMER: { label: 'Cancelled by User', bg: 'bg-rose-500/10', text: 'text-rose-300', border: 'border-rose-500/30', dot: 'bg-rose-400' },
    CANCELLED_BY_PROVIDER: { label: 'Cancelled by Pro', bg: 'bg-rose-500/10', text: 'text-rose-300', border: 'border-rose-500/30', dot: 'bg-rose-400' },
    REJECTED: { label: 'Declined', bg: 'bg-red-500/10', text: 'text-red-300', border: 'border-red-500/30', dot: 'bg-red-400' },
    EXPIRED: { label: 'Broadcast Timed Out', bg: 'bg-slate-800/50', text: 'text-slate-400', border: 'border-slate-700/50', dot: 'bg-slate-500' },

    // KYC statuses
    verified: { label: 'Verified & Audited', bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
    pending: { label: 'Audit In Queue', bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30', dot: 'bg-amber-400' },
    rejected: { label: 'Document Rejected', bg: 'bg-rose-500/15', text: 'text-rose-300', border: 'border-rose-500/30', dot: 'bg-rose-400' },
    suspended: { label: 'Account Suspended', bg: 'bg-orange-500/15', text: 'text-orange-300', border: 'border-orange-500/30', dot: 'bg-orange-400' },
    banned: { label: 'Permanently Banned', bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/40', dot: 'bg-red-400' }
  };

  const config = configs[status] || {
    label: status ? String(status).replace(/_/g, ' ') : 'Unknown',
    bg: 'bg-slate-800/70',
    text: 'text-slate-300',
    border: 'border-slate-700',
    dot: 'bg-slate-400'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide border backdrop-blur-md transition-all ${config.bg} ${config.text} ${config.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      <span>{config.label}</span>
    </span>
  );
}
