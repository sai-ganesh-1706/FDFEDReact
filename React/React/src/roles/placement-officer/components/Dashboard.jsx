import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './styles/p1.css';
import './styles/dashboard.css';
import { useOfficerData } from '../services/officerApi';
import { BadgeCheck, BriefcaseBusiness, Building2, CalendarClock, Clock3, Globe2, GraduationCap, Handshake, RefreshCw, UsersRound } from 'lucide-react';

export default function Dashboard({ onNavigate, activePage = 'p1' }) {
  const { data, refresh, ready, error } = useOfficerData();
  const { stats, stakeholders, drives, interviews, announcements = [] } = data;
  const submissions = (data.submissions || []).slice(0, 6);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const alertVisible = stats.pending > 0 && !alertDismissed;
  const setAlertVisible = (visible) => setAlertDismissed(!visible);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('view') === 'profile') {
      if (onNavigate) onNavigate('profile');
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [onNavigate]);

  // Interview schedules are created in the recruiter workspace. Refresh this
  // read-only dashboard while it is visible so new drive-wide schedules appear
  // without the officer having to reload the page.
  useEffect(() => {
    const timer = setInterval(() => { if (!document.hidden) refresh(); }, 20_000);
    return () => clearInterval(timer);
  }, [refresh]);

  const badgeMap = { published: 'green', approved: 'blue', pending: 'yellow', rejected: 'red' };
  const driveBadgeMap = { green: 'green', blue: 'blue', purple: 'purple' };

  const statItems = [
    { value: stats.pending, label: 'Opportunities Pending', tone: 'pending', Icon: Clock3 },
    { value: stats.published, label: 'Published', tone: 'published', Icon: BadgeCheck },
    { value: stats.totalOpps, label: 'Total opportunities', tone: 'opportunities', Icon: BriefcaseBusiness },
    { value: stats.totalApplicants, label: 'Total applicants', tone: 'applicants', Icon: UsersRound },
  ];

  const stakeItems = [
    { label: 'Registered Candidates', sub: 'Active student profiles', value: stakeholders.candidates, colorClass: 'blue-bg', Icon: GraduationCap, color: '#3B82F6' },
    { label: 'Recruiter Partners', sub: 'Registered companies', value: stakeholders.recruiters, colorClass: 'orange-bg', Icon: Building2, color: '#F97316' },
    { label: 'Active Placement Drives', sub: 'Currently running', value: stakeholders.activeDrives, colorClass: 'green-bg', Icon: BriefcaseBusiness, color: '#22C55E' },
    { label: 'Alumni\u00a0\u00a0Available', sub: 'Referring candidates', value: stakeholders.alumni, colorClass: 'pink-bg', Icon: Handshake, color: '#EC4899' },
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
                <div className={`stat-icon metric-icon metric-icon--${item.tone}`}>
                  <item.Icon size={22} aria-hidden="true" />
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
                <button
                  type="button"
                  className="panel-link"
                  onClick={() => refresh()}
                  aria-label="Refresh recent submissions"
                  title="Refresh recent submissions"
                  style={{ border: 0, background: 'transparent', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                >
                  <RefreshCw size={15} aria-hidden="true" />
                </button>
                <span className="panel-link" onClick={() => handleNav('p2')}>Review All →</span>
              </div>
              <div className="panel-body">
                {!ready && <div className="row-sub">Loading recent opportunities…</div>}
                {error && <div className="row-sub">{error}</div>}
                {ready && !error && submissions.length === 0 && <div className="row-sub">No recruiter submissions yet.</div>}
                {submissions.map((sub) => (
                  <div className="list-row" key={sub.id}>
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
                        <item.Icon size={20} color={item.color} aria-hidden="true" />
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

          {/* Announcements posted by the college admin */}
          <div className="panels-row">
            <div className="panel" style={{ gridColumn: '1 / -1' }}>
              <div className="panel-header">
                <h3>College Announcements</h3>
              </div>
              <div className="panel-body">
                {announcements.length === 0 && (
                  <div className="row-sub" style={{ padding: '8px 0' }}>No announcements from the college admin yet.</div>
                )}
                {announcements.map((a, idx) => (
                  <div className={`drive-row${idx < announcements.length - 1 ? ' bordered' : ''}`} key={a.id}>
                    <div>
                      <div className="drive-company">{a.title}</div>
                      <div className="row-sub">{a.message}</div>
                      <div className="row-sub" style={{ marginTop: 4, opacity: .8 }}>{a.date} · {a.author}</div>
                    </div>
                    <span className="badge purple" style={{ textTransform: 'capitalize', ...(a.type === 'urgent' ? { background: '#fee2e2', color: '#b91c1c' } : {}) }}>{a.type}</span>
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
                {drives.length === 0 && <div className="row-sub">No active placement drives.</div>}
                {drives.map((d, idx) => (
                  <div className={`drive-row${idx < drives.length - 1 ? ' bordered' : ''}`} key={`${d.company}-${d.role}`}>
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
                {interviews.length === 0 && <div className="row-sub">No upcoming interviews.</div>}
                {interviews.map((iv, idx) => (
                  <div className={`interview-row${idx < interviews.length - 1 ? ' bordered' : ''}`} key={iv.id ?? `${iv.company}-${iv.time}-${idx}`}>
                    <CalendarClock size={20} color="#7C3AED" aria-hidden="true" />
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
