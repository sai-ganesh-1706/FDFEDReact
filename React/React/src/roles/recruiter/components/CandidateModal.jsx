import React, { useState, useEffect } from 'react';
import api from '../../../services/api.js';
import { X, FileText, Mail, Phone, Calendar, Eye, Lock } from 'lucide-react';

// ── Round configuration ──────────────────────────────────────────────────────
const ROUND_KEYS = [
  { key: 'resume',    label: '1. Resume Screening' },
  { key: 'technical', label: '2. Technical Interview' },
  { key: 'hr',        label: '3. Interview' },
];

// Options per round
const ROUND_OPTIONS = {
  resume:    ['Pending', 'Pass', 'Fail'],
  technical: ['Pending', 'Pass', 'Fail'],
  hr:        ['Pending', 'Pass', 'Fail'],
};

// Ordered pipeline — each round requires the previous to be 'Pass' to unlock
const ROUND_ORDER = ['resume', 'technical', 'hr'];

/**
 * Returns true when a round is locked (previous round is not 'Pass').
 * The first round (resume) is never locked.
 */
function isRoundLocked(roundKey, rounds = {}) {
  const idx = ROUND_ORDER.indexOf(roundKey);
  if (idx <= 0) return false; // resume is always editable
  const prevKey = ROUND_ORDER[idx - 1];
  return (rounds[prevKey] || 'Pending') !== 'Pass';
}

/**
 * Derives the pipeline status automatically from round results.
 *
 * Status rules:
 *   Any round Fail           -> Rejected
 *   HR Pass                  -> Offered
 *   Technical Pass           -> Interview
 *   Resume Pass              -> Shortlisted
 *   default                  -> Applied
 */
function deriveStatus(rounds = {}) {
  const { resume, technical, hr } = rounds;
  if (resume === 'Fail' || technical === 'Fail' || hr === 'Fail') return 'Rejected';
  if (hr === 'Pass') return 'Offered';
  if (technical === 'Pass') return 'Interview';
  if (resume === 'Pass') return 'Shortlisted';
  return 'Applied';
}

export default function CandidateModal({
  candidate,
  onClose,
  onUpdateStatus,
  onUpdateRound,
  onUpdateEvaluation,
}) {
  const [showResumePreview, setShowResumePreview] = useState(false);

  // Local round state (synced from candidate.rounds)
  const [localRounds, setLocalRounds] = useState(candidate?.rounds || {});

  const [resumeBlob, setResumeBlob] = useState('');
  const [resumeError, setResumeError] = useState('');
  useEffect(() => {
    if (!showResumePreview || !candidate?.resumeUrl) return;
    let active = true; let url;
    api.get(`/applications/${candidate.id}/resume`, { responseType: 'blob' }).then(({data}) => { if (active) { url = URL.createObjectURL(data); setResumeBlob(url); } }).catch(() => { if (active) setResumeError('Could not load the resume document.'); });
    return () => { active = false; if (url) URL.revokeObjectURL(url); setResumeBlob(''); setResumeError(''); };
  }, [showResumePreview, candidate?.id, candidate?.resumeUrl]);
  const [saving, setSaving] = useState(false);
  useEffect(() => { setLocalRounds(candidate?.rounds || {}); }, [candidate?.rounds]);
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

  const handleRoundChange = async (roundKey, val) => {
    const updated = { ...localRounds, [roundKey]: val };

    // If a round is un-passed, reset all downstream rounds to Pending
    // so they become locked and reflect the correct state.
    if (val !== 'Pass') {
      const idx = ROUND_ORDER.indexOf(roundKey);
      ROUND_ORDER.slice(idx + 1).forEach((k) => {
        updated[k] = 'Pending';
      });
    }

    setSaving(true);
    const ok = await onUpdateRound(candidate.id, updated, deriveStatus(updated));
    if (ok) setLocalRounds(updated);
    setSaving(false);
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
        {showResumePreview && <section style={{marginBottom:20}}><h4>Resume · {candidate.name}</h4>{candidate.resumeUrl ? resumeError ? <p>{resumeError}</p> : !resumeBlob ? <p>Loading resume…</p> : <>{candidate.resumeUrl.endsWith('.pdf') ? <iframe title={`${candidate.name} resume`} src={resumeBlob} style={{width:'100%',height:480,border:'1px solid #e5e7eb'}} /> : <p>This Word document is available to download. Upload a PDF for an in-window preview.</p>}<a href={resumeBlob} download>Download resume</a></> : <p>No resume document is available for this application. {candidate.resumeFile ? `Recorded filename: ${candidate.resumeFile}` : ''}</p>}</section>}

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
              Auto-updated based on round results below
            </span>
          </div>
        </div>

        {/* ── ROUND-BY-ROUND EVALUATIONS ── */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#6B7280', letterSpacing: '0.5px', marginBottom: '8px', display: 'block' }}>
            Round-by-Round Results
          </label>

          {ROUND_KEYS.map((round) => {
            const currentResult = localRounds[round.key] || 'Pending';
            const locked = isRoundLocked(round.key, localRounds);
            const opts = ROUND_OPTIONS[round.key];
            const idx = ROUND_ORDER.indexOf(round.key);
            const prevLabel = idx > 0 ? ROUND_KEYS[idx - 1].label : '';
            return (
              <div
                key={round.key}
                className="round-row-card"
                style={{ opacity: locked ? 0.55 : 1 }}
                title={locked ? `Unlock by marking "${prevLabel}" as Pass first` : undefined}
              >
                <span className="round-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {locked && <Lock size={13} color="#9CA3AF" />}
                  {round.label}
                  {locked && (
                    <span style={{ fontSize: '11px', color: '#9CA3AF', fontStyle: 'italic', fontWeight: 400 }}>
                      — locked
                    </span>
                  )}
                </span>
                <select
                  className="round-select"
                  value={currentResult}
                  disabled={locked || saving}
                  onChange={(e) => handleRoundChange(round.key, e.target.value)}
                  style={{
                    color: locked ? '#9CA3AF' : currentResult === 'Pass' ? '#059669' : currentResult === 'Fail' ? '#DC2626' : '#2563EB',
                    borderColor: locked ? '#E5E7EB' : currentResult === 'Pass' ? '#A7F3D0' : '#E5E7EB',
                    background: locked ? '#F9FAFB' : undefined,
                    cursor: locked ? 'not-allowed' : 'pointer',
                  }}
                >
                  {opts.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            );
          })}
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
