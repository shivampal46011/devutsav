/** Server + client: backend origin for API calls */
export function getApiBase(): string {
  return import.meta.env.PUBLIC_API_URL || 'http://localhost:5001';
}
