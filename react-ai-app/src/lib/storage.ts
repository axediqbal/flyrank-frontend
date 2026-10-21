import type { Lead } from '../types';

const KEY = 'outreach-tracker:leads:v1';

const SEED: Lead[] = [
  { id: 'seed-boss-cafe', business: 'Boss Cafe', contact: 'Instagram DM', channel: 'Instagram', status: 'contacted', addedAt: '2026-10-12', note: 'Running ads, bio link broken' },
  { id: 'seed-activo', business: 'Activo Fitness', contact: 'WhatsApp', channel: 'WhatsApp', status: 'replied', addedAt: '2026-10-11', note: 'Auto-reply received, waiting on team' },
  { id: 'seed-black-rock', business: 'Black Rock Cafe', contact: 'Instagram DM', channel: 'Instagram', status: 'new', addedAt: '2026-10-11', note: '' },
];

function isLead(value: unknown): value is Lead {
  if (typeof value !== 'object' || value === null) return false;
  const l = value as Record<string, unknown>;
  return (
    typeof l.id === 'string' &&
    typeof l.business === 'string' &&
    typeof l.status === 'string'
  );
}

/** Load leads from localStorage; corrupt or missing data falls back to seed. */
export function loadLeads(): Lead[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return SEED;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return SEED;
    const leads = parsed.filter(isLead);
    return leads.length > 0 ? leads : SEED;
  } catch {
    return SEED;
  }
}

export function saveLeads(leads: Lead[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(leads));
  } catch {
    // Storage full or blocked (private mode): the app keeps working in memory.
  }
}
