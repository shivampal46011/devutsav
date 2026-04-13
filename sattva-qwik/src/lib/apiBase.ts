/**
 * Base URL for API requests (no trailing slash).
 * - Browser: same-origin `/api/...` when PUBLIC_API_URL is unset.
 * - SSR (e.g. Docker web → api): set INTERNAL_API_URL=http://api:5001
 */
export function getApiBase(): string {
  const pub = import.meta.env.PUBLIC_API_URL?.replace(/\/$/, '');
  if (pub) return pub;
  if (typeof window !== 'undefined') return '';
  const internal =
    typeof process !== 'undefined' ? process.env.INTERNAL_API_URL?.replace(/\/$/, '') : undefined;
  return internal || 'http://localhost:5001';
}
