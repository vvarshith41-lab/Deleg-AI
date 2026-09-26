import React, { useEffect, useState } from 'react';
import { getEmployees } from '../services/api';
import EmployeeCard from '../components/EmployeeCard';

export default function Team() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [filterAvailable, setFilterAvailable] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEmployees() {
      try {
        setLoading(true);
        const data = await getEmployees();
        setEmployees(data);
      } catch (err) {
        console.error('Failed to load employees:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEmployees();
  }, []);

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      Object.keys(emp.skills || {}).some((s) => s.toLowerCase().includes(search.toLowerCase()));

    if (filterAvailable === 'available') return matchesSearch && emp.available;
    if (filterAvailable === 'busy') return matchesSearch && !emp.available;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team Directory</h1>
          <p className="text-xs text-slate-500">Live employee proficiency scores and availability</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by name or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-60"
          />

          <select
            value={filterAvailable}
            onChange={(e) => setFilterAvailable(e.target.value)}
            className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available Only</option>
            <option value="busy">Busy Only</option>
          </select>
        </div>
      </div>

      {/* Employee Cards Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading team members...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((emp) => (
            <EmployeeCard key={emp.id} employee={emp} />
          ))}
        </div>
      )}
    </div>
  );
}
