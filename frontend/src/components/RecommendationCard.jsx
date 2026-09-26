import React from 'react';
import StatusBadge from './StatusBadge';

export default function RecommendationCard({
  recommendation,
  taskTitle,
  onAssign,
  isAssigning = false
}) {
  if (!recommendation) {
    return null;
  }

  const {
    employee = 'Unknown Candidate',
    score = 0,
    reasons = [],
    employee_id,
    available
  } = recommendation;

  // Determine availability status if provided, or from reasons
  const isAvailableExplicit = typeof available === 'boolean'
    ? available
    : reasons.some((r) => r.toLowerCase().includes('available') && !r.toLowerCase().includes('not'));

  return (
    <div className="bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-white border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
      {/* Top Match Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full border border-emerald-200">
              Top Match Candidate
            </span>
            <span className="text-xs text-slate-400">•</span>
            <StatusBadge
              type={isAvailableExplicit ? 'Available' : 'Busy'}
              size="sm"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {employee}
          </h2>
          <p className="text-xs text-slate-500">
            Weighted algorithm: 60% Required Skills + 25% Past Performance + 15% Availability
          </p>
        </div>

        {/* Circular Match Gauge */}
        <div className="flex items-center space-x-3 bg-white px-5 py-3 rounded-2xl shadow-xs border border-emerald-200 shrink-0 self-start sm:self-auto">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">
              {score}%
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Calculated Match
            </div>
          </div>
        </div>
      </div>

      {/* Match Explanation & Factors (Only existing reasons) */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <span>🎯</span>
          <span>Match Explanations & Scoring Factors</span>
        </h4>

        {reasons && reasons.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {reasons.map((reason, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-2 text-xs text-slate-800 bg-white/90 p-3 rounded-xl border border-emerald-100/80 shadow-2xs"
              >
                <span className="text-emerald-600 font-extrabold mt-0.5 shrink-0">✓</span>
                <span className="leading-relaxed">{reason}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic bg-white/60 p-3 rounded-xl border border-slate-200">
            No recommendation explanation was provided.
          </p>
        )}
      </div>

      {/* Assignment Confirmation Preview */}
      {taskTitle && (
        <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              Pending Delegation
            </span>
            <div className="text-slate-800">
              Assign <strong>"{taskTitle}"</strong> to <strong>{employee}</strong>
            </div>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0 self-start sm:self-auto">
            Ready for Assignment
          </span>
        </div>
      )}

      {/* Assign Action Button */}
      <div>
        <button
          onClick={() => onAssign && onAssign(employee_id || 1, employee)}
          disabled={isAssigning}
          className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 group"
        >
          {isAssigning ? (
            <>
              <span className="animate-spin text-base">🔄</span>
              <span>Delegating Task to {employee}...</span>
            </>
          ) : (
            <>
              <span>Assign Task to {employee}</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
