'use client';

// Round 2 — built from a precise spec: controlled form, validation in a pure
// function (validate.ts) with tests, visible labels, errors announced to
// assistive technology, example behaviour specified up front.

import { useState } from 'react';
import {
  validateSettings,
  isValid,
  type SettingsValues,
  type SettingsErrors,
} from './validate';

const initialValues: SettingsValues = {
  fullName: '',
  email: '',
  username: '',
  bio: '',
  emailNotifications: true,
};

type FieldId = 'fullName' | 'email' | 'username' | 'bio';

export default function SettingsForm() {
  const [values, setValues] = useState<SettingsValues>(initialValues);
  const [errors, setErrors] = useState<SettingsErrors>({});
  const [saved, setSaved] = useState(false);

  function update<K extends keyof SettingsValues>(key: K, value: SettingsValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setSaved(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = validateSettings(values);
    setErrors(next);
    setSaved(isValid(next));
  }

  function errorText(id: FieldId) {
    return errors[id] ? (
      <p id={`${id}-error`} role="alert" style={{ color: '#b91c1c', margin: '4px 0 0' }}>
        {errors[id]}
      </p>
    ) : null;
  }

  const inputStyle = { display: 'block', width: '100%', padding: 8 } as const;
  const blockStyle = { marginBottom: 14 } as const;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{ maxWidth: 420, margin: '2rem auto', fontFamily: 'sans-serif' }}
    >
      <h2>Settings</h2>

      <div style={blockStyle}>
        <label htmlFor="fullName">Full name</label>
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          value={values.fullName}
          onChange={(e) => update('fullName', e.target.value)}
          aria-invalid={!!errors.fullName}
          aria-describedby={errors.fullName ? 'fullName-error' : undefined}
          style={inputStyle}
        />
        {errorText('fullName')}
      </div>

      <div style={blockStyle}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => update('email', e.target.value)}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          style={inputStyle}
        />
        {errorText('email')}
      </div>

      <div style={blockStyle}>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          value={values.username}
          onChange={(e) => update('username', e.target.value)}
          aria-invalid={!!errors.username}
          aria-describedby={errors.username ? 'username-error' : 'username-hint'}
          style={inputStyle}
        />
        {errors.username ? (
          errorText('username')
        ) : (
          <p id="username-hint" style={{ color: '#555', margin: '4px 0 0' }}>
            3–20 characters: lowercase letters, numbers, underscores.
          </p>
        )}
      </div>

      <div style={blockStyle}>
        <label htmlFor="bio">Bio (optional)</label>
        <textarea
          id="bio"
          rows={3}
          maxLength={160}
          value={values.bio}
          onChange={(e) => update('bio', e.target.value)}
          aria-invalid={!!errors.bio}
          aria-describedby={errors.bio ? 'bio-error' : 'bio-count'}
          style={inputStyle}
        />
        {errors.bio ? (
          errorText('bio')
        ) : (
          <p id="bio-count" style={{ color: '#555', margin: '4px 0 0' }}>
            {values.bio.length}/160
          </p>
        )}
      </div>

      <div style={blockStyle}>
        <label htmlFor="emailNotifications">
          <input
            id="emailNotifications"
            type="checkbox"
            checked={values.emailNotifications}
            onChange={(e) => update('emailNotifications', e.target.checked)}
          />{' '}
          Email notifications
        </label>
      </div>

      <button type="submit" style={{ padding: '8px 16px' }}>
        Save settings
      </button>

      {saved && (
        <p role="status" style={{ color: '#15803d' }}>
          Settings saved.
        </p>
      )}
    </form>
  );
}
