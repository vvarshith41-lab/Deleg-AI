import React, { useState, useEffect } from 'react';
import { getTasks, getEmployees, submitFeedback } from '../services/api';
import FeedbackForm from '../components/FeedbackForm';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';

export default function Feedback({ selectedTask, setActiveTab, onFeedbackSubmitted, refreshKey = 0 }) {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [activeTask, setActiveTask] = useState(selectedTask || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateResult, setUpdateResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [taskList, empList] = await Promise.all([getTasks(), getEmployees()]);
        if (taskList && Array.isArray(taskList)) setTasks(taskList);
        if (empList && Array.isArray(empList)) setEmployees(empList);

        if (selectedTask) {
          setActiveTask(selectedTask);
        } else if (taskList && taskList.length > 0) {
          // Default to first assigned task or first task
          const candidate = taskList.find((t) => t.status === 'Assigned') || taskList[0];
          setActiveTask(candidate);
        }
      } catch (err) {
        console.error('Error fetching data for feedback:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedTask, refreshKey]);

  // Lookup assigned employee
  const assignedEmployee = employees.find(
    (e) => e.id === (activeTask?.assigned_to || 1)
  ) || { id: 1, name: "Rahul", performance: 88, skills: { Marketing: 90 } };

  const handleFeedbackSubmit = async (feedbackData) => {
    setIsSubmitting(true);
    setUpdateResult(null);

    try {
      const response = await submitFeedback(feedbackData);
      const data = response?.data || response;

      setUpdateResult({
        ...data,
        isDemo: false
      });

      if (onFeedbackSubmitted) onFeedbackSubmitted();

    } catch (err) {
      console.warn('Real backend feedback endpoint failed, using offline simulation:', err.message);

      // Offline mathematical calculation of the EMA formula
      const oldPerf = assignedEmployee.performance || 85;
      const newPerf = Math.round((oldPerf * 0.8) + (feedbackData.rating * 0.2));
      const primarySkill = Object.keys(assignedEmployee.skills || {})[0] || 'Primary Skill';
      const oldSkillVal = assignedEmployee.skills?.[primarySkill] || 85;
      const newSkillVal = Math.round((oldSkillVal * 0.8) + (feedbackData.rating * 0.2));

      setUpdateResult({
        employee_name: assignedEmployee.name,
        old_performance: oldPerf,
        new_performance: newPerf,
        skill_updates: {
          [primarySkill]: {
            old: oldSkillVal,
            new: newSkillVal,
            change: newSkillVal - oldSkillVal
          }
        },
        isDemo: true
      });

      if (onFeedbackSubmitted) onFeedbackSubmitted();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Task Feedback & Continual Learning
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Submit post-task completion reviews to trigger online Bayesian exponential moving average updates without retraining models.
        </p>
      </div>

      {tasks.length === 0 && !loading ? (
        <EmptyState
          title="No Tasks Available to Review"
          description="Create and assign a task first before evaluating deliverables."
          icon="📝"
          actionLabel="+ Create Task"
          onAction={() => setActiveTab('create-task')}
        />
      ) : (
        <>
          {/* Task Selector Box */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Task to Review
              </label>
              {activeTask?.status && (
                <StatusBadge type={activeTask.status} size="sm" />
              )}
            </div>

            <select
              value={activeTask?.id || ''}
              onChange={(e) => {
                const chosen = tasks.find((t) => t.id === Number(e.target.value));
                setActiveTask(chosen);
                setUpdateResult(null);
              }}
              className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
            >
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  #{t.id} — {t.title} ({t.status || 'Pending'})
                </option>
              ))}
            </select>
          </div>

          {/* Feedback Form */}
          <FeedbackForm
            task={activeTask}
            employee={assignedEmployee}
            onSubmit={handleFeedbackSubmit}
            isSubmitting={isSubmitting}
          />

          {/* Continual Learning Live Result Card */}
          {updateResult && (
            <div className="bg-white border-2 border-emerald-500/50 rounded-3xl p-6 shadow-sm space-y-5 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                    ⚡
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 leading-tight">
                      Continual Learning Update Applied
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Profile adapted for <strong>{updateResult.employee_name || assignedEmployee.name}</strong>
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border self-start sm:self-auto ${
                    updateResult.isDemo
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {updateResult.isDemo ? '⚠️ Offline Simulation' : '✓ Live Server Update'}
                </span>
              </div>

              {/* Performance Score Before / After Comparison */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                <div className="space-y-0.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Previous Rating
                  </div>
                  <div className="text-2xl font-black text-slate-700">
                    {Math.round(updateResult.old_performance)}%
                  </div>
                </div>
                <div className="space-y-0.5 border-l border-slate-200">
                  <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                    Updated Rating
                  </div>
                  <div className="text-2xl font-black text-emerald-600">
                    {Math.round(updateResult.new_performance)}%
                  </div>
                </div>
              </div>

              {/* Impacted Skills Breakdown */}
              {updateResult.skill_updates && Object.keys(updateResult.skill_updates).length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Adapted Skill Scores
                  </div>
                  <div className="space-y-2">
                    {Object.entries(updateResult.skill_updates).map(([skill, diff]) => {
                      const change = Number(diff.change || (diff.new - diff.old) || 0);
                      const isPositive = change >= 0;
                      return (
                        <div
                          key={skill}
                          className="flex justify-between items-center text-xs p-3 bg-emerald-50/70 rounded-xl border border-emerald-100"
                        >
                          <span className="font-bold text-emerald-950">{skill}</span>
                          <div className="flex items-center space-x-3">
                            <span className="text-slate-500 font-medium">{Math.round(diff.old)}%</span>
                            <span className="text-slate-400">→</span>
                            <span className="font-extrabold text-emerald-800">{Math.round(diff.new)}%</span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[11px] font-black ${
                                isPositive
                                  ? 'bg-emerald-200 text-emerald-900'
                                  : 'bg-rose-200 text-rose-900'
                              }`}
                            >
                              {isPositive ? `+${change}` : change}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Navigation Action */}
              <button
                onClick={() => setActiveTab('team')}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>View Updated Team Directory</span>
                <span>→</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
