import React, { useState } from 'react';
import { errorMessage } from '../../../services/api.js';
import { Plus, Ban, CheckCircle, ShieldCheck, AlertTriangle, Building2 } from 'lucide-react';

const STATUS_OPTIONS = ['active', 'inactive', 'suspended'];

const FIELD_META = [
  { key: 'name', label: 'College name', required: true, placeholder: 'e.g. IIT Bombay' },
  { key: 'code', label: 'College code', required: true, placeholder: 'e.g. IITB', hint: '2–12 capital letters, numbers or hyphens' },
  { key: 'email', label: 'Official email', required: true, placeholder: 'admin@college.ac.in' },
  { key: 'phone', label: 'Phone', placeholder: '+91 98765 43210' },
  { key: 'address', label: 'Address', placeholder: 'City, State' },
  { key: 'website', label: 'Website', placeholder: 'https://college.ac.in' },
];

/** One rule per field; returns an error message or ''. Mirrors the server-side checks. */
function validateField(key, raw, existing = []) {
  const v = (raw || '').trim();
  switch (key) {
    case 'name':
      if (!v) return 'College name is required.';
      if (v.length < 3 || v.length > 100) return 'Name must be 3–100 characters.';
      if (!/^[A-Za-z0-9][A-Za-z0-9 .,&'()-]*$/.test(v)) return "Use letters, numbers, spaces and . , & ' ( ) - only.";
      if (existing.some((c) => c.name.trim().toLowerCase() === v.toLowerCase())) return 'A college with this name already exists.';
      return '';
    case 'code':
      if (!v) return 'College code is required.';
      if (!/^[A-Z0-9-]{2,12}$/.test(v)) return 'Use 2–12 capital letters, numbers or hyphens (e.g. IITB).';
      if (existing.some((c) => c.code.toLowerCase() === v.toLowerCase())) return 'This code is already used by another college.';
      return '';
    case 'email':
      if (!v) return 'Email is required.';
      if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(v)) return 'Enter a valid email, e.g. admin@college.ac.in.';
      if (existing.some((c) => (c.email || '').toLowerCase() === v.toLowerCase())) return 'Another college already uses this email.';
      return '';
    case 'phone':
      if (v && !/^[+]?[0-9 ()-]{8,16}$/.test(v)) return 'Enter a valid phone number (8–16 digits).';
      return '';
    case 'address':
      if (v && (v.length < 5 || v.length > 200)) return 'Address must be 5–200 characters.';
      return '';
    case 'website':
      if (v && !/^https?:\/\/[^\s/$.?#][^\s]*\.[A-Za-z]{2,}[^\s]*$/.test(v)) return 'Use a full URL starting with http:// or https://';
      return '';
    default:
      return '';
  }
}

function AddCollegeModal({ onClose, onSave, existing }) {
  const [form, setForm] = useState({ name: '', code: '', email: '', phone: '', address: '', website: '' });
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: k === 'code' ? v.toUpperCase() : v }));
  const errors = Object.fromEntries(FIELD_META.map(({ key }) => [key, validateField(key, form[key], existing)]));
  const hasErrors = Object.values(errors).some(Boolean);

  const handleSave = async () => {
    setTouched(Object.fromEntries(FIELD_META.map(({ key }) => [key, true])));
    if (hasErrors) { setError('Please fix the highlighted fields.'); return; }
    setError('');
    const payload = {};
    FIELD_META.forEach(({ key }) => { const v = form[key].trim(); if (v) payload[key] = v; });
    setSaving(true);
    const saved = await onSave(payload);
    setSaving(false);
    if (saved) onClose();
  };

  return (
    <div className="modal-backdrop open">
      <div className="modal">
        <h3><Building2 size={18} color="#7c3aed" /> Add New College</h3>
        {FIELD_META.map(({ key, label, required, placeholder, hint }) => (
          <div className="form-group" key={key}>
            <label>{label}{required ? ' *' : ''}</label>
            <input
              type="text"
              placeholder={placeholder}
              value={form[key]}
              style={touched[key] && errors[key] ? { borderColor: '#ef4444' } : undefined}
              onChange={(e) => set(key, e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, [key]: true }))}
            />
            {touched[key] && errors[key]
              ? <p className="form-error" style={{ marginTop: 4 }}>{errors[key]}</p>
              : hint && <p className="form-hint" style={{ marginTop: 4 }}>{hint}</p>}
          </div>
        ))}
        {error && <p className="form-error">{error}</p>}
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Creating…' : 'Create College'}</button>
        </div>
      </div>
    </div>
  );
}

function StatusModal({ college, onClose, onSave }) {
  const [status, setStatus] = useState(college.status);
  return (
    <div className="modal-backdrop open">
      <div className="modal">
        <h3>Update Status — {college.name}</h3>
        <div className="form-group">
          <label>Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { onSave(college.id, status); onClose(); }}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default function Colleges({ colleges, platform, showToast, setActiveTab, setAdminCollegeId }) {
  const [showAdd, setShowAdd]       = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);

  const handleAddCollege = async (newCol) => {
    if (colleges.some((college) => college.code.toLowerCase() === newCol.code.toLowerCase())) {
      showToast('A college with this code already exists.', 'error');
      return false;
    }
    try {
      await platform.addCollege(newCol);
      showToast('College added successfully!', 'success');
      return true;
    } catch (error) {
      showToast(errorMessage(error, 'Could not add the college.'), 'error');
      return false;
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await platform.setCollegeStatus(id, status);
      showToast('College status updated.', 'success');
    } catch (error) {
      showToast(errorMessage(error, 'Could not update the status.'), 'error');
    }
  };

  const goManageAdmin = (college) => {
    setAdminCollegeId(college.id);
    setActiveTab('college-admins');
  };

  return (
    <>
      <div className="section-header">
        <h2>All Colleges</h2>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={15} /> Add College
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>College</th>
              <th>Code</th>
              <th>Contact</th>
              <th>Students</th>
              <th>Placed</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {colleges.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="empty-state">
                    <Building2 />
                    <p>No colleges yet. Add one to get started.</p>
                  </div>
                </td>
              </tr>
            ) : colleges.map(c => (
              <tr key={c.id}>
                <td>
                  <div className="chip">
                    <div className="chip-avatar">{c.name.slice(0, 2).toUpperCase()}</div>
                    <div className="chip-info">
                      <div className="chip-name">{c.name}</div>
                      <div className="chip-sub">{c.website || ''}</div>
                    </div>
                  </div>
                </td>
                <td><code>{c.code}</code></td>
                <td>
                  <div style={{ fontSize: 12 }}>{c.email}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{c.phone || ''}</div>
                </td>
                <td>{c.stats?.students ?? 0}</td>
                <td><strong style={{ color: '#16a34a' }}>{c.stats?.placed ?? 0}</strong></td>
                <td>
                  <button
                    className={`badge ${c.status === 'active' ? 'badge-green' : c.status === 'suspended' ? 'badge-red' : 'badge-gray'}`}
                    style={{ cursor: 'pointer', border: 'none' }}
                    onClick={() => setStatusTarget(c)}
                  >
                    {c.status}
                  </button>
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button
                    className="btn btn-outline btn-sm"
                    title="Manage Admin"
                    onClick={() => goManageAdmin(c)}
                    style={{ gap: 5 }}
                  >
                    <ShieldCheck size={13} /> Admin
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <AddCollegeModal onClose={() => setShowAdd(false)} onSave={handleAddCollege} existing={colleges} />
      )}
      {statusTarget && (
        <StatusModal
          college={statusTarget}
          onClose={() => setStatusTarget(null)}
          onSave={handleStatusChange}
        />
      )}
    </>
  );
}

