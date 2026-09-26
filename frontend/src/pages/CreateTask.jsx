import React, { useState } from 'react';
import { analyzeTask, getRecommendation, createTask } from '../services/api';
import AiAnalysisCard from '../components/AiAnalysisCard';

export default function CreateTask({
  setActiveTab,
  setRecommendationResult,
  setAnalyzedTask,
  setSelectedTask
}) {
  const [description, setDescription] = useState(
    'Create an Instagram advertisement for our new product launch including visuals and caption.'
  );
  const [deadline, setDeadline] = useState('2026-10-15');

  // Step states: 1 = input, 2 = analyzed & review
  const [step, setStep] = useState(1);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);

  // Loading states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRecommending, setIsRecommending] = useState(false);

  // Error messages
  const [error, setError] = useState('');

  // Demo templates
  const demoTemplates = [
    {
      label: 'Marketing Ad',
      desc: 'Create an Instagram advertisement for our new product launch including visuals and caption.',
      deadline: '2026-10-15'
    },
    {
      label: 'Python REST API',
      desc: 'Build a secure backend API endpoint for Stripe payment webhooks with validation and error handling.',
      deadline: '2026-10-10'
    },
    {
      label: 'React Dashboard UI',
      desc: 'Implement an interactive frontend analytics dashboard using React, Tailwind CSS, and charts.',
      deadline: '2026-10-12'
    },
    {
      label: 'Finance Audit',
      desc: 'Review and reconcile third quarter balance sheet, invoices, and expense reports in Excel.',
      deadline: '2026-10-08'
    },
    {
      label: 'Client Support',
      desc: 'Handle tier-2 enterprise customer support escalation regarding API latency and webhook failures.',
      deadline: '2026-10-06'
    }
  ];

  const handleApplyTemplate = (tmpl) => {
    setDescription(tmpl.desc);
    setDeadline(tmpl.deadline);
    setError('');
    // If we were on step 2 and user picks a new template, revert to step 1
    if (step === 2) {
      setStep(1);
      setCurrentAnalysis(null);
    }
  };

  // STEP 2: Analyze task with AI
  const handleAnalyzeTask = async (e) => {
    if (e) e.preventDefault();

    const trimmed = description.trim();
    if (!trimmed) {
      setError('Please provide a task description before running AI analysis.');
      return;
    }
    if (trimmed.length < 8) {
      setError('Please enter a more descriptive task requirement (at least 8 characters).');
      return;
    }

    setError('');
    setIsAnalyzing(true);

    try {
      const analysis = await analyzeTask(trimmed);
      if (!analysis || typeof analysis !== 'object') {
        throw new Error('AI Analyzer did not return valid analysis data.');
      }
      setCurrentAnalysis(analysis);
      setStep(2); // Advance to review step
    } catch (err) {
      console.error('Task analysis failed:', err);
      setError(err.message || 'Failed to analyze task requirements. Please check input and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // STEP 6-8: Proceed to generate recommendation and store task
  const handleProceedToRecommendation = async () => {
    if (!currentAnalysis) {
      setError('Task analysis data is missing. Please re-run analysis.');
      return;
    }

    setError('');
    setIsRecommending(true);

    try {
      const trimmed = description.trim();
      const derivedTitle = trimmed.slice(0, 45) + (trimmed.length > 45 ? '...' : '');

      // 1. Create task in backlog
      const newTask = await createTask({
        title: derivedTitle,
        description: trimmed,
        deadline,
        category: currentAnalysis.category || 'General',
        required_skills: currentAnalysis.required_skills || [],
        priority: currentAnalysis.priority || 'Medium',
        difficulty: currentAnalysis.difficulty || 3
      });

      // 2. Fetch match recommendations based on analyzed skills
      const recommendation = await getRecommendation({
        task_description: trimmed,
        required_skills: currentAnalysis.required_skills || []
      });

      // 3. Update global workflow state
      if (setAnalyzedTask) {
        setAnalyzedTask({
          ...newTask,
          ...currentAnalysis,
          description: trimmed,
          deadline
        });
      }

      if (setSelectedTask) {
        setSelectedTask(newTask);
      }

      if (setRecommendationResult) {
        setRecommendationResult({
          ...recommendation,
          task: newTask,
          analysis: currentAnalysis
        });
      }

      // 4. Navigate directly to Recommendation view
      setActiveTab('recommendation');
    } catch (err) {
      console.error('Recommendation or Task creation error:', err);
      setError(err.message || 'Failed to complete recommendation. Please retry.');
    } finally {
      setIsRecommending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header & Flow Indicator */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create & Delegate Task</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Two-step AI delegation: decompose requirements, then evaluate candidates using multi-factor scoring.
          </p>
        </div>

        {/* Progress Step Pills */}
        <div className="flex items-center space-x-2 shrink-0 text-xs font-semibold">
          <span
            className={`px-3 py-1 rounded-full border ${
              step === 1
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            1. Describe Task
          </span>
          <span className="text-slate-300">→</span>
          <span
            className={`px-3 py-1 rounded-full border ${
              step === 2
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                : 'bg-slate-100 text-slate-400 border-slate-200'
            }`}
          >
            2. AI Review & Match
          </span>
        </div>
      </div>

      {/* Global Error Notice */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2">
            <span className="text-base shrink-0">⚠️</span>
            <div className="space-y-0.5">
              <span className="font-bold">Error:</span>
              <p>{error}</p>
            </div>
          </div>
          <button
            onClick={() => setError('')}
            className="text-rose-600 hover:text-rose-800 font-bold text-sm shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* STEP 1: Enter Task Requirements Form */}
      <form onSubmit={handleAnalyzeTask} className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-5">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Task Description & Objectives <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">Plain natural language</span>
          </div>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (error) setError('');
            }}
            placeholder="Describe what needs to be accomplished (e.g. Build REST API for payment gateway, audit Q3 finances)..."
            className="w-full text-xs sm:text-sm border border-slate-300 rounded-2xl p-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all leading-relaxed"
            disabled={isAnalyzing || isRecommending}
            required
          />
        </div>

        {/* Deadline Input */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Target Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              disabled={isAnalyzing || isRecommending}
              className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-col justify-end">
            <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              💡 <strong>Tip:</strong> The AI extracts specific required skills and categorizes priority automatically from the task context.
            </div>
          </div>
        </div>

        {/* Demo Template Quick Buttons */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Or try a pre-configured template:
          </div>
          <div className="flex flex-wrap gap-2">
            {demoTemplates.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyTemplate(tmpl)}
                disabled={isAnalyzing || isRecommending}
                className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                {tmpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step 1 Submit / Analyze Trigger */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {step === 2 ? 'Analysis complete below. You may re-analyze if you modified the prompt.' : 'Ready to analyze requirements with AI'}
          </span>

          <button
            type="submit"
            disabled={isAnalyzing || isRecommending}
            className="py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <span className="animate-spin text-sm">⚡</span>
                <span>Extracting Skills with AI...</span>
              </>
            ) : (
              <>
                <span>⚡ Analyze Task</span>
                <span>{step === 2 ? 'Again' : ''}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* STEP 2: Render AI Analysis Card when available */}
      {step === 2 && currentAnalysis && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Step 2: Review Extracted Requirements
            </span>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              Verified by Analyzer
            </span>
          </div>

          <AiAnalysisCard
            analysis={currentAnalysis}
            onEdit={() => {
              setStep(1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onProceed={handleProceedToRecommendation}
            isProceeding={isRecommending}
          />
        </div>
      )}
    </div>
  );
}
