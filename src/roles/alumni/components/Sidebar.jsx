import React from 'react';

export default function Sidebar({ activePage, onNavigate, onOpenSignOut, alumni }) {
  const currentAlumni = alumni || {
    initials: 'SR',
    name: 'Sneha Reddy',
    email: 'sneha@google.com',
    company: 'Google',
  };

  const handleNav = (page, e) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(page);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-name">CareerNest</div>
        <div className="brand-sub">Alumni</div>
      </div>

      <a
        href="#profile"
        className="sidebar-profile"
        title="My Profile"
        onClick={(e) => handleNav('profile', e)}
      >
        <div className="avatar avatar--light">{currentAlumni.initials || 'SR'}</div>
        <div className="profile-info">
          <div className="profile-name">{currentAlumni.name}</div>
          <div className="profile-email">{currentAlumni.email}</div>
          <div className="profile-company">{currentAlumni.company}</div>
        </div>
      </a>

      <nav className="sidebar-nav">
        <span className="nav-section-title">MAIN</span>
        <button
          type="button"
          className={`nav-btn ${activePage === 'dashboard' ? 'active' : ''}`}
          onClick={(e) => handleNav('dashboard', e)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          <span>Dashboard</span>
        </button>

        <button
          type="button"
          className={`nav-btn ${activePage === 'referrals' ? 'active' : ''}`}
          onClick={(e) => handleNav('referrals', e)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>Referral Requests</span>
        </button>

        <button
          type="button"
          className={`nav-btn ${activePage === 'profile' ? 'active' : ''}`}
          onClick={(e) => handleNav('profile', e)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>My Profile</span>
        </button>

        <span className="nav-section-title" style={{ marginTop: '12px' }}>CONNECT & ENGAGE</span>

        <button
          type="button"
          className={`nav-btn ${activePage === 'directory' ? 'active' : ''}`}
          onClick={(e) => handleNav('directory', e)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <span>Alumni Directory</span>
        </button>

        <button
          type="button"
          className={`nav-btn ${activePage === 'events' ? 'active' : ''}`}
          onClick={(e) => handleNav('events', e)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>College Events</span>
        </button>

        <button
          type="button"
          className={`nav-btn ${activePage === 'mentorship' ? 'active' : ''}`}
          onClick={(e) => handleNav('mentorship', e)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>Mentorship Hub</span>
        </button>

        <button
          type="button"
          className="nav-btn signout"
          onClick={onOpenSignOut}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Sign Out</span>
        </button>
      </nav>
    </aside>
  );
}

