import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './styles/p1.css';
import api, { errorMessage } from '../../../services/api.js';

const TARGETS = [
  { id: 'students', label: '👩‍🎓 Students' },
  { id: 'alumni', label: '🎓 Alumni' },
  { id: 'recruiters', label: '💼 Recruiters' },
  { id: 'all', label: '🌐 Everyone' }
];

export default function BulkNotify({ onNavigate, activePage = 'bulk-notify' }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetGroup, setTargetGroup] = useState('students');
  const [sending, setSending] = useState(false);
  const [successInfo, setSuccessInfo] = useState('');
  const [sendError, setSendError] = useState('');
  const [formErrors, setFormErrors] = useState({ title: '', message: '' });

  const [history, setHistory] = useState([]);

  const loadHistory = () =>
    api.get('/features/officer/notifications')
      .then(({ data }) => setHistory([...data].sort((x, y) => String(y.sentAt).localeCompare(String(x.sentAt)))))
      .catch((error) => setSendError(errorMessage(error, 'Could not load sent notifications.')));

  useEffect(() => { loadHistory(); }, []);

  const validateForm = () => {
    const errors = { title: '', message: '' };
    let valid = true;
    if (!title.trim()) {
      errors.title = 'Subject / Title is required.';
      valid = false;
    } else if (title.trim().length < 5) {
      errors.title = 'Title must be at least 5 characters.';
      valid = false;
    }
    if (!message.trim()) {
      errors.message = 'Message body is required.';
      valid = false;
    } else if (message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters.';
      valid = false;
    }
    setFormErrors(errors);
    return valid;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSending(true);
    setSendError('');
    try {
      const { data: sent } = await api.post('/features/officer/notifications/bulk', {
        title: title.trim(),
        message: message.trim(),
        targetGroup,
      });
      await loadHistory();
      setSuccessInfo(`Sent to ${sent.recipientCount} recipients at ${new Date().toLocaleTimeString()}`);
      setTitle('');
      setMessage('');
      setFormErrors({ title: '', message: '' });
      setTimeout(() => setSuccessInfo(''), 5000);
    } catch (error) {
      setSendError(errorMessage(error, 'Could not send the notification.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="frame">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      <Header title="Bulk Notifications ⭐" onNavigate={onNavigate} />

      <main className="main-content" id="mainContent" style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 20px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>Send Bulk Broadcasts</h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>Compose and send instant email & portal notifications to students, alumni, or corporate recruiters.</p>
        </div>

        {/* Compose Card */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,.05)', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📢 Compose Notification
          </h2>

          <form onSubmit={handleSend}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px' }}>
                  Subject / Title <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <span style={{ fontSize: '11px', color: title.length > 100 ? '#ef4444' : '#94a3b8' }}>
                  {title.length}/100
                </span>
              </div>
              <input
                type="text"
                maxLength={100}
                placeholder="e.g. TCS Drive Tomorrow — All CSE & IT Students"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (formErrors.title) setFormErrors(f => ({ ...f, title: '' }));
                }}
                style={{
                  border: `1px solid ${formErrors.title ? '#ef4444' : '#e2e8f0'}`,
                  borderRadius: '8px', padding: '10px 14px', fontSize: '14px',
                  color: '#1e2939', background: '#f8fafc', outline: 'none',
                  boxShadow: formErrors.title ? '0 0 0 3px rgba(239,68,68,.1)' : 'none',
                }}
              />
              {formErrors.title && (
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ⚠ {formErrors.title}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px' }}>
                  Message Body <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <span style={{ fontSize: '11px', color: message.length > 1000 ? '#ef4444' : '#94a3b8' }}>
                  {message.length}/1000
                </span>
              </div>
              <textarea
                placeholder="Write your announcement or briefing message here..."
                rows={4}
                maxLength={1000}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (formErrors.message) setFormErrors(f => ({ ...f, message: '' }));
                }}
                style={{
                  border: `1px solid ${formErrors.message ? '#ef4444' : '#e2e8f0'}`,
                  borderRadius: '8px', padding: '10px 14px', fontSize: '14px',
                  color: '#1e2939', background: '#f8fafc', outline: 'none', resize: 'vertical',
                  boxShadow: formErrors.message ? '0 0 0 3px rgba(239,68,68,.1)' : 'none',
                }}
              />
              {formErrors.message && (
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ⚠ {formErrors.message}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px' }}>Recipient Target Group</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {TARGETS.map(t => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setTargetGroup(t.id)}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '20px',
                      border: targetGroup === t.id ? '2px solid #6366f1' : '2px solid #e2e8f0',
                      background: targetGroup === t.id ? '#eff6ff' : '#f8fafc',
                      color: targetGroup === t.id ? '#4f46e5' : '#64748b',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all .15s'
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={sending}
              style={{
                background: sending ? '#a5b4fc' : '#6366f1',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 32px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: sending ? 'not-allowed' : 'pointer',
                width: '100%'
              }}
            >
              {sending ? 'Sending...' : '📤 Send Notification'}
            </button>

            {successInfo && (
              <div style={{ marginTop: '14px', background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px 18px', color: '#166534', fontSize: '13px', fontWeight: 600 }}>
                {successInfo}
              </div>
            )}

            {sendError && (
              <div style={{ marginTop: '14px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px 18px', color: '#991b1b', fontSize: '13px', fontWeight: 600 }}>
                {sendError}
              </div>
            )}
          </form>
        </div>

        {/* History List */}
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '14px' }}>📋 Notification History</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {history.map(n => (
              <div key={n.id} style={{ background: '#fff', borderRadius: '12px', padding: '18px 20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>{n.title}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(n.sentAt).toLocaleDateString()} {new Date(n.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, marginBottom: '10px' }}>{n.message}</div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: 600, background: '#eff6ff', color: '#1d4ed8' }}>
                    To: {n.targetGroup.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>📨 {n.recipientCount} recipients</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
