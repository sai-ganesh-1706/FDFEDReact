import React, { useEffect, useState } from 'react';
import {
  MessageSquare, Send, UserCog, Users, AlertTriangle,
  CheckCircle, RefreshCw, Clock, Building2, XCircle
} from 'lucide-react';
import { usePlatformData } from '../../../shared/context/PlatformDataContext.jsx';
import { errorMessage } from '../../../services/api.js';

function ComposeForm({ colleges, onSend }) {
  const [toType,  setToType]  = useState('one');   // 'one' | 'all'
  const [toId,    setToId]    = useState('');
  const [subject, setSubject] = useState('');
  const [body,    setBody]    = useState('');
  const [sending, setSending] = useState(false);
  const [formErr, setFormErr] = useState('');

  const adminsOnly = colleges.filter(c => c.admin);

  const handleSend = async () => {
    setFormErr('');
    if (!subject.trim() || !body.trim()) {
      setFormErr('Subject and message are required.');
      return;
    }
    if (toType === 'one' && !toId) {
      setFormErr('Select a college admin to send to.');
      return;
    }
    setSending(true);
    try {
      const selectedCollege = toType === 'one' ? colleges.find(c => String(c.id) === String(toId)) : null;
      const payload = {
        toType,
        toCollegeId: toType === 'one' ? Number(toId) : null,
        toCollegeName: selectedCollege ? selectedCollege.name : null,
        subject: subject.trim(),
        message: body.trim(),
      };
      await onSend(payload);
      setSubject('');
      setBody('');
      setToId('');
    } catch (e) {
      setFormErr(errorMessage(e, 'Failed to send message.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="msg-compose-card">
      <div className="msg-compose-header">
        <MessageSquare size={16} color="#a855f7" />
        <strong>Compose Message</strong>
      </div>

      {/* To */}
      <div className="form-group">
        <label>Send To</label>
        <div className="msg-to-toggle">
          <button
            className={`msg-to-btn ${toType === 'all' ? 'active' : ''}`}
            onClick={() => setToType('all')}
          >
            <Users size={14} /> All College Admins
          </button>
          <button
            className={`msg-to-btn ${toType === 'one' ? 'active' : ''}`}
            onClick={() => setToType('one')}
          >
            <UserCog size={14} /> Specific Admin
          </button>
        </div>
      </div>

      {toType === 'one' && (
        <div className="form-group">
          <label>Select College Admin *</label>
          {adminsOnly.length === 0 ? (
            <div style={{ fontSize: 12, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0' }}>
              <AlertTriangle size={13} /> No college admins assigned yet
            </div>
          ) : (
            <select value={toId} onChange={e => setToId(e.target.value)}>
              <option value="">— Pick a college admin —</option>
              {adminsOnly.map(c => (
                <option key={c.id} value={c.id}>
                  {c.admin.name} ({c.name})
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {toType === 'all' && (
        <div className="msg-all-banner">
          <Users size={14} color="#a855f7" />
          This message will be sent to all <strong>{adminsOnly.length}</strong> assigned college admin{adminsOnly.length !== 1 ? 's' : ''}.
        </div>
      )}

      <div className="form-group">
        <label>Subject *</label>
        <input
          placeholder="e.g. Upcoming platform maintenance on Nov 1"
          value={subject}
          onChange={e => setSubject(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Message *</label>
        <textarea
          rows={5}
          placeholder="Write your message here…"
          value={body}
          onChange={e => setBody(e.target.value)}
          className="msg-textarea"
        />
      </div>

      {formErr && (
        <p className="form-error" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <XCircle size={13} /> {formErr}
        </p>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
        <button
          className="btn btn-primary"
          onClick={handleSend}
          disabled={sending}
          style={{ background: '#a855f7' }}
        >
          {sending
            ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Sending…</>
            : <><Send size={14} /> Send Message</>
          }
        </button>
      </div>
    </div>
  );
}

function SentList({ messages, loading, err, onRefresh }) {
  return (
    <div className="msg-sent-panel">
      <div className="msg-sent-header">
        <strong>Sent Messages</strong>
        <button className="btn btn-ghost btn-sm" onClick={onRefresh} disabled={loading}>
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {loading && (
        <div className="empty-state" style={{ padding: '28px 0' }}>
          <RefreshCw style={{ animation: 'spin 1s linear infinite', opacity: 0.4 }} />
          <p>Loading messages…</p>
        </div>
      )}

      {!loading && err && (
        <div style={{ padding: 16, fontSize: 12, color: '#ef4444', background: '#fff5f5', borderRadius: 8, border: '1px solid #fecaca' }}>
          <AlertTriangle size={13} style={{ verticalAlign: 'middle', marginRight: 5 }} />
          {err} — backend needs GET /super-admin/messages
        </div>
      )}

      {!loading && !err && messages.length === 0 && (
        <div className="empty-state" style={{ padding: '28px 0' }}>
          <MessageSquare />
          <p>No messages sent yet.</p>
        </div>
      )}

      {!loading && !err && messages.length > 0 && (
        <div className="msg-sent-list">
          {messages.map((m, i) => (
            <div key={m.id ?? i} className="msg-sent-item">
              <div className="msg-sent-item-header">
                <div className="msg-to-chip">
                  {m.toType === 'all'
                    ? <><Users size={12} /> All Admins</>
                    : <><UserCog size={12} /> {m.toAdminName || m.toCollegeId}</>
                  }
                </div>
                <span className="msg-sent-time">
                  <Clock size={11} /> {m.sentAt || m.createdAt || '—'}
                </span>
              </div>
              <div className="msg-sent-subject">{m.subject}</div>
              <div className="msg-sent-body">{m.message}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Messages({ colleges }) {
  const { sendMessage, getSentMessages } = usePlatformData();
  const [messages, setMessages] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [err,      setErr]      = useState('');
  const [toast,    setToast]    = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadMessages = () => {
    setLoading(true);
    setErr('');
    getSentMessages()
      .then(res  => setMessages(res.data || []))
      .catch(e   => setErr(errorMessage(e, 'Could not load sent messages.')))
      .finally(() => setLoading(false));
  };

  useEffect(loadMessages, []);

  const handleSend = async (payload) => {
    await sendMessage(payload);
    showToast('Message sent successfully!', 'success');
    loadMessages();
  };

  return (
    <>
      <div className="section-header">
        <h2>Messages to College Admins</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b' }}>
          <Building2 size={13} />
          {colleges.filter(c => c.admin).length} admin{colleges.filter(c => c.admin).length !== 1 ? 's' : ''} available
        </div>
      </div>

      <div className="msg-layout">
        <ComposeForm colleges={colleges} onSend={handleSend} />
        <SentList messages={messages} loading={loading} err={err} onRefresh={loadMessages} />
      </div>

      {/* Inline toast for this page */}
      {toast && (
        <div className={`toast ${toast.type}`} style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 500 }}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

