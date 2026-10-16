import React, { useEffect, useState } from 'react';
import { Activity, Clock, AlertTriangle, RefreshCw, Building2, UserCog, MessageSquare, Settings, Users, Briefcase, FileText, HeartHandshake, Bell, LogIn } from 'lucide-react';
import { usePlatformData } from '../../../shared/context/PlatformDataContext.jsx';
import { errorMessage } from '../../../services/api.js';

const TYPE_CONFIG = {
  college: { icon: Building2,    color: '#7c3aed', bg: '#f5f3ff' },
  admin:   { icon: UserCog,      color: '#0ea5e9', bg: '#f0f9ff' },
  message: { icon: MessageSquare,color: '#a855f7', bg: '#fdf4ff' },
  system:  { icon: Settings,     color: '#64748b', bg: '#f8fafc' },
  user:        { icon: Users,          color: '#059669', bg: '#ecfdf5' },
  opportunity: { icon: Briefcase,      color: '#d97706', bg: '#fffbeb' },
  application: { icon: FileText,       color: '#2563eb', bg: '#eff6ff' },
  referral:    { icon: HeartHandshake, color: '#db2777', bg: '#fdf2f8' },
  recruiter:   { icon: Briefcase,      color: '#7c3aed', bg: '#f5f3ff' },
  notification:{ icon: Bell,           color: '#0891b2', bg: '#ecfeff' },
  login:       { icon: LogIn,          color: '#64748b', bg: '#f1f5f9' },
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'college', label: 'Colleges' },
  { key: 'admin', label: 'Admins' },
  { key: 'message', label: 'Messages' },
  { key: 'user', label: 'Users' },
  { key: 'opportunity', label: 'Opportunities' },
  { key: 'application', label: 'Applications' },
  { key: 'referral', label: 'Referrals' },
  { key: 'recruiter', label: 'Recruiters' },
  { key: 'notification', label: 'Notices' },
  { key: 'login', label: 'Sign-ins' },
];

export default function ActivityLog() {
  const { getActivityLog } = usePlatformData();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState('');
  const [filter, setFilter]   = useState('all');
  const { data: platformData } = usePlatformData();
  const collegeName = (id) => (platformData?.colleges || []).find((c) => c.id === id)?.name;
  const shown = entries.filter((e) => filter === 'all' || e.type === filter);

  const load = () => {
    setLoading(true);
    setErr('');
    getActivityLog()
      .then(res  => setEntries(res.data || []))
      .catch(e   => setErr(errorMessage(e, 'Could not load the activity log.')))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <>
      <div className="section-header">
        <h2>Platform Activity Log</h2>
        <button className="btn btn-outline btn-sm" onClick={load} disabled={loading}>
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      <div className="activity-log-info">
        <Activity size={14} color="#7c3aed" />
        Live record of what actually happens on the platform — sign-ins, opportunities, applications, referrals, notifications and admin changes.
      </div>

      {loading && (
        <div className="empty-state" style={{ padding: '40px 0' }}>
          <RefreshCw style={{ animation: 'spin 1s linear infinite', opacity: 0.4 }} />
          <p>Loading activity log…</p>
        </div>
      )}

      {!loading && err && (
        <div className="alerts-panel">
          <div className="alerts-panel-header">
            <AlertTriangle size={16} color="#f59e0b" /> Failed to load
          </div>
          <div className="alert-item">
            <div className="alert-item-text">
              <strong>{err}</strong>
              <span>Make sure the backend exposes GET /super-admin/activity</span>
            </div>
          </div>
        </div>
      )}

      {!loading && !err && entries.length === 0 && (
        <div className="empty-state">
          <Activity />
          <p>Nothing has happened yet. As people use the portal — signing in, posting opportunities, applying, referring — it all shows up here.</p>
        </div>
      )}

      {!loading && !err && entries.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '0 0 14px' }}>
          {FILTERS.filter((f) => f.key === 'all' || entries.some((e) => e.type === f.key)).map((f) => (
            <button
              key={f.key}
              className={`btn btn-sm ${filter === f.key ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}{f.key !== 'all' ? ` (${entries.filter((e) => e.type === f.key).length})` : ` (${entries.length})`}
            </button>
          ))}
        </div>
      )}

      {!loading && !err && entries.length > 0 && shown.length === 0 && (
        <div className="empty-state"><p>No activity of this kind yet.</p></div>
      )}

      {!loading && !err && shown.length > 0 && (
        <div className="activity-timeline">
          {shown.map((item, idx) => {
            const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.system;
            const Icon = cfg.icon;
            const ts = item.timestamp || item.time || item.createdAt;
            const formatted = ts
              ? new Date(ts).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
              : '—';
            return (
              <div key={item.id ?? idx} className="activity-entry">
                <div className="activity-icon-wrap" style={{ borderColor: cfg.color, background: cfg.bg }}>
                  <Icon size={14} color={cfg.color} />
                </div>
                <div className="activity-entry-body">
                  <div className="activity-entry-action">
                    <span className="activity-type-label" style={{ color: cfg.color }}>
                      {item.action || item.type}
                    </span>
                    <span className="activity-time">
                      <Clock size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                      {formatted}
                    </span>
                  </div>
                  <div className="activity-target">{item.detail || item.description || item.target || '—'}</div>
                  {item.actor && (
                    <div className="activity-actor">
                      by {item.actor}{item.actorRole ? ` (${item.actorRole.replace('_', ' ')})` : ''}
                      {item.collegeId ? ` · ${collegeName(item.collegeId) || `College #${item.collegeId}`}` : ''}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
