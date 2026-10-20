import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateSettings,
  isValid,
  type SettingsValues,
} from './validate.ts';

const valid: SettingsValues = {
  fullName: 'Ahmed Iqbal',
  email: 'ahmed@example.com',
  username: 'ahmed_iqbal',
  bio: 'Frontend intern & AI builder.',
  emailNotifications: true,
};

test('valid values produce no errors', () => {
  const errors = validateSettings(valid);
  assert.deepEqual(errors, {});
  assert.equal(isValid(errors), true);
});

test('empty full name is rejected', () => {
  const errors = validateSettings({ ...valid, fullName: '   ' });
  assert.match(errors.fullName ?? '', /required/);
  assert.equal(isValid(errors), false);
});

test('one-character full name is rejected', () => {
  const errors = validateSettings({ ...valid, fullName: 'A' });
  assert.match(errors.fullName ?? '', /between 2 and 60/);
});

test('malformed emails are rejected', () => {
  for (const email of ['ahmed@', 'ahmed.example.com', 'a b@c.com', '@x.com']) {
    const errors = validateSettings({ ...valid, email });
    assert.match(errors.email ?? '', /valid email/, `email: ${email}`);
  }
});

test('empty email is rejected as required, not malformed', () => {
  const errors = validateSettings({ ...valid, email: '' });
  assert.match(errors.email ?? '', /required/);
});

test('username shorter than 3 characters is rejected', () => {
  const errors = validateSettings({ ...valid, username: 'ab' });
  assert.match(errors.username ?? '', /between 3 and 20/);
});

test('username with uppercase or symbols is rejected', () => {
  for (const username of ['Ahmed', 'ah med', 'ahmed!']) {
    const errors = validateSettings({ ...valid, username });
    assert.match(errors.username ?? '', /lowercase/, `username: ${username}`);
  }
});

test('bio of exactly 160 characters passes, 161 fails', () => {
  assert.equal(validateSettings({ ...valid, bio: 'x'.repeat(160) }).bio, undefined);
  assert.match(validateSettings({ ...valid, bio: 'x'.repeat(161) }).bio ?? '', /160/);
});
