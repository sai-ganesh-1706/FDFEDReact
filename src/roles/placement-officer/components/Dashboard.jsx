import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './styles/p1.css';
import './styles/dashboard.css';
import { MOCK } from '../data/mockdata';

export default function Dashboard({ onNavigate, activePage = 'p1' }) {
  const [stats, setStats] = useState(MOCK.stats);
  const [stakeholders] = useState(MOCK.stakeholders);
  const [submissions] = useState(MOCK.submissions);
  const [drives] = useState(MOCK.drives);
  const [interviews] = useState(MOCK.interviews);
  const [alertVisible, setAlertVisible] = useState(stats.pending > 0);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('view') === 'profile') {
      if (onNavigate) onNavigate('profile');
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [onNavigate]);

  const badgeMap = { published: 'green', approved: 'blue', pending: 'yellow', rejected: 'red' };
  const driveBadgeMap = { green: 'green', blue: 'blue', purple: 'purple' };

  const statItems = [
    { value: stats.pending, label: 'Opportunities Pending', colorClass: 'yellow', icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>, stroke: '#EAB308' },
    { value: stats.published, label: 'Published', colorClass: 'green', icon: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>, stroke: '#22C55E' },
    { value: stats.totalOpps, label: 'Total opportunities', colorClass: 'blue', icon: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>, stroke: '#3B82F6' },
    { value: stats.totalApplicants, label: 'Total applicants', colorClass: 'purple', icon: <><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /></>, stroke: '#A855F7' },
  ];

  const stakeItems = [
    { label: 'Registered Candidates', sub: 'Active student profiles', value: stakeholders.candidates, colorClass: 'blue-bg', stroke: '#3B82F6', icon: <><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 10 3 12 0v-5" /></> },
    { label: 'Recruiter Partners', sub: 'Registered companies', value: stakeholders.recruiters, colorClass: 'orange-bg', stroke: '#F97316', icon: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></> },
    { label: 'Active Placement Drives', sub: 'Currently running', value: stakeholders.activeDrives, colorClass: 'green-bg', stroke: '#22C55E', icon: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></> },
    { label: 'Alumni\u00a0\u00a0Available', sub: 'Referring candidates', value: stakeholders.alumni, colorClass: 'pink-bg', stroke: '#EC4899', icon: <><path d="M17 21v-2a4 4 0 0 0-3-3.87" /><path d="M9 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></> },
  ];

  const handleNav = (target) => {
    if (onNavigate) onNavigate(target);
    else window.location.href = `${target}.html`;
  };

  return (
    <div className="frame dashboard-page">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      <Header title="Placement Control Center" onNavigate={onNavigate} />

      <main className="main-content" id="mainContent">
          {/* Hero Card */}
          <div className="hero-card">
            <h1>Placement Control Center</h1>
            <p className="hero-sub">Senior Placement Officer Dashboard</p>
            <p className="hero-desc">Manage placement drives, review recruiter submissions, and monitor student participation.</p>
            <button type="button" className="hero-btn" onClick={() => handleNav('p2')}>Review Opportunities</button>
            <button type="button" className="hero-btn hero-btn-outline" onClick={() => handleNav('p3')}>View Activity</button>
          </div>

          {/* Alert Bar */}
          {alertVisible && (
            <div className="alert-bar" id="alertBar">
              <div className="alert-left">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9f2d00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <p>{stats.pending} opportunity awaiting review. Review and approve or reject pending opportunities to keep the process moving.</p>
              </div>
              <button className="alert-btn" onClick={() => handleNav('p2')}>Review</button>
            </div>
          )}

          {/* Stats Row */}
          <div className="stats-row" id="statsRow">
            {statItems.map((item, idx) => (
              <div className="stat-card" key={idx}>
                <div className={`stat-icon ${item.colorClass}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={item.stroke} strokeWidth="2">{item.icon}</svg>
                </div>
                <div>
                  <strong>{item.value}</strong>
                  <div className="stat-label">{item.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Submissions & Stakeholder Overview */}
          <div className="panels-row">
            <div className="panel">
              <div className="panel-header">
                <h3>Recent Submissions</h3>
                <span className="panel-link" onClick={() => handleNav('p2')}>Review All →</span>
              </div>
              <div className="panel-body">
                {submissions.map((sub, idx) => (
                  <div className="list-row" key={idx}>
                    <div>
                      <div className="row-title">{sub.title}</div>
                      <div className="row-sub">{sub.company}</div>
                    </div>
                    <span className={`badge ${badgeMap[sub.status] || 'gray'}`}>
                      {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <h3>Stakeholder Overview</h3>
              </div>
              <div className="panel-body">
                {stakeItems.map((item, idx) => (
                  <div className="stake-row" key={idx}>
                    <div className="stake-left">
                      <div className={`stake-icon ${item.colorClass}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={item.stroke} strokeWidth="2">{item.icon}</svg>
                      </div>
                      <div>
                        <div className="row-title">{item.label}</div>
                        <div className="row-sub">{item.sub}</div>
                      </div>
                    </div>
                    <strong className="stake-num">{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Placement Drives & Upcoming Interviews */}
          <div className="panels-row">
            <div className="panel">
              <div className="panel-header">
                <h3>Active Placement Drives</h3>
              </div>
              <div className="panel-body">
                {drives.map((d, idx) => (
                  <div className={`drive-row${idx < drives.length - 1 ? ' bordered' : ''}`} key={idx}>
                    <div>
                      <div className="drive-company">{d.company}</div>
                      <div className="row-sub">{d.role}</div>
                    </div>
                    <span className={`badge ${driveBadgeMap[d.badgeClass] || d.badgeClass}`}>{d.badge}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <h3>Upcoming Interviews</h3>
              </div>
              <div className="panel-body">
                {interviews.map((iv, idx) => (
                  <div className={`interview-row${idx < interviews.length - 1 ? ' bordered' : ''}`} key={idx}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <div>
                      <div className="interview-company">{iv.company}</div>
                      <div className="row-sub">{iv.round}</div>
                      <div className="interview-time">{iv.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
    </div>
  );
}
