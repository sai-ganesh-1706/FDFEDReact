import React, { useEffect, useState } from 'react';
import {
  Megaphone, Plus, Clock, CheckCircle, Info, AlertTriangle,
  X, RefreshCw, XCircle
} from 'lucide-react';
import { usePlatformData } from '../../../shared/context/PlatformDataContext.jsx';
import { errorMessage } from '../../../services/api.js';

const TYPE_OPTIONS = [
  { value: 'general',   label: 'General',     color: '#0ea5e9' },
  { value: 'urgent',    label: 'Urgent',       color: '#ef4444' },
  { value: 'placement', label: 'Placement',    color: '#a855f7' },
  { value: 'event',     label: 'Event',        color: '#22c55e' },
];

const TYPE_ICON = {
  general:   { icon: Info,          color: '#0ea5e9', bg: '#f0f9ff' },
  urgent:    { icon: AlertTriangle, color: '#ef4444', bg: '#fff5f5' },
  placement: { icon: CheckCircle,   color: '#a855f7', bg: '#fdf4ff' },
  event:     { icon: CheckCircle,   color: '#22c55e', bg: '#f0fdf4' },
  // legacy fallbacks
  info:      { icon: Info,          color: '#0ea5e9', bg: '#f0f9ff' },
  alert:     { icon: AlertTriangle, color: '#f59e0b', bg: '#fffbeb' },
  success:   { icon: CheckCircle,   color: '#22c55e', bg: '#f0fdf4' },
};

function AddAnnouncementModal({ onClose, onSave }) {
  const [form, setForm]     = useState({ title: '', message: '', type: 'general' });
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setError('');
    if (!form.title.trim() || !form.message.trim()) {
      setError('Title and message are required.');
      return;
    }
    setSaving(true);
    try {
      await onSave({ title: form.title.trim(), message: form.message.trim(), type: form.type });
      onClose();
    } catch (e) {
      setError(errorMessage(e, 'Could not post announcement.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop open">
      <div className="modal">
        <h3><Megaphone size={18} color="#f59e0b" /> New Announcement</h3>
        <div className="form-group">
          <label>Type</label>
          <div className="type-pill-row">
            {TYPE_OPTIONS.map(t => (
              <button
                key={t.value}
                className={`type-pill-btn ${form.type === t.value ? 'selected' : ''}`}
                style={form.type === t.value ? { borderColor: t.color, color: t.color, background: t.color + '18' } : {}}
                onClick={() => set('type', t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label>Title *</label>
          <input
            placeholder="e.g. Campus Drive by Infosys on Nov 5"
            value={form.title}
            onChange={e => set('title', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Message *</label>
          <textarea
            rows={4}
            placeholder="Write the details here..."
            value={form.message}
            onChange={e => set('message', e.target.value)}
            style={{ width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>
        {error && <p className="form-error"><XCircle size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />{error}</p>}
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving
              ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Posting…</>
              : <><Megaphone size={14} /> Post Announcement</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Announcements({ collegeName }) {
  const { getAnnouncements, postAnnouncement, deleteAnnouncement } = usePlatformData();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [err, setErr]                     = useState('');
  const [showAdd, setShowAdd]             = useState(false);

  const load = () => {
    setLoading(true);
    setErr('');
    getAnnouncements()
      .then(res  => setAnnouncements(res.data || []))
      .catch(e   => setErr(errorMessage(e, 'Could not load announcements.')))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSave = async (payload) => {
    await postAnnouncement(payload);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this announcement?')) return;
    try {
      await deleteAnnouncement(id);
      load();
    } catch (e) {
      alert(errorMessage(e, 'Could not remove announcement.'));
    }
  };

  return (
    <>
      <div className="section-header">
        <h2>Announcements — <span style={{ color: '#0ea5e9' }}>{collegeName || 'Your College'}</span></h2>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={15} /> Post Announcement
        </button>
      </div>

      <div className="ann-info-bar">
        <Megaphone size={14} color="#0ea5e9" />
        Announcements notify all placement officers in your college.
        <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={load} disabled={loading}>
          <RefreshCw size={12} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {loading && (
        <div className="empty-state">
          <RefreshCw style={{ animation: 'spin 1s linear infinite', opacity: 0.4 }} />
          <p>Loading announcements…</p>
        </div>
      )}

      {!loading && err && (
        <div className="alerts-panel">
          <div className="alerts-panel-header">
            <AlertTriangle size={14} color="#f59e0b" /> Could not load
          </div>
          <div className="alert-item">
            <div className="alert-item-text">
              <strong>{err}</strong>
              <span>Backend needs GET /announcements and POST /announcements endpoints.</span>
            </div>
          </div>
        </div>
      )}

      {!loading && !err && announcements.length === 0 && (
        <div className="empty-state">
          <Megaphone />
          <p>No announcements yet. Post one to notify your placement officers.</p>
        </div>
      )}

      {!loading && !err && announcements.length > 0 && (
        <div className="announcements-list">
          {announcements.map(ann => {
            const { icon: Icon, color, bg } = TYPE_ICON[ann.type] || TYPE_ICON.info;
            return (
              <div key={ann.id} className="ann-card" style={{ borderLeft: `4px solid ${color}` }}>
                <div className="ann-card-header">
                  <div className="ann-icon-wrap" style={{ background: bg }}>
                    <Icon size={16} color={color} />
                  </div>
                  <div className="ann-card-meta">
                    <strong className="ann-card-title">{ann.title}</strong>
                    <span className="ann-card-time">
                      <Clock size={11} />
                      {ann.postedAt ? new Date(ann.postedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'} · by {ann.author || ann.postedBy || 'College Admin'}
                    </span>
                  </div>
                  <button
                    className="btn-icon-ghost"
                    title="Remove"
                    onClick={() => handleDelete(ann.id)}
                  >
                    <X size={15} color="#94a3b8" />
                  </button>
                </div>
                <p className="ann-card-body">{ann.message}</p>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && (
        <AddAnnouncementModal onClose={() => setShowAdd(false)} onSave={handleSave} />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
