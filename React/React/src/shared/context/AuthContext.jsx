import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { clearSession, readSession } from '../../services/api.js';

const AuthContext = createContext(null);

const ROLE_HOME = {
  candidate: '/candidate',
  alumni: '/alumni',
  recruiter: '/recruiter',
  placement_officer: '/placement',
  college_admin: '/college-admin',
  super_admin: '/super-admin',
};

const PROTECTED_PATH_PREFIXES = ['/candidate', '/alumni', '/recruiter', '/placement', '/college-admin', '/super-admin'];

function isProtectedPath(pathname) {
  return PROTECTED_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession);

  // A browser profile can have only one active CareerNest account. Without
  // this listener, an officer screen left open in one tab could keep rendering
  // after another tab signs in as a candidate, while API calls use the newer
  // candidate session. Keep every tab's UI aligned with its request headers.
  useEffect(() => {
    const syncSession = (event) => {
      if (event.key === 'loggedInUser' || event.key === null) setUser(readSession());
    };
    window.addEventListener('storage', syncSession);
    return () => window.removeEventListener('storage', syncSession);
  }, []);

  // Browsers may restore a page from their back/forward cache without remounting
  // the route. Re-check storage on history navigation so a signed-out user can
  // never view a previously rendered portal screen.
  useEffect(() => {
    const enforceAuthentication = () => {
      if (!readSession()?.accessToken && isProtectedPath(window.location.pathname)) {
        window.location.replace('/login');
      }
    };
    window.addEventListener('pageshow', enforceAuthentication);
    window.addEventListener('popstate', enforceAuthentication);
    return () => {
      window.removeEventListener('pageshow', enforceAuthentication);
      window.removeEventListener('popstate', enforceAuthentication);
    };
  }, []);

  const login = (userData) => {
    localStorage.setItem('loggedInUser', JSON.stringify(userData));
    localStorage.setItem('userRole', userData.role);
    localStorage.setItem('userId', String(userData.id));
    localStorage.setItem('userName', userData.name || '');
    localStorage.setItem('userEmail', userData.email || '');
    localStorage.setItem('collegeId', userData.collegeId != null ? String(userData.collegeId) : 'null');
    localStorage.setItem('accessToken', userData.accessToken || '');
    setUser(userData);
  };

  const logout = () => {
    clearSession();
    setUser(null);
    window.location.replace('/login');
  };

  const value = useMemo(
    () => ({ user, role: user?.role ?? null, login, logout, roleHome: user ? ROLE_HOME[user.role] : null }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { ROLE_HOME };
