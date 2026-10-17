import React, { useState } from 'react';
import { X, FileText, Mail, Phone, Calendar, Eye, Download, Star, Send, ChevronDown, ChevronUp, Lock } from 'lucide-react';

// Star Rating Component
function StarRating({ value, onChange, label, disabled }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F3F4F6' }}>
      <span style={{ fontSize: '13px', color: '#374151', fontWeight: 500, minWidth: '160px' }}>{label}</span>
      <div style={{ display: 'flex', gap: '4px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !disabled && onChange(star)}
            onMouseEnter={() => !disabled && setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            style={{
              background: 'none',
              border: 'none',
              cursor: disabled ? 'not-allowed' : 'pointer',
              padding: '2px',
              color: star <= (hovered || value) ? '#F59E0B' : '#D1D5DB',
              transition: 'color 0.1s',
              opacity: disabled ? 0.5 : 1
            }}
          >
            <Star size={18} fill={star <= (hovered || value) ? '#F59E0B' : 'none'} />
          </button>
        ))}
        <span style={{ fontSize: '12px', color: '#6B7280', marginLeft: '6px', minWidth: '24px' }}>
          {value > 0 ? `${value}/5` : '—'}
        </span>
      </div>
    </div>
  );
}

// ── Round configuration ──────────────────────────────────────────────────────
const ROUND_KEYS = [
  { key: 'resume',     label: '1. Resume Screening' },
  { key: 'assessment', label: '2. Online Assessment' },
  { key: 'technical',  label: '3. Technical Interview' },
  { key: 'hr',         label: '4. HR / Behavioral Interview' },
];

// Options per round
const ROUND_OPTIONS = {
  resume:     ['Pending', 'Reviewing', 'Pass', 'Fail'],
  assessment: ['Pending', 'Pass', 'Fail'],
  technical:  ['Pending', 'Pass', 'Fail'],
  hr:         ['Pending', 'Pass', 'Fail'],
};

// Ordered pipeline — each round requires the previous to be 'Pass' to unlock
const ROUND_ORDER = ['resume', 'assessment', 'technical', 'hr'];

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
 *   Resume Pending / Reviewing          → Applied
 *   Resume Pass                         → Shortlisted   (wait — next round pending)
 *   Assessment in progress (Pending)    → Assessment
 *   Assessment Pass                     → Interview     (in technical / HR stage)
 *   Technical or HR Pending / Pass      → Interview
 *   Any round Fail                      → Rejected
 *   HR Pass (all rounds passed)         → Offered
 */
function deriveStatus(rounds = {}) {
  const { resume, assessment, technical, hr } = rounds;

  // Any fail → Rejected immediately
  if (resume === 'Fail' || assessment === 'Fail' || technical === 'Fail' || hr === 'Fail') return 'Rejected';

  // All rounds passed → Offered
  if (hr === 'Pass') return 'Offered';

  // HR or Technical in progress (assessment already passed → Interview stage)
  if (assessment === 'Pass') return 'Interview';

  // Resume passed → candidate moves to Assessment stage
  if (resume === 'Pass') return 'Shortlisted';

  // Resume being reviewed
  if (resume === 'Reviewing') return 'Applied';

  // Default
  return 'Applied';
}

/**
 * Returns true only when at least one round (other than 'resume') has been
 * completed (Pass or Fail), meaning the recruiter has assessed them beyond screening.
 */
function hasCompletedAnyAssessmentRound(rounds = {}) {
  return ['assessment', 'technical', 'hr'].some(
    (k) => rounds[k] === 'Pass' || rounds[k] === 'Fail'
  );
}

const METRIC_FIELDS = [
  { key: 'technicalSkills',    label: 'Technical Skills' },
  { key: 'problemSolving',     label: 'Problem Solving' },
  { key: 'communication',      label: 'Communication' },
  { key: 'confidence',         label: 'Confidence' },
  { key: 'overallPerformance', label: 'Overall Performance' },
];

export default function CandidateModal({
  candidate,
  onClose,
  onUpdateStatus,
  onUpdateRound,
  onUpdateEvaluation,
}) {
  const [showResumePreview, setShowResumePreview] = useState(false);
  const [showEvaluation, setShowEvaluation]       = useState(false);
  const [showFeedback, setShowFeedback]           = useState(false);

  // Local round state (synced from candidate.rounds)
  const [localRounds, setLocalRounds] = useState(candidate?.rounds || {});

  // Evaluation metrics state
  const [metrics, setMetrics] = useState({
    technicalSkills:    candidate?.evaluation?.technicalSkills    || 0,
    problemSolving:     candidate?.evaluation?.problemSolving     || 0,
    communication:      candidate?.evaluation?.communication      || 0,
    confidence:         candidate?.evaluation?.confidence         || 0,
    overallPerformance: candidate?.evaluation?.overallPerformance || 0,
  });

  // Feedback state
  const [feedbackText, setFeedbackText] = useState(candidate?.recruiterFeedback || '');
  const [feedbackSent, setFeedbackSent] = useState(!!candidate?.feedbackSent);

  if (!candidate) return null;

  // Whether the recruiter is allowed to enter evaluation metrics
  const evalUnlocked = hasCompletedAnyAssessmentRound(localRounds);

  // Derived current status (read-only chip shown to recruiter)
  const derivedStatus = deriveStatus(localRounds);

  // Status badge colour
  const statusColor = {
    Applied:     { bg: '#E0E7FF', txt: '#4338CA' },
    Shortlisted: { bg: '#FEF3C7', txt: '#D97706' },
    Assessment:  { bg: '#EDE9FE', txt: '#7C3AED' },
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

  const handleMetricChange = (key, value) => {
    const updated = { ...metrics, [key]: value };
    setMetrics(updated);
    if (onUpdateEvaluation) {
      onUpdateEvaluation(candidate.id, updated);
    }
  };

  const avgScore = () => {
    const vals = Object.values(metrics).filter((v) => v > 0);
    if (vals.length === 0) return null;
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  };

  const handleSendFeedback = () => {
    if (!feedbackText.trim()) {
      alert('Please write some feedback before sending.');
      return;
    }
    if (onUpdateEvaluation) {
      onUpdateEvaluation(candidate.id, metrics, feedbackText.trim(), true);
    }
    setFeedbackSent(true);
    alert(`✅ Feedback sent to ${candidate.email || candidate.name}!`);
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
                {candidate.isReferred && <span className="tag-referred-badge">⭐ Referred</span>}
              </h3>
              <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>
                {candidate.role} · {candidate.branch} · CGPA: {candidate.cgpa}
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
                🤝 Referred by Alumni
              </div>
              <div style={{ fontSize: '13px', color: '#78350F' }}>
                <strong>{candidate.referrerName}</strong>
                {candidate.referrerCompany && <span style={{ color: '#92400E' }}> · {candidate.referrerCompany}</span>}
                {candidate.referrerBatch && <span style={{ color: '#B45309', fontStyle: 'italic' }}> · {candidate.referrerBatch}</span>}
              </div>
              {(candidate.referrerDesignation || candidate.referrerEmail) && (
                <div style={{ fontSize: '12px', color: '#92400E', marginTop: 2 }}>
                  {candidate.referrerDesignation}{candidate.referrerDesignation && candidate.referrerEmail ? ' · ' : ''}{candidate.referrerEmail}
                </div>
              )}
              {candidate.referralNote && (
                <div style={{ fontSize: '12px', color: '#92400E', marginTop: 4, fontStyle: 'italic' }}>“{candidate.referralNote}”</div>
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
              <strong style={{ fontSize: '13px', color: '#065F46' }}>📄 Resume Snapshot: {candidate.name}</strong>
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

        {/* ── EVALUATION METRICS ── */}
        <div style={{ border: '1px solid #E5E7EB', borderRadius: '10px', marginBottom: '16px', overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => evalUnlocked && setShowEvaluation(!showEvaluation)}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              background: evalUnlocked ? (showEvaluation ? '#FFFBEB' : '#F9FAFB') : '#F3F4F6',
              border: 'none',
              cursor: evalUnlocked ? 'pointer' : 'not-allowed',
              borderBottom: showEvaluation ? '1px solid #E5E7EB' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {evalUnlocked ? <Star size={15} color="#F59E0B" fill="#F59E0B" /> : <Lock size={15} color="#9CA3AF" />}
              <span style={{ fontSize: '13px', fontWeight: 700, color: evalUnlocked ? '#374151' : '#9CA3AF' }}>
                Evaluation Metrics
              </span>
              {!evalUnlocked && (
                <span style={{ fontSize: '11px', color: '#9CA3AF', fontStyle: 'italic' }}>
                  — Complete at least one assessment round first
                </span>
              )}
              {evalUnlocked && avgScore() && (
                <span style={{ background: '#FEF3C7', color: '#B45309', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', border: '1px solid #FDE68A' }}>
                  Avg: {avgScore()} / 5
                </span>
              )}
            </div>
            {evalUnlocked
              ? (showEvaluation ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />)
              : <Lock size={14} color="#D1D5DB" />}
          </button>

          {showEvaluation && evalUnlocked && (
            <div style={{ padding: '14px 16px' }}>
              <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '10px' }}>
                Rate the candidate's performance across each dimension (1 = Poor, 5 = Excellent):
              </p>
              {METRIC_FIELDS.map(({ key, label }) => (
                <StarRating
                  key={key}
                  label={label}
                  value={metrics[key]}
                  onChange={(val) => handleMetricChange(key, val)}
                  disabled={false}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── SHARE FEEDBACK ── */}
        <div style={{ border: '1px solid #E5E7EB', borderRadius: '10px', marginBottom: '20px', overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => evalUnlocked && setShowFeedback(!showFeedback)}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              background: evalUnlocked ? (showFeedback ? '#F0FDF4' : '#F9FAFB') : '#F3F4F6',
              border: 'none',
              cursor: evalUnlocked ? 'pointer' : 'not-allowed',
              borderBottom: showFeedback ? '1px solid #E5E7EB' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {evalUnlocked ? <Send size={15} color="#0F8F63" /> : <Lock size={15} color="#9CA3AF" />}
              <span style={{ fontSize: '13px', fontWeight: 700, color: evalUnlocked ? '#374151' : '#9CA3AF' }}>
                Share Feedback with Candidate
              </span>
              {!evalUnlocked && (
                <span style={{ fontSize: '11px', color: '#9CA3AF', fontStyle: 'italic' }}>
                  — Unlocks after an assessment round is completed
                </span>
              )}
              {evalUnlocked && feedbackSent && (
                <span style={{ background: '#ECFDF5', color: '#059669', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', border: '1px solid #A7F3D0' }}>
                  ✓ Sent
                </span>
              )}
            </div>
            {evalUnlocked
              ? (showFeedback ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />)
              : <Lock size={14} color="#D1D5DB" />}
          </button>

          {showFeedback && evalUnlocked && (
            <div style={{ padding: '14px 16px' }}>
              <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '10px' }}>
                Write your feedback below. It will be shared with{' '}
                <strong>{candidate.name}</strong> at{' '}
                <span style={{ color: '#0F8F63' }}>{candidate.email || 'their registered email'}</span>.
              </p>
              <textarea
                className="form-textarea"
                rows={4}
                style={{ width: '100%', resize: 'vertical', boxSizing: 'border-box', fontSize: '13px' }}
                placeholder="e.g. Great problem-solving skills. Could improve on system design concepts. Overall a strong candidate for the role…"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                disabled={feedbackSent}
              />
              {feedbackSent ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', padding: '10px 14px', background: '#ECFDF5', borderRadius: '8px', border: '1px solid #A7F3D0', fontSize: '13px', color: '#059669', fontWeight: 600 }}>
                  ✅ Feedback has been sent to the candidate.
                  <button
                    type="button"
                    onClick={() => setFeedbackSent(false)}
                    style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#6B7280', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Edit &amp; Resend
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSendFeedback}
                  style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', background: '#0F8F63', color: 'white', border: 'none', padding: '9px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  <Send size={14} />
                  Send Feedback to Candidate
                </button>
              )}
            </div>
          )}
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
