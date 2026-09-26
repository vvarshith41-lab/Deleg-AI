import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Team from './pages/Team';
import CreateTask from './pages/CreateTask';
import Recommendation from './pages/Recommendation';
import Feedback from './pages/Feedback';
import { getHealth } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [backendStatus, setBackendStatus] = useState('checking');

  // Shared persistent workflow state
  const [recommendationResult, setRecommendationResult] = useState(null);
  const [analyzedTask, setAnalyzedTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  // Counter to trigger data refresh on Dashboard and Team after assignments/feedback
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerDataRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  // Periodic health check
  useEffect(() => {
    let isMounted = true;

    async function checkBackend() {
      try {
        const res = await getHealth();
        if (!isMounted) return;
        if (res && (res.status === 'ok' || res.status === 'online')) {
          setBackendStatus('online');
        } else {
          setBackendStatus('offline');
        }
      } catch {
        if (isMounted) setBackendStatus('offline');
      }
    }

    checkBackend();
    const interval = setInterval(checkBackend, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Workflow Handlers
  const handleTaskAssigned = useCallback((task) => {
    if (task) {
      setSelectedTask(task);
    }
    triggerDataRefresh();
  }, [triggerDataRefresh]);

  const handleFeedbackSubmitted = useCallback(() => {
    triggerDataRefresh();
  }, [triggerDataRefresh]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Sticky Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendStatus={backendStatus}
      />

      {/* Main Content Area with fluid responsive container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 transition-all">
        {activeTab === 'dashboard' && (
          <Dashboard
            setActiveTab={setActiveTab}
            setSelectedTask={setSelectedTask}
            refreshKey={refreshKey}
          />
        )}

        {activeTab === 'team' && (
          <Team
            setActiveTab={setActiveTab}
            refreshKey={refreshKey}
          />
        )}

        {activeTab === 'create-task' && (
          <CreateTask
            setActiveTab={setActiveTab}
            setRecommendationResult={setRecommendationResult}
            setAnalyzedTask={setAnalyzedTask}
            setSelectedTask={setSelectedTask}
          />
        )}

        {activeTab === 'recommendation' && (
          <Recommendation
            recommendationResult={recommendationResult}
            analyzedTask={analyzedTask}
            setActiveTab={setActiveTab}
            setSelectedTask={setSelectedTask}
            onTaskAssigned={handleTaskAssigned}
          />
        )}

        {activeTab === 'feedback' && (
          <Feedback
            selectedTask={selectedTask}
            setActiveTab={setActiveTab}
            onFeedbackSubmitted={handleFeedbackSubmitted}
            refreshKey={refreshKey}
          />
        )}
      </main>

      {/* Responsive Professional Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">AI Task Delegator</span>
            <span>•</span>
            <span>Adaptive Team Task Assignment System</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>FastAPI + Continual Learning EMA</span>
            <span>•</span>
            <span className="text-emerald-600 font-semibold">Hackathon Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
