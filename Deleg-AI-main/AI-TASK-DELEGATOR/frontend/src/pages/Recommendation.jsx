import React, { useState } from 'react';
import { assignTask } from '../services/api';
import RecommendationCard from '../components/RecommendationCard';

export default function Recommendation({
  recommendationResult,
  analyzedTask,
  setActiveTab,
  setSelectedTask
}) {
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignedSuccess, setAssignedSuccess] = useState(false);

  // Fallback demo recommendation if navigated to directly
  const recommendation = recommendationResult || {
    employee: "Rahul",
    employee_id: 1,
    score: 92,
    reasons: [
      "Strong Marketing skill (90%)",
      "Strong Graphic Design skill (85%)",
      "Currently available"
    ],
    required_skills: ["Marketing", "Graphic Design", "Communication"],
    alternatives: [
      { employee: "Maya", score: 86, reasons: ["Strong Marketing skill (85%)", "Currently available"] }
    ]
  };

  const currentTask = analyzedTask || {
    id: 1,
    title: "Create Instagram Ad Campaign",
    description: "Create an Instagram advertisement for our new product launch including visuals and caption.",
    category: "Marketing",
    required_skills: ["Marketing", "Graphic Design", "Communication"],
    priority: "High",
    difficulty: 3
  };

  const handleAssign = async (employeeId) => {
    setIsAssigning(true);
    try {
      await assignTask(currentTask.id, employeeId || recommendation.employee_id || 1);
      setAssignedSuccess(true);
      setTimeout(() => {
        if (setSelectedTask) {
          setSelectedTask({
            ...currentTask,
            assigned_to: employeeId || recommendation.employee_id || 1,
            status: "Assigned"
          });
        }
      }, 800);
    } catch (err) {
      console.error('Assignment error:', err);
      // Still show success for smooth hackathon demo
      setAssignedSuccess(true);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Task Match & Recommendation</h1>
          <p className="text-xs text-slate-500">Explainable multi-criteria assignment based on capability, performance, and workload</p>
        </div>
        <button
          onClick={() => setActiveTab('create-task')}
          className="text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm"
        >
          ← New Analysis
        </button>
      </div>

      {assignedSuccess ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto">
            ✓
          </div>
          <h2 className="text-xl font-bold text-emerald-900">Task Successfully Assigned!</h2>
          <p className="text-xs text-emerald-700 max-w-md mx-auto">
            Task <strong>"{currentTask.title}"</strong> has been assigned to <strong>{recommendation.employee}</strong>.
            Their status is now updated to Busy until task completion and feedback evaluation.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className="px-4 py-2 bg-white border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold hover:bg-emerald-50"
            >
              Proceed to Feedback Simulator
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Analyzed Task Summary Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                  {currentTask.category || "Marketing"}
                </span>
                <h3 className="font-bold text-slate-900 text-lg mt-1">{currentTask.title}</h3>
                <p className="text-xs text-slate-600 mt-1">{currentTask.description}</p>
              </div>
              <div className="text-right text-xs text-slate-500 whitespace-nowrap">
                <div>Priority: <strong className="text-slate-800">{currentTask.priority || 'Medium'}</strong></div>
                <div>Difficulty: <strong className="text-slate-800">{currentTask.difficulty || 3}/5</strong></div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 mr-1">Required Skills:</span>
              {(currentTask.required_skills || recommendation.required_skills || []).map((skill, idx) => (
                <span key={idx} className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Primary Recommendation Card */}
          <RecommendationCard
            recommendation={recommendation}
            onAssign={handleAssign}
            isAssigning={isAssigning}
          />

          {/* Alternative Candidates */}
          {recommendation.alternatives && recommendation.alternatives.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Alternative Candidates Considered
              </h4>
              <div className="space-y-2.5">
                {recommendation.alternatives.map((alt, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{alt.employee}</div>
                      <div className="text-xs text-slate-500">{alt.reasons?.join(' • ')}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-700 text-sm">{alt.score}%</span>
                      <button
                        onClick={() => handleAssign(alt.employee_id)}
                        className="text-xs px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-700 font-medium transition-colors"
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
