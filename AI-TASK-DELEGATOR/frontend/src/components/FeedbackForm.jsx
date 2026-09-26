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
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-1">
        Post-Task Feedback & Continual Learning
      </h3>
      <p className="text-xs text-slate-500 mb-5">
        Ratings directly update employee skill proficiency scores incrementally without retraining the model.
      </p>

      {/* Task & Employee Context */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-5 text-xs text-slate-700 space-y-1">
        <div><span className="font-semibold">Task:</span> {task?.title || 'Selected Task'}</div>
        <div><span className="font-semibold">Assignee:</span> {employee?.name || `Employee #${task?.assigned_to || 1}`}</div>
      </div>

      {/* Rating Slider & Value */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Performance Rating (0 - 100)
          </label>
          <span className="text-xl font-extrabold text-emerald-600">{rating}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
        />
        <div className="flex justify-between text-[11px] text-slate-400 mt-1">
          <span>Needs Improvement (0%)</span>
          <span>Satisfactory (75%)</span>
          <span>Exceptional (100%)</span>
        </div>
      </div>

      {/* Review Comments */}
      <div className="mb-5">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Review Comments / Notes
        </label>
        <textarea
          rows={3}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="E.g. Great quality deliverables, clean assets, completed ahead of schedule."
          className="w-full text-sm border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Continual Learning Formula Explainer */}
      <div className="mb-5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-900">
        <div className="font-semibold mb-0.5">Incremental Update Formula:</div>
        <code>new_score = (old_score * 0.8) + (feedback_rating * 0.2)</code>
      </div>

      {/* Submit Feedback Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'Updating Scores...' : 'Submit Feedback & Update Skills'}
      </button>
    </form>
  );
}
