import { LEAD_STATUSES, type Lead, type LeadStatus } from '../types';

const dateFmt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

/** Manual correction (pass 2): pass 1 printed the raw ISO string. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : dateFmt.format(d);
}

export default function LeadList({
  leads,
  onStatus,
  onRemove,
}: {
  leads: Lead[];
  onStatus: (id: string, status: LeadStatus) => void;
  onRemove: (id: string) => void;
}) {
  if (leads.length === 0) {
    return (
      <div className="empty">
        No leads match. Add one above, or clear the search and filters.
      </div>
    );
  }
  return (
    <ul className="leads">
      {leads.map((lead) => (
        // Manual correction (pass 2): pass 1 keyed rows by array index and
        // updated/deleted by index — with a search filter active, that acted
        // on the WRONG lead. Rows are now keyed and updated by stable id.
        <li key={lead.id}>
          <div className="lead-main">
            <b>{lead.business}</b>
            <small>
              {lead.contact} · {lead.channel} · added {formatDate(lead.addedAt)}
            </small>
            {lead.note && <small>{lead.note}</small>}
          </div>
          <div className="lead-actions">
            <label className="sr-only" htmlFor={`status-${lead.id}`}>
              Status for {lead.business}
            </label>
            <select
              id={`status-${lead.id}`}
              value={lead.status}
              onChange={(e) => onStatus(lead.id, e.target.value as LeadStatus)}
            >
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === 'call' ? 'Call booked' : s[0].toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            <button onClick={() => onRemove(lead.id)}>Delete</button>
          </div>
        </li>
      ))}
    </ul>
  );
}
