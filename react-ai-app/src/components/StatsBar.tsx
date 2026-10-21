import { LEAD_STATUSES, type Lead } from '../types';

export default function StatsBar({ leads }: { leads: Lead[] }) {
  const counts = new Map<string, number>();
  for (const lead of leads) {
    counts.set(lead.status, (counts.get(lead.status) ?? 0) + 1);
  }
  return (
    <div className="stats" aria-label="Pipeline summary">
      <div className="stat">
        <b>{leads.length}</b>
        <span>Total leads</span>
      </div>
      {LEAD_STATUSES.map((status) => (
        <div className="stat" key={status}>
          <b>{counts.get(status) ?? 0}</b>
          <span>{status}</span>
        </div>
      ))}
    </div>
  );
}
