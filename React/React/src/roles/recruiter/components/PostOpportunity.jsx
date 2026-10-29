import React, { useState } from 'react';
import { X } from 'lucide-react';

// ── Shared helpers ────────────────────────────────────────────────────────────

const allBranches = ['CSE', 'ECE', 'IT', 'EEE', 'MECH', 'CIVIL'];

const getTodayStr = () => new Date().toISOString().split('T')[0];

const getMaxDeadlineStr = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  return d.toISOString().split('T')[0];
};

// ── Validators ────────────────────────────────────────────────────────────────

const validateTitle = (v) => {
  const t = v.trim();
  if (!t) return 'Job title is required.';
  if (/[^a-zA-Z0-9 \-]/.test(t)) return 'Job title may only contain letters, numbers, spaces and hyphens.';
  if (/^[\d\s]+$/.test(t)) return 'Job title cannot be all numbers.';
  if (/^[-\s]+$/.test(t)) return 'Job title cannot be all hyphens.';
  return '';
};

const validateCtcLpa = (v) => {
  if (!v && v !== 0) return '';
  const n = parseFloat(v);
  if (isNaN(n) || n <= 0) return 'CTC must be a positive number (in LPA).';
  if (n > 500) return 'CTC cannot exceed 500 LPA.';
  return '';
};

const validateInternComp = (v) => {
  if (!v && v !== 0) return '';
  const n = parseFloat(v);
  if (isNaN(n) || n <= 0) return 'Compensation must be a positive number.';
  if (n > 200000) return 'Compensation cannot exceed Rs.2,00,000 per month.';
  return '';
};

const validateCgpa = (v) => {
  if (!v && v !== 0) return '';
  const n = parseFloat(v);
  if (isNaN(n) || n < 2) return 'CGPA must be at least 2.0.';
  if (n > 10) return 'CGPA cannot exceed 10.0.';
  return '';
};

const validateDeadline = (v) => {
  if (!v) return 'Application deadline is required.';
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const sel = new Date(v);
  if (sel < today) return 'Deadline cannot be a past date.';
  const max = new Date(); max.setMonth(max.getMonth() + 3);
  if (sel > max) return 'Deadline cannot be more than 3 months from today.';
  return '';
};

const validateSkill = (v) => {
  if (/[^a-zA-Z0-9 ]/.test(v)) return 'Skills may only contain letters and numbers.';
  return '';
};

const validateLocation = (v) => {
  const t = v.trim();
  if (!t) return 'Please enter a location.';
  if (/\d/.test(t)) return 'Location cannot contain numbers.';
  if (/[^a-zA-Z ,.\-]/.test(t)) return 'Location may only contain letters, spaces, commas and hyphens.';
  return '';
};

// ── Shared sub-components ─────────────────────────────────────────────────────

function LocationAdder({ locations, setLocations }) {
  const [cur, setCur] = useState('');
  const [err, setErr] = useState('');

  const add = () => {
    const t = cur.trim();
    const e = validateLocation(t);
    if (e) { setErr(e); return; }
    if (locations.includes(t)) { setErr('Already added.'); return; }
    setLocations([...locations, t]);
    setCur(''); setErr('');
  };

  return (
    <div className="form-group">
      <label>Work Location *</label>
      <div className="skills-input-row">
        <input
          type="text"
          className={`form-input${err ? ' input-error' : ''}`}
          placeholder="e.g. Bangalore, Remote, Hyderabad"
          value={cur}
          onChange={(e) => { setCur(e.target.value); if (err) setErr(''); }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        />
        <button type="button" className="btn-secondary-action" onClick={add} style={{ padding: '9px 16px' }}>
          Add
        </button>
      </div>
      {err && <span className="field-error">{err}</span>}
      {locations.length > 0 && (
        <div className="skills-tags-list" style={{ marginTop: '8px' }}>
          {locations.map((loc) => (
            <span key={loc} className="skill-tag-item">
              {loc}
              <button type="button" className="skill-remove-btn" onClick={() => setLocations(locations.filter((l) => l !== loc))}>
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SkillAdder({ skills, setSkills }) {
  const [cur, setCur] = useState('');
  const [err, setErr] = useState('');

  const add = (e) => {
    e?.preventDefault();
    const t = cur.trim();
    if (!t) return;
    const e2 = validateSkill(t);
    if (e2) { setErr(e2); return; }
    if (!skills.includes(t)) setSkills([...skills, t]);
    setCur(''); setErr('');
  };

  return (
    <div className="form-group full-width">
      <label>Required Skills &amp; Technologies</label>
      <div className="skills-input-row">
        <input
          type="text"
          className={`form-input${err ? ' input-error' : ''}`}
          placeholder="Type skill and press Enter or Add (e.g. React, Docker)"
          value={cur}
          onChange={(e) => { const v = e.target.value; const er = validateSkill(v); if (!er) setCur(v); setErr(er); }}
          onKeyDown={(e) => { if (e.key === 'Enter') add(e); }}
        />
        <button type="button" className="btn-secondary-action" onClick={add} style={{ padding: '9px 16px' }}>
          Add
        </button>
      </div>
      {err && <span className="field-error">{err}</span>}
      <div className="skills-tags-list">
        {skills.map((s) => (
          <span key={s} className="skill-tag-item">
            {s}
            <button type="button" className="skill-remove-btn" onClick={() => setSkills(skills.filter((x) => x !== s))}>
              <X size={14} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

function BranchSelector({ selectedBranches, setSelectedBranches }) {
  const toggle = (b) =>
    setSelectedBranches(
      selectedBranches.includes(b)
        ? selectedBranches.filter((x) => x !== b)
        : [...selectedBranches, b]
    );
  return (
    <div className="form-group full-width">
      <label>Eligible Engineering Branches *</label>
      <div className="branches-container">
        {allBranches.map((b) => (
          <button
            key={b}
            type="button"
            className={`branch-chip ${selectedBranches.includes(b) ? 'selected' : ''}`}
            onClick={() => toggle(b)}
          >
            {b} {selectedBranches.includes(b) && '✓'}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Duplicate checker ─────────────────────────────────────────────────────────

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
      title: validateTitle(title),
      ctcLpa: validateCtcLpa(ctcLpa),
      cgpa: validateCgpa(cgpa),
      deadline: validateDeadline(deadline),
    };
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    if (locations.length === 0) { alert('Please add at least one work location.'); return; }
    if (selectedBranches.length === 0) { alert('Please select at least one eligible branch.'); return; }

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
          Publish Full-Time Role
        </button>
      </div>
    </form>
  );
}

// ── Internship Form ───────────────────────────────────────────────────────────

function InternshipForm({ onAddOpportunity, setActiveTab, existingOpportunities }) {
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
      title: validateTitle(title),
      compensation: validateInternComp(compensation),
      cgpa: validateCgpa(cgpa),
      deadline: validateDeadline(deadline),
    };
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    if (locations.length === 0) { alert('Please add at least one work location.'); return; }
    if (selectedBranches.length === 0) { alert('Please select at least one eligible branch.'); return; }

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
          Publish Internship
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
