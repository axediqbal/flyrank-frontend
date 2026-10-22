'use client';

// Contact form — a real feature since Week 6: on submit, the message is
// POSTed to /api/contact, which validates it again and stores it in
// Ahmed's Supabase project (see the route handler for the data flow).
// The form follows the CLAUDE.md rules from the FE-03 drill: controlled
// inputs, validation in a pure function (src/lib/contact.ts), labels on
// every field, errors announced with role="alert", success with
// role="status". Sending/success/failure are distinct states; a failed
// send keeps the visitor's text and offers the email fallback.

import { useState } from 'react';
import {
  validateContact,
  type ContactErrors,
  type ContactValues,
} from '@/lib/contact';

export { validateContact } from '@/lib/contact';

type SendState = 'idle' | 'sending' | 'sent' | 'failed';

export default function ContactForm() {
  const [values, setValues] = useState<ContactValues>({
    name: '',
    email: '',
    message: '',
  });
  const [company, setCompany] = useState(''); // honeypot — humans never fill this
  const [errors, setErrors] = useState<ContactErrors>({});
  const [sendState, setSendState] = useState<SendState>('idle');

  function update<K extends keyof ContactValues>(key: K, value: ContactValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    if (sendState === 'sent' || sendState === 'failed') setSendState('idle');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = validateContact(values);
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSendState('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, company }),
      });
      if (!res.ok) throw new Error('send failed');
      setSendState('sent');
      setValues({ name: '', email: '', message: '' });
    } catch {
      setSendState('failed');
    }
  }

  const field =
    'w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-base outline-none transition-shadow placeholder:text-neutral-400 focus:border-accent focus:ring-2 focus:ring-accent/30';
  const label = 'mb-1.5 block text-sm font-medium text-coal';

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-4">
      <div>
        <label htmlFor="c-name" className={label}>
          Your name
        </label>
        <input
          id="c-name"
          className={field}
          autoComplete="name"
          value={values.name}
          onChange={(e) => update('name', e.target.value)}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'c-name-error' : undefined}
        />
        {errors.name && (
          <p id="c-name-error" role="alert" className="mt-1 text-sm text-red-700">
            {errors.name}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="c-email" className={label}>
          Your email
        </label>
        <input
          id="c-email"
          type="email"
          className={field}
          autoComplete="email"
          value={values.email}
          onChange={(e) => update('email', e.target.value)}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'c-email-error' : undefined}
        />
        {errors.email && (
          <p id="c-email-error" role="alert" className="mt-1 text-sm text-red-700">
            {errors.email}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="c-message" className={label}>
          About your project
        </label>
        <textarea
          id="c-message"
          rows={4}
          className={field}
          value={values.message}
          onChange={(e) => update('message', e.target.value)}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'c-message-error' : undefined}
        />
        {errors.message && (
          <p id="c-message-error" role="alert" className="mt-1 text-sm text-red-700">
            {errors.message}
          </p>
        )}
      </div>
      {/* Honeypot: hidden from humans, irresistible to bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="c-company">Company (leave empty)</label>
        <input
          id="c-company"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>
      <button
        type="submit"
        disabled={sendState === 'sending'}
        className="rounded-full bg-ink px-6 py-3 font-medium text-paper transition-all hover:-translate-y-0.5 hover:bg-accent disabled:translate-y-0 disabled:opacity-60"
      >
        {sendState === 'sending' ? 'Sending…' : 'Start your project'}
      </button>
      {sendState === 'sent' && (
        <p role="status" className="text-sm text-green-700">
          Message sent — it is in my system now, and I reply to your email
          from there. Thank you.
        </p>
      )}
      {sendState === 'failed' && (
        <p role="alert" className="text-sm text-red-700">
          The message could not be sent — your text is still here, please
          try again. If it keeps failing, email me directly at{' '}
          <a className="underline" href="mailto:ahmediqbal2003f9@gmail.com">
            ahmediqbal2003f9@gmail.com
          </a>
          .
        </p>
      )}
    </form>
  );
}
