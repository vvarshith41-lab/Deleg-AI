import React from 'react';

/**
 * Reusable StatusBadge component for consistent visual indicators across the UI.
 * Supports task statuses, priority ratings, employee availability, and system states.
 */
export default function StatusBadge({
  type = 'Pending',
  label,
  size = 'md',
  showDot = true,
  className = ''
}) {
  const normalized = String(type).trim().toLowerCase();

  const configs = {
    // Task Statuses
    pending: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
      defaultLabel: 'Pending'
    },
    assigned: {
      bg: 'bg-blue-50 text-blue-800 border-blue-200',
      dot: 'bg-blue-500',
      defaultLabel: 'Assigned'
    },
    completed: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-500',
      defaultLabel: 'Completed'
    },

    // Priorities
    critical: {
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      dot: 'bg-rose-500',
      defaultLabel: 'Critical'
    },
    high: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
      defaultLabel: 'High'
    },
    medium: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      dot: 'bg-slate-400',
      defaultLabel: 'Medium'
    },
    low: {
      bg: 'bg-sky-50 text-sky-700 border-sky-200',
      dot: 'bg-sky-400',
      defaultLabel: 'Low'
    },

    // Employee Availability
    available: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-500',
      defaultLabel: 'Available'
    },
    busy: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
      defaultLabel: 'Busy'
    },

    // Backend / Connection Statuses
    online: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-500 animate-pulse',
      defaultLabel: 'API Online'
    },
    offline: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-400',
      defaultLabel: 'Demo Mode'
    },
    checking: {
      bg: 'bg-slate-100 text-slate-600 border-slate-200',
      dot: 'bg-slate-400 animate-ping',
      defaultLabel: 'Connecting...'
    }
  };

  const config = configs[normalized] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
    defaultLabel: type
  };

  const sizeClasses = size === 'sm'
    ? 'text-[11px] px-2 py-0.5 space-x-1.5'
    : 'text-xs px-2.5 py-1 space-x-1.5';

  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border transition-colors ${config.bg} ${sizeClasses} ${className}`}
    >
      {showDot && (
        <span
          className={`rounded-full shrink-0 ${dotSize} ${config.dot}`}
          aria-hidden="true"
        />
      )}
      <span className="whitespace-nowrap">{label || config.defaultLabel}</span>
    </span>
  );
}
