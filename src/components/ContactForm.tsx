'use client';

// Contact form — follows the CLAUDE.md rules from the FE-03 drill:
// controlled inputs, validation in a pure function, labels on every field,
// errors announced with role="alert", success with role="status".

import { useState } from 'react';

interface ContactValues {
  name: string;
  email: string;
  message: string;
}

type ContactErrors = Partial<Record<keyof ContactValues, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  if (!values.name.trim()) errors.name = 'Your name is required.';
  if (!values.email.trim()) errors.email = 'Your email is required.';
  else if (!EMAIL_RE.test(values.email.trim()))
    errors.email = 'Enter a valid email address.';
  if (values.message.trim().length < 10)
    errors.message = 'Tell me a little about the project (10+ characters).';
  return errors;
}

export default function ContactForm() {
  const [values, setValues] = useState<ContactValues>({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [sent, setSent] = useState(false);

  function update<K extends keyof ContactValues>(key: K, value: ContactValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setSent(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = validateContact(values);
    setErrors(next);
    setSent(Object.keys(next).length === 0);
  }

  const field =
    'w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 outline-none transition-shadow placeholder:text-neutral-400 focus:border-accent focus:ring-2 focus:ring-accent/30';
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
      <button
        type="submit"
        className="rounded-full bg-ink px-6 py-3 font-medium text-paper transition-all hover:-translate-y-0.5 hover:bg-accent"
      >
        Start your project
      </button>
      {sent && (
        <p role="status" className="text-sm text-green-700">
          Thanks — your message is noted. (Skeleton build: delivery wiring lands
          in a later week.)
        </p>
      )}
    </form>
  );
}
