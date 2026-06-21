/**
 * Shared, framework-agnostic form validators.
 *
 * Every validator returns an empty string when the value is valid, or a short,
 * human-friendly error message when it isn't. This keeps validation consistent
 * across all the public forms (analyzer, kundali, whisper, horoscope, daily
 * guidance) and makes per-field inline errors trivial to render.
 */

/** Strip everything that isn't a digit. */
export const onlyDigits = (s: string): string => (s || '').replace(/\D/g, '');

/** Normalise an ISD/country code to `+<digits>` (max 4 digits), defaulting to +91. */
export const normalizeIsd = (v: string): string => {
  const digits = onlyDigits(v);
  return digits ? `+${digits.slice(0, 4)}` : '+91';
};

/** Keep only `+` and digits while the user types an ISD code. */
export const sanitizeIsdInput = (v: string): string => {
  let out = (v || '').replace(/[^\d+]/g, '');
  if (!out.startsWith('+')) out = '+' + out.replace(/\+/g, '');
  return out.slice(0, 5);
};

export const validateName = (v: string): string => {
  const t = (v || '').trim();
  if (!t) return 'Please enter your name.';
  if (t.length < 2) return 'Name looks too short.';
  if (t.length > 60) return 'Name is too long.';
  return '';
};

/**
 * Phone validation aware of the country code.
 * - India (+91): exactly 10 digits, starting 6–9.
 * - Otherwise: 6–15 digits.
 */
export const validatePhone = (phone: string, isd = '+91'): string => {
  const d = onlyDigits(phone);
  if (!d) return 'Please enter your phone number.';
  const code = onlyDigits(isd);
  if (code === '91' || !code) {
    if (d.length !== 10) return 'Enter a valid 10-digit mobile number.';
    if (!/^[6-9]/.test(d)) return 'Indian mobile numbers start with 6–9.';
    return '';
  }
  if (d.length < 6 || d.length > 15) return 'Enter a valid phone number.';
  return '';
};

/** Max digit length to allow in a phone input for the given ISD. */
export const phoneMaxLen = (isd = '+91'): number => {
  const code = onlyDigits(isd);
  return code === '91' || !code ? 10 : 15;
};

export const validateEmail = (v: string, required = false): string => {
  const t = (v || '').trim();
  if (!t) return required ? 'Please enter your email.' : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return 'Enter a valid email address.';
  return '';
};

/** Validate a `yyyy-mm-dd` date string from a native date input. */
export const validateDobStr = (v: string): string => {
  if (!v) return 'Please select your date of birth.';
  const dt = new Date(v + 'T00:00:00');
  if (isNaN(dt.getTime())) return 'Enter a valid date.';
  if (dt.getFullYear() < 1900) return 'Enter a year after 1900.';
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  if (dt > now) return 'Date of birth cannot be in the future.';
  return '';
};

/** Validate a date entered as separate year / month / day strings. */
export const validateDobParts = (y: string, m: string, d: string): string => {
  if (!y || !m || !d) return 'Please enter your full date of birth.';
  const yi = parseInt(y, 10), mi = parseInt(m, 10), di = parseInt(d, 10);
  if (isNaN(yi) || isNaN(mi) || isNaN(di)) return 'Enter a valid date.';
  const thisYear = new Date().getFullYear();
  if (yi < 1900 || yi > thisYear) return `Year must be between 1900 and ${thisYear}.`;
  if (mi < 1 || mi > 12) return 'Month must be between 1 and 12.';
  const daysInMonth = new Date(yi, mi, 0).getDate();
  if (di < 1 || di > daysInMonth) return `Day must be between 1 and ${daysInMonth}.`;
  if (new Date(yi, mi - 1, di) > new Date()) return 'Date of birth cannot be in the future.';
  return '';
};

/** True when the object has no non-empty error strings. */
export const isClean = (errors: Record<string, string>): boolean =>
  Object.values(errors).every((e) => !e);
