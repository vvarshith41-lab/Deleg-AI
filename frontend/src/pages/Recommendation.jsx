import React, { useState } from 'react';
import { assignTask } from '../services/api';
import RecommendationCard from '../components/RecommendationCard';
import StatusBadge from '../components/StatusBadge';

export default function Recommendation({
  recommendationResult,
  analyzedTask,
  setActiveTab,
  setSelectedTask,
  onTaskAssigned
}) {
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignedSuccess, setAssignedSuccess] = useState(false);
  const [assignedToName, setAssignedToName] = useState('');
  const [assignError, setAssignError] = useState(null);
  const [isDemoSimulated, setIsDemoSimulated] = useState(false);
  const [lastAssignedTarget, setLastAssignedTarget] = useState(null);

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
      {
        employee: "Maya",
        employee_id: 3,
        score: 86,
        reasons: ["Strong Marketing skill (85%)", "Currently available"],
        available: true
      },
      {
        employee: "David",
        employee_id: 5,
        score: 74,
        reasons: ["General organizational skills", "Currently available"],
        available: true
      }
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

  const handleAssign = async (employeeId, employeeName) => {
    setIsAssigning(true);
    setAssignError(null);

    const targetEmpId = employeeId || recommendation.employee_id || 1;
    const targetName = employeeName || recommendation.employee || 'Candidate';
    setLastAssignedTarget({ id: targetEmpId, name: targetName });

    try {
      // Execute the real existing backend API assignment
      await assignTask(currentTask.id, targetEmpId);

      // Successful real backend assignment
      setAssignedToName(targetName);
      setAssignedSuccess(true);
      setIsDemoSimulated(false);

      const updatedTaskObj = {
        ...currentTask,
        assigned_to: targetEmpId,
        status: "Assigned"
      };

      if (setSelectedTask) setSelectedTask(updatedTaskObj);
      if (onTaskAssigned) onTaskAssigned(updatedTaskObj);

    } catch (err) {
      console.error('Assignment request error:', err);
      // Explicitly report error - do NOT disguise failure as success
      setAssignedSuccess(false);
      setAssignError(
        err.message || 'Server rejected the assignment request. Please check backend connection.'
      );
    } finally {
      setIsAssigning(false);
    }
  };

  // Explicit demo simulation fallback (only when user actively opts in during offline mode)
  const handleSimulateDemoAssign = (employeeId, employeeName) => {
    const targetEmpId = employeeId || recommendation.employee_id || 1;
    const targetName = employeeName || recommendation.employee || 'Candidate';

    setAssignError(null);
    setAssignedToName(targetName);
    setIsDemoSimulated(true);
    setAssignedSuccess(true);

    const simulatedTask = {
      ...currentTask,
      assigned_to: targetEmpId,
      status: "Assigned"
    };

    if (setSelectedTask) setSelectedTask(simulatedTask);
    if (onTaskAssigned) onTaskAssigned(simulatedTask);
  };

  const handleProceedToFeedback = () => {
    if (setSelectedTask) {
      setSelectedTask({
        ...currentTask,
        assigned_to: lastAssignedTarget?.id || recommendation.employee_id || 1,
        status: "Assigned"
      });
    }
    setActiveTab('feedback');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header with Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Task Match & Recommendation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent candidate ranking based on 60% skills + 25% past performance + 15% availability.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('create-task')}
          className="text-xs text-slate-700 hover:text-slate-900 px-3.5 py-2 bg-white border border-slate-200 rounded-xl shadow-2xs font-semibold transition-all hover:bg-slate-50 flex items-center gap-1.5"
        >
          <span>←</span>
          <span>Revise Task</span>
        </button>
      </div>

      {/* Assignment Error Notice */}
      {assignError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-3 animate-in fade-in">
          <div className="flex items-start gap-2.5 text-xs text-rose-800">
            <span className="text-base shrink-0">❌</span>
            <div className="space-y-0.5 flex-1">
              <span className="font-bold">Assignment Request Failed:</span>
              <p>{assignError}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2 border-t border-rose-200/60 justify-end">
            <button
              onClick={() => handleAssign(lastAssignedTarget?.id, lastAssignedTarget?.name)}
              disabled={isAssigning}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
            >
              Retry API Request
            </button>
            <button
              onClick={() => handleSimulateDemoAssign(lastAssignedTarget?.id, lastAssignedTarget?.name)}
              className="px-3.5 py-1.5 bg-white border border-rose-300 text-rose-800 hover:bg-rose-100/50 text-xs font-semibold rounded-lg transition-colors"
            >
              Simulate in Offline Demo Mode
            </button>
          </div>
        </div>
      )}

      {/* Verified Success Confirmation State */}
      {assignedSuccess ? (
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white border-2 border-emerald-400 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm animate-in fade-in duration-200">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-sm">
            ✓
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 border shadow-2xs bg-white text-emerald-800 border-emerald-200">
              <span className={`w-2 h-2 rounded-full ${isDemoSimulated ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
              <span>{isDemoSimulated ? 'Simulated in Demo Mode' : 'Verified Backend Assignment'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Task Successfully Assigned!</h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Task <strong>"{currentTask.title}"</strong> has been assigned to <strong>{assignedToName || recommendation.employee}</strong>.
            Their status is now marked as <strong>Busy</strong> until deliverables are completed and reviewed.
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/25 transition-all"
            >
              View in Dashboard
            </button>
            <button
              onClick={handleProceedToFeedback}
              className="px-5 py-2.5 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5"
            >
              <span>Proceed to Feedback & Learning</span>
              <span>→</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Analyzed Task Context Summary */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider bg-slate-100 px-2.5 py-0.5 rounded-md">
                  {currentTask.category || "General"}
                </span>
                <StatusBadge type={currentTask.priority || 'Medium'} size="sm" />
                <StatusBadge type={currentTask.status || 'Pending'} size="sm" />
              </div>
              <div className="flex items-center text-xs text-slate-500 gap-1.5">
                <span className="font-medium text-slate-400">Difficulty:</span>
                <span className="text-amber-500 font-bold">Level {currentTask.difficulty || 3}/5</span>
                {currentTask.deadline && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500">Due: {currentTask.deadline}</span>
                  </>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">{currentTask.title}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{currentTask.description}</p>
            </div>

            {/* Required Skills Chips */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 mr-1">Evaluated Skills:</span>
              {(currentTask.required_skills || recommendation.required_skills || []).map((skill, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100 font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Primary Top Recommendation Card */}
          <RecommendationCard
            recommendation={recommendation}
            taskTitle={currentTask.title}
            onAssign={handleAssign}
            isAssigning={isAssigning}
          />

          {/* Alternative Candidates Section */}
          {recommendation.alternatives && recommendation.alternatives.length > 0 && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Alternative Candidates Considered
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Runner-up candidates evaluated against identical task requirements.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {recommendation.alternatives.length} Profiles
                </span>
              </div>

              <div className="space-y-3">
                {recommendation.alternatives.map((alt, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl hover:border-slate-300 transition-colors"
                  >
                    <div className="space-y-1.5 flex-1 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm sm:text-base">
                          {alt.employee}
                        </span>
                        {alt.available !== undefined && (
                          <StatusBadge
                            type={alt.available ? 'Available' : 'Busy'}
                            size="sm"
                          />
                        )}
                      </div>
                      <div className="text-xs text-slate-500 leading-relaxed">
                        {alt.reasons && alt.reasons.length > 0
                          ? alt.reasons.join(' • ')
                          : 'Evaluated against candidate skill profiles.'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                      <div className="text-right">
                        <div className="text-xl font-black text-slate-800">{alt.score}%</div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Match</div>
                      </div>
                      <button
                        onClick={() => handleAssign(alt.employee_id, alt.employee)}
                        disabled={isAssigning}
                        className="text-xs px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold rounded-xl transition-all shadow-2xs hover:border-slate-400 disabled:opacity-50"
                      >
                        Assign to {alt.employee.split(' ')[0]}
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
