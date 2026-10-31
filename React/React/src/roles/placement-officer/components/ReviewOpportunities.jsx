import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './styles/p2.css';
import api, { errorMessage } from '../../../services/api.js';
import { useOfficerData } from '../services/officerApi';

const REVIEW_STATUSES = ['all', 'pending', 'approved', 'published', 'rejected'];

export default function ReviewOpportunities({ onNavigate, activePage = 'p2' }) {
  const { data, refresh, ready, error: loadError } = useOfficerData();
  const submissions = data.submissions || [];
  const [activeStatus, setActiveStatus] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [openCards, setOpenCards] = useState({});
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [rejectError, setRejectError] = useState(false);

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

  const counts = REVIEW_STATUSES.reduce((result, status) => ({ ...result, [status]: 0 }), {});
  submissions.forEach((submission) => {
    counts.all += 1;
    if (Object.hasOwn(counts, submission.status)) counts[submission.status] += 1;
  });

  const filteredSubmissions = submissions.filter((submission) => {
    const matchesStatus = activeStatus === 'all' || submission.status === activeStatus;
    const matchesType = typeFilter === 'all' || submission.type === typeFilter;
    return matchesStatus && matchesType;
  });

  const toggleCard = (id) => setOpenCards((previous) => ({ ...previous, [id]: !previous[id] }));
  const approveCard = (id) => act(() => api.patch(`/opportunities/${id}/approve`));
  const undoApproval = (id) => act(() => api.patch(`/opportunities/${id}/undo-approval`));
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
    setRejectError(false);
  };

  const confirmRejection = async () => {
    const characterCount = rejectRemarks.trim().length;
    if (characterCount < 20) {
      setRejectError(true);
      return;
    }
    setRejectError(false);
    const rejected = await act(() => api.patch(`/opportunities/${rejectTarget}/reject`, { remark: rejectRemarks.trim() }));
    if (rejected) closeRejectModal();
  };

  const renderActionBar = (submission) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        {submission.status === 'pending' && <>
          <button className="btn-approve" onClick={() => approveCard(submission.id)}>Approve</button>
          <button className="btn-reject" onClick={() => openRejectModal(submission.id)}>Reject with Remarks</button>
        </>}
        {submission.status === 'approved' && <>
          <button
            type="button"
            onClick={() => undoApproval(submission.id)}
            style={{ padding: '8px 13px', borderRadius: '8px', border: '1px solid #f59e0b', background: '#fffbeb', color: '#92400e', fontSize: '13px', fontWeight: 700 }}
          >
            Undo Approval
          </button>
          <button className="btn-publish" onClick={() => publishCard(submission.id)}>Publish to Candidates</button>
        </>}
        {submission.status === 'published' && (
          <div className="live-bar" style={{ margin: 0, padding: '7px 14px' }}>Live — {submission.applied || 0} candidates applied</div>
        )}
        {submission.status === 'rejected' && (
          <div className="rejection-bar" style={{ margin: 0, padding: '7px 14px' }}>
            <strong>Rejection Remarks: </strong><span>{submission.rejectionRemark || 'No remarks provided.'}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="frame">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />
      <Header title="Review Opportunities" onNavigate={onNavigate} />
      <main className="main-content" id="mainContent">
        {loadError && <p role="alert" style={{ color: '#b91c1c', marginBottom: '12px' }}>{loadError}</p>}
        <div className="filter-tabs" aria-label="Opportunity status filters">
          {REVIEW_STATUSES.map((status) => (
            <button key={status} className={`tab${activeStatus === status ? ' active' : ''}`} onClick={() => setActiveStatus(status)}>
              {status.charAt(0).toUpperCase() + status.slice(1)} ({counts[status]})
            </button>
          ))}
          <label style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '13px', fontWeight: 600 }}>
            Type
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155' }}>
              <option value="all">All types</option>
              <option value="placement">Full-time</option>
              <option value="internship">Internship</option>
            </select>
          </label>
        </div>

        <div className="opp-list" id="oppList">
          {ready && !loadError && filteredSubmissions.length === 0 && <p style={{ color: '#64748b', padding: '24px 0' }}>{submissions.length === 0 ? 'No recruiter submissions yet. New submissions will appear here for review.' : 'No opportunities match these filters.'}</p>}
          {filteredSubmissions.map((submission) => {
            const isOpen = openCards[submission.id];
            const typeLabel = submission.type === 'internship' ? 'Internship' : 'Full-time';
            return (
              <div className={`opp-card${isOpen ? ' open' : ''}`} data-status={submission.status} key={submission.id}>
                <button type="button" className="opp-header" onClick={() => toggleCard(submission.id)} aria-expanded={Boolean(isOpen)} style={{ width: '100%', textAlign: 'left', border: 0, background: 'transparent' }}>
                  <div className="opp-left">
                    <div className="opp-avatar" style={{ background: submission.avatarBg, color: '#fff' }}>{submission.avatar}</div>
                    <div className="opp-info">
                      <div className="opp-title">{submission.title} <span className={`type-badge ${submission.type}`}>{typeLabel}</span></div>
                      <div className="opp-company">{submission.company} • {submission.location} • {submission.pkg}</div>
                      <div className="opp-meta">Submitted by: {submission.submitter} ({submission.company}) • {submission.submitted} • Deadline: {submission.deadline}</div>
                    </div>
                  </div>
                  <div className="opp-right"><span className={`status-badge ${submission.status}`}>{submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}</span><span className="chevron" aria-hidden="true">⌄</span></div>
                </button>
                <div className="opp-details">
                  <div className="details-grid">
                    <div className="detail-left"><h4>Description</h4><p>{submission.desc || 'Not specified'}</p>{submission.duration && <><h4>Duration</h4><p>{submission.duration}</p></>}</div>
                    <div className="detail-right">
                      <h4>Eligibility</h4><p>Openings: <strong>{submission.openings ?? 'Not specified'}</strong></p><p>Min CGPA: <strong>{submission.cgpa}</strong></p><p>Branches: <strong>{submission.branches}</strong></p><p>Backlogs: <strong>{submission.backlogs}</strong></p>
                      <h4>Skills Required</h4><div className="skill-tags">{(submission.skills || []).map((skill) => <span className="skill" key={skill}>{skill}</span>)}</div>
                      <h4>Rounds</h4><p className="rounds">{submission.rounds || 'Not specified'}</p>
                    </div>
                  </div>
                  {renderActionBar(submission)}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <div className={`modal-overlay review-reject-overlay${rejectModalOpen ? ' active' : ''}`} id="rejectModal" onClick={(event) => { if (event.target === event.currentTarget) closeRejectModal(); }}>
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="reject-title">
          <div className="modal-header"><h3 id="reject-title">Reject Opportunity</h3><button className="modal-close" onClick={closeRejectModal} aria-label="Close">&times;</button></div>
          <p className="modal-desc" style={{ fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Remarks / Reason for Decline <span style={{ color: '#ef4444' }}>*</span> <span style={{ fontWeight: 'normal', fontSize: '12px', color: '#6b7280' }}>(minimum 20 characters required)</span></p>
          {(() => {
            const characters = rejectRemarks.trim().length;
            return <p style={{ margin: '0 0 8px', color: characters >= 20 ? '#166534' : '#92400e', fontSize: '12px', fontWeight: 600 }}>{characters} / 20 characters {characters >= 20 ? '(minimum reached)' : '(minimum required)'}</p>;
          })()}
          <textarea className="modal-textarea" id="rejectRemarks" placeholder="Explain why this opportunity cannot be approved..." value={rejectRemarks} onChange={(event) => { setRejectRemarks(event.target.value); if (rejectError) setRejectError(false); }} style={rejectError ? { borderColor: '#ef4444', boxShadow: '0 0 0 3px rgba(239,68,68,.1)' } : {}} />
          {rejectError && <p role="alert" style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 10px' }}>Remarks must contain at least 20 characters.</p>}
          <div className="modal-actions"><button className="modal-btn-cancel" onClick={closeRejectModal}>Cancel</button><button className="modal-btn-confirm" onClick={confirmRejection}>Confirm Rejection</button></div>
        </div>
      </div>
    </div>
  );
}
