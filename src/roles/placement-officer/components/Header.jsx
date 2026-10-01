import React, { useState, useEffect, useRef } from 'react';
import { MOCK } from '../data/mockdata';

const PAGES = [
  { title: 'Dashboard', page: 'p1', badge: 'Overview' },
  { title: 'Review Opportunities', page: 'p2', badge: 'Review' },
  { title: 'Statistics', page: 'p3', badge: 'Analytics' },
  { title: 'Recruiters', page: 'p4', badge: 'Directory' },
  { title: 'User Oversight', page: 'p5', badge: 'Management' },
  { title: 'App Tracking (Kanban)', page: 'p6', badge: 'Kanban' },
  { title: 'Placement Drives', page: 'placement-dashboard', badge: 'Premium' },
  { title: 'Bulk Notifications', page: 'bulk-notify', badge: 'Standard' },
  { title: 'Candidate Filter', page: 'candidates-filter', badge: 'Standard' },
  { title: 'Department Report', page: 'dept-report', badge: 'Standard' },
];

export default function Header({ title = 'Dashboard', onNavigate }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResultsOpen, setSearchResultsOpen] = useState(false);
  const [notifications, setNotifications] = useState(
    (MOCK.notifications || []).map(n => ({ ...n }))
  );

  const headerRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Handle clicking outside to close all dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setProfileOpen(false);
        setNotifOpen(false);
        setSearchResultsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut (Ctrl+K or Cmd+K) to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('headerSearchInput');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setSearchResultsOpen(val.trim().length > 0);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResultsOpen(false);
  };

  const markAllRead = (e) => {
    e.stopPropagation();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotifClick = (notif) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notif.id ? { ...n, read: true } : n))
    );
    setNotifOpen(false);
    if (onNavigate) {
      if (notif.href === 'p2.html') onNavigate('p2');
      else if (notif.href === 'p4.html') onNavigate('p4');
      else if (notif.href === 'p3.html') onNavigate('p3');
      else onNavigate('p1');
    }
  };

  // Filter items for search
  const q = searchQuery.toLowerCase().trim();
  const matchedOpps = q
    ? (MOCK.submissions || []).filter(
        s => s.title.toLowerCase().includes(q) || s.company.toLowerCase().includes(q)
      )
    : [];

  const matchedRecruiters = q
    ? (MOCK.recruiters || []).filter(
        r => r.name.toLowerCase().includes(q) || r.company.toLowerCase().includes(q)
      )
    : [];

  const matchedPages = q
    ? PAGES.filter(p => p.title.toLowerCase().includes(q))
    : [];

  const totalResults = matchedOpps.length + matchedRecruiters.length + matchedPages.length;

  return (
    <header className="header" ref={headerRef}>
      <div className="header-title">{title}</div>

      <div className="header-actions">
        {/* Global Search Bar */}
        <div className="header-search">
          <svg
            className="header-search-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            id="headerSearchInput"
            className="header-search-input"
            type="text"
            placeholder="Search opportunities, recruiters, pages... (Ctrl+K)"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => {
              if (searchQuery.trim().length > 0) setSearchResultsOpen(true);
            }}
          />
          {searchQuery && (
            <button
              className="header-search-clear visible"
              onClick={clearSearch}
              type="button"
            >
              &times;
            </button>
          )}

          {/* Search Results Dropdown */}
          <div className={`search-results${searchResultsOpen ? ' visible' : ''}`}>
            {totalResults === 0 ? (
              <div className="search-no-results">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                No matching results found
              </div>
            ) : (
              <>
                {matchedOpps.length > 0 && (
                  <div>
                    <div className="search-group-header">Opportunities ({matchedOpps.length})</div>
                    {matchedOpps.map((opp, idx) => (
                      <div
                        key={`opp-${idx}`}
                        className="search-result-item"
                        onClick={() => {
                          clearSearch();
                          if (onNavigate) onNavigate('p2');
                        }}
                      >
                        <div className="search-result-avatar" style={{ background: opp.avatarBg || '#7c3aed' }}>
                          {opp.avatar || 'O'}
                        </div>
                        <div className="search-result-info">
                          <div className="search-result-title">{opp.title}</div>
                          <div className="search-result-sub">{opp.company} &bull; {opp.pkg}</div>
                        </div>
                        <span className="search-result-badge opportunity">Opportunity</span>
                      </div>
                    ))}
                  </div>
                )}

                {matchedRecruiters.length > 0 && (
                  <div>
                    <div className="search-group-header">Recruiters ({matchedRecruiters.length})</div>
                    {matchedRecruiters.map((rec, idx) => (
                      <div
                        key={`rec-${idx}`}
                        className="search-result-item"
                        onClick={() => {
                          clearSearch();
                          if (onNavigate) onNavigate('p4');
                        }}
                      >
                        <div className="search-result-avatar" style={{ background: '#3b82f6' }}>
                          {rec.name[0]}
                        </div>
                        <div className="search-result-info">
                          <div className="search-result-title">{rec.name}</div>
                          <div className="search-result-sub">{rec.role} &bull; {rec.company}</div>
                        </div>
                        <span className="search-result-badge recruiter">Recruiter</span>
                      </div>
                    ))}
                  </div>
                )}

                {matchedPages.length > 0 && (
                  <div>
                    <div className="search-group-header">Portal Pages ({matchedPages.length})</div>
                    {matchedPages.map((pg, idx) => (
                      <div
                        key={`page-${idx}`}
                        className="search-result-item"
                        onClick={() => {
                          clearSearch();
                          if (onNavigate) onNavigate(pg.page);
                        }}
                      >
                        <div className="search-result-avatar" style={{ background: '#10b981' }}>
                          📑
                        </div>
                        <div className="search-result-info">
                          <div className="search-result-title">{pg.title}</div>
                          <div className="search-result-sub">Quick Navigation</div>
                        </div>
                        <span className="search-result-badge page">{pg.badge}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Notifications Bell */}
        <div className="notif-wrapper">
          <div
            className="header-bell"
            onClick={() => {
              setNotifOpen(prev => !prev);
              setProfileOpen(false);
              setSearchResultsOpen(false);
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4a5565" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
          </div>

          {/* Notification Dropdown Panel */}
          <div className={`notif-panel${notifOpen ? ' open' : ''}`}>
            <div className="notif-header">
              <h3>Notifications {unreadCount > 0 && `(${unreadCount})`}</h3>
              {unreadCount > 0 && (
                <button className="notif-mark-all" onClick={markAllRead}>
                  Mark all as read
                </button>
              )}
            </div>
            <div className="notif-body">
              {notifications.length === 0 ? (
                <div className="notif-empty">No notifications</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`notif-item${n.read ? ' read' : ' unread'}`}
                    onClick={() => handleNotifClick(n)}
                  >
                    <div className={`notif-dot${n.read ? ' read' : ''}`} />
                    <div className="notif-content">
                      <div className="notif-title">{n.title}</div>
                      <div className="notif-message">{n.message}</div>
                      <div className="notif-time">{n.time}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* User Profile Avatar & Dropdown */}
        <div className="header-profile">
          <div
            className="profile-avatar-btn"
            onClick={() => {
              setProfileOpen(prev => !prev);
              setNotifOpen(false);
              setSearchResultsOpen(false);
            }}
          >
            RN
          </div>

          <div className={`profile-dropdown${profileOpen ? ' open' : ''}`}>
            <div className="profile-dd-header">
              <div className="profile-dd-avatar">RN</div>
              <div>
                <div className="profile-dd-name">Dr. Rajesh Nair</div>
                <div className="profile-dd-email">rajesh@college.edu</div>
              </div>
            </div>

            <div className="profile-dd-role">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              Senior Placement Officer
            </div>

            <div className="profile-dd-divider" />

            <div
              className="profile-dd-item"
              onClick={() => {
                setProfileOpen(false);
                if (onNavigate) onNavigate('profile');
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              My Profile
            </div>

            <div
              className="profile-dd-item"
              onClick={() => {
                setProfileOpen(false);
                if (onNavigate) onNavigate('p1');
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              Dashboard
            </div>

            <div className="profile-dd-divider" />

            <a className="profile-dd-item signout" href="../../login.html">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign Out
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

