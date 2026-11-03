import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

export default function ScheduleModal({ onClose, onAddAssessment, opportunities = [], applications = [], preselectApplicationId }) {
  const [title, setTitle] = useState('');
  // Who this round is for: one application ("app:12") or everyone who applied to a role ("opp:3")
  const schedulable = applications.filter((a) => ['Shortlisted', 'Interview'].includes(a.status));
  const isPreselectedValid = preselectApplicationId && schedulable.some((a) => a.id === Number(preselectApplicationId));
  const [jobId, setJobId] = useState(isPreselectedValid ? String(schedulable.find(a => a.id === Number(preselectApplicationId)).opportunityId) : '');
  const [selectedIds, setSelectedIds] = useState(isPreselectedValid ? [Number(preselectApplicationId)] : []);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const eligible = schedulable.filter(a => String(a.opportunityId) === jobId);
  const visible = eligible.filter(a => `${a.name} ${a.email} ${a.branch} ${a.role} ${a.jobId || ''}`.toLowerCase().includes(search.toLowerCase()));
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {
      title: validateTitle(title),
      jobId: jobId ? '' : 'Select a Job ID.',
      target: eligible.some(a => selectedIds.includes(a.id)) ? '' : 'Select at least one candidate for this job.',
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

    setSaving(true);
    const chosen = eligible.filter(a => selectedIds.includes(a.id));
    const newAssessment = {
      opportunityId: Number(jobId),
      applicationIds: chosen.map(a => a.id),
      title: title.trim(),
      role: [...new Set(chosen.map(a => a.role))].join(', '),
      date,
      time: time || '10:00 AM',
      duration,
      candidates: chosen.length,
      platform: platform.trim() || 'Google Meet',
      link: formattedLink,
      type,
      isDraft: false,
    };

    const ok = await onAddAssessment(newAssessment);
    setSaving(false);
    if (ok) onClose();
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

          <div className="form-group" style={{marginBottom:14}}><label htmlFor="schedule-job">Job ID *</label><select id="schedule-job" className="form-select" required value={jobId} onChange={event => { setJobId(event.target.value); setSelectedIds([]); setErrors(previous => ({...previous,jobId:'',target:''})); }}><option value="">Select a Job ID</option>{opportunities.map(job => <option key={job.id} value={String(job.id)}>{job.jobId} · {job.title}</option>)}</select>{errors.jobId && <span className="field-error">{errors.jobId}</span>}</div>
          {/* ── Who is this for ── */}
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label>Candidate / Application *</label>
            <input className="form-input" aria-label="Search candidates" placeholder="Search name, email, department, Job ID or role" value={search} onChange={e => setSearch(e.target.value)} />
            <div style={{maxHeight:220,overflowY:'auto',border:'1px solid #e5e7eb',padding:12,borderRadius:8}}>
              <label style={{display:'block'}}><input type="checkbox" checked={visible.length > 0 && visible.every(a => selectedIds.includes(a.id))} onChange={e => setSelectedIds(prev => e.target.checked ? [...new Set([...prev,...visible.map(a => a.id)])] : prev.filter(id => !visible.some(a => a.id === id)))} /> Select all matching candidates</label>
              {visible.map(a => <label key={a.id} style={{display:'block',padding:'8px 0'}}><input type="checkbox" checked={selectedIds.includes(a.id)} onChange={() => setSelectedIds(prev => prev.includes(a.id) ? prev.filter(id => id !== a.id) : [...prev,a.id])} /> {a.name} · {a.email} · {a.branch} · {a.role} ({a.jobId})</label>)}
              {!visible.length && <p>{!jobId ? 'Select a Job ID to see eligible candidates.' : eligible.length ? 'No candidates match your search.' : 'No shortlisted candidates are available for this job.'}</p>}
            </div><p>{selectedIds.length} selected</p>
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
                <option value="Interview">Interview</option>
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
            <button type="submit" disabled={saving} className="btn-primary-action">
              Schedule Round
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
