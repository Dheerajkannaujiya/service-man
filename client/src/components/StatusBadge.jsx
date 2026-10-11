import React from 'react';

export default function StatusBadge({ status }) {
  const configs = {
    // Booking statuses
    REQUESTED: { label: 'Requested', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    MATCHING: { label: 'Matching AI', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    PROVIDER_NOTIFIED: { label: 'Notified', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    ACCEPTED: { label: 'Confirmed', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
    PROVIDER_ON_THE_WAY: { label: 'On The Way', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    ARRIVED: { label: 'Arrived', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
    SERVICE_STARTED: { label: 'In Progress', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    SERVICE_COMPLETED: { label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    CUSTOMER_REVIEWED: { label: 'Reviewed', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300' },
    CLOSED: { label: 'Closed', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
    CANCELLED_BY_CUSTOMER: { label: 'Cancelled by User', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    CANCELLED_BY_PROVIDER: { label: 'Cancelled by Pro', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    REJECTED: { label: 'Rejected', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    EXPIRED: { label: 'Expired', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' },

    // KYC statuses
    verified: { label: 'Verified', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    pending: { label: 'Pending Review', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    rejected: { label: 'Rejected', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    suspended: { label: 'Suspended', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    banned: { label: 'Permanently Banned', bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-300' }
  };

  const config = configs[status] || {
    label: status ? String(status).replace(/_/g, ' ') : 'Unknown',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-75"></span>
      {config.label}
    </span>
  );
}
