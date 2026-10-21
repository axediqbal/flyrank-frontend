import { useState } from 'react';
import type { Lead } from '../types';

const CHANNELS = ['Instagram', 'WhatsApp', 'Email', 'Phone'];

export default function LeadForm({
  onAdd,
}: {
  onAdd: (lead: Lead) => void;
}) {
  const [business, setBusiness] = useState('');
  const [contact, setContact] = useState('');
  const [channel, setChannel] = useState(CHANNELS[0]);
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Manual correction (pass 2): pass 1 accepted empty submissions.
    if (!business.trim()) {
      setError('Business name is required.');
      return;
    }
    if (!contact.trim()) {
      setError('Add a contact route (e.g. Instagram DM) so the lead is actionable.');
      return;
    }
    setError('');
    onAdd({
      id: crypto.randomUUID(),
      business: business.trim(),
      contact: contact.trim(),
      channel,
      status: 'new',
      addedAt: new Date().toISOString(),
      note: '',
    });
    setBusiness('');
    setContact('');
  }

  return (
    <form className="lead-form" onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="f-business">Business name</label>
        <input
          id="f-business"
          placeholder="e.g. Boss Cafe"
          value={business}
          onChange={(e) => setBusiness(e.target.value)}
          aria-invalid={!!error}
        />
      </div>
      <div>
        <label htmlFor="f-contact">Contact route</label>
        <input
          id="f-contact"
          placeholder="e.g. Instagram DM"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="f-channel">Channel</label>
        <select
          id="f-channel"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
        >
          {CHANNELS.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit">Add lead</button>
    </form>
  );
}
