import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

export default function ScheduleModal({ onClose, onAddAssessment, opportunities = [], applications = [], preselectApplicationId }) {
  const [title, setTitle] = useState('');
  // Who this round is for: one application ("app:12") or everyone who applied to a role ("opp:3")
  const schedulable = applications.filter((a) => ['Shortlisted', 'Interview'].includes(a.status));
  const isPreselectedValid = preselectApplicationId && schedulable.some((a) => a.id === Number(preselectApplicationId));
  const [target, setTarget] = useState(
    isPreselectedValid ? `app:${preselectApplicationId}` : schedulable[0] ? `app:${schedulable[0].id}` : ''
  );
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState('60 min');
  const [platform, setPlatform] = useState('Google Meet');
  const [type, setType] = useState('Technical Interview');
  const [link, setLink] = useState('');

  // Validation errors
  const [errors, setErrors] = useState({});

  // ── Validators ────────────────────────────────────────────────────────────

  /**
   * Round Title: only letters, digits, spaces and hyphens.
   * Must NOT be all-numbers or all-hyphens.
   */
  const validateTitle = (val) => {
    const t = val.trim();
    if (!t) return 'Round title is required.';
    if (/[^a-zA-Z0-9 \-]/.test(t))
      return 'Title may only contain letters, numbers, spaces and hyphens ( - ).';
    if (/^[\d\s]+$/.test(t)) return 'Title cannot be all numbers.';
    if (/^[-\s]+$/.test(t))  return 'Title cannot be all hyphens.';
    return '';
  };

  /**
   * Date: must be today or in the future.
   */
  const validateDate = (val) => {
    if (!val) return 'Date is required.';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(val) < today) return 'Date cannot be in the past.';
    return '';
  };

  /**
   * Meeting link: must be a Google Meet link.
   * Accepted: meet.google.com/xxx-xxxx-xxx  (with or without https://)
   */
  const validateLink = (val) => {
    if (!val.trim()) return 'Meeting link is required.';
    const cleaned = val.trim().replace(/^https?:\/\//, '');
    if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/\S*)?$/.test(cleaned)) {
      return 'Enter a valid link, e.g. https://meet.google.com/abc-defg-hij';
    }
    return '';
  };

  // ── Change handlers ───────────────────────────────────────────────────────

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setErrors((p) => ({ ...p, title: validateTitle(e.target.value) }));
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
    setErrors((p) => ({ ...p, date: validateDate(e.target.value) }));
  };

  const handleLinkChange = (e) => {
    setLink(e.target.value);
    setErrors((p) => ({ ...p, link: validateLink(e.target.value) }));
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {
      title: validateTitle(title),
      target: target ? '' : 'Choose who this round is for.',
      date:  validateDate(date),
      link:  validateLink(link),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    // Normalise the Google Meet link
    let formattedLink = link.trim();
    if (!formattedLink.startsWith('http://') && !formattedLink.startsWith('https://')) {
      formattedLink = `https://${formattedLink}`;
    }

    const [kind, rawId] = target.split(':');
    const chosenApp = kind === 'app' ? applications.find((a) => a.id === Number(rawId)) : null;
    const chosenOpp = kind === 'opp' ? opportunities.find((o) => o.id === Number(rawId)) : null;
    const newAssessment = {
      title: title.trim(),
      role: chosenApp?.role || chosenOpp?.title || '',
      ...(chosenApp ? { applicationId: chosenApp.id, opportunityId: chosenApp.opportunityId } : {}),
      ...(chosenOpp ? { opportunityId: chosenOpp.id } : {}),
      date,
      time: time || '10:00 AM',
      duration,
      candidates: 1,
      platform: platform.trim() || 'Google Meet',
      link: formattedLink,
      type,
      isDraft: false,
    };

    onAddAssessment(newAssessment);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Schedule Assessment / Interview</h3>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ── Round Title ── */}
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label>Round Title *</label>
            <input
              type="text"
              className={`form-input${errors.title ? ' input-error' : ''}`}
              placeholder="e.g. Technical Round 1 - Problem Solving"
              value={title}
              onChange={handleTitleChange}
            />
            {errors.title && (
              <span className="field-error" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlertCircle size={12} /> {errors.title}
              </span>
            )}
          </div>

          {/* ── Who is this for ── */}
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label>Candidate / Application *</label>
            {schedulable.length > 0 ? (
              <select
                className={`form-select${errors.target ? ' input-error' : ''}`}
                value={target}
                onChange={(e) => { setTarget(e.target.value); setErrors((p) => ({ ...p, target: '' })); }}
              >
                <optgroup label="One candidate">
                  {schedulable.map((a) => (
                    <option key={a.id} value={`app:${a.id}`}>{a.name} — {a.role} ({a.status})</option>
                  ))}
                </optgroup>
                <optgroup label="Everyone who is shortlisted">
                  {opportunities.filter((o) => applications.some((a) => a.opportunityId === o.id && a.status === 'Shortlisted')).map((o) => (
                    <option key={o.id} value={`opp:${o.id}`}>All shortlisted — {o.title}</option>
                  ))}
                </optgroup>
              </select>
            ) : (
              <div className="field-error">No eligible candidates available. Only Shortlisted and Interview candidates can be scheduled.</div>
            )}
            <span style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px', display: 'block' }}>
              The candidate gets the date, time and link in their Applications page and notifications.
            </span>
            {errors.target && <span className="field-error">{errors.target}</span>}
          </div>

          {/* ── Date & Time ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                className={`form-input${errors.date ? ' input-error' : ''}`}
                value={date}
                onChange={handleDateChange}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.date && (
                <span className="field-error" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <AlertCircle size={12} /> {errors.date}
                </span>
              )}
            </div>
            <div className="form-group">
              <label>Time</label>
              <input
                type="time"
                className="form-input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* ── Round Type & Platform ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div className="form-group">
              <label>Round Type</label>
              <select
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="Online Test">Online Test</option>
                <option value="Technical Interview">Technical Interview</option>
                <option value="HR Interview">HR Interview</option>
              </select>
            </div>
            <div className="form-group">
              <label>Platform</label>
              <input
                type="text"
                className="form-input"
                placeholder="Google Meet, HackerRank, etc."
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              />
            </div>
          </div>

          {/* ── Duration ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginBottom: '14px' }}>
            <div className="form-group">
              <label>Duration</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 60 min"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>

          {/* ── Google Meet Link ── */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label>Meeting / Test Link *</label>
            <input
              type="text"
              className={`form-input${errors.link ? ' input-error' : ''}`}
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              value={link}
              onChange={handleLinkChange}
            />
            {errors.link ? (
              <span className="field-error" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlertCircle size={12} /> {errors.link}
              </span>
            ) : (
              <span style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px', display: 'block' }}>
                Google Meet, Zoom, HackerRank… any link the candidate can open
              </span>
            )}
          </div>

          {/* ── Actions ── */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn-secondary-action" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary-action">
              Schedule Round
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
