import React from 'react';
import StatusBadge from './StatusBadge';

export default function TaskCard({
  task,
  onAssignClick,
  onFeedbackClick,
  assignedEmployeeName
}) {
  if (!task) return null;

  const {
    id,
    title = 'Untitled Task',
    description = '',
    category = 'General',
    required_skills = [],
    priority = 'Medium',
    difficulty = 3,
    deadline,
    status = 'Pending',
    assigned_to
  } = task;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top Badges & Meta */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 tracking-wide uppercase">
            {category}
          </span>
          <div className="flex items-center space-x-1.5 shrink-0">
            <StatusBadge type={priority} size="sm" showDot={true} />
            <StatusBadge type={status} size="sm" showDot={true} />
          </div>
        </div>

        {/* Task Title & Description */}
        <h4 className="font-bold text-slate-900 text-base mb-1.5 group-hover:text-emerald-700 transition-colors line-clamp-1">
          {title}
        </h4>
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {description || 'No additional description provided.'}
        </p>

        {/* Assignee Information (if assigned) */}
        {(assignedEmployeeName || assigned_to) && (
          <div className="mb-3 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Assignee:</span>
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">
                👤
              </span>
              <span>{assignedEmployeeName || `Employee #${assigned_to}`}</span>
            </span>
          </div>
        )}

        {/* Required Skills Chips */}
        {required_skills && required_skills.length > 0 && (
          <div className="mb-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Required Skills
            </div>
            <div className="flex flex-wrap gap-1">
              {required_skills.map((skill, index) => (
                <span
                  key={index}
                  className="text-[11px] px-2 py-0.5 bg-emerald-50/80 text-emerald-800 rounded-md border border-emerald-100 font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Meta info & actions */}
      <div className="pt-3 border-t border-slate-100 mt-2">
        <div className="flex justify-between items-center text-xs text-slate-500 mb-3.5">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-slate-400">Difficulty:</span>
            <div className="flex items-center text-amber-400 text-xs tracking-tighter" title={`Difficulty: ${difficulty}/5`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < difficulty ? 'text-amber-500' : 'text-slate-200'}>
                  ★
                </span>
              ))}
            </div>
            <span className="text-[10px] text-slate-400">({difficulty}/5)</span>
          </div>

          {deadline && (
            <span className="text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              Due: {deadline}
            </span>
          )}
        </div>

        {/* Contextual Action Button */}
        {status === 'Pending' && onAssignClick && (
          <button
            onClick={() => onAssignClick(task)}
            className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs shadow-emerald-600/20 flex items-center justify-center gap-1.5 group/btn"
          >
            <span>Find Recommendation</span>
            <span className="group-hover/btn:translate-x-0.5 transition-transform">→</span>
          </button>
        )}

        {status === 'Assigned' && onFeedbackClick && (
          <button
            onClick={() => onFeedbackClick(task)}
            className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs shadow-blue-600/20 flex items-center justify-center gap-1.5 group/btn"
          >
            <span>Complete & Submit Feedback</span>
            <span className="group-hover/btn:translate-x-0.5 transition-transform">✓</span>
          </button>
        )}

        {status === 'Completed' && (
          <div className="w-full text-center py-2 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-center gap-1.5">
            <span className="text-emerald-600 font-bold">✓</span>
            <span>Feedback Integrated</span>
          </div>
        )}
      </div>
    </div>
  );
}
