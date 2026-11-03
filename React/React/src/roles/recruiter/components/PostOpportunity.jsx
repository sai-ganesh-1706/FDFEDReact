import { infoDialog } from '../../../shared/components/AppDialog.jsx';
import React, { useState } from 'react';
import { LocationAdder, SkillAdder, BranchSelector } from './OpportunityFields.jsx';
import { getTodayStr, getMaxDeadlineStr, validateTitle, validateCtcLpa, validateInternComp, validateCgpa, validateDeadline } from '../data/opportunityValidation.js';

// ── Shared helpers ────────────────────────────────────────────────────────────

/**
 * Returns true if an opportunity with the same title (case-insensitive)
 * AND the same type already exists in the list.
 */
function isDuplicate(existingOpportunities, title, type) {
  const normalised = title.trim().toLowerCase();
  return existingOpportunities.some(
    (o) =>
      o.title.trim().toLowerCase() === normalised &&
      o.type === type
  );
}

// ── Full-Time Form ────────────────────────────────────────────────────────────

function FullTimeForm({ onAddOpportunity, setActiveTab, existingOpportunities }) {
  const [jobId, setJobId] = useState('');
  const [title, setTitle] = useState('');
  const [locations, setLocations] = useState([]);
  const [ctcLpa, setCtcLpa] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [skills, setSkills] = useState([]);
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {
      jobId: /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/.test(jobId.trim()) ? '' : 'Enter a Job ID using letters, numbers, dots, underscores or hyphens.',
      title: validateTitle(title),
      ctcLpa: validateCtcLpa(ctcLpa),
      cgpa: validateCgpa(cgpa),
      deadline: validateDeadline(deadline),
    };
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    if (locations.length === 0) { infoDialog('Please add at least one work location.'); return; }
    if (selectedBranches.length === 0) { infoDialog('Please select at least one eligible branch.'); return; }

    // Duplicate check — same title + same type
    if (isDuplicate(existingOpportunities, title, 'Full-Time')) {
      setErrors((prev) => ({
        ...prev,
        title: `A Full-Time opportunity named "${title.trim()}" already exists. Use a different title.`,
      }));
      return;
    }

    onAddOpportunity({
      id: Date.now(),
      jobId: jobId.trim(),
      title: title.trim(),
      location: locations.join(' | '),
      locations,
      ctc: ctcLpa ? `${ctcLpa} LPA` : 'Not specified',
      cgpa: cgpa || '0',
      type: 'Full-Time',
      branches: selectedBranches,
      skills,
      applications: 0,
      deadline,
      status: 'Published',
      description: description.trim() || 'Role details will be shared with shortlisted applicants.',
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-group"><label>Job ID *</label><input className="form-input" required maxLength={80} value={jobId} onChange={e => setJobId(e.target.value)} placeholder="e.g. ENG-2026-001" />{errors.jobId && <span className="field-error">{errors.jobId}</span>}</div>
        {/* Title */}
        <div className="form-group">
          <label>Job Title *</label>
          <input
            type="text"
            className={`form-input${errors.title ? ' input-error' : ''}`}
            placeholder="e.g. Full Stack Engineer"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: validateTitle(e.target.value) })); }}
          />
          {errors.title && <span className="field-error">{errors.title}</span>}
        </div>

        {/* Location */}
        <LocationAdder locations={locations} setLocations={setLocations} />

        {/* CTC */}
        <div className="form-group">
          <label>CTC (in LPA)</label>
          <input
            type="number" min="0.5" max="500" step="0.5"
            className={`form-input${errors.ctcLpa ? ' input-error' : ''}`}
            placeholder="e.g. 12"
            value={ctcLpa}
            onChange={(e) => { setCtcLpa(e.target.value); setErrors((p) => ({ ...p, ctcLpa: validateCtcLpa(e.target.value) })); }}
          />
          {errors.ctcLpa && <span className="field-error">{errors.ctcLpa}</span>}
        </div>

        {/* CGPA */}
        <div className="form-group">
          <label>Minimum Required CGPA</label>
          <input
            type="number" step="0.1" min="2" max="10"
            className={`form-input${errors.cgpa ? ' input-error' : ''}`}
            placeholder="e.g. 7.5 (between 2 and 10)"
            value={cgpa}
            onChange={(e) => { setCgpa(e.target.value); setErrors((p) => ({ ...p, cgpa: validateCgpa(e.target.value) })); }}
          />
          {errors.cgpa && <span className="field-error">{errors.cgpa}</span>}
        </div>

        {/* Deadline */}
        <div className="form-group">
          <label>Application Deadline *</label>
          <input
            type="date"
            className={`form-input${errors.deadline ? ' input-error' : ''}`}
            value={deadline}
            min={getTodayStr()}
            max={getMaxDeadlineStr()}
            onChange={(e) => { setDeadline(e.target.value); setErrors((p) => ({ ...p, deadline: validateDeadline(e.target.value) })); }}
          />
          {errors.deadline && <span className="field-error">{errors.deadline}</span>}
          <span style={{ fontSize: '12px', color: '#888', marginTop: '4px', display: 'block' }}>
            Deadline can be set up to 3 months from today.
          </span>
        </div>

        {/* Branches */}
        <BranchSelector selectedBranches={selectedBranches} setSelectedBranches={setSelectedBranches} />

        {/* Skills */}
        <SkillAdder skills={skills} setSkills={setSkills} />

        {/* Description */}
        <div className="form-group full-width">
          <label>Job Description &amp; Responsibilities</label>
          <textarea
            className="form-textarea" rows={4}
            placeholder="Describe responsibilities, perks, expectations, and selection process..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      <div className="form-actions-row">
        <button type="button" className="btn-secondary-action" onClick={() => setActiveTab('dashboard')}>
          Cancel
        </button>
        <button type="submit" className="btn-primary-action">
          Submit Full-Time Role
        </button>
      </div>
    </form>
  );
}

// ── Internship Form ───────────────────────────────────────────────────────────

function InternshipForm({ onAddOpportunity, setActiveTab, existingOpportunities }) {
  const [jobId, setJobId] = useState('');
  const [title, setTitle] = useState('');
  const [locations, setLocations] = useState([]);
  const [duration, setDuration] = useState('');
  const [compensation, setCompensation] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [skills, setSkills] = useState([]);
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {
      jobId: /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/.test(jobId.trim()) ? '' : 'Enter a Job ID using letters, numbers, dots, underscores or hyphens.',
      title: validateTitle(title),
      compensation: validateInternComp(compensation),
      cgpa: validateCgpa(cgpa),
      deadline: validateDeadline(deadline),
    };
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    if (locations.length === 0) { infoDialog('Please add at least one work location.'); return; }
    if (selectedBranches.length === 0) { infoDialog('Please select at least one eligible branch.'); return; }

    // Duplicate check — same title + same type
    if (isDuplicate(existingOpportunities, title, 'Internship')) {
      setErrors((prev) => ({
        ...prev,
        title: `An Internship named "${title.trim()}" already exists. Use a different title.`,
      }));
      return;
    }

    onAddOpportunity({
      id: Date.now(),
      jobId: jobId.trim(),
      title: title.trim(),
      location: locations.join(' | '),
      locations,
      ctc: compensation ? `Rs.${compensation}/month` : 'Not specified',
      cgpa: cgpa || '0',
      type: 'Internship',
      duration: duration || 'Not specified',
      branches: selectedBranches,
      skills,
      applications: 0,
      deadline,
      status: 'Published',
      description: description.trim() || 'Role details will be shared with shortlisted applicants.',
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-group"><label>Job ID *</label><input className="form-input" required maxLength={80} value={jobId} onChange={e => setJobId(e.target.value)} placeholder="e.g. ENG-2026-001" />{errors.jobId && <span className="field-error">{errors.jobId}</span>}</div>
        {/* Title */}
        <div className="form-group">
          <label>Internship Title *</label>
          <input
            type="text"
            className={`form-input${errors.title ? ' input-error' : ''}`}
            placeholder="e.g. Frontend Development Intern"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: validateTitle(e.target.value) })); }}
          />
          {errors.title && <span className="field-error">{errors.title}</span>}
        </div>

        {/* Location */}
        <LocationAdder locations={locations} setLocations={setLocations} />

        {/* Duration */}
        <div className="form-group">
          <label>Internship Duration</label>
          <select className="form-input" value={duration} onChange={(e) => setDuration(e.target.value)}>
            <option value="">Select duration</option>
            <option value="1 Month">1 Month</option>
            <option value="2 Months">2 Months</option>
            <option value="3 Months">3 Months</option>
            <option value="6 Months">6 Months</option>
          </select>
        </div>

        {/* Compensation */}
        <div className="form-group">
          <label>Compensation (Rs. / month)</label>
          <input
            type="number" min="500" max="200000" step="500"
            className={`form-input${errors.compensation ? ' input-error' : ''}`}
            placeholder="e.g. 15000"
            value={compensation}
            onChange={(e) => { setCompensation(e.target.value); setErrors((p) => ({ ...p, compensation: validateInternComp(e.target.value) })); }}
          />
          {errors.compensation && <span className="field-error">{errors.compensation}</span>}
        </div>

        {/* CGPA */}
        <div className="form-group">
          <label>Minimum Required CGPA</label>
          <input
            type="number" step="0.1" min="2" max="10"
            className={`form-input${errors.cgpa ? ' input-error' : ''}`}
            placeholder="e.g. 7.0 (between 2 and 10)"
            value={cgpa}
            onChange={(e) => { setCgpa(e.target.value); setErrors((p) => ({ ...p, cgpa: validateCgpa(e.target.value) })); }}
          />
          {errors.cgpa && <span className="field-error">{errors.cgpa}</span>}
        </div>

        {/* Deadline */}
        <div className="form-group">
          <label>Application Deadline *</label>
          <input
            type="date"
            className={`form-input${errors.deadline ? ' input-error' : ''}`}
            value={deadline}
            min={getTodayStr()}
            max={getMaxDeadlineStr()}
            onChange={(e) => { setDeadline(e.target.value); setErrors((p) => ({ ...p, deadline: validateDeadline(e.target.value) })); }}
          />
          {errors.deadline && <span className="field-error">{errors.deadline}</span>}
          <span style={{ fontSize: '12px', color: '#888', marginTop: '4px', display: 'block' }}>
            Deadline can be set up to 3 months from today.
          </span>
        </div>

        {/* Branches */}
        <BranchSelector selectedBranches={selectedBranches} setSelectedBranches={setSelectedBranches} />

        {/* Skills */}
        <SkillAdder skills={skills} setSkills={setSkills} />

        {/* Description */}
        <div className="form-group full-width">
          <label>Internship Description &amp; Responsibilities</label>
          <textarea
            className="form-textarea" rows={4}
            placeholder="Describe responsibilities, learning outcomes, perks, and selection process..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      <div className="form-actions-row">
        <button type="button" className="btn-secondary-action" onClick={() => setActiveTab('dashboard')}>
          Cancel
        </button>
        <button type="submit" className="btn-primary-action">
          Submit Internship
        </button>
      </div>
    </form>
  );
}

// ── Main PostOpportunity wrapper ──────────────────────────────────────────────

export default function PostOpportunity({ onAddOpportunity, setActiveTab, existingOpportunities = [] }) {
  const [jobType, setJobType] = useState('Full-Time');

  return (
    <div className="form-container-card">
      <div className="section-header-wrap">
        <h2>Post New Opportunity</h2>
        <p>Publish job openings and internships to hire top student talent.</p>
      </div>

      {/* Type selector */}
      <div className="form-group full-width" style={{ marginBottom: '24px' }}>
        <label>Opportunity Type</label>
        <div className="toggle-group">
          <button
            type="button"
            className={`toggle-btn ${jobType === 'Full-Time' ? 'active' : ''}`}
            onClick={() => setJobType('Full-Time')}
          >
            Full-Time Role
          </button>
          <button
            type="button"
            className={`toggle-btn ${jobType === 'Internship' ? 'active' : ''}`}
            onClick={() => setJobType('Internship')}
          >
            Internship
          </button>
        </div>
      </div>

      {/* Render the matching form */}
      {jobType === 'Full-Time' ? (
        <FullTimeForm onAddOpportunity={onAddOpportunity} setActiveTab={setActiveTab} existingOpportunities={existingOpportunities} />
      ) : (
        <InternshipForm onAddOpportunity={onAddOpportunity} setActiveTab={setActiveTab} existingOpportunities={existingOpportunities} />
      )}
    </div>
  );
}
