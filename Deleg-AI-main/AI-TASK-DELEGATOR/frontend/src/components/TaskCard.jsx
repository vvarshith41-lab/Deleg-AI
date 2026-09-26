import React from 'react';

export default function TaskCard({ task, onAssignClick, onFeedbackClick }) {
  const {
    id,
    title,
    description,
    category,
    required_skills = [],
    priority = 'Medium',
    difficulty = 3,
    deadline,
    status = 'Pending',
    assigned_to
  } = task;

  const priorityColors = {
    Low: 'bg-blue-100 text-blue-800',
    Medium: 'bg-slate-100 text-slate-800',
    High: 'bg-amber-100 text-amber-800',
    Critical: 'bg-rose-100 text-rose-800'
  };

  const statusColors = {
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Assigned: 'bg-blue-50 text-blue-700 border-blue-200',
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
            {category || 'General'}
          </span>
          <div className="flex items-center space-x-1.5">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${priorityColors[priority] || priorityColors.Medium}`}>
              {priority}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusColors[status] || statusColors.Pending}`}>
              {status}
            </span>
          </div>
        </div>

        {/* Task Title & Description */}
        <h4 className="font-semibold text-slate-900 text-base mb-1">{title}</h4>
        <p className="text-xs text-slate-600 line-clamp-2 mb-3">{description}</p>

        {/* Required Skills Badges */}
        <div className="mb-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Required Skills
          </div>
          <div className="flex flex-wrap gap-1">
            {required_skills.map((skill, index) => (
              <span
                key={index}
                className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100 font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Meta info & actions */}
      <div className="pt-3 border-t border-slate-100">
        <div className="flex justify-between items-center text-xs text-slate-500 mb-3">
          <span>Difficulty: {'★'.repeat(difficulty)}{'☆'.repeat(Math.max(0, 5 - difficulty))}</span>
          {deadline && <span>Due: {deadline}</span>}
        </div>

        {status === 'Pending' && onAssignClick && (
          <button
            onClick={() => onAssignClick(task)}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
          >
            Find Recommendation
          </button>
        )}

        {status === 'Assigned' && onFeedbackClick && (
          <button
            onClick={() => onFeedbackClick(task)}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
          >
            Complete & Submit Feedback
          </button>
        )}

        {status === 'Completed' && (
          <div className="text-center py-1.5 bg-slate-50 rounded-lg text-xs font-medium text-emerald-700">
            ✓ Finished & Feedback Integrated
          </div>
        )}
      </div>
    </div>
  );
}
