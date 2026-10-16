import React, { useState } from 'react';
import { errorMessage } from '../../../services/api.js';
import { ArrowLeft, UserPlus, Ban, CheckCircle, AlertTriangle, ShieldCheck, Users } from 'lucide-react';

function AssignAdminModal({ college, onClose, onSave }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are required.');
      return;
    }
    if (form.name.trim().length < 2 || !/^[A-Za-z][A-Za-z .'-]+$/.test(form.name.trim())) {
      setError('Enter the admin\'s real name (letters, spaces, . \' - only).');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(form.email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    if (form.password && form.password.length < 3) {
      setError('Password must be at least 3 characters.');
      return;
    }
    onSave(college.id, {
      name: form.name.trim(),
      email: form.email.trim(),
      ...(form.password ? { password: form.password } : {}),
    }).then((saved) => { if (saved) onClose(); });
  };

  return (
    <div className="modal-backdrop open">
      <div className="modal">
        <h3><UserPlus size={18} color="#7c3aed" />
          {college?.admin ? 'Replace' : 'Assign'} College Admin
        </h3>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
          For: <strong>{college?.name}</strong>
        </p>
        <div className="form-group">
          <label>Full Name *</label>
          <input placeholder="Dr. Ganesh Kumar" value={form.name} onChange={e => set('name', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Email *</label>
          <input type="email" placeholder="admin@college.ac.in" value={form.email} onChange={e => set('email', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" placeholder="Leave blank for default (123)" value={form.password} onChange={e => set('password', e.target.value)} />
        </div>
        <p className="form-hint">Default password is <strong>123</strong>. The admin can change it after first login.</p>
        {error && <p className="form-error">{error}</p>}
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>
            {college?.admin ? 'Replace Admin' : 'Assign Admin'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CollegeAdminPanel({ college, onAssign, onToggleStatus }) {
  const admin = college.admin;

  return (
    <div>
      {/* Admin card */}
      <div style={{ marginBottom: 24 }}>
        {!admin ? (
          <div className="warning-card">
            <AlertTriangle size={22} color="#f59e0b" />
            <div className="warning-card-text">
              <strong>No College Admin Assigned</strong>
              <p>Click "Assign Admin" to create one.</p>
            </div>
          </div>
        ) : (
          <div className="admin-info-card">
            <div className="chip">
              <div className="chip-avatar ca" style={{ width: 46, height: 46, fontSize: 16 }}>
                {admin.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="chip-info">
                <div className="chip-name" style={{ fontSize: 15, fontWeight: 700 }}>{admin.name}</div>
                <div className="chip-sub">{admin.email}</div>
                <div style={{ marginTop: 6 }}>
                  <span className={`badge ${admin.status === 'active' ? 'badge-green' : 'badge-yellow'}`}>
                    {admin.status}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline btn-sm" onClick={() => onToggleStatus(college.id, admin.status)}>
                {admin.status === 'active'
                  ? <><Ban size={13} /> Deactivate</>
                  : <><CheckCircle size={13} /> Activate</>
                }
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => onAssign(college)}>
                <UserPlus size={13} /> Replace Admin
              </button>
            </div>
          </div>
        )}
      </div>

      {/* College Stats */}
      <div className="section-header" style={{ marginTop: 0 }}>
        <h2>College Statistics</h2>
      </div>
      <div className="stats-grid">
        {[
          { label: 'Students',          value: college.stats?.students ?? 0 },
          { label: 'Placement Officers', value: college.stats?.placementOfficers ?? 0 },
          { label: 'Alumni',            value: college.stats?.alumni ?? 0 },
          { label: 'Recruiters',        value: college.stats?.recruiters ?? 0 },
          { label: 'Total Placed',      value: college.stats?.placed ?? 0, accent: true },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <span className="stat-label">{s.label}</span>
            <span className={`stat-value ${s.accent ? 'accent' : ''}`}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CollegeAdmins({ colleges, platform, showToast, adminCollegeId, setAdminCollegeId }) {
  const [assignTarget, setAssignTarget] = useState(null);

  const selectedCollege = adminCollegeId ? colleges.find(c => c.id === adminCollegeId) : null;

  const handleAssign = (college) => setAssignTarget(college);

  const handleSaveAdmin = async (collegeId, adminData) => {
    const duplicate = colleges.some((college) => college.id !== collegeId && college.admin?.email?.toLowerCase() === adminData.email.toLowerCase());
    if (duplicate) {
      showToast('That admin email is already assigned to another college.', 'error');
      return false;
    }
    try {
      await platform.assignAdmin(collegeId, adminData);
      showToast('Admin assigned successfully!', 'success');
      return true;
    } catch (error) {
      showToast(errorMessage(error, 'Could not assign the admin.'), 'error');
      return false;
    }
  };

  const handleToggleStatus = async (collegeId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await platform.setAdminStatus(collegeId, newStatus);
      showToast(`Admin ${newStatus === 'active' ? 'activated' : 'deactivated'}.`, 'success');
    } catch (error) {
      showToast(errorMessage(error, 'Could not update the admin.'), 'error');
    }
  };

  // If a college is selected, show that college's admin panel
  if (selectedCollege) {
    return (
      <>
        <button className="back-link" onClick={() => setAdminCollegeId(null)}>
          <ArrowLeft size={15} /> All Colleges
        </button>

        <div className="section-header">
          <h2>Admin — {selectedCollege.name}</h2>
          <button className="btn btn-primary btn-sm" onClick={() => setAssignTarget(selectedCollege)}>
            <UserPlus size={14} /> {selectedCollege.admin ? 'Replace Admin' : 'Assign Admin'}
          </button>
        </div>

        <CollegeAdminPanel
          college={selectedCollege}
          onAssign={handleAssign}
          onToggleStatus={handleToggleStatus}
        />

        {assignTarget && (
          <AssignAdminModal
            college={assignTarget}
            onClose={() => setAssignTarget(null)}
            onSave={handleSaveAdmin}
          />
        )}
      </>
    );
  }

  // Show college selector grid
  return (
    <>
      <div className="section-header">
        <h2>College Admin Management</h2>
        <span style={{ fontSize: 13, color: '#94a3b8' }}>Select a college to manage its admin</span>
      </div>

      <div className="college-cards-grid">
        {colleges.map(c => (
          <button
            key={c.id}
            className="college-card"
            onClick={() => setAdminCollegeId(c.id)}
            style={{ textAlign: 'left', width: '100%', background: 'none' }}
          >
            <div className="college-card-initial">{c.name.slice(0, 2).toUpperCase()}</div>
            <div className="college-card-name">{c.name}</div>
            <div className="college-card-sub" style={{ marginTop: 4 }}>
              {c.admin ? `Admin: ${c.admin.name}` : ' No admin assigned'}
            </div>
            <div style={{ marginTop: 8 }}>
              <span className={`badge ${c.status === 'active' ? 'badge-green' : 'badge-red'}`}>
                {c.status}
              </span>
            </div>
          </button>
        ))}
      </div>

      {assignTarget && (
        <AssignAdminModal
          college={assignTarget}
          onClose={() => setAssignTarget(null)}
          onSave={handleSaveAdmin}
        />
      )}
    </>
  );
}

