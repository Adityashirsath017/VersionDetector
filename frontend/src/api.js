// API base URL for the backend.
// Leave VITE_API_BASE_URL empty (the default) to call the same origin:
// in development Vite proxies /api to http://localhost:5000 (see vite.config.js).
// Set it to e.g. http://localhost:5000 only when the backend runs on a
// different origin than the frontend.
export const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export function apiUrl(path) {
  return `${API_BASE}${path}`;
}
