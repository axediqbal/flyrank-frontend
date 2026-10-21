// Pass 1 — AI-generated in one prompt ("build a small outreach tracker app in
// React"). Functional, but everything lives in one component and several
// review problems are visible. Pass 2 (see git history + DEVELOPMENT.md)
// refactors and corrects them.

import { useEffect, useState } from 'react';

type Lead = {
  business: string;
  contact: string;
  channel: string;
  status: string;
  addedAt: string;
  note: string;
};

const SEED: Lead[] = [
  { business: 'Boss Cafe', contact: 'Instagram DM', channel: 'Instagram', status: 'contacted', addedAt: '2026-10-12', note: 'Running ads, bio link broken' },
  { business: 'Activo Fitness', contact: 'WhatsApp', channel: 'WhatsApp', status: 'replied', addedAt: '2026-10-11', note: 'Auto-reply received, waiting on team' },
  { business: 'Black Rock Cafe', contact: 'Instagram DM', channel: 'Instagram', status: 'new', addedAt: '2026-10-11', note: '' },
];

export default function App() {
  const [leads, setLeads] = useState<Lead[]>(() => {
    const raw = localStorage.getItem('leads');
    return raw ? (JSON.parse(raw) as Lead[]) : SEED;
  });
  const [business, setBusiness] = useState('');
  const [contact, setContact] = useState('');
  const [channel, setChannel] = useState('Instagram');
  const [search, setSearch] = useState('');

  useEffect(() => {
    localStorage.setItem('leads', JSON.stringify(leads));
  }, [leads]);

  function addLead(e: React.FormEvent) {
    e.preventDefault();
    setLeads([
      { business, contact, channel, status: 'new', addedAt: new Date().toISOString(), note: '' },
      ...leads,
    ]);
    setBusiness('');
    setContact('');
  }

  function setStatus(i: number, status: string) {
    setLeads(leads.map((l, j) => (j === i ? { ...l, status } : l)));
  }

  function removeLead(i: number) {
    setLeads(leads.filter((_, j) => j !== i));
  }

  const visible = leads.filter((l) =>
    l.business.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="app">
      <header>
        <h1>Outreach Tracker</h1>
        <p>Freelance client outreach — every lead, one pipeline.</p>
      </header>

      <form className="lead-form" onSubmit={addLead}>
        <input placeholder="Business name" value={business} onChange={(e) => setBusiness(e.target.value)} />
        <input placeholder="Contact (e.g. Instagram DM)" value={contact} onChange={(e) => setContact(e.target.value)} />
        <select value={channel} onChange={(e) => setChannel(e.target.value)}>
          <option>Instagram</option>
          <option>WhatsApp</option>
          <option>Email</option>
          <option>Phone</option>
        </select>
        <button type="submit">Add lead</button>
      </form>

      <div className="toolbar">
        <input placeholder="Search businesses" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <ul className="leads">
        {visible.map((lead, i) => (
          <li key={i}>
            <div className="lead-main">
              <b>{lead.business}</b>
              <small>{lead.contact} · {lead.channel} · added {lead.addedAt}</small>
              {lead.note && <small>{lead.note}</small>}
            </div>
            <div className="lead-actions">
              <select value={lead.status} onChange={(e) => setStatus(i, e.target.value)}>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="replied">Replied</option>
                <option value="call">Call booked</option>
                <option value="closed">Closed</option>
              </select>
              <button onClick={() => removeLead(i)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
