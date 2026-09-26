import React from 'react';

/**
 * Reusable EmptyState component to display when lists, searches, or metrics are empty.
 */
export default function EmptyState({
  title = 'No items found',
  description = 'There are currently no records to display.',
  icon = '📋',
  actionLabel,
  onAction,
  className = ''
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-dashed border-slate-300 p-8 sm:p-12 text-center max-w-lg mx-auto ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl mx-auto mb-4 select-none">
        {icon}
      </div>
      <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1.5">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
