import React, { useState } from 'react';
import StatusBadge from './StatusBadge';

export default function Navbar({ activeTab, setActiveTab, backendStatus = 'checking' }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'team', label: 'Team', icon: '👥' },
    { id: 'create-task', label: 'Create Task', icon: '➕' },
    { id: 'recommendation', label: 'Recommendation', icon: '🎯' },
    { id: 'feedback', label: 'Feedback & Learning', icon: '📈' },
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & App Title */}
          <div
            className="flex items-center space-x-3 cursor-pointer select-none group"
            onClick={() => handleNavClick('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              ⚡
            </div>
            <div>
              <div className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 leading-none">
                AI TASK DELEGATOR
              </div>
              <div className="text-[11px] font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                <span>Adaptive Assignment</span>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-600 font-semibold">SIH 2026</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center space-x-2 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
                  }`}
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action: Backend Status & Mobile Toggle */}
          <div className="flex items-center space-x-2.5">
            <StatusBadge
              type={backendStatus}
              size="sm"
              showDot={true}
              className="hidden sm:inline-flex"
            />

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Tablet Horizontal Scroll Nav (for md to lg screens) */}
        <div className="hidden md:flex lg:hidden overflow-x-auto py-2 space-x-1.5 border-t border-slate-100 no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Menu Dropdown (for small screens < md) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 bg-white px-4 pt-3 pb-4 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="flex justify-between items-center py-1.5 px-2 mb-2 bg-slate-50 rounded-lg">
            <span className="text-xs text-slate-500 font-medium">System Status:</span>
            <StatusBadge type={backendStatus} size="sm" />
          </div>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
