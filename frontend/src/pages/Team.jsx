import React, { useEffect, useState, useMemo } from 'react';
import { getEmployees } from '../services/api';
import EmployeeCard from '../components/EmployeeCard';
import { EmployeeCardSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

export default function Team({ refreshKey = 0 }) {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [filterAvailable, setFilterAvailable] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEmployees() {
      try {
        setLoading(true);
        const data = await getEmployees();
        if (data && Array.isArray(data)) {
          setEmployees(data);
        }
      } catch (err) {
        console.error('Failed to load employees:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEmployees();
  }, [refreshKey]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const nameMatch = (emp.name || '').toLowerCase().includes(search.toLowerCase());
      const skillMatch = Object.keys(emp.skills || {}).some((s) =>
        s.toLowerCase().includes(search.toLowerCase())
      );
      const matchesSearch = nameMatch || skillMatch;

      if (filterAvailable === 'available') return matchesSearch && emp.available;
      if (filterAvailable === 'busy') return matchesSearch && !emp.available;
      return matchesSearch;
    });
  }, [employees, search, filterAvailable]);

  const totalCount = employees.length;
  const availableCount = employees.filter((e) => e.available).length;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Team Directory</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {availableCount} / {totalCount} Available
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Current employee proficiency scores and real-time workload availability.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search name or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-xl pl-8 pr-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
            <span className="absolute left-2.5 top-2.5 text-slate-400 text-xs">🔍</span>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Availability Filter Dropdown */}
          <select
            value={filterAvailable}
            onChange={(e) => setFilterAvailable(e.target.value)}
            className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700"
          >
            <option value="all">All Members</option>
            <option value="available">Available Only</option>
            <option value="busy">Busy Only</option>
          </select>
        </div>
      </div>

      {/* Employee Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <EmployeeCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredEmployees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEmployees.map((emp) => (
            <EmployeeCard key={emp.id} employee={emp} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Team Members Found"
          description="No employees matched your current search and availability filters."
          icon="👥"
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setFilterAvailable('all');
          }}
        />
      )}
    </div>
  );
}
