import { useEffect, useRef, useState } from 'react';
import api, { errorMessage } from '../../services/api.js';

// Shared "Change Password" dialog used by the alumni and placement-officer profile pages.
// It talks to the same endpoint the candidate dashboard uses:
//   POST /users/:id/password  { currentPassword, newPassword }
// The backend answers 401 when the current password is wrong; the axios interceptor in
// services/api.js deliberately does NOT treat that as an expired session.

const MIN_LENGTH = 3; // mirrors ChangePasswordDto on the backend

const EMPTY = { currentPassword: '', newPassword: '', confirmPassword: '' };

export default function ChangePasswordModal({ isOpen, onClose, userId, accentColor = '#7c3aed' }) {
  const [form, setForm] = useState(EMPTY);
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const firstFieldRef = useRef(null);
  const closeTimer = useRef(null);

  // Start from a clean form every time the dialog opens.
  useEffect(() => {
    if (!isOpen) return undefined;
    setForm(EMPTY);
    setShowPasswords(false);
    setError('');
    setSuccess(false);
    setSaving(false);
    const focusTimer = window.setTimeout(() => firstFieldRef.current?.focus(), 50);
    return () => window.clearTimeout(focusTimer);
  }, [isOpen]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => { if (event.key === 'Escape' && !saving) onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, saving, onClose]);

  if (!isOpen) return null;

  const setField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    if (error) setError('');
  };

  const validate = () => {
    if (!form.currentPassword) return 'Enter your current password.';
    if (form.newPassword.length < MIN_LENGTH) return `New password must be at least ${MIN_LENGTH} characters.`;
    if (form.newPassword === form.currentPassword) return 'New password must be different from the current one.';
    if (form.newPassword !== form.confirmPassword) return 'New password and confirmation do not match.';
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving || success) return;
    const problem = validate();
    if (problem) { setError(problem); return; }
    setSaving(true);
    setError('');
    try {
      await api.post(`/users/${userId}/password`, {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess(true);
      setForm(EMPTY);
      closeTimer.current = window.setTimeout(onClose, 1600);
    } catch (err) {
      setError(
        err?.response?.status === 401
          ? 'Your current password is incorrect.'
          : errorMessage(err, 'Could not change the password. Please try again.')
      );
    } finally {
      setSaving(false);
    }
  };

  const inputType = showPasswords ? 'text' : 'password';
  const fields = [
    { key: 'currentPassword', label: 'Current password', autoComplete: 'current-password', ref: firstFieldRef },
    { key: 'newPassword', label: 'New password', autoComplete: 'new-password' },
    { key: 'confirmPassword', label: 'Confirm new password', autoComplete: 'new-password' },
  ];

  const styles = {
    overlay: {
      position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 16, background: 'rgba(15, 23, 42, .5)', backdropFilter: 'blur(4px)',
    },
    dialog: {
      width: 'min(420px, 100%)', background: '#fff', borderRadius: 16, padding: 28,
      boxShadow: '0 20px 60px rgba(0, 0, 0, .25)', color: '#1e293b', fontFamily: 'inherit',
    },
    title: { margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' },
    subtitle: { margin: '6px 0 18px', fontSize: 13, color: '#64748b', lineHeight: 1.5 },
    label: { display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: '#475569' },
    input: {
      width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10,
      border: '1.5px solid #e2e8f0', fontSize: 14, color: '#0f172a', background: '#fff', outline: 'none',
    },
    toggle: { display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 14px', fontSize: 12, color: '#64748b', cursor: 'pointer' },
    error: {
      margin: '0 0 14px', padding: '10px 12px', borderRadius: 10, background: '#fef2f2',
      border: '1px solid #fecaca', color: '#b91c1c', fontSize: 13,
    },
    success: {
      margin: '0 0 14px', padding: '10px 12px', borderRadius: 10, background: '#ecfdf5',
      border: '1px solid #a7f3d0', color: '#047857', fontSize: 13, fontWeight: 600,
    },
    actions: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 },
    cancel: {
      padding: '9px 18px', borderRadius: 10, border: '1.5px solid #d1d5db', background: '#fff',
      color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer',
    },
    submit: {
      padding: '9px 20px', borderRadius: 10, border: 'none', background: accentColor, color: '#fff',
      fontSize: 14, fontWeight: 700, cursor: saving || success ? 'not-allowed' : 'pointer',
      opacity: saving || success ? 0.7 : 1,
    },
  };

  return (
    <div
      style={styles.overlay}
      onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}
    >
      <form
        style={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-password-title"
        onSubmit={handleSubmit}
        noValidate
      >
        <h2 id="change-password-title" style={styles.title}>Change Password</h2>
        <p style={styles.subtitle}>Enter your current password, then choose a new one.</p>

        {fields.map(({ key, label, autoComplete, ref }) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <label htmlFor={`cp-${key}`} style={styles.label}>{label}</label>
            <input
              id={`cp-${key}`}
              ref={ref}
              type={inputType}
              value={form[key]}
              onChange={setField(key)}
              autoComplete={autoComplete}
              disabled={saving || success}
              style={styles.input}
              onFocus={(event) => { event.currentTarget.style.borderColor = accentColor; }}
              onBlur={(event) => { event.currentTarget.style.borderColor = '#e2e8f0'; }}
            />
          </div>
        ))}

        <label style={styles.toggle}>
          <input type="checkbox" checked={showPasswords} onChange={(event) => setShowPasswords(event.target.checked)} />
          Show passwords
        </label>

        {error && <p role="alert" style={styles.error}>{error}</p>}
        {success && <p role="status" style={styles.success}>Password updated successfully.</p>}

        <div style={styles.actions}>
          <button type="button" style={styles.cancel} onClick={onClose} disabled={saving}>
            {success ? 'Close' : 'Cancel'}
          </button>
          <button type="submit" style={styles.submit} disabled={saving || success}>
            {saving ? 'Saving…' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
}
