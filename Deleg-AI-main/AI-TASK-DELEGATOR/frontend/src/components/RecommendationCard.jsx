import React from 'react';

export default function RecommendationCard({ recommendation, onAssign, isAssigning = false }) {
  if (!recommendation) {
    return null;
  }

  const { employee, score = 0, reasons = [], employee_id } = recommendation;

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 shadow-md">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-emerald-100 pb-5">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-emerald-700 bg-emerald-100/60 px-2.5 py-1 rounded-full">
            Top Recommendation
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-2">{employee}</h2>
          <p className="text-xs text-slate-500 mt-0.5">Calculated using 60% Skills + 25% Past Performance + 15% Availability</p>
        </div>

        {/* Circular Match Gauge */}
        <div className="flex items-center space-x-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-emerald-100">
          <div className="text-center">
            <div className="text-3xl font-extrabold text-emerald-600">{score}%</div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Match Score</div>
          </div>
        </div>
      </div>

      {/* Explainable Reasons */}
      <div className="mt-5">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
          Match Explanation & Factors
        </h4>
        <div className="space-y-2">
          {reasons.map((reason, idx) => (
            <div key={idx} className="flex items-start space-x-2 text-sm text-slate-800">
              <span className="text-emerald-600 font-bold mt-0.5">✓</span>
              <span>{reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Assign Button */}
      <div className="mt-6">
        <button
          onClick={() => onAssign && onAssign(employee_id || 1)}
          disabled={isAssigning}
          className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <span>{isAssigning ? 'Assigning Task...' : `Assign Task to ${employee}`}</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
