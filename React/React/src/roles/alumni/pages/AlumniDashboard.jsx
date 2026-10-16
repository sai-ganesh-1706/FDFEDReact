import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import SignOutModal from '../components/SignOutModal';
import '../styles/Alumni.css';

export default function AlumniDashboard({
  alumniData,
  referrals = [],
  onUpdateReferralStatus,
  onNavigate,
}) {
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);
  const [fadingCardId, setFadingCardId] = useState(null);

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

  const pendingList = referrals.filter((r) => r.status === 'pending');

  const statsConfig = [
    {
      filter: 'pending',
      label: 'Pending Requests',
      count: counts.pending,
      iconClass: 'stat-icon--pending',
      color: '#d97706',
      icon: (
        <>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </>
      ),
    },
    {
      filter: 'approved',
      label: 'Approved',
      count: counts.approved,
      iconClass: 'stat-icon--approved',
      color: '#059669',
      icon: (
        <>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </>
      ),
    },
    {
      filter: 'all',
      label: 'Total Requests',
      count: counts.all,
      iconClass: 'stat-icon--total',
      color: '#3b82f6',
      icon: (
        <>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <line x1="9" y1="9" x2="15" y2="9" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="12" y2="17" />
        </>
      ),
    },
    {
      filter: 'declined',
      label: 'Declined',
      count: counts.declined,
      iconClass: 'stat-icon--declined',
      color: '#dc2626',
      icon: (
        <>
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </>
      ),
    },
  ];

  const handleQuickApprove = (candidateId, e) => {
    e.stopPropagation();
    setFadingCardId(candidateId);
    setTimeout(() => {
      if (onUpdateReferralStatus) {
        onUpdateReferralStatus(candidateId, 'approved', 'Referral approved from dashboard.');
      }
      setFadingCardId(null);
    }, 400);
  };

  const handleStatClick = (filter) => {
    if (onNavigate) {
      onNavigate('referrals', { filter });
    }
  };

  return (
    <div className="layout alumni-app-container">
      <Sidebar
        activePage="dashboard"
        onNavigate={onNavigate}
        onOpenSignOut={() => setIsSignOutOpen(true)}
        alumni={alumni}
      />

      <main className="main">
        {/* Top Bar */}
        <header className="topbar">
          <h1 className="page-title">Dashboard</h1>
          <div className="topbar-right">
            <button
              type="button"
              className="avatar avatar--topbar"
              title="My Profile"
              onClick={() => onNavigate && onNavigate('profile')}
            >
              {alumni.initials || 'SR'}
            </button>
          </div>
        </header>

        <div className="dash-content">
          {/* Welcome Banner */}
          <div className="welcome-banner">
            <h2 className="welcome-title">
              Welcome back, {alumni.name ? alumni.name.split(' ')[0] : 'Alumni'}! 👋
            </h2>
            <p className="welcome-sub">
              {alumni.company} • Class of {alumni.batch}
            </p>
            <p className="welcome-desc">
              Your referrals make a real difference to students' careers. Review pending requests and help deserving candidates get noticed by recruiters.
            </p>
            <button
              type="button"
              className="welcome-btn"
              onClick={() => onNavigate && onNavigate('referrals')}
            >
              Review Referral Requests &rarr;
            </button>
          </div>

          {/* Stats Row */}
          <div className="stats-row">
            {statsConfig.map((s) => (
              <div
                key={s.filter}
                className="stat-card"
                onClick={() => handleStatClick(s.filter)}
              >
                <div className={`stat-icon ${s.iconClass}`}>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={s.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {s.icon}
                  </svg>
                </div>
                <div className="stat-number">{s.count}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Bottom Section */}
          <div className="dash-bottom">
            {/* Pending Requests Column */}
            <div className="dash-pending">
              <div className="dash-section-head">
                <h3 className="dash-section-title">Pending Requests</h3>
                <span className="dash-count-badge">{pendingList.length}</span>
              </div>

              {pendingList.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <div className="empty-state-title">You're all caught up!</div>
                  <div className="empty-state-desc">There are no pending referral requests at the moment.</div>
                </div>
              ) : (
                pendingList.map((r) => (
                  <div
                    key={r.id}
                    className="mini-card"
                    style={{
                      transition: 'opacity 0.4s, transform 0.4s',
                      opacity: fadingCardId === r.id ? 0 : 1,
                      transform: fadingCardId === r.id ? 'translateY(-10px)' : 'none',
                    }}
                  >
                    <div className="mini-card-top">
                      <div className="mini-card-left">
                        <div className="avatar avatar--mini">{r.initials}</div>
                        <div>
                          <div className="mini-name">{r.name}</div>
                          <div className="mini-detail">
                            {r.department} • CGPA: {r.cgpa}
                          </div>
                        </div>
                      </div>
                      <span className="badge badge--pending badge--sm">Pending</span>
                    </div>

                    <div className="mini-for">
                      Requesting referral for <strong>{r.role}</strong>
                    </div>

                    <div className="mini-msg">
                      "{r.message && r.message.length > 100 ? `${r.message.substring(0, 100)}...` : r.message}"
                    </div>

                    <div className="mini-actions">
                      <button
                        type="button"
                        className="mini-btn mini-btn--approve"
                        onClick={(e) => handleQuickApprove(r.id, e)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Approve
                      </button>

                      <button
                        type="button"
                        className="mini-btn mini-btn--review"
                        onClick={() => onNavigate && onNavigate('referrals', { openCardId: r.id })}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="16" x2="12" y2="12" />
                          <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                        Review Full Request
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Profile + Impact Column */}
            <div className="dash-profile-col">
              <div className="alumni-card">
                <h3 className="dash-section-title" style={{ marginBottom: '16px' }}>
                  Alumni Profile
                </h3>
                <div className="alumni-card-body">
                  <div className="avatar avatar--lg">{alumni.initials || 'SR'}</div>
                  <div className="alumni-name">{alumni.name}</div>
                  <div className="alumni-company">{alumni.company}</div>
                  <div className="alumni-tags">
                    <span className="alumni-tag alumni-tag--orange">{alumni.role}</span>
                    <span className="alumni-tag alumni-tag--gray">Batch {alumni.batch}</span>
                  </div>
                  <div className="alumni-stats">
                    <div className="alumni-stat-row">
                      <span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="4" y="4" width="16" height="16" rx="2" />
                          <line x1="9" y1="9" x2="15" y2="9" />
                          <line x1="9" y1="13" x2="15" y2="13" />
                          <line x1="9" y1="17" x2="12" y2="17" />
                        </svg>
                        Total Referrals
                      </span>
                      <strong>{counts.all}</strong>
                    </div>
                    <div className="alumni-stat-row">
                      <span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        Approved
                      </span>
                      <strong>{counts.approved}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="impact-card">
                <div className="impact-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e76a00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <div>
                  <div className="impact-title">Your Impact</div>
                  <div className="impact-desc">
                    Your referrals have helped <strong>{counts.approved} students</strong> get noticed by recruiters. Keep supporting your juniors!
                  </div>
                </div>
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

