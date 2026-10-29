import React, { useState } from 'react';
import { MapPin, Calendar, Plus, Trash2, Users, Edit3, X, Lock } from 'lucide-react';

export default function MyOpportunities({
  opportunities,
  onUpdateOpportunity,
  onDeleteOpportunity,
  setActiveTab,
  setSelectedRoleFilter,
}) {
  const [editingOpp, setEditingOpp] = useState(null);
  const [editErrors, setEditErrors] = useState({});

  // ── Open edit — capture original values for limit enforcement ──────────────
  const openEdit = (opp) => {
    setEditingOpp({ ...opp, _originalDeadline: opp.deadline, _originalCgpa: opp.cgpa });
    setEditErrors({});
  };

  // ── Edit validators ────────────────────────────────────────────────────────

  const validateEditDeadline = (value, originalDeadline) => {
    if (!value) return 'Deadline is required.';
    const orig = new Date(originalDeadline);
    const sel = new Date(value);
    orig.setHours(0, 0, 0, 0);
    sel.setHours(0, 0, 0, 0);
    if (sel < orig) return 'You can only extend the deadline, not move it backward.';
    // Also enforce 3-month cap from today
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    if (sel > maxDate) return 'Deadline cannot be more than 3 months from today.';
    return '';
  };

  const validateEditCgpa = (value, originalCgpa) => {
    if (!value && value !== 0) return '';
    const n = parseFloat(value);
    const orig = parseFloat(originalCgpa) || 0;
    if (isNaN(n) || n < 2) return 'CGPA must be at least 2.0.';
    if (n > 10) return 'CGPA cannot exceed 10.0.';
    if (n > orig) return `You can only lower the CGPA requirement (currently ${orig}).`;
    return '';
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingOpp) return;

    const errs = {
      deadline: validateEditDeadline(editingOpp.deadline, editingOpp._originalDeadline),
      cgpa: validateEditCgpa(editingOpp.cgpa, editingOpp._originalCgpa),
    };
    setEditErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    // Strip helper keys before saving
    const { _originalDeadline, _originalCgpa, ...toSave } = editingOpp;
    if (onUpdateOpportunity) onUpdateOpportunity(toSave);
    setEditingOpp(null);
  };

  const handleToggleStatus = (opp) => {
    const nextStatus = opp.status === 'Published' ? 'Closed' : 'Published';
    if (onUpdateOpportunity) onUpdateOpportunity({ ...opp, status: nextStatus });
  };

  // ── Deadline limits for edit ───────────────────────────────────────────────
  const getMaxDeadlineStr = () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split('T')[0];
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1F2937' }}>My Opportunities</h2>
          <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>
            Manage published job openings, track real-time applicants, and edit hiring requirements.
          </p>
        </div>
        <button
          className="btn-primary-action"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => setActiveTab('post')}
        >
          <Plus size={16} />
          <span>Post New Opportunity</span>
        </button>
      </div>

      {opportunities.length === 0 ? (
        <div style={{ background: 'white', padding: '40px', textAlign: 'center', borderRadius: '14px', border: '1px solid #E5E7EB' }}>
          <p style={{ color: '#6B7280', fontSize: '15px', marginBottom: '16px' }}>No active opportunities posted yet.</p>
          <button className="btn-primary-action" onClick={() => setActiveTab('post')}>
            Post Your First Opportunity
          </button>
        </div>
      ) : (
        <div className="opportunities-grid">
          {opportunities.map((opp) => (
            <div key={opp.id} className="opp-card-custom">
              <div className="opp-card-top">
                <h3 className="opp-card-title">{opp.title}</h3>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ background: '#EFF6FF', color: '#1D4ED8', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '12px' }}>
                    {opp.type}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(opp)}
                    title="Click to toggle status"
                    className={`badge-status ${(opp.status || 'published').toLowerCase()}`}
                    style={{ cursor: 'pointer', border: 'none' }}
                  >
                    {opp.status}
                  </button>
                </div>
              </div>

              <div className="opp-card-meta">
                <div className="meta-row">
                  <MapPin size={15} />
                  <span>{opp.location}</span>
                </div>
                <div className="meta-row">
                  <Calendar size={15} />
                  <span>Deadline: {opp.deadline} - <strong>{opp.applications}</strong> applicants</span>
                </div>
              </div>

              <div className="opp-details-grid">
                <div className="detail-col">
                  <h5>Compensation</h5>
                  <p>{opp.ctc}</p>
                </div>
                {opp.type === 'Internship' && opp.duration && (
                  <div className="detail-col">
                    <h5>Duration</h5>
                    <p>{opp.duration}</p>
                  </div>
                )}
                <div className="detail-col">
                  <h5>Min CGPA</h5>
                  <p>{opp.cgpa || '0'}</p>
                </div>
                <div className="detail-col">
                  <h5>Branches</h5>
                  <p>{Array.isArray(opp.branches) ? opp.branches.join(', ') : 'All'}</p>
                </div>
              </div>

              <div className="opp-actions-row">
                <button
                  className="btn-view-apps"
                  onClick={() => {
                    if (setSelectedRoleFilter) setSelectedRoleFilter(opp.title);
                    setActiveTab('applications');
                  }}
                >
                  <Users size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                  View Applications ({opp.applications || 0})
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn-secondary-action"
                    style={{ padding: '7px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    title="Edit Opportunity"
                    onClick={() => openEdit(opp)}
                  >
                    <Edit3 size={15} />
                  </button>

                  <button
                    className="btn-delete-opp"
                    title="Delete Opportunity"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to remove "${opp.title}"?`)) {
                        onDeleteOpportunity(opp.id);
                      }
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── EDIT MODAL ──────────────────────────────────────────────────────── */}
      {editingOpp && (
        <div className="modal-backdrop" onClick={() => setEditingOpp(null)}>
          <div className="modal-content-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <h3>Edit Opportunity</h3>
              <button className="btn-close-modal" onClick={() => setEditingOpp(null)}>
                <X size={20} />
              </button>
            </div>

            {/* ── Read-only info banner ── */}
            <div style={{
              background: '#F0F9FF',
              border: '1px solid #BAE6FD',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '20px',
              fontSize: '13px',
              color: '#0369A1',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}>
              <Lock size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong>Locked fields</strong> — Job title, type, location, and compensation cannot be changed after posting.
              </div>
            </div>

            {/* ── Locked display fields ── */}
            <div className="form-grid" style={{ marginBottom: '4px' }}>
              <div className="form-group">
                <label style={{ color: '#9CA3AF' }}>Job Title (locked)</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingOpp.title}
                  readOnly
                  style={{ background: '#F9FAFB', color: '#6B7280', cursor: 'not-allowed' }}
                />
              </div>

              <div className="form-group">
                <label style={{ color: '#9CA3AF' }}>Type (locked)</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingOpp.type}
                  readOnly
                  style={{ background: '#F9FAFB', color: '#6B7280', cursor: 'not-allowed' }}
                />
              </div>

              <div className="form-group">
                <label style={{ color: '#9CA3AF' }}>Location (locked)</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingOpp.location}
                  readOnly
                  style={{ background: '#F9FAFB', color: '#6B7280', cursor: 'not-allowed' }}
                />
              </div>

              <div className="form-group">
                <label style={{ color: '#9CA3AF' }}>Compensation (locked)</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingOpp.ctc}
                  readOnly
                  style={{ background: '#F9FAFB', color: '#6B7280', cursor: 'not-allowed' }}
                />
              </div>
            </div>

            {/* ── Editable fields ── */}
            <form onSubmit={handleSaveEdit}>
              <div className="form-grid">

                {/* Deadline — can only extend */}
                <div className="form-group">
                  <label>
                    Application Deadline
                    <span style={{ fontSize: '11px', color: '#6B7280', marginLeft: '6px' }}>
                      (can only be extended)
                    </span>
                  </label>
                  <input
                    type="date"
                    className={`form-input${editErrors.deadline ? ' input-error' : ''}`}
                    value={editingOpp.deadline}
                    min={editingOpp._originalDeadline}
                    max={getMaxDeadlineStr()}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingOpp({ ...editingOpp, deadline: val });
                      setEditErrors((p) => ({ ...p, deadline: validateEditDeadline(val, editingOpp._originalDeadline) }));
                    }}
                  />
                  {editErrors.deadline && <span className="field-error">{editErrors.deadline}</span>}
                </div>

                {/* CGPA — can only decrease */}
                <div className="form-group">
                  <label>
                    Minimum CGPA
                    <span style={{ fontSize: '11px', color: '#6B7280', marginLeft: '6px' }}>
                      (can only be lowered)
                    </span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="2"
                    max={editingOpp._originalCgpa || '10'}
                    className={`form-input${editErrors.cgpa ? ' input-error' : ''}`}
                    value={editingOpp.cgpa}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingOpp({ ...editingOpp, cgpa: val });
                      setEditErrors((p) => ({ ...p, cgpa: validateEditCgpa(val, editingOpp._originalCgpa) }));
                    }}
                  />
                  {editErrors.cgpa && <span className="field-error">{editErrors.cgpa}</span>}
                </div>

              </div>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn-secondary-action" onClick={() => setEditingOpp(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-action">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
