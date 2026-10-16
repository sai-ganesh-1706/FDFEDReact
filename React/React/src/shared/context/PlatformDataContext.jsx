import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../../services/api.js';
import { useAuth } from './AuthContext.jsx';

const PlatformDataContext = createContext(null);

const EMPTY = {
  colleges: [],
  officersByCollege: {},
  studentsByCollege: {},
  alumniByCollege: {},
  recruitersByCollege: {},
  applicationsByCollege: {},
};

export function PlatformDataProvider({ children }) {
  const { user } = useAuth();
  const [data, setData]       = useState(EMPTY);
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const role      = user?.role;
  const collegeId = user?.collegeId;

  const refresh = useCallback(async () => {
    if (role === 'super_admin') {
      const [colleges, platformStats] = await Promise.all([
        api.get('/super-admin/colleges'),
        api.get('/super-admin/stats'),
      ]);

      const collegeList = colleges.data || [];

      // Fetch all placement officers so the SA can see per-college officer counts
      // and drill into officer lists. Falls back gracefully if the endpoint is
      // scoped only to college_admin (some backends restrict it).
      let officersByCollege = {};
      try {
        const res = await api.get('/users', { params: { role: 'placement_officer' } });
        (res.data || []).forEach(o => {
          const cid = o.collegeId;
          if (cid != null) {
            if (!officersByCollege[cid]) officersByCollege[cid] = [];
            officersByCollege[cid].push(o);
          }
        });
      } catch {
        // Backend scopes this endpoint — officer counts fall back to college.stats
      }

      setData({ ...EMPTY, colleges: collegeList, officersByCollege });
      setStats(platformStats.data);

    } else if (role === 'college_admin' && collegeId != null) {
      const [college, officers, students, alumni, recruiters, applications] = await Promise.all([
        api.get(`/colleges/${collegeId}`),
        api.get('/users', { params: { role: 'placement_officer' } }),
        api.get('/users', { params: { role: 'candidate' } }),
        api.get('/users', { params: { role: 'alumni' } }),
        api.get('/users', { params: { role: 'recruiter' } }),
        // The dashboard can still load if applications are temporarily unavailable.
        api.get('/applications').catch(() => ({ data: [] })),
      ]);
      setData({
        colleges: [college.data],
        officersByCollege:   { [collegeId]: officers.data },
        studentsByCollege:   { [collegeId]: students.data },
        alumniByCollege:     { [collegeId]: alumni.data },
        recruitersByCollege: { [collegeId]: recruiters.data },
        applicationsByCollege: { [collegeId]: applications.data },
      });
    }
  }, [role, collegeId]);

  useEffect(() => {
    if (role !== 'super_admin' && role !== 'college_admin') {
      setData(EMPTY);
      setStats(null);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    refresh()
      .catch(() => { if (!cancelled) setError('Could not load data from the server.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [role, refresh]);

  // Run a write, then reload so every dashboard shows the server's truth.
  const mutate = useCallback(async (request) => {
    const result = await request();
    await refresh();
    return result;
  }, [refresh]);

  const actions = useMemo(() => ({
    // Super admin
    addCollege:       (payload)         => mutate(() => api.post('/super-admin/colleges', payload)),
    setCollegeStatus: (id, status)      => mutate(() => api.patch(`/super-admin/colleges/${id}/status`, { status })),
    assignAdmin:      (id, payload)     => mutate(() => api.post(`/super-admin/colleges/${id}/admin`, payload)),
    setAdminStatus:   (id, status)      => mutate(() => api.patch(`/super-admin/colleges/${id}/admin/status`, { status })),

    // Messaging — returns the API promise directly (no data refresh needed)
    sendMessage:      (payload)         => api.post('/super-admin/messages', payload),
    getSentMessages:  ()                => api.get('/super-admin/messages'),

    // Activity log
    getActivityLog:   ()                => api.get('/super-admin/activity'),

    // College admin
    addOfficer:       (payload)         => mutate(() => api.post('/users', { ...payload, role: 'placement_officer', collegeId: Number(collegeId) })),
    removeUser:       (id)              => mutate(() => api.delete(`/users/${id}`)),
    setStudentsStatus:(ids, status)     => mutate(() => Promise.all(ids.map(id => api.put(`/users/${id}`, { status })))),
    setUserStatus:    (id, status)      => mutate(() => api.put(`/users/${id}`, { status })),

    // Announcements
    getAnnouncements: ()                => api.get('/announcements'),
    postAnnouncement: (payload)         => api.post('/announcements', payload),
    deleteAnnouncement:(id)             => api.delete(`/announcements/${id}`),
  }), [mutate, collegeId]);

  const value = useMemo(
    () => ({ data, stats, loading, error, refresh, ...actions }),
    [data, stats, loading, error, refresh, actions]
  );

  return <PlatformDataContext.Provider value={value}>{children}</PlatformDataContext.Provider>;
}

export function usePlatformData() {
  const context = useContext(PlatformDataContext);
  if (!context) throw new Error('usePlatformData must be used within PlatformDataProvider');
  return context;
}
