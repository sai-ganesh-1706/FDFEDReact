import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import SignOutModal from '../components/SignOutModal';
import '../styles/Alumni.css';

export default function AlumniProfile({
  alumniData,
  referrals = [],
  onNavigate,
}) {
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);

  const alumni = alumniData || {
    initials: 'SR',
    name: 'Sneha Reddy',
    email: 'sneha@google.com',
    company: 'Google',
    batch: 2021,
    role: 'Alumni',
    totalReferrals: 6,
    approved: 2,
  };

  const counts = {
    all: referrals.length,
    pending: referrals.filter((r) => r.status === 'pending').length,
    approved: referrals.filter((r) => r.status === 'approved').length,
    declined: referrals.filter((r) => r.status === 'declined').length,
  };

  // Recent activity from referrals
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
    }));

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
    }));

  const skillsList = [
    'JavaScript',
    'Python',
    'React',
    'Node.js',
    'System Design',
    'Cloud (GCP)',
    'Machine Learning',
    'SQL',
    'TypeScript',
    'Go',
    'Docker',
    'Kubernetes',
  ];

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
            <div className="avatar avatar--topbar" title="My Profile">
              {alumni.initials || 'SR'}
            </div>
          </div>
        </header>

        <div className="profile-content">
          {/* Hero Card */}
          <div className="profile-hero">
            <div className="profile-hero-avatar">{alumni.initials || 'SR'}</div>
            <div className="profile-hero-info">
              <div className="profile-hero-name">{alumni.name}</div>
              <div className="profile-hero-role">Software Engineer at {alumni.company}</div>
              <div className="profile-hero-email">{alumni.email}</div>
              <div className="profile-hero-tags">
                <span className="profile-hero-tag">🎓 Batch {alumni.batch}</span>
                <span className="profile-hero-tag">🏢 {alumni.company}</span>
                <span className="profile-hero-tag">👤 {alumni.role}</span>
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
            {/* Personal Information */}
            <div className="profile-section">
              <div className="profile-section-title">
                <div className="profile-section-icon profile-section-icon--orange">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e76a00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <span>Personal Information</span>
              </div>

              <div className="profile-info-row">
                <span className="profile-info-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Full Name
                </span>
                <span className="profile-info-value">{alumni.name}</span>
              </div>

              <div className="profile-info-row">
                <span className="profile-info-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  Email
                </span>
                <span className="profile-info-value">{alumni.email}</span>
              </div>

              <div className="profile-info-row">
                <span className="profile-info-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                  Company
                </span>
                <span className="profile-info-value">{alumni.company}</span>
              </div>

              <div className="profile-info-row">
                <span className="profile-info-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 10 3 12 0v-5" />
                  </svg>
                  Graduation Batch
                </span>
                <span className="profile-info-value">{alumni.batch}</span>
              </div>

              <div className="profile-info-row">
                <span className="profile-info-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  Role
                </span>
                <span className="profile-info-value">Software Engineer</span>
              </div>

              <div className="profile-info-row">
                <span className="profile-info-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Location
                </span>
                <span className="profile-info-value">Hyderabad, India</span>
              </div>
            </div>

            {/* Skills & Expertise */}
            <div className="profile-section">
              <div className="profile-section-title">
                <div className="profile-section-icon profile-section-icon--purple">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <span>Skills &amp; Expertise</span>
              </div>

              <div className="profile-skills">
                {skillsList.map((skill, idx) => (
                  <span key={idx} className="profile-skill-tag">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="profile-section-title" style={{ marginTop: '8px' }}>
                <div className="profile-section-icon profile-section-icon--blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                </div>
                <span>Social Links</span>
              </div>

              <div className="profile-info-row">
                <span className="profile-info-label">LinkedIn</span>
                <a
                  href="https://linkedin.com/in/sneha-reddy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-info-value"
                  style={{ color: '#2563eb', textDecoration: 'none' }}
                >
                  linkedin.com/in/sneha-reddy
                </a>
              </div>

              <div className="profile-info-row">
                <span className="profile-info-label">GitHub</span>
                <a
                  href="https://github.com/snehareddy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-info-value"
                  style={{ color: '#2563eb', textDecoration: 'none' }}
                >
                  github.com/snehareddy
                </a>
              </div>

              <div className="profile-info-row">
                <span className="profile-info-label">Portfolio</span>
                <a
                  href="https://snehareddy.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-info-value"
                  style={{ color: '#2563eb', textDecoration: 'none' }}
                >
                  snehareddy.dev
                </a>
              </div>
            </div>

            {/* Recent Activity (Full Width) */}
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
                        {act.company} • {act.department}
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
                        {act.company} • {act.department}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <SignOutModal
        isOpen={isSignOutOpen}
        onClose={() => setIsSignOutOpen(false)}
      />
    </div>
  );
}

