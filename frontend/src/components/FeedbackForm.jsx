import React, { useState } from 'react';

export default function FeedbackForm({ task, employee, onSubmit, isSubmitting = false }) {
  const [rating, setRating] = useState(90);
  const [comments, setComments] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({
        task_id: task?.id || 1,
        employee_id: employee?.id || task?.assigned_to || 1,
        rating: Number(rating),
        comments
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-5">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Performance Rating & Incremental Update
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Task ratings directly adapt employee skill proficiencies using exponential moving average without retraining models.
        </p>
      </div>

      {/* Task & Employee Context */}
      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-slate-400 font-medium">Task:</span>
          <div className="font-bold text-slate-800 truncate">{task?.title || 'Selected Task'}</div>
        </div>
        <div>
          <span className="text-slate-400 font-medium">Assignee:</span>
          <div className="font-bold text-slate-800">{employee?.name || `Employee #${task?.assigned_to || 1}`}</div>
        </div>
      </div>

      {/* Rating Slider & Value */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Evaluation Rating (0 - 100%)
          </label>
          <span className="text-2xl font-black text-emerald-600">{rating}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          disabled={isSubmitting}
          className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
        />
        <div className="flex justify-between text-[11px] text-slate-400 font-medium">
          <span>0% Needs Improvement</span>
          <span>75% Good</span>
          <span>100% Exceptional</span>
        </div>
      </div>

      {/* Review Comments */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Review Comments / Notes (Optional)
        </label>
        <textarea
          rows={3}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          disabled={isSubmitting}
          placeholder="E.g. Prompt turnaround, clean delivery, minimal revisions needed."
          className="w-full text-xs sm:text-sm border border-slate-300 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all leading-relaxed"
        />
      </div>

      {/* Continual Learning Formula Box */}
      <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl text-xs text-emerald-900 space-y-1">
        <div className="font-bold flex items-center gap-1.5">
          <span>⚡</span>
          <span>Online Bayesian Formula:</span>
        </div>
        <code className="block bg-white/70 px-2 py-1 rounded-lg text-slate-800 text-[11px] font-mono border border-emerald-100">
          new_score = (old_score × 0.8) + (rating × 0.2)
        </code>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <span className="animate-spin text-sm">🔄</span>
            <span>Updating Employee Scores...</span>
          </>
        ) : (
          <span>Submit Feedback & Update Skills</span>
        )}
      </button>
    </form>
  );
}
