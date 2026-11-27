// Data Flow (roles/college-admin/pages/Officers.jsx):
// Backend API -> Redux Thunks/Slices (collegeAdminSlice, usersSlice) -> useSelector(selectCollegeOfficersUi) -> UI render
// User Actions -> dispatch(refreshCollegeAdminData, createPlacementOfficer, deleteUser, updatePlacementOfficerStatus) -> Slice reducers/thunks -> Redux state update
import { useDispatch, useSelector } from 'react-redux';
import { phoneError, phoneInputProps } from '../../../shared/utils/phone.js';
import { collegeEmailDomain, collegeEmailError } from '../../../shared/utils/collegeEmail.js';
import { confirmDialog } from '../../../shared/components/AppDialog.jsx';
import { errorMessage } from '../../../services/api.js';
import {
  refreshCollegeAdminData,
  selectCollegeOfficersUi,
  setCollegeOfficersUi,
} from '../store/collegeAdminSlice.js';
import {
  createPlacementOfficer,
  deleteUser,
  updatePlacementOfficerStatus,
} from '../../../store/slices/usersSlice.js';
import { UserPlus, Trash2, ShieldCheck, Ban, CheckCircle } from 'lucide-react';

function AddOfficerModal({ onClose, onSave, emailDomain }) {
  const dispatch = useDispatch();
  // Redux data source: collegeAdminSlice (selectCollegeOfficersUi for modal form state) + usersSlice (create/delete/status thunks).
  const { form, error } = useSelector(selectCollegeOfficersUi);
  const setForm = (updater) => {
    const next = typeof updater === 'function' ? updater(form) : updater;
    dispatch(setCollegeOfficersUi({ form: next }));
  };
  const setError = (v) => dispatch(setCollegeOfficersUi({ error: v }));
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are required.');
      return;
    }
    if (collegeEmailError(form.email, emailDomain)) {
      setError(collegeEmailError(form.email, emailDomain));
      return;
    }
    if (phoneError(form.phone)) { setError(phoneError(form.phone)); return; }
    onSave({
      name: form.name.trim(),
      email: form.email.trim(),
      department: form.department.trim() || 'Training & Placement Cell',
      phone: form.phone.trim(),
      status: 'active',
    }).then((saved) => { if (saved) onClose(); });
  };

  return (
    <div className="modal-backdrop open">
      <div className="modal">
        <h3><ShieldCheck size={18} color="#0ea5e9" /> Add Placement Officer</h3>
        <div className="form-group">
          <label>Full Name *</label>
          <input placeholder="Dr. Rajesh Nair" value={form.name} onChange={e => set('name', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Email *</label>
          <input type="email" placeholder={`name@${emailDomain}`} value={form.email} onChange={e => set('email', e.target.value)} />
          <small>Use your college email (@{emailDomain}).</small>
        </div>
        <div className="form-group">
          <label>Department</label>
          <input placeholder="Training & Placement Cell" value={form.department} onChange={e => set('department', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input placeholder="9876543210" {...phoneInputProps} value={form.phone} onChange={e => set('phone', e.target.value)} />
        </div>
        <p className="form-hint">Default login password: <strong>12345678</strong></p>
        {error && <p className="form-error">{error}</p>}
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>
            <UserPlus size={14} /> Add Officer
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Officers({ officers, collegeName, collegeInfo, showToast }) {
  const dispatch = useDispatch();
  const emailDomain = collegeEmailDomain(collegeInfo);
  const { showAdd, filter } = useSelector(selectCollegeOfficersUi);
  const setShowAdd = (v) => dispatch(setCollegeOfficersUi({
    showAdd: v,
    ...(v ? { form: { name: '', email: '', department: '', phone: '' }, error: '' } : {}),
  }));
  const setFilter = (v) => dispatch(setCollegeOfficersUi({ filter: v }));

  const filteredOfficers = officers.filter(o => {
    if (filter === 'active')   return o.status === 'active';
    if (filter === 'inactive') return o.status !== 'active';
    return true;
  });

  const handleAdd = async (officer) => {
    if (officers.some(ex => ex.email.toLowerCase() === officer.email.toLowerCase())) {
      showToast('An officer with this email already exists.', 'error');
      return false;
    }
    try {
      await dispatch(createPlacementOfficer(officer)).unwrap();
      await dispatch(refreshCollegeAdminData({ silentAfterMutation: true }));
      showToast('Placement officer added successfully!', 'success');
      return true;
    } catch (err) {
      showToast(errorMessage(err, 'Could not add the officer.'), 'error');
      return false;
    }
  };

  const handleToggleStatus = async (officer) => {
    const newStatus = officer.status === 'active' ? 'inactive' : 'active';
    const verb = newStatus === 'active' ? 'activated' : 'deactivated';
    try {
      await dispatch(updatePlacementOfficerStatus({ id: officer.id, status: newStatus })).unwrap();
      await dispatch(refreshCollegeAdminData({ silentAfterMutation: true }));
      showToast(`Officer ${verb}.`, 'success');
    } catch (err) {
      showToast(errorMessage(err, 'Could not update the officer.'), 'error');
    }
  };

  const handleRemove = async (id, name) => {
    if (!await confirmDialog(`Permanently remove placement officer "${name}"? This cannot be undone.`)) return;
    try {
      await dispatch(deleteUser(id)).unwrap();
      await dispatch(refreshCollegeAdminData({ silentAfterMutation: true }));
      showToast('Officer removed.', 'success');
    } catch (err) {
      showToast(errorMessage(err, 'Could not remove the officer.'), 'error');
    }
  };

  const activeCount   = officers.filter(o => o.status === 'active').length;
  const inactiveCount = officers.length - activeCount;

  return (
    <>
      <div className="section-header">
        <h2>
          Placement Officers — <span style={{ color: '#0ea5e9' }}>{collegeName || 'Your College'}</span>
        </h2>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <UserPlus size={15} /> Add Officer
        </button>
      </div>

      {/* Summary pills */}
      <div className="officers-summary-bar">
        <div className="officer-count-pill total">
          <ShieldCheck size={14} /> {officers.length} Total
        </div>
        <div className="officer-count-pill active-pill">
          <CheckCircle size={14} /> {activeCount} Active
        </div>
        <div className="officer-count-pill inactive-pill">
          <Ban size={14} /> {inactiveCount} Inactive
        </div>
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs" style={{ marginBottom: 16 }}>
        {[
          { key: 'all',      label: 'All Officers' },
          { key: 'active',   label: 'Active' },
          { key: 'inactive', label: 'Inactive' },
        ].map(t => (
          <button
            key={t.key}
            className={`filter-tab ${filter === t.key ? 'active' : ''}`}
            onClick={() => setFilter(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Officer</th>
              <th>Email</th>
              <th>Department</th>
              <th>Students Handled</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOfficers.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">
                    <ShieldCheck />
                    <p>{filter !== 'all' ? `No ${filter} officers.` : 'No placement officers found.'}</p>
                  </div>
                </td>
              </tr>
            ) : filteredOfficers.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="chip">
                    <div className="chip-avatar">{u.name.slice(0, 2).toUpperCase()}</div>
                    <div className="chip-info">
                      <div className="chip-name">{u.name}</div>
                      <div className="chip-sub">ID: {u.id}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: 13 }}>{u.email}</td>
                <td style={{ fontSize: 13 }}>{u.department || '—'}</td>
                <td style={{ fontSize: 13 }}>{u.studentsHandled ?? '—'}</td>
                <td>
                  <span className={`badge ${u.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                    {u.status}
                  </span>
                </td>
                <td style={{ whiteSpace: 'nowrap', display: 'flex', gap: 6 }}>
                  <button
                    className={`btn btn-sm ${u.status === 'active' ? 'btn-outline' : 'btn-success'}`}
                    title={u.status === 'active' ? 'Deactivate' : 'Activate'}
                    onClick={() => handleToggleStatus(u)}
                    style={u.status !== 'active' ? { background: '#dcfce7', color: '#15803d', border: 'none' } : {}}
                  >
                    {u.status === 'active'
                      ? <><Ban size={13} /> Deactivate</>
                      : <><CheckCircle size={13} /> Activate</>
                    }
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    title="Remove Officer"
                    onClick={() => handleRemove(u.id, u.name)}
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <AddOfficerModal onClose={() => setShowAdd(false)} onSave={handleAdd} emailDomain={emailDomain} />
      )}
    </>
  );
}
