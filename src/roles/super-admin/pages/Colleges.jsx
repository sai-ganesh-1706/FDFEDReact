import React, { useState } from 'react';
import { errorMessage } from '../../../services/api.js';
import { Plus, Ban, CheckCircle, ShieldCheck, AlertTriangle, Building2 } from 'lucide-react';

const STATUS_OPTIONS = ['active', 'inactive', 'suspended'];
const ACCESS_OPTIONS = ['full', 'limited', 'readonly'];

function AddCollegeModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    name: '', code: '', email: '', phone: '', address: '', website: '', access: 'full'
  });
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim() || !form.code.trim() || !form.email.trim()) {
      setError('Name, code and email are required.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setError('Enter a valid college email address.');
      return;
    }
    if (!/^[A-Za-z0-9-]{2,12}$/.test(form.code.trim())) {
      setError('College code must be 2–12 letters, numbers, or hyphens.');
      return;
    }
    const { access: _access, ...payload } = form;
    onSave({
      ...payload,
      name: form.name.trim(),
      code: form.code.trim(),
      email: form.email.trim(),
    }).then((saved) => { if (saved) onClose(); });
  };

  return (
    <div className="modal-backdrop open">
      <div className="modal">
        <h3><Building2 size={18} color="#7c3aed" /> Add New College</h3>
        {['name', 'code', 'email', 'phone', 'address', 'website'].map(field => (
          <div className="form-group" key={field}>
            <label>{field.charAt(0).toUpperCase() + field.slice(1)}{['name','code','email'].includes(field) ? ' *' : ''}</label>
            <input
              type={field === 'email' ? 'email' : field === 'website' ? 'url' : 'text'}
              placeholder={field === 'name' ? 'e.g. IIT Bombay' : field === 'code' ? 'e.g. IITB' : ''}
              value={form[field]}
              onChange={e => set(field, e.target.value)}
            />
          </div>
        ))}
        <div className="form-group">
          <label>Access Level</label>
          <select value={form.access} onChange={e => set('access', e.target.value)}>
            {ACCESS_OPTIONS.map(a => <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>)}
          </select>
        </div>
        {error && <p className="form-error">{error}</p>}
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Create College</button>
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
        <AddCollegeModal onClose={() => setShowAdd(false)} onSave={handleAddCollege} />
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

