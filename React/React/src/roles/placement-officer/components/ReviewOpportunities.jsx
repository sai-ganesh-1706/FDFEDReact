import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './styles/p2.css';
import api from '../../../services/api.js';
import { errorMessage } from '../../../services/api.js';
import { useOfficerData, fromSubmissionEdit } from '../services/officerApi';

export default function ReviewOpportunities({ onNavigate, activePage = 'p2' }) {
  /* ── Submissions come from the API; every action writes to it and reloads ── */
  const { data, refresh, error: loadError } = useOfficerData();
  const submissions = data.submissions || [];

  const act = async (request) => {
    try {
      await request();
      await refresh();
      return true;
    } catch (error) {
      window.alert(errorMessage(error, 'That action could not be completed.'));
      return false;
    }
  };

  const [activeFilter, setActiveFilter] = useState('all');
  const [openCards, setOpenCards] = useState({});
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [rejectError, setRejectError] = useState(false);

  /* ── Edit Opportunity State ── */
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '', company: '', type: 'placement', pkg: '', location: '',
    cgpa: '', branches: '', backlogs: 'Not allowed', deadline: '', desc: ''
  });

  const counts = { all: 0, pending: 0, approved: 0, published: 0, rejected: 0 };
  submissions.forEach((s) => {
    counts.all++;
    counts[s.status]++;
  });

  const toggleCard = (id) => {
    setOpenCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filterOpps = (status) => {
    setActiveFilter(status);
  };

  const approveCard = (id) => act(() => api.patch(`/opportunities/${id}/approve`));

  const publishCard = (id) => act(() => api.patch(`/opportunities/${id}/publish`));

  const openRejectModal = (id) => {
    setRejectTarget(id);
    setRejectRemarks('');
    setRejectError(false);
    setRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    setRejectModalOpen(false);
    setRejectTarget(null);
  };

  const confirmRejection = () => {
    const wordCount = rejectRemarks.trim().split(/\s+/).filter((w) => w.length > 0).length;
    if (wordCount < 10) {
      setRejectError(true);
      return;
    }
    setRejectError(false);
    act(() => api.patch(`/opportunities/${rejectTarget}/reject`, { remark: rejectRemarks.trim() }));
    closeRejectModal();
  };

  const openEditModal = (sub) => {
    setEditingSub(sub);
    setEditForm({
      title: sub.title || '',
      company: sub.company || '',
      type: sub.type || 'placement',
      pkg: sub.pkg || '',
      location: sub.location || '',
      cgpa: sub.cgpa != null ? String(sub.cgpa) : '',
      branches: sub.branches || '',
      backlogs: sub.backlogs || 'Not allowed',
      deadline: sub.deadline || '',
      desc: sub.desc || ''
    });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingSub(null);
  };

  const handleEditFieldChange = (key, val) => {
    setEditForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingSub) return;
    const changes = fromSubmissionEdit(editForm);
    // Only send what was filled in, so an empty box never wipes an existing value.
    const payload = Object.fromEntries(
      Object.entries(changes).filter(([, v]) => v !== undefined && v !== '' && !(typeof v === 'number' && Number.isNaN(v)))
    );
    const saved = await act(() => api.put(`/opportunities/${editingSub.id}`, payload));
    if (saved) closeEditModal();
  };

  const filteredSubmissions = submissions.filter(
    (s) => activeFilter === 'all' || s.status === activeFilter
  );

  const renderActionBar = (sub) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
        <button
          type="button"
          onClick={() => openEditModal(sub)}
          style={{
            padding: '7px 15px',
            borderRadius: '8px',
            border: '1.5px solid #7c3aed',
            background: '#faf5ff',
            color: '#7c3aed',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#ede9fe')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#faf5ff')}
        >
          ✏️ Edit Details
        </button>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {sub.status === 'published' && (
            <div className="live-bar" style={{ margin: 0, padding: '7px 14px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" fill="#16a34a" />
              </svg>
              <span>Live — {sub.applied || 0} candidates applied</span>
            </div>
          )}
          {sub.status === 'approved' && (
            <button className="btn-publish" onClick={() => publishCard(sub.id)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>{' '}
              Publish to Candidates
            </button>
          )}
          {sub.status === 'pending' && (
            <>
              <button className="btn-approve" onClick={() => approveCard(sub.id)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>{' '}
                Approve
              </button>
              <button className="btn-reject" onClick={() => openRejectModal(sub.id)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>{' '}
                Reject with Remarks
              </button>
            </>
          )}
          {sub.status === 'rejected' && (
            <div className="rejection-bar" style={{ margin: 0, padding: '7px 14px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <strong>Rejection Remarks: </strong>
                <span>{sub.rejectionRemark || 'No remarks provided.'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="frame">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      <Header title="Review Opportunities" onNavigate={onNavigate} />

      <main className="main-content" id="mainContent">
        <div className="filter-tabs">
          {['all', 'pending', 'approved', 'published', 'rejected'].map((status) => (
            <button
              key={status}
              className={`tab${activeFilter === status ? ' active' : ''}`}
              onClick={() => filterOpps(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({counts[status]})
            </button>
          ))}
        </div>

        <div className="opp-list" id="oppList">
          {filteredSubmissions.map((sub) => {
            const statusLabel = sub.status.charAt(0).toUpperCase() + sub.status.slice(1);
            const typeLabel = sub.type === 'internship' ? 'Internship' : 'Placement';
            const isOpen = openCards[sub.id];

            return (
              <div className={`opp-card${isOpen ? ' open' : ''}`} data-status={sub.status} key={sub.id}>
                <div className="opp-header" onClick={() => toggleCard(sub.id)}>
                  <div className="opp-left">
                    <div className="opp-avatar" style={{ background: sub.avatarBg, color: '#fff' }}>{sub.avatar}</div>
                    <div className="opp-info">
                      <div className="opp-title">
                        {sub.title} <span className={`type-badge ${sub.type}`}>{typeLabel}</span>
                      </div>
                      <div className="opp-company">{sub.company} &bull; {sub.location} &bull; {sub.pkg}</div>
                      <div className="opp-meta">
                        Submitted by: {sub.submitter} ({sub.company}) &bull; {sub.submitted} &bull; Deadline: {sub.deadline}
                      </div>
                    </div>
                  </div>
                  <div className="opp-right">
                    <span className={`status-badge ${sub.status}`}>{statusLabel}</span>
                    <svg className="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
                <div className="opp-details">
                  <div className="details-grid">
                    <div className="detail-left">
                      <h4>Description</h4>
                      <p>{sub.desc}</p>
                    </div>
                    <div className="detail-right">
                      <h4>Eligibility</h4>
                      <p>Min CGPA: <strong>{sub.cgpa}</strong></p>
                      <p>Branches: <strong>{sub.branches}</strong></p>
                      <p>Backlogs: <strong>{sub.backlogs}</strong></p>
                      <h4>Skills Required</h4>
                      <div className="skill-tags">
                        {(sub.skills || []).map((s, sIdx) => (
                          <span className="skill" key={sIdx}>{s}</span>
                        ))}
                      </div>
                      <h4>Rounds</h4>
                      <p className="rounds">{sub.rounds}</p>
                    </div>
                  </div>
                  {renderActionBar(sub)}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Reject Modal */}
      <div className={`modal-overlay${rejectModalOpen ? ' active' : ''}`} id="rejectModal" onClick={(e) => { if (e.target === e.currentTarget) closeRejectModal(); }}>
        <div className="modal">
          <div className="modal-header">
            <h3>Reject Opportunity</h3>
            <button className="modal-close" onClick={closeRejectModal}>&times;</button>
          </div>
          <p className="modal-desc" style={{ fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
            Remarks / Reason for Decline <span style={{ color: '#ef4444' }}>*</span>{' '}
            <span style={{ fontWeight: 'normal', fontSize: '12px', color: '#6b7280' }}>(minimum 10 words required)</span>
          </p>
          {/* Word-count indicator */}
          {(() => {
            const wc = rejectRemarks.trim() === '' ? 0 : rejectRemarks.trim().split(/\s+/).filter(w => w.length > 0).length;
            const pct = Math.min((wc / 10) * 100, 100);
            return (
              <div style={{ marginBottom: '8px' }}>
                <div style={{ height: '4px', borderRadius: '4px', background: '#f3f4f6', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: wc >= 10 ? '#22c55e' : '#f59e0b', transition: 'width .2s, background .2s', borderRadius: '4px' }} />
                </div>
                <span style={{ fontSize: '11px', color: wc >= 10 ? '#166534' : '#92400e', fontWeight: 600, marginTop: '3px', display: 'inline-block' }}>
                  {wc} / 10 words {wc >= 10 ? '(Minimum reached)' : '(Minimum 10 words required)'}
                </span>
              </div>
            );
          })()}
          <textarea
            className="modal-textarea"
            id="rejectRemarks"
            placeholder="e.g. Company does not meet our placement partner criteria. Please resubmit with updated credentials..."
            value={rejectRemarks}
            onChange={(e) => { setRejectRemarks(e.target.value); if (rejectError) setRejectError(false); }}
            style={rejectError ? { borderColor: '#ef4444', boxShadow: '0 0 0 3px rgba(239,68,68,.1)' } : {}}
          />
          {rejectError && (
            <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              ⚠ Remarks must be at least 10 words. Please provide a detailed reason for rejection.
            </div>
          )}
          <div className="modal-actions">
            <button className="modal-btn-cancel" onClick={closeRejectModal}>Cancel</button>
            <button className="modal-btn-confirm" onClick={confirmRejection}>Confirm Rejection</button>
          </div>
        </div>
      </div>

      {/* Edit Opportunity Modal */}
      {editModalOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1100, padding: '16px'
          }}
          onClick={(e) => { if (e.target === e.currentTarget) closeEditModal(); }}
        >
          <div style={{
            background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '600px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,.25)',
            maxHeight: '90vh', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1e2939' }}>✏️ Edit Opportunity</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6b7280' }}>Updates will be saved permanently to the portal.</p>
              </div>
              <button onClick={closeEditModal} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#9ca3af' }}>&times;</button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4b5563', marginBottom: '4px' }}>Job / Role Title *</label>
                  <input
                    type="text" required
                    value={editForm.title}
                    onChange={(e) => handleEditFieldChange('title', e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4b5563', marginBottom: '4px' }}>Company Name *</label>
                  <input
                    type="text" required
                    value={editForm.company}
                    onChange={(e) => handleEditFieldChange('company', e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4b5563', marginBottom: '4px' }}>Opportunity Type</label>
                  <select
                    value={editForm.type}
                    onChange={(e) => handleEditFieldChange('type', e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#fff' }}
                  >
                    <option value="placement">Placement</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4b5563', marginBottom: '4px' }}>Package / Stipend</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹12 LPA"
                    value={editForm.pkg}
                    onChange={(e) => handleEditFieldChange('pkg', e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4b5563', marginBottom: '4px' }}>Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Bangalore"
                    value={editForm.location}
                    onChange={(e) => handleEditFieldChange('location', e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4b5563', marginBottom: '4px' }}>Min CGPA</label>
                  <input
                    type="number" step="0.1" min="0" max="10"
                    placeholder="e.g. 7.5"
                    value={editForm.cgpa}
                    onChange={(e) => handleEditFieldChange('cgpa', e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4b5563', marginBottom: '4px' }}>Backlogs Allowed</label>
                  <select
                    value={editForm.backlogs}
                    onChange={(e) => handleEditFieldChange('backlogs', e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#fff' }}
                  >
                    <option value="Not allowed">Not allowed</option>
                    <option value="Allowed">Allowed</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4b5563', marginBottom: '4px' }}>Deadline</label>
                  <input
                    type="date"
                    value={editForm.deadline}
                    onChange={(e) => handleEditFieldChange('deadline', e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4b5563', marginBottom: '4px' }}>Eligible Branches</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science, IT, Electronics"
                  value={editForm.branches}
                  onChange={(e) => handleEditFieldChange('branches', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4b5563', marginBottom: '4px' }}>Role Description</label>
                <textarea
                  rows={3}
                  value={editForm.desc}
                  onChange={(e) => handleEditFieldChange('desc', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={closeEditModal}
                  style={{ padding: '9px 20px', borderRadius: '8px', border: '1.5px solid #d1d5db', background: '#fff', color: '#374151', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 22px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(124,58,237,.3)' }}
                >
                  Save Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
