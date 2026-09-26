import React, { useEffect, useState } from 'react';
import { getAnalytics, getTasks, getEmployees } from '../services/api';
import TaskCard from '../components/TaskCard';

export default function Dashboard({ setActiveTab, setSelectedTask }) {
  const [analytics, setAnalytics] = useState({
    total_employees: 5,
    pending_tasks: 1,
    completed_tasks: 1,
    average_team_performance: 89.0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [stats, tasks] = await Promise.all([getAnalytics(), getTasks()]);
        if (stats) setAnalytics(stats);
        if (tasks) setRecentTasks(tasks.slice(0, 4));
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAssignClick = (task) => {
    if (setSelectedTask) setSelectedTask(task);
    setActiveTab('recommendation');
  };

  const handleFeedbackClick = (task) => {
    if (setSelectedTask) setSelectedTask(task);
    setActiveTab('feedback');
  };

  return (
    <div className="space-y-8">
      {/* Hero Welcome */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
            Hackathon Skeleton Ready
          </span>
          <h1 className="text-3xl font-extrabold mt-3 tracking-tight">AI Task Delegator</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Smart task assignment tailored to employee strengths with explainable scoring and continual feedback learning without retraining.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('create-task')}
            className="py-3 px-5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all"
          >
            + Create New Task
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className="py-3 px-5 bg-slate-700 hover:bg-slate-600 text-white font-semibold text-sm rounded-xl transition-all"
          >
            View Team
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Team Members</div>
          <div className="text-3xl font-black text-slate-900 mt-2">{analytics.total_employees}</div>
          <div className="text-xs text-emerald-600 mt-1">Available for delegation</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Tasks</div>
          <div className="text-3xl font-black text-amber-600 mt-2">{analytics.pending_tasks}</div>
          <div className="text-xs text-slate-500 mt-1">Awaiting employee assignment</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Tasks</div>
          <div className="text-3xl font-black text-emerald-600 mt-2">{analytics.completed_tasks}</div>
          <div className="text-xs text-slate-500 mt-1">Feedback incorporated</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Team Avg Performance</div>
          <div className="text-3xl font-black text-blue-600 mt-2">{Math.round(analytics.average_team_performance || 88)}%</div>
          <div className="text-xs text-slate-500 mt-1">Dynamic moving average</div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Recent Tasks</h2>
            <p className="text-xs text-slate-500">Overview of operational queue and assignments</p>
          </div>
          <button
            onClick={() => setActiveTab('create-task')}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Create Task →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recentTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onAssignClick={handleAssignClick}
              onFeedbackClick={handleFeedbackClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
