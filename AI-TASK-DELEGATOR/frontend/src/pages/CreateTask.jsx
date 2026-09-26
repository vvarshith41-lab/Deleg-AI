import React, { useState } from 'react';
import { analyzeTask, getRecommendation, createTask } from '../services/api';

export default function CreateTask({ setActiveTab, setRecommendationResult, setAnalyzedTask }) {
  const [description, setDescription] = useState(
    'Create an Instagram advertisement for our new product launch including visuals and caption.'
  );
  const [deadline, setDeadline] = useState('2026-10-15');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyzeAndRecommend = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a task description.');
      return;
    }
    setError('');
    setIsAnalyzing(true);

    try {
      // 1. Analyze Task with AI analyzer
      const analysis = await analyzeTask(description);

      // 2. Fetch match recommendation based on identified required skills
      const recommendation = await getRecommendation({
        task_description: description,
        required_skills: analysis.required_skills
      });

      // 3. Create task record
      const newTask = await createTask({
        title: description.slice(0, 45) + (description.length > 45 ? '...' : ''),
        description,
        deadline,
        category: analysis.category,
        required_skills: analysis.required_skills,
        priority: analysis.priority,
        difficulty: analysis.difficulty
      });

      if (setAnalyzedTask) {
        setAnalyzedTask({
          ...newTask,
          ...analysis,
          description,
          deadline
        });
      }

      if (setRecommendationResult) {
        setRecommendationResult({
          ...recommendation,
          task: newTask,
          analysis
        });
      }

      // Route directly to recommendation view
      setActiveTab('recommendation');
    } catch (err) {
      console.error('Task analysis failed:', err);
      setError(err.message || 'Failed to analyze task');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create & Delegate Task</h1>
        <p className="text-xs text-slate-500">
          Enter your task requirements. Our AI analyzer extracts the required skills and automatically recommends the best team member.
        </p>
      </div>

      <form onSubmit={handleAnalyzeAndRecommend} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* Task Description Text Box */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Task Description
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what needs to be accomplished in plain English (e.g. Build REST API for payment gateway)..."
            className="w-full text-sm border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            required
          />
        </div>

        {/* Deadline Field */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Target Deadline
          </label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full text-sm border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Suggested Quick Templates */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Or try a quick demo template:
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setDescription('Create an Instagram advertisement for our new product launch.')}
              className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              Marketing Ad
            </button>
            <button
              type="button"
              onClick={() => setDescription('Build a secure backend API endpoint for Stripe payment webhooks.')}
              className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              Python API
            </button>
            <button
              type="button"
              onClick={() => setDescription('Reconcile Q3 balance sheets, expenses, and invoices in Excel.')}
              className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              Finance Audit
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isAnalyzing}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{isAnalyzing ? 'Analyzing Task & Computing Matches...' : 'Analyze & Recommend'}</span>
            <span>⚡</span>
          </button>
        </div>
      </form>
    </div>
  );
}
