export type LeadStatus = 'new' | 'contacted' | 'replied' | 'call' | 'closed';

export const LEAD_STATUSES: LeadStatus[] = [
  'new',
  'contacted',
  'replied',
  'call',
  'closed',
];

export interface Lead {
  id: string;
  business: string;
  contact: string;
  channel: string;
  status: LeadStatus;
  /** ISO date string (yyyy-mm-dd or full ISO). */
  addedAt: string;
  note: string;
}
