import React, { useState } from 'react';
import { X, FileText, Mail, Phone, Calendar, Eye, Download, Lock } from 'lucide-react';

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

  if (!candidate) return null;

  // Derived current status (read-only chip shown to recruiter)
  const derivedStatus = deriveStatus(localRounds);

  // Status badge colour
  const statusColor = {
    Applied:     { bg: '#E0E7FF', txt: '#4338CA' },
    Shortlisted: { bg: '#FEF3C7', txt: '#D97706' },
    Interview:   { bg: '#FCE7F3', txt: '#DB2777' },
    Offered:     { bg: '#D1FAE5', txt: '#059669' },
    Rejected:    { bg: '#FEE2E2', txt: '#DC2626' },
  }[derivedStatus] || { bg: '#F3F4F6', txt: '#6B7280' };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleRoundChange = (roundKey, val) => {
    const updated = { ...localRounds, [roundKey]: val };

    // If a round is un-passed, reset all downstream rounds to Pending
    // so they become locked and reflect the correct state.
    if (val !== 'Pass') {
      const idx = ROUND_ORDER.indexOf(roundKey);
      ROUND_ORDER.slice(idx + 1).forEach((k) => {
        updated[k] = 'Pending';
      });
    }

    setLocalRounds(updated);

    // Save each changed round key
    Object.entries(updated).forEach(([k, v]) => {
      if (v !== (localRounds[k] || 'Pending')) {
        onUpdateRound(candidate.id, k, v);
      }
    });
    // Always save the primary changed round (in case value is the same as default)
    onUpdateRound(candidate.id, roundKey, val);

    // Auto-derive and propagate new status
    const newStatus = deriveStatus(updated);
    onUpdateStatus(candidate.id, newStatus);
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
                {candidate.role} - {candidate.branch} - CGPA: {candidate.cgpa}
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
            <span>{candidate.email || 'candidate@college.edu'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Phone size={14} color="#6B7280" />
            <span>{candidate.phone || '+91 98000 12345'}</span>
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
              <span>{candidate.resumeFile || 'Resume_Document.pdf'}</span>
              <Eye size={12} />
            </button>
          </div>
        </div>

        {/* ── RESUME PREVIEW ── */}
        {showResumePreview && (
          <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <strong style={{ fontSize: '13px', color: '#065F46' }}>Resume Snapshot: {candidate.name}</strong>
              <button type="button" onClick={() => setShowResumePreview(false)} style={{ background: 'none', border: 'none', color: '#065F46', cursor: 'pointer' }}>
                <X size={15} />
              </button>
            </div>
            <p style={{ fontSize: '12px', color: '#047857', marginBottom: '8px' }}>
              <strong>Education:</strong> B.Tech in {candidate.branch} (CGPA: {candidate.cgpa}/10.0)
            </p>
            <p style={{ fontSize: '12px', color: '#047857', marginBottom: '8px' }}>
              <strong>Core Competencies:</strong> Data Structures, Algorithms, React, Node.js, SQL, System Architecture
            </p>
            <p style={{ fontSize: '12px', color: '#047857', marginBottom: '10px' }}>
              <strong>Experience / Projects:</strong> Developed campus event portal, internship with microservices backend.
            </p>
            <a
              href={`#download-${candidate.id}`}
              onClick={(e) => { e.preventDefault(); alert(`Simulated download: ${candidate.resumeFile || 'Resume.pdf'}`); }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#065F46', fontWeight: 700, textDecoration: 'none', background: '#D1FAE5', padding: '4px 10px', borderRadius: '6px' }}
            >
              <Download size={12} />
              <span>Download PDF File</span>
            </a>
          </div>
        )}

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
                  disabled={locked}
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
          <button className="btn-primary-action" onClick={onClose}>
            Done &amp; Save
          </button>
        </div>
      </div>
    </div>
  );
}
