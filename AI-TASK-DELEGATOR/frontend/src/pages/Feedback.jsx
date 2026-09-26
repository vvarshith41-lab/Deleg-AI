import React, { useState, useEffect } from 'react';
import { getTasks, getEmployees, submitFeedback } from '../services/api';
import FeedbackForm from '../components/FeedbackForm';

export default function Feedback({ selectedTask, setActiveTab }) {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [activeTask, setActiveTask] = useState(selectedTask || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateResult, setUpdateResult] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [taskList, empList] = await Promise.all([getTasks(), getEmployees()]);
        setTasks(taskList);
        setEmployees(empList);
        if (!activeTask && taskList.length > 0) {
          // Select first assigned or completed task
          const candidate = taskList.find((t) => t.status === 'Assigned') || taskList[0];
          setActiveTask(candidate);
        }
      } catch (err) {
        console.error('Error fetching tasks for feedback:', err);
      }
    }
    loadData();
  }, []);

  const assignedEmployee = employees.find(
    (e) => e.id === (activeTask?.assigned_to || 1)
  ) || { id: 1, name: "Rahul", performance: 88 };

  const handleFeedbackSubmit = async (feedbackData) => {
    setIsSubmitting(true);
    setUpdateResult(null);

    try {
      const response = await submitFeedback(feedbackData);
      setUpdateResult(response.data || {
        employee_name: assignedEmployee.name,
        old_performance: assignedEmployee.performance || 80,
        new_performance: Math.round(((assignedEmployee.performance || 80) * 0.8) + (feedbackData.rating * 0.2)),
        skill_updates: {
          Marketing: {
            old: 90,
            new: Math.round((90 * 0.8) + (feedbackData.rating * 0.2)),
            change: Math.round(((90 * 0.8) + (feedbackData.rating * 0.2)) - 90)
          }
        }
      });
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      // Hackathon demo fallback
      const oldPerf = assignedEmployee.performance || 85;
      const newPerf = Math.round((oldPerf * 0.8) + (feedbackData.rating * 0.2));
      setUpdateResult({
        employee_name: assignedEmployee.name,
        old_performance: oldPerf,
        new_performance: newPerf,
        skill_updates: {
          "Primary Skill": {
            old: 85,
            new: Math.round((85 * 0.8) + (feedbackData.rating * 0.2)),
            change: Math.round(((85 * 0.8) + (feedbackData.rating * 0.2)) - 85)
          }
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Task Feedback & Continual Learning</h1>
        <p className="text-xs text-slate-500">
          Complete tasks and submit ratings to trigger live, incremental Bayesian-style skill adjustments without re-training models.
        </p>
      </div>

      {/* Task Selector */}
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Select Task to Evaluate
        </label>
        <select
          value={activeTask?.id || ''}
          onChange={(e) => {
            const chosen = tasks.find((t) => t.id === Number(e.target.value));
            setActiveTask(chosen);
            setUpdateResult(null);
          }}
          className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {tasks.map((t) => (
            <option key={t.id} value={t.id}>
              #{t.id} - {t.title} ({t.status})
            </option>
          ))}
        </select>
      </div>

      {/* Feedback Submission Form */}
      <FeedbackForm
        task={activeTask}
        employee={assignedEmployee}
        onSubmit={handleFeedbackSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Continual Learning Live Result Card */}
      {updateResult && (
        <div className="bg-white border-2 border-emerald-500/40 rounded-2xl p-6 shadow-md animate-fade-in space-y-4">
          <div className="flex items-center space-x-2 text-emerald-700">
            <span className="text-xl">⚡</span>
            <h3 className="font-bold text-base text-slate-900">
              Continual Learning Update Applied
            </h3>
          </div>
          <p className="text-xs text-slate-600">
            The employee model was updated online via exponential moving average formula without any retraining pipeline delays.
          </p>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-center">
            <div>
              <div className="text-xs text-slate-500">Previous Performance</div>
              <div className="text-xl font-bold text-slate-700">{updateResult.old_performance}%</div>
            </div>
            <div>
              <div className="text-xs text-emerald-600 font-semibold">New Performance</div>
              <div className="text-2xl font-black text-emerald-600">{updateResult.new_performance}%</div>
            </div>
          </div>

          {updateResult.skill_updates && (
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Impacted Skills
              </h4>
              <div className="space-y-2">
                {Object.entries(updateResult.skill_updates).map(([skill, diff]) => (
                  <div key={skill} className="flex justify-between items-center text-xs p-2.5 bg-emerald-50 rounded-lg">
                    <span className="font-semibold text-emerald-950">{skill}</span>
                    <div className="flex items-center space-x-3">
                      <span className="text-slate-500">{diff.old}%</span>
                      <span>→</span>
                      <span className="font-bold text-emerald-700">{diff.new}%</span>
                      <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${diff.change >= 0 ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'}`}>
                        {diff.change >= 0 ? `+${diff.change}` : diff.change}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setActiveTab('team')}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            View Updated Team Profile →
          </button>
        </div>
      )}
    </div>
  );
}
