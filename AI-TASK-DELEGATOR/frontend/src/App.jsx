import React, { useState, useEffect } from 'react';
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
  const [recommendationResult, setRecommendationResult] = useState(null);
  const [analyzedTask, setAnalyzedTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    async function checkBackend() {
      try {
        const res = await getHealth();
        if (res && res.status === 'ok') {
          setBackendStatus('online');
        } else {
          setBackendStatus('offline');
        }
      } catch {
        setBackendStatus('offline');
      }
    }
    checkBackend();
    const interval = setInterval(checkBackend, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendStatus={backendStatus}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            setActiveTab={setActiveTab}
            setSelectedTask={setSelectedTask}
          />
        )}

        {activeTab === 'team' && (
          <Team />
        )}

        {activeTab === 'create-task' && (
          <CreateTask
            setActiveTab={setActiveTab}
            setRecommendationResult={setRecommendationResult}
            setAnalyzedTask={setAnalyzedTask}
          />
        )}

        {activeTab === 'recommendation' && (
          <Recommendation
            recommendationResult={recommendationResult}
            analyzedTask={analyzedTask}
            setActiveTab={setActiveTab}
            setSelectedTask={setSelectedTask}
          />
        )}

        {activeTab === 'feedback' && (
          <Feedback
            selectedTask={selectedTask}
            setActiveTab={setActiveTab}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          AI Task Delegator — Adaptive Team Assignment System &copy; 2026. Built for 10-Hour Hackathon.
        </div>
      </footer>
    </div>
  );
}
