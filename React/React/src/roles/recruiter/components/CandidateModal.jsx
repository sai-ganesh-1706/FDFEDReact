import React, { useState, useEffect } from 'react';
import api from '../../../services/api.js';
import { confirmDialog } from '../../../shared/components/AppDialog.jsx';
import { X, FileText, Mail, Phone, Calendar, Eye } from 'lucide-react';

// ── Round configuration ──────────────────────────────────────────────────────
const STAGES = ['Applied', 'Shortlisted', 'Interview', 'Offered'];

export default function CandidateModal({
  candidate,
  onClose,
  onUpdateStatus,
  initialShowResumePreview = false,
}) {
  const [showResumePreview, setShowResumePreview] = useState(initialShowResumePreview);

  const [resumeBlob, setResumeBlob] = useState('');
  const [resumeError, setResumeError] = useState('');
  useEffect(() => {
    if (!showResumePreview || !candidate?.resumeUrl) return;
    let active = true; let url;
    api.get(`/applications/${candidate.id}/resume`, { responseType: 'blob' }).then(({data}) => { if (active) { url = URL.createObjectURL(data); setResumeBlob(url); } }).catch(() => { if (active) setResumeError('Could not load the resume document.'); });
    return () => { active = false; if (url) URL.revokeObjectURL(url); setResumeBlob(''); setResumeError(''); };
  }, [showResumePreview, candidate?.id, candidate?.resumeUrl]);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(candidate?.recruiterFeedback || '');
  const [rating, setRating] = useState(candidate?.recruiterRating || 5);
  if (!candidate) return null;

  // Derived current status (read-only chip shown to recruiter)
  const derivedStatus = candidate.status;

  // Status badge colour
  const statusColor = {
    Applied:     { bg: '#E0E7FF', txt: '#4338CA' },
    Shortlisted: { bg: '#FEF3C7', txt: '#D97706' },
    Interview:   { bg: '#FCE7F3', txt: '#DB2777' },
    Offered:     { bg: '#D1FAE5', txt: '#059669' },
    Rejected:    { bg: '#FEE2E2', txt: '#DC2626' },
  }[derivedStatus] || { bg: '#F3F4F6', txt: '#6B7280' };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const stageIndex = STAGES.indexOf(derivedStatus);
  const nextStatus = stageIndex >= 0 ? STAGES[stageIndex + 1] : null;
  const updateStatus = async (status) => {
    if (saving) return;
    setSaving(true);
    try { await onUpdateStatus(candidate.id, status); }
    finally { setSaving(false); }
  };
  const handleReject = async () => {
    if (saving || !await confirmDialog(`Reject ${candidate.name} for ${candidate.role}?`)) return;
    await updateStatus('Rejected');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '660px' }}>
        {/* ── HEADER ── */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="app-card-avatar" style={{ width: '50px', height: '50px', fontSize: '18px' }}>
              {candidate.initials}
            </div>
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {candidate.name}
                {candidate.isReferred && <span className="tag-referred-badge">Referred</span>}
              </h3>
              <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>
                {candidate.role} ({candidate.jobId}) - {candidate.branch} - CGPA: {candidate.cgpa}
              </p>
            </div>
          </div>

          <button className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <section style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16, marginBottom: 18 }}>
          <h4 style={{ marginBottom: 8 }}>Candidate feedback</h4>
          <label style={{ display: 'block', fontSize: 13, marginBottom: 8 }}>Rating
            <select value={rating} onChange={(event) => setRating(Number(event.target.value))} style={{ marginLeft: 10, padding: 6 }}>
              {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value} / 5</option>)}
            </select>
          </label>
          <textarea value={feedback} onChange={(event) => setFeedback(event.target.value)} rows={3} maxLength={2000} placeholder="Share feedback with the candidate" style={{ width: '100%', resize: 'vertical' }} />
          <button type="button" className="btn-secondary-action" disabled={saving || !feedback.trim()} onClick={async () => { setSaving(true); try { await onUpdateStatus(candidate.id, { recruiterRating: rating, recruiterFeedback: feedback.trim(), feedbackSent: true }); } finally { setSaving(false); } }}>Send feedback</button>
        </section>

        {/* ── REFERRAL INFO CARD ── */}
        {candidate.isReferred && candidate.referrerName && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '16px',
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: candidate.referrerAvatarColor || '#D97706',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: 700,
              flexShrink: 0,
            }}>
              {candidate.referrerInitials || candidate.referrerName.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#92400E', fontWeight: 700, marginBottom: '2px' }}>
                Referred by Alumni
              </div>
              <div style={{ fontSize: '13px', color: '#78350F' }}>
                <strong>{candidate.referrerName}</strong>
                {candidate.referrerCompany && <span style={{ color: '#92400E' }}> - {candidate.referrerCompany}</span>}
                {candidate.referrerBatch && <span style={{ color: '#B45309', fontStyle: 'italic' }}> - {candidate.referrerBatch}</span>}
              </div>
              {(candidate.referrerDesignation || candidate.referrerEmail) && (
                <div style={{ fontSize: '12px', color: '#92400E', marginTop: 2 }}>
                  {candidate.referrerDesignation}{candidate.referrerDesignation && candidate.referrerEmail ? ' - ' : ''}{candidate.referrerEmail}
                </div>
              )}
              {candidate.referralNote && (
                <div style={{ fontSize: '12px', color: '#92400E', marginTop: 4, fontStyle: 'italic' }}>"{candidate.referralNote}"</div>
              )}
            </div>
          </div>
        )}

        {/* ── CONTACT ROW ── */}
        <div style={{
          background: '#F9FAFB',
          border: '1px solid #E5E7EB',
          borderRadius: '10px',
          padding: '14px',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
          fontSize: '12px',
          color: '#4B5563',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Mail size={14} color="#6B7280" />
            <span>{candidate.email || 'Not provided'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Phone size={14} color="#6B7280" />
            <span>{candidate.phone || 'Not provided'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} color="#6B7280" />
            <span>Applied on: {candidate.appliedDate || 'Recent'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={14} color="#0F8F63" />
            <button
              type="button"
              onClick={() => setShowResumePreview(!showResumePreview)}
              style={{
                background: 'none', border: 'none', color: '#0F8F63', fontWeight: 600,
                cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center',
                gap: '4px', textDecoration: 'underline'
              }}
            >
              <span>Resume</span>
              <Eye size={12} />
            </button>
          </div>
        </div>

        {/* ── RESUME PREVIEW ── */}
        {showResumePreview && <section style={{marginBottom:20}}><h4>Resume · {candidate.name}</h4>{candidate.resumeUrl ? resumeError ? <p>{resumeError}</p> : !resumeBlob ? <p>Loading resume…</p> : <>{candidate.resumeUrl.toLowerCase().endsWith('.pdf') ? <iframe title={`${candidate.name} application resume`} src={resumeBlob} style={{width:'100%',height:480,border:'1px solid #e5e7eb'}} /> : <p>This application includes a Word document. Open or download the exact file submitted with this application.</p>}<a href={resumeBlob} target="_blank" rel="noreferrer" download={candidate.resumeUrl.toLowerCase().endsWith('.pdf') ? undefined : candidate.resumeFile || true}>Open / download application resume</a></> : <p>No resume was attached to this application. Ask the candidate to apply again with the selected resume.</p>}</section>}

        {/* ── AUTO-DERIVED PIPELINE STATUS (read-only) ── */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#6B7280', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
            Current Pipeline Status
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              background: statusColor.bg,
              color: statusColor.txt,
              fontWeight: 700,
              fontSize: '13px',
              padding: '6px 16px',
              borderRadius: '20px',
              border: `1px solid ${statusColor.txt}33`
            }}>
              {derivedStatus}
            </span>
            <span style={{ fontSize: '12px', color: '#6B7280', fontStyle: 'italic' }}>
              The same status is shown to the candidate and placement officer
            </span>
          </div>
        </div>

        {/* Application stages */}
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {STAGES.map((stage, index) => (
            <span key={stage} style={{ padding: '7px 12px', borderRadius: 20, background: stage === derivedStatus ? '#d1fae5' : index < STAGES.indexOf(derivedStatus) ? '#f0fdf4' : '#f3f4f6', color: stage === derivedStatus ? '#047857' : '#6b7280', fontWeight: stage === derivedStatus ? 700 : 500, fontSize: 12 }}>
              {stage}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        {nextStatus && (
          <button type="button" className="btn-primary-action" disabled={saving} onClick={() => updateStatus(nextStatus)}>
            {saving ? 'Moving…' : `Move to next round: ${nextStatus}`}
          </button>
        )}
        {!['Offered', 'Rejected', 'Withdrawn'].includes(derivedStatus) && (
          <button type="button" className="btn-secondary-action" disabled={saving} onClick={handleReject} style={{ color: '#b91c1c', borderColor: '#fecaca' }}>
            {saving ? 'Updating…' : 'Reject candidate'}
          </button>
        )}
        </div>

        <div style={{ marginTop: '4px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-primary-action" disabled={saving} onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
