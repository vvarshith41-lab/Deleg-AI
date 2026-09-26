import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { getAnalytics, getTasks, getEmployees } from '../services/api';
import TaskCard from '../components/TaskCard';
import StatusBadge from '../components/StatusBadge';
import { MetricSkeleton, CardSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

export default function Dashboard({ setActiveTab, setSelectedTask, refreshKey = 0 }) {
  const [analytics, setAnalytics] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, tasksRes, employeesRes] = await Promise.all([
        getAnalytics(),
        getTasks(),
        getEmployees()
      ]);

      if (statsRes) setAnalytics(statsRes);
      if (tasksRes) setAllTasks(tasksRes);
      if (employeesRes) setEmployees(employeesRes);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Unable to fetch live dashboard data. Running with cached/demo values.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload when refreshKey changes (e.g. after assignment or feedback)
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData, refreshKey]);

  // Lookup map: employee id -> employee name
  const employeeMap = useMemo(() => {
    const map = {};
    employees.forEach((emp) => {
      if (emp && emp.id) map[emp.id] = emp.name;
    });
    return map;
  }, [employees]);

  // Dynamic status counts for filter tabs
  const counts = useMemo(() => {
    const res = { all: allTasks.length, pending: 0, assigned: 0, completed: 0 };
    allTasks.forEach((t) => {
      const s = (t.status || '').toLowerCase();
      if (s === 'pending') res.pending += 1;
      else if (s === 'assigned') res.assigned += 1;
      else if (s === 'completed') res.completed += 1;
    });
    return res;
  }, [allTasks]);

  // Filtered task list
  const filteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      // Status filter
      if (statusFilter !== 'all' && (task.status || '').toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== 'all' && (task.priority || '').toLowerCase() !== priorityFilter.toLowerCase()) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = (task.title || '').toLowerCase().includes(q);
        const descMatch = (task.description || '').toLowerCase().includes(q);
        const catMatch = (task.category || '').toLowerCase().includes(q);
        const skillMatch = (task.required_skills || []).some((s) => s.toLowerCase().includes(q));
        if (!titleMatch && !descMatch && !catMatch && !skillMatch) {
          return false;
        }
      }

      return true;
    });
  }, [allTasks, statusFilter, priorityFilter, searchQuery]);

  const handleAssignClick = (task) => {
    if (setSelectedTask) setSelectedTask(task);
    setActiveTab('recommendation');
  };

  const handleFeedbackClick = (task) => {
    if (setSelectedTask) setSelectedTask(task);
    setActiveTab('feedback');
  };

  const handleResetFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setSearchQuery('');
  };

  // Calculated metrics
  const totalTasksCount = allTasks.length;
  const pendingCount = counts.pending;
  const assignedCount = counts.assigned;
  const completedCount = counts.completed;
  const availableEmpCount = analytics?.active_employees ?? employees.filter((e) => e.available).length;
  const teamAvgPerf = analytics?.average_team_performance
    ? Math.round(analytics.average_team_performance)
    : 89;

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-700/60 inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Smart Delegation Engine
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">|</span>
            <span className="text-xs text-slate-300 hidden sm:inline">Online Bayesian EMA Learning</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Operations & Task Delegation Center
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Automatically decompose tasks with AI, match with the best qualified team member using a 60/25/15 scoring formula, and continually refine skill ratings with instant feedback.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('create-task')}
            className="flex-1 sm:flex-initial py-3 px-5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
          >
            <span>+</span>
            <span>Create New Task</span>
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className="flex-1 sm:flex-initial py-3 px-5 bg-slate-800/90 hover:bg-slate-700/90 text-white font-semibold text-xs sm:text-sm rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <span>👥</span>
            <span>View Team</span>
          </button>
        </div>
      </div>

      {/* Error Notice (if non-fatal API warning exists) */}
      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-800">
          <div className="flex items-center space-x-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
          <button
            onClick={loadDashboardData}
            className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Metric Cards Section (5 Useful Metrics) */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Operational Metrics
          </h2>
          <span className="text-[11px] text-slate-400">Live system counters</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <MetricSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Total Tasks */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-colors">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Tasks</div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{totalTasksCount}</div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <span>📋</span>
                <span>Active backlog</span>
              </div>
            </div>

            {/* Pending Tasks */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-amber-200 transition-colors">
              <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Pending Assignment</div>
              <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-2">{pendingCount}</div>
              <div className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                <span>⏳</span>
                <span>Requires AI matching</span>
              </div>
            </div>

            {/* Assigned Tasks */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-200 transition-colors">
              <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">In Progress</div>
              <div className="text-2xl sm:text-3xl font-black text-blue-600 mt-2">{assignedCount}</div>
              <div className="text-[11px] text-blue-600 mt-1 flex items-center gap-1">
                <span>⚡</span>
                <span>Delegated to team</span>
              </div>
            </div>

            {/* Completed Tasks */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-200 transition-colors">
              <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Completed</div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2">{completedCount}</div>
              <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                <span>✓</span>
                <span>Feedback integrated</span>
              </div>
            </div>

            {/* Available Team */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-teal-200 transition-colors col-span-2 sm:col-span-1">
              <div className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">Available Staff</div>
              <div className="text-2xl sm:text-3xl font-black text-teal-600 mt-2">
                {availableEmpCount} <span className="text-xs font-normal text-slate-400">/ {employees.length || 5}</span>
              </div>
              <div className="text-[11px] text-teal-600 mt-1 flex items-center gap-1">
                <span>👤</span>
                <span>Ready for delegation</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tasks Section with Filters */}
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Task Queue & Assignments</h2>
            <p className="text-xs text-slate-500">Filter, inspect, and trigger recommendations or feedback for all operational tasks.</p>
          </div>

          {/* Quick Refresh Button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold transition-all flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
              title="Refresh queue"
            >
              <span className={loading ? 'animate-spin' : ''}>🔄</span>
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setActiveTab('create-task')}
              className="text-xs px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all shadow-xs"
            >
              + Create Task
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
            {[
              { id: 'all', label: 'All Tasks', count: counts.all },
              { id: 'pending', label: 'Pending', count: counts.pending },
              { id: 'assigned', label: 'Assigned', count: counts.assigned },
              { id: 'completed', label: 'Completed', count: counts.completed },
            ].map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Priority Filter Controls */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            {/* Priority Selector */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical Priority</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            {/* Search Input */}
            <div className="relative flex-1 sm:w-56">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, skills..."
                className="w-full text-xs border border-slate-300 rounded-xl pl-8 pr-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              <span className="absolute left-2.5 top-2.5 text-slate-400 text-xs">🔍</span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Clear Filters (if active) */}
            {(statusFilter !== 'all' || priorityFilter !== 'all' || searchQuery) && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1.5 rounded-lg hover:bg-rose-50 transition-colors whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Task Cards Grid / Loading / Empty State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                assignedEmployeeName={employeeMap[task.assigned_to]}
                onAssignClick={handleAssignClick}
                onFeedbackClick={handleFeedbackClick}
              />
            ))}
          </div>
        ) : allTasks.length === 0 ? (
          /* Zero tasks in the system */
          <EmptyState
            title="No Tasks in the Queue"
            description="Get started by delegating your first operational task. Our AI will analyze requirements and recommend the ideal team member."
            icon="📝"
            actionLabel="+ Create First Task"
            onAction={() => setActiveTab('create-task')}
          />
        ) : (
          /* Filter yielded zero tasks */
          <EmptyState
            title="No Tasks Match Your Filters"
            description="Try selecting a different status tab or adjusting your priority and search keywords."
            icon="🔍"
            actionLabel="Reset All Filters"
            onAction={handleResetFilters}
          />
        )}
      </div>
    </div>
  );
}
