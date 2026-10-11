import React, { useState } from 'react';
import { X, FileText, Mail, Phone, Calendar, Eye, Download, Star, Send, ChevronDown, ChevronUp } from 'lucide-react';

// Star Rating Component
function StarRating({ value, onChange, label }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F3F4F6' }}>
      <span style={{ fontSize: '13px', color: '#374151', fontWeight: 500, minWidth: '160px' }}>{label}</span>
      <div style={{ display: 'flex', gap: '4px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px',
              color: star <= (hovered || value) ? '#F59E0B' : '#D1D5DB',
              transition: 'color 0.1s'
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

export default function CandidateModal({ 
  candidate, 
  onClose, 
  onUpdateStatus, 
  onUpdateRound,
  onUpdateEvaluation,
}) {
  const [showResumePreview, setShowResumePreview] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Evaluation metrics state (initialise from saved data if present)
  const [metrics, setMetrics] = useState({
    technicalSkills: candidate?.evaluation?.technicalSkills || 0,
    problemSolving: candidate?.evaluation?.problemSolving || 0,
    communication: candidate?.evaluation?.communication || 0,
    confidence: candidate?.evaluation?.confidence || 0,
    overallPerformance: candidate?.evaluation?.overallPerformance || 0,
  });

  // Feedback state
  const [feedbackText, setFeedbackText] = useState(candidate?.recruiterFeedback || '');
  const [feedbackSent, setFeedbackSent] = useState(!!candidate?.feedbackSent);

  if (!candidate) return null;

  const statuses = ['Applied', 'Shortlisted', 'Assessment', 'Interview', 'Offered', 'Rejected'];

  const roundKeys = [
    { key: 'resume', label: '1. Resume Screening' },
    { key: 'assessment', label: '2. Online Assessment' },
    { key: 'technical', label: '3. Technical Interview' },
    { key: 'hr', label: '4. HR / Behavioral Interview' }
  ];

  const roundOptions = ['Pending', 'Scheduled', 'Reviewing', 'Pass', 'Fail'];

  const metricFields = [
    { key: 'technicalSkills', label: 'Technical Skills' },
    { key: 'problemSolving', label: 'Problem Solving' },
    { key: 'communication', label: 'Communication' },
    { key: 'confidence', label: 'Confidence' },
    { key: 'overallPerformance', label: 'Overall Performance' },
  ];

  const handleMetricChange = (key, value) => {
    const updated = { ...metrics, [key]: value };
    setMetrics(updated);
    if (onUpdateEvaluation) {
      onUpdateEvaluation(candidate.id, updated);
    }
  };

  const avgScore = () => {
    const vals = Object.values(metrics).filter(v => v > 0);
    if (vals.length === 0) return null;
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  };

  const handleSendFeedback = () => {
    if (!feedbackText.trim()) {
      alert('Please write some feedback before sending.');
      return;
    }
    // In a real app this would call an API. Here we persist via the parent.
    if (onUpdateEvaluation) {
      onUpdateEvaluation(candidate.id, metrics, feedbackText.trim(), true);
    }
    setFeedbackSent(true);
    alert(`✅ Feedback sent to ${candidate.email || candidate.name}!`);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '660px' }}>
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

        {/* Contact & Details Row */}
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
                background: 'none', 
                border: 'none', 
                color: '#0F8F63', 
                fontWeight: 600, 
                cursor: 'pointer',
                padding: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'underline'
              }}
            >
              <span>{candidate.resumeFile || 'Resume_Document.pdf'}</span>
              <Eye size={12} />
            </button>
          </div>
        </div>

        {/* RESUME PREVIEW PANEL */}
        {showResumePreview && (
          <div style={{ 
            background: '#ECFDF5', 
            border: '1px solid #A7F3D0', 
            borderRadius: '10px', 
            padding: '16px', 
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <strong style={{ fontSize: '13px', color: '#065F46' }}>
                📄 Resume Snapshot: {candidate.name}
              </strong>
              <button 
                type="button" 
                onClick={() => setShowResumePreview(false)}
                style={{ background: 'none', border: 'none', color: '#065F46', cursor: 'pointer' }}
              >
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
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '4px', 
                fontSize: '11px', 
                color: '#065F46', 
                fontWeight: 700,
                textDecoration: 'none',
                background: '#D1FAE5',
                padding: '4px 10px',
                borderRadius: '6px'
              }}
            >
              <Download size={12} />
              <span>Download PDF File</span>
            </a>
          </div>
        )}

        {/* Change Stage / Status */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#6B7280', letterSpacing: '0.5px' }}>
            Current Pipeline Stage
          </label>
          <div className="status-chips-grid">
            {statuses.map((st) => (
              <button
                key={st}
                type="button"
                className={`status-select-chip ${candidate.status === st ? 'active' : ''}`}
                onClick={() => onUpdateStatus(candidate.id, st)}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Round Evaluations */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#6B7280', letterSpacing: '0.5px', marginBottom: '8px', display: 'block' }}>
            Round-by-Round Evaluations
          </label>

          {roundKeys.map((round) => {
            const currentResult = candidate.rounds?.[round.key] || 'Pending';
            return (
              <div key={round.key} className="round-row-card">
                <span className="round-name">{round.label}</span>
                <select 
                  className="round-select"
                  value={currentResult}
                  onChange={(e) => onUpdateRound(candidate.id, round.key, e.target.value)}
                  style={{
                    color: currentResult === 'Pass' ? '#059669' : currentResult === 'Fail' ? '#DC2626' : '#2563EB',
                    borderColor: currentResult === 'Pass' ? '#A7F3D0' : '#E5E7EB'
                  }}
                >
                  {roundOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>

        {/* ───── EVALUATION METRICS SECTION ───── */}
        <div style={{ 
          border: '1px solid #E5E7EB', 
          borderRadius: '10px', 
          marginBottom: '16px', 
          overflow: 'hidden' 
        }}>
          <button
            type="button"
            onClick={() => setShowEvaluation(!showEvaluation)}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              background: showEvaluation ? '#FFFBEB' : '#F9FAFB',
              border: 'none',
              cursor: 'pointer',
              borderBottom: showEvaluation ? '1px solid #E5E7EB' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={15} color="#F59E0B" fill="#F59E0B" />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>
                Evaluation Metrics
              </span>
              {avgScore() && (
                <span style={{ 
                  background: '#FEF3C7', 
                  color: '#B45309', 
                  fontSize: '11px', 
                  fontWeight: 700, 
                  padding: '2px 8px', 
                  borderRadius: '12px',
                  border: '1px solid #FDE68A'
                }}>
                  Avg: {avgScore()} / 5
                </span>
              )}
            </div>
            {showEvaluation ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
          </button>

          {showEvaluation && (
            <div style={{ padding: '14px 16px' }}>
              <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '10px' }}>
                Rate the candidate's performance across each dimension (1 = Poor, 5 = Excellent):
              </p>
              {metricFields.map(({ key, label }) => (
                <StarRating
                  key={key}
                  label={label}
                  value={metrics[key]}
                  onChange={(val) => handleMetricChange(key, val)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ───── SHARE FEEDBACK SECTION ───── */}
        <div style={{ 
          border: '1px solid #E5E7EB', 
          borderRadius: '10px', 
          marginBottom: '20px',
          overflow: 'hidden'
        }}>
          <button
            type="button"
            onClick={() => setShowFeedback(!showFeedback)}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              background: showFeedback ? '#F0FDF4' : '#F9FAFB',
              border: 'none',
              cursor: 'pointer',
              borderBottom: showFeedback ? '1px solid #E5E7EB' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Send size={15} color="#0F8F63" />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>
                Share Feedback with Candidate
              </span>
              {feedbackSent && (
                <span style={{ 
                  background: '#ECFDF5', 
                  color: '#059669', 
                  fontSize: '11px', 
                  fontWeight: 700, 
                  padding: '2px 8px', 
                  borderRadius: '12px',
                  border: '1px solid #A7F3D0'
                }}>
                  ✓ Sent
                </span>
              )}
            </div>
            {showFeedback ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
          </button>

          {showFeedback && (
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
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginTop: '10px',
                  padding: '10px 14px',
                  background: '#ECFDF5',
                  borderRadius: '8px',
                  border: '1px solid #A7F3D0',
                  fontSize: '13px',
                  color: '#059669',
                  fontWeight: 600
                }}>
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
                  style={{
                    marginTop: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#0F8F63',
                    color: 'white',
                    border: 'none',
                    padding: '9px 18px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
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
