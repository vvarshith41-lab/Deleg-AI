import React from 'react';
import StatusBadge from './StatusBadge';

export default function EmployeeCard({ employee, onSelect }) {
  if (!employee) return null;

  const { name = 'Team Member', skills = {}, performance = 80, available = false } = employee;

  // Generate clean initials for avatar
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'EM';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Header: Avatar, Name, Status, Performance */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 text-base truncate">{name}</h3>
              <div className="mt-1">
                <StatusBadge type={available ? 'Available' : 'Busy'} size="sm" />
              </div>
            </div>
          </div>

          <div className="text-right shrink-0 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Performance</div>
            <div className="text-base font-black text-slate-800">{Math.round(performance)}%</div>
          </div>
        </div>

        {/* Skills Proficiency List */}
        <div className="mt-5 space-y-2.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Verified Skills ({Object.keys(skills).length})
          </div>
          <div className="space-y-2">
            {Object.entries(skills).map(([skillName, score]) => (
              <div key={skillName}>
                <div className="flex justify-between text-xs text-slate-700 mb-1">
                  <span className="font-medium text-slate-700 truncate pr-2">{skillName}</span>
                  <span className="font-bold text-slate-900 shrink-0">{score}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {onSelect && (
        <button
          onClick={() => onSelect(employee)}
          className="mt-5 w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors"
        >
          Select Employee
        </button>
      )}
    </div>
  );
}
