import axios from 'axios';
import { NAVIGATION_STATE_KEYS } from '../shared/utils/navigationState.js';

// Single axios instance shared by every role. The backend identifies the caller
// through the x-role / x-user-id / x-college-id headers, so they are attached
// here from the stored session on every request.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

const SESSION_KEYS = ['loggedInUser', 'userRole', 'userId', 'userName', 'userEmail', 'collegeId', 'accessToken'];

export function readSession() {
  try {
    const raw = localStorage.getItem('loggedInUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
  try {
    NAVIGATION_STATE_KEYS.forEach((key) => sessionStorage.removeItem(key));
    sessionStorage.removeItem('cn_login_notice');
  } catch {
    // Storage can be blocked; localStorage removal above remains the auth boundary.
  }
}

api.interceptors.request.use((config) => {
  const user = readSession();
  const accessToken = user?.accessToken || localStorage.getItem('accessToken');
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  if (user) {
    config.headers['x-user-id'] = String(user.id);
    config.headers['x-role'] = user.role;
    config.headers['x-college-id'] = user.collegeId != null ? String(user.collegeId) : 'null';
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Login and a wrong current password use 401 for credential validation;
    // every other 401 represents a missing, invalid, or expired session.
    const url = error.config?.url || '';
    const message = error.response?.data?.message;
    const passwordMismatch = url.endsWith('/password') && /current password/i.test(
      Array.isArray(message) ? message.join(' ') : String(message || '')
    );
    if (error.response?.status === 401 && !url.includes('/users/login') && !passwordMismatch) {
      clearSession();
      try { sessionStorage.setItem('cn_login_notice', Array.isArray(message) ? message[0] : (message || 'Your session has ended. Please sign in again.')); } catch { /* ignore */ }
      window.location.replace('/login');
    }
    return Promise.reject(error);
  }
);

/** Turn an axios error into a readable message. */
export function errorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const message = error?.response?.data?.message;
  if (Array.isArray(message)) return message.join(', ');
  if (message) return message;
  if (!error?.response) return 'Cannot reach the server. Make sure the backend is running.';
  return fallback;
}

export default api;
