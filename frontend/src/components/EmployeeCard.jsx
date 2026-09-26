import React from 'react';

export default function EmployeeCard({ employee, onSelect }) {
  const { name, skills = {}, performance = 80, available = false } = employee;

  // Generate initials for avatar
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-base">
            {initials}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-base">{name}</h3>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                available
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
                  available ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              {available ? 'Available' : 'Busy'}
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-500">Performance</div>
          <div className="text-lg font-bold text-slate-900">{Math.round(performance)}%</div>
        </div>
      </div>

      {/* Skills Proficiency List */}
      <div className="mt-4 space-y-2">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Skills & Proficiencies
        </div>
        <div className="space-y-1.5">
          {Object.entries(skills).map(([skillName, score]) => (
            <div key={skillName}>
              <div className="flex justify-between text-xs text-slate-700 mb-0.5">
                <span>{skillName}</span>
                <span className="font-medium text-slate-900">{score}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {onSelect && (
        <button
          onClick={() => onSelect(employee)}
          className="mt-4 w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors"
        >
          Select Employee
        </button>
      )}
    </div>
  );
}
