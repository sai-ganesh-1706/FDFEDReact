import React, { useState } from 'react';
import { Building2, GraduationCap, UserRound } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import SignOutModal from '../components/SignOutModal';
import ChangePasswordModal from '../../../shared/components/ChangePasswordModal';
import { readSession } from '../../../services/api.js';
import '../styles/Alumni.css';

export default function AlumniProfile({
  alumniData,
  referrals = [],
  onNavigate,
  // Lifted state from AlumniApp (persists across navigation)
  personalInfo,
  onSavePersonalInfo,
  skillsList,
  onSetSkillsList,
}) {
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const session = readSession() || {};

  // Personal info edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editFields, setEditFields] = useState({});
  const [isEditingSocials, setIsEditingSocials] = useState(false);
  const [editSocials, setEditSocials] = useState({});

  // Skills UI state
  const [newSkill, setNewSkill] = useState('');
  const [showAddSkill, setShowAddSkill] = useState(false);

  const alumni = alumniData || {
    initials: 'SR',
    name: 'Sneha Reddy',
    email: 'sneha@google.com',
    company: 'Google',
    batch: 2021,
    role: 'Alumni',
  };

  // Merge: personalInfo (lifted) overrides alumniData defaults
  const info = {
    name: personalInfo?.name || alumni.name,
    email: personalInfo?.email || alumni.email,
    company: personalInfo?.company || alumni.company,
    batch: personalInfo?.batch || alumni.batch,
    role: personalInfo?.role || 'Software Engineer',
    location: personalInfo?.location || 'Hyderabad, India',
    linkedin: personalInfo?.linkedin ?? '',
    github: personalInfo?.github ?? '',
    portfolio: personalInfo?.portfolio ?? '',
  };

  const counts = {
    all: referrals.length,
    pending: referrals.filter((r) => r.status === 'pending').length,
    approved: referrals.filter((r) => r.status === 'approved').length,
    declined: referrals.filter((r) => r.status === 'declined').length,
  };

  // Helper to format timestamps into relative time
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Recently';
    const diffMs = Date.now() - timestamp;
    if (diffMs < 0) return 'Just now';
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Recent activities sorted strictly from latest activity performed to oldest activity
  const resolvedActivities = referrals
    .filter((r) => r.status !== 'pending')
    .map((r) => ({
      id: r.id,
      status: r.status,
      action: r.status === 'approved' ? 'Approved' : 'Declined',
      name: r.name,
      role: r.role,
      company: r.company,
      department: r.department,
      updatedAt: r.updatedAt || 0,
    }))
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  const pendingActivities = referrals
    .filter((r) => r.status === 'pending')
    .map((r) => ({
      id: r.id,
      status: 'pending',
      action: 'Pending',
      name: r.name,
      role: r.role,
      company: r.company,
      department: r.department,
      updatedAt: r.updatedAt || 0,
    }))
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  // ---- Edit handlers ----
  const handleStartEdit = () => {
    setEditFields({ ...info });
    setIsEditing(true);
  };

  const handleEditChange = (field, value) => {
    setEditFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = () => {
    if (onSavePersonalInfo) onSavePersonalInfo({ ...editFields });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleStartSocialEdit = () => {
    setEditSocials({ linkedin: info.linkedin, github: info.github, portfolio: info.portfolio });
    setIsEditingSocials(true);
  };

  const handleSaveSocialEdit = () => {
    if (onSavePersonalInfo) onSavePersonalInfo({ ...info, ...editSocials });
    setIsEditingSocials(false);
  };

  // ---- Skill handlers ----
  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && skillsList && !skillsList.includes(trimmed)) {
      if (onSetSkillsList) onSetSkillsList((prev) => [...prev, trimmed]);
    }
    setNewSkill('');
    setShowAddSkill(false);
  };

  const handleRemoveSkill = (skill) => {
    if (onSetSkillsList) onSetSkillsList((prev) => prev.filter((s) => s !== skill));
  };

  const skills = skillsList || [];

  return (
    <div className="layout alumni-app-container">
      <Sidebar
        activePage="profile"
        onNavigate={onNavigate}
        onOpenSignOut={() => setIsSignOutOpen(true)}
        alumni={alumni}
      />

      <main className="main">
        <header className="topbar">
          <h1 className="page-title">My Profile</h1>
          <div className="topbar-right">
            <button
              type="button"
              className="avatar avatar--topbar"
              title="My Profile"
              onClick={() => onNavigate && onNavigate('profile')}
              style={{ cursor: 'pointer', border: 'none' }}
            >
              {alumni.initials || 'SR'}
            </button>
          </div>
        </header>

        <div className="profile-content">
          {/* Hero Card */}
          <div className="profile-hero">
            <div className="profile-hero-avatar">{alumni.initials || 'SR'}</div>
            <div className="profile-hero-info">
              <div className="profile-hero-name">{info.name}</div>
              <div className="profile-hero-role">{info.role} at {info.company}</div>
              <div className="profile-hero-email">{info.email}</div>
              <div className="profile-hero-tags">
                <span className="profile-hero-tag"><GraduationCap size={15} aria-hidden="true" />Batch {info.batch}</span>
                <span className="profile-hero-tag"><Building2 size={15} aria-hidden="true" />{info.company}</span>
                <span className="profile-hero-tag"><UserRound size={15} aria-hidden="true" />{alumni.role}</span>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="profile-stats-row">
            <div className="profile-stat-card profile-stat-card--blue">
              <div className="profile-stat-number">{counts.all}</div>
              <div className="profile-stat-label">Total Requests</div>
            </div>
            <div className="profile-stat-card profile-stat-card--orange">
              <div className="profile-stat-number">{counts.pending}</div>
              <div className="profile-stat-label">Pending</div>
            </div>
            <div className="profile-stat-card profile-stat-card--green">
              <div className="profile-stat-number">{counts.approved}</div>
              <div className="profile-stat-label">Approved</div>
            </div>
            <div className="profile-stat-card profile-stat-card--red">
              <div className="profile-stat-number">{counts.declined}</div>
              <div className="profile-stat-label">Declined</div>
            </div>
          </div>

          {/* Two-Column Grid */}
          <div className="profile-grid">

            {/* ── Personal Information ── */}
            <div className="profile-section">
              <div className="profile-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="profile-section-icon profile-section-icon--orange">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e76a00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <span>Personal Information</span>
                </div>

                {!isEditing ? (
                  <>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button type="button" onClick={() => setIsChangePasswordOpen(true)} className="profile-edit-btn">
                      Change Password
                    </button>
                    <button type="button" onClick={handleStartEdit} className="profile-edit-btn">
                    ✏️ Edit
                  </button>
                  </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button type="button" onClick={handleSaveEdit} className="profile-save-btn">Save</button>
                    <button type="button" onClick={handleCancelEdit} className="profile-cancel-btn">Cancel</button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                  {[
                    { field: 'name',     label: 'Full Name',           type: 'text'  },
                    { field: 'email',    label: 'Email',               type: 'email' },
                    { field: 'company',  label: 'Company',             type: 'text'  },
                    { field: 'batch',    label: 'Graduation Batch',    type: 'text'  },
                    { field: 'role',     label: 'Role / Designation',  type: 'text'  },
                    { field: 'location', label: 'Location',            type: 'text'  },
                  ].map(({ field, label, type }) => (
                    <div key={field}>
                      <label className="profile-edit-label">{label}</label>
                      <input
                        type={type}
                        value={editFields[field] || ''}
                        onChange={(e) => handleEditChange(field, e.target.value)}
                        className="profile-edit-input"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <InfoRow label="Full Name"        value={info.name} />
                  <InfoRow label="Email"            value={info.email} />
                  <InfoRow label="Company"          value={info.company} />
                  <InfoRow label="Graduation Batch" value={info.batch} />
                  <InfoRow label="Role"             value={info.role} />
                  <InfoRow label="Location"         value={info.location} />
                </>
              )}
            </div>

            {/* ── Skills & Expertise ── */}
            <div className="profile-section">
              <div className="profile-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="profile-section-icon profile-section-icon--purple">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                  <span>Skills &amp; Expertise</span>
                </div>
                <button type="button" onClick={() => setShowAddSkill((v) => !v)} className="profile-add-skill-btn">
                  + Add Skill
                </button>
              </div>

              {showAddSkill && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', marginTop: '4px' }}>
                  <input
                    type="text"
                    placeholder="e.g. Kotlin, Figma..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                    className="profile-skill-input"
                    autoFocus
                  />
                  <button type="button" onClick={handleAddSkill} className="profile-save-btn">Add</button>
                  <button type="button" onClick={() => { setShowAddSkill(false); setNewSkill(''); }} className="profile-cancel-btn">✕</button>
                </div>
              )}

              <div className="profile-skills">
                {skills.map((skill, idx) => (
                  <span key={idx} className="profile-skill-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      title={`Remove ${skill}`}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '13px', lineHeight: 1, padding: '0 0 0 2px' }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Social Links */}
              <div className="profile-section-title" style={{ marginTop: '18px', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="profile-section-icon profile-section-icon--blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  </div>
                  <span>Social Links</span>
                </div>
                {!isEditingSocials ? (
                  <button type="button" onClick={handleStartSocialEdit} className="profile-edit-btn">Edit</button>
                ) : (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button type="button" onClick={handleSaveSocialEdit} className="profile-save-btn">Save</button>
                    <button type="button" onClick={() => setIsEditingSocials(false)} className="profile-cancel-btn">Cancel</button>
                  </div>
                )}
              </div>
              {isEditingSocials ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                  {[
                    { field: 'linkedin', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/your-profile' },
                    { field: 'github', label: 'GitHub URL', placeholder: 'https://github.com/your-username' },
                    { field: 'portfolio', label: 'Portfolio URL', placeholder: 'https://your-portfolio.com' },
                  ].map(({ field, label, placeholder }) => (
                    <div key={field}>
                      <label className="profile-edit-label">{label}</label>
                      <input type="url" value={editSocials[field] || ''} placeholder={placeholder} onChange={(e) => setEditSocials((prev) => ({ ...prev, [field]: e.target.value }))} className="profile-edit-input" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <SocialLinkRow label="LinkedIn" value={info.linkedin} />
                  <SocialLinkRow label="GitHub" value={info.github} />
                  <SocialLinkRow label="Portfolio" value={info.portfolio} />
                </>
              )}
            </div>

            {/* ── Recent Activity (Full Width) ── */}
            <div className="profile-section profile-full-width">
              <div className="profile-section-title">
                <div className="profile-section-icon profile-section-icon--green">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <span>Recent Activity</span>
              </div>

              <div className="profile-activity">
                {resolvedActivities.length === 0 && pendingActivities.length === 0 && (
                  <div style={{ color: '#94a3b8', fontSize: '13px', padding: '12px 0' }}>
                    No referral activity yet.
                  </div>
                )}

                {resolvedActivities.map((act) => (
                  <div key={act.id} className="profile-activity-item">
                    <div className={`profile-activity-dot profile-activity-dot--${act.status}`}>
                      {act.status === 'approved' ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      )}
                    </div>
                    <div className="profile-activity-info">
                      <div className="profile-activity-text">
                        <strong>{act.action}</strong> {act.name}'s referral for <strong>{act.role}</strong>
                      </div>
                      <div className="profile-activity-time">
                        {act.company} • {act.department} • <span style={{ color: '#e76a00', fontWeight: 600 }}>{formatTimeAgo(act.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {pendingActivities.map((act) => (
                  <div key={act.id} className="profile-activity-item">
                    <div className="profile-activity-dot profile-activity-dot--pending">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <div className="profile-activity-info">
                      <div className="profile-activity-text">
                        <strong>Pending</strong> review for {act.name} &mdash; <strong>{act.role}</strong>
                      </div>
                      <div className="profile-activity-time">
                        {act.company} • {act.department} • <span style={{ color: '#64748b' }}>Received {formatTimeAgo(act.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>

      <SignOutModal isOpen={isSignOutOpen} onClose={() => setIsSignOutOpen(false)} />
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        userId={session.id}
        accentColor="#e76a00"
      />
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="profile-info-row">
      <span className="profile-info-label">{label}</span>
      <span className="profile-info-value">{value}</span>
    </div>
  );
}

function SocialLinkRow({ label, value }) {
  return (
    <div className="profile-info-row">
      <span className="profile-info-label">{label}</span>
      {value ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="profile-info-value" style={{ color: '#2563eb', textDecoration: 'none' }}>
          {value.replace(/^https?:\/\//, '')}
        </a>
      ) : <span className="profile-info-value" style={{ color: '#94a3b8' }}>Not added</span>}
    </div>
  );
}
