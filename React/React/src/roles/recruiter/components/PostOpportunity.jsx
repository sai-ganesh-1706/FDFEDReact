import React, { useState } from 'react';
import { Plus, X, Check } from 'lucide-react';

export default function PostOpportunity({ onAddOpportunity, setActiveTab }) {
  const [jobType, setJobType] = useState('Full-Time');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('Bangalore, Karnataka');
  const [ctc, setCtc] = useState('');
  const [openings, setOpenings] = useState('5');
  const [cgpa, setCgpa] = useState('7.0');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');

  // Validation errors
  const [errors, setErrors] = useState({});

  // Available branches to toggle
  const allBranches = ['CSE', 'ECE', 'IT', 'EEE', 'MECH', 'CIVIL'];
  const [selectedBranches, setSelectedBranches] = useState(['CSE', 'ECE', 'IT']);

  // Skills tags
  const [skills, setSkills] = useState(['JavaScript', 'React', 'Problem Solving']);
  const [currentSkill, setCurrentSkill] = useState('');
  const [skillError, setSkillError] = useState('');

  // ── Validators ──────────────────────────────────────────────────────────────

  /**
   * Job Title: only letters, digits, spaces and hyphens.
   * Must NOT be all-digits-only or all-hyphens-only.
   */
  const validateTitle = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return 'Job title is required.';
    if (/[^a-zA-Z0-9 \-]/.test(trimmed))
      return 'Job title may only contain letters, numbers, spaces and hyphens ( - ).';
    if (/^[\d\s]+$/.test(trimmed))
      return 'Job title cannot be all numbers.';
    if (/^[-\s]+$/.test(trimmed))
      return 'Job title cannot be all hyphens.';
    return '';
  };

  /**
   * Compensation: accepts formats like
   *   10-14 LPA  |  14 LPA  |  35000/month  |  ₹35,000/month
   * No bare alphabets — must follow a recognised pattern.
   */
  const validateCtc = (value) => {
    if (!value.trim()) return ''; // optional field
    const lpaPattern = /^₹?\s*\d[\d,]*(\s*-\s*\d[\d,]*)?\s*LPA$/i;
    const monthPattern = /^₹?\s*\d[\d,]*\s*\/\s*month$/i;
    if (!lpaPattern.test(value.trim()) && !monthPattern.test(value.trim()))
      return 'Use formats like: 10-14 LPA, 14 LPA, 35000/month, or ₹35,000/month.';
    return '';
  };

  /**
   * Openings: integer ≥ 1.
   */
  const validateOpenings = (value) => {
    const num = Number(value);
    if (!value || isNaN(num) || !Number.isInteger(num) || num < 1)
      return 'Number of openings must be at least 1.';
    return '';
  };

  /**
   * Deadline: must not be before today.
   */
  const validateDeadline = (value) => {
    if (!value) return 'Application deadline is required.';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(value) < today) return 'Deadline cannot be a past date.';
    return '';
  };

  /**
   * Skill input: only letters, digits and spaces.
   */
  const validateSkillInput = (value) => {
    if (/[^a-zA-Z0-9 ]/.test(value))
      return 'Skills may only contain letters and numbers.';
    return '';
  };

  // ── Change handlers with live validation ────────────────────────────────────

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    setErrors((prev) => ({ ...prev, title: validateTitle(val) }));
  };

  const handleCtcChange = (e) => {
    const val = e.target.value;
    setCtc(val);
    setErrors((prev) => ({ ...prev, ctc: validateCtc(val) }));
  };

  const handleOpeningsChange = (e) => {
    const val = e.target.value;
    setOpenings(val);
    setErrors((prev) => ({ ...prev, openings: validateOpenings(val) }));
  };

  const handleDeadlineChange = (e) => {
    const val = e.target.value;
    setDeadline(val);
    setErrors((prev) => ({ ...prev, deadline: validateDeadline(val) }));
  };

  const handleSkillInputChange = (e) => {
    const val = e.target.value;
    const err = validateSkillInput(val);
    if (!err) setCurrentSkill(val); // block invalid chars from being typed
    setSkillError(err);
  };

  // ── Other helpers ────────────────────────────────────────────────────────────

  const toggleBranch = (branch) => {
    if (selectedBranches.includes(branch)) {
      setSelectedBranches(selectedBranches.filter(b => b !== branch));
    } else {
      setSelectedBranches([...selectedBranches, branch]);
    }
  };

  const handleAddSkill = (e) => {
    e?.preventDefault();
    const trimmed = currentSkill.trim();
    if (!trimmed) return;
    const err = validateSkillInput(trimmed);
    if (err) { setSkillError(err); return; }
    if (!skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setCurrentSkill('');
    setSkillError('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  // ── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = (e) => {
    e.preventDefault();

    // Run all validators
    const newErrors = {
      title: validateTitle(title),
      ctc: validateCtc(ctc),
      openings: validateOpenings(openings),
      deadline: validateDeadline(deadline),
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) return;

    if (!location.trim()) {
      alert('Please fill in the Work Location field.');
      return;
    }

    if (selectedBranches.length === 0) {
      alert('Please select at least one eligible branch.');
      return;
    }

    const newOpportunity = {
      id: Date.now(),
      title: title.trim(),
      location: location.trim(),
      ctc: ctc.trim() || (jobType === 'Full-Time' ? '8-12 LPA' : '₹30,000 / month'),
      openings: openings || '1',
      cgpa: cgpa || '0',
      type: jobType,
      branches: selectedBranches,
      skills: skills,
      applications: 0,
      deadline: deadline,
      status: 'Published',
      description: description.trim() || 'Role details and expectations will be shared with shortlisted applicants.'
    };

    onAddOpportunity(newOpportunity);
  };

  return (
    <div className="form-container-card">
      <div className="section-header-wrap">
        <h2>Post New Opportunity</h2>
        <p>Publish job openings and internships to hire top student talent.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Job Type Toggle */}
          <div className="form-group full-width">
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

          {/* Title */}
          <div className="form-group">
            <label>Job Title *</label>
            <input 
              type="text" 
              className={`form-input${errors.title ? ' input-error' : ''}`}
              placeholder="e.g. Full Stack Engineer" 
              value={title}
              onChange={handleTitleChange}
            />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </div>

          {/* Location */}
          <div className="form-group">
            <label>Work Location *</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Bangalore, Hyderabad, Remote" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          {/* CTC */}
          <div className="form-group">
            <label>Compensation / CTC</label>
            <input 
              type="text" 
              className={`form-input${errors.ctc ? ' input-error' : ''}`}
              placeholder="e.g. 10-14 LPA or ₹35,000/month" 
              value={ctc}
              onChange={handleCtcChange}
            />
            {errors.ctc && <span className="field-error">{errors.ctc}</span>}
          </div>

          {/* Openings */}
          <div className="form-group">
            <label>Number of Openings</label>
            <input 
              type="number" 
              className={`form-input${errors.openings ? ' input-error' : ''}`}
              min="1" 
              value={openings}
              onChange={handleOpeningsChange}
            />
            {errors.openings && <span className="field-error">{errors.openings}</span>}
          </div>

          {/* Minimum CGPA */}
          <div className="form-group">
            <label>Minimum Required CGPA</label>
            <input 
              type="number" 
              step="0.1" 
              min="0" 
              max="10" 
              className="form-input" 
              placeholder="e.g. 7.5" 
              value={cgpa}
              onChange={(e) => setCgpa(e.target.value)}
            />
          </div>

          {/* Deadline */}
          <div className="form-group">
            <label>Application Deadline *</label>
            <input 
              type="date" 
              className={`form-input${errors.deadline ? ' input-error' : ''}`}
              value={deadline}
              onChange={handleDeadlineChange}
            />
            {errors.deadline && <span className="field-error">{errors.deadline}</span>}
          </div>

          {/* Eligible Branches */}
          <div className="form-group full-width">
            <label>Eligible Engineering Branches *</label>
            <div className="branches-container">
              {allBranches.map((branch) => {
                const isSelected = selectedBranches.includes(branch);
                return (
                  <button 
                    key={branch}
                    type="button" 
                    className={`branch-chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleBranch(branch)}
                  >
                    {branch} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Skills Required */}
          <div className="form-group full-width">
            <label>Required Skills &amp; Technologies</label>
            <div className="skills-input-row">
              <input 
                type="text" 
                className={`form-input${skillError ? ' input-error' : ''}`}
                placeholder="Type skill and press Enter or Add (e.g. React, Docker)"
                value={currentSkill}
                onChange={handleSkillInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <button 
                type="button" 
                className="btn-secondary-action" 
                onClick={handleAddSkill}
                style={{ padding: '9px 16px' }}
              >
                Add
              </button>
            </div>
            {skillError && <span className="field-error">{skillError}</span>}

            <div className="skills-tags-list">
              {skills.map((s) => (
                <span key={s} className="skill-tag-item">
                  {s}
                  <button 
                    type="button" 
                    className="skill-remove-btn" 
                    onClick={() => handleRemoveSkill(s)}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="form-group full-width">
            <label>Job Description &amp; Responsibilities</label>
            <textarea 
              className="form-textarea" 
              rows={4} 
              placeholder="Describe the responsibilities, perks, expectations, and selection process..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="form-actions-row">
          <button 
            type="button" 
            className="btn-secondary-action"
            onClick={() => setActiveTab('dashboard')}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary-action">
            Publish Opportunity
          </button>
        </div>
      </form>
    </div>
  );
}
