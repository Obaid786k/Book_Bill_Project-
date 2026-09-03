import { z } from 'zod';

/**
 * Reusable Zod schema for password creation and resets.
 * Matches standard Supabase Auth password policies:
 * - Minimum 6 characters
 * - At least one lowercase letter (a-z)
 * - At least one uppercase letter (A-Z)
 * - At least one digit (0-9)
 * - At least one special symbol (!@#$%^&*...)
 */
export const passwordSchema = z.string()
  .min(6, 'Password must be at least 6 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter (a-z)')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter (A-Z)')
  .regex(/[0-9]/, 'Password must contain at least one number (0-9)')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character (!@#$%^&*)');

/**
 * Reusable imperative password validator for plain React state or modal forms.
 */
export const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters.' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter (a-z).' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter (A-Z).' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number (0-9).' };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character (!@#$%^&*).' };
  }
  return { isValid: true, error: null };
};
