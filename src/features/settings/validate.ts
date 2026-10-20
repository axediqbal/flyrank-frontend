export interface SettingsValues {
  fullName: string;
  email: string;
  username: string;
  bio: string;
  emailNotifications: boolean;
}

export type SettingsErrors = Partial<
  Record<'fullName' | 'email' | 'username' | 'bio', string>
>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-z0-9_]+$/;

export function validateSettings(values: SettingsValues): SettingsErrors {
  const errors: SettingsErrors = {};

  const fullName = values.fullName.trim();
  if (!fullName) {
    errors.fullName = 'Full name is required.';
  } else if (fullName.length < 2 || fullName.length > 60) {
    errors.fullName = 'Full name must be between 2 and 60 characters.';
  }

  const email = values.email.trim();
  if (!email) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_RE.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  const username = values.username.trim();
  if (!username) {
    errors.username = 'Username is required.';
  } else if (username.length < 3 || username.length > 20) {
    errors.username = 'Username must be between 3 and 20 characters.';
  } else if (!USERNAME_RE.test(username)) {
    errors.username = 'Use lowercase letters, numbers and underscores only.';
  }

  if (values.bio.length > 160) {
    errors.bio = 'Bio must be 160 characters or fewer.';
  }

  return errors;
}

export function isValid(errors: SettingsErrors): boolean {
  return Object.keys(errors).length === 0;
}
