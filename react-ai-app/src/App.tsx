// Pass 2 — manual review pass over the AI-generated single component.
// Refactored into components + a storage lib; corrections documented in
// DEVELOPMENT.md and in the git history (compare with the pass-1 commit).

import { useEffect, useMemo, useState } from 'react';
import LeadForm from './components/LeadForm';
import LeadList from './components/LeadList';
import StatsBar from './components/StatsBar';
import { loadLeads, saveLeads } from './lib/storage';
import { LEAD_STATUSES, type Lead, type LeadStatus } from './types';

export default function App() {
  const [leads, setLeads] = useState<Lead[]>(loadLeads);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LeadStatus>('all');

  useEffect(() => {
    saveLeads(leads);
  }, [leads]);

  const visible = useMemo(
    () =>
      leads.filter(
        (l) =>
          (statusFilter === 'all' || l.status === statusFilter) &&
          l.business.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [leads, search, statusFilter],
  );

  return (
    <div className="app">
      <header>
        <h1>Outreach Tracker</h1>
        <p>Freelance client outreach — every lead, one pipeline.</p>
      </header>

      <StatsBar leads={leads} />
      <LeadForm onAdd={(lead) => setLeads((ls) => [lead, ...ls])} />

      <div className="toolbar">
        <input
          placeholder="Search businesses"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search businesses"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | LeadStatus)}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === 'call' ? 'Call booked' : s[0].toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <LeadList
        leads={visible}
        onStatus={(id, status) =>
          setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)))
        }
        onRemove={(id) => setLeads((ls) => ls.filter((l) => l.id !== id))}
      />
    </div>
  );
}
