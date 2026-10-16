import React from 'react';
import {
  Building2, Users, GraduationCap, UserCog, TrendingUp,
  AlertTriangle, ShieldCheck, ArrowRight, Activity,
  Award, MessageSquare
} from 'lucide-react';

function PlacementBar({ name, placed, students }) {
  const rate = students > 0 ? Math.round((placed / students) * 100) : 0;
  return (
    <div className="placement-bar-row">
      <div className="placement-bar-label">
        <span className="placement-bar-name">{name}</span>
        <span className="placement-bar-rate">{rate}%</span>
      </div>
      <div className="placement-bar-track">
        <div
          className="placement-bar-fill"
          style={{ width: `${rate}%`, background: rate >= 80 ? '#22c55e' : rate >= 60 ? '#f59e0b' : '#ef4444' }}
        />
      </div>
      <span className="placement-bar-meta">{placed}/{students} placed</span>
    </div>
  );
}

function AlertItem({ icon: Icon, color, title, sub, action, onAction }) {
  return (
    <div className="alert-item">
      <Icon size={18} color={color} style={{ flexShrink: 0 }} />
      <div className="alert-item-text">
        <strong>{title}</strong>
        <span>{sub}</span>
      </div>
      {action && (
        <button className="btn btn-ghost btn-sm" onClick={onAction}>
          {action} <ArrowRight size={12} />
        </button>
      )}
    </div>
  );
}

export default function SADashboard({ colleges, stats, data, userName, setActiveTab, setAdminCollegeId }) {
  const officersByCollege = data?.officersByCollege || {};

  // Prefer live-fetched officer data; fall back to college.stats if backend scopes the endpoint
  const officerCount = (c) =>
    officersByCollege[c.id] != null
      ? officersByCollege[c.id].length
      : (c.stats?.placementOfficers ?? 0);

  const totalStudents = stats?.totalStudents  || colleges.reduce((a, c) => a + (c.stats?.students || 0), 0);
  const totalAlumni   = stats?.totalAlumni    || colleges.reduce((a, c) => a + (c.stats?.alumni || 0), 0);
  // Use actual fetched officers if available
  const officersFetched = Object.values(officersByCollege).reduce((a, arr) => a + arr.length, 0);
  const totalOfficers = officersFetched || stats?.totalPlacementOfficers
                        || colleges.reduce((a, c) => a + (c.stats?.placementOfficers || 0), 0);
  const totalAdmins   = stats?.totalCollegeAdmins ?? colleges.filter(c => c.admin).length;
  const totalPlaced   = stats?.totalPlaced    || colleges.reduce((a, c) => a + (c.stats?.placed || 0), 0);
  const activeCount   = colleges.filter(c => c.status === 'active').length;
  const placementRate = totalStudents > 0 ? Math.round((totalPlaced / totalStudents) * 100) : 0;

  // Alerts — SA only manages colleges + college admins, not placement officers
  const unassignedColleges    = colleges.filter(c => !c.admin && c.status === 'active');
  const inactiveAdminColleges = colleges.filter(c => c.admin?.status === 'inactive');
  const hasAlerts = unassignedColleges.length > 0 || inactiveAdminColleges.length > 0;

  // Top performing colleges by placement rate
  const rankedColleges = [...colleges]
    .filter(c => (c.stats?.students ?? 0) > 0)
    .sort((a, b) => {
      const ra = (a.stats.placed / a.stats.students);
      const rb = (b.stats.placed / b.stats.students);
      return rb - ra;
    });

  const kpis = [
    { label: 'Total Colleges',     value: colleges.length, sub: `${activeCount} active`,              icon: Building2,   color: '#7c3aed', accent: true },
    { label: 'Total Students',     value: totalStudents.toLocaleString('en-IN'), sub: 'Enrolled',     icon: GraduationCap, color: '#0ea5e9' },
    { label: 'Alumni',             value: totalAlumni.toLocaleString('en-IN'),   sub: 'Graduates',   icon: Users,       color: '#22c55e' },
    { label: 'Placement Officers', value: totalOfficers,  sub: 'Across all colleges',                 icon: ShieldCheck, color: '#f59e0b' },
    { label: 'College Admins',     value: totalAdmins,    sub: `${unassignedColleges.length} missing`,icon: UserCog,     color: '#8b5cf6' },
    { label: 'Placement Rate',     value: `${placementRate}%`, sub: `${totalPlaced.toLocaleString('en-IN')} placed`, icon: TrendingUp, color: '#16a34a', accent: true },
  ];

  return (
    <>
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div>
          <h2>Welcome back, {userName?.split(' ')[0] || 'Admin'}</h2>
          <p>Platform overview · {new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
        </div>
        <div className="welcome-banner-meta">
          <span><Building2 size={14} /> {colleges.length} Colleges</span>
          <span><TrendingUp size={14} /> {placementRate}% placed</span>
        </div>
      </div>

      {/* Alerts Panel */}
      {hasAlerts && (
        <div className="alerts-panel">
          <div className="alerts-panel-header">
            <AlertTriangle size={16} color="#f59e0b" />
            <strong>Action Required</strong>
          </div>
          {unassignedColleges.map(c => (
            <AlertItem
              key={`ua-${c.id}`}
              icon={AlertTriangle}
              color="#f59e0b"
              title={`${c.name} has no college admin`}
              sub="Assign an admin to activate this college's portal"
              action="Assign"
              onAction={() => { setAdminCollegeId(c.id); setActiveTab('college-admins'); }}
            />
          ))}
          {inactiveAdminColleges.map(c => (
            <AlertItem
              key={`ia-${c.id}`}
              icon={UserCog}
              color="#8b5cf6"
              title={`${c.admin?.name}'s account is inactive`}
              sub={`College admin for ${c.name}`}
              action="Fix"
              onAction={() => { setAdminCollegeId(c.id); setActiveTab('college-admins'); }}
            />
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="stats-grid">
        {kpis.map(k => (
          <div className="stat-card" key={k.label} style={{ borderTop: `3px solid ${k.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-label">{k.label}</span>
              <k.icon size={16} color={k.color} style={{ opacity: 0.7 }} />
            </div>
            <span className={`stat-value ${k.accent ? 'accent' : ''}`}>{k.value}</span>
            {k.sub && <span className="stat-sub">{k.sub}</span>}
          </div>
        ))}
      </div>

      {/* Two-column layout: Placement ranking + Quick Actions */}
      <div className="dashboard-two-col">
        {/* College Placement Rankings */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title">
              <Award size={16} color="#f59e0b" />
              College Placement Rankings
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('colleges')}>
              View All <ArrowRight size={12} />
            </button>
          </div>
          <div className="placement-bars">
            {rankedColleges.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>No data yet</p>
            ) : rankedColleges.map(c => (
              <PlacementBar
                key={c.id}
                name={c.name}
                placed={c.stats?.placed ?? 0}
                students={c.stats?.students ?? 0}
              />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title">
              <Activity size={16} color="#7c3aed" />
              Quick Actions
            </div>
          </div>
          <div className="quick-actions-list">
            <button className="quick-action-row" onClick={() => setActiveTab('colleges')}>
              <div className="qa-icon" style={{ background: '#f5f3ff' }}>
                <Building2 size={18} color="#7c3aed" />
              </div>
              <div className="qa-text">
                <strong>Add New College</strong>
                <span>Register an institution on the platform</span>
              </div>
              <ArrowRight size={14} color="#94a3b8" />
            </button>

            <button className="quick-action-row" onClick={() => setActiveTab('college-admins')}>
              <div className="qa-icon" style={{ background: '#f0f9ff' }}>
                <UserCog size={18} color="#0ea5e9" />
              </div>
              <div className="qa-text">
                <strong>Manage College Admins</strong>
                <span>Assign, replace or deactivate admins</span>
              </div>
              <ArrowRight size={14} color="#94a3b8" />
            </button>

            <button className="quick-action-row" onClick={() => setActiveTab('activity')}>
              <div className="qa-icon" style={{ background: '#f0fdf4' }}>
                <Activity size={18} color="#22c55e" />
              </div>
              <div className="qa-text">
                <strong>Activity Log</strong>
                <span>See recent admin actions across the platform</span>
              </div>
              <ArrowRight size={14} color="#94a3b8" />
            </button>

            <button className="quick-action-row" onClick={() => setActiveTab('messages')}>
              <div className="qa-icon" style={{ background: '#fdf4ff' }}>
                <MessageSquare size={18} color="#a855f7" />
              </div>
              <div className="qa-text">
                <strong>Send Message</strong>
                <span>Contact one or all college admins</span>
              </div>
              <ArrowRight size={14} color="#94a3b8" />
            </button>
          </div>
        </div>
      </div>

      {/* Colleges Overview Table */}
      <div className="section-header" style={{ marginTop: 8 }}>
        <h2>Colleges Overview</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('colleges')}>
          <Building2 size={14} /> Manage Colleges
        </button>
      </div>
      <div className="table-wrap" style={{ marginBottom: 0 }}>
        <table>
          <thead>
            <tr>
              <th>College</th>
              <th>Code</th>
              <th>College Admin</th>
              <th>Students</th>
              <th>Officers</th>
              <th>Placed</th>
              <th>Rate</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {colleges.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                  No colleges found
                </td>
              </tr>
            ) : colleges.map(c => {
              const rate = c.stats?.students > 0
                ? Math.round((c.stats.placed / c.stats.students) * 100)
                : 0;
              return (
                <tr key={c.id}>
                  <td>
                    <div className="chip">
                      <div className="chip-avatar">{c.name.slice(0, 2).toUpperCase()}</div>
                      <div className="chip-info">
                        <div className="chip-name">{c.name}</div>
                        <div className="chip-sub">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><code>{c.code}</code></td>
                  <td>
                    {c.admin ? (
                      <div className="chip">
                        <div className="chip-avatar ca">{c.admin.name.slice(0, 2).toUpperCase()}</div>
                        <div className="chip-info">
                          <div className="chip-name">{c.admin.name}</div>
                          <span className={`badge ${c.admin.status === 'active' ? 'badge-green' : 'badge-yellow'}`} style={{ fontSize: 10 }}>
                            {c.admin.status}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: '#f59e0b', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <AlertTriangle size={13} /> Not assigned
                      </span>
                    )}
                  </td>
                  <td>{c.stats?.students ?? 0}</td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{officerCount(c)}</span>
                    {officersByCollege[c.id] != null && officersByCollege[c.id].length === 0 && (
                      <span style={{ color: '#ef4444', fontSize: 11, marginLeft: 4 }}>⚠ none</span>
                    )}
                  </td>
                  <td><strong style={{ color: '#16a34a' }}>{c.stats?.placed ?? 0}</strong></td>
                  <td>
                    <span className={`badge ${rate >= 80 ? 'badge-green' : rate >= 60 ? 'badge-yellow' : 'badge-red'}`}>
                      {rate}%
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${c.status === 'active' ? 'badge-green' : c.status === 'suspended' ? 'badge-red' : 'badge-gray'}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
