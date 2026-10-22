// Contact form rules — shared by the form component, the /api/contact
// route handler and the tests, so the three can never drift apart.
// (Moved out of the component in Week 6 when the form got a real
// backend; validation stays a pure function, per the CLAUDE.md rules.)

export interface ContactValues {
  name: string;
  email: string;
  message: string;
}

export type ContactErrors = Partial<Record<keyof ContactValues, string>>;

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

// Hard caps the server enforces regardless of what the client sent.
export const CONTACT_LIMITS = { name: 100, email: 200, message: 2000 } as const;
